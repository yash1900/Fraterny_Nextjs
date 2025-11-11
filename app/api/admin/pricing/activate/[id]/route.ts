import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/integrations/supabase/types';
import { supabaseAdmin } from '@/lib/supabase-admin';

type DynamicPricingData = Database['public']['Tables']['dynamic_pricing']['Row'];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const options = body as { updated_by?: string; notes?: string };

    console.log(`🔄 Activating pricing configuration ${id}...`);

    // Deactivate any currently active row
    const { error: deactivateError } = await supabaseAdmin
      .from('dynamic_pricing')
      .update({ is_active: false })
      .eq('is_active', true);

    if (deactivateError) {
      console.error('❌ Error deactivating current active pricing:', deactivateError);
      return NextResponse.json(
        {
          success: false,
          error: deactivateError.message || 'Failed to deactivate current active pricing',
        },
        { status: 500 }
      );
    }

    // Activate the selected row
    const updatePayload: any = {
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    if (options?.updated_by) {
      updatePayload.updated_by = options.updated_by;
    }

    if (options?.notes) {
      updatePayload.notes = options.notes;
    }

    const { data, error } = await supabaseAdmin
      .from('dynamic_pricing')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('❌ Error activating pricing:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Failed to activate pricing',
        },
        { status: 500 }
      );
    }

    console.log('✅ Pricing activated successfully');
    return NextResponse.json({
      success: true,
      data: data as DynamicPricingData,
    });
  } catch (error: any) {
    console.error('❌ Exception activating pricing:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to activate pricing',
      },
      { status: 500 }
    );
  }
}
