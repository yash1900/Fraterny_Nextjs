/**
 * API Route: /api/settings
 * Methods: GET
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Database } from '@/integrations/supabase/types';



// Cache for website settings
interface SettingsCache {
  settings: WebsiteSettings | null;
  timestamp: number;
}

let settingsCache: SettingsCache | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Helper functions for caching
const getSettingsFromCache = (): WebsiteSettings | null => {
  if (settingsCache && Date.now() - settingsCache.timestamp < CACHE_DURATION) {
    console.log('Using cached website settings');
    return settingsCache.settings;
  }
  return null;
};

const updateSettingsCache = (settings: WebsiteSettings): void => {
  settingsCache = {
    settings,
    timestamp: Date.now()
  };
};

const invalidateSettingsCache = (): void => {
  settingsCache = null;
  console.log('Website settings cache invalidated');
};

// Date utility functions
const calculateDaysLeft = (dateString: string, timezone: string = 'Asia/Kolkata'): number => {
  try {
    const targetDate = new Date(dateString);
    const now = new Date();
    
    // Set target date to end of day in the specified timezone
    const target = new Date(targetDate);
    target.setHours(23, 59, 59, 999);
    
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  } catch (error) {
    console.error('Error calculating days left:', error);
    return 0;
  }
};

const formatRegistrationCloseDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long' 
    };
    return date.toLocaleDateString('en-US', options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'March 2025'; // Fallback
  }
};

// Input validation functions
const validateSettingValue = (key: string, value: string): { isValid: boolean; error?: string } => {
  switch (key) {
    case 'registration_days_left':
    case 'available_seats':
      const numValue = parseInt(value);
      if (isNaN(numValue) || numValue < 0) {
        return { isValid: false, error: `${key} must be a non-negative number` };
      }
      break;
    case 'registration_close_date':
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return { isValid: false, error: 'registration_close_date must be a valid date' };
      }
      break;
    case 'upcoming_editions':
      try {
        const editions = JSON.parse(value);
        if (!Array.isArray(editions)) {
          return { isValid: false, error: 'upcoming_editions must be an array' };
        }
      } catch {
        return { isValid: false, error: 'upcoming_editions must be valid JSON' };
      }
      break;
  }
  return { isValid: true };
};

type VillaEdition = {
  id: string;
  startDate: string;
  endDate: string;
  timeFrame?: string | null;
  isActive: boolean;
  allocationStatus: 'available' | 'limited' | 'sold_out';
  allotedSeats: number;
  totalSeats: number;
  displayOrder: number;
  createdAt?: string;
};

type WebsiteSettings = {
  registration_days_left: number;
  available_seats: number;
  registration_close_date: string;
  accepting_applications_for_date: string;
  insider_access_price: string;
  insider_access_original_price: string;
  main_experience_price: string;
  main_experience_original_price: string;
  executive_escape_price: string;
  executive_escape_original_price: string;
  applications_received?: string;
  upcoming_editions: VillaEdition[];
};

const DEFAULT_SETTINGS: WebsiteSettings = {
  registration_days_left: 30,
  available_seats: 20,
  registration_close_date: '2025-03-30',
  accepting_applications_for_date: 'February 2026',
  insider_access_price: '₹499/month',
  insider_access_original_price: '₹699/month',
  main_experience_price: '₹45,000 - ₹60,000',
  main_experience_original_price: '₹65,000 - ₹80,000',
  executive_escape_price: '₹1,50,000+',
  executive_escape_original_price: '₹1,85,000+',
  applications_received: '42',
  upcoming_editions: [
    {
      id: 'edition-1',
      startDate: '2025-09-14',
      endDate: '2025-09-20',
      timeFrame: null,
      isActive: true,
      allocationStatus: 'available',
      allotedSeats: 0,
      totalSeats: 20,
      displayOrder: 1,
      createdAt: new Date().toISOString(),
    },
  ],
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const operation = searchParams.get('operation');
    
    // Handle special operations
    if (operation === 'calculate-days') {
      const dateStr = searchParams.get('date');
      if (!dateStr) {
        return NextResponse.json(
          { success: false, error: 'Date parameter is required' },
          { status: 400 }
        );
      }
      const daysLeft = calculateDaysLeft(dateStr);
      return NextResponse.json({ success: true, data: { daysLeft } });
    }
    
    if (operation === 'format-date') {
      const dateStr = searchParams.get('date');
      if (!dateStr) {
        return NextResponse.json(
          { success: false, error: 'Date parameter is required' },
          { status: 400 }
        );
      }
      const formatted = formatRegistrationCloseDate(dateStr);
      return NextResponse.json({ success: true, data: { formatted } });
    }

    // Check if we have valid cached settings
    const cachedSettings = getSettingsFromCache();
    if (cachedSettings) {
      return NextResponse.json(cachedSettings);
    }

    const { data, error } = await supabaseAdmin.from('website_settings').select('key, value');

    if (error) {
      console.error('Error fetching website settings:', error);
      // Update cache with default settings
      updateSettingsCache(DEFAULT_SETTINGS);
      return NextResponse.json(DEFAULT_SETTINGS);
    }

    // Convert the array of key-value pairs into an object
    if (data && data.length > 0) {
      const settings = data.reduce((acc: Record<string, string>, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {});

      const parsedSettings: WebsiteSettings = {
        registration_days_left: parseInt(
          settings.registration_days_left || DEFAULT_SETTINGS.registration_days_left.toString()
        ),
        available_seats: parseInt(settings.available_seats || DEFAULT_SETTINGS.available_seats.toString()),
        registration_close_date: settings.registration_close_date || DEFAULT_SETTINGS.registration_close_date,
        accepting_applications_for_date:
          settings.accepting_applications_for_date || DEFAULT_SETTINGS.accepting_applications_for_date,
        insider_access_price: settings.insider_access_price || DEFAULT_SETTINGS.insider_access_price,
        insider_access_original_price:
          settings.insider_access_original_price || DEFAULT_SETTINGS.insider_access_original_price,
        main_experience_price: settings.main_experience_price || DEFAULT_SETTINGS.main_experience_price,
        main_experience_original_price:
          settings.main_experience_original_price || DEFAULT_SETTINGS.main_experience_original_price,
        executive_escape_price: settings.executive_escape_price || DEFAULT_SETTINGS.executive_escape_price,
        executive_escape_original_price:
          settings.executive_escape_original_price || DEFAULT_SETTINGS.executive_escape_original_price,
        applications_received: settings.applications_received || DEFAULT_SETTINGS.applications_received,
        upcoming_editions: settings.upcoming_editions
          ? JSON.parse(settings.upcoming_editions)
          : DEFAULT_SETTINGS.upcoming_editions,
      };

      // Update cache
      updateSettingsCache(parsedSettings);
      return NextResponse.json(parsedSettings);
    }

    // Update cache with default settings
    updateSettingsCache(DEFAULT_SETTINGS);
    return NextResponse.json(DEFAULT_SETTINGS);
  } catch (error) {
    console.error('Failed to fetch website settings:', error);
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}

// PUT - Update website settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value, settings: bulkSettings } = body;
    
    // Handle bulk settings update
    if (bulkSettings) {
      const results = [];
      let hasErrors = false;
      
      for (const [settingKey, settingValue] of Object.entries(bulkSettings)) {
        // Validate setting value
        const validation = validateSettingValue(settingKey, settingValue as string);
        if (!validation.isValid) {
          results.push({ key: settingKey, success: false, error: validation.error });
          hasErrors = true;
          continue;
        }
        
        // Update individual setting
        const success = await updateSingleSetting(settingKey, settingValue as string);
        results.push({ key: settingKey, success, error: success ? undefined : 'Database error' });
        if (!success) hasErrors = true;
      }
      
      if (!hasErrors) {
        invalidateSettingsCache();
      }
      
      return NextResponse.json({
        success: !hasErrors,
        results,
        message: hasErrors ? 'Some settings failed to update' : 'All settings updated successfully'
      });
    }
    
    // Handle single setting update
    if (!key || value === undefined) {
      return NextResponse.json(
        { success: false, error: 'key and value are required' },
        { status: 400 }
      );
    }
    
    // Validate setting value
    const validation = validateSettingValue(key, value);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }
    
    const success = await updateSingleSetting(key, value);
    
    if (success) {
      invalidateSettingsCache();
      return NextResponse.json({ success: true, message: `Setting '${key}' updated successfully` });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to update setting' },
        { status: 500 }
      );
    }
    
  } catch (error: any) {
    console.error('Error updating website settings:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// PATCH - Special operations (auto-update days left, etc.)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation } = body;
    
    if (operation === 'update-days-left') {
      // Get current settings to find registration close date
      const currentSettings = getSettingsFromCache() || await fetchSettingsFromDB();
      
      // Calculate new days left
      const daysLeft = calculateDaysLeft(currentSettings.registration_close_date);
      
      // Update the setting
      const success = await updateSingleSetting('registration_days_left', daysLeft.toString());
      
      if (success) {
        invalidateSettingsCache();
        return NextResponse.json({
          success: true,
          data: { daysLeft },
          message: 'Days left updated successfully'
        });
      } else {
        return NextResponse.json(
          { success: false, error: 'Failed to update days left' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid operation' },
      { status: 400 }
    );
    
  } catch (error: any) {
    console.error('Error in PATCH operation:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// Helper function to update a single setting
async function updateSingleSetting(key: string, value: string): Promise<boolean> {
  try {
    // Check if the setting exists
    const { data: existingData, error: checkError } = await supabaseAdmin
      .from('website_settings')
      .select('id')
      .eq('key', key)
      .maybeSingle();
    
    if (checkError) {
      console.error(`Error checking if setting "${key}" exists:`, checkError);
      return false;
    }
    
    if (existingData) {
      // Update existing setting
      const { error: updateError } = await supabaseAdmin
        .from('website_settings')
        .update({ 
          value, 
          updated_at: new Date().toISOString() 
        })
        .eq('key', key);
      
      if (updateError) {
        console.error(`Error updating setting "${key}":`, updateError);
        return false;
      }
    } else {
      // Insert new setting
      const { error: insertError } = await supabaseAdmin
        .from('website_settings')
        .insert({
          key,
          value
        });
      
      if (insertError) {
        console.error(`Error creating setting "${key}":`, insertError);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Unexpected error in updateSingleSetting for key "${key}":`, error);
    return false;
  }
}

// Helper function to fetch settings from database
async function fetchSettingsFromDB(): Promise<WebsiteSettings> {
  const { data, error } = await supabaseAdmin.from('website_settings').select('key, value');
  
  if (error || !data) {
    return DEFAULT_SETTINGS;
  }
  
  const settings = data.reduce((acc: Record<string, string>, item) => {
    acc[item.key] = item.value;
    return acc;
  }, {});
  
  return {
    registration_days_left: parseInt(
      settings.registration_days_left || DEFAULT_SETTINGS.registration_days_left.toString()
    ),
    available_seats: parseInt(settings.available_seats || DEFAULT_SETTINGS.available_seats.toString()),
    registration_close_date: settings.registration_close_date || DEFAULT_SETTINGS.registration_close_date,
    accepting_applications_for_date:
      settings.accepting_applications_for_date || DEFAULT_SETTINGS.accepting_applications_for_date,
    insider_access_price: settings.insider_access_price || DEFAULT_SETTINGS.insider_access_price,
    insider_access_original_price:
      settings.insider_access_original_price || DEFAULT_SETTINGS.insider_access_original_price,
    main_experience_price: settings.main_experience_price || DEFAULT_SETTINGS.main_experience_price,
    main_experience_original_price:
      settings.main_experience_original_price || DEFAULT_SETTINGS.main_experience_original_price,
    executive_escape_price: settings.executive_escape_price || DEFAULT_SETTINGS.executive_escape_price,
    executive_escape_original_price:
      settings.executive_escape_original_price || DEFAULT_SETTINGS.executive_escape_original_price,
    applications_received: settings.applications_received || DEFAULT_SETTINGS.applications_received,
    upcoming_editions: settings.upcoming_editions
      ? JSON.parse(settings.upcoming_editions)
      : DEFAULT_SETTINGS.upcoming_editions,
  };
}

