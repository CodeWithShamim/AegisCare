import hre from "hardhat";

async function main() {
  console.log("\n🚀 Deploying AegisCare smart contract...\n");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  // Get balance (ethers v6 API)
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  if (balance === BigInt(0)) {
    console.error("❌ Deployer account has no ETH! Please fund the account.");
    return;
  }

  console.log("⏳ Compiling and deploying contract...");
  console.log("─".repeat(60));

  // Deploy the contract
  const AegisCare = await hre.ethers.getContractFactory("AegisCare");
  const aegisCare = await AegisCare.deploy();

  await aegisCare.waitForDeployment();

  console.log("✅ AegisCare deployed successfully!");
  console.log("📍 Contract address:", await aegisCare.getAddress());
  console.log("─".repeat(60));

  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  const owner = await aegisCare.owner();
  console.log("✅ Contract owner:", owner);
  console.log("✅ Contract paused:", await aegisCare.paused());

  console.log("\n✨ Deployment complete!\n");
  console.log("📋 Next steps:");
  console.log("   1. Update .env.local with:");
  console.log(`      NEXT_PUBLIC_AEGISCARE_ADDRESS=${await aegisCare.getAddress()}`);
  console.log("   2. Restart your development server: npm run dev");
  console.log("   3. Test the contract: npm test\n");

  // Save deployment info
  const deploymentInfo = {
    network: (await hre.ethers.provider.getNetwork()).name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    contractAddress: await aegisCare.getAddress(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  console.log("📄 Deployment info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
