import { useState, useEffect } from 'react';
import { useIPFS } from './useIPFS';

interface ListingMetadata {
  title: string;
  description: string;
  images: string[];
  location: string;
  amenities: string[];
  rules: string[];
  version?: string;
  createdAt?: string;
  platform?: string;
}

export const useListingImage = (ipfsHash: string | undefined) => {
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const { getFileURL } = useIPFS();

  useEffect(() => {
    if (!ipfsHash) {
      setImageUrl(undefined);
      return;
    }

    const loadImage = async () => {
      setIsLoading(true);
      try {
        // Try to fetch metadata from IPFS
        const metadataUrl = getFileURL(ipfsHash);
        const response = await fetch(metadataUrl);
        
        if (response.ok) {
          const metadata: ListingMetadata = await response.json();
          
          // Get the first image from metadata
          if (metadata.images && metadata.images.length > 0) {
            const firstImageHash = metadata.images[0];
            setImageUrl(getFileURL(firstImageHash));
          } else {
            // If no images in metadata, try using the hash directly
            setImageUrl(metadataUrl);
          }
        } else {
          // If can't fetch metadata, try using hash directly as image
          setImageUrl(metadataUrl);
        }
      } catch (error) {
        console.error('Failed to load listing image:', error);
        // Fallback to direct URL
        setImageUrl(getFileURL(ipfsHash));
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [ipfsHash, getFileURL]);

  return { imageUrl, isLoading };
};
