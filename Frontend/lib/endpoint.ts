import api from "@/lib/api";
import * as FileSystem from "expo-file-system";

export const AuthAPI = {
  async register(payload: any) { const { data } = await api.post("/auth/register", payload); return data.data; },
  async login(payload: any) { const { data } = await api.post("/auth/login", payload); return data.data; },
  async logout() { try { await api.post("/auth/logout"); } catch {} },
};

export const StarsAPI = {
  list(params?: any) { return api.get("/stars", { params }).then((r) => r.data.data); },
  get(id: string) { return api.get(`/stars/${id}`).then((r) => r.data.data); },
  mine() { return api.get("/stars/me/stars").then((r) => r.data.data); },
  create(payload: any) { return api.post("/stars", payload).then((r) => r.data.data); },
  update(id: string, payload: any) { return api.patch(`/stars/${id}`, payload).then((r) => r.data.data); },
  remove(id: string) { return api.delete(`/stars/${id}`).then((r) => r.data.data); },
};

export const EventsAPI = {
  list(params?: any) { return api.get("/events", { params }).then((r) => r.data); },
  get(id: string) { return api.get(`/events/${id}`).then((r) => r.data); },
  remind(id: string) { return api.post(`/events/${id}/remind`).then((r) => r.data); },
};

export const NotiAPI = {
  list() { return api.get("/notifications").then((r) => r.data.data); },
  markRead(id: string) { return api.post(`/notifications/${id}/read`).then((r) => r.data.data); },
};

export const MeAPI = {
  get() { return api.get("/me").then((r) => r.data.data); },
  updateProfile(payload: any) { return api.patch("/me/profile", payload).then((r) => r.data.data); },
  updateDevice(payload: any) { return api.patch("/me/device", payload).then((r) => r.data.data); },
};

export const AIAPI = { certificateMessage(payload: any) { return api.post("/ai/certificate-message", payload).then((r) => r.data.data); } };

export const CartAPI = {
  get() { return api.get("/cart").then((r) => r.data.data); },
  add(starId: string, qty = 1) { return api.post("/cart/items", { starId, qty }).then((r) => r.data.data); },
  update(starId: string, patch: any) { return api.patch(`/cart/items/${starId}`, patch).then((r) => r.data.data); },
  remove(starId: string) { return api.delete(`/cart/items/${starId}`).then((r) => r.data.data); },
};

export const CheckoutAPI = {
  create() { return api.post("/checkout/create").then((r) => r.data.data); },
  finalize(orderId: string) { return api.post("/checkout/finalize", { orderId }).then((r) => r.data.data); },
};

export const OverlayAPI = {
  async analyze(
    file: { uri: string; name?: string; type?: string },
    userStarId: string,
    format: "json" | "png" | "png-base64" = "json"
  ) {
    const base64 = await FileSystem.readAsStringAsync(file.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const mime = file.type || "image/jpeg";
    const payload = { userStarId, format, imageBase64: `data:${mime};base64,${base64}` };

    if (format === "png-base64") {
      const res = await api.post("/overlay", payload, { timeout: 60000 });
      return res.data.data.pngDataUrl as string;
    }

    if (format === "png") {
      const res = await api.post("/overlay", payload, { responseType: "arraybuffer", timeout: 60000 });
      const b64 = global.Buffer ? global.Buffer.from(res.data, "binary").toString("base64") : "";
      return `data:image/png;base64,${b64}`;
    }
    const res = await api.post("/overlay", payload, { timeout: 60000 });
    return res.data.data;
  },
};
