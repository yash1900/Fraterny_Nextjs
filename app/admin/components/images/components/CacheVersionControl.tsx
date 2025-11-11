'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const CacheVersionControl = () => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateCacheVersion = async () => {
    try {
      setIsUpdating(true);
      const response = await fetch('/api/media/cache-version', { method: 'POST' });
      const result = await response.json();
      
      if (!result.success) throw new Error(result.error);
      
      toast.success('Cache version updated successfully');
    } catch (error) {
      console.error('Error updating cache version:', error);
      toast.error('Failed to update cache version');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Cache Version Control</h3>
          <p className="text-sm text-muted-foreground">
            Update the global cache version to force clients to refresh their cached images
          </p>
        </div>
        <Button
          onClick={handleUpdateCacheVersion}
          disabled={isUpdating}
        >
          {isUpdating ? 'Updating...' : 'Update Cache Version'}
        </Button>
      </div>
    </div>
  );
};

