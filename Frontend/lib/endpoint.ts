import api, { setTokens, clearTokens } from "./api";

export const AuthAPI = {
  async register(payload: { name: string; email: string; password: string }) {
    const { data } = await api.post("/auth/register", payload);
    return data;
  },
  async login(payload: { email: string; password: string }) {
    const { data } = await api.post("/auth/login", payload);
    if (data?.accessToken) await setTokens(data.accessToken, data.refreshToken);
    return data;
  },
  async logout() {
    try {
      await api.post("/auth/logout");
    } finally {
      await clearTokens();
    }
  },
};

export const StarsAPI = {
  list(params?: { q?: string; page?: number }) {
    return api.get("/stars", { params }).then((r) => r.data);
  },
  get(id: string) {
    return api.get(`/stars/${id}`).then((r) => r.data);
  },
  mine() {
    return api.get("/stars/me/stars").then((r) => r.data);
  },
  create(payload: any) {
    return api.post("/stars", payload).then((r) => r.data);
  },
  update(id: string, payload: any) {
    return api.patch(`/stars/${id}`, payload).then((r) => r.data);
  },
  remove(id: string) {
    return api.delete(`/stars/${id}`).then((r) => r.data);
  },
};

export const CartAPI = {
  get() {
    return api.get("/cart").then((r) => r.data);
  },
  add(starId: string, qty = 1) {
    return api.post("/cart/items", { starId, qty }).then((r) => r.data);
  },
  remove(starId: string) {
    return api.delete(`/cart/items/${starId}`).then((r) => r.data);
  },
};

export const EventsAPI = {
  list() {
    return api.get("/events").then((r) => r.data);
  },
  get(id: string) {
    return api.get(`/events/${id}`).then((r) => r.data);
  },
  remind(id: string) {
    return api.post(`/events/${id}/remind`).then((r) => r.data);
  },
};

export const NotiAPI = {
  list() {
    return api.get("/notifications").then((r) => r.data);
  },
  markRead(id: string) {
    return api.post(`/notifications/${id}/read`).then((r) => r.data);
  },
};

export const MeAPI = {
  get() {
    return api.get("/me").then((r) => r.data);
  },
  updateProfile(payload: any) {
    return api.patch("/me/profile", payload).then((r) => r.data);
  },
  updateDevice(payload: { token: string }) {
    return api.patch("/me/device", payload).then((r) => r.data);
  },
};
