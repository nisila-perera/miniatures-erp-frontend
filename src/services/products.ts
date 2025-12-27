import apiClient, { ApiResponse } from './api';
import { Product, ProductCreate, ProductUpdate } from '@/types/product';

export interface SyncResponse {
  created: number;
  updated: number;
  message: string;
}

/**
 * Fetch all products
 */
export async function fetchProducts(): Promise<Product[]> {
  const response: ApiResponse<Product[]> = await apiClient.get('/api/products');
  if (response.error) {
    throw new Error(response.error.message);
  }
  return response.data || [];
}

/**
 * Fetch a single product by ID
 */
export async function fetchProduct(id: string): Promise<Product> {
  const response: ApiResponse<Product> = await apiClient.get(`/api/products/${id}`);
  if (response.error) {
    throw new Error(response.error.message);
  }
  if (!response.data) {
    throw new Error('Product not found');
  }
  return response.data;
}

/**
 * Create a new product
 */
export async function createProduct(data: ProductCreate): Promise<Product> {
  const response: ApiResponse<Product> = await apiClient.post('/api/products', data);
  if (response.error) {
    throw new Error(response.error.message);
  }
  if (!response.data) {
    throw new Error('Failed to create product');
  }
  return response.data;
}

/**
 * Update an existing product (ERP products only)
 */
export async function updateProduct(id: string, data: ProductUpdate): Promise<Product> {
  const response: ApiResponse<Product> = await apiClient.put(`/api/products/${id}`, data);
  if (response.error) {
    throw new Error(response.error.message);
  }
  if (!response.data) {
    throw new Error('Failed to update product');
  }
  return response.data;
}

/**
 * Delete a product (ERP products only)
 */
export async function deleteProduct(id: string): Promise<void> {
  const response: ApiResponse<void> = await apiClient.delete(`/api/products/${id}`);
  if (response.error) {
    throw new Error(response.error.message);
  }
}

/**
 * Sync products from WooCommerce
 */
export async function syncProductsFromWooCommerce(): Promise<SyncResponse> {
  const response: ApiResponse<SyncResponse> = await apiClient.post('/woocommerce/sync/products');
  if (response.error) {
    throw new Error(response.error.message);
  }
  if (!response.data) {
    throw new Error('Failed to sync products');
  }
  return response.data;
}
