'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout';
import { Card, Button } from '@/components/ui';
import { BRAND_COLORS } from '@/config/brand';
import { InvoiceTemplateCreate } from '@/types/invoice';
import { createInvoiceTemplate } from '@/services/invoices';

// Icons
const SaveIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const BackIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

export default function NewInvoiceTemplatePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<InvoiceTemplateCreate>({
    name: '',
    subject: '',
    body_html: '',
    is_default: false,
  });
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      await createInvoiceTemplate(formData);
      router.push('/invoice-templates');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invoice template');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof InvoiceTemplateCreate, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Sample data for preview
  const previewData = {
    order_number: 'ORD-12345',
    customer_name: 'John Doe',
    customer_email: 'john@example.com',
    order_date: new Date().toLocaleDateString(),
    total_amount: '15,000.00',
    items: [
      { name: 'Custom Miniature', quantity: 2, price: '7,500.00' }
    ]
  };

  const renderPreview = () => {
    let html = formData.body_html;
    
    // Replace placeholders with sample data
    html = html.replace(/\{order_number\}/g, previewData.order_number);
    html = html.replace(/\{customer_name\}/g, previewData.customer_name);
    html = html.replace(/\{customer_email\}/g, previewData.customer_email);
    html = html.replace(/\{order_date\}/g, previewData.order_date);
    html = html.replace(/\{total_amount\}/g, previewData.total_amount);
    
    return html;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: BRAND_COLORS.dark }}>
              Create Invoice Template
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Create a new email template for invoices
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => router.push('/invoice-templates')}
            className="flex items-center gap-2"
          >
            <BackIcon />
            Back to Templates
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Help Text */}
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg">
          <p className="text-sm">
            <strong>Available placeholders:</strong> {'{order_number}'}, {'{customer_name}'}, {'{customer_email}'}, {'{order_date}'}, {'{total_amount}'}, {'{items}'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor */}
          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  required
                  placeholder="e.g., Standard Invoice"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Subject *
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  required
                  placeholder="e.g., Invoice #{order_number} from Miniatures.lk"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Body (HTML) *
                </label>
                <textarea
                  value={formData.body_html}
                  onChange={(e) => handleChange('body_html', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 font-mono text-sm"
                  rows={15}
                  required
                  placeholder="Enter HTML template..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_default"
                  checked={formData.is_default}
                  onChange={(e) => handleChange('is_default', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                  style={{ accentColor: BRAND_COLORS.primary }}
                />
                <label htmlFor="is_default" className="ml-2 text-sm text-gray-700">
                  Set as default template
                </label>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <SaveIcon />
                  {loading ? 'Creating...' : 'Create Template'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2"
                >
                  <EyeIcon />
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </Button>
              </div>
            </form>
          </Card>

          {/* Preview */}
          {showPreview && (
            <Card>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
                
                <div className="border-b pb-4">
                  <p className="text-sm text-gray-500 mb-1">Subject:</p>
                  <p className="text-gray-900">
                    {formData.subject.replace(/\{order_number\}/g, previewData.order_number)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-2">Body:</p>
                  <div 
                    className="border rounded-lg p-4 bg-white overflow-auto"
                    style={{ maxHeight: '600px' }}
                    dangerouslySetInnerHTML={{ __html: renderPreview() }}
                  />
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
