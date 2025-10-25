import React, { useState, useEffect, useTransition } from 'react';
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

// ========== HEADER COMPONENT ==========
const Header: React.FC = () => {
  return (
    <header className="app-header">
      <div className="container">
        <div className="header-container">
          <Link to="/" className="nav-brand">
            <div className="logo-mark">SR</div>
            <span>SmartRent</span>
          </Link>

          <Navigation />
          
          <div className="wallet-container">
            <WalletButton />
          </div>
        </div>
      </div>
    </header>
  );
};

// ========== NAVIGATION COMPONENT ==========
const Navigation: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/listings', label: 'Browse', icon: Search },
    { path: '/my-listings', label: 'My Listings', icon: User },
    { path: '/rentals', label: 'My Rentals', icon: FileText },
    { path: '/disputes', label: 'Disputes', icon: Shield },
    { path: '/reputation', label: 'Reputation', icon: Star },
  ];

  const handleMenuToggle = () => {
    startTransition(() => {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    });
  };

  const handleLinkClick = () => {
    startTransition(() => {
      setIsMobileMenuOpen(false);
    });
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="nav-menu">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile Menu Toggle */}
      <button
        onClick={handleMenuToggle}
        className="mobile-menu-toggle"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X /> : <Menu />}
      </button>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="mobile-menu open">
          <nav className="nav-menu">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleLinkClick}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  <Icon />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
};

// ========== HOME PAGE ==========
const HomePage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { isConnected } = useWeb3();
  const { getPlatformStatistics } = useContracts();
  const [stats, setStats] = useState({ 
    totalListings: 0, 
    totalRentals: 0, 
    totalDisputes: 0, 
    totalVolume: 0 
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const statistics = await getPlatformStatistics();
        startTransition(() => {
          setStats({
            totalListings: Number(statistics[0]),
            totalRentals: Number(statistics[1]),
            totalDisputes: Number(statistics[2]),
            totalVolume: Number(statistics[3]) / 1e18, // Convert from wei to MATIC
          });
        });
      } catch (error) {
        console.error('Failed to load statistics:', error);
        // Stats остаются в значении по умолчанию (0)
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

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">Decentralized Property Rental</h1>
          <p className="hero-subtitle">
            Rent properties securely on Polygon with smart contracts and IPFS storage
          </p>
          <div className="hero-actions">
            <button
              onClick={handleOpenModal}
              disabled={!isConnected}
              className="btn btn-outline-light btn-lg"
            >
              <Plus />
              List Your Property
            </button>
            <Link to="/listings" className="btn btn-outline-light btn-lg">
              <Search />
              Browse Properties
            </Link>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="section">
        <div className="container">
          <div className="grid grid-cols-4">
            <div className="card stats-card">
              <div className="stats-value primary">{stats.totalListings}</div>
              <div className="stats-label">Total Listings</div>
            </div>
            <div className="card stats-card">
              <div className="stats-value success">{stats.totalRentals}</div>
              <div className="stats-label">Completed Rentals</div>
            </div>
            <div className="card stats-card">
              <div className="stats-value warning">{stats.totalDisputes}</div>
              <div className="stats-label">Disputes Resolved</div>
            </div>
            <div className="card stats-card">
              <div className="stats-value primary">{stats.totalVolume.toFixed(2)}</div>
              <div className="stats-label">Total Volume (MATIC)</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings Section */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Properties</h2>
            <Link to="/listings" className="btn btn-outline">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-3">
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
      </section>

      {/* Create Listing Modal */}
      <CreateListingModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        onSuccess={() => {
          console.log('Listing created successfully');
          handleCloseModal();
        }}
      />
    </>
  );
};

// ========== PLACEHOLDER PAGES ==========
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => {
  return (
    <section className="section">
      <div className="container">
        <div className="text-center">
          <h2>{title}</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>Coming Soon</p>
        </div>
      </div>
    </section>
  );
};

// ========== FOOTER COMPONENT ==========
const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">SmartRent</div>
          <ul className="footer-links">
            <li><a href="#" className="footer-link">About</a></li>
            <li><a href="#" className="footer-link">Documentation</a></li>
            <li><a href="#" className="footer-link">Support</a></li>
            <li><a href="#" className="footer-link">GitHub</a></li>
          </ul>
          <div className="footer-copyright">
            © 2025 SmartRent. Powered by Polygon.
          </div>
        </div>
      </div>
    </footer>
  );
};

// ========== MAIN APP COMPONENT ==========
const App: React.FC = () => {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <Header />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/listings" element={<PlaceholderPage title="Browse Listings" />} />
          <Route path="/my-listings" element={<PlaceholderPage title="My Listings" />} />
          <Route path="/rentals" element={<PlaceholderPage title="My Rentals" />} />
          <Route path="/disputes" element={<PlaceholderPage title="Disputes" />} />
          <Route path="/reputation" element={<PlaceholderPage title="Reputation" />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
};

export default App;
