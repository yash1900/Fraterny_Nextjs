/**
 * API Route: /api/media
 * Methods: GET
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const searchTerm = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';

    // Calculate pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Build query
    let query = supabaseAdmin
      .from('website_images')
      .select('*', { count: 'exact' });

    // Apply category filter
    if (category) {
      query = query.eq('category', category);
    }

    // Apply search filter
    if (searchTerm) {
      query = query.or(`key.ilike.%${searchTerm}%,alt_text.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching images:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        images: data || [],
        total: count || 0,
        page,
        pageSize,
      },
    });
  } catch (error: any) {
    console.error('Error in media API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

