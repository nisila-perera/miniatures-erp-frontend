import apiClient, { ApiResponse } from './api';
import { Customer, CustomerCreate, CustomerUpdate } from '@/types/customer';
import { Order } from '@/types/order';

export interface SyncResponse {
  created: number;
  updated: number;
  message: string;
}

/**
 * Fetch all customers
 */
export async function fetchCustomers(): Promise<Customer[]> {
  const response: ApiResponse<Customer[]> = await apiClient.get('/api/customers');
  if (response.error) {
    throw new Error(response.error.message);
  }
  return response.data || [];
}

/**
 * Fetch a single customer by ID
 */
export async function fetchCustomer(id: string): Promise<Customer> {
  const response: ApiResponse<Customer> = await apiClient.get(`/api/customers/${id}`);
  if (response.error) {
    throw new Error(response.error.message);
  }
  if (!response.data) {
    throw new Error('Customer not found');
  }
  return response.data;
}

/**
 * Create a new customer
 */
export async function createCustomer(data: CustomerCreate): Promise<Customer> {
  const response: ApiResponse<Customer> = await apiClient.post('/api/customers', data);
  if (response.error) {
    throw new Error(response.error.message);
  }
  if (!response.data) {
    throw new Error('Failed to create customer');
  }
  return response.data;
}

/**
 * Update an existing customer
 */
export async function updateCustomer(id: string, data: CustomerUpdate): Promise<Customer> {
  const response: ApiResponse<Customer> = await apiClient.put(`/api/customers/${id}`, data);
  if (response.error) {
    throw new Error(response.error.message);
  }
  if (!response.data) {
    throw new Error('Failed to update customer');
  }
  return response.data;
}

/**
 * Delete a customer
 */
export async function deleteCustomer(id: string): Promise<void> {
  const response: ApiResponse<void> = await apiClient.delete(`/api/customers/${id}`);
  if (response.error) {
    throw new Error(response.error.message);
  }
}

/**
 * Fetch customer order history
 */
export async function fetchCustomerOrders(customerId: string): Promise<Order[]> {
  const response: ApiResponse<Order[]> = await apiClient.get(`/api/customers/${customerId}/orders`);
  if (response.error) {
    throw new Error(response.error.message);
  }
  return response.data || [];
}

/**
 * Sync customers from WooCommerce
 */
export async function syncCustomersFromWooCommerce(): Promise<SyncResponse> {
  const response: ApiResponse<SyncResponse> = await apiClient.post('/woocommerce/sync/customers');
  if (response.error) {
    throw new Error(response.error.message);
  }
  if (!response.data) {
    throw new Error('Failed to sync customers');
  }
  return response.data;
}
