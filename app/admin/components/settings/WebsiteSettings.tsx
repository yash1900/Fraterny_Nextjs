'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import RegistrationSettings from './components/RegistrationSettings';
import PricingSettings from './components/PricingSettings';

interface WebsiteSettingsData {
  registration_days_left: number;
  available_seats: number;
  registration_close_date: string;
  accepting_applications_for_date: string;
  insider_access_price: string;
  insider_access_original_price: string;
  main_experience_price: string;
  main_experience_original_price: string;
  executive_escape_price: string;
  executive_escape_original_price: string;
  applications_received?: string;
}

export default function WebsiteSettings() {
  const [settings, setSettings] = useState<WebsiteSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings');
      
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      setSettings(data);
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, value }),
      });

      if (!response.ok) {
        throw new Error('Failed to update setting');
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success(result.message || 'Setting updated successfully');
        // Refresh settings
        await fetchSettings();
      } else {
        throw new Error(result.error || 'Failed to update setting');
      }
    } catch (error: any) {
      console.error('Error updating setting:', error);
      toast.error(error.message || 'Failed to update setting');
    }
  };

  const updateMultipleSettings = async (settingsToUpdate: Record<string, string>) => {
    try {
      setSaving(true);
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: settingsToUpdate }),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success('All settings updated successfully');
        // Refresh settings
        await fetchSettings();
      } else {
        throw new Error(result.message || 'Some settings failed to update');
      }
    } catch (error: any) {
      console.error('Error updating settings:', error);
      toast.error(error.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-black text-gray-900 mb-8">Website Settings</h1>
        <div className="space-y-6">
          <Card className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-black text-gray-900 mb-8">Website Settings</h1>
        <Card className="p-6">
          <p className="text-gray-600">Failed to load settings. Please refresh the page.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-black text-gray-900 mb-8">Website Settings</h1>

      <div className="space-y-8">
        {/* Registration Settings */}
        <RegistrationSettings
          settings={settings}
          onUpdate={updateSetting}
          saving={saving}
        />

        {/* Pricing Settings */}
        <PricingSettings
          settings={settings}
          onUpdate={updateSetting}
          onUpdateMultiple={updateMultipleSettings}
          saving={saving}
        />
      </div>
    </div>
  );
}
