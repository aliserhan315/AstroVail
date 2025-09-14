import mongoose from "mongoose";

function hasLabel(e, label) {
  const set = e?.errorLabelSet;
  if (set && typeof set.has === "function") return set.has(label);
  const arr = e?.errorLabels;
  if (Array.isArray(arr)) return arr.includes(label);
  return false;
}

export async function runWithTxRetry(fn, { maxRetries = 5, baseDelayMs = 80 } = {}) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const session = await mongoose.startSession();
    try {
      let result;
      await session.withTransaction(async () => {
        result = await fn(session);
      }, {
        readConcern: { level: "snapshot" },
        writeConcern: { w: "majority" },
        readPreference: "primary",
      });
      await session.endSession();
      return result;
    } catch (e) {
      await session.endSession();

      const isRetryable =
        hasLabel(e, "TransientTransactionError") ||
        hasLabel(e, "UnknownTransactionCommitResult") ||
        e?.code === 112 || e?.codeName === "WriteConflict";

      if (isRetryable && attempt < maxRetries - 1) {
        const delay = baseDelayMs * Math.pow(2, attempt); 
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw e;
    }
  }
}
