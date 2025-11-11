// error.tsx
'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Quest Result Error:', error);
  }, [error]);

  return (
    <div className="h-screen bg-whiteflex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-gilroy-bold text-gray-900 mb-2">
          Something went wrong
        </h2>

        <p className="text-gray-600 font-gilroy-regular mb-6">
          We couldn't load your results. This might be a temporary issue.
        </p>

        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-gilroy-semibold hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>

          <button
            onClick={() => window.location.href = '/quest'}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-gilroy-semibold hover:bg-gray-200 transition-colors"
          >
            Back to Quest
          </button>
        </div>

        {error.digest && (
          <p className="text-xs text-gray-400 mt-4 font-gilroy-regular">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}