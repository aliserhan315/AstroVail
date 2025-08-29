import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";


process.env.JWT_SECRET = process.env.JWT_SECRET || "testsecret";
mongoose.set("autoIndex", true);
let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map(c => c.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});