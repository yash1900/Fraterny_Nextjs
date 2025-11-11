/**
 * API Route: /api/media/by-key
 * Methods: GET
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const size = searchParams.get('size'); // optional: 'small', 'medium', 'large'

    if (!key) {
      return NextResponse.json(
        { success: false, error: 'Key parameter is required' },
        { status: 400 }
      );
    }

    // Fetch the image record
    const { data, error } = await supabaseAdmin
      .from('website_images')
      .select('storage_path, metadata, sizes')
      .eq('key', key)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching image with key ${key}:`, error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (!data || !data.storage_path) {
      // Try fallback logic for mobile/desktop variants
      let fallbackKey: string | null = null;
      
      if (key.endsWith('-mobile')) {
        fallbackKey = key.replace('-mobile', '');
      } else if (!key.endsWith('-mobile')) {
        fallbackKey = `${key}-mobile`;
      }

      if (fallbackKey) {
        const { data: fallbackData, error: fallbackError } = await supabaseAdmin
          .from('website_images')
          .select('storage_path, metadata, sizes')
          .eq('key', fallbackKey)
          .maybeSingle();

        if (!fallbackError && fallbackData?.storage_path) {
          const storagePath = size && fallbackData.sizes?.[size] 
            ? fallbackData.sizes[size] 
            : fallbackData.storage_path;

          const { data: urlData } = supabaseAdmin.storage
            .from('website-images')
            .getPublicUrl(storagePath);

          return NextResponse.json({
            success: true,
            data: {
              url: urlData.publicUrl,
              metadata: fallbackData.metadata,
            },
          });
        }
      }

      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      );
    }

    // Determine storage path based on size
    let storagePath = data.storage_path;
    if (size && data.sizes && typeof data.sizes === 'object') {
      const sizes = data.sizes as Record<string, string>;
      storagePath = sizes[size] || data.storage_path;
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('website-images')
      .getPublicUrl(storagePath);

    if (!urlData || !urlData.publicUrl) {
      return NextResponse.json(
        { success: false, error: 'Failed to get public URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        url: urlData.publicUrl,
        metadata: data.metadata,
      },
    });
  } catch (error: any) {
    console.error('Error in media by-key API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

