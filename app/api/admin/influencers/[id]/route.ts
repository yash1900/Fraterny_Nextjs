import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET /api/admin/influencers/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data, error } = await supabaseAdmin
      .from('influencers')
      .select('*')
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

// PATCH /api/admin/influencers/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updateData: any = { updated_at: new Date().toISOString() };

    if (body.name !== undefined) updateData.name = body.name;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.profile_image !== undefined) updateData.profile_image = body.profile_image;
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.social_links !== undefined) updateData.social_links = body.social_links;
    if (body.commission_rate !== undefined) updateData.commission_rate = body.commission_rate;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.payment_info !== undefined) updateData.payment_info = body.payment_info;

    const { data, error } = await supabaseAdmin
      .from('influencers')
      .update(updateData)
      .eq('id', id)
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
      message: 'Influencer updated successfully'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/influencers/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Get affiliate code
    const { data: influencerData } = await supabaseAdmin
      .from('influencers')
      .select('affiliate_code')
      .eq('id', id)
      .single();

    if (influencerData) {
      // Delete tracking events
      await supabaseAdmin
        .from('tracking_events')
        .delete()
        .eq('affiliate_code', influencerData.affiliate_code);

      // Delete payouts
      await supabaseAdmin
        .from('influencer_payouts')
        .delete()
        .eq('influencer_id', id);
    }

    // Delete influencer
    const { error } = await supabaseAdmin
      .from('influencers')
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
      message: 'Influencer and all related records deleted successfully'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 500 }
    );
  }
}
