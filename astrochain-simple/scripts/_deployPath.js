const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "deployments.local.json");

function saveAddress(address) {
  const data = readJsonSafe();
  const next = { ...data, OwnershipToken: address };
  fs.writeFileSync(FILE, JSON.stringify(next, null, 2));
  console.log("Saved address to", FILE);
}

function saveOwnership(owner) {
  const data = readJsonSafe();
  const next = { ...data, owner };
  fs.writeFileSync(FILE, JSON.stringify(next, null, 2));
  console.log("Saved owner to", FILE);
}

function loadAddress() {
  const raw = fs.readFileSync(FILE, "utf-8");
  return JSON.parse(raw).OwnershipToken;
}

function loadOwner() {
  const raw = fs.readFileSync(FILE, "utf-8");
  return JSON.parse(raw).owner;
}

function readJsonSafe() {
  try {
    const raw = fs.readFileSync(FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

module.exports = { saveAddress, saveOwnership, loadAddress, loadOwner, FILE };
