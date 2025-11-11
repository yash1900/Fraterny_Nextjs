import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, testId, feedback, rating } = body;

    console.log('Received feedback submission:', { user_id, testId, feedback, rating });

    // Validate required fields
    if (!rating && !feedback) {
      return NextResponse.json(
        {
          status: 400,
          message: 'Please provide either a rating or feedback'
        },
        { status: 400 }
      );
    }

    // Insert feedback into database
    const { data, error } = await supabaseAdmin
      .from('summary_overall_feedback')
      .insert({
        user_id: user_id || null,
        testid: testId || null,
        feedback: feedback?.trim() || null,
        rating: rating ? rating.toString() : null, // Convert to string as per table schema
        date_time: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error submitting feedback:', error);
      return NextResponse.json(
        {
          status: 500,
          message: 'Failed to submit feedback',
          error: error.message
        },
        { status: 500 }
      );
    }

    console.log('Feedback submitted successfully:', data);

    return NextResponse.json(
      {
        status: 200,
        message: 'Thank you for your feedback!',
        data
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Unexpected error in feedback submission:', error);
    return NextResponse.json(
      {
        status: 500,
        message: 'An unexpected error occurred',
        error: error?.message
      },
      { status: 500 }
    );
  }
}
