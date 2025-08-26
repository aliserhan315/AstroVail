import Event from "../models/Event.js";

export const EventService = {
  async list({ from, to, q, limit = 100 }) {
    const query = {};
    if (from || to) {
      query.startTime = {};
      if (from) query.startTime.$gte = new Date(from);
      if (to)   query.startTime.$lte = new Date(to);
    }
    if (q) {
      query.$text = { $search: q };
    }
    return Event.find(query).sort({ startTime: 1 }).limit(limit);
  },

  async get(id) {
    const doc = await Event.findById(id);
    if (!doc) throw new Error("Event not found");
    return doc;
  },

  async upsertEvents(inputEvents) {
    let created = 0, updated = 0;
    for (const e of inputEvents) {
      const res = await Event.updateOne(
        { source: e.source, externalId: e.externalId },
        { $set: e },
        { upsert: true }
      );
      if (res.upsertedCount) created++; else if (res.modifiedCount) updated++;
    }
    return { created, updated };
  },
};
