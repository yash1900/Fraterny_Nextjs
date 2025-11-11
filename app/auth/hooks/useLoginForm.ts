'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '../cotexts/AuthContext';
import { loginSchema, LoginFormValues } from '../schemas/loginSchema';

export const useLoginForm = (redirectTo?: string) => {
  const { signIn } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const togglePasswordVisibility = () => setShowPassword(!showPassword);


  const onSubmit = async (data: LoginFormValues) => {
  setIsLoading(true);
  try {
    await signIn(data.email, data.password);
    router.push(redirectTo || '/');
  } catch (error) {
    console.error(error);
  } finally {
    setIsLoading(false);
  }
};

  return {
    form,
    isLoading,
    showPassword,
    togglePasswordVisibility,
    onSubmit: form.handleSubmit(onSubmit),
  };
};
