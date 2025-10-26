import React, { useState } from 'react';
import { X, Calendar, DollarSign, FileText, Send, User, Mail, Phone, MessageSquare } from 'lucide-react';
import { useContracts } from '../hooks/useContracts';
import { useWeb3 } from '../hooks/useWeb3';

interface RentalApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: any;
  onSuccess?: () => void;
}

export const RentalApplicationModal: React.FC<RentalApplicationModalProps> = ({
  isOpen,
  onClose,
  listing,
  onSuccess,
}) => {
  const { createRental } = useContracts();
  const { account, isConnected } = useWeb3();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Форма заявки
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    message: '',
    fullName: '',
    email: '',
    phone: '',
  });

  if (!isOpen || !listing) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const calculateTotalCost = () => {
    if (!formData.startDate || !formData.endDate) return { days: 0, totalRent: 0, deposit: 0 };

    const start = new Date(formData.startDate).getTime();
    const end = new Date(formData.endDate).getTime();
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    if (days <= 0) return { days: 0, totalRent: 0, deposit: 0 };

    const pricePerDay = parseFloat(listing.pricePerDay || '0');
    const deposit = parseFloat(listing.deposit || '0');
    const totalRent = days * pricePerDay;

    return { days, totalRent, deposit };
  };

  const { days, totalRent, deposit } = calculateTotalCost();
  const totalCost = totalRent + deposit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !account) {
      setError('Пожалуйста, подключите кошелек');
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      setError('Пожалуйста, выберите даты аренды');
      return;
    }

    if (days <= 0) {
      setError('Дата окончания должна быть позже даты начала');
      return;
    }

    if (!formData.fullName || !formData.email || !formData.phone) {
      setError('Пожалуйста, заполните все контактные данные');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const startTimestamp = Math.floor(new Date(formData.startDate).getTime() / 1000);
      const endTimestamp = Math.floor(new Date(formData.endDate).getTime() / 1000);

      // Создаем запись аренды в контракте
      await createRental(
        listing.listingId,
        listing.landlord,
        deposit.toString(),
        totalRent.toString(),
        startTimestamp,
        endTimestamp
      );

      // В реальном приложении здесь нужно также отправить заявку на сервер
      // для уведомления арендодателя и сохранения контактной информации

      console.log('Заявка отправлена:', {
        ...formData,
        listingId: listing.listingId,
        totalCost,
        days,
      });

      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Ошибка при подаче заявки:', error);
      setError(error.message || 'Не удалось отправить заявку. Попробуйте снова.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content modal-large" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '700px' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 style={{ marginBottom: '4px' }}>Подать заявку на аренду</h2>
            <p style={{ 
              fontSize: 'var(--font-size-sm)', 
              color: 'var(--color-text-secondary)',
              fontWeight: 'normal'
            }}>
              {listing.title}
            </p>
          </div>
          <button onClick={onClose} className="modal-close" disabled={isSubmitting}>
            <X />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            {/* Listing Info */}
            <div className="info-card" style={{ marginBottom: 'var(--spacing-lg)' }}>
              <div className="info-row">
                <div className="info-item">
                  <DollarSign style={{ width: '18px', height: '18px', color: 'var(--color-primary)' }} />
                  <div>
                    <div className="info-label">Цена за день</div>
                    <div className="info-value">{listing.pricePerDay} MATIC</div>
                  </div>
                </div>
                <div className="info-item">
                  <DollarSign style={{ width: '18px', height: '18px', color: 'var(--color-warning)' }} />
                  <div>
                    <div className="info-label">Депозит</div>
                    <div className="info-value">{listing.deposit} MATIC</div>
                  </div>
                </div>
                <div className="info-item">
                  <User style={{ width: '18px', height: '18px', color: 'var(--color-text-secondary)' }} />
                  <div>
                    <div className="info-label">Арендодатель</div>
                    <div className="info-value" style={{ fontSize: 'var(--font-size-sm)' }}>
                      {listing.landlord.slice(0, 8)}...{listing.landlord.slice(-6)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label className="form-label" style={{ marginBottom: 'var(--spacing-md)' }}>
                <Calendar style={{ width: '16px', height: '16px' }} />
                Период аренды
              </label>
              <div className="date-inputs">
                <div style={{ flex: 1 }}>
                  <label className="form-label-small">Дата заезда</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="form-input"
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label-small">Дата выезда</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                    className="form-input"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Cost Calculation */}
            {days > 0 && (
              <div className="cost-summary" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="cost-row">
                  <span>Количество дней:</span>
                  <strong>{days} дней</strong>
                </div>
                <div className="cost-row">
                  <span>Аренда ({listing.pricePerDay} MATIC × {days}):</span>
                  <strong>{totalRent.toFixed(2)} MATIC</strong>
                </div>
                <div className="cost-row">
                  <span>Депозит:</span>
                  <strong>{deposit.toFixed(2)} MATIC</strong>
                </div>
                <div className="cost-row total">
                  <span>Итого к оплате:</span>
                  <strong className="total-amount">{totalCost.toFixed(2)} MATIC</strong>
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label className="form-label" style={{ marginBottom: 'var(--spacing-md)' }}>
                <User style={{ width: '16px', height: '16px' }} />
                Контактная информация
              </label>
              <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                <div>
                  <label className="form-label-small">Полное имя</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Иван Иванов"
                    className="form-input"
                    required
                  />
                </div>
                <div className="contact-grid">
                  <div>
                    <label className="form-label-small">Email</label>
                    <div style={{ position: 'relative' }}>
                      <Mail style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '18px',
                        height: '18px',
                        color: 'var(--color-text-muted)'
                      }} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        className="form-input"
                        style={{ paddingLeft: '40px' }}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="form-label-small">Телефон</label>
                    <div style={{ position: 'relative' }}>
                      <Phone style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '18px',
                        height: '18px',
                        color: 'var(--color-text-muted)'
                      }} />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+7 (999) 123-45-67"
                        className="form-input"
                        style={{ paddingLeft: '40px' }}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Message */}
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label className="form-label" style={{ marginBottom: 'var(--spacing-md)' }}>
                <MessageSquare style={{ width: '16px', height: '16px' }} />
                Сообщение арендодателю (необязательно)
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Расскажите о себе, цели аренды и дополнительных пожеланиях..."
                className="form-textarea"
                rows={4}
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Info Box */}
            <div className="info-box" style={{ marginBottom: 'var(--spacing-lg)' }}>
              <FileText style={{ width: '20px', height: '20px', flexShrink: 0 }} />
              <div style={{ fontSize: 'var(--font-size-sm)' }}>
                <strong>Как это работает:</strong>
                <ol style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                  <li>Вы отправляете заявку с контактными данными</li>
                  <li>Арендодатель получает уведомление и проверяет вашу заявку</li>
                  <li>После одобрения создается смарт-контракт</li>
                  <li>Вы вносите депозит и оплату через MetaMask</li>
                  <li>После подтверждения получаете доступ к объекту</li>
                </ol>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-lg)' }}>
                {error}
              </div>
            )}

            {/* Wallet Warning */}
            {!isConnected && (
              <div className="alert alert-warning" style={{ marginBottom: 'var(--spacing-lg)' }}>
                Подключите кошелек для подачи заявки
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            Отмена
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="btn btn-primary"
            disabled={!isConnected || isSubmitting || days <= 0}
          >
            {isSubmitting ? (
              <>
                <div className="spinner-small" />
                Отправка...
              </>
            ) : (
              <>
                <Send style={{ width: '18px', height: '18px' }} />
                Отправить заявку
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .info-card {
          background: var(--color-bg-secondary);
          padding: var(--spacing-md);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
        }

        .info-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--spacing-md);
        }

        .info-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .info-label {
          font-size: var(--font-size-xs);
          color: var(--color-text-secondary);
          margin-bottom: 2px;
        }

        .info-value {
          font-weight: 600;
          font-size: var(--font-size-md);
        }

        .date-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-md);
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: var(--font-size-md);
          margin-bottom: var(--spacing-sm);
        }

        .form-label-small {
          display: block;
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
          margin-bottom: 6px;
          font-weight: 500;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-md);
        }

        .cost-summary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: var(--spacing-lg);
          border-radius: var(--radius-lg);
          color: white;
        }

        .cost-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: var(--font-size-md);
        }

        .cost-row:not(:last-child) {
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .cost-row.total {
          margin-top: 8px;
          padding-top: 16px;
          border-top: 2px solid rgba(255, 255, 255, 0.3);
          font-size: var(--font-size-lg);
        }

        .total-amount {
          font-size: var(--font-size-xl);
          font-weight: 700;
        }

        .info-box {
          background: var(--color-info-light);
          border: 1px solid var(--color-info);
          border-radius: var(--radius-md);
          padding: var(--spacing-md);
          display: flex;
          gap: 12px;
          color: var(--color-info-dark);
        }

        .alert {
          padding: var(--spacing-md);
          border-radius: var(--radius-md);
          font-size: var(--font-size-sm);
        }

        .alert-error {
          background: var(--color-danger-light);
          color: var(--color-danger-dark);
          border: 1px solid var(--color-danger);
        }

        .alert-warning {
          background: var(--color-warning-light);
          color: var(--color-warning-dark);
          border: 1px solid var(--color-warning);
        }

        .spinner-small {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .info-row {
            grid-template-columns: 1fr;
          }

          .date-inputs,
          .contact-grid {
            grid-template-columns: 1fr;
          }

          .modal-content {
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

