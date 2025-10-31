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
  X,
  CheckCircle,
  Lock,
  Zap,
  Users,
  TrendingUp,
  Award,
  Clock,
  DollarSign,
  Smartphone,
  ExternalLink,
  BookOpen,
  Wallet
} from 'lucide-react';
import { WalletButton } from './components/WalletButton';
import { ThemeToggle } from './components/ThemeToggle';
import { ListingCard } from './components/ListingCard';
import { CreateListingModal } from './components/CreateListingModal';
import { NetworkWarning } from './components/NetworkWarning';
import { MockContractsSection } from './components/MockContractsSection';
import { RentalApplicationModal } from './components/RentalApplicationModal';
import { ListingDetailsModal } from './components/ListingDetailsModal';
import { useWeb3 } from './hooks/useWeb3';
import { useContracts } from './hooks/useContracts';
import { BrowseListingsPage } from './pages/BrowseListingsPage';
import { MyListingsPage } from './pages/MyListingsPage';
import { MyRentalsPage } from './pages/MyRentalsPage';
import { ReputationPage } from './pages/ReputationPage';
import { SubscriptionPage } from './pages/SubscriptionPage';

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
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    // Инициализируем состояние на основе размера экрана
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return false;
  });

  useEffect(() => {
    // Проверяем, мобильное ли устройство
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    const handleResize = () => {
      checkMobile();
    };

    window.addEventListener('resize', handleResize);

    const handleScroll = () => {
      const scrollPosition = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      const isMobileDevice = window.innerWidth <= 768;
      // Для мобилки порог меньше - более быстрая реакция
      const threshold = isMobileDevice ? 20 : 30;
      setIsScrolled(scrollPosition > threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Проверяем начальную позицию

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <header className={`app-header ${isScrolled ? 'scrolled' : ''} ${isMobile ? 'mobile' : ''}`}>
      <div className="container">
        <div className="header-container">
          <Link to="/" className="nav-brand">
            <div className="logo-mark">SR</div>
            <span>SmartRent</span>
          </Link>

          <Navigation />
          
          <div className="header-actions" style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
            <ThemeToggle />
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Главная', icon: Home },
    { path: '/listings', label: 'Объявления', icon: Search },
    { path: '/my-listings', label: 'Мои объявления', icon: User },
    { path: '/rentals', label: 'Мои аренды', icon: FileText },
    { path: '/subscription', label: 'Подписка', icon: Zap },
    { path: '/reputation', label: 'Репутация', icon: Star },
  ];

  // Закрываем меню при изменении маршрута
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Блокируем скролл body когда меню открыто
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="nav-menu desktop-nav">
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

      {/* Hamburger Button - только на мобильных */}
      <button
        className="hamburger-btn"
        onClick={toggleMenu}
        aria-label="Toggle menu"
        aria-expanded={isMenuOpen}
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMenu}>
          <div className="mobile-menu-sidebar" onClick={(e) => e.stopPropagation()}>
            {/* Menu Header */}
            <div className="mobile-menu-header">
              <div className="mobile-menu-logo">
                <div className="logo-mark">SR</div>
                <span>SmartRent</span>
              </div>
              <button
                className="mobile-menu-close-btn"
                onClick={closeMenu}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Menu Navigation */}
            <nav className="mobile-menu-nav">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`mobile-menu-link ${isActive ? 'active' : ''}`}
                    onClick={closeMenu}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

