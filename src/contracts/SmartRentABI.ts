// Автоматически сгенерирован из artifacts/contracts/SmartRent.sol/SmartRent.json
// Чтобы обновить: скопируйте поле "abi" из файла выше

export const SmartRentABI = [
  "function createListing(string memory title, string memory description, uint256 pricePerDay, uint256 deposit, string memory ipfsHash) external",
  "function getTotalListings() external view returns (uint256)",
  "function getAllListings() external view returns (tuple(uint256 listingId, address landlord, string title, string description, uint256 pricePerDay, uint256 deposit, bool isActive, string ipfsHash, uint256 createdAt, uint256 updatedAt)[])",
  "function getUserListingHistory(address user) external view returns (uint256[] memory)",
  "function createRental(uint256 listingId, address landlord, uint256 deposit, uint256 totalRent, uint256 startDate, uint256 endDate) external",
  "function makeDeposit(uint256 rentalId) external payable",
  "function signContract(uint256 rentalId, string memory contractIpfsHash) external",
  "function agreeReturn(uint256 rentalId) external",
  "function openDispute(uint256 rentalId, string memory reason, string memory disputeIpfsHash) external",
  "function createSubscription(uint8 plan, uint256 duration, bool autoRenew) external payable",
  "function createReview(address reviewee, uint256 rating, string memory reviewText, string memory ipfsHash, uint256 rentalId, uint8 reviewType) external",
  "function getListing(uint256 listingId) external view returns (tuple(uint256 listingId, address landlord, string title, string description, uint256 pricePerDay, uint256 deposit, bool isActive, string ipfsHash, uint256 createdAt, uint256 updatedAt))",
  "function getRental(uint256 rentalId) external view returns (tuple(uint256 rentalId, uint256 listingId, address tenant, address landlord, uint256 deposit, uint256 totalRent, uint256 startDate, uint256 endDate, uint8 status, uint256 createdAt, uint256 updatedAt, string contractIpfsHash, bool tenantSigned, bool landlordSigned, address arbitrator, uint256 disputeOpenedAt, string disputeReason, string disputeIpfsHash))",
  "function getPlatformStatistics() external view returns (uint256, uint256, uint256, uint256)",
  "function hasPremiumFeature(address user, uint256 feature) external view returns (bool)",
  "function getUserReputation(address user) external view returns (tuple(address user, uint256 totalReviews, uint256 totalRatingSum, uint256 reputationScore, uint256 completedRentals, uint256 cancelledRentals, uint256 disputeCount, bool isVerified, uint256 lastUpdated))",
  "event StatisticsUpdated(uint256 totalListings, uint256 totalRentals, uint256 totalDisputes, uint256 totalVolume)",
  "event ListingCreated(uint256 indexed listingId, address indexed landlord, string title, uint256 pricePerDay, uint256 deposit, string ipfsHash)",
  "event RentalCreated(uint256 indexed rentalId, uint256 indexed listingId, address indexed tenant, address landlord, uint256 deposit, uint256 totalRent, uint256 startDate, uint256 endDate)",
  "event DepositMade(uint256 indexed rentalId, address indexed tenant, uint256 amount)",
  "event DisputeOpened(uint256 indexed rentalId, address indexed initiator, string reason, string ipfsHash)",
  "event SubscriptionCreated(uint256 indexed subscriptionId, address indexed subscriber, uint8 plan, uint256 duration, uint256 price, uint256 expiresAt)",
  "event ReviewCreated(uint256 indexed reviewId, address indexed reviewer, address indexed reviewee, uint256 rating, string review, string ipfsHash, uint256 rentalId)",
] as const;

// Для использования с ethers v6
export default SmartRentABI;
