import Star from "../models/Star.js";

export const StarService = {
  async list(q) {
    if (!q) return Star.find().limit(50).sort({ createdAt: -1 });
    return Star.find({ $text: { $search: q } }).limit(50);
  },

  async getById(id) {
    const star = await Star.findById(id);
    if (!star) throw new Error("Star not found");
    return star;
  },

  async create(ownerId, payload) {
    const {
      baseName, displayName, ra, dec, magnitude, constellation,
      certificateStyle = "classic", catalogId,
    } = payload;

    if (!baseName && !displayName) {
      const err = new Error("baseName or displayName required");
      err.status = 400;
      throw err;
    }

    const star = await Star.create({
      owner: ownerId,
      baseName,
      displayName,
      ra,
      dec,
      magnitude,
      constellation,
      certificateStyle,
      catalogId,
    });
    return star;
  },

  async update(ownerId, id, payload) {
    const star = await Star.findOne({ _id: id, owner: ownerId });
    if (!star) {
      const err = new Error("Star not found/owned");
      err.status = 404;
      throw err;
    }

    const { displayName, certificateStyle } = payload;
    if (displayName !== undefined) star.displayName = displayName;
    if (certificateStyle) star.certificateStyle = certificateStyle;

    await star.save();
    return star;
  },

  async remove(ownerId, id) {
    const star = await Star.findOneAndDelete({ _id: id, owner: ownerId });
    if (!star) {
      const err = new Error("Star not found/owned");
      err.status = 404;
      throw err;
    }
    return { ok: true };
  },
};
