import request from "supertest";
import { app } from "../src/app.js";
import { faker } from "@faker-js/faker";

export const API_BASE = "/api";

export const apiGet   = (path) => request(app).get(`${API_BASE}${path}`);
export const apiPost  = (path) => request(app).post(`${API_BASE}${path}`);
export const apiPatch = (path) => request(app).patch(`${API_BASE}${path}`);
export const apiDel   = (path) => request(app).delete(`${API_BASE}${path}`);

export const auth = (token) => ({ Authorization: `Bearer ${token}` });

export async function registerUser(overrides = {}) {
  const payload = {
    email: faker.internet.email({ provider: "example.com" }),
    password: `Passw0rd!${faker.string.alphanumeric(6)}`,
    displayName: faker.person.fullName(),
    tz: "Asia/Beirut",
    ...overrides,
  };
  const res = await apiPost("/auth/register").send(payload).expect(201);
  const { user, accessToken, refreshToken } = res.body.data;
  return { user, accessToken, refreshToken, creds: payload };
}
