import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import * as dotenv from "dotenv";

dotenv.config();

const accounts = process.env.DEPLOYER_PK ? [process.env.DEPLOYER_PK] : [];

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  networks: {
    baseSepolia: {
      type: "http",
      url: process.env.RPC_BASE_SEPOLIA || "",
      accounts,
      chainId: 84532,
    },
    polygonAmoy: {
      type: "http",
      url: process.env.RPC_POLYGON_AMOY || "",
      accounts,
      chainId: 80002,
    },
  },
  etherscan: {
    apiKey: {
      baseSepolia: process.env.ETHERSCAN_API_KEY || "",
      polygonAmoy: process.env.POLYGONSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com",
        },
      },
    ],
  },
};

export default config;
