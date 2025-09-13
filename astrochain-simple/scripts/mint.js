const hre = require("hardhat");

const { loadAddress, FILE } = require("./_deployPath");

async function main() {
  // Support both direct args and npm script style with -- separator
  const args = process.argv.slice(2);
  const dash = args.indexOf("--");
  const [addr, maybeContract] = (dash === -1 ? args : args.slice(dash + 1));
  if (!addr) throw new Error("Usage: npx hardhat run scripts/mint.js [--network <net>] -- <recipient> [contract]");

  let contractAddress = process.env.CONTRACT || maybeContract;
  if (!contractAddress) {
    try { contractAddress = loadAddress(); } catch {}
  }
  if (!contractAddress) {
    throw new Error(`Contract address not provided. Set CONTRACT env, pass as arg, or deploy to create ${FILE}`);
  }

  const token = await hre.ethers.getContractAt("OwnershipToken", contractAddress);
  // Ensure we mint from the actual contract owner signer
  const onChainOwner = await token.owner();
  const signers = await hre.ethers.getSigners();
  const ownerSigner = signers.find(s => s.address.toLowerCase() === onChainOwner.toLowerCase());
  const tokenAsOwner = ownerSigner ? token.connect(ownerSigner) : token;

  const tx = await tokenAsOwner.mint(addr);
  const receipt = await tx.wait();
  console.log("Mint tx hash:", receipt.hash || receipt.transactionHash);

  const tokenId = await token.currentTokenId();
  console.log("Minted tokenId:", tokenId.toString());
}

main().catch((e) => { console.error(e); process.exit(1); });
