'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface PricingSettingsProps {
  settings: {
    insider_access_price: string;
    insider_access_original_price: string;
    main_experience_price: string;
    main_experience_original_price: string;
    executive_escape_price: string;
    executive_escape_original_price: string;
  };
  onUpdate: (key: string, value: string) => Promise<void>;
  onUpdateMultiple: (settings: Record<string, string>) => Promise<void>;
  saving: boolean;
}

export default function PricingSettings({
  settings,
  onUpdate,
  onUpdateMultiple,
  saving,
}: PricingSettingsProps) {
  // Insider Access Pricing
  const [insiderPrice, setInsiderPrice] = useState(settings.insider_access_price);
  const [insiderOriginalPrice, setInsiderOriginalPrice] = useState(
    settings.insider_access_original_price
  );

  // Main Experience Pricing
  const [mainPrice, setMainPrice] = useState(settings.main_experience_price);
  const [mainOriginalPrice, setMainOriginalPrice] = useState(
    settings.main_experience_original_price
  );

  // Executive Escape Pricing
  const [executivePrice, setExecutivePrice] = useState(settings.executive_escape_price);
  const [executiveOriginalPrice, setExecutiveOriginalPrice] = useState(
    settings.executive_escape_original_price
  );

  const handleSaveInsiderPrice = async () => {
    await onUpdate('insider_access_price', insiderPrice);
  };

  const handleSaveInsiderOriginalPrice = async () => {
    await onUpdate('insider_access_original_price', insiderOriginalPrice);
  };

  const handleSaveMainPrice = async () => {
    await onUpdate('main_experience_price', mainPrice);
  };

  const handleSaveMainOriginalPrice = async () => {
    await onUpdate('main_experience_original_price', mainOriginalPrice);
  };

  const handleSaveExecutivePrice = async () => {
    await onUpdate('executive_escape_price', executivePrice);
  };

  const handleSaveExecutiveOriginalPrice = async () => {
    await onUpdate('executive_escape_original_price', executiveOriginalPrice);
  };

  const handleSaveAllChanges = async () => {
    const settingsToUpdate: Record<string, string> = {};

    if (insiderPrice !== settings.insider_access_price) {
      settingsToUpdate.insider_access_price = insiderPrice;
    }
    if (insiderOriginalPrice !== settings.insider_access_original_price) {
      settingsToUpdate.insider_access_original_price = insiderOriginalPrice;
    }
    if (mainPrice !== settings.main_experience_price) {
      settingsToUpdate.main_experience_price = mainPrice;
    }
    if (mainOriginalPrice !== settings.main_experience_original_price) {
      settingsToUpdate.main_experience_original_price = mainOriginalPrice;
    }
    if (executivePrice !== settings.executive_escape_price) {
      settingsToUpdate.executive_escape_price = executivePrice;
    }
    if (executiveOriginalPrice !== settings.executive_escape_original_price) {
      settingsToUpdate.executive_escape_original_price = executiveOriginalPrice;
    }

    if (Object.keys(settingsToUpdate).length > 0) {
      await onUpdateMultiple(settingsToUpdate);
    }
  };

  const hasChanges = () => {
    return (
      insiderPrice !== settings.insider_access_price ||
      insiderOriginalPrice !== settings.insider_access_original_price ||
      mainPrice !== settings.main_experience_price ||
      mainOriginalPrice !== settings.main_experience_original_price ||
      executivePrice !== settings.executive_escape_price ||
      executiveOriginalPrice !== settings.executive_escape_original_price
    );
  };

  return (
    <>
      {/* Insider Access Pricing */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Insider Access Pricing</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="insider-discounted" className="mb-2">
              Discounted Price
            </Label>
            <div className="flex gap-2">
              <Input
                id="insider-discounted"
                type="text"
                value={insiderPrice}
                onChange={(e) => setInsiderPrice(e.target.value)}
                placeholder="₹499/month"
                className="flex-1"
                disabled={saving}
              />
              <Button
                onClick={handleSaveInsiderPrice}
                variant="secondary"
                disabled={saving || insiderPrice === settings.insider_access_price}
              >
                Save
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="insider-original" className="mb-2">
              Original Price
            </Label>
            <div className="flex gap-2">
              <Input
                id="insider-original"
                type="text"
                value={insiderOriginalPrice}
                onChange={(e) => setInsiderOriginalPrice(e.target.value)}
                placeholder="₹600/month"
                className="flex-1"
                disabled={saving}
              />
              <Button
                onClick={handleSaveInsiderOriginalPrice}
                variant="secondary"
                disabled={saving || insiderOriginalPrice === settings.insider_access_original_price}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Experience Pricing */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Main Experience Pricing</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="main-discounted" className="mb-2">
              Discounted Price
            </Label>
            <div className="flex gap-2">
              <Input
                id="main-discounted"
                type="text"
                value={mainPrice}
                onChange={(e) => setMainPrice(e.target.value)}
                placeholder="₹48,500"
                className="flex-1"
                disabled={saving}
              />
              <Button
                onClick={handleSaveMainPrice}
                variant="secondary"
                disabled={saving || mainPrice === settings.main_experience_price}
              >
                Save
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="main-original" className="mb-2">
              Original Price
            </Label>
            <div className="flex gap-2">
              <Input
                id="main-original"
                type="text"
                value={mainOriginalPrice}
                onChange={(e) => setMainOriginalPrice(e.target.value)}
                placeholder="₹60,000"
                className="flex-1"
                disabled={saving}
              />
              <Button
                onClick={handleSaveMainOriginalPrice}
                variant="secondary"
                disabled={saving || mainOriginalPrice === settings.main_experience_original_price}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Executive Escape Pricing */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Executive Escape Pricing</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="executive-discounted" className="mb-2">
              Discounted Price
            </Label>
            <div className="flex gap-2">
              <Input
                id="executive-discounted"
                type="text"
                value={executivePrice}
                onChange={(e) => setExecutivePrice(e.target.value)}
                placeholder="₹1,50,000"
                className="flex-1"
                disabled={saving}
              />
              <Button
                onClick={handleSaveExecutivePrice}
                variant="secondary"
                disabled={saving || executivePrice === settings.executive_escape_price}
              >
                Save
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="executive-original" className="mb-2">
              Original Price
            </Label>
            <div className="flex gap-2">
              <Input
                id="executive-original"
                type="text"
                value={executiveOriginalPrice}
                onChange={(e) => setExecutiveOriginalPrice(e.target.value)}
                placeholder="₹2,00,000"
                className="flex-1"
                disabled={saving}
              />
              <Button
                onClick={handleSaveExecutiveOriginalPrice}
                variant="secondary"
                disabled={
                  saving || executiveOriginalPrice === settings.executive_escape_original_price
                }
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Save All Changes Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveAllChanges} disabled={saving || !hasChanges()} size="lg">
          {saving ? 'Saving...' : 'Save All Changes'}
        </Button>
      </div>
    </>
  );
}
