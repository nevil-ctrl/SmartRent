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
    switchToMumbai,
    chainId
  } = useWeb3();

  const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

  const getNetworkName = (chainId: number | null) => {
    switch (chainId) {
      case 137:
        return 'Polygon';
      case 80001:
        return 'Mumbai';
      case 1337:
        return 'Local';
      case 31337:
        return 'Hardhat';
      default:
        return 'Unknown';
    }
  };

  const isCorrectNetwork = chainId === 137 || chainId === 80001;

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
    return (
      <div className="wallet-error">
        <AlertCircle style={{ width: '20px', height: '20px' }} />
        <span>{error}</span>
        <button onClick={connect}>Retry</button>
      </div>
    );
  }

  // Not connected state
  if (!isConnected) {
    return (
      <button
        onClick={connect}
        disabled={isConnecting}
        className="btn btn-primary"
      >
        <Wallet />
        <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
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
          className={`wallet-menu-item ${chainId === 80001 ? 'active' : ''}`}
          onClick={() => {
            switchToMumbai();
            setOpen(false);
          }}
        >
          Mumbai
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
