import React, { useState } from 'react';
import { FileText, Calendar, User, DollarSign, Eye, MessageSquare, Clock } from 'lucide-react';
import { useWeb3 } from '../hooks/useWeb3';
import './ActiveContractsSection.css';

interface Rental {
  rentalId: number;
  listingId: number;
  tenant: string;
  landlord: string;
  deposit: string;
  totalRent: string;
  startDate: number;
  endDate: number;
  status: number;
  contractIpfsHash: string;
  tenantSigned: boolean;
  landlordSigned: boolean;
}

// Mock данные для демонстрации
const MOCK_CONTRACTS: Rental[] = [
    {
      rentalId: 1,
      listingId: 1,
      tenant: '0x1234567890123456789012345678901234567890',
      landlord: '0x9876543210987654321098765432109876543210',
      deposit: '5.0',
      totalRent: '15.0',
      startDate: Math.floor(Date.now() / 1000),
      endDate: Math.floor(Date.now() / 1000) + 30 * 86400,
      status: 1, // Active
      contractIpfsHash: 'QmContractHash1',
      tenantSigned: true,
      landlordSigned: true,
    },
    {
      rentalId: 2,
      listingId: 2,
      tenant: '0x2345678901234567890123456789012345678901',
      landlord: '0x8765432109876543210987654321098765432109',
      deposit: '3.0',
      totalRent: '9.0',
      startDate: Math.floor(Date.now() / 1000) - 5 * 86400,
      endDate: Math.floor(Date.now() / 1000) + 25 * 86400,
      status: 1,
      contractIpfsHash: 'QmContractHash2',
      tenantSigned: true,
      landlordSigned: true,
    },
    {
      rentalId: 3,
      listingId: 4,
      tenant: '0x3456789012345678901234567890123456789012',
      landlord: '0x7654321098765432109876543210987654321098',
      deposit: '15.0',
      totalRent: '45.0',
      startDate: Math.floor(Date.now() / 1000) + 3 * 86400,
      endDate: Math.floor(Date.now() / 1000) + 33 * 86400,
      status: 0, // Pending
      contractIpfsHash: 'QmContractHash3',
      tenantSigned: true,
      landlordSigned: false,
    },
];

