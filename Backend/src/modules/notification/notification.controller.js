import { NotificationService } from "./notification.service.js";
import { success, error } from "../../utils/response.js";

export async function listNotifications(req, res) {
  try {
    const items = await NotificationService.list(req.user.sub, { type: req.query.type });
    return success(res, items);
  } catch (e) {
    console.error("listNotifications:", e);
    return error(res);
  }
}

export async function markNotificationRead(req, res) {
  try {
    const out = await NotificationService.markRead(req.user.sub, req.params.id);
    return success(res, out);
  } catch (e) {
    console.error("markNotificationRead:", e);
    return error(res);
  }
}
