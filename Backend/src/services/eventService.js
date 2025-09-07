import Event from "../models/Event.js";

export const EventService = {

  async list({ from, to, q, limit = 100, includeNEO = false } = {}) {
    const now = new Date();
    const fromDate = from ? new Date(from) : now;
    const timeOr = [
      { startTime: { $gte: fromDate } },
      { endTime:   { $gte: fromDate } },
    ];

    const base = includeNEO ? {} : { source: { $ne: "nasa:neows" } };

    let query = { ...base, $or: timeOr };

    if (to) {
      const toDate = new Date(to);
      query = {
        ...base,
        $and: [
          { $or: timeOr },
          { $or: [{ startTime: { $lte: toDate } }, { endTime: { $lte: toDate } }] },
        ],
      };
    }

    if (q) query.$text = { $search: q };

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
      if (res.upsertedCount) created++;
      else if (res.modifiedCount) updated++;
    }
    return { created, updated };
  },
};
