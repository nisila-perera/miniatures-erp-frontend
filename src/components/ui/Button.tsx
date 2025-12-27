'use client';

import React from 'react';
import { BRAND_COLORS } from '@/config/brand';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  style,
  ...props
}: ButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: { backgroundColor: BRAND_COLORS.primary, color: 'white' },
    secondary: { backgroundColor: BRAND_COLORS.secondary, color: BRAND_COLORS.dark },
    outline: { 
      backgroundColor: 'transparent', 
      color: BRAND_COLORS.primary,
      border: `1px solid ${BRAND_COLORS.primary}`,
    },
    danger: { backgroundColor: '#dc2626', color: 'white' },
  };

  return (
    <button
      className={`rounded-md font-medium transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${className}`}
      style={{ ...variantStyles[variant], ...style }}
      {...props}
    >
      {children}
    </button>
  );
}
