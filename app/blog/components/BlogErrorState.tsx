import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface BlogErrorStateProps {
  message?: string;
  onRetry?: () => void;
  error?: unknown;
}

const BlogErrorState: React.FC<BlogErrorStateProps> = ({
  message = "Failed to load blog posts",
  onRetry,
  error
}) => {
  // Try to extract a more specific error message if possible
  let errorDetails = "";
  if (error) {
    if (typeof error === 'object' && error !== null) {
      // @ts-ignore - We don't know the exact shape of the error
      if (error.message) errorDetails = error.message;
      // @ts-ignore - Handle Supabase errors
      else if (error.error) errorDetails = error.error;
    } else if (typeof error === 'string') {
      errorDetails = error;
    }
  }

  return (
    <div className="py-10">
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {message}
          {errorDetails && (
            <div className="mt-2 text-sm opacity-80">
              {errorDetails}
            </div>
          )}
        </AlertDescription>
      </Alert>
      
      {onRetry && (
        <div className="text-center">
          <Button
            onClick={onRetry}
            className="bg-navy hover:bg-navy/90"
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};

export default BlogErrorState;
