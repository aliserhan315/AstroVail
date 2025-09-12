import { AuthService } from './auth.service.js';
import { success, error } from '../../utils/response.js';

export async function register(req, res) {
  try {
    const ctx = { ua: req.headers['user-agent'], ip: req.ip, tz: req.body.tz, location: req.body.location };
    const out = await AuthService.register(req.body, ctx);
    return success(res, out, "User registered successfully", 201);
  } catch (e) {
    if (e.message === "Email already in use") return error(res, e.message, 400);
    console.error(e);
    return error(res);
  }
}

export async function login(req, res) {
  try {
    const ctx = { ua: req.headers['user-agent'], ip: req.ip, tz: req.body.tz, location: req.body.location };
    const out = await AuthService.login(req.body, ctx);
    return success(res, out, "Login successful");
  } catch (e) {
    if (e.message === "Invalid credentials") return error(res, e.message, 401);
    console.error(e);
    return error(res);
  }
}

export async function refresh(req, res) {
  try {
    const out = await AuthService.refresh({ refreshToken: req.body.refreshToken });
    return success(res, out, "Token refreshed");
  } catch {
    return error(res, "Invalid refresh token", 401);
  }
}

export async function logout(req, res) {
  try {
    await AuthService.logout({ refreshToken: req.body.refreshToken });
    return success(res, {}, "Logged out");
  } catch (e) {
    console.error(e);
    return error(res);
  }
}
