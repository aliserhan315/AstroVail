import { api, registerUser, auth } from "../helpers.js";
import Notification from "../../src/models/Notification.js";
import mongoose from "mongoose";

describe("Notifications", () => {
  test("lists only my notifications", async () => {
    const { user, accessToken } = await registerUser();
    await Notification.create({
      user: user._id, type: "event", title: "Hello", body: "World", day: "2025-08-25",
    });
    await Notification.create({
      user: new mongoose.Types.ObjectId(), type: "event", title: "Other", body: "Nope", day: "2025-08-25",
    });

    const res = await api().get("/notifications").set(auth(accessToken)).expect(200);
    const items = res.body.data.items || res.body.data;
    expect(items.every(n => n.user === String(user._id))).toBe(true);
  });

  test("marks as read", async () => {
    const { user, accessToken } = await registerUser();
    const n = await Notification.create({
      user: user._id, type: "event", title: "X", body: "Y", day: "2025-08-25",
    });
    await api().post(`/notifications/${n._id}/read`).set(auth(accessToken)).expect(200);
  });
});
