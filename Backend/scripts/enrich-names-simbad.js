
import 'dotenv/config.js';
import mongoose from 'mongoose';
import Star from '../src/models/Star.js';
import { XMLParser } from 'fast-xml-parser';
import pLimit from 'p-limit';

const MONGO_URL = process.env.MONGODB_URI;
if (!MONGO_URL) throw new Error('Missing MONGODB_URI');

const CONCURRENCY = Number(process.env.SIMBAD_CONCURRENCY ?? 6);
const LIMIT_DOCS  = process.env.SIMBAD_LIMIT ? Number(process.env.SIMBAD_LIMIT) : null; 

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });

function buildUrl(catalogId) {

  const ident = encodeURIComponent(catalogId);
  return `https://simbad.u-strasbg.fr/simbad/sim-id?Ident=${ident}&output.format=VOTable`;
}

function extractMainIdFromVOTable(xmlText) {
  const obj = parser.parse(xmlText);
  
  const vt = obj?.VOTABLE;
  const resource = vt?.RESOURCE;
  const table = resource?.TABLE;
  const fields = Array.isArray(table?.FIELD) ? table.FIELD : [];
  const data = table?.DATA?.TABLEDATA;
  const row = Array.isArray(data?.TR) ? data.TR[0] : data?.TR;
  const tds = Array.isArray(row?.TD) ? row.TD : (row?.TD ? [row.TD] : []);

  if (!fields.length || !tds.length) return null;

  const mainIdIndex = fields.findIndex(f => (f.name || '').toUpperCase() === 'MAIN_ID');
  if (mainIdIndex < 0 || mainIdIndex >= tds.length) return null;

  let mainId = tds[mainIdIndex];
  if (typeof mainId === 'string') mainId = mainId.trim();
  return mainId || null;
}

async function fetchMainName(catalogId) {
  const url = buildUrl(catalogId);
  const res = await fetch(url, { headers: { 'User-Agent': 'astro-vail/1.0 (Node)' } });
  if (!res.ok) {
  
    return null;
  }
  const text = await res.text();
  return extractMainIdFromVOTable(text);
}

function shouldReplaceDisplayName(star) {
  if (!star.displayName) return true;
  const cat = star.catalogId || '';
  const dn = star.displayName || '';
  return dn === cat || dn === star.baseName;
}

async function processOne(star) {
  const mainName = await fetchMainName(star.catalogId);
  if (!mainName) {
    await Star.updateOne({ _id: star._id }, { $set: { nameNotFound: true } });
    return { named: false };
  }

  const update = {
    $set: {
      realName: mainName,
      baseName: mainName,
    },
    $unset: { nameNotFound: "" },
  };

  if (shouldReplaceDisplayName(star)) {
    update.$set.displayName = mainName;
  }

  await Star.updateOne({ _id: star._id }, update);
  return { named: true, mainName };
}

async function run() {
  await mongoose.connect(MONGO_URL);
  console.log('✅ Mongo connected');

  const query = {
    magnitude: { $lte: 7 },
    $and: [
      { $or: [{ realName: { $exists: false } }, { realName: null }] },
      { $or: [{ nameNotFound: { $exists: false } }, { nameNotFound: { $ne: true } }] },
    ],
  };

  const cursor = Star.find(query).select({ catalogId: 1, displayName: 1, baseName: 1 }).cursor();

  const limit = pLimit(CONCURRENCY);
  let processed = 0, named = 0, missed = 0, queued = 0;

  const workers = [];
  for await (const star of cursor) {
    if (LIMIT_DOCS && queued >= LIMIT_DOCS) break;
    queued++;
    workers.push(limit(async () => {
      try {
        const result = await processOne(star);
        processed++;
        if (result.named) named++; else missed++;
        if (processed % 25 === 0) {
          process.stdout.write(`\rProcessed ${processed} | named ${named} | missed ${missed}`);
        }
      } catch (e) {
        missed++;
        processed++;
        process.stdout.write(`\rProcessed ${processed} | named ${named} | missed ${missed}`);
      }
    }));
  }

  await Promise.all(workers);
  console.log(`\n✅ Done. Processed ${processed} | named ${named} | not found ${missed}`);
  await mongoose.disconnect();
}

run().catch(err => {
  console.error('❌ enrich failed:', err);
  process.exit(1);
});
