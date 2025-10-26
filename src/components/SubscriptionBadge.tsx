import React from 'react';
import { Crown, Star } from 'lucide-react';

interface SubscriptionBadgeProps {
  plan: 'free' | 'pro' | 'premium';
  size?: 'sm' | 'md' | 'lg';
}

export const SubscriptionBadge: React.FC<SubscriptionBadgeProps> = ({ plan, size = 'sm' }) => {
  const getBadgeConfig = () => {
    switch (plan) {
      case 'premium':
        return {
          icon: <Crown size={size === 'sm' ? 14 : size === 'md' ? 16 : 20} />,
          label: 'Premium',
          gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
          color: 'white',
        };
      case 'pro':
        return {
          icon: <Star size={size === 'sm' ? 14 : size === 'md' ? 16 : 20} />,
          label: 'Pro',
          gradient: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
          color: 'white',
        };
      default:
        return null;
    }
  };

  const config = getBadgeConfig();
  if (!config) return null;

  const fontSize = size === 'sm' ? 'var(--font-size-xs)' : size === 'md' ? 'var(--font-size-sm)' : 'var(--font-size-base)';
  const padding = size === 'sm' 
    ? 'var(--spacing-xs) var(--spacing-sm)' 
    : size === 'md' 
    ? 'var(--spacing-sm) var(--spacing-md)' 
    : 'var(--spacing-md) var(--spacing-lg)';

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--spacing-xs)',
        background: config.gradient,
        color: config.color,
        padding: padding,
        borderRadius: 'var(--radius-full)',
        fontSize: fontSize,
        fontWeight: 600,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        animation: 'pulse 2s ease-in-out infinite'
      }}
    >
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
};

