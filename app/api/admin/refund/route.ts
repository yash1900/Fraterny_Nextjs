/**
 * API Route: /api/admin/refund
 * Methods: GET, POST
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Database } from '@/integrations/supabase/types';



// TypeScript Interfaces

type RefundTransaction = Database['public']['Tables']['refund_transactions']['Row'];

type RefundStatus = 
  | 'initiated' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'partial' 
  | 'cancelled';

interface RefundRequest {
  transaction_id?: string;
  payment_id?: string;
  order_id?: string;
  session_id?: string;
  testid?: string;
  user_id?: string;
  refund_amount: number;
  original_amount: number;
  currency: string;
  gateway: string;
  initiated_by: string;
  reason?: string;
  admin_notes?: string;
  customer_name?: string;
  customer_email?: string;
  customer_mobile?: string;
  original_transaction_data?: any;
  metadata?: any;
  gateway_refund_id?: string | null;
  gateway_refund_status?: string | null;
}

interface RefundResponse {
  success: boolean;
  data?: {
    refund: RefundTransaction;
    gateway_response?: any;
  };
  error?: string;
}

interface RefundFilters {
  refund_status?: RefundStatus;
  gateway?: string;
  initiated_by?: string;
  dateFrom?: string;
  dateTo?: string;
  searchTerm?: string;
  user_id?: string;
}

interface PaginationParams {
  page: number;
  pageSize: number;
}

interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

interface RefundsResponse {
  success: boolean;
  data?: {
    refunds: RefundTransaction[];
    pagination: PaginationMeta;
    stats?: RefundStats;
  };
  error?: string;
}

interface RefundStats {
  totalRefunds: number;
  completedRefunds: number;
  failedRefunds: number;
  processingRefunds: number;
  totalRefundAmount: number;
  completedRefundAmount: number;
  totalRefundAmountUSD: number;
  totalRefundAmountINR: number;
  completedRefundAmountUSD: number;
  completedRefundAmountINR: number;
}

interface GatewayRefundResult {
  success: boolean;
  gateway_refund_id?: string;
  gateway_refund_status?: string;
  gateway_response?: any;
  error?: string;
}

// Helper Functions

/**
 * Get refund statistics
 */
async function getRefundStats(): Promise<RefundStats> {
  try {
    const { data, error } = await supabaseAdmin
      .from('refund_transactions')
      .select('refund_status, refund_amount, currency');

    if (error) {
      console.error('Error fetching refund stats:', error);
      return {
        totalRefunds: 0,
        completedRefunds: 0,
        failedRefunds: 0,
        processingRefunds: 0,
        totalRefundAmount: 0,
        completedRefundAmount: 0,
        totalRefundAmountUSD: 0,
        totalRefundAmountINR: 0,
        completedRefundAmountUSD: 0,
        completedRefundAmountINR: 0
      };
    }

    const totalRefunds = data?.length || 0;
    const completedRefunds = data?.filter(r => r.refund_status === 'completed').length || 0;
    const failedRefunds = data?.filter(r => r.refund_status === 'failed').length || 0;
    const processingRefunds = data?.filter(r => 
      r.refund_status === 'processing' || r.refund_status === 'initiated'
    ).length || 0;

    const totalRefundAmount = data?.reduce((sum, r) => sum + (r.refund_amount || 0), 0) || 0;
    const completedRefundAmount = data?.filter(r => r.refund_status === 'completed')
      .reduce((sum, r) => sum + (r.refund_amount || 0), 0) || 0;

    // Calculate separate currency totals
    const totalRefundAmountUSD = data?.filter(r => r.currency === 'USD')
      .reduce((sum, r) => sum + (r.refund_amount || 0), 0) || 0;
    const totalRefundAmountINR = data?.filter(r => r.currency === 'INR')
      .reduce((sum, r) => sum + (r.refund_amount || 0), 0) || 0;
    
    const completedRefundAmountUSD = data?.filter(r => r.refund_status === 'completed' && r.currency === 'USD')
      .reduce((sum, r) => sum + (r.refund_amount || 0), 0) || 0;
    const completedRefundAmountINR = data?.filter(r => r.refund_status === 'completed' && r.currency === 'INR')
      .reduce((sum, r) => sum + (r.refund_amount || 0), 0) || 0;

    return {
      totalRefunds,
      completedRefunds,
      failedRefunds,
      processingRefunds,
      totalRefundAmount,
      completedRefundAmount,
      totalRefundAmountUSD,
      totalRefundAmountINR,
      completedRefundAmountUSD,
      completedRefundAmountINR
    };
  } catch (error) {
    console.error('Unexpected error in getRefundStats:', error);
    return {
      totalRefunds: 0,
      completedRefunds: 0,
      failedRefunds: 0,
      processingRefunds: 0,
      totalRefundAmount: 0,
      completedRefundAmount: 0,
      totalRefundAmountUSD: 0,
      totalRefundAmountINR: 0,
      completedRefundAmountUSD: 0,
      completedRefundAmountINR: 0
    };
  }
}

