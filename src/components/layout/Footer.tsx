'use client';

import React from 'react';
import { BRAND_NAME, BRAND_COLORS } from '@/config/brand';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="bg-brand-dark text-white py-4"
      style={{ backgroundColor: BRAND_COLORS.dark }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-400">
            © {currentYear}{' '}
            <span style={{ color: BRAND_COLORS.primary }}>{BRAND_NAME}</span>
            . All rights reserved.
          </p>
          <p className="text-sm text-gray-400">
            ERP System v0.1.0
          </p>
        </div>
      </div>
    </footer>
  );
}
