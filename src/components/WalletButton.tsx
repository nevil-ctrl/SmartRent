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
      default:
        return 'Unknown';
    }
  };

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
        <AlertCircle className="w-5 h-5" />
        <span className="text-sm">{error}</span>
        <button
          onClick={connect}
          className="text-sm underline hover:no-underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <button
        onClick={connect}
        disabled={isConnecting}
        className="btn-primary flex items-center space-x-2"
      >
        <Wallet className="w-5 h-5" />
        <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
      </button>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      {/* Network Status */}
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${
          chainId === 137 || chainId === 80001 ? 'bg-green-500' : 'bg-yellow-500'
        }`} />
        <span className="text-sm text-gray-600">
          {getNetworkName(chainId)}
        </span>
      </div>

      {/* Account Info */}
      <div className="flex items-center space-x-2 bg-white rounded-lg px-3 py-2 shadow-sm border">
        <Wallet className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">
          {formatAddress(account!)}
        </span>
      </div>

      {/* Network Switch Buttons */}
      <div className="flex space-x-1">
        <button
          onClick={switchToMumbai}
          className={`px-2 py-1 text-xs rounded ${
            chainId === 80001 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          Mumbai
        </button>
        <button
          onClick={switchToPolygon}
          className={`px-2 py-1 text-xs rounded ${
            chainId === 137 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          Polygon
        </button>
      </div>

      {/* Disconnect Button */}
      <button
        onClick={disconnect}
        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        title="Disconnect Wallet"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
};
