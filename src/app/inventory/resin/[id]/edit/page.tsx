'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { Card, Button, Input } from '@/components/ui';
import { BRAND_COLORS } from '@/config/brand';
import { ResinCreate } from '@/types/inventory';
import { fetchResinById, updateResin } from '@/services/inventory';

// Back arrow icon
const BackIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

export default function EditResinPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [formData, setFormData] = useState<ResinCreate>({
    color: '',
    quantity: 0,
    unit: 'kg',
    cost_per_unit: 0,
    purchase_date: '',
    purchase_source: '',
    notes: '',
  });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const loadResin = async () => {
      try {
        setLoading(true);
        const resin = await fetchResinById(id);
        setFormData({
          color: resin.color,
          quantity: Number(resin.quantity),
          unit: resin.unit,
          cost_per_unit: Number(resin.cost_per_unit),
          purchase_date: resin.purchase_date,
          purchase_source: resin.purchase_source || '',
          notes: resin.notes || '',
        });
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : 'Failed to load resin');
      } finally {
        setLoading(false);
      }
    };

    loadResin();
  }, [id]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.color.trim()) {
      newErrors.color = 'Color is required';
    }
    
    if (formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }
    
    if (!formData.unit.trim()) {
      newErrors.unit = 'Unit is required';
    }
    
    if (formData.cost_per_unit < 0) {
      newErrors.cost_per_unit = 'Cost per unit cannot be negative';
    }
    
    if (!formData.purchase_date) {
      newErrors.purchase_date = 'Purchase date is required';
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
      await updateResin(id, {
        color: formData.color.trim(),
        quantity: formData.quantity,
        unit: formData.unit.trim(),
        cost_per_unit: formData.cost_per_unit,
        purchase_date: formData.purchase_date,
        purchase_source: formData.purchase_source?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
      });
      router.push('/inventory');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to update resin');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof ResinCreate, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto">
          <Card>
            <div className="animate-pulse space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/inventory">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <BackIcon />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: BRAND_COLORS.dark }}>
              Edit Resin
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Update resin entry details
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
              label="Color"
              placeholder="e.g., Black, White, Gray"
              value={formData.color}
              onChange={(e) => handleChange('color', e.target.value)}
              error={errors.color}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Quantity"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.quantity || ''}
                onChange={(e) => handleChange('quantity', parseFloat(e.target.value) || 0)}
                error={errors.quantity}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => handleChange('unit', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-transparent"
                >
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="lb">lb</option>
                </select>
                {errors.unit && (
                  <p className="mt-1 text-sm text-red-600">{errors.unit}</p>
                )}
              </div>
            </div>

            <Input
              label="Cost per Unit (LKR)"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.cost_per_unit || ''}
              onChange={(e) => handleChange('cost_per_unit', parseFloat(e.target.value) || 0)}
              error={errors.cost_per_unit}
              required
            />

            <Input
              label="Purchase Date"
              type="date"
              value={formData.purchase_date}
              onChange={(e) => handleChange('purchase_date', e.target.value)}
              error={errors.purchase_date}
              required
            />

            <Input
              label="Purchase Source"
              placeholder="e.g., Supplier name or store"
              value={formData.purchase_source || ''}
              onChange={(e) => handleChange('purchase_source', e.target.value)}
              error={errors.purchase_source}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-transparent"
                placeholder="Additional notes about this resin..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Link href="/inventory">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button 
                variant="primary" 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Resin'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}
