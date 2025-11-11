/**
 * API Route: /api/influencer/profile
 * Methods: GET
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Database } from '@/integrations/supabase/types';



// Types for validation
interface SocialLinks {
  instagram?: string;
  twitter?: string;
  youtube?: string;
  linkedin?: string;
}

interface UpdateProfileInput {
  name?: string;
  bio?: string;
  profile_image?: string;
  social_links?: SocialLinks;
}

interface UpdateBankDetailsInput {
  bank_name?: string;
  account_number?: string;
  ifsc?: string;
  upi?: string;
}

// Validation functions
function validateSocialLinks(socialLinks: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!socialLinks || typeof socialLinks !== 'object') {
    return { isValid: true, errors }; // Optional field
  }
  
  const urlPattern = /^https?:\/\/.+/;
  
  if (socialLinks.instagram && !urlPattern.test(socialLinks.instagram)) {
    errors.push('Instagram URL must be a valid URL');
  }
  if (socialLinks.twitter && !urlPattern.test(socialLinks.twitter)) {
    errors.push('Twitter URL must be a valid URL');
  }
  if (socialLinks.youtube && !urlPattern.test(socialLinks.youtube)) {
    errors.push('YouTube URL must be a valid URL');
  }
  if (socialLinks.linkedin && !urlPattern.test(socialLinks.linkedin)) {
    errors.push('LinkedIn URL must be a valid URL');
  }
  
  return { isValid: errors.length === 0, errors };
}

function validateBankDetails(bankDetails: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!bankDetails || typeof bankDetails !== 'object') {
    errors.push('Bank details are required');
    return { isValid: false, errors };
  }
  
  if (bankDetails.account_number && !/^\d{9,18}$/.test(bankDetails.account_number)) {
    errors.push('Account number must be 9-18 digits');
  }
  
  if (bankDetails.ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankDetails.ifsc)) {
    errors.push('IFSC code format is invalid');
  }
  
  if (bankDetails.upi && !/^[a-zA-Z0-9.-_@]+@[a-zA-Z0-9.-_]+$/.test(bankDetails.upi)) {
    errors.push('UPI ID format is invalid');
  }
  
  return { isValid: errors.length === 0, errors };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const affiliateCode = searchParams.get('affiliateCode');
    const id = searchParams.get('id');

    // Allow lookup by email, affiliate code, or ID
    if (!email && !affiliateCode && !id) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: 'Email, affiliate code, or ID is required',
        },
        { status: 400 }
      );
    }

    let query = supabaseAdmin
      .from('influencers')
      .select('*')
      .eq('status', 'active'); // Only allow active influencers

    if (email) {
      query = query.eq('email', email);
    } else if (affiliateCode) {
      query = query.eq('affiliate_code', affiliateCode);
    } else if (id) {
      query = query.eq('id', id);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error('Error fetching influencer:', error);
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: error.message,
        },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: 'Influencer not found or inactive',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      error: null,
    });
  } catch (error: any) {
    console.error('Unexpected error in GET influencer profile:', error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: error?.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

// PUT - Update influencer profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, operation, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: 'Influencer ID is required',
        },
        { status: 400 }
      );
    }

    // Handle different update operations
    if (operation === 'update-profile') {
      return await updateProfile(id, updateData);
    } else if (operation === 'update-bank-details') {
      return await updateBankDetails(id, updateData);
    } else if (operation === 'update-location') {
      return await updateLocation(id, updateData.is_india);
    } else {
      // Default profile update
      return await updateProfile(id, updateData);
    }

  } catch (error: any) {
    console.error('Unexpected error in PUT influencer profile:', error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: error?.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

// Helper function to update profile
async function updateProfile(influencerId: string, input: UpdateProfileInput) {
  try {
    // Validate social links if provided
    if (input.social_links) {
      const validation = validateSocialLinks(input.social_links);
      if (!validation.isValid) {
        return NextResponse.json(
          {
            success: false,
            data: null,
            error: `Validation failed: ${validation.errors.join(', ')}`,
          },
          { status: 400 }
        );
      }
    }

    // Validate name if provided
    if (input.name && (input.name.length < 2 || input.name.length > 100)) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: 'Name must be between 2 and 100 characters',
        },
        { status: 400 }
      );
    }

    // Validate bio if provided
    if (input.bio && input.bio.length > 500) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: 'Bio must be less than 500 characters',
        },
        { status: 400 }
      );
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (input.name !== undefined) updateData.name = input.name;
    if (input.bio !== undefined) updateData.bio = input.bio;
    if (input.profile_image !== undefined) updateData.profile_image = input.profile_image;
    if (input.social_links !== undefined) updateData.social_links = input.social_links;

    const { data, error } = await supabaseAdmin
      .from('influencers')
      .update(updateData)
      .eq('id', influencerId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      error: null,
    });

  } catch (error: any) {
    console.error('Error in updateProfile:', error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: error?.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

// Helper function to update bank details
async function updateBankDetails(influencerId: string, input: UpdateBankDetailsInput) {
  try {
    const validation = validateBankDetails(input);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: `Validation failed: ${validation.errors.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const paymentInfo: any = {};
    
    if (input.bank_name) paymentInfo.bank_name = input.bank_name;
    if (input.account_number) paymentInfo.account_number = input.account_number;
    if (input.ifsc) paymentInfo.ifsc = input.ifsc.toUpperCase();
    if (input.upi) paymentInfo.upi = input.upi.toLowerCase();

    const { data, error } = await supabaseAdmin
      .from('influencers')
      .update({
        payment_info: paymentInfo,
        updated_at: new Date().toISOString(),
      })
      .eq('id', influencerId)
      .select()
      .single();

    if (error) {
      console.error('Error updating bank details:', error);
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      error: null,
    });

  } catch (error: any) {
    console.error('Error in updateBankDetails:', error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: error?.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

// Helper function to update location
async function updateLocation(influencerId: string, isIndia: boolean) {
  try {
    if (typeof isIndia !== 'boolean') {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: 'is_india must be a boolean value',
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('influencers')
      .update({
        is_india: isIndia,
        updated_at: new Date().toISOString(),
      })
      .eq('id', influencerId)
      .select()
      .single();

    if (error) {
      console.error('Error updating influencer location:', error);
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      error: null,
    });

  } catch (error: any) {
    console.error('Error in updateLocation:', error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: error?.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

