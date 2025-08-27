import { UserService } from "../services/userService.js";
import { success, error } from "../utils/response.js";

export async function getMe(req, res) {
  try { return success(res, await UserService.me(req.user.sub)); }
  catch (e) { console.error(e); return error(res); }
}
export async function updateMyProfile(req, res) {
  try { return success(res, await UserService.updateProfile(req.user.sub, req.body), "Profile updated"); }
  catch (e) { console.error(e); return error(res); }
}
export async function updateMyDevice(req, res) {
  try { return success(res, await UserService.updateDevice(req.user.sub, req.body), "Device updated"); }
  catch (e) { console.error(e); return error(res); }
}
