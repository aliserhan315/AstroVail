import { apiPost, registerUser } from "../helpers.js";
import { faker } from "@faker-js/faker";

describe("Auth", () => {
  test("registers and returns tokens", async () => {
    const email = faker.internet.email({ provider: "example.com" });
    const password = `Passw0rd!${faker.string.alphanumeric(4)}`;
    const displayName = faker.person.firstName();

    const res = await apiPost("/auth/register").send({
      email,
      password,
      displayName,
      tz: "Asia/Beirut",
    }).expect(201);

    expect(res.body.data).toHaveProperty("accessToken");
    expect(res.body.data).toHaveProperty("refreshToken");
    expect(res.body.data.user.email).toBe(email.toLowerCase());;
  });

  test("prevents duplicate email", async () => {
    const email = faker.internet.email({ provider: "example.com" });
    const password = `P@ss${faker.string.alphanumeric(6)}`;

    await apiPost("/auth/register").send({ email, password }).expect(201);
    await apiPost("/auth/register").send({ email, password }).expect(400);
  });

  test("login works", async () => {
    const email = faker.internet.email({ provider: "example.com" });
    const password = `Abc123!${faker.string.alphanumeric(5)}`;

    await apiPost("/auth/register").send({ email, password }).expect(201);
    const res = await apiPost("/auth/login").send({ email, password }).expect(200);
    expect(res.body.data.accessToken).toBeTruthy();
  });

  test("refresh rotates tokens", async () => {
    const { refreshToken } = await registerUser(); 
    const res = await apiPost("/auth/refresh").send({ refreshToken }).expect(200);
    expect(res.body.data.accessToken).toBeTruthy();
    expect(res.body.data.refreshToken).toBeTruthy();
  });

  test("logout returns 200", async () => {
    const { refreshToken } = await registerUser();
    await apiPost("/auth/logout").send({ refreshToken }).expect(200);
  });
});
