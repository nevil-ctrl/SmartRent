import React, { useState, useRef, useEffect } from 'react';
import { useWeb3 } from '../hooks/useWeb3';
import { Wallet, LogOut, AlertCircle } from 'lucide-react';

export const WalletButton: React.FC = () => {
  // web3 state and actions
  const {
    account,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    switchToPolygon,
    switchToAmoy,
    chainId
  } = useWeb3();

  const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

  const getNetworkName = (chainId: number | null) => {
    switch (chainId) {
      case 137:
        return 'Polygon';
      case 80002:
        return 'Amoy';
      case 80001:
        return 'Mumbai (closed)';
      case 1337:
        return 'Local';
      case 31337:
        return 'Hardhat';
      default:
        return 'Unknown';
    }
  };

  const isCorrectNetwork = chainId === 137 || chainId === 80002;

  // dropdown state
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const toggle = () => setOpen((s) => !s);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (e.target instanceof Node && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  // Error state
  if (error) {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    return (
      <div className="wallet-error" title={error}>
        <AlertCircle style={{ width: isMobile ? '14px' : '16px', height: isMobile ? '14px' : '16px', flexShrink: 0 }} />
        <span>{error}</span>
        {!isMobile && (
          <button onClick={connect} aria-label="Retry connection">Retry</button>
        )}
      </div>
    );
  }

  // Not connected state
  if (!isConnected) {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    return (
      <button
        onClick={connect}
        disabled={isConnecting}
        className="btn btn-primary wallet-connect-btn"
        style={{
          padding: isMobile ? '10px 16px' : 'var(--spacing-sm) var(--spacing-md)',
          fontSize: isMobile ? '14px' : 'var(--font-size-sm)',
          minWidth: 'auto',
          whiteSpace: 'nowrap',
          gap: '8px'
        }}
      >
        <Wallet size={isMobile ? 18 : 20} />
        <span>{isConnecting ? 'Подключение...' : 'Подключить'}</span>
      </button>
    );
  }

  // Connected state with dropdown menu
  return (
    <div className="wallet-container" ref={menuRef}>
      {/* Compact account button toggles menu */}
      <button className="wallet-account" onClick={toggle} aria-expanded={open} aria-haspopup="true">
        <Wallet />
        <span>{account ? formatAddress(account) : ''}</span>
      </button>

      {/* Small network indicator next to account (for larger screens) */}
      <div className="wallet-network" style={{ marginLeft: 8 }}>
        <div className={`network-indicator ${isCorrectNetwork ? 'connected' : 'disconnected'}`} />
        <span>{getNetworkName(chainId)}</span>
      </div>

      {/* Dropdown menu */}
      <div className={`wallet-menu ${open ? 'show' : ''}`} style={{ right: 0 }}>
        <div className="wallet-menu-item" style={{ justifyContent: 'space-between' }}>
          <div className="wallet-network">
            <div className={`network-indicator ${isCorrectNetwork ? 'connected' : 'disconnected'}`} />
            <strong style={{ marginLeft: 6 }}>{getNetworkName(chainId)}</strong>
          </div>
        </div>
        <div className="wallet-menu-divider" />

        <button
          className={`wallet-menu-item ${chainId === 80002 ? 'active' : ''}`}
          onClick={() => {
            switchToAmoy();
            setOpen(false);
          }}
        >
          Amoy Testnet
        </button>

        <button
          className={`wallet-menu-item ${chainId === 137 ? 'active' : ''}`}
          onClick={() => {
            switchToPolygon();
            setOpen(false);
          }}
        >
          Polygon
        </button>

        <div className="wallet-menu-divider" />

        <button
          className="wallet-disconnect wallet-menu-item"
          onClick={() => {
            disconnect();
            setOpen(false);
          }}
        >
          <LogOut style={{ width: 16, height: 16, marginRight: 8 }} />
          Disconnect
        </button>
      </div>
    </div>
  );
};
