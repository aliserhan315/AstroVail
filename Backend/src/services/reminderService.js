import Event from "../models/Event.js";
import EventReminder from "../models/EventReminder.js";

export async function createEventReminder(userId, eventId) {
  const event = await Event.findById(eventId);
  if (!event) throw Object.assign(new Error("Event not found"), { status: 404 });

  const start = new Date(event.start);
  const remindAt = new Date(start.getTime() - 60 * 60 * 1000);
  if (isNaN(remindAt.getTime())) throw new Error("Invalid event start");
  if (remindAt.getTime() < Date.now()) {
    remindAt.setTime(Date.now());
  }

  const doc = await EventReminder.findOneAndUpdate(
    { user: userId, event: eventId },
    { $set: { remindAt, active: true, sent: false } },
    { upsert: true, new: true }
  );

  return doc;
}

export async function cancelEventReminder(userId, eventId) {
  const res = await EventReminder.findOneAndUpdate(
    { user: userId, event: eventId },
    { $set: { active: false } },
    { new: true }
  );
  if (!res) throw Object.assign(new Error("Reminder not found"), { status: 404 });
  return res;
}