/**
 * Get refund by ID
 */
async function getRefundById(refundId: string): Promise<RefundResponse> {
  try {
    const { data, error } = await supabaseAdmin
      .from('refund_transactions')
      .select('*')
      .eq('refund_id', refundId)
      .single();

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data: {
        refund: data as RefundTransaction
      }
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'An unexpected error occurred'
    };
  }
}

/**
 * Update refund status (for webhook handling or manual updates)
 */
async function updateRefundStatus(
  refundId: string,
  status: RefundStatus,
  updateData?: Partial<RefundTransaction>
): Promise<RefundResponse> {
  try {
    const updates: any = {
      refund_status: status,
      ...updateData
    };

    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabaseAdmin
      .from('refund_transactions')
      .update(updates)
      .eq('refund_id', refundId)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data: {
        refund: data as RefundTransaction
      }
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'An unexpected error occurred'
    };
  }
}

/**
 * Bulk delete refunds (from services-old functionality)
 */
async function bulkDeleteRefunds(refundIds: string[]): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    console.log('🗑️ Starting bulk delete for refunds:', refundIds);
    
    if (!refundIds || !Array.isArray(refundIds) || refundIds.length === 0) {
      return {
        success: false,
        error: 'No refunds selected for deletion'
      };
    }
    
    // Delete refunds
    const { error } = await supabaseAdmin
      .from('refund_transactions')
      .delete()
      .in('refund_id', refundIds);

    if (error) {
      return {
        success: false,
        error: `Failed to delete refunds: ${error.message}`
      };
    }

    return {
      success: true,
      message: `${refundIds.length} refunds deleted successfully`
    };
  } catch (error: any) {
    console.error('Unexpected error in bulkDeleteRefunds:', error);
    return {
      success: false,
      error: error?.message || 'An unexpected error occurred'
    };
  }
}

/**
 * Handle special operations (stats, single, bulk-delete)
 */
