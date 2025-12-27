'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Input, Select } from '@/components/ui';
import { BRAND_COLORS } from '@/config/brand';
import { PaymentMethod, Payment } from '@/types/payment';
import { CommissionType } from '@/types';
import { fetchPaymentMethods } from '@/services/paymentMethods';
import { recordPayment, PaymentRecordCreate } from '@/services/orders';

interface PaymentRecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderTotal: number;
  paidAmount: number;
  balance: number;
  existingPayments: Payment[];
  onPaymentComplete: () => void;
}

// Format currency
function formatCurrency(amount: number | string): string {
  return `LKR ${Number(amount).toFixed(2)}`;
}

// Format date
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function PaymentRecordingModal({
  isOpen,
  onClose,
  orderId,
  orderTotal,
  paidAmount,
  balance,
  existingPayments,
  onPaymentComplete,
}: PaymentRecordingModalProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Get selected payment method
  const selectedMethod = useMemo(() => {
    return paymentMethods.find(m => m.id === selectedMethodId);
  }, [paymentMethods, selectedMethodId]);

  // Calculate commission based on selected method and amount
  const calculatedCommission = useMemo(() => {
    if (!selectedMethod || !amount || parseFloat(amount) <= 0) {
      return 0;
    }
    const paymentAmount = parseFloat(amount);
    if (selectedMethod.commission_type === CommissionType.PERCENTAGE) {
      return (paymentAmount * selectedMethod.commission_value) / 100;
    }
    return selectedMethod.commission_value;
  }, [selectedMethod, amount]);

  // Load payment methods when modal opens
  useEffect(() => {
    if (isOpen) {
      loadPaymentMethods();
      resetForm();
    }
  }, [isOpen]);

  const loadPaymentMethods = async () => {
    try {
      setLoadingMethods(true);
      const data = await fetchPaymentMethods();
      // Filter to only active payment methods
      setPaymentMethods(data.filter(m => m.is_active));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payment methods');
    } finally {
      setLoadingMethods(false);
    }
  };

  const resetForm = () => {
    setSelectedMethodId('');
    setAmount('');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setReferenceNumber('');
    setNotes('');
    setError(null);
    setSuccessMessage(null);
  };

  const validateForm = (): boolean => {
    if (!selectedMethodId) {
      setError('Please select a payment method');
      return false;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid payment amount');
      return false;
    }
    if (!paymentDate) {
      setError('Please select a payment date');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      
      const data: PaymentRecordCreate = {
        order_id: orderId,
        payment_method_id: selectedMethodId,
        amount: parseFloat(amount),
        payment_date: paymentDate,
        reference_number: referenceNumber || undefined,
        notes: notes || undefined,
      };
      
      await recordPayment(orderId, data);

      setSuccessMessage('Payment recorded successfully');
      
      // Wait a moment to show success message, then close
      setTimeout(() => {
        onPaymentComplete();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  const paymentMethodOptions = [
    { value: '', label: 'Select a payment method...' },
    ...paymentMethods.map(m => ({ value: m.id, label: m.name }))
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Payment">
      <div className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            {successMessage}
          </div>
        )}

        {/* Balance Summary */}
        <div 
          className="grid grid-cols-3 gap-4 p-4 rounded-lg"
          style={{ backgroundColor: BRAND_COLORS.secondary + '40' }}
        >
          <div className="text-center">
            <p className="text-sm text-gray-600">Order Total</p>
            <p className="text-lg font-semibold" style={{ color: BRAND_COLORS.dark }}>
              {formatCurrency(orderTotal)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Paid</p>
            <p className="text-lg font-semibold text-green-600">
              {formatCurrency(paidAmount)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Balance</p>
            <p className={`text-lg font-semibold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(balance)}
            </p>
          </div>
        </div>

        {loadingMethods ? (
          <div className="text-center py-4">
            <p className="text-gray-500">Loading payment methods...</p>
          </div>
        ) : paymentMethods.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500">No active payment methods available. Please add payment methods first.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Payment Method Selection */}
            <Select
              label="Payment Method"
              options={paymentMethodOptions}
              value={selectedMethodId}
              onChange={(e) => setSelectedMethodId(e.target.value)}
              required
            />

            {/* Commission Info */}
            {selectedMethod && (
              <div 
                className="p-3 rounded-lg text-sm"
                style={{ backgroundColor: BRAND_COLORS.secondary + '30' }}
              >
                <p className="text-gray-600">
                  Commission: {selectedMethod.commission_type === CommissionType.PERCENTAGE 
                    ? `${selectedMethod.commission_value}%` 
                    : `${formatCurrency(Number(selectedMethod.commission_value))} (fixed)`}
                </p>
              </div>
            )}

            {/* Payment Amount */}
            <Input
              label="Payment Amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />

            {/* Calculated Commission Display */}
            {amount && parseFloat(amount) > 0 && selectedMethod && (
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg text-sm">
                <span className="text-gray-600">Commission Amount:</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(calculatedCommission)}
                </span>
              </div>
            )}

            {/* Payment Date */}
            <Input
              label="Payment Date"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
            />

            {/* Reference Number */}
            <Input
              label="Reference Number (Optional)"
              type="text"
              placeholder="Transaction ID, check number, etc."
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
            />

            {/* Notes */}
            <div className="w-full">
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: BRAND_COLORS.dark }}
              >
                Notes (Optional)
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-colors"
                rows={2}
                placeholder="Any additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={submitting || loadingMethods || paymentMethods.length === 0}
              >
                {submitting ? 'Recording...' : 'Record Payment'}
              </Button>
            </div>
          </form>
        )}


        {/* Payment History */}
        {existingPayments && existingPayments.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-700 mb-3">Payment History</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-2 font-medium text-gray-600">Date</th>
                    <th className="text-left py-2 px-2 font-medium text-gray-600">Method</th>
                    <th className="text-right py-2 px-2 font-medium text-gray-600">Amount</th>
                    <th className="text-right py-2 px-2 font-medium text-gray-600">Commission</th>
                  </tr>
                </thead>
                <tbody>
                  {existingPayments.map((payment) => (
                    <tr key={payment.id} className="border-b border-gray-100">
                      <td className="py-2 px-2">{formatDate(payment.payment_date)}</td>
                      <td className="py-2 px-2">{payment.payment_method?.name || 'N/A'}</td>
                      <td className="py-2 px-2 text-right font-medium text-green-600">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="py-2 px-2 text-right text-gray-500">
                        {formatCurrency(payment.commission_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-200">
                    <td colSpan={2} className="py-2 px-2 font-medium text-gray-700">Total Paid</td>
                    <td className="py-2 px-2 text-right font-semibold text-green-600">
                      {formatCurrency(paidAmount)}
                    </td>
                    <td className="py-2 px-2 text-right text-gray-500">
                      {formatCurrency(existingPayments.reduce((sum, p) => sum + p.commission_amount, 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
