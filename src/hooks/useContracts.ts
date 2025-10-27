import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "./useWeb3";
import { SmartRentABI } from "../contracts/SmartRentABI";

const SMART_RENT_ABI = SmartRentABI;

interface ContractState {
  smartRent: ethers.Contract | null;
  isLoaded: boolean;
  error: string | null;
}

interface ContractActions {
  createListing: (
    title: string,
    description: string,
    pricePerDay: string,
    deposit: string,
    ipfsHash: string
  ) => Promise<void>;
  createRental: (
    listingId: number,
    landlord: string,
    deposit: string,
    totalRent: string,
    startDate: number,
    endDate: number
  ) => Promise<void>;
  makeDeposit: (rentalId: number, value: string) => Promise<void>;
  signContract: (rentalId: number, contractIpfsHash: string) => Promise<void>;
  agreeReturn: (rentalId: number) => Promise<void>;
  openDispute: (
    rentalId: number,
    reason: string,
    disputeIpfsHash: string
  ) => Promise<void>;
  createSubscription: (
    plan: number,
    duration: number,
    autoRenew: boolean,
    value: string
  ) => Promise<void>;
  createReview: (
    reviewee: string,
    rating: number,
    reviewText: string,
    ipfsHash: string,
    rentalId: number,
    reviewType: number
  ) => Promise<void>;
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
const DEFAULT_SMARTRENT_ADDRESS =
  (import.meta.env.VITE_SMARTRENT_ADDRESS as string) ||
  "0x0000000000000000000000000000000000000000";

export const CONTRACT_ADDRESSES = {
  1337: {
    // Hardhat Local (основной)
    SmartRent: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
  },
  31337: {
    // Hardhat Local (альтернативный)
    SmartRent: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
  },
  80002: {
    // Polygon Amoy testnet (новый Mumbai)
    SmartRent: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
  },
  80001: {
    // Mumbai testnet (DEPRECATED - используй Amoy)
    SmartRent: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
  },
  137: {
    // Polygon Mainnet
    SmartRent: DEFAULT_SMARTRENT_ADDRESS,
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
    console.log("🔍 Contract initialization:", {
      provider: !!provider,
      signer: !!signer,
      chainId,
      isConnected,
    });

    if (!provider || !signer || !chainId || !isConnected) {
      setState((prev) => ({ ...prev, isLoaded: false, smartRent: null }));
      return;
    }

    try {
      const contractAddress =
        CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]
          ?.SmartRent;

      console.log(
        "📋 Contract address for chainId",
        chainId,
        ":",
        contractAddress
      );

      if (
        !contractAddress ||
        contractAddress === "0x0000000000000000000000000000000000000000"
      ) {
        console.error("❌ Contract not deployed on this network");
        setState((prev) => ({
          ...prev,
          error: "Contract not deployed on this network",
          isLoaded: false,
        }));
        return;
      }

      const smartRentContract = new ethers.Contract(
        contractAddress,
        SMART_RENT_ABI,
        signer
      );

      console.log("✅ Contract initialized successfully:", contractAddress);

      setState({
        smartRent: smartRentContract,
        isLoaded: true,
        error: null,
      });
    } catch (error: any) {
      console.error("❌ Failed to initialize contract:", error);
      setState((prev) => ({
        ...prev,
        error: error.message || "Failed to initialize contracts",
        isLoaded: false,
      }));
    }
  }, [provider, signer, chainId, isConnected]);

  const createListing = useCallback(
    async (
      title: string,
      description: string,
      pricePerDay: string,
      deposit: string,
      ipfsHash: string
    ) => {
      console.log("📝 Creating listing...", {
        title,
        pricePerDay,
        deposit,
        ipfsHash,
      });
      console.log("Contract loaded?", !!state.smartRent);

      if (!state.smartRent) {
        console.error("❌ Contract not loaded!");
        throw new Error("Contract not loaded");
      }

      try {
        console.log("💰 Parsing values...");
        const priceWei = ethers.parseEther(pricePerDay);
        const depositWei = ethers.parseEther(deposit);
        console.log(
          "Price:",
          priceWei.toString(),
          "Deposit:",
          depositWei.toString()
        );

        console.log("📤 Sending transaction...");
        const tx = await state.smartRent.createListing(
          title,
          description,
          priceWei,
          depositWei,
          ipfsHash
        );
        console.log("⏳ Waiting for confirmation...", tx.hash);
        await tx.wait();
        console.log("✅ Listing created successfully!");
      } catch (error: any) {
        console.error("❌ Error creating listing:", error);
        console.error("Error details:", {
          message: error.message,
          code: error.code,
          data: error.data,
        });
        throw new Error(error.message || "Failed to create listing");
      }
    },
    [state.smartRent]
  );

  const createRental = useCallback(
    async (
      listingId: number,
      landlord: string,
      deposit: string,
      totalRent: string,
      startDate: number,
      endDate: number
    ) => {
      if (!state.smartRent) throw new Error("Contract not loaded");

      const tx = await state.smartRent.createRental(
        listingId,
        landlord,
        ethers.parseEther(deposit),
        ethers.parseEther(totalRent),
        startDate,
        endDate
      );
      await tx.wait();
    },
    [state.smartRent]
  );

  const makeDeposit = useCallback(
    async (rentalId: number, value: string) => {
      if (!state.smartRent) throw new Error("Contract not loaded");

      const tx = await state.smartRent.makeDeposit(rentalId, {
        value: ethers.parseEther(value),
      });
      await tx.wait();
    },
    [state.smartRent]
  );

  const signContract = useCallback(
    async (rentalId: number, contractIpfsHash: string) => {
      if (!state.smartRent) throw new Error("Contract not loaded");

      const tx = await state.smartRent.signContract(rentalId, contractIpfsHash);
      await tx.wait();
    },
    [state.smartRent]
  );

  const agreeReturn = useCallback(
    async (rentalId: number) => {
      if (!state.smartRent) throw new Error("Contract not loaded");

      const tx = await state.smartRent.agreeReturn(rentalId);
      await tx.wait();
    },
    [state.smartRent]
  );

  const openDispute = useCallback(
    async (rentalId: number, reason: string, disputeIpfsHash: string) => {
      if (!state.smartRent) throw new Error("Contract not loaded");

      const tx = await state.smartRent.openDispute(
        rentalId,
        reason,
        disputeIpfsHash
      );
      await tx.wait();
    },
    [state.smartRent]
  );

  const createSubscription = useCallback(
    async (
      plan: number,
      duration: number,
      autoRenew: boolean,
      value: string
    ) => {
      if (!state.smartRent) throw new Error("Contract not loaded");

      const tx = await state.smartRent.createSubscription(
        plan,
        duration,
        autoRenew,
        {
          value: ethers.parseEther(value),
        }
      );
      await tx.wait();
    },
    [state.smartRent]
  );

  const createReview = useCallback(
    async (
      reviewee: string,
      rating: number,
      reviewText: string,
      ipfsHash: string,
      rentalId: number,
      reviewType: number
    ) => {
      if (!state.smartRent) throw new Error("Contract not loaded");

      const tx = await state.smartRent.createReview(
        reviewee,
        rating,
        reviewText,
        ipfsHash,
        rentalId,
        reviewType
      );
      await tx.wait();
    },
    [state.smartRent]
  );

  const getListing = useCallback(
    async (listingId: number) => {
      if (!state.smartRent) throw new Error("Contract not loaded");
      return await state.smartRent.getListing(listingId);
    },
    [state.smartRent]
  );

  const getRental = useCallback(
    async (rentalId: number) => {
      if (!state.smartRent) throw new Error("Contract not loaded");
      return await state.smartRent.getRental(rentalId);
    },
    [state.smartRent]
  );

  const getPlatformStatistics = useCallback(async () => {
    // Если контракт не загружен, возвращаем mock данные
    if (!state.smartRent || !state.isLoaded) {
      console.warn("Contract not loaded, returning mock statistics");
      return [0, 0, 0, 0]; // totalListings, totalRentals, totalDisputes, totalVolume
    }
    try {
      return await state.smartRent.getPlatformStatistics();
    } catch (error) {
      console.error("Failed to fetch platform statistics:", error);
      // Возвращаем пустые данные в случае ошибки
      return [0, 0, 0, 0];
    }
  }, [state.smartRent, state.isLoaded]);

  const hasPremiumFeature = useCallback(
    async (user: string, feature: number) => {
      if (!state.smartRent) throw new Error("Contract not loaded");
      return await state.smartRent.hasPremiumFeature(user, feature);
    },
    [state.smartRent]
  );

  const getUserReputation = useCallback(
    async (user: string) => {
      if (!state.smartRent) throw new Error("Contract not loaded");
      return await state.smartRent.getUserReputation(user);
    },
    [state.smartRent]
  );

  const getAllListings = useCallback(async () => {
    if (!state.smartRent || !state.isLoaded) {
      console.warn("Contract not loaded, returning empty listings");
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
      console.error("Failed to fetch all listings:", error);
      return [];
    }
  }, [state.smartRent, state.isLoaded]);

  const getUserListings = useCallback(
    async (address: string) => {
      if (!state.smartRent || !state.isLoaded) {
        console.warn("Contract not loaded, returning empty user listings");
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
        console.error("Failed to fetch user listings:", error);
        return [];
      }
    },
    [state.smartRent, state.isLoaded]
  );

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
