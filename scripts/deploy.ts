import { ethers } from "hardhat";
import { BigNumber } from "ethers";

async function main() {
  console.log("\n🚀 Deploying AegisCare smart contract...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  // Get balance
  const balance = await deployer.getBalance();
  console.log("💰 Account balance:", ethers.utils.formatEther(balance), "ETH\n");

  if (balance.eq(0)) {
    console.error("❌ Deployer account has no ETH! Please fund the account.");
    return;
  }

  console.log("⏳ Compiling and deploying contract...");
  console.log("─".repeat(60));

  // Deploy the contract
  const AegisCare = await ethers.getContractFactory("AegisCare");
  const aegisCare = await AegisCare.deploy();

  await aegisCare.deployed();

  console.log("✅ AegisCare deployed successfully!");
  console.log("📍 Contract address:", aegisCare.address);
  console.log("─".repeat(60));

  // Wait for a few block confirmations
  console.log("\n⏳ Waiting for block confirmations...");
  const deploymentTx = aegisCare.deployTransaction;
  const receipt = await deploymentTx.wait();

  console.log("✅ Transaction confirmed!");
  console.log("📦 Block number:", receipt.blockNumber);
  console.log("⛽ Gas used:", receipt.gasUsed.toString());

  // Verify contract is working
  console.log("\n🔍 Verifying contract functionality...");
  const trialCount = await aegisCare.trialCount();
  const patientCount = await aegisCare.patientCount();

  console.log("✓ Initial trial count:", trialCount.toString());
  console.log("✓ Initial patient count:", patientCount.toString());

  // Log deployment summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT SUCCESSFUL");
  console.log("=".repeat(60));
  console.log("\n📋 Deployment Summary:");
  console.log("─────────────────────────────────────────────────────────────");
  console.log("Contract Address:  ", aegisCare.address);
  console.log("Deployer Address:   ", deployer.address);
  console.log("Network:           ", hre.network.name);
  console.log("Transaction Hash:  ", deploymentTx.hash);
  console.log("Block Number:      ", receipt.blockNumber);
  console.log("Gas Used:          ", receipt.gasUsed.toString());
  console.log("─────────────────────────────────────────────────────────────\n");

  // Save deployment info to file
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: aegisCare.address,
    deployerAddress: deployer.address,
    transactionHash: deploymentTx.hash,
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed.toString(),
    timestamp: new Date().toISOString(),
  };

  const fs = require("fs");
  const path = require("path");
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  const deploymentFile = path.join(deploymentsDir, `${hre.network.name}.json`);

  // Create deployments directory if it doesn't exist
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("📄 Deployment info saved to:", deploymentFile);

  console.log("\n🔧 Next Steps:");
  console.log("─────────────────────────────────────────────────────────────");
  console.log("1. Update your .env.local file:");
  console.log(`   NEXT_PUBLIC_AEGISCARE_ADDRESS=${aegisCare.address}`);
  console.log("\n2. Verify contract (if on a network with explorer):");
  console.log(`   npx hardhat verify --network ${hre.network.name} ${aegisCare.address}`);
  console.log("\n3. Run tests:");
  console.log("   npm run test");
  console.log("─────────────────────────────────────────────────────────────\n");

  return aegisCare.address;
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed!");
    console.error(error);
    process.exit(1);
  });
