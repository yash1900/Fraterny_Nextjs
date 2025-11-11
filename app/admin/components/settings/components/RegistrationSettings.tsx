'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface RegistrationSettingsProps {
  settings: {
    available_seats: number;
    registration_close_date: string;
    accepting_applications_for_date: string;
    registration_days_left: number;
  };
  onUpdate: (key: string, value: string) => Promise<void>;
  saving: boolean;
}

export default function RegistrationSettings({
  settings,
  onUpdate,
  saving,
}: RegistrationSettingsProps) {
  const [availableSeats, setAvailableSeats] = useState(settings.available_seats.toString());
  const [registrationCloseDate, setRegistrationCloseDate] = useState(
    settings.registration_close_date
  );
  const [acceptingApplicationsDate, setAcceptingApplicationsDate] = useState(
    settings.accepting_applications_for_date
  );

  const handleSaveSeats = async () => {
    await onUpdate('available_seats', availableSeats);
  };

  const handleSaveCloseDate = async () => {
    await onUpdate('registration_close_date', registrationCloseDate);
  };

  const handleSaveApplicationsDate = async () => {
    await onUpdate('accepting_applications_for_date', acceptingApplicationsDate);
  };

  // Calculate days left
  const calculateDaysLeft = () => {
    const closeDate = new Date(registrationCloseDate);
    const today = new Date();
    const timeDiff = closeDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff > 0 ? daysDiff : 0;
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Registration Settings</h2>

      <div className="space-y-6">
        {/* Available Seats */}
        <div>
          <Label htmlFor="available-seats" className="mb-2">
            Available Seats
          </Label>
          <div className="flex gap-2">
            <Input
              id="available-seats"
              type="number"
              value={availableSeats}
              onChange={(e) => setAvailableSeats(e.target.value)}
              className="flex-1"
              disabled={saving}
            />
            <Button
              onClick={handleSaveSeats}
              variant="secondary"
              disabled={saving || availableSeats === settings.available_seats.toString()}
            >
              Save
            </Button>
          </div>
        </div>

        {/* Registration Close Date */}
        <div>
          <Label htmlFor="registration-close-date" className="mb-2">
            Registration Close Date
          </Label>
          <div className="flex gap-2">
            <Input
              id="registration-close-date"
              type="date"
              value={registrationCloseDate}
              onChange={(e) => setRegistrationCloseDate(e.target.value)}
              className="flex-1"
              disabled={saving}
            />
            <Button
              onClick={handleSaveCloseDate}
              variant="secondary"
              disabled={saving || registrationCloseDate === settings.registration_close_date}
            >
              Save
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Days left until registration closes: {calculateDaysLeft()}
          </p>
        </div>

        {/* Accepting Applications For Date */}
        <div>
          <Label htmlFor="accepting-applications-date" className="mb-2">
            Accepting Applications For Date
          </Label>
          <div className="flex gap-2">
            <Input
              id="accepting-applications-date"
              type="text"
              value={acceptingApplicationsDate}
              onChange={(e) => setAcceptingApplicationsDate(e.target.value)}
              className="flex-1"
              placeholder="e.g., September 2025"
              disabled={saving}
            />
            <Button
              onClick={handleSaveApplicationsDate}
              variant="secondary"
              disabled={
                saving ||
                acceptingApplicationsDate === settings.accepting_applications_for_date
              }
            >
              Save
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            The date to display on the website (e.g. &quot;Currently accepting applications for
            February 2026&quot;)
          </p>
        </div>
      </div>
    </Card>
  );
}
