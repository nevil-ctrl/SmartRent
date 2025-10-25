import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from './useWeb3';

// Contract ABIs (simplified for demo)
const SMART_RENT_ABI = [
  'function createListing(string memory title, string memory description, uint256 pricePerDay, uint256 deposit, string memory ipfsHash) external',
  'function getTotalListings() external view returns (uint256)',
  'function getAllListings() external view returns (tuple(uint256 listingId, address landlord, string title, string description, uint256 pricePerDay, uint256 deposit, bool isActive, string ipfsHash, uint256 createdAt, uint256 updatedAt)[])',
  'function createRental(uint256 listingId, address landlord, uint256 deposit, uint256 totalRent, uint256 startDate, uint256 endDate) external',
  'function makeDeposit(uint256 rentalId) external payable',
  'function signContract(uint256 rentalId, string memory contractIpfsHash) external',
  'function agreeReturn(uint256 rentalId) external',
  'function openDispute(uint256 rentalId, string memory reason, string memory disputeIpfsHash) external',
  'function createSubscription(uint8 plan, uint256 duration, bool autoRenew) external payable',
  'function createReview(address reviewee, uint256 rating, string memory reviewText, string memory ipfsHash, uint256 rentalId, uint8 reviewType) external',
  'function getListing(uint256 listingId) external view returns (tuple(uint256 listingId, address landlord, string title, string description, uint256 pricePerDay, uint256 deposit, bool isActive, string ipfsHash, uint256 createdAt, uint256 updatedAt))',
  'function getRental(uint256 rentalId) external view returns (tuple(uint256 rentalId, uint256 listingId, address tenant, address landlord, uint256 deposit, uint256 totalRent, uint256 startDate, uint256 endDate, uint8 status, uint256 createdAt, uint256 updatedAt, string contractIpfsHash, bool tenantSigned, bool landlordSigned, address arbitrator, uint256 disputeOpenedAt, string disputeReason, string disputeIpfsHash))',
  'function getPlatformStatistics() external view returns (uint256, uint256, uint256, uint256)',
  'function hasPremiumFeature(address user, uint256 feature) external view returns (bool)',
  'function getUserReputation(address user) external view returns (tuple(address user, uint256 totalReviews, uint256 totalRatingSum, uint256 reputationScore, uint256 completedRentals, uint256 cancelledRentals, uint256 disputeCount, bool isVerified, uint256 lastUpdated))',
  'event StatisticsUpdated(uint256 totalListings, uint256 totalRentals, uint256 totalDisputes, uint256 totalVolume)',
  'event ListingCreated(uint256 indexed listingId, address indexed landlord, string title, uint256 pricePerDay, uint256 deposit, string ipfsHash)',
  'event RentalCreated(uint256 indexed rentalId, uint256 indexed listingId, address indexed tenant, address landlord, uint256 deposit, uint256 totalRent, uint256 startDate, uint256 endDate)',
  'event DepositMade(uint256 indexed rentalId, address indexed tenant, uint256 amount)',
  'event DisputeOpened(uint256 indexed rentalId, address indexed initiator, string reason, string ipfsHash)',
  'event SubscriptionCreated(uint256 indexed subscriptionId, address indexed subscriber, uint8 plan, uint256 duration, uint256 price, uint256 expiresAt)',
  'event ReviewCreated(uint256 indexed reviewId, address indexed reviewer, address indexed reviewee, uint256 rating, string review, string ipfsHash, uint256 rentalId)'
];

interface ContractState {
  smartRent: ethers.Contract | null;
  isLoaded: boolean;
  error: string | null;
}

interface ContractActions {
  createListing: (title: string, description: string, pricePerDay: string, deposit: string, ipfsHash: string) => Promise<void>;
  createRental: (listingId: number, landlord: string, deposit: string, totalRent: string, startDate: number, endDate: number) => Promise<void>;
  makeDeposit: (rentalId: number, value: string) => Promise<void>;
  signContract: (rentalId: number, contractIpfsHash: string) => Promise<void>;
  agreeReturn: (rentalId: number) => Promise<void>;
  openDispute: (rentalId: number, reason: string, disputeIpfsHash: string) => Promise<void>;
  createSubscription: (plan: number, duration: number, autoRenew: boolean, value: string) => Promise<void>;
  createReview: (reviewee: string, rating: number, reviewText: string, ipfsHash: string, rentalId: number, reviewType: number) => Promise<void>;
  getListing: (listingId: number) => Promise<any>;
  getRental: (rentalId: number) => Promise<any>;
  getPlatformStatistics: () => Promise<any>;
  hasPremiumFeature: (user: string, feature: number) => Promise<boolean>;
  getUserReputation: (user: string) => Promise<any>;
  getAllListings: () => Promise<any[]>;
  getUserListings: (address: string) => Promise<any[]>;
}

