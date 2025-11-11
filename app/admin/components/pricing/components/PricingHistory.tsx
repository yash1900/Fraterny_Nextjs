'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, RotateCcw, AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';

export interface DynamicPricingData {
  id: string;
  razorpay_india_price_paise: number;
  razorpay_india_display_price_paise: number;
  razorpay_international_price_cents: number;
  razorpay_international_display_price_cents: number;
  paypal_india_price_cents: number;
  paypal_india_display_price_cents: number;
  paypal_international_price_cents: number;
  paypal_international_display_price_cents: number;
  is_active: boolean;
  updated_at: string;
  updated_by: string | null;
  notes: string | null;
}

interface PricingHistoryProps {
  history: DynamicPricingData[];
  onActivate: (id: string) => Promise<void>;
}

export default function PricingHistory({ history, onActivate }: PricingHistoryProps) {
  const [confirmDialog, setConfirmDialog] = useState<{ show: boolean; pricingId: string | null }>({ 
    show: false, 
    pricingId: null 
  });
  const [activating, setActivating] = useState(false);

  const formatCurrency = (amount: number, currency: 'INR' | 'USD'): string => {
    if (currency === 'INR') {
      return `₹${(amount / 100).toFixed(2)}`;
    } else {
      return `$${(amount / 100).toFixed(2)}`;
    }
  };

  const handleActivateClick = (id: string) => {
    setConfirmDialog({ show: true, pricingId: id });
  };

  const confirmActivate = async () => {
    if (!confirmDialog.pricingId) return;
    
    setActivating(true);
    try {
      await onActivate(confirmDialog.pricingId);
      toast.success('Pricing configuration activated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to activate pricing');
    } finally {
      setActivating(false);
      setConfirmDialog({ show: false, pricingId: null });
    }
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No pricing history available
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {history.map((pricing) => (
          <div 
            key={pricing.id} 
            className={`border rounded-lg p-4 ${
              pricing.is_active ? 'border-green-200 bg-green-50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {pricing.is_active && (
                  <span className="flex items-center gap-1 text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    Active
                  </span>
                )}
                <span className="text-sm text-gray-500">
                  Updated: {new Date(pricing.updated_at).toLocaleString()}
                </span>
                {pricing.updated_by && (
                  <span className="text-sm text-gray-500">by {pricing.updated_by}</span>
                )}
              </div>
              <div>
                {!pricing.is_active && (
                  <Button 
                    size="sm" 
                    onClick={() => handleActivateClick(pricing.id)} 
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" /> Activate
                  </Button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Razorpay India:</span>
                <div className="font-medium">
                  {formatCurrency(pricing.razorpay_india_price_paise, 'INR')} / 
                  {formatCurrency(pricing.razorpay_india_display_price_paise, 'INR')}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Razorpay Intl:</span>
                <div className="font-medium">
                  {formatCurrency(pricing.razorpay_international_price_cents, 'USD')} / 
                  {formatCurrency(pricing.razorpay_international_display_price_cents, 'USD')}
                </div>
              </div>
              <div>
                <span className="text-gray-500">PayPal India:</span>
                <div className="font-medium">
                  {formatCurrency(pricing.paypal_india_price_cents, 'USD')} / 
                  {formatCurrency(pricing.paypal_india_display_price_cents, 'USD')}
                </div>
              </div>
              <div>
                <span className="text-gray-500">PayPal Intl:</span>
                <div className="font-medium">
                  {formatCurrency(pricing.paypal_international_price_cents, 'USD')} / 
                  {formatCurrency(pricing.paypal_international_display_price_cents, 'USD')}
                </div>
              </div>
            </div>
            
            {pricing.notes && (
              <div className="mt-2 text-sm text-gray-600">
                <span className="font-medium">Notes:</span> {pricing.notes}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 transform transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-100 rounded-full p-3">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Activate Historical Pricing?</h3>
              <button
                onClick={() => setConfirmDialog({ show: false, pricingId: null })}
                className="ml-auto text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              This will make the selected historical pricing configuration active. 
              The current active pricing will be deactivated automatically.
            </p>
            
            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setConfirmDialog({ show: false, pricingId: null })}
                disabled={activating}
                className="px-6"
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmActivate}
                disabled={activating}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6"
              >
                {activating ? 'Activating...' : 'Activate'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
