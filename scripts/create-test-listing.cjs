const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const { ethers } = hre;

  console.log("Creating test listing...");

  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);

  // Hardcoded contract address from deployment
  const smartRentAddress = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
  console.log("SmartRent address:", smartRentAddress);

  // Get SmartRent contract
  const SmartRent = await ethers.getContractFactory("SmartRent");
  const smartRent = SmartRent.attach(smartRentAddress);

  // Test listing data
  const testListings = [
    {
      title: "Современная квартира в центре",
      description: "Прекрасная 2-комнатная квартира с ремонтом. Полностью меблирована, есть вся бытовая техника. Рядом метро, магазины, парк.",
      pricePerDay: "0.5", // 0.5 MATIC per day
      deposit: "5.0", // 5 MATIC deposit
      ipfsHash: "QmExampleCentralApartment"
    },
    {
      title: "Уютная студия возле университета",
      description: "Небольшая студия в спокойном районе. Идеально для студентов и молодых специалистов. Парковка, рядом остановка общественного транспорта.",
      pricePerDay: "0.3",
      deposit: "3.0",
      ipfsHash: "QmExampleStudioUniversity"
    },
    {
      title: "Люкс-пентхаус с бассейном",
      description: "Эксклюзивный пентхаус с частным бассейном и панорамным видом на город. Круглосуточный консьерж, охрана, парковка. Идеально для особых событий.",
      pricePerDay: "2.0",
      deposit: "20.0",
      ipfsHash: "QmExampleLuxPenthouse"
    }
  ];

  console.log("\n📝 Creating listings...\n");

  for (let i = 0; i < testListings.length; i++) {
    const listing = testListings[i];
    
    try {
      console.log(`Creating listing ${i + 1}/${testListings.length}: "${listing.title}"`);
      
      const tx = await smartRent.createListing(
        listing.title,
        listing.description,
        ethers.parseEther(listing.pricePerDay),
        ethers.parseEther(listing.deposit),
        listing.ipfsHash
      );
      
      console.log(`⏳ Transaction sent: ${tx.hash}`);
      console.log("   Waiting for confirmation...");
      
      const receipt = await tx.wait();
      console.log(`✅ Listing ${i + 1} created! Block: ${receipt.blockNumber}`);
      console.log(`   Listing ID: ${i}`);
      console.log(`   Price: ${listing.pricePerDay} MATIC/day`);
      console.log(`   Deposit: ${listing.deposit} MATIC\n`);
    } catch (error) {
      console.error(`❌ Failed to create listing ${i + 1}:`, error.message);
    }
  }

  // Get platform statistics
  console.log("\n📊 Platform Statistics:");
  console.log("=".repeat(50));
  
  try {
    const stats = await smartRent.getPlatformStatistics();
    console.log(`Total Listings: ${stats[0]}`);
    console.log(`Total Rentals: ${stats[1]}`);
    console.log(`Total Disputes: ${stats[2]}`);
    console.log(`Total Volume: ${ethers.formatEther(stats[3])} MATIC`);
  } catch (error) {
    console.error("Failed to fetch statistics:", error.message);
  }

  console.log("\n" + "=".repeat(50));
  console.log("✅ Test listings created successfully!");
  console.log("=".repeat(50));
  console.log("\n📝 Next steps:");
  console.log("1. Open http://localhost:5173 in your browser");
  console.log("2. Connect MetaMask to Hardhat network");
  console.log("3. Import test account (private key from Hardhat logs)");
  console.log("4. Browse listings on the frontend");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Failed to create listings!");
    console.error(error);
    process.exit(1);
  });

