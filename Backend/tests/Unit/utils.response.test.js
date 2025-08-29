import { jest } from "@jest/globals";
import { success, error } from "../../src/utils/response.js";

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};

describe("response utils", () => {
  test("success()", () => {
    const res = mockRes();
    success(res, { a: 1 }, "ok", 201);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true, message: "ok", data: { a: 1 }
    }));
  });

  test("error()", () => {
    const res = mockRes();
    error(res, "boom", 400);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false, message: "boom"
    }));
  });
});
