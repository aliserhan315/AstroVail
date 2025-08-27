import User from "../models/User.js";
import { DateTime } from "luxon";

const isValidIanaTz = (tz) => typeof tz === "string" && DateTime.now().setZone(tz).isValid;

export const UserService = {
  async me(id) { return User.findById(id).lean(); },

  async updateProfile(id, { displayName, avatarUrl }) {
    const patch = {};
    if (typeof displayName === "string") patch.displayName = displayName.trim().slice(0, 80);
    if (typeof avatarUrl === "string")   patch.avatarUrl   = avatarUrl.trim();
    return User.findByIdAndUpdate(id, { $set: patch }, { new: true }).lean();
  },

  async updateDevice(id, { tz, location }) {
    const patch = {};
    if (isValidIanaTz(tz)) patch.tz = tz;
    if (location && typeof location === "object") {
      const lat = Number(location.lat), lon = Number(location.lon);
      if (isFinite(lat) && isFinite(lon)) {
        patch.location = {
          lat: Math.round(lat * 10) / 10,
          lon: Math.round(lon * 10) / 10,
          accuracy: location.accuracy ? Number(location.accuracy) : undefined,
          updatedAt: new Date(),
        };
      }
    }
    return User.findByIdAndUpdate(id, { $set: patch }, { new: true }).lean();
  },
};
