/**
 * API Route: /api/admin/summaries
 * Methods: GET
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Database } from '@/integrations/supabase/types';

// TypeScript Interfaces

// Use existing Supabase types
type SummaryGeneration = Database['public']['Tables']['summary_generation']['Row'] & {
  user_data?: {
    user_name: string | null;
    email: string | null;
    mobile_number: string | null;
    city: string | null;
    gender: string | null;
    dob: string | null;
  } | null;
};

// Filter options for summaries
interface SummaryFilters {
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
  paymentStatus?: 'completed' | 'pending' | 'failed' | 'success' | 'Start' | 'ERROR' | null;
  questStatus?: string;
  status?: string;
  hasQuestPdf?: boolean | null;
  minQualityScore?: number | null;
  maxQualityScore?: number | null;
}

// Pagination parameters
interface PaginationParams {
  page: number;
  pageSize: number;
}

// Pagination metadata
interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

// Statistics for dashboard cards
interface SummaryStats {
  totalSummaries: number;
  paidSummaries: number;
  completedSummaries: number;
  averageQualityScore: number;
  failedPayments: number;
}

// API Response structure for fetching summaries
interface SummariesResponse {
  success: boolean;
  data: {
    summaries: SummaryGeneration[];
    pagination: PaginationMeta;
    filteredStats?: SummaryStats; // Optional filtered statistics
  } | null;
  error: string | null;
}

// API Response structure for delete operation
interface DeleteSummaryResponse {
  success: boolean;
  message: string | null;
  error: string | null;
}

// Helper Functions

/**
 * Get summary statistics for dashboard cards
 */
async function getSummaryStats(): Promise<SummaryStats> {
  try {
    // Fetch all summaries to calculate statistics
    const { data, error } = await supabaseAdmin
      .from('summary_generation')
      .select('payment_status, status, qualityscore');

    if (error) {
      console.error('Error fetching summary stats:', error);
      return {
        totalSummaries: 0,
        paidSummaries: 0,
        completedSummaries: 0,
        averageQualityScore: 0,
        failedPayments: 0,
      };
    }

    const totalSummaries = data?.length || 0;
    // Check for actual payment status values in your database
    const paidSummaries = data?.filter(s => 
      s.payment_status === 'success' || 
      s.payment_status === 'completed'
    ).length || 0;
    // Check for failed/error payment status
    const failedPayments = data?.filter(s => 
      s.payment_status && (
        s.payment_status.toLowerCase().includes('failed') ||
        s.payment_status.toLowerCase().includes('error')
      )
    ).length || 0;
    // Check for actual status values in your database  
    const completedSummaries = data?.filter(s => 
      s.status === 'Complete' || 
      s.status === 'completed'
    ).length || 0;
    
    // Calculate average quality score
    const qualityScores = data
      ?.map(s => parseFloat(s.qualityscore || '0'))
      .filter(score => !isNaN(score) && score > 0) || [];
    
    const averageQualityScore = qualityScores.length > 0
      ? Math.round(qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length)
      : 0;

    return {
      totalSummaries,
      paidSummaries,
      completedSummaries,
      averageQualityScore,
      failedPayments,
    };
  } catch (error) {
    console.error('Unexpected error in getSummaryStats:', error);
    return {
      totalSummaries: 0,
      paidSummaries: 0,
      completedSummaries: 0,
      averageQualityScore: 0,
      failedPayments: 0,
    };
  }
}

/**
 * Delete a summary by ID
 */
