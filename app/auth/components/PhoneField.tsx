'use client';

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { RegisterFormValues } from '../schemas/registerSchema';
import { sanitizePhoneInput, separatePhoneNumber } from '../utils/phoneUtils';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from 'react';
import { COUNTRY_CODES } from '../utils/countryCodes';

interface PhoneFieldProps {
  form: UseFormReturn<RegisterFormValues>;
}

export const PhoneField = ({ form }: PhoneFieldProps) => {
  const [countryCode, setCountryCode] = useState('+91'); // Default to India
  const [nationalNumber, setNationalNumber] = useState('');

  // When the component mounts or the form value changes externally
  useEffect(() => {
    const currentValue = form.getValues('mobileNumber');
    if (currentValue) {
      const { countryCode: extractedCode, nationalNumber: extractedNumber } = separatePhoneNumber(currentValue);
      setCountryCode(extractedCode);
      setNationalNumber(extractedNumber);
    }
  }, [form]);

  const handleCountryCodeChange = (value: string) => {
    setCountryCode(value);
    // Update the full phone number with new country code
    form.setValue('mobileNumber', value + nationalNumber, { shouldValidate: true });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits in the national number part
    const cleaned = sanitizePhoneInput(e.target.value);
    setNationalNumber(cleaned);
    
    // Update the form with the complete number (country code + national number)
    form.setValue('mobileNumber', countryCode + cleaned, { shouldValidate: true });
  };

  return (
    <FormField
      control={form.control}
      name="mobileNumber"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Mobile Number</FormLabel>
          <FormControl>
            <div className="flex gap-2">
              <Select 
                value={countryCode} 
                onValueChange={handleCountryCodeChange}
              >
                <SelectTrigger className="w-[110px]">
                  <SelectValue placeholder="Code" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRY_CODES.map(country => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.flag} {country.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input 
                className="flex-1"
                placeholder="Mobile number" 
                value={nationalNumber}
                onChange={handleNumberChange}
                inputMode="numeric"
                type="tel" 
              />
            </div>
          </FormControl>
          <FormMessage />
          <p className="text-xs text-gray-500 mt-1">
            Your number will be formatted as: {countryCode} {nationalNumber ? nationalNumber : 'XXXXXXXXXX'}
          </p>
        </FormItem>
      )}
    />
  );
};
