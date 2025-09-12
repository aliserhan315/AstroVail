import mongoose from "mongoose";
import Star from "./star.model.js";
import User from "../user/user.model.js";

const ALLOWED_STYLES = ["classic", "modern", "cosmic"];

function toInt(v, def) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

function toBool(v) {
  if (v === undefined || v === null) return undefined;
  const s = String(v).trim().toLowerCase();
  return s === "1" || s === "true" || s === "yes";
}

export const StarService = {
  async list(
    q,
    {
      page = 1,
      limit = 25,
      constellation,
      magnitudeMax,
      nakedEye,
      binocular,
      sort,
    } = {}
  ) {
    const baseFilter = { owner: null, pendingOwnerEmail: null };
    if (constellation) baseFilter.constellation = constellation;
    if (magnitudeMax !== undefined) baseFilter.magnitude = { $lte: Number(magnitudeMax) };
    if (toBool(nakedEye) !== undefined) baseFilter.nakedEye = !!toBool(nakedEye);
    if (toBool(binocular) !== undefined) baseFilter.binocular = !!toBool(binocular);
    if (!q || !q.trim()) {
      const size = Math.min(100, toInt(limit, 25));
      const randomFilter = { ...baseFilter };

      const [items, total] = await Promise.all([
        Star.aggregate([{ $match: randomFilter }, { $sample: { size } }]),
        Star.countDocuments(randomFilter),
      ]);

      return {
        items,
        page: 1,
        limit: size,
        total,
        totalPages: Math.max(1, Math.ceil(total / size)),
      };
    }

    const lim = Math.min(100, toInt(limit, 25)); 
    const pg = Math.max(1, toInt(page, 1));
    const skip = (pg - 1) * lim;

    const term = q.trim();
    const query = Star.find(baseFilter);
    let countFilter = { ...baseFilter };

    if (term.length >= 2) {
      query
        .where({ $text: { $search: term } })
        .select({ score: { $meta: "textScore" } })
        .sort({ score: { $meta: "textScore" }, magnitude: 1, updatedAt: -1 });
      countFilter = { ...countFilter, $text: { $search: term } };
    } else {
      const or = [
        { displayName: { $regex: term, $options: "i" } },
        { baseName: { $regex: term, $options: "i" } },
        { constellation: { $regex: term, $options: "i" } },
      ];
      query.where({ $or: or }).sort({ magnitude: 1, updatedAt: -1 });
      countFilter = { ...countFilter, $or: or };
    }

    if (sort === "recent") {
      query.sort({ updatedAt: -1, magnitude: 1 });
    }

    const [items, total] = await Promise.all([
      query.skip(skip).limit(lim).lean(),
      Star.countDocuments(countFilter),
    ]);

    return { items, page: pg, limit: lim, total, totalPages: Math.max(1, Math.ceil(total / lim)) };
  },

  async getById(id) {
    if (!mongoose.isValidObjectId(id)) {
      const err = new Error("Star not found");
      err.status = 404;
      throw err;
    }
    const doc = await Star.findById(id).lean();
    if (!doc) {
      const err = new Error("Star not found");
      err.status = 404;
      throw err;
    }
    return doc;
  },

  async getByCatalog(catalogId) {
    const doc = await Star.findOne({ catalogId }).lean();
    if (!doc) {
      const err = new Error("Star not found");
      err.status = 404;
      throw err;
    }
    return doc;
  },

  async listOwned(userId, { q, page = 1, limit = 20 } = {}) {
    const filter = { owner: userId };
    const lim = Math.min(100, toInt(limit, 20));
    const pg = Math.max(1, toInt(page, 1));
    const skip = (pg - 1) * lim;

    const query = Star.find(filter);
    let countFilter = { ...filter };

    if (q && q.trim()) {
      const term = q.trim();
      query
        .where({ $text: { $search: term } })
        .select({ score: { $meta: "textScore" } })
        .sort({ score: { $meta: "textScore" }, updatedAt: -1 });
      countFilter = { ...countFilter, $text: { $search: term } };
    } else {
      query.sort({ updatedAt: -1 });
    }

    const [items, total] = await Promise.all([
      query.skip(skip).limit(lim).lean(),
      Star.countDocuments(countFilter),
    ]);

    return { items, page: pg, limit: lim, total, totalPages: Math.max(1, Math.ceil(total / lim)) };
  },

  async create(ownerId, payload) {
    const {
      baseName,
      displayName,
      ra,
      dec,
      magnitude,
      constellation,
      certificateStyle = "classic",
      catalogId,
      nakedEye,
      binocular,
      isGifted,
      recipientEmail,
    } = payload;

    if (!baseName && !displayName) {
      const err = new Error("baseName or displayName required");
      err.status = 400;
      throw err;
    }

    if (certificateStyle && !ALLOWED_STYLES.includes(certificateStyle)) {
      const err = new Error("Invalid certificate style");
      err.status = 400;
      throw err;
    }

    let owner = ownerId || null;
    let pendingOwnerEmail;
    const giftEmail = typeof recipientEmail === "string" ? recipientEmail.trim().toLowerCase() : null;

    if (giftEmail) {
      const existing = await User.findOne({ email: giftEmail }).lean();
      if (existing) {
        owner = existing._id;
      } else {
        owner = null;
        pendingOwnerEmail = giftEmail;
      }
    }

    const star = await Star.create({
      owner,
      baseName,
      displayName,
      ra,
      dec,
      magnitude,
      constellation,
      certificateStyle,
      catalogId,
      nakedEye: !!toBool(nakedEye),
      binocular: !!toBool(binocular),
      isGifted: !!toBool(isGifted) || !!giftEmail,
      pendingOwnerEmail,
    });
    return star.toObject();
  },

  async update(userId, id, payload) {
    const star = await Star.findById(id);
    if (!star) {
      const err = new Error("Star not found");
      err.status = 404;
      throw err;
    }
    if (!star.owner || String(star.owner) !== String(userId)) {
      const err = new Error("Forbidden");
      err.status = 403;
      throw err;
    }

    const set = {};
    if (typeof payload.displayName === "string") {
      set.displayName = payload.displayName.trim().slice(0, 120);
    }
    if (payload.certificateStyle && ALLOWED_STYLES.includes(payload.certificateStyle)) {
      set.certificateStyle = payload.certificateStyle;
    }

    const updated = await Star.findByIdAndUpdate(id, { $set: set }, { new: true }).lean();
    return updated;
  },

  async remove(userId, id) {
    const star = await Star.findOneAndDelete({ _id: id, owner: userId }).lean();
    if (!star) {
      const err = new Error("Star not found/owned");
      err.status = 404;
      throw err;
    }
    return { ok: true };
  },
};
