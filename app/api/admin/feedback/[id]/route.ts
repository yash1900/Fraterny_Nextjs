import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/integrations/supabase/types';
import { supabaseAdmin } from '@/lib/supabase-admin';

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const feedbackId = parseInt(id, 10);

    if (isNaN(feedbackId)) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: 'Invalid feedback ID',
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
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
        `
      )
      .eq('id', feedbackId)
      .single();

    if (error) {
      console.error('Error fetching feedback by ID:', error);
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: error.message,
        },
        { status: error.code === 'PGRST116' ? 404 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data as EnrichedFeedback,
    });
  } catch (error: any) {
    console.error('Unexpected error in getFeedbackById:', error);
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const feedbackId = parseInt(id, 10);

    if (isNaN(feedbackId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid feedback ID',
        },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('summary_overall_feedback')
      .delete()
      .eq('id', feedbackId);

    if (error) {
      console.error('Error deleting feedback:', error);
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
    });
  } catch (error: any) {
    console.error('Unexpected error in deleteFeedback:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
