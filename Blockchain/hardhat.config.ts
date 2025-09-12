import { defineConfig } from "hardhat/config";
import toolbox from "@nomicfoundation/hardhat-toolbox-viem";
import verify from "@nomicfoundation/hardhat-verify";
import "dotenv/config";

const { DEPLOYER_PK, RPC_BASE_SEPOLIA, ETHERSCAN_API_KEY } = process.env as Record<string, string | undefined>;

const accounts = DEPLOYER_PK && DEPLOYER_PK.length > 0
  ? [DEPLOYER_PK.startsWith("0x") ? DEPLOYER_PK : `0x${DEPLOYER_PK}`]
  : [];

export default defineConfig({
  solidity: { version: "0.8.24", settings: { optimizer: { enabled: true, runs: 200 } } },
  plugins: [toolbox, verify],
  networks: {
    localhost: { chainId: 31337 },
    baseSepolia: {
      url: RPC_BASE_SEPOLIA || "https://sepolia.base.org",
      accounts,
      chainId: 84532,
    },
  },
  verify: { etherscan: { apiKey: ETHERSCAN_API_KEY || "" } },
});

