import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Plus, 
  Search, 
  User, 
  FileText, 
  Shield, 
  Star,
  Menu,
  X
} from 'lucide-react';
import { WalletButton } from './components/WalletButton';
import { ListingCard } from './components/ListingCard';
import { CreateListingModal } from './components/CreateListingModal';
import { useWeb3 } from './hooks/useWeb3';
import { useContracts } from './hooks/useContracts';

// Mock data for demonstration
const mockListings = [
  {
    listingId: 1,
    landlord: '0x1234567890123456789012345678901234567890',
    title: 'Modern Apartment in Downtown',
    description: 'Beautiful 2-bedroom apartment with stunning city views. Fully furnished and equipped with modern amenities.',
    pricePerDay: '0.5',
    deposit: '5.0',
    isActive: true,
    ipfsHash: 'QmExample1',
    createdAt: Math.floor(Date.now() / 1000) - 86400,
    updatedAt: Math.floor(Date.now() / 1000) - 86400,
  },
  {
    listingId: 2,
    landlord: '0x2345678901234567890123456789012345678901',
    title: 'Cozy Studio Near University',
    description: 'Perfect for students or young professionals. Close to public transport and university campus.',
    pricePerDay: '0.3',
    deposit: '3.0',
    isActive: true,
    ipfsHash: 'QmExample2',
    createdAt: Math.floor(Date.now() / 1000) - 172800,
    updatedAt: Math.floor(Date.now() / 1000) - 172800,
  },
  {
    listingId: 3,
    landlord: '0x3456789012345678901234567890123456789012',
    title: 'Luxury Penthouse with Pool',
    description: 'Exclusive penthouse with private pool and panoramic city views. Perfect for special occasions.',
    pricePerDay: '2.0',
    deposit: '20.0',
    isActive: false,
    ipfsHash: 'QmExample3',
    createdAt: Math.floor(Date.now() / 1000) - 259200,
    updatedAt: Math.floor(Date.now() / 1000) - 259200,
  },
];

const Navigation: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/listings', label: 'Browse', icon: Search },
    { path: '/my-listings', label: 'My Listings', icon: User },
    { path: '/rentals', label: 'My Rentals', icon: FileText },
    { path: '/disputes', label: 'Disputes', icon: Shield },
    { path: '/reputation', label: 'Reputation', icon: Star },
  ];

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar__inner">
          {/* Logo */}
          <Link to="/" className="brand">
            <div className="logo-mark">
              <span className="text-white font-bold text-sm">SR</span>
            </div>
            <span className="brand__name">SmartRent</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="nav-links md:flex hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${isActive ? 'is-active' : ''}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
      </div>

          {/* Wallet Button */}
          <div className="nav-actions">
            <WalletButton />
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="mobile-toggle md:hidden"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="mobile-menu md:hidden">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`mobile-menu__item ${isActive ? 'is-active' : ''}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

const HomePage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { isConnected } = useWeb3();
  const { getPlatformStatistics } = useContracts();
  const [stats, setStats] = useState({ totalListings: 0, totalRentals: 0, totalDisputes: 0, totalVolume: 0 });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const statistics = await getPlatformStatistics();
        setStats({
          totalListings: Number(statistics[0]),
          totalRentals: Number(statistics[1]),
          totalDisputes: Number(statistics[2]),
          totalVolume: Number(statistics[3]) / 1e18, // Convert from wei to MATIC
        });
      } catch (error) {
        console.error('Failed to load statistics:', error);
      }
    };

    loadStats();
  }, [getPlatformStatistics]);

  const handleViewDetails = (listingId: number) => {
    console.log('View details for listing:', listingId);
  };

  const handleRent = (listingId: number) => {
    console.log('Rent listing:', listingId);
  };

  return (
    <div className="app">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="container px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Decentralized Property Rental
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Rent properties securely on Polygon with smart contracts and IPFS storage
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 space-x-0 sm:space-x-4 justify-center">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                disabled={!isConnected}
                className="btn-primary bg-white text-blue-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5 mr-2" />
                List Your Property
              </button>
              <button className="btn-outline border-white text-white hover:bg-white hover:text-blue-600">
                <Search className="w-5 h-5 mr-2" />
                Browse Properties
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="container px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="card text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalListings}</div>
            <div className="text-gray-600">Total Listings</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{stats.totalRentals}</div>
            <div className="text-gray-600">Completed Rentals</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.totalDisputes}</div>
            <div className="text-gray-600">Disputes Resolved</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{stats.totalVolume.toFixed(2)}</div>
            <div className="text-gray-600">Total Volume (MATIC)</div>
          </div>
        </div>
      </div>

      {/* Featured Listings */}
      <div className="container px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Featured Properties</h2>
          <Link to="/listings" className="text-blue-600 hover:text-blue-700 font-medium">
            View All →
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockListings.map((listing) => (
            <ListingCard
              key={listing.listingId}
              listing={listing}
              onViewDetails={handleViewDetails}
              onRent={handleRent}
            />
          ))}
        </div>
      </div>

      {/* Create Listing Modal */}
      <CreateListingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          console.log('Listing created successfully');
          // Refresh listings or show success message
        }}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/listings" element={<div className="p-8 text-center">Browse Listings - Coming Soon</div>} />
          <Route path="/my-listings" element={<div className="p-8 text-center">My Listings - Coming Soon</div>} />
          <Route path="/rentals" element={<div className="p-8 text-center">My Rentals - Coming Soon</div>} />
          <Route path="/disputes" element={<div className="p-8 text-center">Disputes - Coming Soon</div>} />
          <Route path="/reputation" element={<div className="p-8 text-center">Reputation - Coming Soon</div>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
