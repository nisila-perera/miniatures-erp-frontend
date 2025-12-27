'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { Card, Button, Input } from '@/components/ui';
import { BRAND_COLORS } from '@/config/brand';
import { Painter, PainterUpdate } from '@/types/painter';
import { fetchPainter, updatePainter } from '@/services/painters';

// Back arrow icon
const BackIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

export default function EditPainterPage() {
  const router = useRouter();
  const params = useParams();
  const painterId = params.id as string;
  
  const [painter, setPainter] = useState<Painter | null>(null);
  const [formData, setFormData] = useState<PainterUpdate>({
    name: '',
    email: '',
    phone: '',
    is_active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const loadPainter = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const data = await fetchPainter(painterId);
        setPainter(data);
        setFormData({
          name: data.name,
          email: data.email || '',
          phone: data.phone || '',
          is_active: data.is_active,
        });
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Failed to load painter');
      } finally {
        setIsLoading(false);
      }
    };

    if (painterId) {
      loadPainter();
    }
  }, [painterId]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Painter name is required';
    } else if (formData.name.length > 255) {
      newErrors.name = 'Name must be 255 characters or less';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
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
      await updatePainter(painterId, {
        name: formData.name?.trim(),
        email: formData.email?.trim() || undefined,
        phone: formData.phone?.trim() || undefined,
        is_active: formData.is_active,
      });
      router.push('/painters');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to update painter');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof PainterUpdate, value: string | boolean) => {
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
          <Link href="/painters">
            <Button variant="outline" className="flex items-center gap-2">
              <BackIcon />
              Back to Painters
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
          <Link href="/painters">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <BackIcon />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: BRAND_COLORS.dark }}>
              Edit Painter
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Update: {painter?.name}
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
              label="Painter Name"
              placeholder="Enter painter's name"
              value={formData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              error={errors.name}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="painter@example.com"
              value={formData.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              error={errors.email}
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="+94 77 123 4567"
              value={formData.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              error={errors.phone}
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
                Active (available for order assignments)
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Link href="/painters">
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
