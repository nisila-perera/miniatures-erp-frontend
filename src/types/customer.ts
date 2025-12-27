import { CustomerSource } from './index';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  source: CustomerSource;
  woocommerce_id?: number;
  created_at: string;
  updated_at: string;
}

export interface CustomerCreate {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
}

export interface CustomerUpdate {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
}
