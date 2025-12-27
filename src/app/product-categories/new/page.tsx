'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { Card, Button, Input } from '@/components/ui';
import { BRAND_COLORS } from '@/config/brand';
import { createProductCategory, ProductCategoryCreate } from '@/services/productCategories';

// Back arrow icon
const BackIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

export default function NewProductCategoryPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ProductCategoryCreate>({
    name: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (formData.name.length > 255) {
      newErrors.name = 'Category name must be 255 characters or less';
    }
    
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be 1000 characters or less';
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
      await createProductCategory({
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
      });
      router.push('/product-categories');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof ProductCategoryCreate, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/product-categories">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <BackIcon />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: BRAND_COLORS.dark }}>
              Create Category
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Add a new product category
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
              label="Category Name"
              placeholder="Enter category name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              error={errors.name}
              required
            />

            <div className="w-full">
              <label 
                htmlFor="description"
                className="block text-sm font-medium mb-1"
                style={{ color: BRAND_COLORS.dark }}
              >
                Description
              </label>
              <textarea
                id="description"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                  errors.description 
                    ? 'border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:ring-brand-primary/20'
                }`}
                rows={4}
                placeholder="Enter category description (optional)"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Link href="/product-categories">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button 
                variant="primary" 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Category'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}
