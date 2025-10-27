import React, { useState } from 'react';
import { FileText, Calendar, User, Download, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import { useWeb3 } from '../hooks/useWeb3';

interface Rental {
  rentalId: number;
  listingTitle: string;
  landlord: string;
  tenant: string;
  deposit: string;
  totalRent: string;
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Active' | 'Completed' | 'Disputed' | 'Cancelled';
  contractIpfsHash: string;
  tenantSigned: boolean;
  landlordSigned: boolean;
  progress: number;
}

// Демо данные - всегда показываются
const MOCK_RENTALS: Rental[] = [
  {
    rentalId: 1,
    listingTitle: 'Современная квартира в центре Москвы',
    landlord: '0x9876...4321',
    tenant: '0x1234...5678',
    deposit: '5.0',
    totalRent: '15.0',
    startDate: new Date(Date.now() + 86400000 * 2).toLocaleDateString('ru-RU'),
    endDate: new Date(Date.now() + 86400000 * 32).toLocaleDateString('ru-RU'),
    status: 'Active',
    contractIpfsHash: 'QmContract123...',
    tenantSigned: true,
    landlordSigned: true,
    progress: 25,
  },
  {
    rentalId: 2,
    listingTitle: 'Уютная студия у метро',
    landlord: '0x8765...3210',
    tenant: '0x2345...6789',
    deposit: '3.0',
    totalRent: '9.0',
    startDate: new Date(Date.now() - 86400000 * 5).toLocaleDateString('ru-RU'),
    endDate: new Date(Date.now() + 86400000 * 25).toLocaleDateString('ru-RU'),
    status: 'Active',
    contractIpfsHash: 'QmContract456...',
    tenantSigned: true,
    landlordSigned: true,
    progress: 60,
  },
  {
    rentalId: 3,
    listingTitle: 'Лофт с панорамными окнами',
    landlord: '0x7654...2109',
    tenant: '0x3456...7890',
    deposit: '10.0',
    totalRent: '30.0',
    startDate: new Date(Date.now() + 86400000 * 3).toLocaleDateString('ru-RU'),
    endDate: new Date(Date.now() + 86400000 * 33).toLocaleDateString('ru-RU'),
    status: 'Pending',
    contractIpfsHash: '',
    tenantSigned: true,
    landlordSigned: false,
    progress: 0,
  },
  {
    rentalId: 4,
    listingTitle: 'Квартира с видом на море',
    landlord: '0x6543...1098',
    tenant: '0x4567...8901',
    deposit: '7.0',
    totalRent: '21.0',
    startDate: new Date(Date.now() - 86400000 * 60).toLocaleDateString('ru-RU'),
    endDate: new Date(Date.now() - 86400000 * 5).toLocaleDateString('ru-RU'),
    status: 'Completed',
    contractIpfsHash: 'QmContract789...',
    tenantSigned: true,
    landlordSigned: true,
    progress: 100,
  },
];

export const MyRentalsPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'pending'>('all');
  const { isConnected } = useWeb3();

  const getStatusConfig = (status: Rental['status']) => {
    switch (status) {
      case 'Pending':
        return {
          icon: <Clock size={18} />,
          label: 'Ожидание',
          color: 'var(--color-warning)',
          bg: 'var(--color-warning-bg)',
        };
      case 'Active':
        return {
          icon: <CheckCircle size={18} />,
          label: 'Активна',
          color: 'var(--color-accent)',
          bg: 'var(--color-accent-bg)',
        };
      case 'Completed':
        return {
          icon: <CheckCircle size={18} />,
          label: 'Завершена',
          color: '#6b7280',
          bg: '#f3f4f6',
        };
      case 'Disputed':
        return {
          icon: <AlertCircle size={18} />,
          label: 'Спор',
          color: 'var(--color-danger)',
          bg: 'var(--color-danger-light)',
        };
      case 'Cancelled':
        return {
          icon: <XCircle size={18} />,
          label: 'Отменена',
          color: '#6b7280',
          bg: '#f3f4f6',
        };
    }
  };

  const filteredRentals = MOCK_RENTALS.filter((rental) => {
    if (filter === 'all') return true;
    if (filter === 'active') return rental.status === 'Active';
    if (filter === 'completed') return rental.status === 'Completed';
    if (filter === 'pending') return rental.status === 'Pending';
    return true;
  });

  if (!isConnected) {
    return (
      <section className="section">
        <div className="container">
          <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
            <FileText size={64} color="var(--color-text-muted)" style={{ margin: '0 auto' }} />
            <h3 style={{ marginTop: 'var(--spacing-lg)', fontSize: 'var(--font-size-2xl)' }}>
              Подключите кошелёк
            </h3>
            <p style={{ marginTop: 'var(--spacing-sm)', color: 'var(--color-text-secondary)' }}>
              Подключите кошелёк, чтобы увидеть ваши договоры аренды
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container">
        {/* Page Header */}
        <div className="text-center" style={{ marginBottom: 'var(--spacing-2xl)' }}>
          <h1 className="section-title" style={{ fontSize: '3rem', fontWeight: 800 }}>
            Мои аренды
          </h1>
          <p className="section-subtitle">
            Управляйте своими договорами аренды недвижимости
          </p>
        </div>

        {/* Filters */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--spacing-sm)',
            marginBottom: 'var(--spacing-2xl)',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {[
            { value: 'all', label: 'Все' },
            { value: 'active', label: 'Активные' },
            { value: 'pending', label: 'Ожидают' },
            { value: 'completed', label: 'Завершённые' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value as any)}
              className="btn"
              style={{
                backgroundColor: filter === item.value ? '#000000' : 'white',
                color: filter === item.value ? 'white' : '#000000',
                border: filter === item.value ? 'none' : '2px solid #e5e7eb',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Demo Notice */}
        <div
          style={{
            padding: 'var(--spacing-lg)',
            backgroundColor: 'var(--color-primary-bg)',
            borderRadius: 'var(--radius-xl)',
            marginBottom: 'var(--spacing-xl)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-md)',
          }}
        >
          <AlertCircle size={24} color="var(--color-primary)" />
          <div>
            <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: '0.25rem' }}>
              Демонстрационные данные
            </h4>
            <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              Это примеры контрактов. После взаимодействия с блокчейном здесь появятся ваши реальные договоры аренды.
            </p>
          </div>
        </div>

        {/* Rentals Grid */}
        {filteredRentals.length > 0 ? (
          <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-xl)' }}>
            {filteredRentals.map((rental) => {
              const statusConfig = getStatusConfig(rental.status);
              
              return (
                <div
                  key={rental.rentalId}
                  className="card"
                  style={{
                    backgroundColor: 'var(--color-bg-primary)',
                    border: 'none',
                    position: 'relative',
                  }}
                >
                  {/* Статус */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 'var(--spacing-lg)',
                      right: 'var(--spacing-lg)',
                      backgroundColor: 'var(--color-bg-secondary)',
                      color: statusConfig.color,
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
                    {statusConfig.icon}
                    {statusConfig.label}
                  </div>

                  {/* Заголовок */}
                  <h3
                    style={{
                      fontSize: 'var(--font-size-xl)',
                      fontWeight: 700,
                      marginBottom: 'var(--spacing-lg)',
                      color: 'var(--color-text-primary)',
                      paddingRight: '120px',
                    }}
                  >
                    {rental.listingTitle}
                  </h3>

                  {/* Информация */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                      <User size={18} color="var(--color-text-secondary)" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                          Арендодатель
                        </div>
                        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                          {rental.landlord}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                      <Calendar size={18} color="var(--color-text-secondary)" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                          Период аренды
                        </div>
                        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                          {rental.startDate} — {rental.endDate}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--spacing-lg)' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                          Депозит
                        </div>
                        <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-primary)' }}>
                          {rental.deposit} MATIC
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                          Общая стоимость
                        </div>
                        <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-accent)' }}>
                          {rental.totalRent} MATIC
                        </div>
                      </div>
                    </div>

                    {/* Прогресс */}
                    {rental.status === 'Active' && (
                      <div style={{ marginTop: 'var(--spacing-sm)' }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: 'var(--font-size-xs)',
                            color: 'var(--color-text-muted)',
                            marginBottom: 'var(--spacing-xs)',
                          }}
                        >
                          <span>Прогресс аренды</span>
                          <span>{rental.progress}%</span>
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
                              width: `${rental.progress}%`,
                              height: '100%',
                              backgroundColor: statusConfig.color,
                              borderRadius: 'var(--radius-full)',
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Подписи */}
                    <div
                      style={{
                        display: 'flex',
                        gap: 'var(--spacing-md)',
                        marginTop: 'var(--spacing-sm)',
                        padding: 'var(--spacing-md)',
                        backgroundColor: 'var(--color-bg-secondary)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                        {rental.tenantSigned ? (
                          <CheckCircle size={16} color="var(--color-accent)" />
                        ) : (
                          <XCircle size={16} color="var(--color-text-muted)" />
                        )}
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-primary)' }}>
                          Арендатор
                        </span>
                      </div>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                        {rental.landlordSigned ? (
                          <CheckCircle size={16} color="var(--color-accent)" />
                        ) : (
                          <XCircle size={16} color="var(--color-text-muted)" />
                        )}
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-primary)' }}>
                          Арендодатель
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Кнопки действий */}
                  <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-lg)' }}>
                    <button className="btn btn-primary" style={{ flex: 1 }}>
                      <FileText size={18} />
                      Детали
                    </button>
                    {rental.contractIpfsHash && (
                      <button className="btn btn-outline" style={{ flex: 1 }}>
                        <Download size={18} />
                        PDF
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className="card"
            style={{
              textAlign: 'center',
              padding: 'var(--spacing-3xl)',
              backgroundColor: 'var(--color-bg-tertiary)',
            }}
          >
            <FileText size={64} color="var(--color-text-muted)" style={{ margin: '0 auto' }} />
            <h3 style={{ marginTop: 'var(--spacing-lg)', fontSize: 'var(--font-size-xl)' }}>
              Нет договоров
            </h3>
            <p style={{ marginTop: 'var(--spacing-sm)', color: 'var(--color-text-secondary)' }}>
              У вас пока нет активных договоров аренды
            </p>
          </div>
        )}

        {/* Info Card */}
        <div
          className="card"
          style={{
            marginTop: 'var(--spacing-2xl)',
            padding: 'var(--spacing-xl)',
            backgroundColor: 'var(--color-accent-bg)',
            border: 'none',
          }}
        >
          <h4 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 'var(--spacing-md)' }}>
            💡 Как работают договоры?
          </h4>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-sm)',
            }}
          >
            <li style={{ display: 'flex', alignItems: 'start', gap: 'var(--spacing-sm)' }}>
              <CheckCircle size={20} color="var(--color-accent)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                Все договоры защищены смарт-контрактами на блокчейне
              </span>
            </li>
            <li style={{ display: 'flex', alignItems: 'start', gap: 'var(--spacing-sm)' }}>
              <CheckCircle size={20} color="var(--color-accent)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                Депозит хранится в Escrow до завершения аренды
              </span>
            </li>
            <li style={{ display: 'flex', alignItems: 'start', gap: 'var(--spacing-sm)' }}>
              <CheckCircle size={20} color="var(--color-accent)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                Обе стороны должны подписать контракт для активации
              </span>
            </li>
            <li style={{ display: 'flex', alignItems: 'start', gap: 'var(--spacing-sm)' }}>
              <CheckCircle size={20} color="var(--color-accent)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                После завершения автоматически генерируется PDF-контракт
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

