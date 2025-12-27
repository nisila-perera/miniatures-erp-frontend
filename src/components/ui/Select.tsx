'use client';

import React from 'react';
import { BRAND_COLORS } from '@/config/brand';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export default function Select({
  label,
  error,
  options,
  placeholder,
  className = '',
  id,
  ...props
}: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={selectId}
          className="block text-sm font-medium mb-1"
          style={{ color: BRAND_COLORS.dark }}
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
          error 
            ? 'border-red-500 focus:ring-red-200' 
            : 'border-gray-300'
        } ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
