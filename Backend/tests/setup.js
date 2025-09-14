import mongoose from "mongoose";
import dotenv from "dotenv";
import { jest } from "@jest/globals";

dotenv.config();

if (!process.env.NODE_ENV) process.env.NODE_ENV = "test";

if (!process.env.USE_MEM_MONGO) {
  process.env.USE_MEM_MONGO = "true";
}

jest.setTimeout(30000);

process.env.JWT_SECRET = process.env.JWT_SECRET || "testsecret";
mongoose.set("autoIndex", true);

let mongo = null; 
let connected = false;

beforeAll(async () => {
  const useMem = process.env.USE_MEM_MONGO === "true";
  const uri = process.env.MONGODB_URI_TEST || process.env.MONGODB_URI;

  if (useMem) {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
    connected = true;
    return;
  }

  const mustBeTestDb = (u) => {
    try {
      const i = u.indexOf("/");
      const dbPart = i >= 0 ? u.slice(i + 1).split("?")[0] : "";
      const dbName = (dbPart || "").trim();
      return /test/i.test(dbName);
    } catch {
      return false;
    }
  };

  if (!uri) {
    throw new Error(
      "No MongoDB URI provided for tests. Set MONGODB_URI_TEST or enable USE_MEM_MONGO=true."
    );
  }

  if (!process.env.MONGODB_URI_TEST && process.env.MONGODB_URI && !mustBeTestDb(uri)) {
    throw new Error(
      "Refusing to run tests against non-test database. Set MONGODB_URI_TEST (with a test DB) or USE_MEM_MONGO=true."
    );
  }

  await mongoose.connect(uri);
  connected = true;
});

afterEach(async () => {
  if (!connected) return;
  const db = mongoose.connection?.db;
  if (!db) return;
  const collections = await db.collections();
  await Promise.all(collections.map((c) => c.deleteMany({})));
});

afterAll(async () => {
  if (connected) {
    await mongoose.connection.close();
    connected = false;
  }
  if (mongo) {
    await mongo.stop();
    mongo = null;
  }
});
