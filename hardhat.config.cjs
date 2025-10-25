require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const normalizePrivateKey = (key) => {
  if (!key) return null;
  const stripped = key.startsWith("0x") ? key.slice(2) : key;
  return stripped.length === 64 ? "0x" + stripped : null;
};

const PRIVATE_KEY = normalizePrivateKey(process.env.PRIVATE_KEY);
const accounts = PRIVATE_KEY ? [PRIVATE_KEY] : [];

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    amoy: {
      url: process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology",
      accounts,
      chainId: 80002,
      gasPrice: 30000000000,
      timeout: 60000,
    },
    mumbai: {
      url: process.env.MUMBAI_RPC_URL || "https://rpc-amoy.polygon.technology",
      accounts,
      chainId: 80002,
      gasPrice: 30000000000,
      timeout: 60000,
    },
    polygon: {
      url: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
      accounts,
      chainId: 137,
      gasPrice: 50000000000,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: {
      polygon: process.env.POLYGONSCAN_API_KEY || "",
      polygonAmoy: process.env.POLYGONSCAN_API_KEY || "",
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || "",
    },
  },
};
