import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/integrations/supabase/types';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from('website_images')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching image with ID ${id}:`, error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Image not found',
        },
        { status: error.code === 'PGRST116' ? 404 : 500 }
      );
    }

    // Get public URL for the storage path
    let publicUrl = null;
    if (data.storage_path) {
      const { data: urlData } = supabaseAdmin.storage
        .from('website-images')
        .getPublicUrl(data.storage_path);

      publicUrl = urlData.publicUrl;
    }

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        publicUrl,
      },
    });
  } catch (error: any) {
    console.error(`Error fetching image:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await request.json();

    const { data, error } = await supabaseAdmin
      .from('website_images')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating image with ID ${id}:`, error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Failed to update image',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error(`Error updating image:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
