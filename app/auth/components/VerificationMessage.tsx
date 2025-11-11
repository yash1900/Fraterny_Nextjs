
import { useState } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Mail, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAuth } from '../cotexts/AuthContext';

interface VerificationMessageProps {
  email: string;
  hasError: boolean;
  onBackToSignIn: () => void;
}

export const VerificationMessage = ({ email, hasError, onBackToSignIn }: VerificationMessageProps) => {
  const { resendVerificationEmail } = useAuth();
  const [isResendingEmail, setIsResendingEmail] = useState(false);

  const handleResendVerificationEmail = async () => {
    setIsResendingEmail(true);
    try {
      const result = await resendVerificationEmail(email);
      // No need to update hasError here as it should be managed by the parent component
    } catch (error) {
      console.error('Failed to resend verification email:', error);
    } finally {
      setIsResendingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      {hasError ? (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-700">Email Delivery Issue</AlertTitle>
          <AlertDescription className="text-amber-600">
            Your account was created, but there was a problem sending the verification email to <strong>{email}</strong>.
            You can try to resend the email or contact support if the problem persists.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="bg-green-50 border-green-200">
          <Mail className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-700">Verification Email Sent!</AlertTitle>
          <AlertDescription className="text-green-600">
            We've sent a confirmation link to <strong>{email}</strong>.
            Please check your inbox and spam folder, then click the verification link to complete your registration.
          </AlertDescription>
        </Alert>
      )}
      <div className="flex flex-col items-center space-y-4 py-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
          <Mail className="h-6 w-6 text-navy" />
        </div>
        <p className="text-center text-sm text-gray-500">
          Waiting for email verification... Once you verify your email, you'll be able to sign in.
        </p>
      </div>
      <div className="space-y-3">
        <Button 
          type="button" 
          onClick={handleResendVerificationEmail}
          disabled={isResendingEmail}
          className="w-full bg-terracotta hover:bg-terracotta/90"
        >
          {isResendingEmail ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Resending...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Resend Verification Email
            </>
          )}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onBackToSignIn}
          className="w-full"
        >
          Back to Sign In
        </Button>
      </div>
    </div>
  );
};