// ========== HOME PAGE ==========
const HomePage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedListingForRent, setSelectedListingForRent] = useState<any>(null);
  const [selectedListingForDetails, setSelectedListingForDetails] = useState<any>(null);
  const [featuredListings, setFeaturedListings] = useState<any[]>(mockListings);
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [, startTransition] = useTransition();
  const { isConnected, account } = useWeb3();
  const { getPlatformStatistics, getAllListings, isLoaded:  contractsLoaded } = useContracts();
  const [stats, setStats] = useState({ 
    totalListings: 0, 
    totalRentals: 0, 
    totalDisputes: 0, 
    totalVolume: 0 
  });

  // Загружаем статистику и листинги при подключении
  useEffect(() => {
    if (contractsLoaded && isConnected) {
      console.log('🔄 Contracts loaded, fetching data...');
      loadStats();
      loadFeaturedListings();
    }
  }, [contractsLoaded, isConnected, account]);

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
      // Use mock stats for demo
      startTransition(() => {
        setStats({
          totalListings: 5,
          totalRentals: 12,
          totalDisputes: 1,
          totalVolume: 15.5
        });
      });
    }
  };

  const loadFeaturedListings = async () => {
    console.log('📋 Loading featured listings from blockchain...');
    setIsLoadingListings(true);
    try {
      const allListings = await getAllListings();
      console.log('✅ Loaded listings:', allListings.length);
      
      // Show only active listings, max 3 for homepage
      const activeListings = allListings.filter(l => l.isActive).slice(0, 3);
      
      if (activeListings.length > 0) {
        console.log('📌 Setting featured listings:', activeListings.length);
        startTransition(() => {
          setFeaturedListings(activeListings);
        });
      } else {
        console.log('ℹ️ No blockchain listings, using mock data');
        // Если нет листингов из блокчейна, показываем моковые
        startTransition(() => {
          setFeaturedListings(mockListings);
        });
      }
    } catch (error) {
      console.error('Failed to load featured listings:', error);
      // Keep mock listings as fallback
      startTransition(() => {
        setFeaturedListings(mockListings);
      });
    } finally {
      setIsLoadingListings(false);
    }
  };

  const handleViewDetails = (listingId: number) => {
    const listing = featuredListings.find(l => l.listingId === listingId);
    if (listing) {
      setSelectedListingForDetails(listing);
      setIsDetailsModalOpen(true);
    }
  };

  const handleRent = (listingId: number) => {
    const listing = featuredListings.find(l => l.listingId === listingId);
    if (listing) {
      setSelectedListingForRent(listing);
      setIsRentalModalOpen(true);
    }
  };

  const handleRentalSuccess = () => {
    console.log('Rental application submitted successfully');
    setIsRentalModalOpen(false);
    setSelectedListingForRent(null);
    // Перезагрузим статистику
    loadStats();
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedListingForDetails(null);
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
    // Reload statistics and featured listings
    await loadStats();
    await loadFeaturedListings();
  };

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-card">
          <h1 className="hero-title">Зарабатывайте на сдаче<br/>недвижимости в аренду</h1>
          <p className="hero-subtitle">
            С крупнейшей децентрализованной платформой аренды на блокчейне Polygon
          </p>
          
          {/* Галочки преимуществ */}
          <div style={{
            display: 'flex',
            gap: 'var(--spacing-xl)',
            justifyContent: 'center',
            marginBottom: 'var(--spacing-xl)',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
              <CheckCircle size={18} color="white" />
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'white', fontWeight: 500 }}>
                Умные контракты
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
              <CheckCircle size={18} color="white" />
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'white', fontWeight: 500 }}>
                Гарантия безопасности
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
              <CheckCircle size={18} color="white" />
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'white', fontWeight: 500 }}>
                Низкая комиссия 2%
              </span>
            </div>
          </div>

          <div className="hero-actions">
            <button
              onClick={handleOpenModal}
              disabled={!isConnected}
              className="btn btn-primary btn-lg"
            >
              <Plus />
              Разместить объявление
            </button>
            <Link to="/listings" className="btn btn-secondary btn-lg" style={{ backgroundColor: 'white', color: '#000' }}>
              <Search />
              Найти недвижимость
            </Link>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="section">
        <div className="container">
          <div className="grid grid-cols-4">
            <div className="card stats-card" style={{ backgroundColor: 'var(--color-primary-bg)', border: 'none' }}>
              <div className="stats-value primary">{stats.totalListings}</div>
              <div className="stats-label">Активных объявлений</div>
            </div>
            <div className="card stats-card" style={{ backgroundColor: 'var(--color-accent-bg)', border: 'none' }}>
              <div className="stats-value success">{stats.totalRentals}</div>
              <div className="stats-label">Всего сделок</div>
            </div>
            <div className="card stats-card" style={{ backgroundColor: 'var(--color-warning-bg)', border: 'none' }}>
              <div className="stats-value warning">{stats.totalDisputes}</div>
              <div className="stats-label">Споров</div>
            </div>
            <div className="card stats-card" style={{ backgroundColor: 'var(--color-primary-bg)', border: 'none' }}>
              <div className="stats-value" style={{ color: 'var(--color-primary)' }}>{stats.totalVolume.toFixed(2)}</div>
              <div className="stats-label">Объём (MATIC)</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section features-section">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="section-title" style={{ fontSize: '3rem', fontWeight: 800 }}>
              Почему выбирают SmartRent
            </h2>
            <p className="section-subtitle">
              Современная платформа для безопасной аренды недвижимости на блокчейне
            </p>
          </div>

          <div className="grid grid-cols-3">
            <div className="feature-card">
              <div className="feature-icon" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
                <Lock color="var(--color-primary)" />
              </div>
              <h3 className="feature-title">Гарантия безопасности</h3>
              <p className="feature-description">
                Все сделки защищены смарт-контрактами на блокчейне Polygon. 
                Ваши средства в безопасности благодаря технологии Escrow.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ backgroundColor: 'var(--color-accent-bg)' }}>
                <Users color="var(--color-accent)" />
              </div>
              <h3 className="feature-title">Растущая аудитория</h3>
              <p className="feature-description">
                Доступ к тысячам потенциальных арендаторов. 
                Ваши объявления видят пользователи из разных стран.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ backgroundColor: '#f3e8ff' }}>
                <DollarSign color="#9333ea" />
              </div>
              <h3 className="feature-title">Прозрачные выплаты</h3>
              <p className="feature-description">
                Автоматические выплаты через смарт-контракты. 
                Комиссия всего 2%, без скрытых платежей.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ backgroundColor: 'var(--color-warning-bg)' }}>
                <Shield color="var(--color-warning)" />
              </div>
              <h3 className="feature-title">Защита от споров</h3>
              <p className="feature-description">
                Встроенная система арбитража для решения конфликтных ситуаций. 
                Справедливое разрешение споров.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ backgroundColor: '#fce7f3' }}>
                <Award color="#ec4899" />
              </div>
              <h3 className="feature-title">Репутационная система</h3>
              <p className="feature-description">
                Система оценок и отзывов на блокчейне. 
                Выбирайте проверенных партнёров для сделок.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ backgroundColor: '#d1fae5' }}>
                <TrendingUp color="#059669" />
              </div>
              <h3 className="feature-title">Аналитика доходов</h3>
              <p className="feature-description">
                Отслеживайте доходность ваших объектов. 
                Расширенная статистика для Pro и Premium подписчиков.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section how-it-works-section">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="section-title" style={{ fontSize: '3rem', fontWeight: 800 }}>
              Как это работает
            </h2>
            <p className="section-subtitle">
              Четыре простых шага до заключения сделки
            </p>
          </div>

          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3 className="step-title">Подключите кошелёк</h3>
                <p className="step-description">
                  Подключите MetaMask или другой Web3 кошелёк 
                  к платформе SmartRent для безопасной работы
                </p>
              </div>
            </div>

            <div className="step-arrow">→</div>

            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3 className="step-title">Разместите объявление</h3>
                <p className="step-description">
                  Создайте объявление с фотографиями, описанием 
                  и условиями аренды вашей недвижимости
                </p>
              </div>
            </div>

            <div className="step-arrow">→</div>

            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3 className="step-title">Получайте отклики</h3>
                <p className="step-description">
                  Арендаторы подают заявки на вашу недвижимость. 
                  Выберите подходящего кандидата
                </p>
              </div>
            </div>

            <div className="step-arrow">→</div>

            <div className="step-card">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3 className="step-title">Заключите сделку</h3>
                <p className="step-description">
                  Смарт-контракт автоматически фиксирует условия, 
                  защищает депозит и выплаты
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings Section */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title" style={{ fontSize: '2.5rem', fontWeight: 800 }}>
                Популярные предложения
              </h2>
              {isConnected && contractsLoaded && (
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  {isLoadingListings ? '🔄 Загрузка из блокчейна...' : '✅ Данные из смарт-контрактов'}
                </p>
              )}
              {!isConnected && (
                <p style={{ color: 'var(--color-warning)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  ⚠️ Подключите кошелек для загрузки реальных листингов
                </p>
              )}
            </div>
            <Link to="/listings" className="btn btn-outline">
              Все предложения →
            </Link>
          </div>

          {isLoadingListings ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
              <p>Загрузка листингов из блокчейна...</p>
            </div>
          ) : (
            <div className="grid grid-cols-3">
              {featuredListings.length > 0 ? (
                featuredListings.map((listing) => (
                  <ListingCard
                    key={listing.listingId}
                    listing={listing}
                    onViewDetails={handleViewDetails}
                    onRent={handleRent}
                  />
                ))
              ) : (
                <div style={{ 
                  gridColumn: '1 / -1', 
                  textAlign: 'center', 
                  padding: '3rem',
                  color: 'var(--color-text-secondary)'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📭</div>
                  <p>Пока нет листингов</p>
                  <button
                    onClick={handleOpenModal}
                    disabled={!isConnected}
                    className="btn btn-primary"
                    style={{ marginTop: '1rem' }}
                  >
                    <Plus />
                    Создать первый листинг
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Active Contracts Section - всегда показываем демо данные */}
      <MockContractsSection />

      {/* Benefits Section */}
      <section className="section benefits-section">
        <div className="container">
          <div className="benefits-grid">
            <div className="benefit-item">
              <Users className="benefit-icon" />
              <div className="benefit-content">
                <h3 className="benefit-title">Растущее сообщество</h3>
                <p className="benefit-description">
                  Присоединяйтесь к тысячам пользователей, которые уже 
                  используют SmartRent для аренды
                </p>
              </div>
            </div>

            <div className="benefit-item">
              <TrendingUp className="benefit-icon" />
              <div className="benefit-content">
                <h3 className="benefit-title">Прозрачность</h3>
                <p className="benefit-description">
                  Все транзакции записываются в блокчейн и доступны 
                  для проверки
                </p>
              </div>
            </div>

            <div className="benefit-item">
              <Clock className="benefit-icon" />
              <div className="benefit-content">
                <h3 className="benefit-title">24/7 доступность</h3>
                <p className="benefit-description">
                  Платформа работает круглосуточно без выходных 
                  и технических перерывов
                </p>
              </div>
            </div>

            <div className="benefit-item">
              <Smartphone className="benefit-icon" />
              <div className="benefit-content">
                <h3 className="benefit-title">Удобный интерфейс</h3>
                <p className="benefit-description">
                  Интуитивно понятная платформа, доступная с любого 
                  устройства
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-card">
            <h2 className="cta-title">Готовы начать?</h2>
            <p className="cta-description">
              Подключите кошелек и начните пользоваться преимуществами 
              децентрализованной аренды уже сегодня
            </p>
            <div className="cta-actions">
              <button
                onClick={handleOpenModal}
                disabled={!isConnected}
                className="btn btn-primary btn-lg"
              >
                <Plus />
                Разместить объявление
              </button>
              <Link to="/listings" className="btn btn-secondary btn-lg">
                <Search />
                Найти недвижимость
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Create Listing Modal */}
      <CreateListingModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleListingCreated}
      />

      {/* Rental Application Modal */}
      <RentalApplicationModal
        isOpen={isRentalModalOpen}
        onClose={() => {
          setIsRentalModalOpen(false);
          setSelectedListingForRent(null);
        }}
        listing={selectedListingForRent}
        onSuccess={handleRentalSuccess}
      />

      {/* Listing Details Modal */}
      <ListingDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        listing={selectedListingForDetails}
      />
    </>
  );
};

// ========== FOOTER COMPONENT ==========
const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="footer-brand-section">
              <div className="footer-logo">
                <div className="logo-mark">SR</div>
                <span>SmartRent</span>
              </div>
              <p className="footer-brand-description">
                Децентрализованная платформа для безопасной аренды 
                недвижимости на блокчейне Polygon
              </p>
              <div className="footer-social">
                <a href="#" className="social-link" aria-label="Twitter">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                  </svg>
                </a>
                <a href="#" className="social-link" aria-label="GitHub">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                </a>
                <a href="#" className="social-link" aria-label="Discord">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </a>
                <a href="#" className="social-link" aria-label="Telegram">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.781-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.121.099.155.232.171.326.016.093.036.306.02.472z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Платформа</h4>
            <ul className="footer-links">
              <li><Link to="/listings" className="footer-link">Все объявления</Link></li>
              <li><Link to="/my-listings" className="footer-link">Мои объявления</Link></li>
              <li><Link to="/rentals" className="footer-link">Мои аренды</Link></li>
              <li><Link to="/reputation" className="footer-link">Репутация</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Ресурсы</h4>
            <ul className="footer-links">
              <li><a href="#" className="footer-link">Документация</a></li>
              <li><a href="#" className="footer-link">API</a></li>
              <li><a href="#" className="footer-link">Блог</a></li>
              <li><a href="#" className="footer-link">FAQ</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Компания</h4>
            <ul className="footer-links">
              <li><a href="#" className="footer-link">О нас</a></li>
              <li><a href="#" className="footer-link">Карьера</a></li>
              <li><a href="#" className="footer-link">Поддержка</a></li>
              <li><a href="#" className="footer-link">Контакты</a></li>
            </ul>
          </div>

        </div>

        <div className="footer-bottom">
          <div className="footer-copyright">
            © 2025 SmartRent. Все права защищены. Powered by Polygon Network.
          </div>
          <div className="footer-links-row">
            <a href="#" className="footer-link">Условия использования</a>
            <span className="footer-divider">•</span>
            <a href="#" className="footer-link">Политика конфиденциальности</a>
            <span className="footer-divider">•</span>
            <a href="#" className="footer-link">Поддержка</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// ========== MAIN APP COMPONENT ==========
const App: React.FC = () => {
  const { chainId, switchToHardhat, switchToAmoy } = useWeb3();

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <Header />
      <NetworkWarning 
        currentChainId={chainId} 
        onSwitchToHardhat={switchToHardhat}
        onSwitchToAmoy={switchToAmoy}
      />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/listings" element={<BrowseListingsPage />} />
          <Route path="/my-listings" element={<MyListingsPage />} />
          <Route path="/rentals" element={<MyRentalsPage />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
          <Route path="/reputation" element={<ReputationPage />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
};

export default App;
