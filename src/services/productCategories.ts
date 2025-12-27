import apiClient, { ApiResponse } from './api';
import { ProductCategory } from '@/types';

export interface ProductCategoryCreate {
  name: string;
  description?: string;
}

export interface ProductCategoryUpdate {
  name?: string;
  description?: string;
}

/**
 * Fetch all product categories
 */
export async function fetchProductCategories(): Promise<ProductCategory[]> {
  const response: ApiResponse<ProductCategory[]> = await apiClient.get('/api/product-categories');
  if (response.error) {
    throw new Error(response.error.message);
  }
  return response.data || [];
}

/**
 * Fetch a single product category by ID
 */
export async function fetchProductCategory(id: string): Promise<ProductCategory> {
  const response: ApiResponse<ProductCategory> = await apiClient.get(`/api/product-categories/${id}`);
  if (response.error) {
    throw new Error(response.error.message);
  }
  if (!response.data) {
    throw new Error('Category not found');
  }
  return response.data;
}

/**
 * Create a new product category
 */
export async function createProductCategory(data: ProductCategoryCreate): Promise<ProductCategory> {
  const response: ApiResponse<ProductCategory> = await apiClient.post('/api/product-categories', data);
  if (response.error) {
    throw new Error(response.error.message);
  }
  if (!response.data) {
    throw new Error('Failed to create category');
  }
  return response.data;
}

/**
 * Update an existing product category
 */
export async function updateProductCategory(id: string, data: ProductCategoryUpdate): Promise<ProductCategory> {
  const response: ApiResponse<ProductCategory> = await apiClient.put(`/api/product-categories/${id}`, data);
  if (response.error) {
    throw new Error(response.error.message);
  }
  if (!response.data) {
    throw new Error('Failed to update category');
  }
  return response.data;
}

/**
 * Delete a product category
 */
export async function deleteProductCategory(id: string): Promise<void> {
  const response: ApiResponse<void> = await apiClient.delete(`/api/product-categories/${id}`);
  if (response.error) {
    throw new Error(response.error.message);
  }
}
