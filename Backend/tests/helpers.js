import request from "supertest";
import { app } from "../src/app.js";
import { faker } from "@faker-js/faker";

export const api = () => request(app);

export async function registerUser(overrides = {}) {
  const payload = {
    email: faker.internet.email({ provider: "example.com" }),
    password: `Passw0rd!${faker.string.alphanumeric(6)}`,
    displayName: faker.person.fullName(),
    tz: "Asia/Beirut",
    ...overrides,
  };
  const res = await api().post("/auth/register").send(payload).expect(201);
  const { user, accessToken, refreshToken } = res.body.data;
  return { user, accessToken, refreshToken, creds: payload };
}

export const auth = (token) => ({ Authorization: `Bearer ${token}` });
