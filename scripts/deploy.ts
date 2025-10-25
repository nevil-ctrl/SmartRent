import hre from "hardhat";
// Use hre.ethers to avoid ESM/CommonJS named-import issues
const { ethers } = hre;
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("Starting SmartRent deployment...");

  // Get the contract factory
  const SmartRent = await ethers.getContractFactory("SmartRent");
  const ListingRegistry = await ethers.getContractFactory("ListingRegistry");
  const RentalEscrow = await ethers.getContractFactory("RentalEscrow");
  const Arbitration = await ethers.getContractFactory("Arbitration");
  const SubscriptionManager = await ethers.getContractFactory("SubscriptionManager");
  const Reputation = await ethers.getContractFactory("Reputation");

  // Deploy contracts
  console.log("Deploying ListingRegistry...");
  const listingRegistry = await ListingRegistry.deploy();
  await listingRegistry.waitForDeployment();
  const listingRegistryAddress = await listingRegistry.getAddress();
  console.log("ListingRegistry deployed to:", listingRegistryAddress);

  console.log("Deploying RentalEscrow...");
  const rentalEscrow = await RentalEscrow.deploy();
  await rentalEscrow.waitForDeployment();
  const rentalEscrowAddress = await rentalEscrow.getAddress();
  console.log("RentalEscrow deployed to:", rentalEscrowAddress);

  console.log("Deploying Arbitration...");
  const arbitration = await Arbitration.deploy();
  await arbitration.waitForDeployment();
  const arbitrationAddress = await arbitration.getAddress();
  console.log("Arbitration deployed to:", arbitrationAddress);

  console.log("Deploying SubscriptionManager...");
  const subscriptionManager = await SubscriptionManager.deploy();
  await subscriptionManager.waitForDeployment();
  const subscriptionManagerAddress = await subscriptionManager.getAddress();
  console.log("SubscriptionManager deployed to:", subscriptionManagerAddress);

  console.log("Deploying Reputation...");
  const reputation = await Reputation.deploy();
  await reputation.waitForDeployment();
  const reputationAddress = await reputation.getAddress();
  console.log("Reputation deployed to:", reputationAddress);

  console.log("Deploying SmartRent main contract...");
  const smartRent = await SmartRent.deploy();
  await smartRent.waitForDeployment();
  const smartRentAddress = await smartRent.getAddress();
  console.log("SmartRent deployed to:", smartRentAddress);

  // Initialize the main contract
  console.log("Initializing SmartRent platform...");
  await smartRent.initializePlatform(
    listingRegistryAddress,
    rentalEscrowAddress,
    arbitrationAddress,
    subscriptionManagerAddress,
    reputationAddress
  );
  console.log("SmartRent platform initialized!");

  // Grant roles
  console.log("Setting up roles...");
  const [deployer] = await ethers.getSigners();
  
  // Grant arbitrator role to deployer for testing
  await arbitration.grantRole(await arbitration.ARBITRATOR_ROLE(), deployer.address);
  console.log("Arbitrator role granted to deployer");

  // Save deployment info
  const networkInfo = await ethers.provider.getNetwork();
  const deploymentInfo = {
    network: networkInfo.name || "unknown",
    chainId: networkInfo.chainId,
    deployer: deployer.address,
    contracts: {
      SmartRent: smartRentAddress,
      ListingRegistry: listingRegistryAddress,
      RentalEscrow: rentalEscrowAddress,
      Arbitration: arbitrationAddress,
      SubscriptionManager: subscriptionManagerAddress,
      Reputation: reputationAddress
    },
    timestamp: new Date().toISOString(),
    gasUsed: {
      ListingRegistry: "N/A",
      RentalEscrow: "N/A",
      Arbitration: "N/A",
      SubscriptionManager: "N/A",
      Reputation: "N/A",
      SmartRent: "N/A"
    }
  };

  // Save to file
  const artifactsDir = path.join(__dirname, "../artifacts");
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  const deploymentFile = path.join(artifactsDir, "deployment.json");
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("Deployment info saved to:", deploymentFile);

  // Verify contracts on PolygonScan (if on mainnet/testnet)
  const network = await ethers.provider.getNetwork();
  const chainIdNumber = Number(network.chainId);
  if (chainIdNumber === 137 || chainIdNumber === 80001) {
    console.log("\nWaiting for block confirmations before verification...");
    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds

    console.log("Verifying contracts on PolygonScan...");
    try {
      await hre.run("verify:verify", {
        address: listingRegistryAddress,
        constructorArguments: [],
      });
      console.log("ListingRegistry verified");
    } catch (error) {
      console.log("ListingRegistry verification failed:", error);
    }

    try {
      await hre.run("verify:verify", {
        address: rentalEscrowAddress,
        constructorArguments: [],
      });
      console.log("RentalEscrow verified");
    } catch (error) {
      console.log("RentalEscrow verification failed:", error);
    }

    try {
      await hre.run("verify:verify", {
        address: arbitrationAddress,
        constructorArguments: [],
      });
      console.log("Arbitration verified");
    } catch (error) {
      console.log("Arbitration verification failed:", error);
    }

    try {
      await hre.run("verify:verify", {
        address: subscriptionManagerAddress,
        constructorArguments: [],
      });
      console.log("SubscriptionManager verified");
    } catch (error) {
      console.log("SubscriptionManager verification failed:", error);
    }

    try {
      await hre.run("verify:verify", {
        address: reputationAddress,
        constructorArguments: [],
      });
      console.log("Reputation verified");
    } catch (error) {
      console.log("Reputation verification failed:", error);
    }

    try {
      await hre.run("verify:verify", {
        address: smartRentAddress,
        constructorArguments: [],
      });
      console.log("SmartRent verified");
    } catch (error) {
      console.log("SmartRent verification failed:", error);
    }
  }

  console.log("\n🎉 SmartRent deployment completed successfully!");
  console.log("\nContract Addresses:");
  console.log("==================");
  console.log("SmartRent:", smartRentAddress);
  console.log("ListingRegistry:", listingRegistryAddress);
  console.log("RentalEscrow:", rentalEscrowAddress);
  console.log("Arbitration:", arbitrationAddress);
  console.log("SubscriptionManager:", subscriptionManagerAddress);
  console.log("Reputation:", reputationAddress);
  
  console.log("\nNext steps:");
  console.log("1. Update frontend with contract addresses");
  console.log("2. Configure IPFS gateway");
  console.log("3. Test the platform functionality");
  console.log("4. Add initial arbitrators");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
