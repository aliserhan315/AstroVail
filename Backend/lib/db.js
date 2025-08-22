import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI in env");
}

// Next.js hot reload can call this file many times in dev.
// Use global cache to avoid creating multiple connections.
let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { serverSelectionTimeoutMS: 15000 })
      .then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
