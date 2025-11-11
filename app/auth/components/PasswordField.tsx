'use client';

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { RegisterFormValues } from '../schemas/registerSchema';

interface PasswordFieldProps {
  form: UseFormReturn<RegisterFormValues>;
  showPassword: boolean;
  toggleVisibility: () => void;
  fieldName: "password" | "confirmPassword";
  label: string;
  placeholder: string;
}

export const PasswordField = ({ 
  form, 
  showPassword, 
  toggleVisibility,
  fieldName,
  label,
  placeholder
}: PasswordFieldProps) => {
  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <Input 
                type={showPassword ? "text" : "password"} 
                placeholder={placeholder} 
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
