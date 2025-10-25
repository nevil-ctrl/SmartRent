import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle style={{ width: '20px', height: '20px' }} />;
      case 'error':
        return <XCircle style={{ width: '20px', height: '20px' }} />;
      case 'warning':
        return <AlertCircle style={{ width: '20px', height: '20px' }} />;
      case 'info':
        return <Info style={{ width: '20px', height: '20px' }} />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'success':
        return 'var(--color-success, #28a745)';
      case 'error':
        return 'var(--color-danger, #dc3545)';
      case 'warning':
        return 'var(--color-warning, #f59e0b)';
      case 'info':
        return 'var(--color-info, #17a2b8)';
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'var(--color-success-light, #d4edda)';
      case 'error':
        return 'var(--color-danger-light, #f8d7da)';
      case 'warning':
        return 'var(--color-warning-light, #fef3c7)';
      case 'info':
        return 'var(--color-info-light, #d1ecf1)';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 10000,
        minWidth: '300px',
        maxWidth: '500px',
        backgroundColor: getBackgroundColor(),
        border: `2px solid ${getColor()}`,
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--spacing-md)',
        boxShadow: 'var(--shadow-xl)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-sm)',
        animation: 'slideInFromRight 0.3s ease-out'
      }}
    >
      <div style={{ color: getColor(), flexShrink: 0 }}>
        {getIcon()}
      </div>
      <div style={{ flex: 1, color: 'var(--color-text-primary)', fontWeight: 500 }}>
        {message}
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-muted)',
          transition: 'color 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--color-text-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--color-text-muted)';
        }}
      >
        <X style={{ width: '16px', height: '16px' }} />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Array<{ id: number; message: string; type: ToastType }>;
  onRemove: (id: number) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <>
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{
            position: 'fixed',
            top: `${20 + index * 80}px`,
            right: '20px',
            zIndex: 10000
          }}
        >
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => onRemove(toast.id)}
          />
        </div>
      ))}
    </>
  );
};

