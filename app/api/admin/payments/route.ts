/**
 * API Route: /api/admin/payments
 * Methods: GET
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Database } from '@/integrations/supabase/types';



type TransactionDetail = Database['public']['Tables']['transaction_details']['Row'];
type UserData = Database['public']['Tables']['user_data']['Row'];

type SummaryGenerationPartial = Pick<
  Database['public']['Tables']['summary_generation']['Row'],
  | 'quest_pdf'
  | 'payment_status'
  | 'paid_generation_time'
  | 'summary_error'
  | 'quest_error'
  | 'quest_status'
  | 'status'
  | 'qualityscore'
  | 'ip_address'
  | 'testid'
>;

type EnrichedTransaction = TransactionDetail & {
  user_data: UserData | null;
  summary_generation: SummaryGenerationPartial | null;
};

type PaymentFilters = {
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
  gateway?: 'Razorpay' | 'paypal' | null;
  isIndia?: boolean | null;
  minAmount?: number | null;
  maxAmount?: number | null;
};

type PaginationParams = {
  page: number;
  pageSize: number;
};

type PaginationMeta = {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
};

type PaymentStatus = 'success' | 'Start' | 'error';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get pagination params
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const statusType = (searchParams.get('status') || 'success') as PaymentStatus;

    // Get filters
    const filters: PaymentFilters = {};
    
    const searchTerm = searchParams.get('searchTerm');
    if (searchTerm) filters.searchTerm = searchTerm;

    const dateFrom = searchParams.get('dateFrom');
    if (dateFrom) filters.dateFrom = dateFrom;

    const dateTo = searchParams.get('dateTo');
    if (dateTo) filters.dateTo = dateTo;

    const gateway = searchParams.get('gateway');
    if (gateway) filters.gateway = gateway as 'Razorpay' | 'paypal';

    const isIndia = searchParams.get('isIndia');
    if (isIndia !== null && isIndia !== undefined && isIndia !== '') {
      filters.isIndia = isIndia === 'true';
    }

    const minAmount = searchParams.get('minAmount');
    if (minAmount !== null && minAmount !== undefined && minAmount !== '') {
      filters.minAmount = parseFloat(minAmount);
    }

    const maxAmount = searchParams.get('maxAmount');
    if (maxAmount !== null && maxAmount !== undefined && maxAmount !== '') {
      filters.maxAmount = parseFloat(maxAmount);
    }

    // Calculate pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Build the base query with joins
    let query = supabaseAdmin
      .from('transaction_details')
      .select(
        `
        *,
        user_data (*),
        summary_generation (
          testid,
          quest_pdf,
          payment_status,
          paid_generation_time,
          summary_error,
          quest_error,
          quest_status,
          status,
          qualityscore,
          ip_address
        )
        `,
        { count: 'exact' }
      );

    // Filter by status type
    if (statusType === 'error') {
      // Disputed payments: status is neither 'success' nor 'Start'
      query = query.not('status', 'in', '("success","Start")');
    } else {
      // Successful or Attempted payments
      query = query.eq('status', statusType);
    }

    // Apply search filter (global search across multiple fields)
    if (filters.searchTerm && filters.searchTerm.trim()) {
      const searchTerm = filters.searchTerm.trim();
      query = query.or(
        `order_id.ilike.%${searchTerm}%,payment_id.ilike.%${searchTerm}%,session_id.ilike.%${searchTerm}%,testid.ilike.%${searchTerm}%,transaction_id.ilike.%${searchTerm}%`
      );
    }

    // Apply date range filters
    if (filters.dateFrom) {
      query = query.gte('payment_completed_time', filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.lte('payment_completed_time', filters.dateTo);
    }

    // Apply gateway filter
    if (filters.gateway) {
      query = query.eq('gateway', filters.gateway);
    }

    // Apply IsIndia filter
    if (filters.isIndia !== null && filters.isIndia !== undefined) {
      query = query.eq('IsIndia', filters.isIndia);
    }

    // Apply amount range filters
    if (filters.minAmount !== null && filters.minAmount !== undefined) {
      query = query.gte('total_paid', filters.minAmount);
    }
    if (filters.maxAmount !== null && filters.maxAmount !== undefined) {
      query = query.lte('total_paid', filters.maxAmount);
    }

    // Apply pagination and ordering
    query = query
      .range(from, to)
      .order('payment_completed_time', { ascending: false });

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching payment details:', error);
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
    const transactions = data ? data.slice(0, pageSize) : [];

    const paginationMeta: PaginationMeta = {
      currentPage: page,
      pageSize,
      totalRecords,
      totalPages,
    };

    return NextResponse.json({
      success: true,
      data: {
        transactions: (transactions as EnrichedTransaction[]) || [],
        pagination: paginationMeta,
      },
      error: null,
    });
  } catch (error: any) {
    console.error('Unexpected error in fetchPaymentDetails:', error);
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
