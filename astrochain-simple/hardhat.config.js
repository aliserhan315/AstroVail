require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

const { RPC_BASE_SEPOLIA, DEPLOYER_PK, ETHERSCAN_API_KEY } = process.env;

module.exports = {
  solidity: "0.8.24",
  networks: {
    hardhat: {},
    localhost: { url: "http://127.0.0.1:8545", chainId: 31337 },
    baseSepolia: {
      url: RPC_BASE_SEPOLIA,
      accounts: DEPLOYER_PK ? [DEPLOYER_PK] : [],
      chainId: 84532,
    },
  },
  etherscan: {
    apiKey: { baseSepolia: ETHERSCAN_API_KEY },
    customChains: [
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
    ],
  },
};
