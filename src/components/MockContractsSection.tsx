import React from 'react';
import { FileText, Calendar, User, DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react';

// Моковые данные для демонстрации (всегда отображаются)
const MOCK_CONTRACTS = [
  {
    rentalId: 1,
    listingTitle: 'Современная квартира в центре',
    tenant: '0x1234...5678',
    landlord: '0x9876...4321',
    deposit: '5.0 MATIC',
    totalRent: '15.0 MATIC',
    startDate: new Date(Date.now() + 86400000 * 2).toLocaleDateString('ru-RU'),
    endDate: new Date(Date.now() + 86400000 * 32).toLocaleDateString('ru-RU'),
    status: 'Active',
    statusColor: '#10b981',
    bgColor: '#d4f5e9',
    progress: 15,
  },
  {
    rentalId: 2,
    listingTitle: 'Уютная студия у метро',
    tenant: '0x2345...6789',
    landlord: '0x8765...3210',
    deposit: '3.0 MATIC',
    totalRent: '9.0 MATIC',
    startDate: new Date(Date.now() - 86400000 * 5).toLocaleDateString('ru-RU'),
    endDate: new Date(Date.now() + 86400000 * 25).toLocaleDateString('ru-RU'),
    status: 'Active',
    statusColor: '#10b981',
    bgColor: '#d4f5e9',
    progress: 45,
  },
  {
    rentalId: 3,
    listingTitle: 'Лофт с панорамными окнами',
    tenant: '0x3456...7890',
    landlord: '0x7654...2109',
    deposit: '10.0 MATIC',
    totalRent: '30.0 MATIC',
    startDate: new Date(Date.now() + 86400000 * 3).toLocaleDateString('ru-RU'),
    endDate: new Date(Date.now() + 86400000 * 33).toLocaleDateString('ru-RU'),
    status: 'Pending',
    statusColor: '#fbbf24',
    bgColor: '#fff4cc',
    progress: 0,
  },
];

export const MockContractsSection: React.FC = () => {
  return (
    <section className="section" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <div className="container">
        <div className="section-header">
          <div>
            <h2 className="section-title">Активные контракты</h2>
            <p className="section-subtitle">
              Управляйте своими договорами аренды
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3" style={{ gap: 'var(--spacing-xl)' }}>
          {MOCK_CONTRACTS.map((contract) => (
            <div
              key={contract.rentalId}
              className="card"
              style={{
                backgroundColor: contract.bgColor,
                border: 'none',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Статус бейдж */}
              <div
                style={{
                  position: 'absolute',
                  top: 'var(--spacing-lg)',
                  right: 'var(--spacing-lg)',
                  backgroundColor: 'white',
                  color: contract.statusColor,
                  padding: 'var(--spacing-xs) var(--spacing-md)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-xs)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                }}
              >
                {contract.status === 'Active' ? (
                  <CheckCircle size={14} />
                ) : (
                  <Clock size={14} />
                )}
                {contract.status}
              </div>

              {/* Заголовок */}
              <h3
                style={{
                  fontSize: 'var(--font-size-xl)',
                  fontWeight: 700,
                  marginBottom: 'var(--spacing-lg)',
                  color: 'var(--color-text-primary)',
                  paddingRight: '80px',
                }}
              >
                {contract.listingTitle}
              </h3>

              {/* Информация */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                  <User size={18} color="var(--color-text-secondary)" />
                  <div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                      Арендатор
                    </div>
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                      {contract.tenant}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                  <Calendar size={18} color="var(--color-text-secondary)" />
                  <div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                      Период
                    </div>
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                      {contract.startDate} — {contract.endDate}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                  <DollarSign size={18} color="var(--color-text-secondary)" />
                  <div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                      Депозит / Аренда
                    </div>
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                      {contract.deposit} / {contract.totalRent}
                    </div>
                  </div>
                </div>
              </div>

              {/* Прогресс */}
              {contract.status === 'Active' && (
                <div>
                  <div
                    style={{
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--color-text-muted)',
                      marginBottom: 'var(--spacing-xs)',
                    }}
                  >
                    Прогресс аренды: {contract.progress}%
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.6)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${contract.progress}%`,
                        height: '100%',
                        backgroundColor: contract.statusColor,
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Кнопка */}
              <button
                className="btn btn-primary"
                style={{
                  width: '100%',
                  marginTop: 'var(--spacing-lg)',
                }}
              >
                <FileText size={18} />
                Посмотреть детали
              </button>
            </div>
          ))}
        </div>

        {/* Информационное сообщение */}
        <div
          style={{
            marginTop: 'var(--spacing-2xl)',
            padding: 'var(--spacing-xl)',
            backgroundColor: 'var(--color-primary-bg)',
            borderRadius: 'var(--radius-xl)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-md)',
          }}
        >
          <AlertCircle size={24} color="var(--color-primary)" />
          <div>
            <h4 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 'var(--spacing-xs)' }}>
              Демонстрационные данные
            </h4>
            <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              Это примеры контрактов для демонстрации интерфейса. После подключения к блокчейну здесь будут отображаться реальные данные из ваших смарт-контрактов.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

