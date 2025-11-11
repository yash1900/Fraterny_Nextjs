'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface PricingFormData {
  razorpay_india_price_paise: number;
  razorpay_india_display_price_paise: number;
  razorpay_international_price_cents: number;
  razorpay_international_display_price_cents: number;
  paypal_india_price_cents: number;
  paypal_india_display_price_cents: number;
  paypal_international_price_cents: number;
  paypal_international_display_price_cents: number;
  updated_by: string;
  notes: string;
}

interface PricingFormProps {
  formData: PricingFormData;
  onChange: (field: keyof PricingFormData, value: string | number) => void;
  disabled: boolean;
}

export default function PricingForm({ formData, onChange, disabled }: PricingFormProps) {
  const formatCurrency = (amount: number, currency: 'INR' | 'USD'): string => {
    if (currency === 'INR') {
      return `₹${(amount / 100).toFixed(2)}`;
    } else {
      return `$${(amount / 100).toFixed(2)}`;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Razorpay Section */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
          💳 Razorpay Pricing
        </h3>
        
        <div className="space-y-4">
          {/* India Pricing */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">🇮🇳 India Pricing</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="razorpay_india_price" className="text-xs text-gray-500 mb-1">
                  Price (paise)
                </Label>
                <Input
                  id="razorpay_india_price"
                  type="number"
                  value={formData.razorpay_india_price_paise}
                  onChange={(e) => onChange('razorpay_india_price_paise', parseInt(e.target.value) || 0)}
                  disabled={disabled}
                  className="text-sm"
                />
                <div className="text-xs text-gray-500 mt-1">
                  = {formatCurrency(formData.razorpay_india_price_paise, 'INR')}
                </div>
              </div>
              <div>
                <Label htmlFor="razorpay_india_display" className="text-xs text-gray-500 mb-1">
                  Display Price (paise)
                </Label>
                <Input
                  id="razorpay_india_display"
                  type="number"
                  value={formData.razorpay_india_display_price_paise}
                  onChange={(e) => onChange('razorpay_india_display_price_paise', parseInt(e.target.value) || 0)}
                  disabled={disabled}
                  className="text-sm"
                />
                <div className="text-xs text-gray-500 mt-1">
                  = {formatCurrency(formData.razorpay_india_display_price_paise, 'INR')}
                </div>
              </div>
            </div>
          </div>

          {/* International Pricing */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">🌍 International Pricing</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="razorpay_intl_price" className="text-xs text-gray-500 mb-1">
                  Price (cents)
                </Label>
                <Input
                  id="razorpay_intl_price"
                  type="number"
                  value={formData.razorpay_international_price_cents}
                  onChange={(e) => onChange('razorpay_international_price_cents', parseInt(e.target.value) || 0)}
                  disabled={disabled}
                  className="text-sm"
                />
                <div className="text-xs text-gray-500 mt-1">
                  = {formatCurrency(formData.razorpay_international_price_cents, 'USD')}
                </div>
              </div>
              <div>
                <Label htmlFor="razorpay_intl_display" className="text-xs text-gray-500 mb-1">
                  Display Price (cents)
                </Label>
                <Input
                  id="razorpay_intl_display"
                  type="number"
                  value={formData.razorpay_international_display_price_cents}
                  onChange={(e) => onChange('razorpay_international_display_price_cents', parseInt(e.target.value) || 0)}
                  disabled={disabled}
                  className="text-sm"
                />
                <div className="text-xs text-gray-500 mt-1">
                  = {formatCurrency(formData.razorpay_international_display_price_cents, 'USD')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PayPal Section */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
          🌐 PayPal Pricing
        </h3>
        
        <div className="space-y-4">
          {/* India Pricing */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">🇮🇳 India Pricing</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="paypal_india_price" className="text-xs text-gray-500 mb-1">
                  Price (cents)
                </Label>
                <Input
                  id="paypal_india_price"
                  type="number"
                  value={formData.paypal_india_price_cents}
                  onChange={(e) => onChange('paypal_india_price_cents', parseInt(e.target.value) || 0)}
                  disabled={disabled}
                  className="text-sm"
                />
                <div className="text-xs text-gray-500 mt-1">
                  = {formatCurrency(formData.paypal_india_price_cents, 'USD')}
                </div>
              </div>
              <div>
                <Label htmlFor="paypal_india_display" className="text-xs text-gray-500 mb-1">
                  Display Price (cents)
                </Label>
                <Input
                  id="paypal_india_display"
                  type="number"
                  value={formData.paypal_india_display_price_cents}
                  onChange={(e) => onChange('paypal_india_display_price_cents', parseInt(e.target.value) || 0)}
                  disabled={disabled}
                  className="text-sm"
                />
                <div className="text-xs text-gray-500 mt-1">
                  = {formatCurrency(formData.paypal_india_display_price_cents, 'USD')}
                </div>
              </div>
            </div>
          </div>

          {/* International Pricing */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">🌍 International Pricing</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="paypal_intl_price" className="text-xs text-gray-500 mb-1">
                  Price (cents)
                </Label>
                <Input
                  id="paypal_intl_price"
                  type="number"
                  value={formData.paypal_international_price_cents}
                  onChange={(e) => onChange('paypal_international_price_cents', parseInt(e.target.value) || 0)}
                  disabled={disabled}
                  className="text-sm"
                />
                <div className="text-xs text-gray-500 mt-1">
                  = {formatCurrency(formData.paypal_international_price_cents, 'USD')}
                </div>
              </div>
              <div>
                <Label htmlFor="paypal_intl_display" className="text-xs text-gray-500 mb-1">
                  Display Price (cents)
                </Label>
                <Input
                  id="paypal_intl_display"
                  type="number"
                  value={formData.paypal_international_display_price_cents}
                  onChange={(e) => onChange('paypal_international_display_price_cents', parseInt(e.target.value) || 0)}
                  disabled={disabled}
                  className="text-sm"
                />
                <div className="text-xs text-gray-500 mt-1">
                  = {formatCurrency(formData.paypal_international_display_price_cents, 'USD')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
