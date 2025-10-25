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
    <article className="listing-card">
      {/* Property Image */}
      <div className="listing-image">
        {imageUrl ? (
          <img src={imageUrl} alt={listing.title} />
        ) : (
          <div className="listing-image-placeholder">
            <Eye style={{ width: '48px', height: '48px' }} />
          </div>
        )}

        {/* Status Badge */}
        <div className={`listing-badge badge ${listing.isActive ? 'badge-success' : 'badge-danger'}`}>
          {listing.isActive ? 'Available' : 'Unavailable'}
        </div>
      </div>

      {/* Property Content */}
      <div className="listing-content">
        <h3 className="listing-title">{listing.title}</h3>
        <p className="listing-description">
          {truncateDescription(listing.description)}
        </p>

        {/* Pricing */}
        <div className="listing-price-row">
          <div className="listing-price">
            <DollarSign style={{ width: '18px', height: '18px' }} />
            <span>{formatPrice(listing.pricePerDay)}/day</span>
          </div>
          <div className="listing-deposit">
            <Shield style={{ width: '16px', height: '16px' }} />
            <span>{formatPrice(listing.deposit)} deposit</span>
          </div>
        </div>

        {/* Metadata */}
        <div className="listing-meta">
          <div className="listing-meta-item">
            <MapPin style={{ width: '16px', height: '16px' }} />
            <span>ID #{listing.listingId}</span>
          </div>
          <div className="listing-meta-item">
            <Calendar style={{ width: '16px', height: '16px' }} />
            <span>{formatDate(listing.createdAt)}</span>
          </div>
        </div>

        {/* Landlord Address */}
        <div className="listing-landlord">
          Landlord: {listing.landlord.slice(0, 6)}...{listing.landlord.slice(-4)}
        </div>

        {/* Action Buttons */}
        <div className="listing-actions">
          <button
            onClick={() => onViewDetails(listing.listingId)}
            className="btn btn-outline btn-sm"
          >
            View Details
          </button>
          <button
            onClick={() => onRent(listing.listingId)}
            disabled={!listing.isActive}
            className={`btn btn-sm ${listing.isActive ? 'btn-primary' : 'btn-secondary'}`}
          >
            {listing.isActive ? 'Rent Now' : 'Unavailable'}
          </button>
        </div>
      </div>
    </article>
  );
};
