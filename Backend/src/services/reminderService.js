import Event from "../models/Event.js";
import EventReminder from "../models/EventReminder.js";
import { createEventNotificationOncePerDay } from "./notificationService.js";

const OFFSET_MIN = Number(process.env.NOTIFY_OFFSET_MINUTES ?? 60);

export const ReminderService = {
  async ensureReminder(userId, eventId) {
    const event = await Event.findById(eventId);
    if (!event) throw Object.assign(new Error("Event not found"), { status: 404 });

    const remindAt = new Date(event.startTime.getTime() - OFFSET_MIN*60*1000);
    const doc = await EventReminder.findOneAndUpdate(
      { user: userId, event: event._id },
      { $set: { remindAt } },
      { upsert: true, new: true }
    );
    return { reminder: doc, remindAt };
  },
  async sendDue(now = new Date()) {
    const windowStart = new Date(now.getTime() - 15*60*1000);
    const q = { sentAt: null, remindAt: { $lte: now, $gte: windowStart } };
    const due = await EventReminder.find(q).populate("event");
    let processed = 0, created = 0, marked = 0;

    for (const r of due) {
      processed++;
      const e = r.event;
      const mins = Math.max(0, Math.round((e.startTime - now)/60000));
      const title = `Reminder: ${e.title}`;
      const body  = `Starts at ${e.startTime.toUTCString()} (in ~${mins} min).`;

      const res = await createEventNotificationOncePerDay({
        userId: r.user, eventDoc: e, title, body, when: now
      });
      created += res.created;

      const u = await EventReminder.updateOne({ _id: r._id, sentAt: null }, { $set: { sentAt: now } });
      if (u.modifiedCount) marked++;
    }
    return { processed, created, marked };
  },
};
