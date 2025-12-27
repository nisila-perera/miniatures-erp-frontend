import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { BRAND_NAME } from '@/config/brand';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: `${BRAND_NAME} ERP`,
  description: 'Enterprise Resource Planning System for Miniatures.lk',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
