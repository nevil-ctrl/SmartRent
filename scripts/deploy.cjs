const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const { ethers, run } = hre;

  console.log("Starting SmartRent deployment...");

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "MATIC");

  // Get the contract factory
  console.log("\n📦 Getting contract factories...");
  const SmartRent = await ethers.getContractFactory("SmartRent");
  const ListingRegistry = await ethers.getContractFactory("ListingRegistry");
  const RentalEscrow = await ethers.getContractFactory("RentalEscrow");
  const Arbitration = await ethers.getContractFactory("Arbitration");
  const SubscriptionManager = await ethers.getContractFactory(
    "SubscriptionManager"
  );
  const Reputation = await ethers.getContractFactory("Reputation");

  // Deploy contracts
  console.log("\n🚀 Deploying ListingRegistry...");
  const listingRegistry = await ListingRegistry.deploy();
  await listingRegistry.waitForDeployment();
  const listingRegistryAddress = await listingRegistry.getAddress();
  console.log("✅ ListingRegistry deployed to:", listingRegistryAddress);

  console.log("\n🚀 Deploying RentalEscrow...");
  const rentalEscrow = await RentalEscrow.deploy();
  await rentalEscrow.waitForDeployment();
  const rentalEscrowAddress = await rentalEscrow.getAddress();
  console.log("✅ RentalEscrow deployed to:", rentalEscrowAddress);

  console.log("\n🚀 Deploying Arbitration...");
  const arbitration = await Arbitration.deploy();
  await arbitration.waitForDeployment();
  const arbitrationAddress = await arbitration.getAddress();
  console.log("✅ Arbitration deployed to:", arbitrationAddress);

  console.log("\n🚀 Deploying SubscriptionManager...");
  const subscriptionManager = await SubscriptionManager.deploy();
  await subscriptionManager.waitForDeployment();
  const subscriptionManagerAddress = await subscriptionManager.getAddress();
  console.log(
    "✅ SubscriptionManager deployed to:",
    subscriptionManagerAddress
  );

  console.log("\n🚀 Deploying Reputation...");
  const reputation = await Reputation.deploy();
  await reputation.waitForDeployment();
  const reputationAddress = await reputation.getAddress();
  console.log("✅ Reputation deployed to:", reputationAddress);

  console.log("\n🚀 Deploying SmartRent main contract...");
  const smartRent = await SmartRent.deploy();
  await smartRent.waitForDeployment();
  const smartRentAddress = await smartRent.getAddress();
  console.log("✅ SmartRent deployed to:", smartRentAddress);

  // Initialize the main contract
  console.log("\n⚙️  Initializing SmartRent platform...");
  const initTx = await smartRent.initializePlatform(
    listingRegistryAddress,
    rentalEscrowAddress,
    arbitrationAddress,
    subscriptionManagerAddress,
    reputationAddress
  );
  await initTx.wait();
  console.log("✅ SmartRent platform initialized!");

  // Grant roles
  console.log("\n🔐 Setting up roles...");

  // Grant arbitrator role to deployer for testing
  const grantRoleTx = await arbitration.grantRole(
    await arbitration.ARBITRATOR_ROLE(),
    deployer.address
  );
  await grantRoleTx.wait();
  console.log("✅ Arbitrator role granted to deployer");

  // Save deployment info
  const networkInfo = await ethers.provider.getNetwork();
  const deploymentInfo = {
    network: networkInfo.name || "unknown",
    chainId: Number(networkInfo.chainId),
    deployer: deployer.address,
    contracts: {
      SmartRent: smartRentAddress,
      ListingRegistry: listingRegistryAddress,
      RentalEscrow: rentalEscrowAddress,
      Arbitration: arbitrationAddress,
      SubscriptionManager: subscriptionManagerAddress,
      Reputation: reputationAddress,
    },
    timestamp: new Date().toISOString(),
  };

  // Save to file
  const artifactsDir = path.join(__dirname, "../artifacts");
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  const deploymentFile = path.join(artifactsDir, "deployment.json");
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n💾 Deployment info saved to:", deploymentFile);

  // Verify contracts on PolygonScan (if on mainnet/testnet)
  const chainIdNumber = Number(networkInfo.chainId);
  if (chainIdNumber === 137 || chainIdNumber === 80001) {
    console.log(
      "\n⏳ Waiting 30 seconds for block confirmations before verification..."
    );
    await new Promise((resolve) => setTimeout(resolve, 30000));

    console.log("\n🔍 Verifying contracts on PolygonScan...");

    const contractsToVerify = [
      { name: "ListingRegistry", address: listingRegistryAddress },
      { name: "RentalEscrow", address: rentalEscrowAddress },
      { name: "Arbitration", address: arbitrationAddress },
      { name: "SubscriptionManager", address: subscriptionManagerAddress },
      { name: "Reputation", address: reputationAddress },
      { name: "SmartRent", address: smartRentAddress },
    ];

    for (const contract of contractsToVerify) {
      try {
        console.log(`Verifying ${contract.name}...`);
        await run("verify:verify", {
          address: contract.address,
          constructorArguments: [],
        });
        console.log(`✅ ${contract.name} verified`);
      } catch (error) {
        console.log(`❌ ${contract.name} verification failed:`, error.message);
      }
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("🎉 SmartRent deployment completed successfully!");
  console.log("=".repeat(60));
  console.log("\n📋 Contract Addresses:");
  console.log("==================");
  console.log("SmartRent:           ", smartRentAddress);
  console.log("ListingRegistry:     ", listingRegistryAddress);
  console.log("RentalEscrow:        ", rentalEscrowAddress);
  console.log("Arbitration:         ", arbitrationAddress);
  console.log("SubscriptionManager: ", subscriptionManagerAddress);
  console.log("Reputation:          ", reputationAddress);

  console.log("\n📝 Next steps:");
  console.log("1. Update .env file:");
  console.log(`   VITE_SMARTRENT_ADDRESS=${smartRentAddress}`);
  console.log("\n2. Update src/hooks/useContracts.ts:");
  console.log(`   SmartRent: '${smartRentAddress}'`);
  console.log("\n3. Start the frontend:");
  console.log("   npm run dev");
  console.log("\n4. View on Polygonscan:");
  const scanUrl =
    chainIdNumber === 137
      ? `https://polygonscan.com/address/${smartRentAddress}`
      : `https://mumbai.polygonscan.com/address/${smartRentAddress}`;
  console.log(`   ${scanUrl}`);
  console.log("\n" + "=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed!");
    console.error(error);
    process.exit(1);
  });
