import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET /api/admin/users/[id] - Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from('user_data')
      .select('*')
      .eq('user_id', id)
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users/[id] - Update user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from('user_data')
      .update(body)
      .eq('user_id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'User updated successfully'
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] - Delete user with cascade
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log('🗑️ Starting cascade delete for user:', id);

    // Step 1: Delete question answers
    const { error: questionError } = await supabaseAdmin
      .from('summary_question_answer')
      .delete()
      .eq('user_id', id);

    if (questionError) {
      return NextResponse.json(
        { success: false, error: `Failed to delete question answers: ${questionError.message}` },
        { status: 500 }
      );
    }

    // Step 2: Delete summaries
    const { error: summaryError } = await supabaseAdmin
      .from('summary_generation')
      .delete()
      .eq('user_id', id);

    if (summaryError) {
      return NextResponse.json(
        { success: false, error: `Failed to delete summaries: ${summaryError.message}` },
        { status: 500 }
      );
    }

    // Step 3: Delete transactions
    const { error: transactionError } = await supabaseAdmin
      .from('transaction_details')
      .delete()
      .eq('user_id', id);

    if (transactionError) {
      return NextResponse.json(
        { success: false, error: `Failed to delete transactions: ${transactionError.message}` },
        { status: 500 }
      );
    }

    // Step 4: Delete user
    const { error } = await supabaseAdmin
      .from('user_data')
      .delete()
      .eq('user_id', id);

    if (error) {
      return NextResponse.json(
        { success: false, error: `Failed to delete user: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('✅ User deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'User and all related records deleted successfully'
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
