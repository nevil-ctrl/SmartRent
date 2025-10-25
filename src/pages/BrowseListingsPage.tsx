import React, { useState, useEffect, useTransition } from 'react';
import { Search, Filter, MapPin, DollarSign, Home } from 'lucide-react';
import { ListingCard } from '../components/ListingCard';
import { ListingDetailsModal } from '../components/ListingDetailsModal';
import { useContracts } from '../hooks/useContracts';

// Mock data for demo when contracts not loaded
const MOCK_LISTINGS = [
  {
    listingId: 1,
    landlord: '0x1234567890123456789012345678901234567890',
    title: 'Modern Apartment in Downtown',
    description: 'Beautiful 2-bedroom apartment with stunning city views. Fully furnished and equipped with modern amenities including WiFi, AC, and parking.',
    pricePerDay: '0.5',
    deposit: '5.0',
    isActive: true,
    ipfsHash: 'QmExampleHash1',
    createdAt: Math.floor(Date.now() / 1000) - 86400,
    updatedAt: Math.floor(Date.now() / 1000) - 86400,
  },
  {
    listingId: 2,
    landlord: '0x2345678901234567890123456789012345678901',
    title: 'Cozy Studio Near University',
    description: 'Perfect for students or young professionals. Close to public transport and university campus. Includes utilities and internet.',
    pricePerDay: '0.3',
    deposit: '3.0',
    isActive: true,
    ipfsHash: 'QmExampleHash2',
    createdAt: Math.floor(Date.now() / 1000) - 172800,
    updatedAt: Math.floor(Date.now() / 1000) - 172800,
  },
  {
    listingId: 3,
    landlord: '0x3456789012345678901234567890123456789012',
    title: 'Luxury Penthouse with Pool',
    description: 'Exclusive penthouse with private pool and panoramic city views. Perfect for special occasions. 24/7 security and concierge.',
    pricePerDay: '2.0',
    deposit: '20.0',
    isActive: false,
    ipfsHash: 'QmExampleHash3',
    createdAt: Math.floor(Date.now() / 1000) - 259200,
    updatedAt: Math.floor(Date.now() / 1000) - 259200,
  },
  {
    listingId: 4,
    landlord: '0x4567890123456789012345678901234567890123',
    title: 'Beachfront Villa with Garden',
    description: 'Stunning villa right on the beach. Private garden, BBQ area, and direct beach access. Sleeps up to 8 people.',
    pricePerDay: '1.5',
    deposit: '15.0',
    isActive: true,
    ipfsHash: 'QmExampleHash4',
    createdAt: Math.floor(Date.now() / 1000) - 345600,
    updatedAt: Math.floor(Date.now() / 1000) - 345600,
  },
  {
    listingId: 5,
    landlord: '0x5678901234567890123456789012345678901234',
    title: 'Mountain Cabin Retreat',
    description: 'Peaceful mountain cabin perfect for weekend getaways. Fireplace, hiking trails, and beautiful nature views.',
    pricePerDay: '0.8',
    deposit: '8.0',
    isActive: true,
    ipfsHash: 'QmExampleHash5',
    createdAt: Math.floor(Date.now() / 1000) - 432000,
    updatedAt: Math.floor(Date.now() / 1000) - 432000,
  },
];

export const BrowseListingsPage: React.FC = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [filteredListings, setFilteredListings] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [, startTransition] = useTransition();
  const { getAllListings } = useContracts();

  useEffect(() => {
    loadListings();
  }, []);

  useEffect(() => {
    filterListings();
  }, [searchQuery, showActiveOnly, listings]);

  const loadListings = async () => {
    setIsLoading(true);
    try {
      const allListings = await getAllListings();
      startTransition(() => {
        // Use mock data if no listings from contract
        if (allListings.length === 0) {
          console.log('📋 Using mock listings for demo');
          setListings(MOCK_LISTINGS);
        } else {
          setListings(allListings);
        }
        setIsLoading(false);
      });
    } catch (error) {
      console.error('Failed to load listings:', error);
      // Use mock data on error
      startTransition(() => {
        console.log('📋 Using mock listings (fallback)');
        setListings(MOCK_LISTINGS);
        setIsLoading(false);
      });
    }
  };

  const filterListings = () => {
    let filtered = [...listings];

    // Filter by active status
    if (showActiveOnly) {
      filtered = filtered.filter(l => l.isActive);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(l => 
        l.title.toLowerCase().includes(query) || 
        l.description.toLowerCase().includes(query)
      );
    }

    startTransition(() => {
      setFilteredListings(filtered);
    });
  };

  const handleViewDetails = (listingId: number) => {
    const listing = listings.find(l => l.listingId === listingId);
    if (listing) {
      setSelectedListing(listing);
    }
  };

  const handleRent = (listingId: number) => {
    console.log('Rent listing:', listingId);
    // TODO: Open rental modal
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    startTransition(() => {
      setSearchQuery(e.target.value);
    });
  };

  const handleToggleActiveOnly = () => {
    startTransition(() => {
      setShowActiveOnly(!showActiveOnly);
    });
  };

  return (
    <>
      <ListingDetailsModal
        isOpen={!!selectedListing}
        onClose={() => setSelectedListing(null)}
        listing={selectedListing}
      />

      <section className="section">
        <div className="container">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="section-title">Browse Properties</h1>
          <p className="section-subtitle">
            Find your perfect rental property on the blockchain
          </p>
        </div>

        {/* Search and Filters */}
        <div className="card" style={{ marginBottom: 'var(--spacing-xl)', padding: 'var(--spacing-lg)' }}>
          <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-md)', alignItems: 'center' }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  width: '20px',
                  height: '20px',
                  color: 'var(--color-text-muted)'
                }} 
              />
              <input
                type="text"
                placeholder="Search by title or description..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="form-input"
                style={{ paddingLeft: '40px' }}
              />
            </div>

            {/* Filter Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              <button
                onClick={handleToggleActiveOnly}
                className={`btn ${showActiveOnly ? 'btn-primary' : 'btn-outline'}`}
              >
                <Filter style={{ width: '18px', height: '18px' }} />
                {showActiveOnly ? 'Active Only' : 'Show All'}
              </button>
              
              <div style={{ 
                marginLeft: 'auto',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)'
              }}>
                {filteredListings.length} properties found
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
            <p style={{ marginTop: 'var(--spacing-md)', color: 'var(--color-text-secondary)' }}>
              Loading properties...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredListings.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
            <Home style={{ width: '64px', height: '64px', margin: '0 auto', color: 'var(--color-text-muted)' }} />
            <h3 style={{ marginTop: 'var(--spacing-lg)', fontSize: 'var(--font-size-xl)' }}>
              No properties found
            </h3>
            <p style={{ marginTop: 'var(--spacing-sm)', color: 'var(--color-text-secondary)' }}>
              {searchQuery ? 'Try adjusting your search criteria' : 'Be the first to list a property!'}
            </p>
          </div>
        )}

        {/* Listings Grid */}
        {!isLoading && filteredListings.length > 0 && (
          <div className="grid grid-cols-3">
            {filteredListings.map((listing) => (
              <ListingCard
                key={listing.listingId}
                listing={listing}
                onViewDetails={handleViewDetails}
                onRent={handleRent}
              />
            ))}
          </div>
        )}
      </div>
    </section>
    </>
  );
};
