import Event from "../events/events.model.js";
import EventReminder from "../events/eventReminder.model.js";
import { createEventNotificationOncePerDay } from "./notification.service.js";

const DEFAULT_OFFSET_MIN = Number(process.env.NOTIFY_OFFSET_MINUTES ?? 60);

function toDate(v) { return v instanceof Date ? v : new Date(v); }

async function upsertReminder({ userId, eventId, kind, offsetMin, startTime }) {
  const remindAt = new Date(toDate(startTime).getTime() - offsetMin * 60_000);

  const doc = await EventReminder.findOneAndUpdate(
    { user: userId, event: eventId, kind },
    { $set: { remindAt, offsetMin, active: true }, $setOnInsert: { sentAt: null } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();

  return { kind, remindAt, reminder: doc };
}

export const ReminderService = {

  async ensureDefaultReminders(userId, eventId) {
    const event = await Event.findById(eventId).lean();
    if (!event) { const e = new Error("Event not found"); e.status = 404; throw e; }
    if (!event.startTime) { const e = new Error("Event has no start time"); e.status = 400; throw e; }

    const startTime = event.startTime;
    const [r24, r1] = await Promise.all([
      upsertReminder({ userId, eventId: event._id, kind: "24h", offsetMin: 1440, startTime }),
      upsertReminder({ userId, eventId: event._id, kind: "1h",  offsetMin: 60,   startTime }),
    ]);

    return { ok: true, reminders: [r24, r1] };
  },

  async ensureReminder(userId, eventId, opts = {}) {
    const event = await Event.findById(eventId).lean();
    if (!event) { const e = new Error("Event not found"); e.status = 404; throw e; }
    if (!event.startTime) { const e = new Error("Event has no start time"); e.status = 400; throw e; }

    const offsetMinutes = Number.isFinite(opts.offsetMinutes)
      ? Number(opts.offsetMinutes)
      : Number.isFinite(opts.leadHours)
        ? Number(opts.leadHours) * 60
        : DEFAULT_OFFSET_MIN;

    const r = await upsertReminder({
      userId,
      eventId: event._id,
      kind: "custom",
      offsetMin: offsetMinutes,
      startTime: event.startTime,
    });

    return { ok: true, ...r };
  },
  async sendDue(now = new Date()) {
    const due = await EventReminder.find({
      active: true,
      sentAt: null,
      remindAt: { $lte: now },
    })
      .populate("event", "title startTime")
      .lean();

    if (!due.length) return { processed: 0, created: 0, marked: 0 };

    let processed = 0, created = 0, marked = 0;

    for (const r of due) {
      processed++;
      const titleRaw = r.event?.title || "Upcoming celestial event";
      const startsAt  = r.event?.startTime ? new Date(r.event.startTime) : null;
      const minsLeft  = startsAt ? Math.max(0, Math.round((startsAt.getTime() - now.getTime()) / 60000)) : null;

      const title = `Reminder: ${titleRaw}`;
      const body  = startsAt
        ? `Starts at ${startsAt.toUTCString()} (in ~${minsLeft} min).`
        : "Starts soon.";

      try {
        const res = await createEventNotificationOncePerDay({
          userId: r.user,
          eventDoc: { _id: r.event?._id || r.event },
          title,
          body,
          when: now,
        });
        created += res.created;
      } finally {
        const upd = await EventReminder.updateOne({ _id: r._id, sentAt: null }, { $set: { sentAt: now } });
        if (upd.modifiedCount) marked++;
      }
    }

    return { processed, created, marked };
  },
};
