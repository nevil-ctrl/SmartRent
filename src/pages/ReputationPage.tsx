import React, { useState, useEffect, useTransition } from 'react';
import { Star, Award, TrendingUp, CheckCircle, AlertCircle, User, Shield } from 'lucide-react';
import { useWeb3 } from '../hooks/useWeb3';
import { useContracts } from '../hooks/useContracts';

interface UserReputation {
  user: string;
  totalReviews: bigint;
  totalRatingSum: bigint;
  reputationScore: bigint;
  completedRentals: bigint;
  cancelledRentals: bigint;
  disputeCount: bigint;
  isVerified: boolean;
  lastUpdated: bigint;
}

export const ReputationPage: React.FC = () => {
  const [reputation, setReputation] = useState<UserReputation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, startTransition] = useTransition();
  const { account, isConnected } = useWeb3();
  const { getUserReputation } = useContracts();

  useEffect(() => {
    if (isConnected && account) {
      loadReputation();
    } else {
      setIsLoading(false);
    }
  }, [isConnected, account]);

  const loadReputation = async () => {
    if (!account) return;
    
    setIsLoading(true);
    try {
      const rep = await getUserReputation(account);
      startTransition(() => {
        setReputation(rep);
        setIsLoading(false);
      });
    } catch (error) {
      console.error('Failed to load reputation:', error);
      setIsLoading(false);
    }
  };

  const getReputationLevel = (score: number): { level: string; color: string; description: string } => {
    if (score >= 450) {
      return {
        level: 'Excellent',
        color: 'var(--color-secondary)',
        description: 'Outstanding reputation! You are a trusted member of the community.'
      };
    } else if (score >= 350) {
      return {
        level: 'Good',
        color: 'var(--color-primary)',
        description: 'Good reputation. Keep up the great work!'
      };
    } else if (score >= 250) {
      return {
        level: 'Fair',
        color: 'var(--color-warning)',
        description: 'Fair reputation. There\'s room for improvement.'
      };
    } else if (score > 0) {
      return {
        level: 'Poor',
        color: 'var(--color-danger)',
        description: 'Poor reputation. Consider improving your service quality.'
      };
    } else {
      return {
        level: 'New User',
        color: 'var(--color-text-muted)',
        description: 'No reviews yet. Complete your first rental to start building reputation.'
      };
    }
  };

  const calculateAverageRating = (score: bigint): string => {
    if (score === BigInt(0)) return '0.00';
    return (Number(score) / 100).toFixed(2);
  };

  const renderStars = (score: bigint) => {
    const rating = Number(score) / 100;
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(<Star key={i} fill="var(--color-warning)" color="var(--color-warning)" size={24} />);
      } else if (rating >= i - 0.5) {
        stars.push(<Star key={i} fill="var(--color-warning)" color="var(--color-warning)" size={24} style={{ clipPath: 'inset(0 50% 0 0)' }} />);
      } else {
        stars.push(<Star key={i} color="var(--color-text-muted)" size={24} />);
      }
    }
    
    return stars;
  };

  if (!isConnected) {
    return (
      <section className="section">
        <div className="container">
          <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
            <Shield style={{ width: '64px', height: '64px', margin: '0 auto', color: 'var(--color-text-muted)' }} />
            <h3 style={{ marginTop: 'var(--spacing-lg)', fontSize: 'var(--font-size-xl)' }}>
              Connect Your Wallet
            </h3>
            <p style={{ marginTop: 'var(--spacing-sm)', color: 'var(--color-text-secondary)' }}>
              Please connect your wallet to view your reputation
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
            <p style={{ marginTop: 'var(--spacing-md)', color: 'var(--color-text-secondary)' }}>
              Loading reputation...
            </p>
          </div>
        </div>
      </section>
    );
  }

  const reputationScore = reputation ? Number(reputation.reputationScore) : 0;
  const reputationInfo = getReputationLevel(reputationScore);
  const averageRating = reputation ? calculateAverageRating(reputation.reputationScore) : '0.00';
  const totalReviews = reputation ? Number(reputation.totalReviews) : 0;
  const completedRentals = reputation ? Number(reputation.completedRentals) : 0;
  const cancelledRentals = reputation ? Number(reputation.cancelledRentals) : 0;
  const disputeCount = reputation ? Number(reputation.disputeCount) : 0;
  const isVerified = reputation?.isVerified || false;

  return (
    <section className="section">
      <div className="container">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="section-title">Your Reputation</h1>
          <p className="section-subtitle">
            Build trust in the SmartRent community
          </p>
        </div>

        {/* Main Reputation Card */}
        <div className="card" style={{ padding: 'var(--spacing-xl)', marginBottom: 'var(--spacing-xl)' }}>
          <div style={{ textAlign: 'center' }}>
            {/* Reputation Level Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              padding: 'var(--spacing-sm) var(--spacing-lg)',
              backgroundColor: `${reputationInfo.color}20`,
              color: reputationInfo.color,
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--font-size-lg)',
              fontWeight: 600,
              marginBottom: 'var(--spacing-lg)'
            }}>
              <Award size={24} />
              {reputationInfo.level}
              {isVerified && <CheckCircle size={20} />}
            </div>

            {/* Star Rating */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: 'var(--spacing-xs)',
              marginBottom: 'var(--spacing-md)'
            }}>
              {reputation && renderStars(reputation.reputationScore)}
            </div>

            {/* Average Rating */}
            <div style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--spacing-sm)'
            }}>
              {averageRating}
              <span style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-secondary)' }}>/5.00</span>
            </div>

            {/* Total Reviews */}
            <p style={{ 
              fontSize: 'var(--font-size-md)', 
              color: 'var(--color-text-secondary)',
              marginBottom: 'var(--spacing-lg)'
            }}>
              Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </p>

            {/* Description */}
            <p style={{
              maxWidth: '600px',
              margin: '0 auto',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.6
            }}>
              {reputationInfo.description}
            </p>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-3" style={{ marginBottom: 'var(--spacing-xl)' }}>
          {/* Completed Rentals */}
          <div className="card stats-card" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-success-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckCircle color="var(--color-secondary)" size={24} />
              </div>
              <div>
                <div className="stats-value success">{completedRentals}</div>
                <div className="stats-label">Completed Rentals</div>
              </div>
            </div>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              Successfully completed rental agreements
            </p>
          </div>

          {/* Cancelled Rentals */}
          <div className="card stats-card" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-warning-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <AlertCircle color="var(--color-warning)" size={24} />
              </div>
              <div>
                <div className="stats-value warning">{cancelledRentals}</div>
                <div className="stats-label">Cancelled</div>
              </div>
            </div>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              Cancelled or incomplete rentals
            </p>
          </div>

          {/* Disputes */}
          <div className="card stats-card" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: disputeCount > 0 ? 'var(--color-danger-light)' : 'var(--color-bg-tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Shield color={disputeCount > 0 ? 'var(--color-danger)' : 'var(--color-text-muted)'} size={24} />
              </div>
              <div>
                <div className="stats-value" style={{ color: disputeCount > 0 ? 'var(--color-danger)' : 'var(--color-text-primary)' }}>
                  {disputeCount}
                </div>
                <div className="stats-label">Disputes</div>
              </div>
            </div>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              {disputeCount === 0 ? 'No disputes - excellent record!' : 'Total disputes opened'}
            </p>
          </div>
        </div>

        {/* How to Improve Section */}
        <div className="card" style={{ padding: 'var(--spacing-xl)' }}>
          <h3 style={{ 
            fontSize: 'var(--font-size-xl)', 
            marginBottom: 'var(--spacing-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-sm)'
          }}>
            <TrendingUp color="var(--color-primary)" />
            How to Improve Your Reputation
          </h3>
          
          <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-lg)' }}>
            <div>
              <h4 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-sm)', color: 'var(--color-text-primary)' }}>
                For Landlords
              </h4>
              <ul style={{ 
                listStyle: 'none', 
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-sm)'
              }}>
                <li style={{ display: 'flex', alignItems: 'start', gap: 'var(--spacing-sm)' }}>
                  <CheckCircle size={20} color="var(--color-secondary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    Provide accurate property descriptions
                  </span>
                </li>
                <li style={{ display: 'flex', alignItems: 'start', gap: 'var(--spacing-sm)' }}>
                  <CheckCircle size={20} color="var(--color-secondary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    Respond quickly to tenant inquiries
                  </span>
                </li>
                <li style={{ display: 'flex', alignItems: 'start', gap: 'var(--spacing-sm)' }}>
                  <CheckCircle size={20} color="var(--color-secondary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    Maintain property in good condition
                  </span>
                </li>
                <li style={{ display: 'flex', alignItems: 'start', gap: 'var(--spacing-sm)' }}>
                  <CheckCircle size={20} color="var(--color-secondary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    Return deposits fairly and promptly
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-sm)', color: 'var(--color-text-primary)' }}>
                For Tenants
              </h4>
              <ul style={{ 
                listStyle: 'none', 
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-sm)'
              }}>
                <li style={{ display: 'flex', alignItems: 'start', gap: 'var(--spacing-sm)' }}>
                  <CheckCircle size={20} color="var(--color-secondary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    Pay rent on time
                  </span>
                </li>
                <li style={{ display: 'flex', alignItems: 'start', gap: 'var(--spacing-sm)' }}>
                  <CheckCircle size={20} color="var(--color-secondary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    Treat property with respect
                  </span>
                </li>
                <li style={{ display: 'flex', alignItems: 'start', gap: 'var(--spacing-sm)' }}>
                  <CheckCircle size={20} color="var(--color-secondary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    Communicate issues promptly
                  </span>
                </li>
                <li style={{ display: 'flex', alignItems: 'start', gap: 'var(--spacing-sm)' }}>
                  <CheckCircle size={20} color="var(--color-secondary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    Leave property clean at checkout
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div style={{
            marginTop: 'var(--spacing-lg)',
            padding: 'var(--spacing-md)',
            backgroundColor: 'var(--color-bg-secondary)',
            borderRadius: 'var(--radius-md)',
            borderLeft: '4px solid var(--color-primary)'
          }}>
            <p style={{ 
              margin: 0, 
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--font-size-sm)'
            }}>
              💡 <strong>Pro Tip:</strong> Complete more rentals and maintain good relationships to build a strong reputation. 
              This will make others more likely to rent from you or approve your rental requests.
            </p>
          </div>
        </div>

        {/* Verification Badge Info */}
        {!isVerified && (
          <div className="card" style={{ 
            padding: 'var(--spacing-lg)', 
            marginTop: 'var(--spacing-xl)',
            backgroundColor: 'var(--color-bg-secondary)',
            border: '2px dashed var(--color-border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              <User size={32} color="var(--color-primary)" />
              <div>
                <h4 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-xs)' }}>
                  Get Verified
                </h4>
                <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                  Verified users have higher trust and better visibility on the platform. 
                  Contact support to start the verification process.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

