import { apiClient } from './api';
import { InvoiceTemplate, InvoiceTemplateCreate, InvoiceTemplateUpdate } from '@/types/invoice';

export async function fetchInvoiceTemplates(): Promise<InvoiceTemplate[]> {
  const response = await apiClient.get<InvoiceTemplate[]>('/api/invoice-templates');
  
  if (response.error) {
    throw new Error(response.error.message || 'Failed to fetch invoice templates');
  }
  
  return response.data || [];
}

export async function fetchInvoiceTemplate(id: string): Promise<InvoiceTemplate> {
  const response = await apiClient.get<InvoiceTemplate>(`/api/invoice-templates/${id}`);
  
  if (response.error) {
    throw new Error(response.error.message || 'Failed to fetch invoice template');
  }
  
  if (!response.data) {
    throw new Error('Invoice template not found');
  }
  
  return response.data;
}

export async function fetchDefaultInvoiceTemplate(): Promise<InvoiceTemplate> {
  const response = await apiClient.get<InvoiceTemplate>('/api/invoice-templates/default');
  
  if (response.error) {
    throw new Error(response.error.message || 'Failed to fetch default invoice template');
  }
  
  if (!response.data) {
    throw new Error('Default invoice template not found');
  }
  
  return response.data;
}

export async function createInvoiceTemplate(data: InvoiceTemplateCreate): Promise<InvoiceTemplate> {
  const response = await apiClient.post<InvoiceTemplate>('/api/invoice-templates', data);
  
  if (response.error) {
    throw new Error(response.error.message || 'Failed to create invoice template');
  }
  
  if (!response.data) {
    throw new Error('Failed to create invoice template');
  }
  
  return response.data;
}

export async function updateInvoiceTemplate(id: string, data: InvoiceTemplateUpdate): Promise<InvoiceTemplate> {
  const response = await apiClient.put<InvoiceTemplate>(`/api/invoice-templates/${id}`, data);
  
  if (response.error) {
    throw new Error(response.error.message || 'Failed to update invoice template');
  }
  
  if (!response.data) {
    throw new Error('Failed to update invoice template');
  }
  
  return response.data;
}

export async function deleteInvoiceTemplate(id: string): Promise<void> {
  const response = await apiClient.delete(`/api/invoice-templates/${id}`);
  
  if (response.error) {
    throw new Error(response.error.message || 'Failed to delete invoice template');
  }
}

export async function createDefaultInvoiceTemplate(): Promise<InvoiceTemplate> {
  const response = await apiClient.post<InvoiceTemplate>('/api/invoice-templates/default');
  
  if (response.error) {
    throw new Error(response.error.message || 'Failed to create default invoice template');
  }
  
  if (!response.data) {
    throw new Error('Failed to create default invoice template');
  }
  
  return response.data;
}
