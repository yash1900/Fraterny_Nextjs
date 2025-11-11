'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console or error reporting service
    console.error('Auth error:', error);
  }, [error]);

  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">
      <div className="flex flex-col items-center text-center space-y-6">
        {/* Error Icon */}
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>

        {/* Error Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Authentication Error
          </h1>
          <p className="text-red-600 text-sm">
            {error.message || 'Something went wrong during authentication'}
          </p>
        </div>

        {/* Error Description */}
        <p className="text-gray-500 text-sm">
          We encountered an issue while processing your request. 
          Please try again or contact support if the problem persists.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button
            onClick={reset}
            className="flex-1 bg-gradient-to-br from-cyan-700 to-blue-900 hover:from-cyan-800 hover:to-blue-950"
          >
            Try Again
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="flex-1"
          >
            Go Home
          </Button>
        </div>

        {/* Error Code (if available) */}
        {error.digest && (
          <p className="text-xs text-gray-400 mt-4">
            Error Code: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}