async function deleteSummary(summaryId: number): Promise<DeleteSummaryResponse> {
  try {
    console.log('🗑️ Starting cascade delete for summary:', summaryId);
    
    // First, get the testid to delete related records
    const { data: summaryData, error: fetchError } = await supabaseAdmin
      .from('summary_generation')
      .select('testid')
      .eq('id', summaryId)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching summary:', fetchError);
      return {
        success: false,
        message: null,
        error: `Failed to fetch summary: ${fetchError.message}`,
      };
    }

    // Step 1: Delete related records in summary_question_answer table
    if (summaryData?.testid) {
      console.log('📝 Deleting related question answers for testid:', summaryData.testid);
      const { error: questionError } = await supabaseAdmin
        .from('summary_question_answer')
        .delete()
        .eq('testid', summaryData.testid);

      if (questionError) {
        console.error('❌ Error deleting question answers:', questionError);
        return {
          success: false,
          message: null,
          error: `Failed to delete related question answers: ${questionError.message}`,
        };
      }
      console.log('✅ Deleted related question answers');
    }

    // Step 2: Delete the summary
    console.log('📊 Deleting summary record...');
    const { error } = await supabaseAdmin
      .from('summary_generation')
      .delete()
      .eq('id', summaryId);

    if (error) {
      console.error('❌ Error deleting summary:', error);
      return {
        success: false,
        message: null,
        error: `Failed to delete summary: ${error.message}`,
      };
    }

    console.log('✅ Summary deleted successfully!');
    return {
      success: true,
      message: 'Summary and all related records deleted successfully',
      error: null,
    };
  } catch (error: any) {
    console.error('Unexpected error in deleteSummary:', error);
    return {
      success: false,
      message: null,
      error: error?.message || 'An unexpected error occurred',
    };
  }
}

/**
 * Get single summary by ID with user data
 */
async function getSingleSummary(summaryId: number): Promise<{
  success: boolean;
  data?: SummaryGeneration | null;
  error?: string;
}> {
  try {
    const { data, error } = await supabaseAdmin
      .from('summary_generation')
      .select(`
        *,
        user_data (
          user_name,
          email,
          mobile_number,
          city,
          gender,
          dob
        )
      `)
      .eq('id', summaryId)
      .single();
      
    if (error) {
      return {
        success: false,
        error: error.message
      };
    }
    
    return {
      success: true,
      data: data as SummaryGeneration
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'An unexpected error occurred'
    };
  }
}

/**
 * Handle special operations (stats, single)
 */
async function getSpecialOperationData(operation: string, params?: { id?: string }): Promise<any> {
  try {
    switch (operation) {
      case 'stats':
        const stats = await getSummaryStats();
        return {
          success: true,
          data: stats
        };
      
      case 'single':
        if (!params?.id) {
          return {
            success: false,
            error: 'Summary ID is required for single operation'
          };
        }
        const summaryId = parseInt(params.id);
        if (isNaN(summaryId)) {
          return {
            success: false,
            error: 'Invalid summary ID'
          };
        }
        const result = await getSingleSummary(summaryId);
        return result;
      
      default:
        return {
          success: false,
          error: 'Invalid operation'
        };
    }
  } catch (error: any) {
    console.error('Unexpected error in getSpecialOperationData:', error);
    return {
      success: false,
      error: error?.message || 'An unexpected error occurred'
    };
  }
}

/**
 * Handle POST operations (bulk-delete)
 */
async function handlePostOperation(data: any): Promise<any> {
  try {
    const { summaryIds, action } = data;

    if (action === 'bulk-delete') {
      if (!summaryIds || !Array.isArray(summaryIds) || summaryIds.length === 0) {
        return {
          success: false,
          error: 'No summaries selected for deletion'
        };
      }

      // Get testids
      const { data: summaryData } = await supabaseAdmin
        .from('summary_generation')
        .select('testid')
        .in('id', summaryIds);

      // Delete related question answers
      if (summaryData && summaryData.length > 0) {
        const testids = summaryData.map(s => s.testid).filter(Boolean);
        if (testids.length > 0) {
          await supabaseAdmin
            .from('summary_question_answer')
            .delete()
            .in('testid', testids);
        }
      }

      // Delete summaries
      const { error } = await supabaseAdmin
        .from('summary_generation')
        .delete()
        .in('id', summaryIds);

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        message: `${summaryIds.length} summaries and all related records deleted successfully`
      };
    }

    return {
      success: false,
      error: 'Invalid action'
    };

  } catch (error: any) {
    console.error('Unexpected error in handlePostOperation:', error);
    return {
      success: false,
      error: error?.message || 'An unexpected error occurred'
    };
  }
}

