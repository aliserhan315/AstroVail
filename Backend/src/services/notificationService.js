import Notification from "../models/Notification.js";
import { ymdUTC } from "../utils/dates.js";

export async function createEventNotificationOncePerDay({ userId, eventDoc, title, body, when = new Date() }) {
  const day = ymdUTC(when);
  try {
    await Notification.create({
      user:  userId,
      type:  "event",
      event: eventDoc._id,
      star:  null,
      title, body, day
    });
    return { created: 1 };
  } catch {
    return { created: 0 };
  }
}

export const NotificationService = {
  async list(userId, { type }) {
    const q = { user: userId };
    if (type === "event" || type === "star") q.type = type;
    return Notification
      .find(q)
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("event", "title startTime")
      .populate("star",  "displayName baseName");
  },

  async markRead(userId, id) {
    await Notification.updateOne({ _id: id, user: userId }, { $set: { readAt: new Date() } });
    return { ok: true };
  }
};
