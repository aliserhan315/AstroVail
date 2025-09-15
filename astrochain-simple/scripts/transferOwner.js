const hre = require("hardhat");
const { loadAddress, FILE } = require("./_deployPath");

async function main() {
  
  const args = process.argv.slice(2);
  const dash = args.indexOf("--");
  const [newOwner] = (dash === -1 ? args : args.slice(dash + 1));
  if (!newOwner) throw new Error("Usage: npx hardhat run scripts/transferOwner.js -- <newOwner>");

  let contractAddress = process.env.CONTRACT;
  if (!contractAddress) {
    try { contractAddress = loadAddress(); } catch {}
  }
  if (!contractAddress) {
    throw new Error(`Contract address not provided. Set CONTRACT env, or deploy to create ${FILE}`);
  }

  const token = await hre.ethers.getContractAt("OwnershipToken", contractAddress);
  const currentOwner = await token.owner();
  const signers = await hre.ethers.getSigners();
  const ownerSigner = signers.find(s => s.address.toLowerCase() === currentOwner.toLowerCase());
  if (!ownerSigner) throw new Error(`Owner signer ${currentOwner} not available on this network`);

  const tokenAsOwner = token.connect(ownerSigner);
  const tx = await tokenAsOwner.transferOwnership(newOwner);
  const rcpt = await tx.wait();
  console.log("Transferred ownership to:", newOwner, "tx:", rcpt.hash || rcpt.transactionHash);
}

main().catch((e) => { console.error(e); process.exit(1); });

