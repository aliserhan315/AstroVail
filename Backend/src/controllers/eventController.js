import { EventService } from "../services/eventService.js";
import { ReminderService } from "../services/reminderService.js";
import { success, error } from "../utils/response.js";

export async function listEvents(req, res) {
  try {
    const { from, to, q, limit } = req.query;
    const items = await EventService.list({ from, to, q, limit: Number(limit) || 100 });
    return success(res, items);
  } catch (e) {
    console.error("listEvents:", e);
    return error(res);
  }
}

export async function getEvent(req, res) {
  try {
    const doc = await EventService.get(req.params.id);
    return success(res, doc);
  } catch (e) {
    if (e.message === "Event not found") return error(res, e.message, 404);
    console.error("getEvent:", e);
    return error(res);
  }
}

export async function remindEvent(req, res) {
  try {
    const userId = req.user.sub;
    const out = await ReminderService.ensureReminder(userId, req.params.id);
    return success(res, out, "Reminder set");
  } catch (e) {
    if (e.status) return error(res, e.message, e.status);
    console.error("remindEvent:", e);
    return error(res);
  }
}
