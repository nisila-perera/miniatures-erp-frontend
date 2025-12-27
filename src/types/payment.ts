import { CommissionType } from './index';

export interface PaymentMethod {
  id: string;
  name: string;
  commission_type: CommissionType;
  commission_value: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethodCreate {
  name: string;
  commission_type: CommissionType;
  commission_value: number;
}

export interface PaymentMethodUpdate {
  name?: string;
  commission_type?: CommissionType;
  commission_value?: number;
  is_active?: boolean;
}

export interface Payment {
  id: string;
  order_id: string;
  payment_method_id: string;
  amount: number;
  commission_amount: number;
  payment_date: string;
  reference_number?: string;
  notes?: string;
  created_at: string;
  payment_method?: PaymentMethod;
}

export interface PaymentCreate {
  payment_method_id: string;
  amount: number;
  reference_number?: string;
  notes?: string;
}
