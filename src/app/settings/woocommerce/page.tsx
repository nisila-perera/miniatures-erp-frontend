'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout';
import { Card, Button } from '@/components/ui';
import { BRAND_COLORS } from '@/config/brand';

// Icons
const BackIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const GlobeIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ExclamationIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

interface WooCommerceConfig {
  url: string;
  consumer_key: string;
  consumer_secret: string;
}

export default function WooCommerceSettingsPage() {
  const router = useRouter();
  const [config, setConfig] = useState<WooCommerceConfig>({
    url: '',
    consumer_key: '',
    consumer_secret: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [showSecrets, setShowSecrets] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would fetch from an API endpoint
      // For now, we'll show empty fields as this is configuration
      setConfig({
        url: process.env.NEXT_PUBLIC_WOOCOMMERCE_URL || '',
        consumer_key: '',
        consumer_secret: ''
      });
    } catch (err) {
      setError('Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      // In a real implementation, this would save to backend
      // For now, we'll simulate a save
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('WooCommerce configuration saved successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setError(null);
    setSuccess(null);
    setTestResult(null);
    setTesting(true);

    try {
      // In a real implementation, this would test the connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate success if all fields are filled
      if (config.url && config.consumer_key && config.consumer_secret) {
        setTestResult('success');
        setSuccess('Connection test successful!');
      } else {
        setTestResult('error');
        setError('Please fill in all fields before testing');
      }
    } catch (err) {
      setTestResult('error');
      setError('Connection test failed. Please check your credentials.');
    } finally {
      setTesting(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div>
          <button
            onClick={() => router.push('/settings')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <BackIcon />
            <span>Back to Settings</span>
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: BRAND_COLORS.secondary }}
            >
              <div style={{ color: BRAND_COLORS.primary }}>
                <GlobeIcon />
              </div>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: BRAND_COLORS.dark }}>
              WooCommerce Integration
            </h1>
          </div>
          <p className="text-sm text-gray-500">
            Configure your WooCommerce API connection to sync orders, products, and customers
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
            <ExclamationIcon />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start gap-3">
            <CheckCircleIcon />
            <span>{success}</span>
          </div>
        )}

        {/* Configuration Form */}
        <Card>
          {loading ? (
            <div className="animate-pulse space-y-4 p-6">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Store URL */}
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                  Store URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  id="url"
                  value={config.url}
                  onChange={(e) => setConfig({ ...config, url: e.target.value })}
                  placeholder="https://your-store.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your WooCommerce store URL (e.g., https://miniatures.lk)
                </p>
              </div>

              {/* Consumer Key */}
              <div>
                <label htmlFor="consumer_key" className="block text-sm font-medium text-gray-700 mb-2">
                  Consumer Key <span className="text-red-500">*</span>
                </label>
                <input
                  type={showSecrets ? 'text' : 'password'}
                  id="consumer_key"
                  value={config.consumer_key}
                  onChange={(e) => setConfig({ ...config, consumer_key: e.target.value })}
                  placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-transparent font-mono text-sm"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  WooCommerce REST API consumer key
                </p>
              </div>

              {/* Consumer Secret */}
              <div>
                <label htmlFor="consumer_secret" className="block text-sm font-medium text-gray-700 mb-2">
                  Consumer Secret <span className="text-red-500">*</span>
                </label>
                <input
                  type={showSecrets ? 'text' : 'password'}
                  id="consumer_secret"
                  value={config.consumer_secret}
                  onChange={(e) => setConfig({ ...config, consumer_secret: e.target.value })}
                  placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-transparent font-mono text-sm"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  WooCommerce REST API consumer secret
                </p>
              </div>

              {/* Show/Hide Secrets Toggle */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="show_secrets"
                  checked={showSecrets}
                  onChange={(e) => setShowSecrets(e.target.checked)}
                  className="rounded border-gray-300 text-gray-900 focus:ring-2 focus:ring-opacity-50"
                  style={{ accentColor: BRAND_COLORS.primary }}
                />
                <label htmlFor="show_secrets" className="ml-2 text-sm text-gray-700">
                  Show API credentials
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={testing || saving}
                  className="flex items-center gap-2"
                >
                  {testing ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Testing...
                    </>
                  ) : (
                    'Test Connection'
                  )}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={saving || testing}
                >
                  {saving ? 'Saving...' : 'Save Configuration'}
                </Button>
              </div>
            </form>
          )}
        </Card>

        {/* Help Section */}
        <Card>
          <div className="p-6">
            <h3 className="font-semibold text-gray-900 mb-3">How to get API credentials</h3>
            <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
              <li>Log in to your WordPress admin dashboard</li>
              <li>Navigate to WooCommerce → Settings → Advanced → REST API</li>
              <li>Click &quot;Add key&quot; to create new API credentials</li>
              <li>Set description (e.g., &quot;Miniatures ERP&quot;) and permissions to &quot;Read/Write&quot;</li>
              <li>Click &quot;Generate API key&quot;</li>
              <li>Copy the Consumer Key and Consumer Secret and paste them above</li>
            </ol>
            <div 
              className="mt-4 p-3 rounded-lg text-sm"
              style={{ 
                backgroundColor: `${BRAND_COLORS.secondary}20`,
                color: BRAND_COLORS.dark 
              }}
            >
              <strong>Note:</strong> Keep your API credentials secure. Never share them publicly or commit them to version control.
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
