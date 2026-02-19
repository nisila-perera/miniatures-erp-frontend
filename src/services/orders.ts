import apiClient from './api';
import { Order, OrderPainter } from '@/types/order';
import { Payment } from '@/types/payment';
import { OrderSource, OrderStatus, DiscountType } from '@/types';

export interface OrderFilters {
  source?: OrderSource;
  status?: OrderStatus;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export interface OrderItemCreate {
  product_id?: string | null;
  product_name: string;
  product_category_id: string;
  is_colored: boolean;
  dimensions?: string | null;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  discount_type?: DiscountType | null;
  discount_reason?: string | null;
  image_url?: string | null;
  custom_description?: string | null;
}

export interface OrderCreate {
  order_number: string;
  source: OrderSource;
  customer_id: string;
  order_date?: string;
  discount_amount?: number;
  discount_type?: DiscountType | null;
  discount_reason?: string | null;
  notes?: string | null;
  items: OrderItemCreate[];
}

export interface PaginatedOrders {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface OrderUpdate {
  status?: OrderStatus;
  discount_amount?: number;
  discount_type?: string;
  discount_reason?: string;
  notes?: string;
}

export async function fetchOrders(filters?: OrderFilters): Promise<Order[]> {
  const params = new URLSearchParams();
  
  if (filters?.source) {
    params.append('source', filters.source);
  }
  if (filters?.status) {
    params.append('status', filters.status);
  }
  if (filters?.start_date) {
    params.append('start_date', filters.start_date);
  }
  if (filters?.end_date) {
    params.append('end_date', filters.end_date);
  }
  
  const queryString = params.toString();
  const endpoint = queryString ? `/api/orders?${queryString}` : '/api/orders';
  
  const response = await apiClient.get<Order[]>(endpoint);
  
  if (response.error) {
    throw new Error(response.error.message);
  }
  
  return response.data || [];
}

export async function fetchOrder(id: string): Promise<Order> {
  const response = await apiClient.get<Order>(`/api/orders/${id}`);
  
  if (response.error) {
    throw new Error(response.error.message);
  }
  
  if (!response.data) {
    throw new Error('Order not found');
  }
  
  return response.data;
}

export async function deleteOrder(id: string): Promise<void> {
  const response = await apiClient.delete(`/api/orders/${id}`);
  
  if (response.error) {
    throw new Error(response.error.message);
  }
}

export async function updateOrder(id: string, data: OrderUpdate): Promise<Order> {
  const response = await apiClient.put<Order>(`/api/orders/${id}`, data);
  
  if (response.error) {
    throw new Error(response.error.message);
  }
  
  if (!response.data) {
    throw new Error('Failed to update order');
  }
  
  return response.data;
}

export async function getOrderPainters(orderId: string): Promise<OrderPainter[]> {
  const response = await apiClient.get<OrderPainter[]>(`/api/orders/${orderId}/painters`);
  
  if (response.error) {
    throw new Error(response.error.message);
  }
  
  return response.data || [];
}

export async function getOrderPayments(orderId: string): Promise<Payment[]> {
  const response = await apiClient.get<Payment[]>(`/api/orders/${orderId}/payments`);
  
  if (response.error) {
    throw new Error(response.error.message);
  }
  
  return response.data || [];
}

export async function sendInvoice(orderId: string): Promise<void> {
  const response = await apiClient.post(`/api/orders/${orderId}/invoice/send`);
  
  if (response.error) {
    throw new Error(response.error.message);
  }
}

export async function downloadInvoicePdf(orderId: string): Promise<Blob> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/invoice/pdf`);
  
  if (!response.ok) {
    throw new Error('Failed to download invoice PDF');
  }
  
  return response.blob();
}

export async function createOrder(data: OrderCreate): Promise<Order> {
  const response = await apiClient.post<Order>('/api/orders', data);
  
  if (response.error) {
    throw new Error(response.error.message);
  }
  
  if (!response.data) {
    throw new Error('Failed to create order');
  }
  
  return response.data;
}

export async function uploadOrderItemImage(file: File): Promise<string> {
  const response = await apiClient.uploadFile<{ image_url: string }>('/api/orders/upload-image', file);
  
  if (response.error) {
    throw new Error(response.error.message);
  }
  
  if (!response.data) {
    throw new Error('Failed to upload image');
  }
  
  return response.data.image_url;
}

export interface PainterAssignmentCreate {
  painter_id: string;
  assigned_date: string;
  painting_cost: number;
  notes?: string;
}

export async function assignPainterToOrder(orderId: string, data: PainterAssignmentCreate): Promise<OrderPainter> {
  const response = await apiClient.post<OrderPainter>(`/api/orders/${orderId}/painters`, data);
  
  if (response.error) {
    throw new Error(response.error.message);
  }
  
  if (!response.data) {
    throw new Error('Failed to assign painter');
  }
  
  return response.data;
}

export interface PaymentRecordCreate {
  order_id: string;
  payment_method_id: string;
  amount: number;
  payment_date: string;
  reference_number?: string;
  notes?: string;
}

export async function recordPayment(orderId: string, data: PaymentRecordCreate): Promise<Payment> {
  const response = await apiClient.post<Payment>(`/api/orders/${orderId}/payments`, data);
  
  if (response.error) {
    throw new Error(response.error.message);
  }
  
  if (!response.data) {
    throw new Error('Failed to record payment');
  }
  
  return response.data;
}
