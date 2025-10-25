import React from 'react';
import { MapPin, Calendar, DollarSign, Shield, Eye } from 'lucide-react';

interface PropertyListing {
  listingId: number;
  landlord: string;
  title: string;
  description: string;
  pricePerDay: string;
  deposit: string;
  isActive: boolean;
  ipfsHash: string;
  createdAt: number;
  updatedAt: number;
}

interface ListingCardProps {
  listing: PropertyListing;
  onViewDetails: (listingId: number) => void;
  onRent: (listingId: number) => void;
  imageUrl?: string;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onViewDetails,
  onRent,
  imageUrl
}) => {
  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return `${numPrice.toFixed(2)} MATIC`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const truncateDescription = (description: string, maxLength: number = 100) => {
    if (description.length <= maxLength) return description;
    return description.slice(0, maxLength) + '...';
  };

  return (
    <div className="card hover:shadow-xl transition-shadow duration-300">
      {/* Property Image */}
      <div className="relative mb-4">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={listing.title}
            className="w-full h-48 object-cover rounded-lg"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
            <Eye className="w-12 h-12 text-gray-400" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
          listing.isActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {listing.isActive ? 'Available' : 'Unavailable'}
        </div>
      </div>

      {/* Property Details */}
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {listing.title}
          </h3>
          <p className="text-gray-600 text-sm">
            {truncateDescription(listing.description)}
          </p>
        </div>

        {/* Pricing */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-green-600">
            <DollarSign className="w-4 h-4" />
            <span className="font-semibold">
              {formatPrice(listing.pricePerDay)}/day
            </span>
          </div>
          <div className="flex items-center space-x-1 text-gray-500">
            <Shield className="w-4 h-4" />
            <span className="text-sm">
              {formatPrice(listing.deposit)} deposit
            </span>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span>Property ID: #{listing.listingId}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(listing.createdAt)}</span>
          </div>
        </div>

        {/* Landlord Address */}
        <div className="text-xs text-gray-400">
          Landlord: {listing.landlord.slice(0, 6)}...{listing.landlord.slice(-4)}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <button
            onClick={() => onViewDetails(listing.listingId)}
            className="flex-1 btn-outline text-sm"
          >
            View Details
          </button>
          <button
            onClick={() => onRent(listing.listingId)}
            disabled={!listing.isActive}
            className={`flex-1 text-sm ${
              listing.isActive
                ? 'btn-primary'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {listing.isActive ? 'Rent Now' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  );
};
