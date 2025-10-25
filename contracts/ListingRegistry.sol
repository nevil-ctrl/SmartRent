// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./libraries/Counters.sol";

/**
 * @title ListingRegistry
 * @dev Manages property listings on the platform
 * @notice Stores property metadata, handles listing creation, updates, and queries
 */
contract ListingRegistry is AccessControl, ReentrancyGuard {
    using Counters for Counters.Counter;

    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ARBITRATOR_ROLE = keccak256("ARBITRATOR_ROLE");

    // State variables
    Counters.Counter private _listingIdCounter;
    
    // Platform fee (2% = 200 basis points)
    uint256 public constant PLATFORM_FEE_BPS = 200;
    uint256 public constant BASIS_POINTS = 10000;

    // Events
    event ListingCreated(
        uint256 indexed listingId,
        address indexed landlord,
        string title,
        uint256 pricePerDay,
        uint256 deposit,
        string ipfsHash
    );
    
    event ListingUpdated(
        uint256 indexed listingId,
        string title,
        uint256 pricePerDay,
        uint256 deposit,
        string ipfsHash
    );
    
    event ListingStatusChanged(
        uint256 indexed listingId,
        bool isActive
    );

    // Structs
    struct PropertyListing {
        uint256 listingId;
        address landlord;
        string title;
        string description;
        uint256 pricePerDay; // in wei
        uint256 deposit; // in wei
        bool isActive;
        string ipfsHash; // IPFS hash for property images and metadata
        uint256 createdAt;
        uint256 updatedAt;
    }

    // Mappings
    mapping(uint256 => PropertyListing) public listings;
    mapping(address => uint256[]) public landlordListings;
    mapping(string => bool) public usedIpfsHashes; // Prevent duplicate IPFS hashes

    // Modifiers
    modifier onlyLandlord(uint256 listingId) {
        require(
            listings[listingId].landlord == msg.sender,
            "Only landlord can perform this action"
        );
        _;
    }

    modifier listingExists(uint256 listingId) {
        require(listings[listingId].landlord != address(0), "Listing does not exist");
        _;
    }

    modifier validIpfsHash(string memory ipfsHash) {
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(!usedIpfsHashes[ipfsHash], "IPFS hash already used");
        _;
    }

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Create a new property listing
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
    ) external nonReentrant validIpfsHash(ipfsHash) {
        require(pricePerDay > 0, "Price must be greater than 0");
        require(deposit > 0, "Deposit must be greater than 0");
        require(bytes(title).length > 0, "Title cannot be empty");

        uint256 listingId = _listingIdCounter.current();
        _listingIdCounter.increment();

        PropertyListing memory newListing = PropertyListing({
            listingId: listingId,
            landlord: msg.sender,
            title: title,
            description: description,
            pricePerDay: pricePerDay,
            deposit: deposit,
            isActive: true,
            ipfsHash: ipfsHash,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        listings[listingId] = newListing;
        landlordListings[msg.sender].push(listingId);
        usedIpfsHashes[ipfsHash] = true;

        emit ListingCreated(listingId, msg.sender, title, pricePerDay, deposit, ipfsHash);
    }

    /**
     * @dev Update an existing listing (only landlord)
     * @param listingId ID of the listing to update
     * @param title New title
     * @param description New description
     * @param pricePerDay New daily price
     * @param deposit New deposit amount
     * @param ipfsHash New IPFS hash
     */
    function updateListing(
        uint256 listingId,
        string memory title,
        string memory description,
        uint256 pricePerDay,
        uint256 deposit,
        string memory ipfsHash
    ) external 
        nonReentrant 
        onlyLandlord(listingId) 
        listingExists(listingId) 
    {
        require(pricePerDay > 0, "Price must be greater than 0");
        require(deposit > 0, "Deposit must be greater than 0");
        require(bytes(title).length > 0, "Title cannot be empty");

        // If IPFS hash is different, check if it's not already used
        if (keccak256(bytes(listings[listingId].ipfsHash)) != keccak256(bytes(ipfsHash))) {
            require(!usedIpfsHashes[ipfsHash], "IPFS hash already used");
            usedIpfsHashes[listings[listingId].ipfsHash] = false; // Free old hash
            usedIpfsHashes[ipfsHash] = true; // Mark new hash as used
        }

        listings[listingId].title = title;
        listings[listingId].description = description;
        listings[listingId].pricePerDay = pricePerDay;
        listings[listingId].deposit = deposit;
        listings[listingId].ipfsHash = ipfsHash;
        listings[listingId].updatedAt = block.timestamp;

        emit ListingUpdated(listingId, title, pricePerDay, deposit, ipfsHash);
    }

    /**
     * @dev Toggle listing active status
     * @param listingId ID of the listing
     */
    function toggleListingStatus(uint256 listingId) 
        external 
        onlyLandlord(listingId) 
        listingExists(listingId) 
    {
        listings[listingId].isActive = !listings[listingId].isActive;
        emit ListingStatusChanged(listingId, listings[listingId].isActive);
    }

    /**
     * @dev Get listing details
     * @param listingId ID of the listing
     * @return PropertyListing struct
     */
    function getListing(uint256 listingId) 
        external 
        view 
        listingExists(listingId) 
        returns (PropertyListing memory) 
    {
        return listings[listingId];
    }

    /**
     * @dev Get all listings for a landlord
     * @param landlord Address of the landlord
     * @return Array of listing IDs
     */
    function getLandlordListings(address landlord) external view returns (uint256[] memory) {
        return landlordListings[landlord];
    }

    /**
     * @dev Get total number of listings
     * @return Total count
     */
    function getTotalListings() external view returns (uint256) {
        return _listingIdCounter.current();
    }

    /**
     * @dev Get active listings count
     * @return Active listings count
     */
    function getActiveListingsCount() external view returns (uint256) {
        uint256 total = _listingIdCounter.current();
        uint256 activeCount = 0;
        
        for (uint256 i = 0; i < total; i++) {
            if (listings[i].isActive) {
                activeCount++;
            }
        }
        
        return activeCount;
    }

    /**
     * @dev Calculate platform fee for a transaction
     * @param amount Transaction amount
     * @return Fee amount
     */
    function calculatePlatformFee(uint256 amount) external pure returns (uint256) {
        return (amount * PLATFORM_FEE_BPS) / BASIS_POINTS;
    }

    /**
     * @dev Emergency function to deactivate a listing (admin only)
     * @param listingId ID of the listing
     */
    function emergencyDeactivateListing(uint256 listingId) 
        external 
        onlyRole(ADMIN_ROLE) 
        listingExists(listingId) 
    {
        listings[listingId].isActive = false;
        emit ListingStatusChanged(listingId, false);
    }
}
