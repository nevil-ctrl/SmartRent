// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./libraries/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title RentalEscrow
 * @dev Manages rental deposits and payments with escrow functionality
 * @notice Handles deposit, payment, refund, and dispute resolution
 */
contract RentalEscrow is AccessControl, ReentrancyGuard, Pausable {
    using Counters for Counters.Counter;
    using SafeERC20 for IERC20;

    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ARBITRATOR_ROLE = keccak256("ARBITRATOR_ROLE");

    // State variables
    Counters.Counter private _rentalIdCounter;
    
    // Platform fee (2% = 200 basis points)
    uint256 public constant PLATFORM_FEE_BPS = 200;
    uint256 public constant BASIS_POINTS = 10000;
    
    // Dispute timeout (7 days)
    uint256 public constant DISPUTE_TIMEOUT = 7 days;

    // Events
    event RentalCreated(
        uint256 indexed rentalId,
        uint256 indexed listingId,
        address indexed tenant,
        address landlord,
        uint256 deposit,
        uint256 totalRent,
        uint256 startDate,
        uint256 endDate
    );
    
    event DepositMade(
        uint256 indexed rentalId,
        address indexed tenant,
        uint256 amount
    );
    
    event PaymentMade(
        uint256 indexed rentalId,
        address indexed tenant,
        uint256 amount
    );
    
    event RefundProcessed(
        uint256 indexed rentalId,
        address indexed recipient,
        uint256 amount
    );
    
    event DisputeOpened(
        uint256 indexed rentalId,
        address indexed initiator,
        string reason,
        string ipfsHash
    );
    
    event DisputeResolved(
        uint256 indexed rentalId,
        address indexed arbitrator,
        uint256 tenantRefund,
        uint256 landlordRefund,
        uint256 platformFee
    );

    // Structs
    enum RentalStatus {
        Pending,    // Deposit not yet made
        Active,     // Deposit made, rental active
        Completed,  // Rental completed, awaiting refund
        Disputed,   // Dispute opened
        Resolved    // Dispute resolved
    }

    struct Rental {
        uint256 rentalId;
        uint256 listingId;
        address tenant;
        address landlord;
        uint256 deposit;
        uint256 totalRent;
        uint256 startDate;
        uint256 endDate;
        RentalStatus status;
        uint256 createdAt;
        uint256 updatedAt;
        string contractIpfsHash; // PDF contract hash
        bool tenantSigned;
        bool landlordSigned;
        address arbitrator;
        uint256 disputeOpenedAt;
        string disputeReason;
        string disputeIpfsHash;
    }

    // Mappings
    mapping(uint256 => Rental) public rentals;
    mapping(address => uint256[]) public tenantRentals;
    mapping(address => uint256[]) public landlordRentals;
    mapping(address => uint256) public userDisputeCount;
    mapping(address => uint256) public lastDisputeTime;

    // Constants
    uint256 public constant MAX_DISPUTES_PER_USER = 3;
    uint256 public constant DISPUTE_COOLDOWN = 30 days;

    // Modifiers
    modifier onlyParticipant(uint256 rentalId) {
        require(
            rentals[rentalId].tenant == msg.sender || 
            rentals[rentalId].landlord == msg.sender,
            "Only rental participants can perform this action"
        );
        _;
    }

    modifier onlyArbitrator(uint256 rentalId) {
        require(
            hasRole(ARBITRATOR_ROLE, msg.sender) || 
            rentals[rentalId].arbitrator == msg.sender,
            "Only arbitrator can perform this action"
        );
        _;
    }

    modifier rentalExists(uint256 rentalId) {
        require(rentals[rentalId].tenant != address(0), "Rental does not exist");
        _;
    }

    modifier validRentalStatus(uint256 rentalId, RentalStatus expectedStatus) {
        require(rentals[rentalId].status == expectedStatus, "Invalid rental status");
        _;
    }

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Create a new rental agreement
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
        require(landlord != address(0), "Invalid landlord address");
        require(landlord != msg.sender, "Cannot rent from yourself");
        require(deposit > 0, "Deposit must be greater than 0");
        require(totalRent > 0, "Total rent must be greater than 0");
        require(startDate > block.timestamp, "Start date must be in the future");
        require(endDate > startDate, "End date must be after start date");

        uint256 rentalId = _rentalIdCounter.current();
        _rentalIdCounter.increment();

        Rental memory newRental = Rental({
            rentalId: rentalId,
            listingId: listingId,
            tenant: msg.sender,
            landlord: landlord,
            deposit: deposit,
            totalRent: totalRent,
            startDate: startDate,
            endDate: endDate,
            status: RentalStatus.Pending,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            contractIpfsHash: "",
            tenantSigned: false,
            landlordSigned: false,
            arbitrator: address(0),
            disputeOpenedAt: 0,
            disputeReason: "",
            disputeIpfsHash: ""
        });

        rentals[rentalId] = newRental;
        tenantRentals[msg.sender].push(rentalId);
        landlordRentals[landlord].push(rentalId);

        emit RentalCreated(rentalId, listingId, msg.sender, landlord, deposit, totalRent, startDate, endDate);
    }

    /**
     * @dev Make deposit for rental (MATIC)
     * @param rentalId ID of the rental
     */
    function makeDeposit(uint256 rentalId) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
        rentalExists(rentalId) 
        validRentalStatus(rentalId, RentalStatus.Pending) 
    {
        require(rentals[rentalId].tenant == msg.sender, "Only tenant can make deposit");
        require(msg.value >= rentals[rentalId].deposit, "Insufficient deposit amount");

        rentals[rentalId].status = RentalStatus.Active;
        rentals[rentalId].updatedAt = block.timestamp;

        emit DepositMade(rentalId, msg.sender, msg.value);
    }

    /**
     * @dev Make deposit using ERC20 token
     * @param rentalId ID of the rental
     * @param token ERC20 token address
     */
    function makeDepositWithToken(uint256 rentalId, address token) 
        external 
        nonReentrant 
        whenNotPaused 
        rentalExists(rentalId) 
        validRentalStatus(rentalId, RentalStatus.Pending) 
    {
        require(rentals[rentalId].tenant == msg.sender, "Only tenant can make deposit");
        
        IERC20 tokenContract = IERC20(token);
        uint256 depositAmount = rentals[rentalId].deposit;
        
        tokenContract.safeTransferFrom(msg.sender, address(this), depositAmount);
        
        rentals[rentalId].status = RentalStatus.Active;
        rentals[rentalId].updatedAt = block.timestamp;

        emit DepositMade(rentalId, msg.sender, depositAmount);
    }

    /**
     * @dev Sign rental contract
     * @param rentalId ID of the rental
     * @param contractIpfsHash IPFS hash of the signed PDF contract
     */
    function signContract(uint256 rentalId, string memory contractIpfsHash) 
        external 
        onlyParticipant(rentalId) 
        rentalExists(rentalId) 
    {
        require(bytes(contractIpfsHash).length > 0, "Contract hash cannot be empty");
        
        if (rentals[rentalId].tenant == msg.sender) {
            rentals[rentalId].tenantSigned = true;
        } else if (rentals[rentalId].landlord == msg.sender) {
            rentals[rentalId].landlordSigned = true;
        }
        
        if (bytes(rentals[rentalId].contractIpfsHash).length == 0) {
            rentals[rentalId].contractIpfsHash = contractIpfsHash;
        }
        
        rentals[rentalId].updatedAt = block.timestamp;
    }

    /**
     * @dev Agree to return deposit (both parties must agree)
     * @param rentalId ID of the rental
     */
    function agreeReturn(uint256 rentalId) 
        external 
        onlyParticipant(rentalId) 
        rentalExists(rentalId) 
        validRentalStatus(rentalId, RentalStatus.Active) 
    {
        require(
            rentals[rentalId].tenantSigned && rentals[rentalId].landlordSigned,
            "Both parties must sign the contract first"
        );
        require(block.timestamp >= rentals[rentalId].endDate, "Rental period not ended");

        rentals[rentalId].status = RentalStatus.Completed;
        rentals[rentalId].updatedAt = block.timestamp;

        // Process refund
        _processRefund(rentalId);
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
    ) external 
        onlyParticipant(rentalId) 
        rentalExists(rentalId) 
        validRentalStatus(rentalId, RentalStatus.Active) 
    {
        require(bytes(reason).length > 0, "Dispute reason cannot be empty");
        require(
            userDisputeCount[msg.sender] < MAX_DISPUTES_PER_USER,
            "Maximum disputes per user exceeded"
        );
        require(
            block.timestamp >= lastDisputeTime[msg.sender] + DISPUTE_COOLDOWN,
            "Dispute cooldown not met"
        );

        rentals[rentalId].status = RentalStatus.Disputed;
        rentals[rentalId].disputeOpenedAt = block.timestamp;
        rentals[rentalId].disputeReason = reason;
        rentals[rentalId].disputeIpfsHash = disputeIpfsHash;
        rentals[rentalId].updatedAt = block.timestamp;

        userDisputeCount[msg.sender]++;
        lastDisputeTime[msg.sender] = block.timestamp;

        emit DisputeOpened(rentalId, msg.sender, reason, disputeIpfsHash);
    }

    /**
     * @dev Resolve a dispute (arbitrator only)
     * @param rentalId ID of the rental
     * @param tenantRefund Amount to refund to tenant
     * @param landlordRefund Amount to refund to landlord
     * @param platformFee Platform fee amount
     */
    function resolveDispute(
        uint256 rentalId,
        uint256 tenantRefund,
        uint256 landlordRefund,
        uint256 platformFee
    ) external 
        onlyArbitrator(rentalId) 
        rentalExists(rentalId) 
        validRentalStatus(rentalId, RentalStatus.Disputed) 
    {
        require(
            tenantRefund + landlordRefund + platformFee <= rentals[rentalId].deposit,
            "Total refunds exceed deposit amount"
        );

        rentals[rentalId].status = RentalStatus.Resolved;
        rentals[rentalId].arbitrator = msg.sender;
        rentals[rentalId].updatedAt = block.timestamp;

        // Process refunds
        if (tenantRefund > 0) {
            payable(rentals[rentalId].tenant).transfer(tenantRefund);
        }
        if (landlordRefund > 0) {
            payable(rentals[rentalId].landlord).transfer(landlordRefund);
        }
        if (platformFee > 0) {
            // Transfer to contract owner (first admin)
            payable(address(this)).transfer(platformFee);
        }

        emit DisputeResolved(rentalId, msg.sender, tenantRefund, landlordRefund, platformFee);
    }

    /**
     * @dev Internal function to process refund
     * @param rentalId ID of the rental
     */
    function _processRefund(uint256 rentalId) internal {
        uint256 deposit = rentals[rentalId].deposit;
        uint256 platformFee = (deposit * PLATFORM_FEE_BPS) / BASIS_POINTS;
        uint256 refundAmount = deposit - platformFee;

        // Refund to tenant
        payable(rentals[rentalId].tenant).transfer(refundAmount);
        
        // Platform fee to contract
        if (platformFee > 0) {
            payable(address(this)).transfer(platformFee);
        }

        emit RefundProcessed(rentalId, rentals[rentalId].tenant, refundAmount);
    }

    /**
     * @dev Get rental details
     * @param rentalId ID of the rental
     * @return Rental struct
     */
    function getRental(uint256 rentalId) 
        external 
        view 
        rentalExists(rentalId) 
        returns (Rental memory) 
    {
        return rentals[rentalId];
    }

    /**
     * @dev Get tenant rentals
     * @param tenant Address of the tenant
     * @return Array of rental IDs
     */
    function getTenantRentals(address tenant) external view returns (uint256[] memory) {
        return tenantRentals[tenant];
    }

    /**
     * @dev Get landlord rentals
     * @param landlord Address of the landlord
     * @return Array of rental IDs
     */
    function getLandlordRentals(address landlord) external view returns (uint256[] memory) {
        return landlordRentals[landlord];
    }

    /**
     * @dev Pause contract (emergency only)
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause contract
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Get contract balance
     * @return Contract ETH balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // Fallback function to receive ETH
    receive() external payable {}
}