// Contract addresses (these should be updated after deployment)
// The frontend can read Vite env var VITE_SMARTRENT_ADDRESS. After deployment, update .env or this map.
const DEFAULT_SMARTRENT_ADDRESS = (import.meta.env.VITE_SMARTRENT_ADDRESS as string) || '0x0000000000000000000000000000000000000000';

const CONTRACT_ADDRESSES = {
  // Mumbai Testnet
  80001: {
    SmartRent: DEFAULT_SMARTRENT_ADDRESS,
  },
  // Polygon Mainnet
  137: {
    SmartRent: '0x0000000000000000000000000000000000000000', // Update after deployment
  },
  // Local development
  1337: {
    SmartRent: '0x0000000000000000000000000000000000000000', // Update after deployment
  },
  // Hardhat local
  31337: {
    SmartRent: '0x0000000000000000000000000000000000000000', // Update after deployment
  },
};

export const useContracts = (): ContractState & ContractActions => {
  const { provider, signer, chainId, isConnected } = useWeb3();
  const [state, setState] = useState<ContractState>({
    smartRent: null,
    isLoaded: false,
    error: null,
  });

  // Initialize contracts when provider and signer are available
  useEffect(() => {
    if (!provider || !signer || !chainId || !isConnected) {
      setState(prev => ({ ...prev, isLoaded: false, smartRent: null }));
      return;
    }

    try {
      const contractAddress = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]?.SmartRent;
      
      if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
        setState(prev => ({ 
          ...prev, 
          error: 'Contract not deployed on this network',
          isLoaded: false 
        }));
        return;
      }

      const smartRentContract = new ethers.Contract(contractAddress, SMART_RENT_ABI, signer);
      
      setState({
        smartRent: smartRentContract,
        isLoaded: true,
        error: null,
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to initialize contracts',
        isLoaded: false,
      }));
    }
  }, [provider, signer, chainId, isConnected]);

  const createListing = useCallback(async (
    title: string,
    description: string,
    pricePerDay: string,
    deposit: string,
    ipfsHash: string
  ) => {
    if (!state.smartRent) throw new Error('Contract not loaded');
    
    try {
      const tx = await state.smartRent.createListing(
        title,
        description,
        ethers.parseEther(pricePerDay),
        ethers.parseEther(deposit),
        ipfsHash
      );
      await tx.wait();
    } catch (error: any) {
      console.error('Error creating listing:', error);
      throw new Error(error.message || 'Failed to create listing');
    }
  }, [state.smartRent]);

  const createRental = useCallback(async (
    listingId: number,
    landlord: string,
    deposit: string,
    totalRent: string,
    startDate: number,
    endDate: number
  ) => {
    if (!state.smartRent) throw new Error('Contract not loaded');
    
    const tx = await state.smartRent.createRental(
      listingId,
      landlord,
      ethers.parseEther(deposit),
      ethers.parseEther(totalRent),
      startDate,
      endDate
    );
    await tx.wait();
  }, [state.smartRent]);

  const makeDeposit = useCallback(async (rentalId: number, value: string) => {
    if (!state.smartRent) throw new Error('Contract not loaded');
    
    const tx = await state.smartRent.makeDeposit(rentalId, {
      value: ethers.parseEther(value)
    });
    await tx.wait();
  }, [state.smartRent]);

  const signContract = useCallback(async (rentalId: number, contractIpfsHash: string) => {
    if (!state.smartRent) throw new Error('Contract not loaded');
    
    const tx = await state.smartRent.signContract(rentalId, contractIpfsHash);
    await tx.wait();
  }, [state.smartRent]);

  const agreeReturn = useCallback(async (rentalId: number) => {
    if (!state.smartRent) throw new Error('Contract not loaded');
    
    const tx = await state.smartRent.agreeReturn(rentalId);
    await tx.wait();
  }, [state.smartRent]);

  const openDispute = useCallback(async (rentalId: number, reason: string, disputeIpfsHash: string) => {
    if (!state.smartRent) throw new Error('Contract not loaded');
    
    const tx = await state.smartRent.openDispute(rentalId, reason, disputeIpfsHash);
    await tx.wait();
  }, [state.smartRent]);

  const createSubscription = useCallback(async (
    plan: number,
    duration: number,
    autoRenew: boolean,
    value: string
  ) => {
    if (!state.smartRent) throw new Error('Contract not loaded');
    
    const tx = await state.smartRent.createSubscription(plan, duration, autoRenew, {
      value: ethers.parseEther(value)
    });
    await tx.wait();
  }, [state.smartRent]);

  const createReview = useCallback(async (
    reviewee: string,
    rating: number,
    reviewText: string,
    ipfsHash: string,
    rentalId: number,
    reviewType: number
  ) => {
    if (!state.smartRent) throw new Error('Contract not loaded');
    
    const tx = await state.smartRent.createReview(
      reviewee,
      rating,
      reviewText,
      ipfsHash,
      rentalId,
      reviewType
    );
    await tx.wait();
  }, [state.smartRent]);

  const getListing = useCallback(async (listingId: number) => {
    if (!state.smartRent) throw new Error('Contract not loaded');
    return await state.smartRent.getListing(listingId);
  }, [state.smartRent]);

  const getRental = useCallback(async (rentalId: number) => {
    if (!state.smartRent) throw new Error('Contract not loaded');
    return await state.smartRent.getRental(rentalId);
  }, [state.smartRent]);

  const getPlatformStatistics = useCallback(async () => {
    // Если контракт не загружен, возвращаем mock данные
    if (!state.smartRent || !state.isLoaded) {
      console.warn('Contract not loaded, returning mock statistics');
      return [0, 0, 0, 0]; // totalListings, totalRentals, totalDisputes, totalVolume
    }
    try {
      return await state.smartRent.getPlatformStatistics();
    } catch (error) {
      console.error('Failed to fetch platform statistics:', error);
      // Возвращаем пустые данные в случае ошибки
      return [0, 0, 0, 0];
    }
  }, [state.smartRent, state.isLoaded]);

  const hasPremiumFeature = useCallback(async (user: string, feature: number) => {
    if (!state.smartRent) throw new Error('Contract not loaded');
    return await state.smartRent.hasPremiumFeature(user, feature);
  }, [state.smartRent]);

  const getUserReputation = useCallback(async (user: string) => {
    if (!state.smartRent) throw new Error('Contract not loaded');
    return await state.smartRent.getUserReputation(user);
  }, [state.smartRent]);

  const getAllListings = useCallback(async () => {
    if (!state.smartRent || !state.isLoaded) {
      console.warn('Contract not loaded, returning empty listings');
      return [];
    }
    try {
      const totalListings = await state.smartRent.getTotalListings();
      const listings = [];
      
      for (let i = 0; i < Number(totalListings); i++) {
        try {
          const listing = await state.smartRent.getListing(i);
          listings.push({
            listingId: Number(listing.listingId),
            landlord: listing.landlord,
            title: listing.title,
            description: listing.description,
            pricePerDay: ethers.formatEther(listing.pricePerDay),
            deposit: ethers.formatEther(listing.deposit),
            isActive: listing.isActive,
            ipfsHash: listing.ipfsHash,
            createdAt: Number(listing.createdAt),
            updatedAt: Number(listing.updatedAt),
          });
        } catch (error) {
          console.error(`Failed to fetch listing ${i}:`, error);
        }
      }
      
      return listings;
    } catch (error) {
      console.error('Failed to fetch all listings:', error);
      return [];
    }
  }, [state.smartRent, state.isLoaded]);

  const getUserListings = useCallback(async (address: string) => {
    if (!state.smartRent || !state.isLoaded) {
      console.warn('Contract not loaded, returning empty user listings');
      return [];
    }
    try {
      const listingIds = await state.smartRent.getUserListingHistory(address);
      const listings = [];
      
      for (const id of listingIds) {
        try {
          const listing = await state.smartRent.getListing(Number(id));
          listings.push({
            listingId: Number(listing.listingId),
            landlord: listing.landlord,
            title: listing.title,
            description: listing.description,
            pricePerDay: ethers.formatEther(listing.pricePerDay),
            deposit: ethers.formatEther(listing.deposit),
            isActive: listing.isActive,
            ipfsHash: listing.ipfsHash,
            createdAt: Number(listing.createdAt),
            updatedAt: Number(listing.updatedAt),
          });
        } catch (error) {
          console.error(`Failed to fetch listing ${id}:`, error);
        }
      }
      
      return listings;
    } catch (error) {
      console.error('Failed to fetch user listings:', error);
      return [];
    }
  }, [state.smartRent, state.isLoaded]);

  return {
    ...state,
    createListing,
    createRental,
    makeDeposit,
    signContract,
    agreeReturn,
    openDispute,
    createSubscription,
    createReview,
    getListing,
    getRental,
    getPlatformStatistics,
    hasPremiumFeature,
    getUserReputation,
    getAllListings,
    getUserListings,
  };
};
