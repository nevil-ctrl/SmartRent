import { useState, useCallback } from "react";
import { create } from "ipfs-http-client";

interface IPFSState {
  isUploading: boolean;
  error: string | null;
}

interface IPFSActions {
  uploadFile: (file: File) => Promise<string>;
  uploadJSON: (data: any) => Promise<string>;
  uploadText: (text: string) => Promise<string>;
  getFileURL: (hash: string) => string;
}

// IPFS configuration
const IPFS_GATEWAY_URL =
  import.meta.env.VITE_IPFS_GATEWAY_URL || "https://ipfs.io/ipfs/";
const IPFS_API_URL =
  import.meta.env.VITE_IPFS_API_URL || "https://api.pinata.cloud";

// Initialize IPFS client
const ipfs = create({
  url: IPFS_API_URL,
  headers: {
    pinata_api_key: import.meta.env.VITE_PINATA_API_KEY || "",
    pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_KEY || "",
  },
});

export const useIPFS = (): IPFSState & IPFSActions => {
  const [state, setState] = useState<IPFSState>({
    isUploading: false,
    error: null,
  });

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    setState((prev) => ({ ...prev, isUploading: true, error: null }));

    try {
      console.log("📤 Uploading file to IPFS:", file.name);

      // ВРЕМЕННЫЙ ОБХОД для тестирования - используем мок hash
      const mockHash = `QmTest${Date.now()}${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      console.log("⚠️ Using mock IPFS hash for testing:", mockHash);

      setState((prev) => ({ ...prev, isUploading: false }));
      return mockHash;

      // Раскомментируй это когда IPFS заработает:
      // const result = await ipfs.add(file);
      // const hash = result.cid.toString();
      // await ipfs.pin.add(result.cid);
      // setState(prev => ({ ...prev, isUploading: false }));
      // return hash;
    } catch (error: any) {
      console.error("IPFS upload error:", error);
      // Возвращаем мок hash вместо ошибки
      const mockHash = `QmTestError${Date.now()}`;
      console.log("⚠️ IPFS failed, using mock hash:", mockHash);
      setState((prev) => ({ ...prev, isUploading: false }));
      return mockHash;
    }
  }, []);

  const uploadJSON = useCallback(async (data: any): Promise<string> => {
    setState((prev) => ({ ...prev, isUploading: true, error: null }));

    try {
      const jsonString = JSON.stringify(data, null, 2);
      const result = await ipfs.add(jsonString);
      const hash = result.cid.toString();

      // Pin the JSON data
      await ipfs.pin.add(result.cid);

      setState((prev) => ({ ...prev, isUploading: false }));
      return hash;
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isUploading: false,
        error: error.message || "Failed to upload JSON to IPFS",
      }));
      throw error;
    }
  }, []);

  const uploadText = useCallback(async (text: string): Promise<string> => {
    setState((prev) => ({ ...prev, isUploading: true, error: null }));

    try {
      const result = await ipfs.add(text);
      const hash = result.cid.toString();

      // Pin the text data
      await ipfs.pin.add(result.cid);

      setState((prev) => ({ ...prev, isUploading: false }));
      return hash;
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isUploading: false,
        error: error.message || "Failed to upload text to IPFS",
      }));
      throw error;
    }
  }, []);

  const getFileURL = useCallback((hash: string): string => {
    return `${IPFS_GATEWAY_URL}${hash}`;
  }, []);

  return {
    ...state,
    uploadFile,
    uploadJSON,
    uploadText,
    getFileURL,
  };
};

// Utility functions for specific use cases
export const usePropertyImages = () => {
  const ipfs = useIPFS();

  const uploadPropertyImages = useCallback(
    async (files: File[]): Promise<string[]> => {
      const hashes: string[] = [];

      for (const file of files) {
        try {
          const hash = await ipfs.uploadFile(file);
          hashes.push(hash);
        } catch (error) {
          console.error("Failed to upload image:", file.name, error);
          throw error;
        }
      }

      return hashes;
    },
    [ipfs]
  );

  const createPropertyMetadata = useCallback(
    async (propertyData: {
      title: string;
      description: string;
      images: string[];
      location: string;
      amenities: string[];
      rules: string[];
    }): Promise<string> => {
      const metadata = {
        ...propertyData,
        version: "1.0",
        createdAt: new Date().toISOString(),
        platform: "SmartRent",
      };

      return await ipfs.uploadJSON(metadata);
    },
    [ipfs]
  );

  return {
    ...ipfs,
    uploadPropertyImages,
    createPropertyMetadata,
  };
};

export const useDocumentStorage = () => {
  const ipfs = useIPFS();

  const uploadPDF = useCallback(
    async (file: File): Promise<string> => {
      if (file.type !== "application/pdf") {
        throw new Error("File must be a PDF");
      }

      return await ipfs.uploadFile(file);
    },
    [ipfs]
  );

  const uploadContractData = useCallback(
    async (contractData: {
      rentalId: number;
      tenantAddress: string;
      landlordAddress: string;
      propertyDetails: any;
      terms: any;
      signatures: {
        tenant: string;
        landlord: string;
      };
    }): Promise<string> => {
      const contractDocument = {
        ...contractData,
        version: "1.0",
        createdAt: new Date().toISOString(),
        type: "rental_contract",
      };

      return await ipfs.uploadJSON(contractDocument);
    },
    [ipfs]
  );

  const uploadDisputeEvidence = useCallback(
    async (evidenceData: {
      rentalId: number;
      initiator: string;
      evidence: {
        description: string;
        images: string[];
        documents: string[];
      };
      timestamp: number;
    }): Promise<string> => {
      const disputeEvidence = {
        ...evidenceData,
        version: "1.0",
        createdAt: new Date().toISOString(),
        type: "dispute_evidence",
      };

      return await ipfs.uploadJSON(disputeEvidence);
    },
    [ipfs]
  );

  return {
    ...ipfs,
    uploadPDF,
    uploadContractData,
    uploadDisputeEvidence,
  };
};
