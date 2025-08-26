import "dotenv/config.js";
import mongoose from "mongoose";
import cron from "node-cron";
import { EventService } from "../src/services/eventService.js";
import { fetchDonkiSolarFlares } from "../src/events/sources/nasa_donki.js";
import { fetchNeoCloseApproaches } from "../src/events/sources/nasa_neows.js";

const SPEC = process.env.CRON_FETCH_EVENTS || "0 6 * * *";

async function tick() {
  await mongoose.connect(process.env.MONGODB_URI);
  const now  = new Date();
  const from = new Date(now.getTime() - 24*60*60*1000);
  const to   = new Date(now.getTime() + 48*60*60*1000);

  const apiKey = process.env.NASA_API_KEY;
  const donki = await fetchDonkiSolarFlares({ from, to, apiKey });
  const neows = await fetchNeoCloseApproaches({ from, to, apiKey });
  const all   = [...donki, ...neows];

  const res = await EventService.upsertEvents(all);
  console.log(`Events upserted -> created: ${res.created}, updated: ${res.updated}, total seen: ${all.length}`);
  await mongoose.disconnect();
}

if (process.argv.includes("--once")) tick().catch(e => { console.error(e); process.exit(1); });
else {
  cron.schedule(SPEC, () => tick().catch(console.error));
  console.log("⏰ Event fetch cron scheduled:", SPEC);
}
