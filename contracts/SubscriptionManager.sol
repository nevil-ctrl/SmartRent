// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./libraries/Counters.sol";

/**
 * @title SubscriptionManager
 * @dev Manages Pro subscriptions for landlords
 * @notice Handles subscription creation, renewal, and premium features
 */
contract SubscriptionManager is AccessControl, ReentrancyGuard, Pausable {
    using Counters for Counters.Counter;

    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // State variables
    Counters.Counter private _subscriptionIdCounter;

    // Subscription plans
    enum SubscriptionPlan {
        Free,     // 0 - Free tier
        Pro,      // 1 - Pro tier
        Premium   // 2 - Premium tier
    }

    // Subscription pricing (in wei)
    uint256 public constant PRO_MONTHLY_PRICE = 30 ether; // $30 in MATIC
    uint256 public constant PREMIUM_MONTHLY_PRICE = 50 ether; // $50 in MATIC
    uint256 public constant YEARLY_DISCOUNT_BPS = 2000; // 20% discount for yearly

    // Events
    event SubscriptionCreated(
        uint256 indexed subscriptionId,
        address indexed subscriber,
        SubscriptionPlan plan,
        uint256 duration,
        uint256 price,
        uint256 expiresAt
    );
    
    event SubscriptionRenewed(
        uint256 indexed subscriptionId,
        address indexed subscriber,
        uint256 newExpiresAt
    );
    
    event SubscriptionCancelled(
        uint256 indexed subscriptionId,
        address indexed subscriber
    );
    
    event PlanUpdated(
        SubscriptionPlan plan,
        uint256 monthlyPrice,
        uint256 yearlyPrice
    );

    // Structs
    struct Subscription {
        uint256 subscriptionId;
        address subscriber;
        SubscriptionPlan plan;
        uint256 createdAt;
        uint256 expiresAt;
        bool isActive;
        bool autoRenew;
        uint256 totalPaid;
    }

    // Mappings
    mapping(uint256 => Subscription) public subscriptions;
    mapping(address => uint256) public userActiveSubscription;
    mapping(address => uint256[]) public userSubscriptions;
    mapping(SubscriptionPlan => uint256) public planPrices;
    mapping(SubscriptionPlan => uint256) public planFeatures;

    // Modifiers
    modifier onlySubscriber(uint256 subscriptionId) {
        require(
            subscriptions[subscriptionId].subscriber == msg.sender,
            "Only subscriber can perform this action"
        );
        _;
    }

    modifier subscriptionExists(uint256 subscriptionId) {
        require(subscriptions[subscriptionId].subscriber != address(0), "Subscription does not exist");
        _;
    }

    modifier validPlan(SubscriptionPlan plan) {
        require(plan != SubscriptionPlan.Free, "Cannot subscribe to free plan");
        _;
    }

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        
        // Initialize plan prices
        planPrices[SubscriptionPlan.Pro] = PRO_MONTHLY_PRICE;
        planPrices[SubscriptionPlan.Premium] = PREMIUM_MONTHLY_PRICE;
        
        // Initialize plan features (bitmap)
        planFeatures[SubscriptionPlan.Free] = 0; // No premium features
        planFeatures[SubscriptionPlan.Pro] = 1 | 2 | 4; // Priority listing, premium filters, analytics
        planFeatures[SubscriptionPlan.Premium] = 1 | 2 | 4 | 8 | 16; // All Pro features + advanced analytics, priority support
    }

    /**
     * @dev Create a new subscription
     * @param plan Subscription plan
     * @param duration Duration in months (1-12)
     * @param autoRenew Whether to auto-renew
     */
    function createSubscription(
        SubscriptionPlan plan,
        uint256 duration,
        bool autoRenew
    ) external 
        payable 
        nonReentrant 
        whenNotPaused 
        validPlan(plan) 
    {
        require(duration >= 1 && duration <= 12, "Duration must be between 1 and 12 months");
        require(userActiveSubscription[msg.sender] == 0, "User already has active subscription");
        
        uint256 price = calculatePrice(plan, duration);
        require(msg.value >= price, "Insufficient payment");

        uint256 subscriptionId = _subscriptionIdCounter.current();
        _subscriptionIdCounter.increment();

        uint256 expiresAt = block.timestamp + (duration * 30 days);

        Subscription memory newSubscription = Subscription({
            subscriptionId: subscriptionId,
            subscriber: msg.sender,
            plan: plan,
            createdAt: block.timestamp,
            expiresAt: expiresAt,
            isActive: true,
            autoRenew: autoRenew,
            totalPaid: price
        });

        subscriptions[subscriptionId] = newSubscription;
        userActiveSubscription[msg.sender] = subscriptionId;
        userSubscriptions[msg.sender].push(subscriptionId);

        emit SubscriptionCreated(subscriptionId, msg.sender, plan, duration, price, expiresAt);
    }

    /**
     * @dev Renew subscription
     * @param subscriptionId ID of the subscription
     * @param duration Additional duration in months
     */
    function renewSubscription(uint256 subscriptionId, uint256 duration) 
        external 
        payable 
        nonReentrant 
        onlySubscriber(subscriptionId) 
        subscriptionExists(subscriptionId) 
    {
        require(duration >= 1 && duration <= 12, "Duration must be between 1 and 12 months");
        require(subscriptions[subscriptionId].isActive, "Subscription is not active");
        
        uint256 price = calculatePrice(subscriptions[subscriptionId].plan, duration);
        require(msg.value >= price, "Insufficient payment");

        subscriptions[subscriptionId].expiresAt += duration * 30 days;
        subscriptions[subscriptionId].totalPaid += price;

        emit SubscriptionRenewed(subscriptionId, msg.sender, subscriptions[subscriptionId].expiresAt);
    }

    /**
     * @dev Cancel subscription
     * @param subscriptionId ID of the subscription
     */
    function cancelSubscription(uint256 subscriptionId) 
        external 
        onlySubscriber(subscriptionId) 
        subscriptionExists(subscriptionId) 
    {
        require(subscriptions[subscriptionId].isActive, "Subscription is not active");
        
        subscriptions[subscriptionId].isActive = false;
        subscriptions[subscriptionId].autoRenew = false;
        userActiveSubscription[msg.sender] = 0;

        emit SubscriptionCancelled(subscriptionId, msg.sender);
    }

    /**
     * @dev Toggle auto-renewal
     * @param subscriptionId ID of the subscription
     */
    function toggleAutoRenewal(uint256 subscriptionId) 
        external 
        onlySubscriber(subscriptionId) 
        subscriptionExists(subscriptionId) 
    {
        subscriptions[subscriptionId].autoRenew = !subscriptions[subscriptionId].autoRenew;
    }

    /**
     * @dev Process auto-renewal (admin only)
     * @param subscriptionId ID of the subscription
     */
    function processAutoRenewal(uint256 subscriptionId) 
        external 
        onlyRole(ADMIN_ROLE) 
        subscriptionExists(subscriptionId) 
    {
        require(subscriptions[subscriptionId].autoRenew, "Auto-renewal not enabled");
        require(subscriptions[subscriptionId].isActive, "Subscription is not active");
        require(block.timestamp >= subscriptions[subscriptionId].expiresAt, "Subscription not expired yet");

        // Extend subscription by 1 month
        subscriptions[subscriptionId].expiresAt += 30 days;
        
        emit SubscriptionRenewed(subscriptionId, subscriptions[subscriptionId].subscriber, subscriptions[subscriptionId].expiresAt);
    }

    /**
     * @dev Check if user has premium feature
     * @param user Address of the user
     * @param feature Feature bit (1, 2, 4, 8, 16, etc.)
     * @return Whether user has the feature
     */
    function hasFeature(address user, uint256 feature) external view returns (bool) {
        uint256 activeSubId = userActiveSubscription[user];
        if (activeSubId == 0) return false;
        
        Subscription memory sub = subscriptions[activeSubId];
        if (!sub.isActive || block.timestamp > sub.expiresAt) return false;
        
        return (planFeatures[sub.plan] & feature) != 0;
    }

    /**
     * @dev Check if user has active subscription
     * @param user Address of the user
     * @return Whether user has active subscription
     */
    function hasActiveSubscription(address user) external view returns (bool) {
        uint256 activeSubId = userActiveSubscription[user];
        if (activeSubId == 0) return false;
        
        Subscription memory sub = subscriptions[activeSubId];
        return sub.isActive && block.timestamp <= sub.expiresAt;
    }

    /**
     * @dev Get user's subscription plan
     * @param user Address of the user
     * @return Subscription plan
     */
    function getUserPlan(address user) external view returns (SubscriptionPlan) {
        uint256 activeSubId = userActiveSubscription[user];
        if (activeSubId == 0) return SubscriptionPlan.Free;
        
        Subscription memory sub = subscriptions[activeSubId];
        if (!sub.isActive || block.timestamp > sub.expiresAt) return SubscriptionPlan.Free;
        
        return sub.plan;
    }

    /**
     * @dev Calculate subscription price
     * @param plan Subscription plan
     * @param duration Duration in months
     * @return Price in wei
     */
    function calculatePrice(SubscriptionPlan plan, uint256 duration) public view returns (uint256) {
        uint256 monthlyPrice = planPrices[plan];
        uint256 totalPrice = monthlyPrice * duration;
        
        // Apply yearly discount for 12-month subscriptions
        if (duration == 12) {
            totalPrice = totalPrice - (totalPrice * YEARLY_DISCOUNT_BPS / 10000);
        }
        
        return totalPrice;
    }

    /**
     * @dev Get subscription details
     * @param subscriptionId ID of the subscription
     * @return Subscription struct
     */
    function getSubscription(uint256 subscriptionId) 
        external 
        view 
        subscriptionExists(subscriptionId) 
        returns (Subscription memory) 
    {
        return subscriptions[subscriptionId];
    }

    /**
     * @dev Get user subscriptions
     * @param user Address of the user
     * @return Array of subscription IDs
     */
    function getUserSubscriptions(address user) external view returns (uint256[] memory) {
        return userSubscriptions[user];
    }

    /**
     * @dev Update plan pricing (admin only)
     * @param plan Subscription plan
     * @param monthlyPrice New monthly price
     */
    function updatePlanPricing(SubscriptionPlan plan, uint256 monthlyPrice) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        planPrices[plan] = monthlyPrice;
        emit PlanUpdated(plan, monthlyPrice, calculatePrice(plan, 12));
    }

    /**
     * @dev Update plan features (admin only)
     * @param plan Subscription plan
     * @param features New features bitmap
     */
    function updatePlanFeatures(SubscriptionPlan plan, uint256 features) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        planFeatures[plan] = features;
    }

    /**
     * @dev Get plan features
     * @param plan Subscription plan
     * @return Features bitmap
     */
    function getPlanFeatures(SubscriptionPlan plan) external view returns (uint256) {
        return planFeatures[plan];
    }

    /**
     * @dev Get contract balance
     * @return Contract ETH balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Withdraw funds (admin only)
     * @param amount Amount to withdraw
     */
    function withdraw(uint256 amount) external onlyRole(ADMIN_ROLE) {
        require(amount <= address(this).balance, "Insufficient balance");
        payable(msg.sender).transfer(amount);
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

    // Fallback function to receive ETH
    receive() external payable {}
}
