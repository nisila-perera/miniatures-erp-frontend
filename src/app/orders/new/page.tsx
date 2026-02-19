'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout';
import { Card, Button, Input, Select } from '@/components/ui';
import { BRAND_COLORS } from '@/config/brand';
import { OrderSource, DiscountType, ProductCategory } from '@/types';
import { Product } from '@/types/product';
import { Customer } from '@/types/customer';
import { fetchProducts } from '@/services/products';
import { fetchCustomers } from '@/services/customers';
import { fetchProductCategories } from '@/services/productCategories';
import { createOrder, uploadOrderItemImage } from '@/services/orders';

// Icons
const ArrowLeftIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const UploadIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

// Types
interface OrderItemForm {
  id: string;
  product_id: string;
  product_name: string;
  product_category_id: string;
  is_colored: boolean;
  dimensions: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  discount_type: DiscountType | '';
  discount_reason: string;
  image_url: string;
  custom_description: string;
  isCustomProduct: boolean;
}

interface OrderForm {
  order_number: string;
  source: OrderSource;
  customer_id: string;
  discount_amount: number;
  discount_type: DiscountType | '';
  discount_reason: string;
  notes: string;
  items: OrderItemForm[];
}

// Generate unique ID for items
const generateId = () => Math.random().toString(36).substring(2, 9);

