import React, { useState, useEffect, useTransition } from 'react';
import { Search, Filter, MapPin, DollarSign, Home } from 'lucide-react';
import { ListingCard } from '../components/ListingCard';
import { useContracts } from '../hooks/useContracts';

export const BrowseListingsPage: React.FC = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [filteredListings, setFilteredListings] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showActiveOnly, setShowActiveOnly] = useState(true);
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
        setListings(allListings);
        setIsLoading(false);
      });
    } catch (error) {
      console.error('Failed to load listings:', error);
      setIsLoading(false);
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
    console.log('View details for listing:', listingId);
    // TODO: Navigate to listing details page
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
  );
};
