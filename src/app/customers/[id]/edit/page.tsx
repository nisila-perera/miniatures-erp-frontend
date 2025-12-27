'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { Card, Button, Input } from '@/components/ui';
import { BRAND_COLORS } from '@/config/brand';
import { Customer, CustomerUpdate } from '@/types/customer';
import { fetchCustomer, updateCustomer } from '@/services/customers';

// Back arrow icon
const BackIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<CustomerUpdate>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        
        const customerData = await fetchCustomer(customerId);
        
        setCustomer(customerData);
        setFormData({
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone || '',
          address: customerData.address || '',
          city: customerData.city || '',
          postal_code: customerData.postal_code || '',
        });
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Failed to load customer');
      } finally {
        setIsLoading(false);
      }
    };

    if (customerId) {
      loadData();
    }
  }, [customerId]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Customer name is required';
    } else if (formData.name.length > 255) {
      newErrors.name = 'Customer name must be 255 characters or less';
    }
    
    if (!formData.email?.trim()) {
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
      await updateCustomer(customerId, {
        name: formData.name?.trim(),
        email: formData.email?.trim(),
        phone: formData.phone?.trim() || undefined,
        address: formData.address?.trim() || undefined,
        city: formData.city?.trim() || undefined,
        postal_code: formData.postal_code?.trim() || undefined,
      });
      router.push('/customers');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to update customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof CustomerUpdate, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto">
          <Card>
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (loadError) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {loadError}
          </div>
          <Link href="/customers">
            <Button variant="outline" className="flex items-center gap-2">
              <BackIcon />
              Back to Customers
            </Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

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
              Edit Customer
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Update customer: {customer?.name}
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
              value={formData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              error={errors.name}
              required
            />

            <Input
              label="Email"
              type="email"
              placeholder="Enter email address"
              value={formData.email || ''}
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
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}
