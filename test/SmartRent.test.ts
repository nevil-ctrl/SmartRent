import { expect } from "chai";
import { ethers } from "hardhat";
import { SmartRent, ListingRegistry, RentalEscrow, Arbitration, SubscriptionManager, Reputation } from "../typechain-types";

describe("SmartRent Platform", function () {
  let smartRent: SmartRent;
  let listingRegistry: ListingRegistry;
  let rentalEscrow: RentalEscrow;
  let arbitration: Arbitration;
  let subscriptionManager: SubscriptionManager;
  let reputation: Reputation;
  
  let owner: any;
  let landlord: any;
  let tenant: any;
  let arbitrator: any;

  beforeEach(async function () {
    [owner, landlord, tenant, arbitrator] = await ethers.getSigners();

    // Deploy contracts
    const ListingRegistryFactory = await ethers.getContractFactory("ListingRegistry");
    listingRegistry = await ListingRegistryFactory.deploy();
    await listingRegistry.waitForDeployment();

    const RentalEscrowFactory = await ethers.getContractFactory("RentalEscrow");
    rentalEscrow = await RentalEscrowFactory.deploy();
    await rentalEscrow.waitForDeployment();

    const ArbitrationFactory = await ethers.getContractFactory("Arbitration");
    arbitration = await ArbitrationFactory.deploy();
    await arbitration.waitForDeployment();

    const SubscriptionManagerFactory = await ethers.getContractFactory("SubscriptionManager");
    subscriptionManager = await SubscriptionManagerFactory.deploy();
    await subscriptionManager.waitForDeployment();

    const ReputationFactory = await ethers.getContractFactory("Reputation");
    reputation = await ReputationFactory.deploy();
    await reputation.waitForDeployment();

    const SmartRentFactory = await ethers.getContractFactory("SmartRent");
    smartRent = await SmartRentFactory.deploy();
    await smartRent.waitForDeployment();

    // Initialize platform
    await smartRent.initializePlatform(
      await listingRegistry.getAddress(),
      await rentalEscrow.getAddress(),
      await arbitration.getAddress(),
      await subscriptionManager.getAddress(),
      await reputation.getAddress()
    );

    // Grant arbitrator role
    await arbitration.grantRole(await arbitration.ARBITRATOR_ROLE(), arbitrator.address);
  });

  describe("Listing Management", function () {
    it("Should create a property listing", async function () {
      const title = "Beautiful Apartment";
      const description = "A modern apartment in the city center";
      const pricePerDay = ethers.parseEther("0.1");
      const deposit = ethers.parseEther("1.0");
      const ipfsHash = "QmTestHash123";

      await expect(
        smartRent.connect(landlord).createListing(
          title,
          description,
          pricePerDay,
          deposit,
          ipfsHash
        )
      ).to.emit(smartRent, "StatisticsUpdated");

      const listing = await smartRent.getListing(0);
      expect(listing.title).to.equal(title);
      expect(listing.landlord).to.equal(landlord.address);
      expect(listing.pricePerDay).to.equal(pricePerDay);
      expect(listing.deposit).to.equal(deposit);
    });

    it("Should not allow duplicate IPFS hashes", async function () {
      const ipfsHash = "QmDuplicateHash";
      
      await smartRent.connect(landlord).createListing(
        "First Listing",
        "Description",
        ethers.parseEther("0.1"),
        ethers.parseEther("1.0"),
        ipfsHash
      );

      await expect(
        smartRent.connect(tenant).createListing(
          "Second Listing",
          "Description",
          ethers.parseEther("0.2"),
          ethers.parseEther("2.0"),
          ipfsHash
        )
      ).to.be.revertedWith("IPFS hash already used");
    });
  });

  describe("Rental Management", function () {
    beforeEach(async function () {
      // Create a listing first
      await smartRent.connect(landlord).createListing(
        "Test Apartment",
        "A test apartment",
        ethers.parseEther("0.1"),
        ethers.parseEther("1.0"),
        "QmTestHash"
      );
    });

    it("Should create a rental agreement", async function () {
      const listingId = 0;
      const deposit = ethers.parseEther("1.0");
      const totalRent = ethers.parseEther("3.0");
      const startDate = Math.floor(Date.now() / 1000) + 86400; // Tomorrow
      const endDate = startDate + 2592000; // 30 days later

      await expect(
        smartRent.connect(tenant).createRental(
          listingId,
          landlord.address,
          deposit,
          totalRent,
          startDate,
          endDate
        )
      ).to.emit(smartRent, "StatisticsUpdated");

      const rental = await smartRent.getRental(0);
      expect(rental.tenant).to.equal(tenant.address);
      expect(rental.landlord).to.equal(landlord.address);
      expect(rental.deposit).to.equal(deposit);
      expect(rental.totalRent).to.equal(totalRent);
    });

    it("Should allow tenant to make deposit", async function () {
      // Create rental first
      await smartRent.connect(tenant).createRental(
        0,
        landlord.address,
        ethers.parseEther("1.0"),
        ethers.parseEther("3.0"),
        Math.floor(Date.now() / 1000) + 86400,
        Math.floor(Date.now() / 1000) + 86400 + 2592000
      );

      const depositAmount = ethers.parseEther("1.0");
      await expect(
        smartRent.connect(tenant).makeDeposit(0, { value: depositAmount })
      ).to.emit(rentalEscrow, "DepositMade");
    });

    it("Should allow contract signing", async function () {
      // Create rental and make deposit
      await smartRent.connect(tenant).createRental(
        0,
        landlord.address,
        ethers.parseEther("1.0"),
        ethers.parseEther("3.0"),
        Math.floor(Date.now() / 1000) + 86400,
        Math.floor(Date.now() / 1000) + 86400 + 2592000
      );

      await smartRent.connect(tenant).makeDeposit(0, { value: ethers.parseEther("1.0") });

      const contractHash = "QmContractHash123";
      await smartRent.connect(tenant).signContract(0, contractHash);
      await smartRent.connect(landlord).signContract(0, contractHash);

      const rental = await smartRent.getRental(0);
      void expect(rental.tenantSigned).to.be.true;
      void expect(rental.landlordSigned).to.be.true;
    });
  });

  describe("Dispute Resolution", function () {
    beforeEach(async function () {
      // Create listing and rental
      await smartRent.connect(landlord).createListing(
        "Test Apartment",
        "A test apartment",
        ethers.parseEther("0.1"),
        ethers.parseEther("1.0"),
        "QmTestHash"
      );

      await smartRent.connect(tenant).createRental(
        0,
        landlord.address,
        ethers.parseEther("1.0"),
        ethers.parseEther("3.0"),
        Math.floor(Date.now() / 1000) + 86400,
        Math.floor(Date.now() / 1000) + 86400 + 2592000
      );

      await smartRent.connect(tenant).makeDeposit(0, { value: ethers.parseEther("1.0") });
    });

    it("Should allow opening a dispute", async function () {
      const reason = "Property not as described";
      const evidenceHash = "QmEvidenceHash123";

      await expect(
        smartRent.connect(tenant).openDispute(0, reason, evidenceHash)
      ).to.emit(smartRent, "StatisticsUpdated");
    });
  });

  describe("Subscription Management", function () {
    it("Should create a Pro subscription", async function () {
      const plan = 1; // Pro plan
      const duration = 1; // 1 month
      const price = await subscriptionManager.calculatePrice(plan, duration);

      await expect(
        smartRent.connect(landlord).createSubscription(plan, duration, false, { value: price })
      ).to.emit(subscriptionManager, "SubscriptionCreated");
    });

    it("Should check premium features", async function () {
      // Create subscription
      const plan = 1; // Pro plan
      const duration = 1;
      const price = await subscriptionManager.calculatePrice(plan, duration);
      
      await smartRent.connect(landlord).createSubscription(plan, duration, false, { value: price });

      // Check if user has premium features
      const hasFeature = await smartRent.hasPremiumFeature(landlord.address, 1);
      void expect(hasFeature).to.be.true;
    });
  });

  describe("Reputation System", function () {
    beforeEach(async function () {
      // Create listing and rental
      await smartRent.connect(landlord).createListing(
        "Test Apartment",
        "A test apartment",
        ethers.parseEther("0.1"),
        ethers.parseEther("1.0"),
        "QmTestHash"
      );

      await smartRent.connect(tenant).createRental(
        0,
        landlord.address,
        ethers.parseEther("1.0"),
        ethers.parseEther("3.0"),
        Math.floor(Date.now() / 1000) + 86400,
        Math.floor(Date.now() / 1000) + 86400 + 2592000
      );
    });

    it("Should create a review", async function () {
      const rating = 5;
      const reviewText = "Great landlord, highly recommended!";
      const ipfsHash = "QmReviewHash123";
      const rentalId = 0;
      const reviewType = 0; // TenantToLandlord

      await expect(
        smartRent.connect(tenant).createReview(
          landlord.address,
          rating,
          reviewText,
          ipfsHash,
          rentalId,
          reviewType
        )
      ).to.emit(reputation, "ReviewCreated");

      const userReputation = await smartRent.getUserReputation(landlord.address);
      expect(userReputation.totalReviews).to.equal(1);
      expect(userReputation.reputationScore).to.equal(500); // 5.0 * 100
    });

    it("Should not allow self-review", async function () {
      await expect(
        smartRent.connect(landlord).createReview(
          landlord.address,
          5,
          "Great landlord!",
          "QmHash",
          0,
          0
        )
      ).to.be.revertedWith("Cannot review yourself");
    });
  });

  describe("Platform Statistics", function () {
    it("Should track platform statistics", async function () {
      const [totalListings, totalRentals, totalDisputes, totalVolume] = 
        await smartRent.getPlatformStatistics();
      
      expect(totalListings).to.equal(0);
      expect(totalRentals).to.equal(0);
      expect(totalDisputes).to.equal(0);
      expect(totalVolume).to.equal(0);
    });

    it("Should update statistics after operations", async function () {
      // Create listing
      await smartRent.connect(landlord).createListing(
        "Test Apartment",
        "A test apartment",
        ethers.parseEther("0.1"),
        ethers.parseEther("1.0"),
        "QmTestHash"
      );

      const [totalListings, totalRentals, , totalVolume] = 
        await smartRent.getPlatformStatistics();
      expect(totalListings).to.equal(1);

      // Create rental
      await smartRent.connect(tenant).createRental(
        0,
        landlord.address,
        ethers.parseEther("1.0"),
        ethers.parseEther("3.0"),
        Math.floor(Date.now() / 1000) + 86400,
        Math.floor(Date.now() / 1000) + 86400 + 2592000
      );

      [totalListings, totalRentals, , totalVolume] = 
        await smartRent.getPlatformStatistics();
      expect(totalListings).to.equal(1);
      expect(totalRentals).to.equal(1);
      expect(totalVolume).to.equal(ethers.parseEther("4.0")); // deposit + totalRent
    });
  });

  describe("Access Control", function () {
    it("Should only allow admin to pause platform", async function () {
      await expect(
        smartRent.connect(tenant).pausePlatform()
      ).to.be.revertedWith("AccessControl: account");
    });

    it("Should allow admin to pause platform", async function () {
      await expect(
        smartRent.connect(owner).pausePlatform()
      ).to.not.be.reverted;
    });
  });
});