async function getSpecialOperationData(operation: string, params?: { id?: string }): Promise<any> {
  try {
    switch (operation) {
      case 'stats':
        const stats = await getRefundStats();
        return {
          success: true,
          data: stats
        };
      
      case 'single':
        if (!params?.id) {
          return {
            success: false,
            error: 'Refund ID is required for single operation'
          };
        }
        const result = await getRefundById(params.id);
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
 * Handle POST operations (initiate refund, bulk-delete)
 */
async function handlePostOperation(body: any, request: NextRequest): Promise<any> {
  try {
    const { action, refundIds, ...refundData } = body;

    if (action === 'bulk-delete') {
      return await bulkDeleteRefunds(refundIds);
    }

    // Get base URL from request
    const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;

    // Default: Initiate refund (existing functionality)
    return await initiateRefundProcess(refundData, baseUrl);
  } catch (error: any) {
    console.error('Unexpected error in handlePostOperation:', error);
    return {
      success: false,
      error: error?.message || 'An unexpected error occurred'
    };
  }
}

/**
 * Process refund initiation (extracted from existing POST logic)
 */
async function initiateRefundProcess(refundData: RefundRequest, baseUrl: string): Promise<any> {
  console.log('💰 Initiating refund:', refundData);

  // Step 1: Insert refund record into database
  const refundRecord = {
    transaction_id: refundData.transaction_id,
    payment_id: refundData.payment_id,
    order_id: refundData.order_id,
    session_id: refundData.session_id,
    testid: refundData.original_transaction_data?.testid,
    user_id: refundData.user_id,
    refund_amount: refundData.refund_amount,
    original_amount: refundData.original_amount,
    currency: refundData.currency,
    gateway: refundData.gateway,
    refund_status: 'initiated' as RefundStatus,
    initiated_by: refundData.initiated_by,
    reason: refundData.reason,
    admin_notes: refundData.admin_notes,
    customer_name: refundData.customer_name,
    customer_email: refundData.customer_email,
    customer_mobile: refundData.customer_mobile,
    original_transaction_data: refundData.original_transaction_data,
    metadata: refundData.metadata,
    gateway_refund_id: refundData.gateway_refund_id || null,
    gateway_refund_status: refundData.gateway_refund_status || null,
  };

  const { data: refund, error: insertError } = await supabaseAdmin
    .from('refund_transactions')
    .insert(refundRecord)
    .select()
    .single();

  if (insertError) {
    console.error('❌ Error inserting refund record:', insertError);
    return {
      success: false,
      error: `Failed to create refund record: ${insertError.message}`,
    };
  }

  console.log('✅ Refund record created:', refund.refund_id);

  // Note: Gateway processing is handled by the calling code (RefundPopup)
  // This route only saves the refund tracking data
  console.log('🎉 Refund tracking saved successfully:', {
    refund_id: refund.refund_id,
    status: refund.refund_status,
  });

  return {
    success: true,
    data: {
      refund: refund,
    },
  };
}

/**
 * Format Razorpay amount from paise to rupees
 */
function formatRazorpayAmount(amountInPaise: number): string {
  return (amountInPaise / 100).toFixed(2);
}

/**
 * Convert amount from rupees to paise for Razorpay API
 */
function convertToRazorpayAmount(amountInRupees: number): number {
  return Math.round(amountInRupees * 100);
}

// GET - Fetch refunds with filters and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
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

    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

    const filters: RefundFilters = {};

    const refund_status = searchParams.get('refund_status');
    if (refund_status) filters.refund_status = refund_status as RefundStatus;

    const gateway = searchParams.get('gateway');
    if (gateway) filters.gateway = gateway;

    const initiated_by = searchParams.get('initiated_by');
    if (initiated_by) filters.initiated_by = initiated_by;

    const user_id = searchParams.get('user_id');
    if (user_id) filters.user_id = user_id;

    const searchTerm = searchParams.get('searchTerm');
    if (searchTerm) filters.searchTerm = searchTerm;

    const dateFrom = searchParams.get('dateFrom');
    if (dateFrom) filters.dateFrom = dateFrom;

    const dateTo = searchParams.get('dateTo');
    if (dateTo) filters.dateTo = dateTo;

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Build query
    let query = supabaseAdmin
      .from('refund_transactions')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.refund_status) {
      query = query.eq('refund_status', filters.refund_status);
    }

    if (filters.gateway) {
      query = query.eq('gateway', filters.gateway);
    }

    if (filters.initiated_by) {
      query = query.eq('initiated_by', filters.initiated_by);
    }

    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }

    if (filters.searchTerm && filters.searchTerm.trim()) {
      const searchTerm = filters.searchTerm.trim();
      query = query.or(
        `refund_id.ilike.%${searchTerm}%,transaction_id.ilike.%${searchTerm}%,payment_id.ilike.%${searchTerm}%,customer_email.ilike.%${searchTerm}%,customer_name.ilike.%${searchTerm}%`
      );
    }

    if (filters.dateFrom) {
      query = query.gte('initiated_at', filters.dateFrom);
    }

    if (filters.dateTo) {
      query = query.lte('initiated_at', filters.dateTo);
    }

    // Apply pagination
    query = query
      .range(from, to)
      .order('initiated_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching refunds:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    const totalRecords = count || 0;
    const totalPages = Math.ceil(totalRecords / pageSize);

    const paginationMeta: PaginationMeta = {
      currentPage: page,
      pageSize,
      totalRecords,
      totalPages,
    };

    // Calculate filtered statistics if filters are applied
    let filteredStats = null;
    if (filters.refund_status || filters.gateway || filters.user_id || filters.dateFrom || filters.dateTo || filters.searchTerm) {
      // Build stats query with same filters
      let statsQuery = supabaseAdmin
        .from('refund_transactions')
        .select('refund_amount, currency');
      
      // Apply same filters for stats
      if (filters.refund_status) {
        statsQuery = statsQuery.eq('refund_status', filters.refund_status);
      }
      if (filters.gateway) {
        statsQuery = statsQuery.eq('gateway', filters.gateway);
      }
      if (filters.initiated_by) {
        statsQuery = statsQuery.eq('initiated_by', filters.initiated_by);
      }
      if (filters.user_id) {
        statsQuery = statsQuery.eq('user_id', filters.user_id);
      }
      if (filters.searchTerm && filters.searchTerm.trim()) {
        const searchTerm = filters.searchTerm.trim();
        statsQuery = statsQuery.or(
          `refund_id.ilike.%${searchTerm}%,transaction_id.ilike.%${searchTerm}%,payment_id.ilike.%${searchTerm}%,customer_email.ilike.%${searchTerm}%,customer_name.ilike.%${searchTerm}%`
        );
      }
      if (filters.dateFrom) {
        statsQuery = statsQuery.gte('initiated_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        statsQuery = statsQuery.lte('initiated_at', filters.dateTo);
      }
      
      const { data: statsData } = await statsQuery;
      
      if (statsData) {
        const totalAmount = statsData.reduce((sum, refund) => sum + (parseFloat(refund.refund_amount || '0')), 0);
        filteredStats = {
          totalAmount,
          totalCount: statsData.length,
          currency: statsData[0]?.currency || 'USD'
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        refunds: (data as RefundTransaction[]) || [],
        pagination: paginationMeta,
        stats: filteredStats
      },
    });
  } catch (error: any) {
    console.error('Unexpected error in fetchRefunds:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

// POST - Initiate refund or handle bulk operations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await handlePostOperation(body, request);
    
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        result,
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('❌ Unexpected error in POST refunds:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

// PUT - Update refund status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      refund_id, 
      refund_status, 
      admin_notes, 
      reason,
      gateway_refund_id,
      gateway_refund_status,
      gateway_response
    } = body;

    if (!refund_id || !refund_status) {
      return NextResponse.json(
        {
          success: false,
          error: 'refund_id and refund_status are required',
        },
        { status: 400 }
      );
    }

    // Validate refund status
    const validStatuses: RefundStatus[] = ['initiated', 'processing', 'completed', 'failed', 'cancelled'];
    if (!validStatuses.includes(refund_status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid refund status. Valid statuses are: ${validStatuses.join(', ')}`
        },
        { status: 400 }
      );
    }

    const updateData: any = { admin_notes, reason };
    
    // Add gateway data if provided
    if (gateway_refund_id) updateData.gateway_refund_id = gateway_refund_id;
    if (gateway_refund_status) updateData.gateway_refund_status = gateway_refund_status;
    if (gateway_response) updateData.gateway_response = gateway_response;
    
    const result = await updateRefundStatus(refund_id, refund_status, updateData);
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Error updating refund status:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

