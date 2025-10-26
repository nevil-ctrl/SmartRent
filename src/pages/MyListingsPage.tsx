import React, { useState, useEffect, useTransition } from 'react';
import { Plus, Home } from 'lucide-react';
import { ListingCard } from '../components/ListingCard';
import { CreateListingModal } from '../components/CreateListingModal';
import { ListingDetailsModal } from '../components/ListingDetailsModal';
import { useContracts } from '../hooks/useContracts';
import { useWeb3 } from '../hooks/useWeb3';

export const MyListingsPage: React.FC = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [, startTransition] = useTransition();
  const { getUserListings } = useContracts();
  const { account, isConnected } = useWeb3();

  useEffect(() => {
    if (isConnected && account) {
      loadMyListings();
    } else {
      setIsLoading(false);
      setListings([]);
    }
  }, [isConnected, account]);

  const loadMyListings = async () => {
    if (!account) return;
    
    setIsLoading(true);
    try {
      const userListings = await getUserListings(account);
      startTransition(() => {
        setListings(userListings);
        setIsLoading(false);
      });
    } catch (error) {
      console.error('Failed to load my listings:', error);
      setIsLoading(false);
    }
  };

  const handleOpenModal = () => {
    startTransition(() => {
      setIsCreateModalOpen(true);
    });
  };

  const handleCloseModal = () => {
    startTransition(() => {
      setIsCreateModalOpen(false);
    });
  };

  const handleListingCreated = async () => {
    console.log('Listing created successfully');
    handleCloseModal();
    // Reload listings after creation
    await loadMyListings();
  };

  const handleViewDetails = (listingId: number) => {
    const listing = listings.find(l => l.listingId === listingId);
    if (listing) {
      setSelectedListing(listing);
    }
  };

  const handleEditListing = (listingId: number) => {
    console.log('Edit listing:', listingId);
    // TODO: Open edit modal
  };

  // Not connected state
  if (!isConnected) {
    return (
      <section className="section">
        <div className="container">
          <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
            <Home style={{ width: '64px', height: '64px', margin: '0 auto', color: 'var(--color-text-muted)' }} />
            <h3 style={{ marginTop: 'var(--spacing-lg)', fontSize: 'var(--font-size-xl)' }}>
              Connect Your Wallet
            </h3>
            <p style={{ marginTop: 'var(--spacing-sm)', color: 'var(--color-text-secondary)' }}>
              Please connect your wallet to view your listings
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container">
        {/* Page Header */}
        <div className="section-header" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <div>
            <h1 className="section-title">My Listings</h1>
            <p className="section-subtitle">
              Manage your property listings
            </p>
          </div>
          <button
            onClick={handleOpenModal}
            className="btn btn-primary btn-lg"
          >
            <Plus />
            Create Listing
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
            <p style={{ marginTop: 'var(--spacing-md)', color: 'var(--color-text-secondary)' }}>
              Loading your listings...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && listings.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
            <Home style={{ width: '64px', height: '64px', margin: '0 auto', color: 'var(--color-text-muted)' }} />
            <h3 style={{ marginTop: 'var(--spacing-lg)', fontSize: 'var(--font-size-xl)' }}>
              No Listings Yet
            </h3>
            <p style={{ marginTop: 'var(--spacing-sm)', color: 'var(--color-text-secondary)' }}>
              Create your first property listing to get started
            </p>
            <button
              onClick={handleOpenModal}
              className="btn btn-primary"
              style={{ marginTop: 'var(--spacing-lg)' }}
            >
              <Plus />
              Create Your First Listing
            </button>
          </div>
        )}

        {/* Statistics */}
        {!isLoading && listings.length > 0 && (
          <div className="grid grid-cols-3" style={{ marginBottom: 'var(--spacing-xl)' }}>
            <div className="card stats-card">
              <div className="stats-value primary">{listings.length}</div>
              <div className="stats-label">Total Listings</div>
            </div>
            <div className="card stats-card">
              <div className="stats-value success">
                {listings.filter(l => l.isActive).length}
              </div>
              <div className="stats-label">Active Listings</div>
            </div>
            <div className="card stats-card">
              <div className="stats-value warning">
                {listings.filter(l => !l.isActive).length}
              </div>
              <div className="stats-label">Inactive Listings</div>
            </div>
          </div>
        )}

        {/* Listings Grid */}
        {!isLoading && listings.length > 0 && (
          <div className="grid grid-cols-3">
            {listings.map((listing) => (
              <ListingCard
                key={listing.listingId}
                listing={listing}
                onViewDetails={handleViewDetails}
                onRent={handleEditListing}
              />
            ))}
          </div>
        )}

        {/* Create Listing Modal */}
        <CreateListingModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseModal}
          onSuccess={handleListingCreated}
        />

        {/* Listing Details Modal */}
        <ListingDetailsModal
          isOpen={!!selectedListing}
          onClose={() => setSelectedListing(null)}
          listing={selectedListing}
        />
      </div>
    </section>
  );
};
