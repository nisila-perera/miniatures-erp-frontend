'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { Card, Button, Input, Select } from '@/components/ui';
import { BRAND_COLORS } from '@/config/brand';
import { ProductCreate } from '@/types/product';
import { ProductCategory } from '@/types';
import { createProduct } from '@/services/products';
import { fetchProductCategories } from '@/services/productCategories';

// Back arrow icon
const BackIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [formData, setFormData] = useState<ProductCreate>({
    name: '',
    description: '',
    category_id: '',
    base_price: 0,
    is_colored: false,
    dimensions: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchProductCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    } else if (formData.name.length > 255) {
      newErrors.name = 'Product name must be 255 characters or less';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }
    
    if (formData.base_price <= 0) {
      newErrors.base_price = 'Price must be greater than 0';
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
      await createProduct({
        name: formData.name.trim(),
        description: formData.description.trim(),
        category_id: formData.category_id,
        base_price: formData.base_price,
        is_colored: formData.is_colored,
        dimensions: formData.dimensions?.trim() || undefined,
      });
      router.push('/products');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof ProductCreate, value: string | number | boolean) => {
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
          <Link href="/products">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <BackIcon />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: BRAND_COLORS.dark }}>
              Create Product
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Add a new product to your catalog
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
              label="Product Name"
              placeholder="Enter product name"
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
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                  errors.description 
                    ? 'border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:ring-brand-primary/20'
                }`}
                rows={4}
                placeholder="Enter product description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                required
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            <Select
              label="Category"
              placeholder="Select a category"
              options={categories.map(c => ({ value: c.id, label: c.name }))}
              value={formData.category_id}
              onChange={(e) => handleChange('category_id', e.target.value)}
              error={errors.category_id}
              disabled={loadingCategories}
            />

            <Input
              label="Base Price (LKR)"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.base_price || ''}
              onChange={(e) => handleChange('base_price', parseFloat(e.target.value) || 0)}
              error={errors.base_price}
              required
            />

            <Input
              label="Dimensions (optional)"
              placeholder="e.g., 10cm x 5cm x 3cm"
              value={formData.dimensions || ''}
              onChange={(e) => handleChange('dimensions', e.target.value)}
            />

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_colored"
                checked={formData.is_colored}
                onChange={(e) => handleChange('is_colored', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
                style={{ accentColor: BRAND_COLORS.primary }}
              />
              <label 
                htmlFor="is_colored"
                className="text-sm font-medium"
                style={{ color: BRAND_COLORS.dark }}
              >
                This product is colored/painted
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Link href="/products">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button 
                variant="primary" 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Product'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}
