'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { Card, Button, Input } from '@/components/ui';
import { BRAND_COLORS } from '@/config/brand';
import { 
  fetchProductCategory, 
  updateProductCategory, 
  ProductCategoryUpdate 
} from '@/services/productCategories';
import { ProductCategory } from '@/types';

// Back arrow icon
const BackIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

export default function EditProductCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;
  
  const [category, setCategory] = useState<ProductCategory | null>(null);
  const [formData, setFormData] = useState<ProductCategoryUpdate>({
    name: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategory = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const data = await fetchProductCategory(categoryId);
        setCategory(data);
        setFormData({
          name: data.name,
          description: data.description || '',
        });
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Failed to load category');
      } finally {
        setIsLoading(false);
      }
    };

    if (categoryId) {
      loadCategory();
    }
  }, [categoryId]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
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
      await updateProductCategory(categoryId, {
        name: formData.name?.trim(),
        description: formData.description?.trim() || undefined,
      });
      router.push('/product-categories');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to update category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof ProductCategoryUpdate, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
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
              <div className="h-24 bg-gray-200 rounded"></div>
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
          <Link href="/product-categories">
            <Button variant="outline" className="flex items-center gap-2">
              <BackIcon />
              Back to Categories
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
          <Link href="/product-categories">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <BackIcon />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: BRAND_COLORS.dark }}>
              Edit Category
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Update category: {category?.name}
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
              value={formData.name || ''}
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
                value={formData.description || ''}
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
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}
