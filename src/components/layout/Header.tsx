'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BRAND_NAME, BRAND_COLORS } from '@/config/brand';

export default function Header() {
  return (
    <header 
      className="bg-brand-dark text-white shadow-md"
      style={{ backgroundColor: BRAND_COLORS.dark }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/images/miniatures-logo-optimized.webp"
              alt={BRAND_NAME}
              width={120}
              height={40}
              className="h-10 w-auto"
              priority
            />
            <span className="text-sm text-gray-300">ERP</span>
          </Link>
          
          <nav className="hidden md:flex space-x-6">
            <Link
              href="/orders"
              className="hover:text-brand-primary transition-colors"
              style={{ '--tw-text-opacity': 1 } as React.CSSProperties}
            >
              Orders
            </Link>
            <Link
              href="/products"
              className="hover:text-brand-primary transition-colors"
            >
              Products
            </Link>
            <Link
              href="/customers"
              className="hover:text-brand-primary transition-colors"
            >
              Customers
            </Link>
            <Link
              href="/inventory"
              className="hover:text-brand-primary transition-colors"
            >
              Inventory
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
