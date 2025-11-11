
import { Mail } from 'lucide-react';

export const ProcessingState = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy mb-4"></div>
          <h2 className="text-2xl font-bold text-navy">Verifying your email...</h2>
          <p className="text-gray-500 mt-2">Please wait while we complete the verification process.</p>
        </div>
      </div>
    </div>
  );
};
