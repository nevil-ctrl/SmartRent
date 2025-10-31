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
    <div className="network-warning-container">
      {/* Close Button */}
      <button
        onClick={() => setIsDismissed(true)}
        className="network-warning-close"
        aria-label="Закрыть"
      >
        <X style={{ width: '18px', height: '18px' }} />
      </button>

      <div className="network-warning-content">
        <div className="network-warning-icon-wrapper">
          <AlertCircle className="network-warning-icon" />
        </div>
        
        <div className="network-warning-text">
          <h3 className="network-warning-title">
            Неправильная сеть обнаружена!
          </h3>
          
          <p className="network-warning-description">
            Вы подключены к <strong>{getNetworkName(currentChainId)}</strong>. Переключитесь на <strong>Hardhat Local</strong> для разработки или <strong>Polygon Amoy</strong> для тестовой сети.
          </p>

          <div className="network-info-card">
            <div className="network-info-title">
              <Network style={{ width: '16px', height: '16px', marginRight: '6px' }} />
              Hardhat Local Network:
            </div>
            <div className="network-info-details">
              <span>RPC URL:</span> http://localhost:8545<br/>
              <span>Chain ID:</span> 1337<br/>
              <span>Currency:</span> ETH
            </div>
          </div>

          <div className="network-warning-note">
            <span className="note-icon">💡</span>
            <span><strong>Примечание:</strong> MetaMask может показывать предупреждения о локальной сети. Это нормально и безопасно для разработки!</span>
          </div>

          <div className="network-switch-buttons">
            <button
              onClick={onSwitchToHardhat}
              className="network-switch-btn network-switch-btn-primary"
            >
              <Network style={{ width: '18px', height: '18px' }} />
              Hardhat Local
            </button>

            <button
              onClick={onSwitchToAmoy}
              className="network-switch-btn network-switch-btn-secondary"
            >
              <Network style={{ width: '18px', height: '18px' }} />
              Polygon Amoy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

