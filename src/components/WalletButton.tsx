import React from 'react';
import { useWeb3 } from '../hooks/useWeb3';
import { Wallet, LogOut, AlertCircle } from 'lucide-react';

export const WalletButton: React.FC = () => {
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

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

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

  // Connected state
  return (
    <div className="wallet-container">
      {/* Network Status */}
      <div className="wallet-network">
        <div className={`network-indicator ${isCorrectNetwork ? 'connected' : 'disconnected'}`} />
        <span>{getNetworkName(chainId)}</span>
      </div>

      {/* Account Info */}
      <div className="wallet-account">
        <Wallet />
        <span>{formatAddress(account!)}</span>
      </div>

      {/* Network Switch Buttons */}
      <div className="wallet-network-switch">
        <button
          onClick={switchToMumbai}
          className={`btn btn-sm ${chainId === 80001 ? 'btn-primary' : 'btn-secondary'}`}
          title="Switch to Mumbai Testnet"
        >
          Mumbai
        </button>
        <button
          onClick={switchToPolygon}
          className={`btn btn-sm ${chainId === 137 ? 'btn-primary' : 'btn-secondary'}`}
          title="Switch to Polygon Mainnet"
        >
          Polygon
        </button>
      </div>

      {/* Disconnect Button */}
      <button
        onClick={disconnect}
        className="wallet-disconnect"
        title="Disconnect Wallet"
      >
        <LogOut style={{ width: '20px', height: '20px' }} />
      </button>
    </div>
  );
};
