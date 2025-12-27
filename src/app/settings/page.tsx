'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { Card, Button } from '@/components/ui';
import { BRAND_COLORS } from '@/config/brand';

// Icons
const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CreditCardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const TagIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const PainterIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
  </svg>
);

const GlobeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  </svg>
);

const MailIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

// Setting section component
interface SettingSectionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  badge?: string;
}

function SettingSection({ icon, title, description, href, badge }: SettingSectionProps) {
  return (
    <Link href={href}>
      <div className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 cursor-pointer">
        <div className="flex items-start gap-4">
          <div 
            className="p-3 rounded-lg"
            style={{ backgroundColor: BRAND_COLORS.secondary }}
          >
            <div style={{ color: BRAND_COLORS.primary }}>
              {icon}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              {badge && (
                <span 
                  className="px-2 py-0.5 text-xs font-medium rounded-full"
                  style={{ 
                    backgroundColor: BRAND_COLORS.secondary,
                    color: BRAND_COLORS.primary 
                  }}
                >
                  {badge}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
        </div>
        <ChevronRightIcon />
      </div>
    </Link>
  );
}

// Tab type
type TabType = 'general' | 'integrations';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('general');

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon />
            <h1 className="text-2xl font-bold" style={{ color: BRAND_COLORS.dark }}>
              Settings
            </h1>
          </div>
          <p className="text-sm text-gray-500">
            Manage your system configuration and preferences
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('general')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'general'
                  ? 'border-current text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              style={activeTab === 'general' ? { borderColor: BRAND_COLORS.primary } : {}}
            >
              General Settings
            </button>
            <button
              onClick={() => setActiveTab('integrations')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'integrations'
                  ? 'border-current text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              style={activeTab === 'integrations' ? { borderColor: BRAND_COLORS.primary } : {}}
            >
              Integrations
            </button>
          </nav>
        </div>

        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <Card>
              <SettingSection
                icon={<CreditCardIcon />}
                title="Payment Methods"
                description="Configure payment methods and commission rates for transactions"
                href="/payment-methods"
              />
              <SettingSection
                icon={<TagIcon />}
                title="Product Categories"
                description="Organize your products with custom categories"
                href="/product-categories"
              />
              <SettingSection
                icon={<PainterIcon />}
                title="Painters"
                description="Manage painters for order assignments and tracking"
                href="/painters"
              />
            </Card>
          </div>
        )}

        {/* Integrations Tab */}
        {activeTab === 'integrations' && (
          <div className="space-y-6">
            <Card>
              <SettingSection
                icon={<GlobeIcon />}
                title="WooCommerce Integration"
                description="Configure WooCommerce API connection for order and product sync"
                href="/settings/woocommerce"
                badge="API"
              />
              <SettingSection
                icon={<MailIcon />}
                title="Email Configuration"
                description="Set up SMTP settings for invoice delivery and notifications"
                href="/settings/email"
                badge="SMTP"
              />
            </Card>

            {/* Integration Info */}
            <div 
              className="p-4 rounded-lg border"
              style={{ 
                backgroundColor: `${BRAND_COLORS.secondary}20`,
                borderColor: BRAND_COLORS.secondary 
              }}
            >
              <div className="flex gap-3">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: BRAND_COLORS.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Integration Settings</h4>
                  <p className="text-sm text-gray-600">
                    Configure external services to sync data and automate workflows. 
                    Changes to integration settings may require system restart.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
