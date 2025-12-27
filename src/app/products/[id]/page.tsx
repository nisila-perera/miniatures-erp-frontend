'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { Card, Button, Badge } from '@/components/ui';
import { BRAND_COLORS } from '@/config/brand';
import { Product } from '@/types/product';
import { ProductCategory, ProductSource } from '@/types';
import { fetchProduct } from '@/services/products';
import { fetchProductCategory } from '@/services/productCategories';
import { sanitizeHtml } from '@/utils/html';

// Back arrow icon
const BackIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

// Source badge component
function SourceBadge({ source }: { source: ProductSource }) {
  if (source === ProductSource.WOOCOMMERCE) {
    return <Badge variant="info">WooCommerce</Badge>;
  }
  return <Badge variant="success">ERP</Badge>;
}

// Detail row component
function DetailRow({ label, value, isHtml = false }: { label: string; value: React.ReactNode; isHtml?: boolean }) {
  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      {isHtml && typeof value === 'string' ? (
        <dd
          className="mt-1 text-sm text-gray-900"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(value) }}
        />
      ) : (
        <dd className="mt-1 text-sm text-gray-900">{value}</dd>
      )}
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<ProductCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        
        const productData = await fetchProduct(productId);
        setProduct(productData);
        
        // Load category if product has one
        if (productData.category_id) {
          try {
            const categoryData = await fetchProductCategory(productData.category_id);
            setCategory(categoryData);
          } catch {
            // Category might not exist, that's okay
          }
        }
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      loadData();
    }
  }, [productId]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto">
          <Card>
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (loadError || !product) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {loadError || 'Product not found'}
          </div>
          <Link href="/products">
            <Button variant="outline" className="flex items-center gap-2">
              <BackIcon />
              Back to Products
            </Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const isWooCommerce = product.source === ProductSource.WOOCOMMERCE;

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/products">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <BackIcon />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: BRAND_COLORS.dark }}>
                {product.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <SourceBadge source={product.source} />
                {isWooCommerce && (
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <LockIcon />
                    Read-only
                  </span>
                )}
              </div>
            </div>
          </div>
          {!isWooCommerce && (
            <Link href={`/products/${product.id}/edit`}>
              <Button variant="primary" className="flex items-center gap-2">
                <EditIcon />
                Edit Product
              </Button>
            </Link>
          )}
        </div>

        {/* Read-only notice for WooCommerce products */}
        {isWooCommerce && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <LockIcon />
            <span>This product was imported from WooCommerce and cannot be edited. Changes must be made in WooCommerce and synced.</span>
          </div>
        )}

        {/* Product Details */}
        <Card>
          <h2 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.dark }}>
            Product Details
          </h2>
          <dl className="divide-y divide-gray-100">
            <DetailRow label="Name" value={product.name} />
            <DetailRow label="Description" value={product.description || '-'} isHtml={true} />
            <DetailRow label="Category" value={category?.name || '-'} />
            <DetailRow
              label="Base Price"
              value={`LKR ${typeof product.base_price === 'number' ? product.base_price.toFixed(2) : Number(product.base_price).toFixed(2)}`}
            />
            <DetailRow 
              label="Type" 
              value={
                product.is_colored ? (
                  <Badge variant="success">Colored</Badge>
                ) : (
                  <Badge variant="default">Uncolored</Badge>
                )
              } 
            />
            <DetailRow 
              label="Dimensions" 
              value={product.dimensions || '-'} 
            />
            <DetailRow 
              label="Status" 
              value={
                <Badge variant={product.is_active ? 'success' : 'danger'}>
                  {product.is_active ? 'Active' : 'Inactive'}
                </Badge>
              } 
            />
            <DetailRow 
              label="Source" 
              value={<SourceBadge source={product.source} />} 
            />
            {product.woocommerce_id && (
              <DetailRow 
                label="WooCommerce ID" 
                value={product.woocommerce_id} 
              />
            )}
            <DetailRow 
              label="Created" 
              value={new Date(product.created_at).toLocaleString()} 
            />
            <DetailRow 
              label="Last Updated" 
              value={new Date(product.updated_at).toLocaleString()} 
            />
          </dl>
        </Card>
      </div>
    </MainLayout>
  );
}
