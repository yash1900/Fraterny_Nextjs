/**
 * API Route: /api/validation/affiliate
 * Methods: POST
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';



// Types for affiliate validation
interface AffiliateValidationResult {
  isValid: boolean;
  exists: boolean;
  affiliate?: {
    id: string;
    affiliate_code: string;
    name: string;
    email: string;
    is_active: boolean;
    commission_rate?: number;
    status?: string;
  };
  errors?: string[];
}

interface AffiliateCode {
  id: string;
  affiliate_code: string;
  name: string;
  email: string;
  is_active: boolean;
  commission_rate?: number;
  status?: string;
  created_at: string;
  updated_at: string;
}

// Cache for affiliate validation results
interface AffiliateCache {
  result: AffiliateValidationResult;
  timestamp: number;
}

let affiliateCache: Map<string, AffiliateCache> = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to get cached result
function getCachedResult(code: string): AffiliateValidationResult | null {
  const cached = affiliateCache.get(code.toLowerCase());
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.result;
  }
  if (cached) {
    affiliateCache.delete(code.toLowerCase());
  }
  return null;
}

// Helper function to cache result
function cacheResult(code: string, result: AffiliateValidationResult): void {
  affiliateCache.set(code.toLowerCase(), {
    result,
    timestamp: Date.now()
  });
  
  // Clean up old cache entries (keep only last 100)
  if (affiliateCache.size > 100) {
    const oldestKey = affiliateCache.keys().next().value;
    if (oldestKey) affiliateCache.delete(oldestKey);
  }
}

// Validate affiliate code format
function validateAffiliateCodeFormat(code: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!code) {
    errors.push('Affiliate code is required');
    return { isValid: false, errors };
  }
  
  if (typeof code !== 'string') {
    errors.push('Affiliate code must be a string');
  }
  
  if (code.length < 3) {
    errors.push('Affiliate code must be at least 3 characters long');
  }
  
  if (code.length > 50) {
    errors.push('Affiliate code must be no more than 50 characters long');
  }
  
  // Allow letters, numbers, hyphens, and underscores
  if (!/^[a-zA-Z0-9_-]+$/.test(code)) {
    errors.push('Affiliate code can only contain letters, numbers, hyphens, and underscores');
  }
  
  return { isValid: errors.length === 0, errors };
}

// GET - Validate affiliate code
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const operation = searchParams.get('operation');
    
    // Handle cache status check
    if (operation === 'cache-status') {
      return NextResponse.json({
        success: true,
        cacheSize: affiliateCache.size,
        cacheDuration: CACHE_DURATION
      });
    }
    
    // Handle cache clearing
    if (operation === 'clear-cache') {
      affiliateCache.clear();
      return NextResponse.json({
        success: true,
        message: 'Affiliate validation cache cleared'
      });
    }
    
    // Handle validation
    const code = searchParams.get('code');
    
    if (!code) {
      return NextResponse.json(
        {
          success: false,
          error: 'Affiliate code is required. Use ?code=your_code'
        },
        { status: 400 }
      );
    }
    
    // Check format first
    const formatValidation = validateAffiliateCodeFormat(code);
    if (!formatValidation.isValid) {
      const result: AffiliateValidationResult = {
        isValid: false,
        exists: false,
        errors: formatValidation.errors
      };
      return NextResponse.json({
        success: true,
        data: result
      });
    }
    
    // Check cache first
    const cachedResult = getCachedResult(code);
    if (cachedResult) {
      console.log('📋 Using cached affiliate validation for:', code);
      return NextResponse.json({
        success: true,
        data: cachedResult
      });
    }
    
    // Query database for affiliate
    console.log('🔍 Validating affiliate code:', code);
    const { data, error } = await supabaseAdmin
      .from('influencers')
      .select('*')
      .eq('affiliate_code', code)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Affiliate not found
        const result: AffiliateValidationResult = {
          isValid: false,
          exists: false,
          errors: ['Affiliate code not found']
        };
        
        // Cache the negative result
        cacheResult(code, result);
        
        return NextResponse.json({
          success: true,
          data: result
        });
      }
      
      console.error('❌ Error validating affiliate code:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message
        },
        { status: 500 }
      );
    }
    
    // Affiliate found, check if active
    const affiliate = data as AffiliateCode;
    const isActive = affiliate.is_active === true;
    const isValidStatus = !affiliate.status || affiliate.status === 'active' || affiliate.status === 'approved';
    
    const result: AffiliateValidationResult = {
      isValid: isActive && isValidStatus,
      exists: true,
      affiliate: {
        id: affiliate.id,
        affiliate_code: affiliate.affiliate_code,
        name: affiliate.name,
        email: affiliate.email,
        is_active: affiliate.is_active,
        commission_rate: affiliate.commission_rate,
        status: affiliate.status
      },
      errors: []
    };
    
    if (!isActive) {
      result.errors?.push('Affiliate account is not active');
    }
    
    if (!isValidStatus) {
      result.errors?.push(`Affiliate status is ${affiliate.status}`);
    }
    
    // Cache the result
    cacheResult(code, result);
    
    console.log('✅ Affiliate validation completed:', {
      code,
      isValid: result.isValid,
      exists: result.exists
    });
    
    return NextResponse.json({
      success: true,
      data: result
    });
    
  } catch (error: any) {
    console.error('❌ Error in affiliate validation:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
}

// POST - Batch validate multiple affiliate codes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { codes, operation } = body;
    
    // Handle cache warming
    if (operation === 'warm-cache') {
      if (!Array.isArray(codes) || codes.length === 0) {
        return NextResponse.json(
          { success: false, error: 'codes array is required for cache warming' },
          { status: 400 }
        );
      }
      
      const results = [];
      for (const code of codes) {
        try {
          // Skip if already cached
          if (getCachedResult(code)) {
            results.push({ code, status: 'already_cached' });
            continue;
          }
          
          // Validate format
          const formatValidation = validateAffiliateCodeFormat(code);
          if (!formatValidation.isValid) {
            const result: AffiliateValidationResult = {
              isValid: false,
              exists: false,
              errors: formatValidation.errors
            };
            cacheResult(code, result);
            results.push({ code, status: 'cached', result });
            continue;
          }
          
          // Query database
          const { data, error } = await supabaseAdmin
            .from('influencers')
            .select('*')
            .eq('affiliate_code', code)
            .single();
          
          let result: AffiliateValidationResult;
          
          if (error && error.code === 'PGRST116') {
            result = {
              isValid: false,
              exists: false,
              errors: ['Affiliate code not found']
            };
          } else if (error) {
            results.push({ code, status: 'error', error: error.message });
            continue;
          } else {
            const affiliate = data as AffiliateCode;
            const isActive = affiliate.is_active === true;
            const isValidStatus = !affiliate.status || affiliate.status === 'active' || affiliate.status === 'approved';
            
            result = {
              isValid: isActive && isValidStatus,
              exists: true,
              affiliate: {
                id: affiliate.id,
                affiliate_code: affiliate.affiliate_code,
                name: affiliate.name,
                email: affiliate.email,
                is_active: affiliate.is_active,
                commission_rate: affiliate.commission_rate,
                status: affiliate.status
              },
              errors: []
            };
            
            if (!isActive) result.errors?.push('Affiliate account is not active');
            if (!isValidStatus) result.errors?.push(`Affiliate status is ${affiliate.status}`);
          }
          
          cacheResult(code, result);
          results.push({ code, status: 'cached', result });
          
        } catch (error: any) {
          results.push({ code, status: 'error', error: error.message });
        }
      }
      
      return NextResponse.json({
        success: true,
        message: `Cache warming completed for ${codes.length} codes`,
        results
      });
    }
    
    // Handle batch validation
    if (!Array.isArray(codes) || codes.length === 0) {
      return NextResponse.json(
        { success: false, error: 'codes array is required' },
        { status: 400 }
      );
    }
    
    if (codes.length > 50) {
      return NextResponse.json(
        { success: false, error: 'Maximum 50 codes per batch request' },
        { status: 400 }
      );
    }
    
    const results: { [key: string]: AffiliateValidationResult } = {};
    
    // Check cache first for all codes
    const uncachedCodes = [];
    for (const code of codes) {
      const cached = getCachedResult(code);
      if (cached) {
        results[code] = cached;
      } else {
        uncachedCodes.push(code);
      }
    }
    
    // Query database for uncached codes
    if (uncachedCodes.length > 0) {
      const { data, error } = await supabaseAdmin
        .from('influencers')
        .select('*')
        .in('affiliate_code', uncachedCodes);
      
      if (error) {
        console.error('❌ Error in batch validation:', error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }
      
      // Process found affiliates
      const foundCodes = new Set();
      (data as AffiliateCode[]).forEach(affiliate => {
        foundCodes.add(affiliate.affiliate_code);
        const isActive = affiliate.is_active === true;
        const isValidStatus = !affiliate.status || affiliate.status === 'active' || affiliate.status === 'approved';
        
        const result: AffiliateValidationResult = {
          isValid: isActive && isValidStatus,
          exists: true,
          affiliate: {
            id: affiliate.id,
            affiliate_code: affiliate.affiliate_code,
            name: affiliate.name,
            email: affiliate.email,
            is_active: affiliate.is_active,
            commission_rate: affiliate.commission_rate,
            status: affiliate.status
          },
          errors: []
        };
        
        if (!isActive) result.errors?.push('Affiliate account is not active');
        if (!isValidStatus) result.errors?.push(`Affiliate status is ${affiliate.status}`);
        
        results[affiliate.affiliate_code] = result;
        cacheResult(affiliate.affiliate_code, result);
      });
      
      // Process not found codes
      uncachedCodes.forEach(code => {
        if (!foundCodes.has(code)) {
          const formatValidation = validateAffiliateCodeFormat(code);
          const result: AffiliateValidationResult = {
            isValid: false,
            exists: false,
            errors: formatValidation.isValid ? ['Affiliate code not found'] : formatValidation.errors
          };
          
          results[code] = result;
          cacheResult(code, result);
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      data: results
    });
    
  } catch (error: any) {
    console.error('❌ Error in batch affiliate validation:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
