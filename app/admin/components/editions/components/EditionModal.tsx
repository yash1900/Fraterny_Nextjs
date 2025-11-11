'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { VillaEdition } from '../VillaEditionsManagement';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

interface EditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  edition: VillaEdition | null;
}

export default function EditionModal({ isOpen, onClose, onSuccess, edition }: EditionModalProps) {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    timeFrame: '',
    isActive: true,
    allocationStatus: 'available' as 'available' | 'limited' | 'sold_out',
    allotedSeats: 0,
    totalSeats: 20,
    displayOrder: 1
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (edition) {
      setFormData({
        startDate: edition.startDate,
        endDate: edition.endDate,
        timeFrame: edition.timeFrame || '',
        isActive: edition.isActive,
        allocationStatus: edition.allocationStatus,
        allotedSeats: edition.allotedSeats,
        totalSeats: edition.totalSeats,
        displayOrder: edition.displayOrder
      });
    } else {
      setFormData({
        startDate: '',
        endDate: '',
        timeFrame: '',
        isActive: true,
        allocationStatus: 'available',
        allotedSeats: 0,
        totalSeats: 20,
        displayOrder: 1
      });
    }
  }, [edition, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.startDate || !formData.endDate) {
      toast.error('Please provide both start and end dates');
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error('End date must be after start date');
      return;
    }

    if (formData.allotedSeats > formData.totalSeats) {
      toast.error('Alloted seats cannot exceed total seats');
      return;
    }

    setLoading(true);
    try {
      const url = '/api/settings/editions';
      const method = edition ? 'PUT' : 'POST';
      const body = edition 
        ? JSON.stringify({ id: edition.id, ...formData })
        : JSON.stringify(formData);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      });

      if (!response.ok) {
        throw new Error('Failed to save edition');
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success(edition ? 'Edition updated successfully' : 'Edition added successfully');
        onSuccess();
      } else {
        toast.error(result.error || 'Failed to save edition');
      }
    } catch (error) {
      console.error('Error saving edition:', error);
      toast.error('Failed to save edition');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-navy">
            {edition ? 'Edit Edition' : 'Add New Edition'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">
                Start Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="endDate">
                End Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
                className="mt-2"
              />
            </div>
          </div>

          {/* Time Frame */}
          <div>
            <Label htmlFor="timeFrame">
              Time Frame (Optional)
            </Label>
            <Input
              id="timeFrame"
              type="text"
              value={formData.timeFrame}
              onChange={(e) => setFormData({ ...formData, timeFrame: e.target.value })}
              placeholder="e.g., Morning Session: 9 AM - 12 PM"
              className="mt-2"
            />
          </div>

          {/* Seats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="totalSeats">
                Total Seats <span className="text-red-500">*</span>
              </Label>
              <Input
                id="totalSeats"
                type="number"
                value={formData.totalSeats}
                onChange={(e) => setFormData({ ...formData, totalSeats: parseInt(e.target.value) || 0 })}
                min="1"
                required
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="allotedSeats">
                Alloted Seats
              </Label>
              <Input
                id="allotedSeats"
                type="number"
                value={formData.allotedSeats}
                onChange={(e) => setFormData({ ...formData, allotedSeats: parseInt(e.target.value) || 0 })}
                min="0"
                max={formData.totalSeats}
                className="mt-2"
              />
            </div>
          </div>

          {/* Allocation Status */}
          <div>
            <Label htmlFor="allocationStatus">
              Allocation Status
            </Label>
            <select
              id="allocationStatus"
              value={formData.allocationStatus}
              onChange={(e) => setFormData({ ...formData, allocationStatus: e.target.value as any })}
              className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
            >
              <option value="available">Available</option>
              <option value="limited">Limited</option>
              <option value="sold_out">Sold Out</option>
            </select>
          </div>

          {/* Display Order */}
          <div>
            <Label htmlFor="displayOrder">
              Display Order
            </Label>
            <Input
              id="displayOrder"
              type="number"
              value={formData.displayOrder}
              onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
              min="1"
              className="mt-2"
            />
          </div>

          {/* Is Active */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-navy border-gray-300 rounded focus:ring-navy"
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Active (visible to users)
            </Label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {edition ? 'Update Edition' : 'Add Edition'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
