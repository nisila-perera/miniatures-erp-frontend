'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { Card, Button, Input } from '@/components/ui';
import { BRAND_COLORS } from '@/config/brand';
import { PainterCreate } from '@/types/painter';
import { createPainter } from '@/services/painters';

// Back arrow icon
const BackIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

export default function NewPainterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<PainterCreate>({
    name: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
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
      await createPainter({
        name: formData.name.trim(),
        email: formData.email?.trim() || undefined,
        phone: formData.phone?.trim() || undefined,
      });
      router.push('/painters');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create painter');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof PainterCreate, value: string) => {
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
          <Link href="/painters">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <BackIcon />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: BRAND_COLORS.dark }}>
              Add Painter
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Add a new painter to assign to orders
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
              value={formData.name}
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
                {isSubmitting ? 'Creating...' : 'Add Painter'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}
