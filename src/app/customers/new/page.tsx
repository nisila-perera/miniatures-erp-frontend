'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { Card, Button, Input } from '@/components/ui';
import { BRAND_COLORS } from '@/config/brand';
import { CustomerCreate } from '@/types/customer';
import { createCustomer } from '@/services/customers';

// Back arrow icon
const BackIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

export default function NewCustomerPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CustomerCreate>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Customer name is required';
    } else if (formData.name.length > 255) {
      newErrors.name = 'Customer name must be 255 characters or less';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      await createCustomer({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || undefined,
        address: formData.address?.trim() || undefined,
        city: formData.city?.trim() || undefined,
        postal_code: formData.postal_code?.trim() || undefined,
      });
      router.push('/customers');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof CustomerCreate, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/customers">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <BackIcon />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: BRAND_COLORS.dark }}>
              Create Customer
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Add a new customer to your database
            </p>
          </div>
        </div>

        {/* Error Message */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {submitError}
          </div>
        )}

        {/* Form */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Customer Name"
              placeholder="Enter customer name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              error={errors.name}
              required
            />

            <Input
              label="Email"
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              error={errors.email}
              required
            />

            <Input
              label="Phone (optional)"
              type="tel"
              placeholder="Enter phone number"
              value={formData.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
            />

            <Input
              label="Address (optional)"
              placeholder="Enter street address"
              value={formData.address || ''}
              onChange={(e) => handleChange('address', e.target.value)}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City (optional)"
                placeholder="Enter city"
                value={formData.city || ''}
                onChange={(e) => handleChange('city', e.target.value)}
              />

              <Input
                label="Postal Code (optional)"
                placeholder="Enter postal code"
                value={formData.postal_code || ''}
                onChange={(e) => handleChange('postal_code', e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Link href="/customers">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button 
                variant="primary" 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Customer'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}
