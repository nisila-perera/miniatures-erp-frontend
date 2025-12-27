'use client';

import React from 'react';
import { BRAND_COLORS } from '@/config/brand';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export default function Badge({ 
  children, 
  variant = 'default',
  className = '' 
}: BadgeProps) {
  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      backgroundColor: BRAND_COLORS.secondary,
      color: BRAND_COLORS.dark
    },
    primary: {
      backgroundColor: BRAND_COLORS.primary,
      color: '#ffffff'
    },
    success: { backgroundColor: '#dcfce7', color: '#166534' },
    warning: { backgroundColor: '#fef3c7', color: '#92400e' },
    danger: { backgroundColor: '#fee2e2', color: '#991b1b' },
    info: { backgroundColor: '#dbeafe', color: '#1e40af' },
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={variantStyles[variant]}
    >
      {children}
    </span>
  );
}
