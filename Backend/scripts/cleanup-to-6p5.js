
import 'dotenv/config.js';
import mongoose from 'mongoose';
import Star from '../src/models/Star.js';

const MONGO_URL = process.env.MONGODB_URI;
if (!MONGO_URL) throw new Error('Missing MONGODB_URI');

await mongoose.connect(MONGO_URL);
const { deletedCount } = await Star.deleteMany({ magnitude: { $gt: 7 } });
console.log(`Deleted ${deletedCount} stars with mag > 7`);
await mongoose.disconnect();
process.exit(0);
