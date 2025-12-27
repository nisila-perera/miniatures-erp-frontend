import apiClient, { ApiResponse } from './api';
import { Painter, PainterCreate, PainterUpdate } from '@/types/painter';

/**
 * Fetch all painters
 */
export async function fetchPainters(): Promise<Painter[]> {
  const response: ApiResponse<Painter[]> = await apiClient.get('/api/painters');
  if (response.error) {
    throw new Error(response.error.message);
  }
  return response.data || [];
}

/**
 * Fetch a single painter by ID
 */
export async function fetchPainter(id: string): Promise<Painter> {
  const response: ApiResponse<Painter> = await apiClient.get(`/api/painters/${id}`);
  if (response.error) {
    throw new Error(response.error.message);
  }
  if (!response.data) {
    throw new Error('Painter not found');
  }
  return response.data;
}

/**
 * Create a new painter
 */
export async function createPainter(data: PainterCreate): Promise<Painter> {
  const response: ApiResponse<Painter> = await apiClient.post('/api/painters', data);
  if (response.error) {
    throw new Error(response.error.message);
  }
  if (!response.data) {
    throw new Error('Failed to create painter');
  }
  return response.data;
}

/**
 * Update an existing painter
 */
export async function updatePainter(id: string, data: PainterUpdate): Promise<Painter> {
  const response: ApiResponse<Painter> = await apiClient.put(`/api/painters/${id}`, data);
  if (response.error) {
    throw new Error(response.error.message);
  }
  if (!response.data) {
    throw new Error('Failed to update painter');
  }
  return response.data;
}

/**
 * Delete a painter
 */
export async function deletePainter(id: string): Promise<void> {
  const response: ApiResponse<void> = await apiClient.delete(`/api/painters/${id}`);
  if (response.error) {
    throw new Error(response.error.message);
  }
}
