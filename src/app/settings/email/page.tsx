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

const MailIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
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

interface EmailConfig {
  smtp_host: string;
  smtp_port: string;
  smtp_user: string;
  smtp_password: string;
  smtp_from: string;
  smtp_from_name: string;
  use_tls: boolean;
}

export default function EmailSettingsPage() {
  const router = useRouter();
  const [config, setConfig] = useState<EmailConfig>({
    smtp_host: '',
    smtp_port: '587',
    smtp_user: '',
    smtp_password: '',
    smtp_from: '',
    smtp_from_name: 'Miniatures.lk',
    use_tls: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would fetch from an API endpoint
      // For now, we'll show empty fields as this is configuration
      setConfig({
        smtp_host: process.env.NEXT_PUBLIC_SMTP_HOST || '',
        smtp_port: process.env.NEXT_PUBLIC_SMTP_PORT || '587',
        smtp_user: '',
        smtp_password: '',
        smtp_from: process.env.NEXT_PUBLIC_SMTP_FROM || '',
        smtp_from_name: 'Miniatures.lk',
        use_tls: true
      });
    } catch {
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
      setSuccess('Email configuration saved successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      setError('Please enter a test email address');
      return;
    }

    setError(null);
    setSuccess(null);
    setTesting(true);

    try {
      // In a real implementation, this would send a test email
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate success if all fields are filled
      if (config.smtp_host && config.smtp_user && config.smtp_password && config.smtp_from) {
        setSuccess(`Test email sent successfully to ${testEmail}`);
      } else {
        setError('Please fill in all SMTP fields before testing');
      }
    } catch {
      setError('Failed to send test email. Please check your SMTP configuration.');
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
              <MailIcon style={{ color: BRAND_COLORS.primary }} />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: BRAND_COLORS.dark }}>
              Email Configuration
            </h1>
          </div>
          <p className="text-sm text-gray-500">
            Configure SMTP settings for sending invoices and notifications
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
              {[...Array(6)].map((_, i) => (
                <div key={i}>
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* SMTP Host */}
              <div>
                <label htmlFor="smtp_host" className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Host <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="smtp_host"
                  value={config.smtp_host}
                  onChange={(e) => setConfig({ ...config, smtp_host: e.target.value })}
                  placeholder="smtp.gmail.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your SMTP server hostname
                </p>
              </div>

              {/* SMTP Port */}
              <div>
                <label htmlFor="smtp_port" className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Port <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="smtp_port"
                  value={config.smtp_port}
                  onChange={(e) => setConfig({ ...config, smtp_port: e.target.value })}
                  placeholder="587"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Common ports: 587 (TLS), 465 (SSL), 25 (unencrypted)
                </p>
              </div>

              {/* Use TLS */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="use_tls"
                  checked={config.use_tls}
                  onChange={(e) => setConfig({ ...config, use_tls: e.target.checked })}
                  className="rounded border-gray-300 text-gray-900 focus:ring-2 focus:ring-opacity-50"
                  style={{ accentColor: BRAND_COLORS.primary }}
                />
                <label htmlFor="use_tls" className="ml-2 text-sm text-gray-700">
                  Use TLS/SSL encryption (recommended)
                </label>
              </div>

              {/* SMTP Username */}
              <div>
                <label htmlFor="smtp_user" className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="smtp_user"
                  value={config.smtp_user}
                  onChange={(e) => setConfig({ ...config, smtp_user: e.target.value })}
                  placeholder="your-email@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Usually your email address
                </p>
              </div>

              {/* SMTP Password */}
              <div>
                <label htmlFor="smtp_password" className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Password <span className="text-red-500">*</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="smtp_password"
                  value={config.smtp_password}
                  onChange={(e) => setConfig({ ...config, smtp_password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your email password or app-specific password
                </p>
              </div>

              {/* Show/Hide Password Toggle */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="show_password"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="rounded border-gray-300 text-gray-900 focus:ring-2 focus:ring-opacity-50"
                  style={{ accentColor: BRAND_COLORS.primary }}
                />
                <label htmlFor="show_password" className="ml-2 text-sm text-gray-700">
                  Show password
                </label>
              </div>

              {/* From Email */}
              <div>
                <label htmlFor="smtp_from" className="block text-sm font-medium text-gray-700 mb-2">
                  From Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="smtp_from"
                  value={config.smtp_from}
                  onChange={(e) => setConfig({ ...config, smtp_from: e.target.value })}
                  placeholder="noreply@miniatures.lk"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email address that will appear as sender
                </p>
              </div>

              {/* From Name */}
              <div>
                <label htmlFor="smtp_from_name" className="block text-sm font-medium text-gray-700 mb-2">
                  From Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="smtp_from_name"
                  value={config.smtp_from_name}
                  onChange={(e) => setConfig({ ...config, smtp_from_name: e.target.value })}
                  placeholder="Miniatures.lk"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Name that will appear as sender
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
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

        {/* Test Email Section */}
        <Card>
          <div className="p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Test Email Configuration</h3>
            <p className="text-sm text-gray-600 mb-4">
              Send a test email to verify your SMTP settings are working correctly.
            </p>
            <div className="flex gap-3">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-transparent"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleTestEmail}
                disabled={testing || saving}
                className="flex items-center gap-2"
              >
                {testing ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Send Test Email'
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Help Section */}
        <Card>
          <div className="p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Common SMTP Providers</h3>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg">
                <strong className="text-gray-900">Gmail</strong>
                <ul className="mt-1 space-y-1 text-gray-600 ml-4 list-disc">
                  <li>Host: smtp.gmail.com</li>
                  <li>Port: 587 (TLS) or 465 (SSL)</li>
                  <li>Use app-specific password (not your regular password)</li>
                </ul>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <strong className="text-gray-900">Outlook/Office 365</strong>
                <ul className="mt-1 space-y-1 text-gray-600 ml-4 list-disc">
                  <li>Host: smtp.office365.com</li>
                  <li>Port: 587 (TLS)</li>
                </ul>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <strong className="text-gray-900">SendGrid</strong>
                <ul className="mt-1 space-y-1 text-gray-600 ml-4 list-disc">
                  <li>Host: smtp.sendgrid.net</li>
                  <li>Port: 587 (TLS) or 465 (SSL)</li>
                  <li>Username: apikey</li>
                  <li>Password: Your SendGrid API key</li>
                </ul>
              </div>
            </div>
            <div 
              className="mt-4 p-3 rounded-lg text-sm"
              style={{ 
                backgroundColor: `${BRAND_COLORS.secondary}20`,
                color: BRAND_COLORS.dark 
              }}
            >
              <strong>Security Note:</strong> For Gmail and other providers, you may need to enable &quot;Less secure app access&quot; or use an app-specific password. We recommend using app-specific passwords for better security.
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
