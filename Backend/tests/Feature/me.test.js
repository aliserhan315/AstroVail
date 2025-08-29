import { api, registerUser, auth } from "../helpers.js";

describe("Me", () => {
  test("GET /me returns current user", async () => {
    const { accessToken, user } = await registerUser();
    const res = await api().get("/me").set(auth(accessToken)).expect(200);
    expect(res.body.data._id).toBe(user._id);
  });

  test("PATCH /me/profile updates profile", async () => {
    const { accessToken } = await registerUser();
    const res = await api()
      .patch("/me/profile")
      .set(auth(accessToken))
      .send({ displayName: "New Name", avatarUrl: "https://ex.com/a.png" })
      .expect(200);
    expect(res.body.data.displayName).toBe("New Name");
  });

  test("PATCH /me/device saves tz/location", async () => {
    const { accessToken } = await registerUser();
    const res = await api()
      .patch("/me/device")
      .set(auth(accessToken))
      .send({ tz: "Asia/Beirut", location: { lat: 33.9, lon: 35.5, accuracy: 20 } })
      .expect(200);
    expect(res.body.data.tz).toBe("Asia/Beirut");
  });

  test("rejects /me without auth", async () => {
    await api().get("/me").expect(401);
  });
});
