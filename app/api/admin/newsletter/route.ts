/**
 * API Route: /api/admin/newsletter
 * Methods: GET, DELETE
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export interface NewsletterSubscriber {
  id: string;
  email: string;
  created_at: string;
}

interface NewsletterResponse {
  success: boolean;
  data?: NewsletterSubscriber[];
  error?: string;
}

interface DeleteResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// GET /api/admin/newsletter - Fetch all newsletter subscribers
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching newsletter subscribers...');

    const { data, error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching subscribers:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message
        } as NewsletterResponse,
        { status: 500 }
      );
    }

    console.log(`✅ Found ${data?.length || 0} newsletter subscribers`);

    return NextResponse.json({
      success: true,
      data: data as NewsletterSubscriber[]
    } as NewsletterResponse);

  } catch (error: any) {
    console.error('❌ Error in newsletter GET:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to fetch newsletter subscribers'
      } as NewsletterResponse,
      { status: 500 }
    );
  }
}

// DELETE /api/admin/newsletter - Delete a newsletter subscriber
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Subscriber ID is required'
        } as DeleteResponse,
        { status: 400 }
      );
    }

    console.log('🗑️ Deleting newsletter subscriber:', id);

    const { error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting subscriber:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message
        } as DeleteResponse,
        { status: 500 }
      );
    }

    console.log('✅ Newsletter subscriber deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Subscriber deleted successfully'
    } as DeleteResponse);

  } catch (error: any) {
    console.error('❌ Error in newsletter DELETE:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to delete newsletter subscriber'
      } as DeleteResponse,
      { status: 500 }
    );
  }
}