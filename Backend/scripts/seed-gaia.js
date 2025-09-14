import 'dotenv/config.js';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import mongoose from 'mongoose';
import Star from '../src/modules/star/star.model.js';

const MONGO_URL = (process.env.MONGODB_URI || '').trim();
let GAIA_CSV = (process.env.GAIA_CSV || '').trim();
GAIA_CSV = GAIA_CSV.replace(/^['"]|['"]$/g, '');
const CSV_PATH = path.resolve(GAIA_CSV);

if (!MONGO_URL) {
  console.error('Missing MONGODB_URI in .env');
  process.exit(1);
}
if (!GAIA_CSV) {
  console.error('GAIA_CSV is empty in .env');
  process.exit(1);
}
if (!fs.existsSync(CSV_PATH)) {
  console.error(' CSV not found at:', CSV_PATH);
  process.exit(1);
}

const MAG_NAKED = Number(process.env.GAIA_MAG_NAKED_EYE ?? 6.0);
const MAG_BINOC = Number(process.env.GAIA_MAG_BINOCULAR ?? 9.0);

const BATCH_SIZE = 2000;

function rowToOp(row) {
  const source_id = String(row.source_id ?? '').trim();
  if (!source_id) return null;

  const catalogId = `Gaia DR3 ${source_id}`;

  const raStr = row.ra ?? row.RA ?? row.right_ascension;
  const decStr = row.dec ?? row.DEC ?? row.declination;
  const magStr =
    row.phot_g_mean_mag ??
    row.g_mag ??
    row.g;

  const ra = Number(raStr);
  const dec = Number(decStr);
  const g = magStr === '' || magStr == null ? null : Number(magStr);

  if (!Number.isFinite(ra) || !Number.isFinite(dec) || g == null || !Number.isFinite(g)) {
    return null;
  }

  const nakedEye = g <= MAG_NAKED;
  const binocular = g <= MAG_BINOC;

  return {
    updateOne: {
      filter: { catalogId },
      update: {
        $set: {
          catalogId,
          baseName: catalogId,
          displayName: catalogId,
          ra,
          dec,
          magnitude: g,
          nakedEye,
          binocular,
        },
        $setOnInsert: {
          owner: null,
          isGifted: false,
          certificateStyle: 'classic',
        },
      },
      upsert: true,
    },
  };
}

async function run() {
  await mongoose.connect(MONGO_URL);
  console.log(' Mongo connected');
  console.log(' Importing from:', CSV_PATH);

  const parser = fs
    .createReadStream(CSV_PATH)
    .pipe(
      parse({
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true,
      })
    );

  let batch = [];
  let total = 0, upserts = 0, modified = 0, skipped = 0;

  for await (const row of parser) {
    const op = rowToOp(row);
    if (!op) {
      skipped++;
      continue;
    }
    batch.push(op);

    if (batch.length >= BATCH_SIZE) {
      const res = await Star.bulkWrite(batch, { ordered: false });
      upserts  += res.upsertedCount || 0;
      modified += res.modifiedCount || 0;
      total    += batch.length;
      process.stdout.write(
        `\rInserted/updated: ${total} | upserts ${upserts} | modified ${modified} | skipped ${skipped}`
      );
      batch = [];
    }
  }

  if (batch.length) {
    const res = await Star.bulkWrite(batch, { ordered: false });
    upserts  += res.upsertedCount || 0;
    modified += res.modifiedCount || 0;
    total    += batch.length;
  }

  console.log(
    `\n Done. Rows processed: ${total} | upserts ${upserts} | modified ${modified} | skipped ${skipped}`
  );
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('\nImport failed:', err);
  process.exit(1);
});
