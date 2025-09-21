import "dotenv/config.js";
import mongoose from "mongoose";
import cron from "node-cron";
import { ReminderService } from "../src/modules/notification/reminder.service.js";

const SPEC = process.env.CRON_SEND_NOTIFS || "*/10 * * * *";

async function tick() {
  await mongoose.connect(process.env.MONGODB_URI);
  const res = await ReminderService.sendDue(new Date());
  if (res.processed) {
    console.log(` reminders processed: ${res.processed}, notifications: ${res.created}, marked sent: ${res.marked}`);
  }
  await mongoose.disconnect();
}

if (process.argv.includes("--once")) tick().catch(e => { console.error(e); process.exit(1); });
else {
  cron.schedule(SPEC, () => tick().catch(console.error));
  console.log("Reminder cron scheduled:", SPEC);
}
