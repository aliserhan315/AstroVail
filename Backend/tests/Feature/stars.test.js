import { apiGet, apiPost, apiPatch, registerUser, auth } from "../helpers.js";
import Star from "../../src/modules/star/star.model.js";

beforeAll(async () => {
  await Star.collection.createIndex({
    displayName: "text",
    baseName: "text",
    constellation: "text",
  });
});

describe("Stars", () => {
  test("GET /stars returns random unowned (no q)", async () => {
    await Star.create([
      { catalogId: "HIP 1", baseName: "Alpha", magnitude: 1.0 },
      { catalogId: "HIP 2", baseName: "Beta",  magnitude: 2.0 },
      { catalogId: "HIP 3", baseName: "Gamma", magnitude: 3.0 },
    ]);
    const res = await apiGet("/stars").expect(200);
    const data = res.body.data.items || res.body.data;
    expect(Array.isArray(data)).toBe(true);
    expect(data.every(s => !s.owner)).toBe(true);
  });

  test("search by name", async () => {
    await Star.create({ catalogId: "HIP 42", baseName: "Vega", magnitude: 0.0 });
    const res = await apiGet("/stars?q=vega").expect(200);
    const items = res.body.data.items;
    expect(items.some(s => (s.baseName || "").toLowerCase() === "vega")).toBe(true);
  });

  test("get by id & by catalog", async () => {
    const s = await Star.create({ catalogId: "HIP 100", baseName: "Deneb", magnitude: 1.2 });
    await apiGet(`/stars/${s._id}`).expect(200);
    await apiGet(`/stars/by-catalog/HIP 100`).expect(200);
  });

  test("owner-only rename", async () => {
    const { accessToken } = await registerUser();
    const created = await apiPost("/stars")
      .set(auth(accessToken))
      .send({ catalogId: `HIP_${Date.now()}`, baseName: "Rigel" })
      .expect(201);

    const id = created.body.data._id;

    await apiPatch(`/stars/${id}`)
      .set(auth(accessToken))
      .send({ displayName: "My Rigel" })
      .expect(200);

    const other = await registerUser({ email: `o${Date.now()}@ex.com` });
    await apiPatch(`/stars/${id}`)
      .set(auth(other.accessToken))
      .send({ displayName: "Hack" })
      .expect(403);
  });

  test("GET /me/stars shows only my stars", async () => {
    const { accessToken } = await registerUser();
    const mine = await apiPost("/stars")
      .set(auth(accessToken))
      .send({ catalogId: `HIP_${Date.now()}`, baseName: "Altair" })
      .expect(201);

    const res = await apiGet("/me/stars").set(auth(accessToken)).expect(200);
    const items = res.body.data.items;
    expect(items.some(s => s._id === mine.body.data._id)).toBe(true);
  });
});
