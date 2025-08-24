import Event from "../models/Event.js";
import crypto from "node:crypto";

function hashEventShape(e) {
  const payload = JSON.stringify({
    title: e.title,
    type: e.type,
    start: e.start,
    end: e.end,
    peak: e.peak,
    summary: e.summary,
    tags: e.tags,
    visibility: e.visibility,
    source: e.source,
    sourceId: e.sourceId,
  });
  return crypto.createHash("sha1").update(payload).digest("hex");
}

export async function upsertEvents(events = []) {
  if (!events.length) return { created: 0, updated: 0 };
  const ops = [];
  for (const e of events) {
    const contentHash = e.contentHash || hashEventShape(e);
    ops.push({
      updateOne: {
        filter: { slug: e.slug },
        update: {
          $set: {
            ...e,
            contentHash,
          },
        },
        upsert: true,
      },
    });
  }
  const res = await Event.bulkWrite(ops, { ordered: false });
  return {
    created: res.upsertedCount ?? 0,
    updated: res.modifiedCount ?? 0,
  };
}
