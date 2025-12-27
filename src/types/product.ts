import { ProductSource } from './index';

export interface Product {
  id: string;
  name: string;
  description: string;
  category_id: string;
  base_price: number;
  is_colored: boolean;
  dimensions?: string;
  source: ProductSource;
  woocommerce_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductCreate {
  name: string;
  description: string;
  category_id: string;
  base_price: number;
  is_colored?: boolean;
  dimensions?: string;
}

export interface ProductUpdate {
  name?: string;
  description?: string;
  category_id?: string;
  base_price?: number;
  is_colored?: boolean;
  dimensions?: string;
  is_active?: boolean;
}
