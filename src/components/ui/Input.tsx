'use client';

import React from 'react';
import { BRAND_COLORS } from '@/config/brand';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium mb-1"
          style={{ color: BRAND_COLORS.dark }}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
          error 
            ? 'border-red-500 focus:ring-red-200' 
            : 'border-gray-300 focus:ring-brand-primary/20'
        } ${className}`}
        style={{ 
          '--tw-ring-color': error ? undefined : `${BRAND_COLORS.primary}33`,
        } as React.CSSProperties}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
