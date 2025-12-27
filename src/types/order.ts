import { OrderSource, OrderStatus, DiscountType } from './index';
import { Customer } from './customer';
import { Payment } from './payment';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  product_name: string;
  product_category_id: string;
  is_colored: boolean;
  dimensions?: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  discount_type: DiscountType;
  discount_reason?: string;
  total_price: number;
  image_url?: string;
  custom_description?: string;
}

export interface OrderPainter {
  id: string;
  order_id: string;
  painter_id: string;
  painter_name?: string;
  assigned_date: string;
  painting_cost: number;
  notes?: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  source: OrderSource;
  status: OrderStatus;
  customer_id: string;
  order_date: string;
  subtotal: number;
  discount_amount: number;
  discount_type: DiscountType;
  discount_reason?: string;
  total_amount: number;
  paid_amount: number;
  balance: number;
  is_fully_paid: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  payments?: Payment[];
  painters?: OrderPainter[];
  customer?: Customer;
}
