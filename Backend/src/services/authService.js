import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { DateTime } from "luxon";
import User from "../models/User.js";
import Star from "../models/Star.js";
import Session from "../models/Session.js";

const ACCESS_TTL = "15m";
const REFRESH_DAYS = 30;

const signAccess = (user) =>
  jwt.sign({ sub: user._id.toString(), email: user.email }, process.env.JWT_SECRET, { expiresIn: ACCESS_TTL });

const makeRefreshParts = () => ({
  sid: crypto.randomBytes(12).toString("hex"),
  secret: crypto.randomBytes(32).toString("base64url"),
});

async function persistSession(userId, sid, secret, ua, ip) {
  const refreshHash = await bcrypt.hash(secret, 12);
  const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 3600 * 1000);
  await Session.create({ userId, sid, refreshHash, userAgent: ua, ip, expiresAt });
  return `${sid}.${secret}`;
}

const isValidIanaTz = (tz) => typeof tz === "string" && DateTime.now().setZone(tz).isValid;
function sanitizeLocation(loc) {
  if (!loc || typeof loc !== "object") return;
  const lat = Number(loc.lat), lon = Number(loc.lon);
  if (!isFinite(lat) || !isFinite(lon)) return;
  return {
    lat: Math.round(lat * 10) / 10, 
    lon: Math.round(lon * 10) / 10,
    accuracy: loc.accuracy ? Number(loc.accuracy) : undefined,
    updatedAt: new Date(),
  };
}
async function applyDeviceContext(user, { tz, location } = {}) {
  let changed = false;
  if (isValidIanaTz(tz) && user.tz !== tz) { user.tz = tz; changed = true; }
  const sl = sanitizeLocation(location);
  if (sl) { user.location = sl; changed = true; }
  if (changed) await user.save();
}

async function claimPendingStars(user) {
  if (!user?.email) return;
  await Star.updateMany(
    { pendingOwnerEmail: user.email },
    { $set: { owner: user._id }, $unset: { pendingOwnerEmail: "" } }
  );
}

function toSafeUser(doc) {
  const u = typeof doc.toObject === "function" ? doc.toObject() : doc;
  const { _id, email, firstName, lastName, displayName, avatarUrl, tz, location, createdAt, updatedAt } = u;
  return { _id, email, firstName, lastName, displayName, avatarUrl, tz, location, createdAt, updatedAt };
}

export const AuthService = {
  async register({ email, password, displayName, firstName, lastName, name }, ctx = {}) {
    const emailLc = email.trim().toLowerCase();
    const existing = await User.findOne({ email: emailLc });
    if (existing) throw new Error("Email already in use");

    const passwordHash = await bcrypt.hash(password, 12);
    const f = typeof firstName === "string" && firstName.trim() ? firstName.trim() : undefined;
    const l = typeof lastName === "string" && lastName.trim() ? lastName.trim() : undefined;
    let dn = typeof displayName === "string" && displayName.trim() ? displayName.trim() : undefined;
    const nm = typeof name === "string" && name.trim() ? name.trim() : undefined;
    if (!dn && (f || l)) dn = `${f ?? ""} ${l ?? ""}`.trim();
    if (!dn && nm) dn = nm;

    const user = await User.create({ email: emailLc, passwordHash, firstName: f, lastName: l, displayName: dn });
    await applyDeviceContext(user, ctx);
    await claimPendingStars(user);

    const accessToken = signAccess(user);
    const { sid, secret } = makeRefreshParts();
    const refreshToken = await persistSession(user._id, sid, secret, ctx.ua, ctx.ip);

    return { user: toSafeUser(user), accessToken, refreshToken };
  },

  async login({ email, password }, ctx = {}) {
    const emailLc = email.trim().toLowerCase();
    const user = await User.findOne({ email: emailLc }).select("+passwordHash");
    if (!user || !user.passwordHash) throw new Error("Invalid credentials");

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new Error("Invalid credentials");

    await applyDeviceContext(user, ctx);
    await claimPendingStars(user);

    const accessToken = signAccess(user);
    const { sid, secret } = makeRefreshParts();
    const refreshToken = await persistSession(user._id, sid, secret, ctx.ua, ctx.ip);

    return { user: toSafeUser(user), accessToken, refreshToken };
  },

  async refresh({ refreshToken }) {
    const [sid, secret] = String(refreshToken || "").split(".");
    if (!sid || !secret) throw new Error("Invalid refresh token");
    const sess = await Session.findOne({ sid });
    if (!sess || sess.expiresAt < new Date()) throw new Error("Invalid refresh token");
    const ok = await bcrypt.compare(secret, sess.refreshHash);
    if (!ok) throw new Error("Invalid refresh token");

    const user = await User.findById(sess.userId);
    const accessToken = signAccess(user);

    await Session.deleteOne({ _id: sess._id });
    const { sid: newSid, secret: newSecret } = makeRefreshParts();
    const newRefresh = await persistSession(user._id, newSid, newSecret);

    return { accessToken, refreshToken: newRefresh, user: toSafeUser(user) };
  },

  async logout({ refreshToken }) {
    const [sid] = String(refreshToken || "").split(".");
    if (sid) await Session.deleteOne({ sid });
  },
};
