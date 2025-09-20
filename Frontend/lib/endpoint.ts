import api from "@/lib/api";

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

export const AIAPI = { 
  certificateMessage(payload: any) { return api.post("/ai/certificate-message", payload).then((r) => r.data.data); } 
};

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
    format: "json" | "png" = "json"
  ) {
    const toBase64 = async (uri: string) => {
      try {
        const Manipulator: any = await import("expo-image-manipulator");
        if (Manipulator?.manipulateAsync && Manipulator?.SaveFormat) {
          const maxDim = 1600;
          const result = await Manipulator.manipulateAsync(
            uri,
            [{ resize: { width: maxDim } }],
            { compress: 0.9, format: Manipulator.SaveFormat.JPEG, base64: true }
          );
          if (result?.base64) return String(result.base64);
        }
      } catch {}
      try {
        const FileSystem: any = await import("expo-file-system");
        if (FileSystem?.readAsStringAsync && FileSystem?.EncodingType?.Base64) {
          return await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
        }
      } catch {}
      const resp = await fetch(uri);
      const blob = await resp.blob();
      const reader = new FileReader();
      return await new Promise<string>((resolve, reject) => {
        reader.onerror = () => reject(reader.error);
        reader.onloadend = () => {
          const s = String(reader.result || "");
          const b64 = s.includes(",") ? s.split(",")[1] : s;
          resolve(b64);
        };
        reader.readAsDataURL(blob);
      });
    };

    const base64 = await toBase64(file.uri);
    const mime = file.type || "image/jpeg";
    const imageBase64 = `data:${mime};base64,${base64}`;
    const payload = { imageBase64, userStarId, format } as const;

    if (format === "png") {
      const url = `${api.defaults.baseURL}/overlay`;
      const auth = (api.defaults.headers?.common as any)?.Authorization;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(auth ? { Authorization: auth } : {}) },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const text = await res.text(); throw new Error(text || `HTTP ${res.status}`); }
      const blob = await res.blob();
      const reader = new FileReader();
      const out64 = await new Promise<string>((ok, err) => { reader.onerror = () => err(reader.error); reader.onloadend = () => ok(String(reader.result).split(",")[1] || ""); reader.readAsDataURL(blob); });
      return `data:image/png;base64,${out64}`;
    }

    const res = await api.post("/overlay", payload, { timeout: 60000 });
    return res.data.data;
  },

  async analyzeStarDetection(
    file: { uri: string; name?: string; type?: string },
    userStarId: string
  ) {
    const toBase64 = async (uri: string) => {
      try {
        const Manipulator: any = await import("expo-image-manipulator");
        if (Manipulator?.manipulateAsync && Manipulator?.SaveFormat) {
          const maxDim = 1600;
          const result = await Manipulator.manipulateAsync(
            uri,
            [{ resize: { width: maxDim } }],
            { compress: 0.9, format: Manipulator.SaveFormat.JPEG, base64: true }
          );
          if (result?.base64) return String(result.base64);
        }
      } catch {}
      try {
        const FileSystem: any = await import("expo-file-system");
        if (FileSystem?.readAsStringAsync && FileSystem?.EncodingType?.Base64) {
          return await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
        }
      } catch {}
      const resp = await fetch(uri);
      const blob = await resp.blob();
      const reader = new FileReader();
      return await new Promise<string>((resolve, reject) => {
        reader.onerror = () => reject(reader.error);
        reader.onloadend = () => {
          const s = String(reader.result || "");
          const b64 = s.includes(",") ? s.split(",")[1] : s;
          resolve(b64);
        };
        reader.readAsDataURL(blob);
      });
    };

    const base64 = await toBase64(file.uri);
    const mime = file.type || "image/jpeg";
    const imageBase64 = `data:${mime};base64,${base64}`;
    const payload = { imageBase64, userStarId };

    const res = await api.post("/overlay", payload, { timeout: 60000 });
    return res.data.data;
  },
};