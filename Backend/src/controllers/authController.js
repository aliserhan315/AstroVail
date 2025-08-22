import { AuthService } from '../services/authService.js';
import { success, error } from '../utils/response.js';


 export async function register(req, res) {
    try {
      const out = await AuthService.register(req.body);
      return success(res, out, "User registered successfully", 201);
    } catch (e) {
      if (e.message === "Email already in use") return error(res, e.message, 400);
      console.error(e);
      return error(res);
    }
  }
  
export async function login(req, res) {
    try {
      const out = await AuthService.login(req.body);
      return success(res, out, "Login successful");
    } catch (e) {
      if (e.message === "Invalid credentials") return error(res, e.message, 401);
      console.error(e);
      return error(res);
    }
};
