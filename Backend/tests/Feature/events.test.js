import { api, registerUser, auth } from "../helpers.js";
import Event from "../../src/modules/events/events.model.js";

describe("Events", () => {
  test("lists events", async () => {
    await Event.create({
      source: "nasa:donki",
      externalId: "E1",
      title: "Solar flare",
      startTime: new Date(),
    });
    const res = await api().get("/events").expect(200);
    const items = res.body.data.items || res.body.data;
    expect(Array.isArray(items)).toBe(true);
  });

  test("gets by id & remind auth", async () => {
    const doc = await Event.create({
      source: "nasa",
      externalId: "E2",
      title: "Another",
      startTime: new Date(),
    });
    await api().get(`/events/${doc._id}`).expect(200);

    await api().post(`/events/${doc._id}/remind`).send({ at: new Date().toISOString() }).expect(401);

    const { accessToken } = await registerUser();
    const ok = await api()
      .post(`/events/${doc._id}/remind`)
      .set(auth(accessToken))
      .send({ at: new Date().toISOString() });
    expect([200, 201, 204]).toContain(ok.status);
  });
});
