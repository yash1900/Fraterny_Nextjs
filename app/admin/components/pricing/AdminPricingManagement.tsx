'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  DollarSign,
  Save,
  RefreshCw,
  Clock,
  AlertTriangle,
  Eye,
  EyeOff,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import PricingForm, { PricingFormData } from './components/PricingForm';
import PricingHistory, { DynamicPricingData } from './components/PricingHistory';

export default function AdminPricingManagement() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activePricing, setActivePricing] = useState<DynamicPricingData | null>(null);
  const [pricingHistory, setPricingHistory] = useState<DynamicPricingData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [priceSource, setPriceSource] = useState<'environment' | 'database'>('environment');
  const [showHistory, setShowHistory] = useState(false);

  const [formData, setFormData] = useState<PricingFormData>({
    razorpay_india_price_paise: 20000,
    razorpay_india_display_price_paise: 120000,
    razorpay_international_price_cents: 1000,
    razorpay_international_display_price_cents: 2500,
    paypal_india_price_cents: 500,
    paypal_india_display_price_cents: 200,
    paypal_international_price_cents: 1000,
    paypal_international_display_price_cents: 2500,
    updated_by: 'admin',
    notes: ''
  });

  // Fetch active pricing
  const fetchActivePricingData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check what pricing source we're using
      const displayResponse = await fetch('/api/admin/pricing/display');
      const displayPricing = await displayResponse.json();
      
      setPriceSource(displayPricing.source);
      
      if (displayPricing.source === 'database') {
        // Fetch active pricing from database
        const response = await fetch('/api/admin/pricing?activeOnly=true');
        const result = await response.json();
        
        if (result.success && result.data) {
          setActivePricing(result.data);
          setFormData({
            razorpay_india_price_paise: result.data.razorpay_india_price_paise,
            razorpay_india_display_price_paise: result.data.razorpay_india_display_price_paise,
            razorpay_international_price_cents: result.data.razorpay_international_price_cents,
            razorpay_international_display_price_cents: result.data.razorpay_international_display_price_cents,
            paypal_india_price_cents: result.data.paypal_india_price_cents,
            paypal_india_display_price_cents: result.data.paypal_india_display_price_cents,
            paypal_international_price_cents: result.data.paypal_international_price_cents,
            paypal_international_display_price_cents: result.data.paypal_international_display_price_cents,
            updated_by: 'admin',
            notes: result.data.notes || ''
          });
        } else {
          setError(result.error || 'Failed to load active pricing');
        }
      } else {
        // Using environment variables
        setActivePricing(null);
        if (displayPricing.success && displayPricing.data) {
          setFormData({
            razorpay_india_price_paise: displayPricing.data.razorpay.india.price,
            razorpay_india_display_price_paise: displayPricing.data.razorpay.india.displayPrice,
            razorpay_international_price_cents: displayPricing.data.razorpay.international.price,
            razorpay_international_display_price_cents: displayPricing.data.razorpay.international.displayPrice,
            paypal_india_price_cents: displayPricing.data.paypal.india.price,
            paypal_india_display_price_cents: displayPricing.data.paypal.india.displayPrice,
            paypal_international_price_cents: displayPricing.data.paypal.international.price,
            paypal_international_display_price_cents: displayPricing.data.paypal.international.displayPrice,
            updated_by: 'admin',
            notes: ''
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch pricing history
  const fetchHistoryData = async () => {
    try {
      const response = await fetch('/api/admin/pricing');
      const result = await response.json();
      
      if (result.success && result.data) {
        setPricingHistory(result.data);
      }
    } catch (err: any) {
      console.error('Error fetching pricing history:', err);
    }
  };

  // Handle form input changes
  const handleInputChange = (field: keyof PricingFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Activate a historical pricing config
  const handleActivate = async (id: string) => {
    const response = await fetch(`/api/admin/pricing/activate/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        updated_by: formData.updated_by, 
        notes: 'Activated from history' 
      }),
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to activate pricing');
    }

    await fetchActivePricingData();
    await fetchHistoryData();
  };

  // Save pricing configuration
  const handleSave = async () => {
    if (priceSource === 'environment') {
      toast.error('Cannot save in development mode. Switch to live mode to save pricing.');
      return;
    }

    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Pricing configuration updated successfully');
        await fetchActivePricingData();
        await fetchHistoryData();
      } else {
        setError(result.error || 'Failed to update pricing');
        toast.error(result.error || 'Failed to update pricing');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update pricing');
      toast.error('Failed to update pricing');
    } finally {
      setSaving(false);
    }
  };

  // Initialize data
  useEffect(() => {
    fetchActivePricingData();
    fetchHistoryData();
  }, []);

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <DollarSign className="h-6 w-6" />
              Dynamic Pricing Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage Quest PDF pricing configuration
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        </div>
      )}

      {/* Current Pricing Configuration */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Current Pricing Configuration</h2>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowHistory(!showHistory)}
              size="sm"
            >
              {showHistory ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showHistory ? 'Hide' : 'Show'} History
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading pricing configuration...</span>
          </div>
        ) : (
          <>
            <PricingForm 
              formData={formData}
              onChange={handleInputChange}
              disabled={priceSource === 'environment'}
            />

            {/* Metadata Section */}
            {priceSource === 'database' && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-md font-semibold text-gray-900 mb-4">Metadata</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="updated_by">Updated By</Label>
                    <Input
                      id="updated_by"
                      type="text"
                      value={formData.updated_by}
                      onChange={(e) => handleInputChange('updated_by', e.target.value)}
                      placeholder="admin"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      type="text"
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Reason for update..."
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          {priceSource === 'environment' ? (
            <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
              <Info className="h-4 w-4" />
              <span className="text-sm">Set NEXT_PUBLIC_DYNAMIC_PRICE_STATUS=live to enable saving</span>
            </div>
          ) : (
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="flex items-center gap-2"
            >
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Configuration
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Pricing History */}
      {showHistory && priceSource === 'database' && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pricing History
          </h2>
          
          <PricingHistory 
            history={pricingHistory}
            onActivate={handleActivate}
          />
        </div>
      )}
    </div>
  );
}
