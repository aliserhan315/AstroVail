import axios, { AxiosError, AxiosInstance } from "axios";
import { store } from "@/state/store";
import { tokenRefreshed, logout } from "@/state/slices/authSlice";

const ROOT = "http://192.168.1.104:3000";
export const BASE_URL = `${ROOT.replace(/\/$/, "")}/api`;

let refreshingPromise: Promise<string | null> | null = null;

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { Accept: "application/json", "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError<any>) => {
    const original: any = err.config || {};
    if (err.code === "ECONNABORTED") throw new Error("Request timed out. Please try again.");
    if (!err.response) throw new Error("Network error. Check your connection.");

    const status = err.response.status ?? 0;
    const isRefreshingCall =
      typeof original?.url === "string" && original.url.includes("/auth/refresh");

    if (status === 401 && !original._retry && !isRefreshingCall) {
      original._retry = true;
      try {
        if (!refreshingPromise) {
          refreshingPromise = (async () => {
            const refreshToken = store.getState().auth.refreshToken;
            if (!refreshToken) return null;

            const { data } = await axios.post(
              `${BASE_URL}/auth/refresh`,
              { refreshToken },
              { headers: { "Content-Type": "application/json" }, timeout: 10000 }
            );

            const payload = data?.data ?? data;
            const newAccess: string | undefined = payload?.accessToken;
            const newRefresh: string | undefined = payload?.refreshToken;
            if (newAccess) {
              store.dispatch(tokenRefreshed({ accessToken: newAccess, refreshToken: newRefresh }));
              return newAccess;
            }
            return null;
          })();
        }

        const newAccess = await refreshingPromise;
        refreshingPromise = null;

        if (newAccess) {
          original.headers = original.headers ?? {};
          original.headers.Authorization = `Bearer ${newAccess}`;
          return api(original);
        }
      } catch {
        refreshingPromise = null;
      }
      store.dispatch(logout());
    }

    const payload = err.response.data as any;
    const msg =
      payload?.message ||
      payload?.error ||
      (typeof payload === "string" ? payload : `Request failed (${status})`);
    throw new Error(msg);
  }
);

export default api;