export const ActiveContractsSection: React.FC = () => {
  const [activeContracts] = useState<Rental[]>(MOCK_CONTRACTS);
  const [isLoading] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Rental | null>(null);
  const { account } = useWeb3();

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <span className="badge badge-warning">Ожидание</span>;
      case 1:
        return <span className="badge badge-success">Активна</span>;
      case 2:
        return <span className="badge badge-info">Завершена</span>;
      case 3:
        return <span className="badge badge-danger">Спор</span>;
      default:
        return <span className="badge badge-secondary">Неизвестно</span>;
    }
  };

  const getDaysRemaining = (endDate: number) => {
    const now = Math.floor(Date.now() / 1000);
    const days = Math.floor((endDate - now) / 86400);
    if (days < 0) return 'Просрочено';
    if (days === 0) return 'Последний день';
    return `${days} дней`;
  };

  return (
    <section className="section" style={{ 
      background: '#f0f9ff',
      padding: '60px 0',
      minHeight: '600px'
    }}>
      <div className="container">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              <FileText style={{ display: 'inline-block', marginRight: '12px' }} />
              Активные смарт-контракты
            </h2>
            <p className="section-subtitle">
              Все текущие договоры аренды на блокчейне
            </p>
          </div>
          {!isLoading && (
            <div style={{ 
              fontSize: 'var(--font-size-lg)', 
              color: 'var(--color-primary)',
              fontWeight: 600
            }}>
              {activeContracts.length} активных
            </div>
          )}
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
            <p style={{ marginTop: 'var(--spacing-md)', color: 'var(--color-text-secondary)' }}>
              Загрузка контрактов...
            </p>
          </div>
        ) : activeContracts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
            <FileText style={{ width: '64px', height: '64px', margin: '0 auto', color: 'var(--color-text-muted)' }} />
            <h3 style={{ marginTop: 'var(--spacing-lg)' }}>Пока нет активных контрактов</h3>
            <p style={{ marginTop: 'var(--spacing-sm)', color: 'var(--color-text-secondary)' }}>
              Создайте первую аренду, чтобы увидеть смарт-контракты здесь
            </p>
          </div>
        ) : (
          <div className="contracts-grid">
            {activeContracts.map((contract) => (
              <div key={contract.rentalId} className="contract-card">
                <div className="contract-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="contract-id">#{contract.rentalId}</div>
                    {getStatusBadge(contract.status)}
                  </div>
                  <div className="contract-time-badge">
                    <Clock style={{ width: '14px', height: '14px' }} />
                    {getDaysRemaining(contract.endDate)}
                  </div>
                </div>

                <div className="contract-body">
                  {/* Участники */}
                  <div className="contract-participants">
                    <div className="participant">
                      <div className="participant-label">
                        <User style={{ width: '16px', height: '16px' }} />
                        Арендатор
                      </div>
                      <div className="participant-address" title={contract.tenant}>
                        {formatAddress(contract.tenant)}
                      </div>
                      {contract.tenantSigned && (
                        <div className="signed-badge">✓ Подписано</div>
                      )}
                    </div>

                    <div className="participant-arrow">→</div>

                    <div className="participant">
                      <div className="participant-label">
                        <User style={{ width: '16px', height: '16px' }} />
                        Арендодатель
                      </div>
                      <div className="participant-address" title={contract.landlord}>
                        {formatAddress(contract.landlord)}
                      </div>
                      {contract.landlordSigned && (
                        <div className="signed-badge">✓ Подписано</div>
                      )}
                    </div>
                  </div>

                  {/* Финансовые детали */}
                  <div className="contract-details">
                    <div className="detail-item">
                      <DollarSign style={{ width: '16px', height: '16px' }} />
                      <div>
                        <div className="detail-label">Депозит</div>
                        <div className="detail-value">{contract.deposit} MATIC</div>
                      </div>
                    </div>
                    <div className="detail-item">
                      <DollarSign style={{ width: '16px', height: '16px' }} />
                      <div>
                        <div className="detail-label">Общая стоимость</div>
                        <div className="detail-value">{contract.totalRent} MATIC</div>
                      </div>
                    </div>
                  </div>

                  {/* Даты */}
                  <div className="contract-dates">
                    <div className="date-item">
                      <Calendar style={{ width: '16px', height: '16px' }} />
                      <div>
                        <div className="date-label">Начало</div>
                        <div className="date-value">{formatDate(contract.startDate)}</div>
                      </div>
                    </div>
                    <div className="date-divider">—</div>
                    <div className="date-item">
                      <Calendar style={{ width: '16px', height: '16px' }} />
                      <div>
                        <div className="date-label">Окончание</div>
                        <div className="date-value">{formatDate(contract.endDate)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="contract-footer">
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => setSelectedContract(contract)}
                  >
                    <Eye style={{ width: '16px', height: '16px' }} />
                    Детали контракта
                  </button>
                  {account && (account.toLowerCase() === contract.tenant.toLowerCase() || 
                              account.toLowerCase() === contract.landlord.toLowerCase()) && (
                    <button className="btn btn-primary btn-sm">
                      <MessageSquare style={{ width: '16px', height: '16px' }} />
                      Чат
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contract Details Modal (будет создан отдельно) */}
        {selectedContract && (
          <div className="modal-overlay" onClick={() => setSelectedContract(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Детали смарт-контракта #{selectedContract.rentalId}</h3>
                <button onClick={() => setSelectedContract(null)} className="modal-close">✕</button>
              </div>
              <div className="modal-body">
                <div style={{ marginBottom: '16px' }}>
                  <strong>IPFS Hash:</strong> {selectedContract.contractIpfsHash}
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <strong>Статус:</strong> {getStatusBadge(selectedContract.status)}
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <strong>Листинг ID:</strong> #{selectedContract.listingId}
                </div>
                <a 
                  href={`https://amoy.polygonscan.com/address/${selectedContract.tenant}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                  style={{ marginTop: '16px', width: '100%' }}
                >
                  Посмотреть в PolygonScan →
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

