import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET /api/admin/summaries/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/summaries/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Get testid
    const { data: summaryData } = await supabaseAdmin
      .from('summary_generation')
      .select('testid')
      .eq('id', id)
      .single();

    // Delete related question answers
    if (summaryData?.testid) {
      await supabaseAdmin
        .from('summary_question_answer')
        .delete()
        .eq('testid', summaryData.testid);
    }

    // Delete summary
    const { error } = await supabaseAdmin
      .from('summary_generation')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Summary and all related records deleted successfully'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 500 }
    );
  }
}
