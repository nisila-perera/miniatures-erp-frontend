'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Select } from '@/components/ui';
import { BRAND_COLORS } from '@/config/brand';
import { Painter } from '@/types/painter';
import { fetchPainters } from '@/services/painters';
import { assignPainterToOrder, PainterAssignmentCreate } from '@/services/orders';

interface PainterAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  onAssignmentComplete: () => void;
}

interface PainterSelection {
  painterId: string;
  assignedDate: string;
  paintingCost: string;
  notes: string;
}

export default function PainterAssignmentModal({
  isOpen,
  onClose,
  orderId,
  onAssignmentComplete,
}: PainterAssignmentModalProps) {
  const [painters, setPainters] = useState<Painter[]>([]);
  const [loadingPainters, setLoadingPainters] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Multiple painter selections
  const [selections, setSelections] = useState<PainterSelection[]>([
    { painterId: '', assignedDate: new Date().toISOString().split('T')[0], paintingCost: '', notes: '' }
  ]);

  // Load painters when modal opens
  useEffect(() => {
    if (isOpen) {
      loadPainters();
      // Reset form
      setSelections([
        { painterId: '', assignedDate: new Date().toISOString().split('T')[0], paintingCost: '', notes: '' }
      ]);
      setError(null);
      setSuccessMessage(null);
    }
  }, [isOpen]);

  const loadPainters = async () => {
    try {
      setLoadingPainters(true);
      const data = await fetchPainters();
      // Filter to only active painters
      setPainters(data.filter(p => p.is_active));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load painters');
    } finally {
      setLoadingPainters(false);
    }
  };

  const addPainterSelection = () => {
    setSelections([
      ...selections,
      { painterId: '', assignedDate: new Date().toISOString().split('T')[0], paintingCost: '', notes: '' }
    ]);
  };

  const removePainterSelection = (index: number) => {
    if (selections.length > 1) {
      setSelections(selections.filter((_, i) => i !== index));
    }
  };

  const updateSelection = (index: number, field: keyof PainterSelection, value: string) => {
    const updated = [...selections];
    updated[index] = { ...updated[index], [field]: value };
    setSelections(updated);
  };

  const validateSelections = (): boolean => {
    for (const selection of selections) {
      if (!selection.painterId) {
        setError('Please select a painter for all entries');
        return false;
      }
      if (!selection.assignedDate) {
        setError('Please select an assignment date for all entries');
        return false;
      }
      if (!selection.paintingCost || parseFloat(selection.paintingCost) < 0) {
        setError('Please enter a valid painting cost for all entries');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!validateSelections()) {
      return;
    }

    try {
      setSubmitting(true);
      
      // Assign each painter
      for (const selection of selections) {
        const data: PainterAssignmentCreate = {
          painter_id: selection.painterId,
          assigned_date: selection.assignedDate,
          painting_cost: parseFloat(selection.paintingCost),
          notes: selection.notes || undefined,
        };
        await assignPainterToOrder(orderId, data);
      }

      setSuccessMessage(`Successfully assigned ${selections.length} painter(s)`);
      
      // Wait a moment to show success message, then close
      setTimeout(() => {
        onAssignmentComplete();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign painter(s)');
    } finally {
      setSubmitting(false);
    }
  };

  const painterOptions = [
    { value: '', label: 'Select a painter...' },
    ...painters.map(p => ({ value: p.id, label: p.name }))
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Painters">
      <form onSubmit={handleSubmit} className="space-y-6">
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

        {loadingPainters ? (
          <div className="text-center py-4">
            <p className="text-gray-500">Loading painters...</p>
          </div>
        ) : painters.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500">No active painters available. Please add painters first.</p>
          </div>
        ) : (
          <>
            {/* Painter Selections */}
            <div className="space-y-4">
              {selections.map((selection, index) => (
                <div 
                  key={index} 
                  className="p-4 border rounded-lg space-y-4"
                  style={{ borderColor: BRAND_COLORS.secondary }}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-700">Painter {index + 1}</h4>
                    {selections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePainterSelection(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <Select
                    label="Painter"
                    options={painterOptions}
                    value={selection.painterId}
                    onChange={(e) => updateSelection(index, 'painterId', e.target.value)}
                    required
                  />

                  <Input
                    label="Assignment Date"
                    type="date"
                    value={selection.assignedDate}
                    onChange={(e) => updateSelection(index, 'assignedDate', e.target.value)}
                    required
                  />

                  <Input
                    label="Painting Cost"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={selection.paintingCost}
                    onChange={(e) => updateSelection(index, 'paintingCost', e.target.value)}
                    required
                  />

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
                      value={selection.notes}
                      onChange={(e) => updateSelection(index, 'notes', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Add Another Painter Button */}
            <button
              type="button"
              onClick={addPainterSelection}
              className="w-full py-2 border-2 border-dashed rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
              style={{ borderColor: BRAND_COLORS.secondary }}
            >
              + Add Another Painter
            </button>
          </>
        )}

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
            disabled={submitting || loadingPainters || painters.length === 0}
          >
            {submitting ? 'Assigning...' : 'Assign Painter(s)'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
