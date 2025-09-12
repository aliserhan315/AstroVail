import { EventService } from "./event.service.js";
import { ReminderService } from "../notification/reminder.service.js";
import { success, error } from "../../utils/response.js";

export async function listEvents(req, res) {
  try {
    const { from, to, q, limit, includeNEO } = req.query;
    const items = await EventService.list({
      from,
      to,
      q,
      limit: Number(limit) || 100,
      includeNEO: includeNEO === "1" || includeNEO === "true",
    });
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
    const leadHours = req.query.leadHours ?? req.body?.leadHours;
    const offsetMinutes = req.query.offsetMinutes ?? req.body?.offsetMinutes;

    if (leadHours !== undefined || offsetMinutes !== undefined) {
      const out = await ReminderService.ensureReminder(userId, req.params.id, {
        leadHours: leadHours !== undefined ? Number(leadHours) : undefined,
        offsetMinutes: offsetMinutes !== undefined ? Number(offsetMinutes) : undefined,
      });
      return success(res, out, "Custom reminder set");
    }

    const out = await ReminderService.ensureDefaultReminders(userId, req.params.id);
    return success(res, out, "Reminders set (24h & 1h)");
  } catch (e) {
    if (e.status) return error(res, e.message, e.status);
    console.error("remindEvent:", e);
    return error(res);
  }
}
