import { OwnershipBlockchain } from "../src/services/ownership.service.js";

const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, v] = a.split("=");
  return [k.replace(/^--/,""), v];
}));

(async () => {
  try {
    const { email, starId, orderId } = args;
    if (!email) throw new Error("--email is required");
    const out = await OwnershipBlockchain.mintToEmail({ email, starId, orderId });
    console.log("Minted:", out);
    process.exit(0);
  } catch (e) {
    console.error("Error:", e?.message || e);
    process.exit(1);
  }
})();
