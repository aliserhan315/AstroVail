import hre from "hardhat";

async function main() {
  const admin = process.env.ADMIN_ADDRESS;
  if (!admin) throw new Error("ADMIN_ADDRESS missing in env");

  const Factory = await hre.ethers.getContractFactory("StarOwnership");
  const contract = await Factory.deploy(admin);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("StarOwnership deployed:", address);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
