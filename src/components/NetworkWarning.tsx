import React, { useState } from 'react';
import { AlertCircle, Network, X } from 'lucide-react';

interface NetworkWarningProps {
  currentChainId: number | null;
  onSwitchToHardhat: () => void;
  onSwitchToAmoy: () => void;
}

export const NetworkWarning: React.FC<NetworkWarningProps> = ({ currentChainId, onSwitchToHardhat, onSwitchToAmoy }) => {
  const [isDismissed, setIsDismissed] = useState(false);

  const getNetworkName = (chainId: number | null) => {
    if (!chainId) return 'Unknown';
    switch (chainId) {
      case 31337:
      case 1337:
        return 'Hardhat Local';
      case 80002:
        return 'Polygon Amoy';
      case 137:
        return 'Polygon Mainnet';
      default:
        return `Chain ID ${chainId}`;
    }
  };

  const isWrongNetwork = currentChainId !== 31337 && currentChainId !== 1337;

  if (!isWrongNetwork || isDismissed) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '80px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      minWidth: '400px',
      maxWidth: '600px',
      backgroundColor: 'var(--color-warning-light, #fef3c7)',
      border: '2px solid var(--color-warning, #f59e0b)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--spacing-lg)',
      boxShadow: 'var(--shadow-xl)',
      animation: 'slideUp 0.3s ease-out',
      position: 'relative'
    }}>
      {/* Close Button */}
      <button
        onClick={() => setIsDismissed(true)}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-muted)',
          transition: 'color 0.2s',
          borderRadius: 'var(--radius-full)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--color-text-primary)';
          e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--color-text-muted)';
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <X style={{ width: '18px', height: '18px' }} />
      </button>

      <div style={{ display: 'flex', alignItems: 'start', gap: 'var(--spacing-md)', paddingRight: 'var(--spacing-xl)' }}>
        <AlertCircle style={{ 
          width: '24px', 
          height: '24px', 
          color: 'var(--color-warning)', 
          flexShrink: 0,
          marginTop: '2px'
        }} />
        
        <div style={{ flex: 1 }}>
          <h3 style={{ 
            margin: 0, 
            marginBottom: 'var(--spacing-sm)',
            fontSize: 'var(--font-size-lg)',
            fontWeight: 600,
            color: 'var(--color-text-primary)'
          }}>
            ⚠️ Wrong Network Detected!
          </h3>
          
          <p style={{ 
            margin: 0, 
            marginBottom: 'var(--spacing-md)',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-sm)',
            lineHeight: 1.5
          }}>
            You're connected to <strong>{getNetworkName(currentChainId)}</strong>. Switch to <strong>Hardhat Local</strong> for development or <strong>Polygon Amoy</strong> for testnet.
          </p>

          <div style={{
            backgroundColor: 'var(--color-bg-primary)',
            padding: 'var(--spacing-sm) var(--spacing-md)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--spacing-md)',
            fontSize: 'var(--font-size-sm)'
          }}>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>📋 Hardhat Local Network:</div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
              • RPC URL: http://localhost:8545<br/>
              • Chain ID: 1337<br/>
              • Currency: ETH
            </div>
          </div>

          <div style={{
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            padding: 'var(--spacing-sm) var(--spacing-md)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--spacing-md)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-secondary)',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            💡 <strong>Note:</strong> MetaMask may show warnings about local network. This is normal and safe for development!
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-sm)' }}>
            <button
              onClick={onSwitchToHardhat}
              className="btn btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--spacing-xs)',
                border: '2px solid var(--color-primary)',
                color: 'var(--color-primary)',
                backgroundColor: 'white',
                padding: 'var(--spacing-sm)',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: 'var(--font-size-sm)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.color = 'var(--color-primary)';
              }}
            >
              <Network style={{ width: '16px', height: '16px' }} />
              Hardhat Local
            </button>

            <button
              onClick={onSwitchToAmoy}
              className="btn btn-warning"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--spacing-xs)',
                backgroundColor: 'var(--color-warning)',
                color: 'white',
                border: 'none',
                padding: 'var(--spacing-sm)',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: 'var(--font-size-sm)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Network style={{ width: '16px', height: '16px' }} />
              Polygon Amoy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

