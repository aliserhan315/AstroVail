const hre = require("hardhat");

const { loadAddress, FILE } = require("./_deployPath");

async function main() {
  // Support both direct args and npm script style with -- separator
  const args = process.argv.slice(2);
  const dash = args.indexOf("--");
  const [tokenIdStr, maybeContract] = (dash === -1 ? args : args.slice(dash + 1));
  if (!tokenIdStr) throw new Error("Usage: npx hardhat run scripts/ownerOf.js [--network <net>] -- <tokenId> [contract]");

  let contractAddress = process.env.CONTRACT || maybeContract;
  if (!contractAddress) {
    try { contractAddress = loadAddress(); } catch {}
  }
  if (!contractAddress) {
    throw new Error(`Contract address not provided. Set CONTRACT env, pass as arg, or deploy to create ${FILE}`);
  }

  const tokenId = BigInt(tokenIdStr);
  const token = await hre.ethers.getContractAt("OwnershipToken", contractAddress);
  const owner = await token.ownerOf(tokenId);
  console.log(`ownerOf(${tokenId}) = ${owner}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
