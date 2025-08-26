import "dotenv/config.js";
import mongoose from "mongoose";
import cron from "node-cron";
import { EventService } from "../src/services/eventService.js";
import { fetchDonkiSolarFlares } from "../src/events/sources/nasa_donki.js";
import { fetchNeoCloseApproaches } from "../src/events/sources/nasa_neows.js";

const CRON_SPEC =  "5 9 * * *";
const TZ = "Asia/Beirut";
const MONGODB_URI = process.env.MONGODB_URI;
const NASA_API_KEY = process.env.NASA_API_KEY;
if (!MONGODB_URI) throw new Error("MONGODB_URI is required");
if (!NASA_API_KEY) console.warn("⚠️ NASA_API_KEY missing — public rate limits may hit you");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function withRetry(fn, { tries = 3, baseDelay = 800 } = {}) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try { return await fn(); } catch (e) {
      lastErr = e;
      const status = e?.response?.status || e?.status;
      if (status && status < 500 && status !== 429) break; 
      const delay = baseDelay * Math.pow(2, i);
      console.warn(`retry ${i + 1}/${tries} after ${delay}ms (${status || e.message})`);
      await sleep(delay);
    }
  }
  throw lastErr;
}

async function connectDB() {
  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 10_000,
    socketTimeoutMS: 45_000,
    maxPoolSize: 5,
  });
}

async function tick() {
  const startedAt = new Date();
  const now = new Date();
  const from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const to   = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  console.log(`🔭 Fetch window from=${from.toISOString()} to=${to.toISOString()}`);
  await connectDB();
  try {
    const [donki, neows] = await Promise.all([
      withRetry(() => fetchDonkiSolarFlares({ from, to, apiKey: NASA_API_KEY })),
      withRetry(() => fetchNeoCloseApproaches({ from, to, apiKey: NASA_API_KEY })),
    ]);

    const all = [...donki, ...neows];
    console.log(`🌌 Sources -> DONKI: ${donki.length}, NEOs: ${neows.length}, total: ${all.length}`);

    const res = await EventService.upsertEvents(all);
    const dur = ((Date.now() - startedAt.getTime()) / 1000).toFixed(1);
    console.log(`✅ Events upserted -> created: ${res.created}, updated: ${res.updated}, total seen: ${all.length} in ${dur}s`);
  } catch (e) {
    console.error("❌ tick error:", e?.response?.status, e?.message || e);
    throw e;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}
const isOnce = process.argv.includes("--once");

if (isOnce) {
  tick().catch(() => process.exit(1));
} else {
  cron.schedule(CRON_SPEC, () => {
    const jitter = Math.floor(Math.random() * 20_000);
    setTimeout(() => tick().catch(console.error), jitter);
  }, { timezone: TZ });
  console.log(`⏰ Event fetch cron scheduled: "${CRON_SPEC}" @ ${TZ}`);
}
for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, async () => {
    try { await mongoose.disconnect(); } catch {}
    process.exit(0);
  });
}
