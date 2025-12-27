// Enumerations
export enum OrderSource {
  WEBSITE = 'website',
  CUSTOM = 'custom',
  OTHER = 'other',
}

export enum OrderStatus {
  PENDING = 'pending',
  PRINTING = 'printing',
  IN_PRODUCTION = 'in_production',
  PAINTING = 'painting',
  FINAL_CHECKS = 'final_checks',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
}

export enum ProductSource {
  ERP = 'erp',
  WOOCOMMERCE = 'woocommerce',
}

export enum CustomerSource {
  ERP = 'erp',
  WOOCOMMERCE = 'woocommerce',
}

export enum DiscountType {
  FIXED = 'fixed',
  PERCENTAGE = 'percentage',
}

export enum CommissionType {
  FIXED = 'fixed',
  PERCENTAGE = 'percentage',
}

export enum ExpenseCategory {
  MATERIALS = 'materials',
  UTILITIES = 'utilities',
  EQUIPMENT = 'equipment',
  MARKETING = 'marketing',
  SHIPPING = 'shipping',
  OTHER = 'other',
}

// Core Entities
export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

// Re-export dashboard types
export * from './dashboard';

// Re-export invoice types
export * from './invoice';
