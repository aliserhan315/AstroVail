import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ethers } from "ethers";

const {
  CHAIN_RPC_URL,
  OWNERSHIP_CONTRACT_ADDRESS,
  CHAIN_OWNER_PRIVATE_KEY,
  STORAGE_DIR, 
} = process.env;

if (!CHAIN_RPC_URL) {
  throw new Error("Set CHAIN_RPC_URL (e.g. http://127.0.0.1:8545 or your Base Sepolia RPC)");
}
if (!OWNERSHIP_CONTRACT_ADDRESS) {
  throw new Error("Set OWNERSHIP_CONTRACT_ADDRESS to your deployed OwnershipToken address");
}
if (!CHAIN_OWNER_PRIVATE_KEY) {
  console.warn("[ownership.service] CHAIN_OWNER_PRIVATE_KEY not set — minting will fail (owner only)");
}

const ABI = [
  "function owner() view returns (address)",
  "function currentTokenId() view returns (uint256)",
  "function mint(address to) returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = STORAGE_DIR
  ? path.resolve(STORAGE_DIR)
  : path.resolve(__dirname, "..", "..", "storage");

const walletsFile = path.join(dataDir, "user-wallets.json");
const mintedFile = path.join(dataDir, "minted-records.json");

function ensureDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}
function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, "utf-8")); } catch { return {}; }
}
function writeJson(file, obj) {
  fs.writeFileSync(file, JSON.stringify(obj, null, 2));
}

async function getOrCreateWallet(email) {
  ensureDir();
  const key = String(email).trim().toLowerCase();
  if (!key) throw new Error("email required");
  const db = readJson(walletsFile);
  if (db[key]) return db[key];

  // Create a fresh wallet for the recipient email
  const wallet = ethers.Wallet.createRandom();
  db[key] = { email: key, address: wallet.address, privateKey: wallet.privateKey };
  writeJson(walletsFile, db);
  return db[key];
}

function recordMint({ tokenId, email, wallet, starId, orderId, txHash }) {
  ensureDir();
  const db = readJson(mintedFile);
  db.records = Array.isArray(db.records) ? db.records : [];
  db.records.push({
    tokenId: String(tokenId),
    email,
    wallet,
    starId: starId ? String(starId) : null,
    orderId: orderId ? String(orderId) : null,
    txHash,
    createdAt: new Date().toISOString(),
  });
  writeJson(mintedFile, db);
}

function getRecordsByEmail(email) {
  const db = readJson(mintedFile);
  const list = Array.isArray(db.records) ? db.records : [];
  const key = String(email).trim().toLowerCase();
  return list.filter((r) => r.email === key);
}

async function saveOwnershipRecordDb({ tokenId, email, wallet, starId, orderId, txHash }) {
  try {
    const { default: OwnershipRecord } = await import("../modules/ownership/ownership.model.js");
    await OwnershipRecord.create({
      tokenId: String(tokenId),
      wallet,
      email: String(email).trim().toLowerCase(),
      starId: starId || null,
      orderId: orderId || null,
      txHash,
    });
  } catch (e) {
    console.error("[OwnershipRecord] save failed:", e?.message || e);
  }
}

function getProvider() {
  return new ethers.JsonRpcProvider(CHAIN_RPC_URL);
}
function getReadContract(provider) {
  return new ethers.Contract(OWNERSHIP_CONTRACT_ADDRESS, ABI, provider);
}
function getOwnerSigner(provider) {
  if (!CHAIN_OWNER_PRIVATE_KEY) return null;
  try {
    return new ethers.Wallet(CHAIN_OWNER_PRIVATE_KEY, provider);
  } catch {
    return null;
  }
}
function getWriteContract(signer) {
  if (!signer) throw new Error("Missing signer (set CHAIN_OWNER_PRIVATE_KEY)");
  return new ethers.Contract(OWNERSHIP_CONTRACT_ADDRESS, ABI, signer);
}

export const OwnershipBlockchain = {
  async contractOwner() {
    const provider = getProvider();
    const c = getReadContract(provider);
    return await c.owner();
  },

  async currentTokenId() {
    const provider = getProvider();
    const c = getReadContract(provider);
    const id = await c.currentTokenId();
    return id?.toString?.() ?? String(id);
  },

  async ownerOf(tokenId) {
    const provider = getProvider();
    const c = getReadContract(provider);
    const owner = await c.ownerOf(BigInt(tokenId));
    return owner;
  },

  async mintToEmail({ email, starId, orderId }) {
    const provider = getProvider();
    const signer = getOwnerSigner(provider);
    if (!signer) throw new Error("CHAIN_OWNER_PRIVATE_KEY not configured");
    try {
      const read = getReadContract(provider);
      const contractOwner = (await read.owner()).toLowerCase();
      if (signer.address.toLowerCase() !== contractOwner) {
        console.warn(
          `[ownership.service] Signer ${signer.address} is not the on-chain owner ${contractOwner}. ` +
          `Mint will revert unless ownership matches.`
        );
      }
    } catch (e) {
      console.warn("[ownership.service] owner() check skipped:", e?.message || e);
    }

    const contract = getWriteContract(signer);
    const user = await getOrCreateWallet(email);

    const tx = await contract.mint(user.address);
    const rcpt = await tx.wait();
    const tokenId = await contract.currentTokenId();

    const txHash = rcpt.hash || rcpt.transactionHash;
    recordMint({
      tokenId,
      email: user.email,
      wallet: user.address,
      starId,
      orderId,
      txHash,
    });
    saveOwnershipRecordDb({
      tokenId,
      email: user.email,
      wallet: user.address,
      starId,
      orderId,
      txHash,
    }).catch(() => {});

    return { tokenId: String(tokenId), txHash, to: user.address };
  },

  async getStarsByEmail(email) {
    return getRecordsByEmail(email);
  },
};

export default OwnershipBlockchain;
