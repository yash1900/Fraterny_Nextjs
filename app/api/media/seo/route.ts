/**
 * API Route: /api/media/seo
 * Methods: PUT
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { success: false, error: 'Key parameter is required' },
        { status: 400 }
      );
    }

    // Fetch the complete image data
    const { data, error } = await supabaseAdmin
      .from('website_images')
      .select('*')
      .eq('key', key)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching image SEO data for key ${key}:`, error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      );
    }

    // Extract SEO data from metadata
    const metadata = data.metadata as any;
    const seo = metadata?.seo || {};

    const seoData = {
      id: data.id,
      key: data.key,
      alt_text: data.alt_text,
      description: data.description,
      width: data.width,
      height: data.height,
      seo: {
        title: seo.title || null,
        caption: seo.caption || null,
        focusKeywords: seo.focusKeywords || [],
        copyright: seo.copyright || null,
        location: seo.location || null,
        ogTitle: seo.ogTitle || null,
        ogDescription: seo.ogDescription || null,
        schemaType: seo.schemaType || 'ImageObject',
      },
    };

    return NextResponse.json({
      success: true,
      data: seoData,
    });
  } catch (error: any) {
    console.error('Error in media SEO API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

