const hre = require("hardhat");
const { saveAddress, saveOwnership } = require("./_deployPath");

async function main() {
  await hre.run("compile");

  const OwnershipToken = await hre.ethers.getContractFactory("OwnershipToken");
  const token = await OwnershipToken.deploy("AstroVail Ownership", "AVOWN");
  await token.waitForDeployment();

  const address = await token.getAddress();
  console.log("OwnershipToken deployed:", address);
  // save locally for convenience when running without args/env
  try { saveAddress(address); } catch {}

  const admin = process.env.ADMIN_ADDRESS;
  if (admin) {
    const tx = await token.transferOwnership(admin);
    await tx.wait();
    console.log("Ownership transferred to:", admin);
  }

  // Persist final owner regardless of transfer
  try {
    const currentOwner = await token.owner();
    saveOwnership(currentOwner);
    console.log("Current owner:", currentOwner);
  } catch {}
}

main().catch((e) => { console.error(e); process.exit(1); });
