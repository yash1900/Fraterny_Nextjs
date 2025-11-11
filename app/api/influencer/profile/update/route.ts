/**
 * API Route: /api/influencer/profile/update
 * Methods: POST
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Database } from '@/integrations/supabase/types';



export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { influencer_id, name, bio, profile_image, social_links } = body;

    if (!influencer_id) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: 'Influencer ID is required',
        },
        { status: 400 }
      );
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (profile_image !== undefined) updateData.profile_image = profile_image;
    if (social_links !== undefined) updateData.social_links = social_links;

    const { data, error } = await supabaseAdmin
      .from('influencers')
      .update(updateData)
      .eq('id', influencer_id)
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
    console.error('Unexpected error in updateInfluencerProfile:', error);
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

