// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./libraries/Counters.sol";

/**
 * @title Reputation
 * @dev Manages user reputation and rating system
 * @notice Handles rating aggregation, review management, and reputation scoring
 */
contract Reputation is AccessControl, ReentrancyGuard, Pausable {
    using Counters for Counters.Counter;

    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ARBITRATOR_ROLE = keccak256("ARBITRATOR_ROLE");

    // State variables
    Counters.Counter private _reviewIdCounter;

    // Rating constants
    uint256 public constant MIN_RATING = 1;
    uint256 public constant MAX_RATING = 5;
    uint256 public constant RATING_DECIMALS = 2; // 2 decimal places for precision

    // Reputation thresholds
    uint256 public constant EXCELLENT_THRESHOLD = 450; // 4.5/5.0
    uint256 public constant GOOD_THRESHOLD = 350;      // 3.5/5.0
    uint256 public constant FAIR_THRESHOLD = 250;      // 2.5/5.0

    // Events
    event ReviewCreated(
        uint256 indexed reviewId,
        address indexed reviewer,
        address indexed reviewee,
        uint256 rating,
        string review,
        string ipfsHash,
        uint256 rentalId
    );
    
    event ReviewUpdated(
        uint256 indexed reviewId,
        uint256 newRating,
        string newReview
    );
    
    event ReviewDeleted(
        uint256 indexed reviewId,
        address indexed reviewer,
        address indexed reviewee
    );
    
    event ReputationUpdated(
        address indexed user,
        uint256 newReputationScore,
        uint256 totalReviews
    );

    // Structs
    enum ReviewType {
        TenantToLandlord,  // 0 - Tenant reviewing landlord
        LandlordToTenant   // 1 - Landlord reviewing tenant
    }

    struct Review {
        uint256 reviewId;
        address reviewer;
        address reviewee;
        uint256 rating;
        string review;
        string ipfsHash; // IPFS hash for additional evidence/media
        uint256 rentalId;
        ReviewType reviewType;
        uint256 createdAt;
        uint256 updatedAt;
        bool isDeleted;
    }

    struct UserReputation {
        address user;
        uint256 totalReviews;
        uint256 totalRatingSum;
        uint256 reputationScore; // Average rating * 100 (e.g., 4.5 = 450)
        uint256 completedRentals;
        uint256 cancelledRentals;
        uint256 disputeCount;
        bool isVerified;
        uint256 lastUpdated;
    }

    // Mappings
    mapping(uint256 => Review) public reviews;
    mapping(address => UserReputation) public userReputations;
    mapping(address => uint256[]) public userReviews;
    mapping(address => uint256[]) public userReceivedReviews;
    mapping(address => mapping(address => uint256)) public userToUserReviews; // reviewer => reviewee => reviewId
    mapping(uint256 => uint256) public rentalReviews; // rentalId => reviewId

    // Modifiers
    modifier onlyReviewer(uint256 reviewId) {
        require(reviews[reviewId].reviewer == msg.sender, "Only reviewer can perform this action");
        _;
    }

    modifier reviewExists(uint256 reviewId) {
        require(reviews[reviewId].reviewer != address(0), "Review does not exist");
        _;
    }

    modifier validRating(uint256 rating) {
        require(rating >= MIN_RATING && rating <= MAX_RATING, "Rating must be between 1 and 5");
        _;
    }

    modifier notSelfReview(address reviewee) {
        require(msg.sender != reviewee, "Cannot review yourself");
        _;
    }

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Create a new review
     * @param reviewee Address of the user being reviewed
     * @param rating Rating (1-5)
     * @param review Review text
     * @param ipfsHash IPFS hash for additional evidence
     * @param rentalId ID of the rental
     * @param reviewType Type of review (tenant to landlord or vice versa)
     */
    function createReview(
        address reviewee,
        uint256 rating,
        string memory review,
        string memory ipfsHash,
        uint256 rentalId,
        ReviewType reviewType
    ) external 
        nonReentrant 
        whenNotPaused 
        validRating(rating) 
        notSelfReview(reviewee) 
    {
        require(bytes(review).length > 0, "Review text cannot be empty");
        require(reviewee != address(0), "Invalid reviewee address");
        
        // Check if user already reviewed this person for this rental
        require(
            userToUserReviews[msg.sender][reviewee] == 0 || 
            reviews[userToUserReviews[msg.sender][reviewee]].rentalId != rentalId,
            "Already reviewed this user for this rental"
        );

        uint256 reviewId = _reviewIdCounter.current();
        _reviewIdCounter.increment();

        Review memory newReview = Review({
            reviewId: reviewId,
            reviewer: msg.sender,
            reviewee: reviewee,
            rating: rating,
            review: review,
            ipfsHash: ipfsHash,
            rentalId: rentalId,
            reviewType: reviewType,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            isDeleted: false
        });

        reviews[reviewId] = newReview;
        userReviews[msg.sender].push(reviewId);
        userReceivedReviews[reviewee].push(reviewId);
        userToUserReviews[msg.sender][reviewee] = reviewId;
        rentalReviews[rentalId] = reviewId;

        // Update reputation
        _updateReputation(reviewee);

        emit ReviewCreated(reviewId, msg.sender, reviewee, rating, review, ipfsHash, rentalId);
    }

    /**
     * @dev Update an existing review
     * @param reviewId ID of the review
     * @param newRating New rating
     * @param newReview New review text
     */
    function updateReview(
        uint256 reviewId,
        uint256 newRating,
        string memory newReview
    ) external 
        onlyReviewer(reviewId) 
        reviewExists(reviewId) 
        validRating(newRating) 
    {
        require(!reviews[reviewId].isDeleted, "Review is deleted");
        require(bytes(newReview).length > 0, "Review text cannot be empty");
        require(block.timestamp <= reviews[reviewId].createdAt + 7 days, "Cannot update review after 7 days");

        address reviewee = reviews[reviewId].reviewee;

        reviews[reviewId].rating = newRating;
        reviews[reviewId].review = newReview;
        reviews[reviewId].updatedAt = block.timestamp;

        // Update reputation with new rating
        _updateReputation(reviewee);

        emit ReviewUpdated(reviewId, newRating, newReview);
    }

    /**
     * @dev Delete a review
     * @param reviewId ID of the review
     */
    function deleteReview(uint256 reviewId) 
        external 
        onlyReviewer(reviewId) 
        reviewExists(reviewId) 
    {
        require(!reviews[reviewId].isDeleted, "Review already deleted");
        require(block.timestamp <= reviews[reviewId].createdAt + 7 days, "Cannot delete review after 7 days");

        address reviewee = reviews[reviewId].reviewee;
        
        reviews[reviewId].isDeleted = true;
        reviews[reviewId].updatedAt = block.timestamp;

        // Update reputation after deletion
        _updateReputation(reviewee);

        emit ReviewDeleted(reviewId, msg.sender, reviewee);
    }

    /**
     * @dev Update user's rental statistics
     * @param user Address of the user
     * @param completed Whether rental was completed
     * @param cancelled Whether rental was cancelled
     * @param hadDispute Whether rental had a dispute
     */
    function updateRentalStats(
        address user,
        bool completed,
        bool cancelled,
        bool hadDispute
    ) external onlyRole(ADMIN_ROLE) {
        UserReputation storage reputation = userReputations[user];
        
        if (completed) {
            reputation.completedRentals++;
        }
        if (cancelled) {
            reputation.cancelledRentals++;
        }
        if (hadDispute) {
            reputation.disputeCount++;
        }
        
        reputation.lastUpdated = block.timestamp;
    }

    /**
     * @dev Verify a user (admin only)
     * @param user Address of the user
     */
    function verifyUser(address user) external onlyRole(ADMIN_ROLE) {
        userReputations[user].isVerified = true;
        userReputations[user].lastUpdated = block.timestamp;
    }

    /**
     * @dev Get user reputation
     * @param user Address of the user
     * @return UserReputation struct
     */
    function getUserReputation(address user) external view returns (UserReputation memory) {
        return userReputations[user];
    }

    /**
     * @dev Get review details
     * @param reviewId ID of the review
     * @return Review struct
     */
    function getReview(uint256 reviewId) external view returns (Review memory) {
        require(reviews[reviewId].reviewer != address(0), "Review does not exist");
        return reviews[reviewId];
    }

    /**
     * @dev Get user's reviews
     * @param user Address of the user
     * @return Array of review IDs
     */
    function getUserReviews(address user) external view returns (uint256[] memory) {
        return userReviews[user];
    }

    /**
     * @dev Get reviews received by user
     * @param user Address of the user
     * @return Array of review IDs
     */
    function getUserReceivedReviews(address user) external view returns (uint256[] memory) {
        return userReceivedReviews[user];
    }

    /**
     * @dev Get reputation level based on score
     * @param score Reputation score
     * @return Reputation level string
     */
    function getReputationLevel(uint256 score) external pure returns (string memory) {
        if (score >= EXCELLENT_THRESHOLD) {
            return "Excellent";
        } else if (score >= GOOD_THRESHOLD) {
            return "Good";
        } else if (score >= FAIR_THRESHOLD) {
            return "Fair";
        } else {
            return "Poor";
        }
    }

    /**
     * @dev Check if user can review another user
     * @param reviewer Address of the reviewer
     * @param reviewee Address of the reviewee
     * @param rentalId ID of the rental
     * @return Whether review is allowed
     */
    function canReview(address reviewer, address reviewee, uint256 rentalId) 
        external 
        view 
        returns (bool) 
    {
        if (reviewer == reviewee) return false;
        if (userToUserReviews[reviewer][reviewee] != 0) {
            return reviews[userToUserReviews[reviewer][reviewee]].rentalId != rentalId;
        }
        return true;
    }

    /**
     * @dev Internal function to update user reputation
     * @param user Address of the user
     */
    function _updateReputation(address user) internal {
        UserReputation storage reputation = userReputations[user];
        
        uint256 totalRatingSum = 0;
        uint256 validReviews = 0;
        
        // Calculate average rating from non-deleted reviews
        for (uint256 i = 0; i < userReceivedReviews[user].length; i++) {
            uint256 reviewId = userReceivedReviews[user][i];
            Review memory review = reviews[reviewId];
            
            if (!review.isDeleted) {
                totalRatingSum += review.rating;
                validReviews++;
            }
        }
        
        if (validReviews > 0) {
            reputation.totalRatingSum = totalRatingSum;
            reputation.totalReviews = validReviews;
            reputation.reputationScore = (totalRatingSum * 100) / validReviews; // Convert to basis points
        } else {
            reputation.reputationScore = 0;
        }
        
        reputation.lastUpdated = block.timestamp;
        
        emit ReputationUpdated(user, reputation.reputationScore, validReviews);
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
