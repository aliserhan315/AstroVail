import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from '../config.js';
const abiPath = new URL('../lib/abi/OwnershipToken.json', import.meta.url);
const abi = JSON.parse(fs.readFileSync(abiPath, 'utf-8'));

async function getEthers() {
  try {
    return await import('ethers');
  } catch (e) {
    throw new Error("Missing dependency 'ethers'. Run 'npm install' in Backend.");
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '..', '..', 'storage');
const walletsFile = path.join(dataDir, 'user-wallets.json');
const mintedFile = path.join(dataDir, 'minted-records.json');

function ensureDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')); } catch { return {}; }
}
function writeJson(file, obj) {
  fs.writeFileSync(file, JSON.stringify(obj, null, 2));
}

async function getProvider() {
  const { ethers } = await getEthers();
  return new ethers.JsonRpcProvider(config.chainRpcUrl);
}

async function getOwnerWallet(provider) {
  const { ethers } = await getEthers();
  if (!config.chainOwnerPrivateKey) return null;
  try { return new ethers.Wallet(config.chainOwnerPrivateKey, provider); } catch { return null; }
}

async function getContract(signerOrProvider) {
  const { ethers } = await getEthers();
  if (!config.ownershipContract) throw new Error('OWNERSHIP_CONTRACT_ADDRESS not set');
  return new ethers.Contract(config.ownershipContract, abi, signerOrProvider);
}

async function getOrCreateWallet(email) {
  const { ethers } = await getEthers();
  ensureDir();
  const db = readJson(walletsFile);
  const key = String(email).trim().toLowerCase();
  if (!key) throw new Error('email required');
  if (db[key]) return db[key];
  const wallet = ethers.Wallet.createRandom();
  db[key] = { email: key, address: wallet.address, privateKey: wallet.privateKey };
  writeJson(walletsFile, db);
  return db[key];
}

function recordMint({ tokenId, email, wallet, starId, orderId, txHash }) {
  ensureDir();
  const db = readJson(mintedFile);
  db.records = Array.isArray(db.records) ? db.records : [];
  db.records.push({ tokenId: String(tokenId), email, wallet, starId: starId ? String(starId) : null, orderId: orderId ? String(orderId) : null, txHash, createdAt: new Date().toISOString() });
  writeJson(mintedFile, db);
}

async function saveOwnershipRecordDb({ tokenId, email, wallet, starId, orderId, txHash }) {
  try {
    const { default: OwnershipRecord } = await import('../modules/ownership/ownership.model.js');
    await OwnershipRecord.create({
      tokenId: String(tokenId),
      wallet,
      email: String(email).trim().toLowerCase(),
      starId: starId || null,
      orderId: orderId || null,
      txHash,
    });
  } catch (e) {
    console.error('OwnershipRecord save failed:', e?.message || e);
  }
}

function getRecordsByEmail(email) {
  const db = readJson(mintedFile);
  const list = Array.isArray(db.records) ? db.records : [];
  const key = String(email).trim().toLowerCase();
  return list.filter(r => r.email === key);
}

export const OwnershipBlockchain = {
  async contractOwner() {
    const provider = await getProvider();
    const c = await getContract(provider);
    return await c.owner();
  },

  async currentTokenId() {
    const provider = await getProvider();
    const c = await getContract(provider);
    const id = await c.currentTokenId();
    return id?.toString?.() ?? String(id);
  },

  async mintToEmail({ email, starId, orderId }) {
    const provider = await getProvider();
    const ownerWallet = await getOwnerWallet(provider);
    if (!ownerWallet) throw new Error('CHAIN_OWNER_PRIVATE_KEY not configured');
    const contract = await getContract(ownerWallet);
    const user = await getOrCreateWallet(email);
    const tx = await contract.mint(user.address);
    const rcpt = await tx.wait();
    const tokenId = await contract.currentTokenId();
    recordMint({ tokenId, email: user.email, wallet: user.address, starId, orderId, txHash: rcpt.hash || rcpt.transactionHash });
    // Persist to DB as a non-blocking operation to keep current flow intact
    saveOwnershipRecordDb({ tokenId, email: user.email, wallet: user.address, starId, orderId, txHash: rcpt.hash || rcpt.transactionHash })
      .catch(() => {});
    return { tokenId: String(tokenId), txHash: rcpt.hash || rcpt.transactionHash, to: user.address };
  },

  async ownerOf(tokenId) {
    const provider = await getProvider();
    const c = await getContract(provider);
    const owner = await c.ownerOf(BigInt(tokenId));
    return owner;
  },

  async getStarsByEmail(email) {
    return getRecordsByEmail(email);
  }
};
