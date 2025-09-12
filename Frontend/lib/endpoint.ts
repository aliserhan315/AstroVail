import api from "@/lib/api";

export const AuthAPI = {
  async register(payload: {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    name?: string; // backward compat
    email: string;
    password: string;
  }) {
    const { data } = await api.post("/auth/register", payload);
    return data.data;
  },
  async login(payload: { email: string; password: string }) {
    const { data } = await api.post("/auth/login", payload);
    return data.data;
  },
  async logout() {
    try { await api.post("/auth/logout"); } catch {}
  },
};

export const StarsAPI = {
  list(params?: {
    q?: string; page?: number; limit?: number; constellation?: string;
    magnitudeMax?: number; nakedEye?: boolean; binocular?: boolean; sort?: "recent";
  }) { return api.get("/stars", { params }).then(r => r.data.data); },
  get(id: string) { return api.get(`/stars/${id}`).then(r => r.data.data); },
  mine() { return api.get("/stars/me/stars").then(r => r.data.data); },
  create(payload: any) { return api.post("/stars", payload).then(r => r.data.data); },
  update(id: string, payload: any) { return api.patch(`/stars/${id}`, payload).then(r => r.data.data); },
  remove(id: string) { return api.delete(`/stars/${id}`).then(r => r.data.data); },
};

export const CartAPI = {
  get() { return api.get("/cart").then(r => r.data.data); },
  add(starId: string, qty = 1) { return api.post("/cart/items", { starId, qty }).then(r => r.data.data); },
  update(starId: string, patch: any) { return api.patch(`/cart/items/${starId}`, patch).then(r => r.data.data); },
  remove(starId: string) { return api.delete(`/cart/items/${starId}`).then(r => r.data.data); },
};

export const EventsAPI = {
  list(params?: { from?: string; to?: string; q?: string; limit?: number; includeNEO?: boolean }) {
    return api.get("/events", { params }).then(r => r.data);
  },
  get(id: string) { return api.get(`/events/${id}`).then(r => r.data); },
  remind(id: string) { return api.post(`/events/${id}/remind`).then(r => r.data); },
};

export const NotiAPI = {
  list() { return api.get("/notifications").then(r => r.data.data); },
  markRead(id: string) { return api.post(`/notifications/${id}/read`).then(r => r.data.data); },
};

export const MeAPI = {
  get() { return api.get("/me").then(r => r.data.data); },
  updateProfile(payload: any) { return api.patch("/me/profile", payload).then(r => r.data.data); },
  updateDevice(payload: any) { return api.patch("/me/device", payload).then(r => r.data.data); },
};
export const CheckoutAPI = {
  create() {
    return api.post("/checkout/create").then(r => r.data.data);
  },
  finalize(orderId: string) {
    return api.post("/checkout/finalize", { orderId }).then(r => r.data.data);
  },
};
