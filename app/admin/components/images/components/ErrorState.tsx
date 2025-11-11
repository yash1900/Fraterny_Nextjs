'use client';


import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

const ErrorState = ({ 
  title = "Error loading images", 
  message = "Please try refreshing the page", 
  onRetry 
}: ErrorStateProps) => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-playfair text-navy mb-8">Image Management</h1>
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
        
        {onRetry && (
          <div className="mt-4">
            <button 
              onClick={onRetry}
              className="px-4 py-2 bg-navy text-white rounded-md hover:bg-opacity-90"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorState;

