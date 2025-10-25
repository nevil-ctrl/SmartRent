// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./libraries/Counters.sol";

/**
 * @title Arbitration
 * @dev Manages dispute resolution and arbitrator management
 * @notice Handles arbitrator registration, dispute assignment, and resolution tracking
 */
contract Arbitration is AccessControl, ReentrancyGuard, Pausable {
    using Counters for Counters.Counter;

    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ARBITRATOR_ROLE = keccak256("ARBITRATOR_ROLE");

    // State variables
    Counters.Counter private _disputeIdCounter;
    Counters.Counter private _arbitratorIdCounter;

    // Arbitration fees
    uint256 public constant ARBITRATOR_FEE_BPS = 100; // 1% of dispute amount
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant MIN_DISPUTE_AMOUNT = 0.01 ether; // Minimum dispute amount

    // Events
    event ArbitratorRegistered(
        uint256 indexed arbitratorId,
        address indexed arbitrator,
        string name,
        string description,
        uint256 fee
    );
    
    event ArbitratorRemoved(
        uint256 indexed arbitratorId,
        address indexed arbitrator
    );
    
    event DisputeAssigned(
        uint256 indexed disputeId,
        uint256 indexed rentalId,
        address indexed arbitrator,
        uint256 deadline
    );
    
    event DisputeResolved(
        uint256 indexed disputeId,
        address indexed arbitrator,
        bool resolved,
        string resolution
    );
    
    event ArbitratorRated(
        uint256 indexed arbitratorId,
        address indexed rater,
        uint256 rating,
        string feedback
    );

    // Structs
    enum DisputeStatus {
        Pending,    // Dispute created, awaiting arbitrator assignment
        Assigned,   // Arbitrator assigned
        InProgress, // Arbitrator reviewing
        Resolved,   // Dispute resolved
        Cancelled   // Dispute cancelled
    }

    struct Arbitrator {
        uint256 arbitratorId;
        address arbitrator;
        string name;
        string description;
        uint256 fee; // Fee in basis points
        uint256 totalDisputes;
        uint256 resolvedDisputes;
        uint256 averageRating;
        bool isActive;
        uint256 createdAt;
    }

    struct Dispute {
        uint256 disputeId;
        uint256 rentalId;
        address initiator;
        address arbitrator;
        DisputeStatus status;
        string reason;
        string evidenceIpfsHash;
        string resolution;
        uint256 createdAt;
        uint256 assignedAt;
        uint256 resolvedAt;
        uint256 deadline;
        uint256 arbitratorFee;
    }

    // Mappings
    mapping(uint256 => Arbitrator) public arbitrators;
    mapping(address => uint256) public arbitratorAddressToId;
    mapping(uint256 => Dispute) public disputes;
    mapping(address => uint256[]) public userDisputes;
    mapping(uint256 => uint256[]) public arbitratorDisputes;
    mapping(uint256 => mapping(address => uint256)) public arbitratorRatings;
    mapping(uint256 => uint256) public disputeCountByArbitrator;

    // Modifiers
    modifier onlyArbitrator(uint256 arbitratorId) {
        require(
            arbitrators[arbitratorId].arbitrator == msg.sender,
            "Only the assigned arbitrator can perform this action"
        );
        _;
    }

    modifier onlyInitiator(uint256 disputeId) {
        require(
            disputes[disputeId].initiator == msg.sender,
            "Only dispute initiator can perform this action"
        );
        _;
    }

    modifier disputeExists(uint256 disputeId) {
        require(disputes[disputeId].initiator != address(0), "Dispute does not exist");
        _;
    }

    modifier validDisputeStatus(uint256 disputeId, DisputeStatus expectedStatus) {
        require(disputes[disputeId].status == expectedStatus, "Invalid dispute status");
        _;
    }

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Register a new arbitrator
     * @param name Arbitrator name
     * @param description Arbitrator description
     * @param fee Fee in basis points (0-1000 = 0-10%)
     */
    function registerArbitrator(
        string memory name,
        string memory description,
        uint256 fee
    ) external {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(fee <= 1000, "Fee cannot exceed 10%");
        require(arbitratorAddressToId[msg.sender] == 0, "Arbitrator already registered");

        uint256 arbitratorId = _arbitratorIdCounter.current();
        _arbitratorIdCounter.increment();

        Arbitrator memory newArbitrator = Arbitrator({
            arbitratorId: arbitratorId,
            arbitrator: msg.sender,
            name: name,
            description: description,
            fee: fee,
            totalDisputes: 0,
            resolvedDisputes: 0,
            averageRating: 0,
            isActive: true,
            createdAt: block.timestamp
        });

        arbitrators[arbitratorId] = newArbitrator;
        arbitratorAddressToId[msg.sender] = arbitratorId;
        _grantRole(ARBITRATOR_ROLE, msg.sender);

        emit ArbitratorRegistered(arbitratorId, msg.sender, name, description, fee);
    }

    /**
     * @dev Remove an arbitrator (admin only)
     * @param arbitratorId ID of the arbitrator to remove
     */
    function removeArbitrator(uint256 arbitratorId) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        require(arbitrators[arbitratorId].arbitrator != address(0), "Arbitrator does not exist");
        
        arbitrators[arbitratorId].isActive = false;
        _revokeRole(ARBITRATOR_ROLE, arbitrators[arbitratorId].arbitrator);
        
        emit ArbitratorRemoved(arbitratorId, arbitrators[arbitratorId].arbitrator);
    }

    /**
     * @dev Create a new dispute
     * @param rentalId ID of the rental
     * @param reason Reason for dispute
     * @param evidenceIpfsHash IPFS hash with evidence
     */
    function createDispute(
        uint256 rentalId,
        string memory reason,
        string memory evidenceIpfsHash
    ) external whenNotPaused {
        require(bytes(reason).length > 0, "Reason cannot be empty");
        require(bytes(evidenceIpfsHash).length > 0, "Evidence hash cannot be empty");

        uint256 disputeId = _disputeIdCounter.current();
        _disputeIdCounter.increment();

        Dispute memory newDispute = Dispute({
            disputeId: disputeId,
            rentalId: rentalId,
            initiator: msg.sender,
            arbitrator: address(0),
            status: DisputeStatus.Pending,
            reason: reason,
            evidenceIpfsHash: evidenceIpfsHash,
            resolution: "",
            createdAt: block.timestamp,
            assignedAt: 0,
            resolvedAt: 0,
            deadline: 0,
            arbitratorFee: 0
        });

        disputes[disputeId] = newDispute;
        userDisputes[msg.sender].push(disputeId);
    }

    /**
     * @dev Assign arbitrator to dispute (admin only)
     * @param disputeId ID of the dispute
     * @param arbitratorId ID of the arbitrator
     */
    function assignArbitrator(uint256 disputeId, uint256 arbitratorId) 
        external 
        onlyRole(ADMIN_ROLE) 
        disputeExists(disputeId) 
        validDisputeStatus(disputeId, DisputeStatus.Pending) 
    {
        require(arbitrators[arbitratorId].isActive, "Arbitrator is not active");
        require(arbitrators[arbitratorId].arbitrator != address(0), "Arbitrator does not exist");

        disputes[disputeId].arbitrator = arbitrators[arbitratorId].arbitrator;
        disputes[disputeId].status = DisputeStatus.Assigned;
        disputes[disputeId].assignedAt = block.timestamp;
        disputes[disputeId].deadline = block.timestamp + 7 days; // 7 days to resolve
        disputes[disputeId].arbitratorFee = arbitrators[arbitratorId].fee;

        arbitrators[arbitratorId].totalDisputes++;
        arbitratorDisputes[arbitratorId].push(disputeId);

        emit DisputeAssigned(disputeId, disputes[disputeId].rentalId, arbitrators[arbitratorId].arbitrator, disputes[disputeId].deadline);
    }

    /**
     * @dev Start dispute review (arbitrator only)
     * @param disputeId ID of the dispute
     */
    function startDisputeReview(uint256 disputeId) 
        external 
        onlyArbitrator(arbitratorAddressToId[msg.sender]) 
        disputeExists(disputeId) 
        validDisputeStatus(disputeId, DisputeStatus.Assigned) 
    {
        require(disputes[disputeId].arbitrator == msg.sender, "Not assigned to this dispute");
        
        disputes[disputeId].status = DisputeStatus.InProgress;
    }

    /**
     * @dev Resolve dispute (arbitrator only)
     * @param disputeId ID of the dispute
     * @param resolved Whether dispute is resolved in favor of initiator
     * @param resolution Resolution details
     */
    function resolveDispute(
        uint256 disputeId,
        bool resolved,
        string memory resolution
    ) external 
        onlyArbitrator(arbitratorAddressToId[msg.sender]) 
        disputeExists(disputeId) 
        validDisputeStatus(disputeId, DisputeStatus.InProgress) 
    {
        require(disputes[disputeId].arbitrator == msg.sender, "Not assigned to this dispute");
        require(block.timestamp <= disputes[disputeId].deadline, "Dispute deadline exceeded");

        disputes[disputeId].status = DisputeStatus.Resolved;
        disputes[disputeId].resolvedAt = block.timestamp;
        disputes[disputeId].resolution = resolution;

        arbitrators[arbitratorAddressToId[msg.sender]].resolvedDisputes++;

        emit DisputeResolved(disputeId, msg.sender, resolved, resolution);
    }

    /**
     * @dev Rate an arbitrator
     * @param arbitratorId ID of the arbitrator
     * @param rating Rating (1-5)
     * @param feedback Feedback text
     */
    function rateArbitrator(
        uint256 arbitratorId,
        uint256 rating,
        string memory feedback
    ) external {
        require(arbitrators[arbitratorId].arbitrator != address(0), "Arbitrator does not exist");
        require(rating >= 1 && rating <= 5, "Rating must be between 1 and 5");
        require(arbitratorRatings[arbitratorId][msg.sender] == 0, "Already rated this arbitrator");

        arbitratorRatings[arbitratorId][msg.sender] = rating;
        
        // Update average rating
        uint256 totalRatings = disputeCountByArbitrator[arbitratorId] + 1;
        arbitrators[arbitratorId].averageRating = 
            (arbitrators[arbitratorId].averageRating * disputeCountByArbitrator[arbitratorId] + rating) / totalRatings;
        
        disputeCountByArbitrator[arbitratorId] = totalRatings;

        emit ArbitratorRated(arbitratorId, msg.sender, rating, feedback);
    }

    /**
     * @dev Get arbitrator details
     * @param arbitratorId ID of the arbitrator
     * @return Arbitrator struct
     */
    function getArbitrator(uint256 arbitratorId) external view returns (Arbitrator memory) {
        require(arbitrators[arbitratorId].arbitrator != address(0), "Arbitrator does not exist");
        return arbitrators[arbitratorId];
    }

    /**
     * @dev Get dispute details
     * @param disputeId ID of the dispute
     * @return Dispute struct
     */
    function getDispute(uint256 disputeId) external view returns (Dispute memory) {
        require(disputes[disputeId].initiator != address(0), "Dispute does not exist");
        return disputes[disputeId];
    }

    /**
     * @dev Get active arbitrators
     * @return Array of arbitrator IDs
     */
    function getActiveArbitrators() external view returns (uint256[] memory) {
        uint256 total = _arbitratorIdCounter.current();
        uint256 activeCount = 0;
        
        // Count active arbitrators
        for (uint256 i = 0; i < total; i++) {
            if (arbitrators[i].isActive) {
                activeCount++;
            }
        }
        
        // Create array with active arbitrators
        uint256[] memory activeArbitrators = new uint256[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < total; i++) {
            if (arbitrators[i].isActive) {
                activeArbitrators[index] = i;
                index++;
            }
        }
        
        return activeArbitrators;
    }

    /**
     * @dev Get user disputes
     * @param user Address of the user
     * @return Array of dispute IDs
     */
    function getUserDisputes(address user) external view returns (uint256[] memory) {
        return userDisputes[user];
    }

    /**
     * @dev Get arbitrator disputes
     * @param arbitratorId ID of the arbitrator
     * @return Array of dispute IDs
     */
    function getArbitratorDisputes(uint256 arbitratorId) external view returns (uint256[] memory) {
        return arbitratorDisputes[arbitratorId];
    }

    /**
     * @dev Calculate arbitrator fee
     * @param disputeAmount Amount in dispute
     * @param arbitratorId ID of the arbitrator
     * @return Fee amount
     */
    function calculateArbitratorFee(uint256 disputeAmount, uint256 arbitratorId) 
        external 
        view 
        returns (uint256) 
    {
        require(arbitrators[arbitratorId].arbitrator != address(0), "Arbitrator does not exist");
        return (disputeAmount * arbitrators[arbitratorId].fee) / BASIS_POINTS;
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
}
