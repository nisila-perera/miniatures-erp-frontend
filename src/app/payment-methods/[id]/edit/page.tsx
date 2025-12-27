'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { Card, Button, Input, Select } from '@/components/ui';
import { BRAND_COLORS } from '@/config/brand';
import { CommissionType } from '@/types';
import { PaymentMethod, PaymentMethodUpdate } from '@/types/payment';
import { fetchPaymentMethod, updatePaymentMethod } from '@/services/paymentMethods';

// Back arrow icon
const BackIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const commissionTypeOptions = [
  { value: CommissionType.PERCENTAGE, label: 'Percentage (%)' },
  { value: CommissionType.FIXED, label: 'Fixed Amount (Rs.)' },
];

export default function EditPaymentMethodPage() {
  const router = useRouter();
  const params = useParams();
  const paymentMethodId = params.id as string;
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState<PaymentMethodUpdate>({
    name: '',
    commission_type: CommissionType.PERCENTAGE,
    commission_value: 0,
    is_active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const loadPaymentMethod = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const data = await fetchPaymentMethod(paymentMethodId);
        setPaymentMethod(data);
        setFormData({
          name: data.name,
          commission_type: data.commission_type,
          commission_value: data.commission_value,
          is_active: data.is_active,
        });
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Failed to load payment method');
      } finally {
        setIsLoading(false);
      }
    };

    if (paymentMethodId) {
      loadPaymentMethod();
    }
  }, [paymentMethodId]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Payment method name is required';
    } else if (formData.name.length > 255) {
      newErrors.name = 'Name must be 255 characters or less';
    }
    
    if (formData.commission_value !== undefined && formData.commission_value < 0) {
      newErrors.commission_value = 'Commission value cannot be negative';
    }
    
    if (formData.commission_type === CommissionType.PERCENTAGE && 
        formData.commission_value !== undefined && 
        formData.commission_value > 100) {
      newErrors.commission_value = 'Percentage cannot exceed 100%';
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
      await updatePaymentMethod(paymentMethodId, {
        name: formData.name?.trim(),
        commission_type: formData.commission_type,
        commission_value: formData.commission_value,
        is_active: formData.is_active,
      });
      router.push('/payment-methods');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to update payment method');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof PaymentMethodUpdate, value: string | number | boolean) => {
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
          <Link href="/payment-methods">
            <Button variant="outline" className="flex items-center gap-2">
              <BackIcon />
              Back to Payment Methods
            </Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const commissionValue = formData.commission_value ?? 0;

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/payment-methods">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <BackIcon />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: BRAND_COLORS.dark }}>
              Edit Payment Method
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Update: {paymentMethod?.name}
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
              label="Payment Method Name"
              placeholder="e.g., Cash, Bank Transfer, Genie, Payzy"
              value={formData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              error={errors.name}
              required
            />

            <Select
              label="Commission Type"
              options={commissionTypeOptions}
              value={formData.commission_type || CommissionType.PERCENTAGE}
              onChange={(e) => handleChange('commission_type', e.target.value as CommissionType)}
              required
            />

            <Input
              label={formData.commission_type === CommissionType.PERCENTAGE ? 'Commission Rate (%)' : 'Commission Amount (Rs.)'}
              type="number"
              step="0.01"
              min="0"
              max={formData.commission_type === CommissionType.PERCENTAGE ? '100' : undefined}
              placeholder={formData.commission_type === CommissionType.PERCENTAGE ? 'e.g., 2.5' : 'e.g., 50.00'}
              value={commissionValue}
              onChange={(e) => handleChange('commission_value', parseFloat(e.target.value) || 0)}
              error={errors.commission_value}
              required
            />

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active ?? true}
                onChange={(e) => handleChange('is_active', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
                style={{ accentColor: BRAND_COLORS.primary }}
              />
              <label htmlFor="is_active" className="text-sm font-medium" style={{ color: BRAND_COLORS.dark }}>
                Active (available for use in payments)
              </label>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Commission Preview</h4>
              <p className="text-sm text-gray-600">
                {formData.commission_type === CommissionType.PERCENTAGE ? (
                  <>For a Rs. 1,000 payment, the commission will be <strong>Rs. {(1000 * commissionValue / 100).toFixed(2)}</strong></>
                ) : (
                  <>For any payment, the commission will be <strong>Rs. {commissionValue.toFixed(2)}</strong></>
                )}
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Link href="/payment-methods">
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
