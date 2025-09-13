const hre = require("hardhat");
const { loadAddress, FILE } = require("./_deployPath");

async function main() {
  let contractAddress = process.env.CONTRACT;
  if (!contractAddress) {
    try { contractAddress = loadAddress(); } catch {}
  }
  if (!contractAddress) {
    throw new Error(`Contract address not provided. Set CONTRACT env, or deploy to create ${FILE}`);
  }

  const token = await hre.ethers.getContractAt("OwnershipToken", contractAddress);
  const owner = await token.owner();
  console.log("Contract owner:", owner);
}

main().catch((e) => { console.error(e); process.exit(1); });

