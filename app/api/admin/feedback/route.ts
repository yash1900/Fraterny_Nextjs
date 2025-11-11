/**
 * API Route: /api/admin/feedback
 * Methods: GET
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Database } from '@/integrations/supabase/types';



type FeedbackDetail = Database['public']['Tables']['summary_overall_feedback']['Row'];
type UserData = Database['public']['Tables']['user_data']['Row'];

type SummaryGenerationPartial = Pick<
  Database['public']['Tables']['summary_generation']['Row'],
  | 'testid'
  | 'quest_pdf'
  | 'payment_status'
  | 'paid_generation_time'
  | 'quest_status'
  | 'status'
  | 'qualityscore'
  | 'starting_time'
  | 'completion_time'
>;

type EnrichedFeedback = FeedbackDetail & {
  user_data: UserData | null;
  summary_generation: SummaryGenerationPartial | null;
};

type FeedbackFilters = {
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
  rating?: '1' | '2' | '3' | '4' | '5' | null;
  minRating?: number | null;
  maxRating?: number | null;
  hasTestId?: boolean | null;
};

type PaginationMeta = {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get pagination params
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

    // Get filters
    const filters: FeedbackFilters = {};

    const searchTerm = searchParams.get('searchTerm');
    if (searchTerm) filters.searchTerm = searchTerm;

    const dateFrom = searchParams.get('dateFrom');
    if (dateFrom) filters.dateFrom = dateFrom;

    const dateTo = searchParams.get('dateTo');
    if (dateTo) filters.dateTo = dateTo;

    const rating = searchParams.get('rating');
    if (rating) filters.rating = rating as '1' | '2' | '3' | '4' | '5';

    const minRating = searchParams.get('minRating');
    if (minRating !== null && minRating !== undefined && minRating !== '') {
      filters.minRating = parseInt(minRating, 10);
    }

    const maxRating = searchParams.get('maxRating');
    if (maxRating !== null && maxRating !== undefined && maxRating !== '') {
      filters.maxRating = parseInt(maxRating, 10);
    }

    const hasTestId = searchParams.get('hasTestId');
    if (hasTestId !== null && hasTestId !== undefined && hasTestId !== '') {
      filters.hasTestId = hasTestId === 'true';
    }

    // Calculate pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Build the base query with joins
    let query = supabaseAdmin
      .from('summary_overall_feedback')
      .select(
        `
        *,
        user_data (*),
        summary_generation (
          testid,
          quest_pdf,
          payment_status,
          paid_generation_time,
          quest_status,
          status,
          qualityscore,
          starting_time,
          completion_time
        )
        `,
        { count: 'exact' }
      );

    // Apply search filter (global search across multiple fields)
    if (filters.searchTerm && filters.searchTerm.trim()) {
      const searchTerm = filters.searchTerm.trim();
      query = query.or(
        `user_id.ilike.%${searchTerm}%,testid.ilike.%${searchTerm}%,feedback.ilike.%${searchTerm}%`
      );
    }

    // Apply date range filters
    if (filters.dateFrom) {
      query = query.gte('date_time', filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.lte('date_time', filters.dateTo);
    }

    // Apply rating filter (exact match)
    if (filters.rating) {
      query = query.eq('rating', filters.rating);
    }

    // Apply rating range filters
    if (filters.minRating !== null && filters.minRating !== undefined) {
      query = query.gte('rating', filters.minRating.toString());
    }
    if (filters.maxRating !== null && filters.maxRating !== undefined) {
      query = query.lte('rating', filters.maxRating.toString());
    }

    // Apply test ID presence filter
    if (filters.hasTestId !== null && filters.hasTestId !== undefined) {
      if (filters.hasTestId) {
        query = query.not('testid', 'is', null);
      } else {
        query = query.is('testid', null);
      }
    }

    // Apply pagination and ordering
    query = query
      .range(from, to)
      .order('created_at', { ascending: false });

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching feedback details:', error);
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: error.message,
        },
        { status: 500 }
      );
    }

    // Calculate pagination metadata
    const totalRecords = count || 0;
    const totalPages = Math.ceil(totalRecords / pageSize);

    // Ensure we return exactly the requested page size or less (for last page)
    const feedbacks = data ? data.slice(0, pageSize) : [];

    const paginationMeta: PaginationMeta = {
      currentPage: page,
      pageSize,
      totalRecords,
      totalPages,
    };

    return NextResponse.json({
      success: true,
      data: {
        feedbacks: (feedbacks as EnrichedFeedback[]) || [],
        pagination: paginationMeta,
      },
      error: null,
    });
  } catch (error: any) {
    console.error('Unexpected error in fetchFeedbacks:', error);
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

