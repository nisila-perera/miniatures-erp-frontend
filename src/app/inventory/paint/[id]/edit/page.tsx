'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { Card, Button, Input } from '@/components/ui';
import { BRAND_COLORS } from '@/config/brand';
import { PaintBottle } from '@/types/inventory';
import { fetchPaintBottleById, updatePaintBottle } from '@/services/inventory';

// Back arrow icon
const BackIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

interface PaintBottleUpdate {
  color: string;
  brand: string;
  volume_ml: number;
  current_volume_ml: number;
  cost: number;
  purchase_date: string;
  purchase_source?: string;
  notes?: string;
}

export default function EditPaintBottlePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [formData, setFormData] = useState<PaintBottleUpdate>({
    color: '',
    brand: '',
    volume_ml: 0,
    current_volume_ml: 0,
    cost: 0,
    purchase_date: '',
    purchase_source: '',
    notes: '',
  });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const loadPaintBottle = async () => {
      try {
        setLoading(true);
        const paint = await fetchPaintBottleById(id);
        setFormData({
          color: paint.color,
          brand: paint.brand,
          volume_ml: Number(paint.volume_ml),
          current_volume_ml: Number(paint.current_volume_ml),
          cost: Number(paint.cost),
          purchase_date: paint.purchase_date,
          purchase_source: paint.purchase_source || '',
          notes: paint.notes || '',
        });
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : 'Failed to load paint bottle');
      } finally {
        setLoading(false);
      }
    };

    loadPaintBottle();
  }, [id]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.color.trim()) {
      newErrors.color = 'Color is required';
    }
    
    if (!formData.brand.trim()) {
      newErrors.brand = 'Brand is required';
    }
    
    if (formData.volume_ml <= 0) {
      newErrors.volume_ml = 'Volume must be greater than 0';
    }
    
    if (formData.current_volume_ml < 0) {
      newErrors.current_volume_ml = 'Current volume cannot be negative';
    }
    
    if (formData.current_volume_ml > formData.volume_ml) {
      newErrors.current_volume_ml = 'Current volume cannot exceed total volume';
    }
    
    if (formData.cost < 0) {
      newErrors.cost = 'Cost cannot be negative';
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
      await updatePaintBottle(id, {
        color: formData.color.trim(),
        brand: formData.brand.trim(),
        volume_ml: formData.volume_ml,
        current_volume_ml: formData.current_volume_ml,
        cost: formData.cost,
        purchase_date: formData.purchase_date,
        purchase_source: formData.purchase_source?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
      });
      router.push('/inventory');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to update paint bottle');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof PaintBottleUpdate, value: string | number) => {
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
              {[...Array(7)].map((_, i) => (
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
              Edit Paint Bottle
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Update paint bottle details
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
              placeholder="e.g., Crimson Red, Sky Blue"
              value={formData.color}
              onChange={(e) => handleChange('color', e.target.value)}
              error={errors.color}
              required
            />

            <Input
              label="Brand"
              placeholder="e.g., Citadel, Vallejo, Army Painter"
              value={formData.brand}
              onChange={(e) => handleChange('brand', e.target.value)}
              error={errors.brand}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Total Volume (ml)"
                type="number"
                step="0.1"
                placeholder="0.0"
                value={formData.volume_ml || ''}
                onChange={(e) => handleChange('volume_ml', parseFloat(e.target.value) || 0)}
                error={errors.volume_ml}
                required
              />

              <Input
                label="Current Volume (ml)"
                type="number"
                step="0.1"
                placeholder="0.0"
                value={formData.current_volume_ml || ''}
                onChange={(e) => handleChange('current_volume_ml', parseFloat(e.target.value) || 0)}
                error={errors.current_volume_ml}
                required
              />
            </div>

            <Input
              label="Cost (LKR)"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.cost || ''}
              onChange={(e) => handleChange('cost', parseFloat(e.target.value) || 0)}
              error={errors.cost}
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
                placeholder="Additional notes about this paint bottle..."
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
                {isSubmitting ? 'Updating...' : 'Update Paint Bottle'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}
