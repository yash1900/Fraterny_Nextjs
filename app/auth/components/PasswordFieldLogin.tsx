'use client';

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { LoginFormValues } from '../schemas/loginSchema';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordFieldLoginProps {
  form: UseFormReturn<LoginFormValues>;
  showPassword: boolean;
  toggleVisibility: () => void;
}

export const PasswordFieldLogin = ({ 
  form, 
  showPassword, 
  toggleVisibility 
}: PasswordFieldLoginProps) => {
  return (
    <FormField
      control={form.control}
      name="password"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Password</FormLabel>
          <FormControl>
            <div className="relative">
              <Input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                {...field} 
              />
              <button 
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={toggleVisibility}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