/**
 * Calculate filtered statistics based on filters
 */
async function calculateFilteredStats(filters: SummaryFilters): Promise<SummaryStats | null> {
  try {
    // Get all filtered data for accurate statistics
    let statsQuery = supabaseAdmin
      .from('summary_generation')
      .select('payment_status, status, qualityscore');

    // Apply the same filters as the main query
    if (filters.searchTerm && filters.searchTerm.trim()) {
      const searchTerm = filters.searchTerm.trim();
      statsQuery = statsQuery.or(
        `testid.ilike.%${searchTerm}%,user_id.ilike.%${searchTerm}%,session_id.ilike.%${searchTerm}%,ip_address.ilike.%${searchTerm}%`
      );
    }

    if (filters.dateFrom) {
      statsQuery = statsQuery.gte('starting_time', filters.dateFrom);
    }
    if (filters.dateTo) {
      statsQuery = statsQuery.lte('starting_time', filters.dateTo);
    }

    if (filters.paymentStatus) {
      if (filters.paymentStatus === 'ERROR') {
        statsQuery = statsQuery.or('payment_status.ilike.*Failed*,payment_status.ilike.*Error*,payment_status.ilike.*error*,payment_status.ilike.*failed*');
      } else {
        statsQuery = statsQuery.eq('payment_status', filters.paymentStatus);
      }
    }

    if (filters.questStatus) {
      statsQuery = statsQuery.eq('quest_status', filters.questStatus);
    }

    if (filters.status) {
      statsQuery = statsQuery.eq('status', filters.status);
    }

    if (filters.minQualityScore !== null && filters.minQualityScore !== undefined) {
      statsQuery = statsQuery.gte('qualityscore', filters.minQualityScore.toString());
    }
    if (filters.maxQualityScore !== null && filters.maxQualityScore !== undefined) {
      statsQuery = statsQuery.lte('qualityscore', filters.maxQualityScore.toString());
    }

    const { data: allFilteredData } = await statsQuery;
    
    if (allFilteredData) {
      const totalSummaries = allFilteredData.length;
      const paidSummaries = allFilteredData.filter(s => 
        s.payment_status === 'success' || 
        s.payment_status === 'completed'
      ).length;
      const failedPayments = allFilteredData.filter(s => 
        s.payment_status && (
          s.payment_status.toLowerCase().includes('failed') ||
          s.payment_status.toLowerCase().includes('error')
        )
      ).length;
      const completedSummaries = allFilteredData.filter(s => 
        s.status === 'Complete' || 
        s.status === 'completed'
      ).length;
      
      // Calculate average quality score
      const qualityScores = allFilteredData
        .map(s => parseFloat(s.qualityscore || '0'))
        .filter(score => !isNaN(score) && score > 0);
      
      const averageQualityScore = qualityScores.length > 0
        ? Math.round(qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length)
        : 0;

      return {
        totalSummaries,
        paidSummaries,
        completedSummaries,
        averageQualityScore,
        failedPayments,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error calculating filtered stats:', error);
    return null;
  }
}

// GET /api/admin/summaries - Fetch summaries with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Check for special operations
    const operation = searchParams.get('operation');
    
    // Handle special operations using the unified handler
    if (operation) {
      const params: { id?: string } = {};
      if (searchParams.get('id')) {
        params.id = searchParams.get('id')!;
      }
      
      const result = await getSpecialOperationData(operation, params);
      
      if (result.success) {
        return NextResponse.json(result);
      } else {
        return NextResponse.json(
          result,
          { status: operation === 'single' ? 404 : 400 }
        );
      }
    }
    
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Build filters object
    const filters: SummaryFilters = {
      searchTerm: searchParams.get('search') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      paymentStatus: searchParams.get('paymentStatus') as any || undefined,
      questStatus: searchParams.get('questStatus') || undefined,
      status: searchParams.get('status') || undefined,
      hasQuestPdf: searchParams.get('hasQuestPdf') === 'true' ? true : searchParams.get('hasQuestPdf') === 'false' ? false : null,
      minQualityScore: searchParams.get('minQualityScore') ? parseInt(searchParams.get('minQualityScore')!) : null,
      maxQualityScore: searchParams.get('maxQualityScore') ? parseInt(searchParams.get('maxQualityScore')!) : null,
    };

    // Build query with user_data join
    let query = supabaseAdmin
      .from('summary_generation')
      .select(`
        *,
        user_data (
          user_name,
          email,
          mobile_number,
          city,
          gender,
          dob
        )
      `, { count: 'exact' });

    // Apply search filter (global search across multiple fields)
    if (filters.searchTerm && filters.searchTerm.trim()) {
      const searchTerm = filters.searchTerm.trim();
      query = query.or(
        `testid.ilike.%${searchTerm}%,user_id.ilike.%${searchTerm}%,session_id.ilike.%${searchTerm}%,ip_address.ilike.%${searchTerm}%`
      );
    }

    // Apply date range filters (starting_time)
    if (filters.dateFrom) {
      query = query.gte('starting_time', filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.lte('starting_time', filters.dateTo);
    }

    // Apply payment status filter
    if (filters.paymentStatus) {
      if (filters.paymentStatus === 'ERROR') {
        // Filter for error cases - anything that contains error-related terms or starts with "Failed"
        query = query.or('payment_status.ilike.*Failed*,payment_status.ilike.*Error*,payment_status.ilike.*error*,payment_status.ilike.*failed*');
      } else {
        query = query.eq('payment_status', filters.paymentStatus);
      }
    }

    // Apply quest status filter
    if (filters.questStatus) {
      query = query.eq('quest_status', filters.questStatus);
    }

    // Apply status filter
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    // Apply quest PDF filter
    if (filters.hasQuestPdf !== null && filters.hasQuestPdf !== undefined) {
      if (filters.hasQuestPdf) {
        query = query.not('quest_pdf', 'is', null);
      } else {
        query = query.is('quest_pdf', null);
      }
    }

    // Apply quality score range filters
    if (filters.minQualityScore !== null && filters.minQualityScore !== undefined) {
      query = query.gte('qualityscore', filters.minQualityScore.toString());
    }
    if (filters.maxQualityScore !== null && filters.maxQualityScore !== undefined) {
      query = query.lte('qualityscore', filters.maxQualityScore.toString());
    }

    // Apply pagination and ordering
    query = query.range(from, to).order('id', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Calculate pagination metadata
    const totalRecords = count || 0;
    const totalPages = Math.ceil(totalRecords / pageSize);

    const paginationMeta: PaginationMeta = {
      currentPage: page,
      pageSize,
      totalRecords,
      totalPages,
    };

    // Calculate filtered statistics from ALL filtered data (not just current page)
    let filteredStats: SummaryStats | null = null;
    
    const hasFilters = filters.searchTerm || filters.dateFrom || filters.dateTo || 
                       filters.paymentStatus || filters.questStatus || filters.status || 
                       filters.minQualityScore || filters.maxQualityScore;
    
    if (hasFilters) {
      filteredStats = await calculateFilteredStats(filters);
    }

    return NextResponse.json({
      success: true,
      data: {
        summaries: (data as SummaryGeneration[]) || [],
        pagination: paginationMeta,
        ...(filteredStats ? { filteredStats } : {}),
      },
      error: null,
    } as SummariesResponse);

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// POST /api/admin/summaries - Bulk delete summaries
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await handlePostOperation(body);
    
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        result,
        { status: 400 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/summaries - Delete single summary
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const summaryId = searchParams.get('id');
    
    if (!summaryId) {
      return NextResponse.json(
        { success: false, error: 'Summary ID is required' },
        { status: 400 }
      );
    }
    
    const id = parseInt(summaryId);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid summary ID' },
        { status: 400 }
      );
    }
    
    const result = await deleteSummary(id);
    
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        result,
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Unexpected error in DELETE /api/admin/summaries:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

