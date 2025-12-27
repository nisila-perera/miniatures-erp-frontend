import apiClient, { ApiResponse } from './api';
import { PaymentMethod, PaymentMethodCreate, PaymentMethodUpdate } from '@/types/payment';

/**
 * Fetch all payment methods
 */
export async function fetchPaymentMethods(): Promise<PaymentMethod[]> {
  const response: ApiResponse<PaymentMethod[]> = await apiClient.get('/api/payment-methods');
  if (response.error) {
    throw new Error(response.error.message);
  }
  return response.data || [];
}

/**
 * Fetch a single payment method by ID
 */
export async function fetchPaymentMethod(id: string): Promise<PaymentMethod> {
  const response: ApiResponse<PaymentMethod> = await apiClient.get(`/api/payment-methods/${id}`);
  if (response.error) {
    throw new Error(response.error.message);
  }
  if (!response.data) {
    throw new Error('Payment method not found');
  }
  return response.data;
}

/**
 * Create a new payment method
 */
export async function createPaymentMethod(data: PaymentMethodCreate): Promise<PaymentMethod> {
  const response: ApiResponse<PaymentMethod> = await apiClient.post('/api/payment-methods', data);
  if (response.error) {
    throw new Error(response.error.message);
  }
  if (!response.data) {
    throw new Error('Failed to create payment method');
  }
  return response.data;
}

/**
 * Update an existing payment method
 */
export async function updatePaymentMethod(id: string, data: PaymentMethodUpdate): Promise<PaymentMethod> {
  const response: ApiResponse<PaymentMethod> = await apiClient.put(`/api/payment-methods/${id}`, data);
  if (response.error) {
    throw new Error(response.error.message);
  }
  if (!response.data) {
    throw new Error('Failed to update payment method');
  }
  return response.data;
}

/**
 * Delete a payment method
 */
export async function deletePaymentMethod(id: string): Promise<void> {
  const response: ApiResponse<void> = await apiClient.delete(`/api/payment-methods/${id}`);
  if (response.error) {
    throw new Error(response.error.message);
  }
}
