'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../cotexts/AuthContext';
import { registerSchema, RegisterFormValues } from '../schemas/registerSchema';
import { formatPhoneNumber } from '../utils/phoneUtils';

interface UseRegisterFormProps {
  onRegistrationSuccess: (email: string, needsEmailVerification: boolean, error?: boolean) => void;
}

export const useRegisterForm = ({ onRegistrationSuccess }: UseRegisterFormProps) => {
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      mobileNumber: "+91", // Default with India country code
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      // The phone is already properly formatted by our PhoneField component
      // This ensures it's clean of any remaining spaces or special characters
      const mobileNumber = formatPhoneNumber(data.mobileNumber);
      console.log('Submitting with properly formatted phone number:', mobileNumber);
      
      const result = await signUp(
        data.email, 
        data.password, 
        data.firstName, 
        data.lastName, 
        mobileNumber
      );
      
      if (result.success) {
        if (result.emailConfirmationSent) {
          // User registered but needs email confirmation
          onRegistrationSuccess(data.email, true, false);
        } else {
          // User was auto-confirmed (email confirmation disabled in Supabase)
          onRegistrationSuccess(data.email, false, false);
        }
        form.reset();
      } else if (result.error === 'User already registered') {
        // User already exists
        onRegistrationSuccess(data.email, false, false);
      } else {
        // If we received an error related to sending the verification email
        if (result.error?.includes('send') || result.error?.includes('email') || result.error?.includes('SMTP')) {
          onRegistrationSuccess(data.email, true, true);
          form.reset();
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return {
    form,
    isLoading,
    showPassword,
    showConfirmPassword,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    onSubmit: form.handleSubmit(onSubmit),
  };
};
