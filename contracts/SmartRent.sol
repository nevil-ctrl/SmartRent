// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./ListingRegistry.sol";
import "./RentalEscrow.sol";
import "./Arbitration.sol";
import "./SubscriptionManager.sol";
import "./Reputation.sol";

/**
 * @title SmartRent
 * @dev Main contract that integrates all SmartRent functionality
 * @notice Central hub for property rental platform on Polygon
 */
contract SmartRent is AccessControl, ReentrancyGuard, Pausable {
    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ARBITRATOR_ROLE = keccak256("ARBITRATOR_ROLE");

    // Contract addresses
    ListingRegistry public listingRegistry;
    RentalEscrow public rentalEscrow;
    Arbitration public arbitration;
    SubscriptionManager public subscriptionManager;
    Reputation public reputation;

    // Platform statistics
    uint256 public totalListings;
    uint256 public totalRentals;
    uint256 public totalDisputes;
    uint256 public totalVolume; // Total volume in wei

    // Events
    event PlatformInitialized(
        address listingRegistry,
        address rentalEscrow,
        address arbitration,
        address subscriptionManager,
        address reputation
    );
    
    event StatisticsUpdated(
        uint256 totalListings,
        uint256 totalRentals,
        uint256 totalDisputes,
        uint256 totalVolume
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Initialize platform with all contract addresses
     * @param _listingRegistry Address of ListingRegistry contract
     * @param _rentalEscrow Address of RentalEscrow contract
     * @param _arbitration Address of Arbitration contract
     * @param _subscriptionManager Address of SubscriptionManager contract
     * @param _reputation Address of Reputation contract
     */
    function initializePlatform(
        address _listingRegistry,
        address payable _rentalEscrow,
        address _arbitration,
        address payable _subscriptionManager,
        address _reputation
    ) external onlyRole(ADMIN_ROLE) {
        require(_listingRegistry != address(0), "Invalid listing registry address");
        require(_rentalEscrow != address(0), "Invalid rental escrow address");
        require(_arbitration != address(0), "Invalid arbitration address");
        require(_subscriptionManager != address(0), "Invalid subscription manager address");
        require(_reputation != address(0), "Invalid reputation address");

        listingRegistry = ListingRegistry(_listingRegistry);
        rentalEscrow = RentalEscrow(_rentalEscrow);
        arbitration = Arbitration(_arbitration);
        subscriptionManager = SubscriptionManager(_subscriptionManager);
        reputation = Reputation(_reputation);

        emit PlatformInitialized(
            _listingRegistry,
            _rentalEscrow,
            _arbitration,
            _subscriptionManager,
            _reputation
        );
    }

    /**
     * @dev Create a property listing
     * @param title Property title
     * @param description Property description
     * @param pricePerDay Daily rental price in wei
     * @param deposit Security deposit in wei
     * @param ipfsHash IPFS hash containing property images and metadata
     */
    function createListing(
        string memory title,
        string memory description,
        uint256 pricePerDay,
        uint256 deposit,
        string memory ipfsHash
    ) external whenNotPaused {
        listingRegistry.createListing(msg.sender, title, description, pricePerDay, deposit, ipfsHash);
        totalListings++;
        _updateStatistics();
        
        emit ListingCreated(totalListings - 1, msg.sender, title, pricePerDay, deposit, ipfsHash);
    }
    
    // Event for listing creation
    event ListingCreated(
        uint256 indexed listingId,
        address indexed landlord,
        string title,
        uint256 pricePerDay,
        uint256 deposit,
        string ipfsHash
    );

    /**
     * @dev Create a rental agreement
     * @param listingId ID of the property listing
     * @param landlord Address of the landlord
     * @param deposit Security deposit amount
     * @param totalRent Total rent amount
     * @param startDate Rental start date (timestamp)
     * @param endDate Rental end date (timestamp)
     */
    function createRental(
        uint256 listingId,
        address landlord,
        uint256 deposit,
        uint256 totalRent,
        uint256 startDate,
        uint256 endDate
    ) external whenNotPaused {
        rentalEscrow.createRental(listingId, landlord, deposit, totalRent, startDate, endDate);
        totalRentals++;
        totalVolume += deposit + totalRent;
        _updateStatistics();
    }

    /**
     * @dev Make deposit for rental (MATIC)
     * @param rentalId ID of the rental
     */
    function makeDeposit(uint256 rentalId) external payable whenNotPaused {
        rentalEscrow.makeDeposit{value: msg.value}(rentalId);
    }

    /**
     * @dev Make deposit using ERC20 token
     * @param rentalId ID of the rental
     * @param token ERC20 token address
     */
    function makeDepositWithToken(uint256 rentalId, address token) external whenNotPaused {
        rentalEscrow.makeDepositWithToken(rentalId, token);
    }

    /**
     * @dev Sign rental contract
     * @param rentalId ID of the rental
     * @param contractIpfsHash IPFS hash of the signed PDF contract
     */
    function signContract(uint256 rentalId, string memory contractIpfsHash) external {
        rentalEscrow.signContract(rentalId, contractIpfsHash);
    }

    /**
     * @dev Agree to return deposit
     * @param rentalId ID of the rental
     */
    function agreeReturn(uint256 rentalId) external {
        rentalEscrow.agreeReturn(rentalId);
    }

    /**
     * @dev Open a dispute
     * @param rentalId ID of the rental
     * @param reason Reason for dispute
     * @param disputeIpfsHash IPFS hash with dispute evidence
     */
    function openDispute(
        uint256 rentalId,
        string memory reason,
        string memory disputeIpfsHash
    ) external {
        rentalEscrow.openDispute(rentalId, reason, disputeIpfsHash);
        arbitration.createDispute(rentalId, reason, disputeIpfsHash);
        totalDisputes++;
        _updateStatistics();
    }

    /**
     * @dev Create a Pro subscription
     * @param plan Subscription plan
     * @param duration Duration in months
     * @param autoRenew Whether to auto-renew
     */
    function createSubscription(
        SubscriptionManager.SubscriptionPlan plan,
        uint256 duration,
        bool autoRenew
    ) external payable whenNotPaused {
        subscriptionManager.createSubscription{value: msg.value}(plan, duration, autoRenew);
    }

    /**
     * @dev Create a review
     * @param reviewee Address of the user being reviewed
     * @param rating Rating (1-5)
     * @param reviewText Review text
     * @param ipfsHash IPFS hash for additional evidence
     * @param rentalId ID of the rental
     * @param reviewType Type of review
     */
    function createReview(
        address reviewee,
        uint256 rating,
        string memory reviewText,
        string memory ipfsHash,
        uint256 rentalId,
        Reputation.ReviewType reviewType
    ) external whenNotPaused {
        reputation.createReview(reviewee, rating, reviewText, ipfsHash, rentalId, reviewType);
    }

    /**
     * @dev Get platform statistics
     * @return totalListings Total number of listings
     * @return totalRentals Total number of rentals
     * @return totalDisputes Total number of disputes
     * @return totalVolume Total volume in wei
     */
    function getPlatformStatistics() external view returns (
        uint256,
        uint256,
        uint256,
        uint256
    ) {
        return (totalListings, totalRentals, totalDisputes, totalVolume);
    }

    /**
     * @dev Get user's rental history
     * @param user Address of the user
     * @return Array of rental IDs
     */
    function getUserRentalHistory(address user) external view returns (uint256[] memory) {
        return rentalEscrow.getTenantRentals(user);
    }

    /**
     * @dev Get user's listing history
     * @param user Address of the user
     * @return Array of listing IDs
     */
    function getUserListingHistory(address user) external view returns (uint256[] memory) {
        return listingRegistry.getLandlordListings(user);
    }

    /**
     * @dev Check if user has premium features
     * @param user Address of the user
     * @param feature Feature bit
     * @return Whether user has the feature
     */
    function hasPremiumFeature(address user, uint256 feature) external view returns (bool) {
        return subscriptionManager.hasFeature(user, feature);
    }

    /**
     * @dev Get user reputation
     * @param user Address of the user
     * @return UserReputation struct
     */
    function getUserReputation(address user) external view returns (Reputation.UserReputation memory) {
        return reputation.getUserReputation(user);
    }

    /**
     * @dev Get listing details
     * @param listingId ID of the listing
     * @return PropertyListing struct
     */
    function getListing(uint256 listingId) external view returns (ListingRegistry.PropertyListing memory) {
        return listingRegistry.getListing(listingId);
    }

    /**
     * @dev Get total number of listings
     * @return Total count of listings
     */
    function getTotalListings() external view returns (uint256) {
        return listingRegistry.getTotalListings();
    }

    /**
     * @dev Get rental details
     * @param rentalId ID of the rental
     * @return Rental struct
     */
    function getRental(uint256 rentalId) external view returns (RentalEscrow.Rental memory) {
        return rentalEscrow.getRental(rentalId);
    }

    /**
     * @dev Update platform statistics
     */
    function _updateStatistics() internal {
        emit StatisticsUpdated(totalListings, totalRentals, totalDisputes, totalVolume);
    }

    /**
     * @dev Pause platform (emergency only)
     */
    function pausePlatform() external onlyRole(ADMIN_ROLE) {
        _pause();
        // Pause individual contracts if they have pause functionality
        // listingRegistry.pause(); // ListingRegistry doesn't have pause
        rentalEscrow.pause();
        arbitration.pause();
        subscriptionManager.pause();
        reputation.pause();
    }

    /**
     * @dev Unpause platform
     */
    function unpausePlatform() external onlyRole(ADMIN_ROLE) {
        _unpause();
        // Unpause individual contracts if they have pause functionality
        // listingRegistry.unpause(); // ListingRegistry doesn't have pause
        rentalEscrow.unpause();
        arbitration.unpause();
        subscriptionManager.unpause();
        reputation.unpause();
    }

    /**
     * @dev Get contract balance
     * @return Contract ETH balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Withdraw platform fees (admin only)
     * @param amount Amount to withdraw
     */
    function withdrawFees(uint256 amount) external onlyRole(ADMIN_ROLE) {
        require(amount <= address(this).balance, "Insufficient balance");
        payable(msg.sender).transfer(amount);
    }

    // Fallback function to receive ETH
    receive() external payable {}
}
