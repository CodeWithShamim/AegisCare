import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-verify";
import "@fhevm/hardhat-plugin";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const MNEMONIC: string = process.env.MNEMONIC || "test test test test test test test test test test test junk";
const INFURA_API_KEY: string = process.env.INFURA_API_KEY || "";
const ETHERSCAN_API_KEY: string = process.env.ETHERSCAN_API_KEY || "";

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    currency: "USD",
    enabled: process.env.REPORT_GAS === "true",
    excludeContracts: [],
  },
  networks: {
    hardhat: {
      accounts: {
        mnemonic: MNEMONIC,
      },
      chainId: 31337,
    },
    anvil: {
      accounts: {
        mnemonic: MNEMONIC,
        path: "m/44'/60'/0'/0/",
        count: 10,
      },
      chainId: 31337,
      url: "http://localhost:8545",
    },
    sepolia: {
      accounts: {
        mnemonic: MNEMONIC,
        path: "m/44'/60'/0'/0/",
        count: 10,
      },
      chainId: 11155111,
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
    },
    // Zama FHEVM Sepolia Testnet (for FHE operations)
    // Using Alchemy Sepolia RPC (works with FHEVM)
    fhe_sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${INFURA_API_KEY}`,
      accounts: {
        mnemonic: MNEMONIC,
        path: "m/44'/60'/0'/0/",
        count: 10,
      },
      chainId: 11155111,
    },
    fhevm_devnet: {
      url: process.env.FHEVM_DEVNET_URL || "https://devnet.zama.ai/",
      accounts: {
        mnemonic: MNEMONIC,
      },
      chainId: 31337,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  solidity: {
    version: "0.8.27", // Updated for fhevm v0.10 compatibility
    settings: {
      metadata: {
        // Not including the metadata hash
        bytecodeHash: "none",
      },
      optimizer: {
        enabled: true,
        runs: 100, // Minimize contract size
      },
      viaIR: true, // Enable IR-based compilation for better optimization
      evmVersion: "cancun",
    },
  },
  typechain: {
    outDir: "types",
    target: "ethers-v6",
  },
};

export default config;
