/**
 * API Route: /api/admin/blog
 * Methods: GET, POST, PUT, DELETE
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export type BlogPost = {
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

// GET - Fetch all blog posts (including unpublished)
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching blog posts:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data as BlogPost[],
    });
  } catch (error: any) {
    console.error('Unexpected error in GET blog posts:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

// POST - Create new blog post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      content,
      category,
      tags,
      published,
      image_key,
      meta_description,
      meta_keywords,
      slug,
      seo_title,
      excerpt,
      featured_image_alt,
      social_image_key,
      reading_time,
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        {
          success: false,
          error: 'Title and content are required',
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .insert({
        title,
        content,
        category: category || null,
        tags: tags && tags.length > 0 ? tags : null,
        published: published ?? true,
        image_key: image_key || null,
        meta_description: meta_description || null,
        meta_keywords: meta_keywords && meta_keywords.length > 0 ? meta_keywords : null,
        slug: slug || null,
        seo_title: seo_title || null,
        excerpt: excerpt || null,
        featured_image_alt: featured_image_alt || null,
        social_image_key: social_image_key || null,
        reading_time: reading_time || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating blog post:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data as BlogPost,
    });
  } catch (error: any) {
    console.error('Unexpected error in POST blog post:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

// PUT - Update blog post
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      title,
      content,
      category,
      tags,
      published,
      image_key,
      meta_description,
      meta_keywords,
      slug,
      seo_title,
      excerpt,
      featured_image_alt,
      social_image_key,
      reading_time,
    } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Blog post ID is required',
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .update({
        title,
        content,
        category: category || null,
        tags: tags && tags.length > 0 ? tags : null,
        published,
        image_key: image_key || null,
        updated_at: new Date().toISOString(),
        meta_description: meta_description || null,
        meta_keywords: meta_keywords && meta_keywords.length > 0 ? meta_keywords : null,
        slug: slug || null,
        seo_title: seo_title || null,
        excerpt: excerpt || null,
        featured_image_alt: featured_image_alt || null,
        social_image_key: social_image_key || null,
        reading_time: reading_time || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating blog post:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data as BlogPost,
    });
  } catch (error: any) {
    console.error('Unexpected error in PUT blog post:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete blog post
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Blog post ID is required',
        },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting blog post:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Blog post deleted successfully',
    });
  } catch (error: any) {
    console.error('Unexpected error in DELETE blog post:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
