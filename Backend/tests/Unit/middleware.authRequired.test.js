import { jest } from "@jest/globals"; 
import jwt from "jsonwebtoken";
import { authRequired } from "../../src/middleware/Auth.js";

const SECRET = process.env.JWT_SECRET || "testsecret";

const fakeRes = () => ({
  statusCode: 200,
  _json: null,
  status(c){ this.statusCode=c; return this; },
  json(o){ this._json=o; return this; },
});

describe("authRequired", () => {
  test("rejects without token", async () => {
    const req = { headers: {} };
    const res = fakeRes();
    const next = jest.fn();
    await authRequired(req, res, next);
    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("accepts valid token", async () => {
    const token = jwt.sign({ sub: "123", email: "a@b.com" }, SECRET, { expiresIn: "15m" });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = fakeRes();
    const next = jest.fn();
    await authRequired(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user.sub).toBe("123");
  });
});
