import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/integrations/supabase/types';
import { supabaseAdmin } from '@/lib/supabase-admin';

type BlogPost = {
  id: string;
  title: string;
  content: string;
  published: boolean;
  category: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  image_key: string | null;
  meta_description?: string | null;
  meta_keywords?: string[] | null;
  slug?: string | null;
  seo_title?: string | null;
  excerpt?: string | null;
  featured_image_alt?: string | null;
  social_image_key?: string | null;
  reading_time?: number | null;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single();

    if (error) {
      console.error(`❌ Error fetching post with slug ${slug}:`, error);
      return NextResponse.json(
        { error: error.message || 'Post not found' },
        { status: error.code === 'PGRST116' ? 404 : 500 }
      );
    }

    return NextResponse.json(data as BlogPost);
  } catch (error: any) {
    console.error(`❌ Error fetching post:`, error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
