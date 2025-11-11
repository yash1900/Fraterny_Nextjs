/**
 * API Route: /api/public/blog
 * Methods: GET
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Database } from '@/integrations/supabase/types';



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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const operation = searchParams.get('operation');

    // Handle categories operation
    if (operation === 'categories') {
      const { data, error } = await supabaseAdmin
        .from('blog_posts')
        .select('category')
        .eq('published', true)
        .not('category', 'is', null);

      if (error) {
        console.error('❌ Error fetching blog categories:', error);
        return NextResponse.json(
          { categories: [], error: error.message },
          { status: 500 }
        );
      }

      // Extract unique categories
      const categories = new Set<string>();
      data.forEach(item => {
        if (item.category) categories.add(item.category);
      });

      return NextResponse.json({
        categories: Array.from(categories)
      });
    }

    // Handle tags operation
    if (operation === 'tags') {
      const { data, error } = await supabaseAdmin
        .from('blog_posts')
        .select('tags')
        .eq('published', true)
        .not('tags', 'is', null);

      if (error) {
        console.error('❌ Error fetching blog tags:', error);
        return NextResponse.json(
          { tags: [], error: error.message },
          { status: 500 }
        );
      }

      // Extract unique tags
      const tags = new Set<string>();
      data.forEach(item => {
        if (item.tags) {
          item.tags.forEach((tag: string) => tags.add(tag));
        }
      });

      return NextResponse.json({
        tags: Array.from(tags)
      });
    }

    // Handle single post by slug
    if (operation === 'single') {
      const slug = searchParams.get('slug');
      const id = searchParams.get('id');

      if (!slug && !id) {
        return NextResponse.json(
          { error: 'Either slug or id is required for single post operation' },
          { status: 400 }
        );
      }

      let query = supabaseAdmin
        .from('blog_posts')
        .select('*')
        .eq('published', true);

      if (slug) {
        query = query.eq('slug', slug);
      } else if (id) {
        query = query.eq('id', id);
      }

      const { data, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json(
            { error: 'Blog post not found' },
            { status: 404 }
          );
        }
        console.error('❌ Error fetching single blog post:', error);
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        post: data as BlogPost
      });
    }

    // Default: Handle posts listing with filters
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const searchQuery = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '9', 10);

    // First, get the total count
    let countQuery = supabaseAdmin
      .from('blog_posts')
      .select('id', { count: 'exact' })
      .eq('published', true);

    if (category) {
      countQuery = countQuery.eq('category', category);
    }
    if (tag) {
      countQuery = countQuery.contains('tags', [tag]);
    }
    if (searchQuery) {
      countQuery = countQuery.ilike('title', `%${searchQuery}%`);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('❌ Count query failed:', countError);
      return NextResponse.json(
        { posts: [], total: 0, error: countError.message },
        { status: 500 }
      );
    }

    // Then get the actual data
    let dataQuery = supabaseAdmin.from('blog_posts').select('*').eq('published', true);

    if (category) {
      dataQuery = dataQuery.eq('category', category);
    }
    if (tag) {
      dataQuery = dataQuery.contains('tags', [tag]);
    }
    if (searchQuery) {
      dataQuery = dataQuery.ilike('title', `%${searchQuery}%`);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    dataQuery = dataQuery.range(from, to).order('created_at', { ascending: false });

    const { data, error } = await dataQuery;

    if (error) {
      console.error('❌ Data query failed:', error);
      return NextResponse.json(
        { posts: [], total: 0, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      posts: (data as BlogPost[]) || [],
      total: count || 0,
    });
  } catch (error: any) {
    console.error('❌ Error fetching blog posts:', error);
    return NextResponse.json(
      { posts: [], total: 0, error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

