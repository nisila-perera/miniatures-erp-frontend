import apiClient, { ApiResponse } from './api';
import { Resin, ResinCreate, PaintBottle, PaintBottleCreate } from '@/types/inventory';

/**
 * Resin API functions
 */

export async function fetchResin(): Promise<Resin[]> {
  const response: ApiResponse<Resin[]> = await apiClient.get('/api/inventory/resin');
  if (response.error) {
    throw new Error(response.error.message);
  }
  return response.data || [];
}

export async function fetchResinById(id: string): Promise<Resin> {
  const response: ApiResponse<Resin> = await apiClient.get(`/api/inventory/resin/${id}`);
  if (response.error) {
    throw new Error(response.error.message);
  }
  if (!response.data) {
    throw new Error('Resin not found');
  }
  return response.data;
}

export async function createResin(data: ResinCreate): Promise<Resin> {
  const response: ApiResponse<Resin> = await apiClient.post('/api/inventory/resin', data);
  if (response.error) {
    throw new Error(response.error.message);
  }
  if (!response.data) {
    throw new Error('Failed to create resin');
  }
  return response.data;
}

export async function updateResin(id: string, data: Partial<ResinCreate>): Promise<Resin> {
  const response: ApiResponse<Resin> = await apiClient.put(`/api/inventory/resin/${id}`, data);
  if (response.error) {
    throw new Error(response.error.message);
  }
  if (!response.data) {
    throw new Error('Failed to update resin');
  }
  return response.data;
}

export async function deleteResin(id: string): Promise<void> {
  const response: ApiResponse<void> = await apiClient.delete(`/api/inventory/resin/${id}`);
  if (response.error) {
    throw new Error(response.error.message);
  }
}

/**
 * Paint Bottle API functions
 */

export async function fetchPaintBottles(): Promise<PaintBottle[]> {
  const response: ApiResponse<PaintBottle[]> = await apiClient.get('/api/inventory/paint');
  if (response.error) {
    throw new Error(response.error.message);
  }
  return response.data || [];
}

export async function fetchPaintBottleById(id: string): Promise<PaintBottle> {
  const response: ApiResponse<PaintBottle> = await apiClient.get(`/api/inventory/paint/${id}`);
  if (response.error) {
    throw new Error(response.error.message);
  }
  if (!response.data) {
    throw new Error('Paint bottle not found');
  }
  return response.data;
}

export async function createPaintBottle(data: PaintBottleCreate): Promise<PaintBottle> {
  const response: ApiResponse<PaintBottle> = await apiClient.post('/api/inventory/paint', data);
  if (response.error) {
    throw new Error(response.error.message);
  }
  if (!response.data) {
    throw new Error('Failed to create paint bottle');
  }
  return response.data;
}

export async function updatePaintBottle(id: string, data: Partial<PaintBottleCreate>): Promise<PaintBottle> {
  const response: ApiResponse<PaintBottle> = await apiClient.put(`/api/inventory/paint/${id}`, data);
  if (response.error) {
    throw new Error(response.error.message);
  }
  if (!response.data) {
    throw new Error('Failed to update paint bottle');
  }
  return response.data;
}

export async function deletePaintBottle(id: string): Promise<void> {
  const response: ApiResponse<void> = await apiClient.delete(`/api/inventory/paint/${id}`);
  if (response.error) {
    throw new Error(response.error.message);
  }
}
