import axios, { AxiosError, AxiosInstance } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";


const ROOT = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
const BASE_URL = `${ROOT.replace(/\/$/, "")}/api`;
const ACCESS_KEY = "av_access";
const REFRESH_KEY = "av_refresh";
let refreshingPromise: Promise<string | null> | null = null;

export async function getAccessToken() {
  return AsyncStorage.getItem(ACCESS_KEY);
}
export async function getRefreshToken() {
  return AsyncStorage.getItem(REFRESH_KEY);
}
export async function setTokens(access: string, refresh?: string) {
  await AsyncStorage.setItem(ACCESS_KEY, access);
  if (typeof refresh === "string") {
    await AsyncStorage.setItem(REFRESH_KEY, refresh);
  }
}
export async function clearTokens() {
  await AsyncStorage.multiRemove([ACCESS_KEY, REFRESH_KEY]);
}
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError<any>) => {
    const original = err.config as any;

    if (err.code === "ECONNABORTED") {
      throw new Error("Request timed out. Please try again.");
    }
    if (!err.response) {
      throw new Error("Network error. Check your connection.");
    }

    if (err.response.status === 401 && !original?._retry) {
      original._retry = true;

      try {
        if (!refreshingPromise) {
          refreshingPromise = (async () => {
            const refreshToken = await getRefreshToken();
            if (!refreshToken) return null;

            const { data } = await axios.post(
              `${BASE_URL}/auth/refresh`,
              { refreshToken },
              { headers: { "Content-Type": "application/json" }, timeout: 10000 }
            );
            const newAccess = data?.accessToken as string | undefined;
            const newRefresh = data?.refreshToken as string | undefined;
            if (newAccess) await setTokens(newAccess, newRefresh);
            return newAccess ?? null;
          })();
        }

        const newAccess = await refreshingPromise;
        refreshingPromise = null;

        if (newAccess) {
          original.headers = original.headers ?? {};
          original.headers.Authorization = `Bearer ${newAccess}`;
          return api(original);
        }
      } catch (refreshErr) {
        refreshingPromise = null;
      }

      await clearTokens();
    }

    const msg =
      (err.response.data as any)?.message ||
      (err.response.data as any)?.error ||
      `Request failed (${err.response.status})`;
    throw new Error(msg);
  }
);

export default api;
