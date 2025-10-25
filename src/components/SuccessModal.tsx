import React from 'react';
import { CheckCircle, X } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  listingData?: {
    title: string;
    pricePerDay: string;
    deposit: string;
    description: string;
  };
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  listingData
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
            <CheckCircle style={{ width: '24px', height: '24px', color: 'var(--color-success)' }} />
            {title}
          </h2>
          <button
            onClick={onClose}
            className="modal-close"
            type="button"
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <div style={{
            backgroundColor: 'var(--color-success-light, #d4edda)',
            padding: 'var(--spacing-lg)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-success, #28a745)'
          }}>
            <p style={{ margin: 0, color: 'var(--color-text)' }}>
              {message}
            </p>
          </div>

          {listingData && (
            <div style={{
              backgroundColor: 'var(--color-background-secondary)',
              padding: 'var(--spacing-lg)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-md)'
            }}>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, margin: 0 }}>
                📋 Listing Details
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                <div>
                  <strong>Title:</strong>
                  <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-secondary)' }}>
                    {listingData.title}
                  </p>
                </div>

                <div>
                  <strong>Description:</strong>
                  <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-secondary)' }}>
                    {listingData.description}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                  <div>
                    <strong>Daily Rate:</strong>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--color-primary)', fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>
                      {listingData.pricePerDay} MATIC
                    </p>
                  </div>

                  <div>
                    <strong>Security Deposit:</strong>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--color-warning)', fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>
                      {listingData.deposit} MATIC
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={{
            backgroundColor: 'var(--color-info-light, #d1ecf1)',
            padding: 'var(--spacing-md)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-info, #17a2b8)'
          }}>
            <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>
              💡 Your listing is now live! You can view it in <strong>My Listings</strong> or <strong>Browse Listings</strong> page.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            onClick={onClose}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

