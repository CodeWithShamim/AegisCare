import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@typechain/hardhat";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

// Load environment variables
require("dotenv").config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Local fhEVM node (for development)
    hardhat: {
      chainId: 31337,
      // fhEVM requires specific configuration
      forking: {
        url: process.env.FHEVM_RPC_URL || "http://localhost:8545",
      },
    },
    // Zama fhEVM devnet
    fhevm_devnet: {
      url: process.env.FHEVM_RPC_URL || "http://localhost:8545",
      chainId: 31337,
      accounts: process.env.MNEMONIC
        ? {
            mnemonic: process.env.MNEMONIC,
          }
        : [],
    },
    // Zama fhEVM testnet (when available)
    fhevm_testnet: {
      url: process.env.FHEVM_TESTNET_URL || "",
      chainId: 1410,
      accounts: process.env.MNEMONIC
        ? {
            mnemonic: process.env.MNEMONIC,
          }
        : [],
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  // TypeChain configuration
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v5",
  },
  // Gas reporter
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    token: "ETH",
  },
  // Solidity coverage
  mocha: {
    timeout: 40000,
  },
};

export default config;