// Generate order number
const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${year}${month}${day}-${random}`;
};

// Create empty order item
const createEmptyItem = (): OrderItemForm => ({
  id: generateId(),
  product_id: '',
  product_name: '',
  product_category_id: '',
  is_colored: false,
  dimensions: '',
  quantity: 1,
  unit_price: 0,
  discount_amount: 0,
  discount_type: '',
  discount_reason: '',
  image_url: '',
  custom_description: '',
  isCustomProduct: false,
});


// Product Search Component
interface ProductSearchProps {
  products: Product[];
  onSelect: (product: Product) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  showDropdown: boolean;
  onShowDropdown: (show: boolean) => void;
}

function ProductSearch({ 
  products, 
  onSelect, 
  searchTerm, 
  onSearchChange, 
  showDropdown, 
  onShowDropdown 
}: ProductSearchProps) {
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative">
      <Input
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => {
          onSearchChange(e.target.value);
          onShowDropdown(true);
        }}
        onFocus={() => onShowDropdown(true)}
      />
      {showDropdown && searchTerm && filteredProducts.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredProducts.slice(0, 10).map(product => (
            <button
              key={product.id}
              type="button"
              className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              onClick={() => {
                onSelect(product);
                onShowDropdown(false);
                onSearchChange('');
              }}
            >
              <div className="font-medium text-gray-900">{product.name}</div>
              <div className="text-sm text-gray-500">
                ${typeof product.base_price === 'number' ? product.base_price.toFixed(2) : Number(product.base_price).toFixed(2)} • {product.is_colored ? 'Colored' : 'Uncolored'}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Order Item Component
interface OrderItemRowProps {
  item: OrderItemForm;
  index: number;
  categories: ProductCategory[];
  products: Product[];
  onUpdate: (index: number, updates: Partial<OrderItemForm>) => void;
  onRemove: (index: number) => void;
  onImageUpload: (index: number, file: File) => void;
}

function OrderItemRow({ 
  item, 
  index, 
  categories, 
  products, 
  onUpdate, 
  onRemove,
  onImageUpload 
}: OrderItemRowProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const handleProductSelect = (product: Product) => {
    onUpdate(index, {
      product_id: product.id,
      product_name: product.name,
      product_category_id: product.category_id,
      unit_price: product.base_price,
      is_colored: product.is_colored,
      dimensions: product.dimensions || '',
      isCustomProduct: false,
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageUploading(true);
      try {
        await onImageUpload(index, file);
      } finally {
        setImageUploading(false);
      }
    }
  };

  const calculateItemTotal = () => {
    const subtotal = item.quantity * item.unit_price;
    if (!item.discount_amount || !item.discount_type) return subtotal;
    
    if (item.discount_type === DiscountType.PERCENTAGE) {
      return subtotal - (subtotal * item.discount_amount / 100);
    }
    return subtotal - item.discount_amount;
  };

  const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }));
  const discountTypeOptions = [
    { value: '', label: 'No Discount' },
    { value: DiscountType.FIXED, label: 'Fixed Amount' },
    { value: DiscountType.PERCENTAGE, label: 'Percentage' },
  ];

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-white">
      <div className="flex justify-between items-start mb-4">
        <h4 className="font-medium text-gray-900">Item #{index + 1}</h4>
        <Button variant="danger" size="sm" onClick={() => onRemove(index)}>
          <TrashIcon />
        </Button>
      </div>

      {/* Product Selection Mode Toggle */}
      <div className="flex gap-4 mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={`product-type-${item.id}`}
            checked={!item.isCustomProduct}
            onChange={() => onUpdate(index, { isCustomProduct: false, product_id: '', product_name: '' })}
            className="text-brand-primary"
          />
          <span className="text-sm">Select Product</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={`product-type-${item.id}`}
            checked={item.isCustomProduct}
            onChange={() => onUpdate(index, { isCustomProduct: true, product_id: '' })}
            className="text-brand-primary"
          />
          <span className="text-sm">Custom Product</span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Product Selection or Custom Name */}
        {!item.isCustomProduct ? (
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium mb-1" style={{ color: BRAND_COLORS.dark }}>
              Product
            </label>
            <ProductSearch
              products={products}
              onSelect={handleProductSelect}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              showDropdown={showDropdown}
              onShowDropdown={setShowDropdown}
            />
            {item.product_name && (
              <p className="mt-1 text-sm text-gray-600">Selected: {item.product_name}</p>
            )}
          </div>
        ) : (
          <>
            <Input
              label="Product Name"
              value={item.product_name}
              onChange={(e) => onUpdate(index, { product_name: e.target.value })}
              placeholder="Enter custom product name"
            />
            <Input
              label="Description"
              value={item.custom_description}
              onChange={(e) => onUpdate(index, { custom_description: e.target.value })}
              placeholder="Product description"
            />
          </>
        )}

        {/* Category */}
        <Select
          label="Category"
          options={categoryOptions}
          value={item.product_category_id}
          onChange={(e) => onUpdate(index, { product_category_id: e.target.value })}
          placeholder="Select category"
        />

        {/* Quantity */}
        <Input
          label="Quantity"
          type="number"
          min={1}
          value={item.quantity}
          onChange={(e) => onUpdate(index, { quantity: parseInt(e.target.value) || 1 })}
        />

        {/* Unit Price */}
        <Input
          label="Unit Price ($)"
          type="number"
          min={0}
          step={0.01}
          value={item.unit_price}
          onChange={(e) => onUpdate(index, { unit_price: parseFloat(e.target.value) || 0 })}
        />

        {/* Colored Toggle */}
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: BRAND_COLORS.dark }}>
            Colored
          </label>
          <label className="flex items-center gap-2 mt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={item.is_colored}
              onChange={(e) => onUpdate(index, { is_colored: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm">{item.is_colored ? 'Colored' : 'Uncolored'}</span>
          </label>
        </div>

        {/* Dimensions */}
        <Input
          label="Dimensions (optional)"
          value={item.dimensions}
          onChange={(e) => onUpdate(index, { dimensions: e.target.value })}
          placeholder="e.g., 10x5x3 cm"
        />
      </div>


      {/* Custom Product Image Upload */}
      {item.isCustomProduct && (
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1" style={{ color: BRAND_COLORS.dark }}>
            Product Image (PNG or JPG)
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
              {item.image_url ? (
                <img 
                  src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${item.image_url}`} 
                  alt="Product" 
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-center text-gray-400">
                  <UploadIcon />
                  <span className="text-xs mt-1 block">Upload</span>
                </div>
              )}
              <input
                type="file"
                accept=".png,.jpg,.jpeg"
                onChange={handleImageChange}
                className="hidden"
                disabled={imageUploading}
              />
            </label>
            {imageUploading && <span className="text-sm text-gray-500">Uploading...</span>}
          </div>
        </div>
      )}

      {/* Item Discount */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <h5 className="text-sm font-medium text-gray-700 mb-3">Item Discount</h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Discount Type"
            options={discountTypeOptions}
            value={item.discount_type}
            onChange={(e) => onUpdate(index, { discount_type: e.target.value as DiscountType | '' })}
          />
          {item.discount_type && (
            <>
              <Input
                label={item.discount_type === DiscountType.PERCENTAGE ? 'Discount (%)' : 'Discount (LKR)'}
                type="number"
                min={0}
                step={item.discount_type === DiscountType.PERCENTAGE ? 1 : 0.01}
                max={item.discount_type === DiscountType.PERCENTAGE ? 100 : undefined}
                value={item.discount_amount}
                onChange={(e) => onUpdate(index, { discount_amount: parseFloat(e.target.value) || 0 })}
              />
              <Input
                label="Discount Reason"
                value={item.discount_reason}
                onChange={(e) => onUpdate(index, { discount_reason: e.target.value })}
                placeholder="Required"
              />
            </>
          )}
        </div>
      </div>

      {/* Item Total */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
        <div className="text-right">
          <span className="text-sm text-gray-500">Item Total: </span>
          <span className="text-lg font-semibold" style={{ color: BRAND_COLORS.primary }}>
            LKR {calculateItemTotal().toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

// Main Page Component
export default function NewOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [form, setForm] = useState<OrderForm>({
    order_number: generateOrderNumber(),
    source: OrderSource.CUSTOM,
    customer_id: '',
    discount_amount: 0,
    discount_type: '',
    discount_reason: '',
    notes: '',
    items: [createEmptyItem()],
  });

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setDataLoading(true);
        const [productsData, customersData, categoriesData] = await Promise.all([
          fetchProducts(),
          fetchCustomers(),
          fetchProductCategories(),
        ]);
        setProducts(productsData);
        setCustomers(customersData);
        setCategories(categoriesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setDataLoading(false);
      }
    };
    loadData();
  }, []);

  // Update form field
  const updateForm = useCallback((updates: Partial<OrderForm>) => {
    setForm(prev => ({ ...prev, ...updates }));
  }, []);

  // Update order item
  const updateItem = useCallback((index: number, updates: Partial<OrderItemForm>) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === index ? { ...item, ...updates } : item),
    }));
  }, []);

  // Add new item
  const addItem = useCallback(() => {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, createEmptyItem()],
    }));
  }, []);

  // Remove item
  const removeItem = useCallback((index: number) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  }, []);

  // Handle image upload
  const handleImageUpload = useCallback(async (index: number, file: File) => {
    try {
      const imageUrl = await uploadOrderItemImage(file);
      updateItem(index, { image_url: imageUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    }
  }, [updateItem]);

  // Calculate totals
  const calculateSubtotal = () => {
    return form.items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unit_price;
      if (!item.discount_amount || !item.discount_type) return sum + itemSubtotal;
      
      if (item.discount_type === DiscountType.PERCENTAGE) {
        return sum + (itemSubtotal - (itemSubtotal * item.discount_amount / 100));
      }
      return sum + (itemSubtotal - item.discount_amount);
    }, 0);
  };

  const calculateOrderDiscount = () => {
    const subtotal = calculateSubtotal();
    if (!form.discount_amount || !form.discount_type) return 0;
    
    if (form.discount_type === DiscountType.PERCENTAGE) {
      return subtotal * form.discount_amount / 100;
    }
    return form.discount_amount;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateOrderDiscount();
  };


  // Validate form
  const validateForm = (): string | null => {
    if (!form.customer_id) return 'Please select a customer';
    if (form.items.length === 0) return 'Please add at least one item';
    
    for (let i = 0; i < form.items.length; i++) {
      const item = form.items[i];
      if (!item.product_name) return `Item #${i + 1}: Product name is required`;
      if (!item.product_category_id) return `Item #${i + 1}: Category is required`;
      if (item.quantity < 1) return `Item #${i + 1}: Quantity must be at least 1`;
      if (item.unit_price < 0) return `Item #${i + 1}: Price cannot be negative`;
      if (item.discount_type && item.discount_amount > 0 && !item.discount_reason) {
        return `Item #${i + 1}: Discount reason is required`;
      }
    }
    
    if (form.discount_type && form.discount_amount > 0 && !form.discount_reason) {
      return 'Order discount reason is required';
    }
    
    return null;
  };

  // Submit order
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createOrder({
        order_number: form.order_number,
        source: form.source,
        customer_id: form.customer_id,
        order_date: new Date().toISOString(),
        discount_amount: form.discount_amount || 0,
        discount_type: form.discount_type || null,
        discount_reason: form.discount_reason || null,
        notes: form.notes || null,
        items: form.items.map(item => ({
          product_id: item.product_id || null,
          product_name: item.product_name,
          product_category_id: item.product_category_id,
          is_colored: item.is_colored,
          dimensions: item.dimensions || null,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_amount: item.discount_amount || 0,
          discount_type: item.discount_type || null,
          discount_reason: item.discount_reason || null,
          image_url: item.image_url || null,
          custom_description: item.custom_description || null,
        })),
      });

      router.push('/orders');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const sourceOptions = [
    { value: OrderSource.CUSTOM, label: 'Custom Order' },
    { value: OrderSource.OTHER, label: 'Other' },
  ];

  const discountTypeOptions = [
    { value: '', label: 'No Discount' },
    { value: DiscountType.FIXED, label: 'Fixed Amount' },
    { value: DiscountType.PERCENTAGE, label: 'Percentage' },
  ];

  const customerOptions = customers.map(c => ({ value: c.id, label: `${c.name} (${c.email})` }));

  if (dataLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: BRAND_COLORS.primary }}></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: BRAND_COLORS.dark }}>
              Create Manual Order
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Create a new order for in-person or custom sales
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Order Details */}
        <Card>
          <h2 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.dark }}>
            Order Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Order Number"
              value={form.order_number}
              onChange={(e) => updateForm({ order_number: e.target.value })}
              required
            />
            <Select
              label="Order Source"
              options={sourceOptions}
              value={form.source}
              onChange={(e) => updateForm({ source: e.target.value as OrderSource })}
            />
            <div className="lg:col-span-2">
              <Select
                label="Customer"
                options={customerOptions}
                value={form.customer_id}
                onChange={(e) => updateForm({ customer_id: e.target.value })}
                placeholder="Select a customer"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1" style={{ color: BRAND_COLORS.dark }}>
              Notes
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
              rows={3}
              value={form.notes}
              onChange={(e) => updateForm({ notes: e.target.value })}
              placeholder="Order notes (optional)"
            />
          </div>
        </Card>

        {/* Order Items */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold" style={{ color: BRAND_COLORS.dark }}>
              Order Items
            </h2>
            <Button type="button" variant="outline" onClick={addItem} className="flex items-center gap-2">
              <PlusIcon />
              Add Item
            </Button>
          </div>

          {form.items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No items added. Click "Add Item" to start.
            </div>
          ) : (
            form.items.map((item, index) => (
              <OrderItemRow
                key={item.id}
                item={item}
                index={index}
                categories={categories}
                products={products}
                onUpdate={updateItem}
                onRemove={removeItem}
                onImageUpload={handleImageUpload}
              />
            ))
          )}
        </Card>


        {/* Order Discount */}
        <Card>
          <h2 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.dark }}>
            Order Discount
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Discount Type"
              options={discountTypeOptions}
              value={form.discount_type}
              onChange={(e) => updateForm({ discount_type: e.target.value as DiscountType | '' })}
            />
            {form.discount_type && (
              <>
                <Input
                  label={form.discount_type === DiscountType.PERCENTAGE ? 'Discount (%)' : 'Discount (LKR)'}
                  type="number"
                  min={0}
                  step={form.discount_type === DiscountType.PERCENTAGE ? 1 : 0.01}
                  max={form.discount_type === DiscountType.PERCENTAGE ? 100 : undefined}
                  value={form.discount_amount}
                  onChange={(e) => updateForm({ discount_amount: parseFloat(e.target.value) || 0 })}
                />
                <Input
                  label="Discount Reason"
                  value={form.discount_reason}
                  onChange={(e) => updateForm({ discount_reason: e.target.value })}
                  placeholder="Required"
                />
              </>
            )}
          </div>
        </Card>

        {/* Order Summary */}
        <Card>
          <h2 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.dark }}>
            Order Summary
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal ({form.items.length} items)</span>
              <span>LKR {calculateSubtotal().toFixed(2)}</span>
            </div>
            {form.discount_type && form.discount_amount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>
                  Order Discount 
                  {form.discount_type === DiscountType.PERCENTAGE 
                    ? ` (${form.discount_amount}%)` 
                    : ''}
                </span>
                <span>-${calculateOrderDiscount().toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold pt-3 border-t border-gray-200">
              <span style={{ color: BRAND_COLORS.dark }}>Total</span>
              <span style={{ color: BRAND_COLORS.primary }}>LKR {calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading || form.items.length === 0}
          >
            {loading ? 'Creating Order...' : 'Create Order'}
          </Button>
        </div>
      </form>
    </MainLayout>
  );
}
