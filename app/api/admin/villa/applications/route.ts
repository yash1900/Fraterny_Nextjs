/**
 * API Route: /api/admin/villa/applications
 * Methods: GET, PUT, DELETE
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET - Fetch all villa applications
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('villa_applications')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching villa applications:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch applications' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error: any) {
    console.error('Error fetching villa applications:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// PUT - Update application status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationId, status } = body;

    if (!applicationId || !status) {
      return NextResponse.json(
        { success: false, error: 'Application ID and status are required' },
        { status: 400 }
      );
    }

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // First, get the current application to check previous status and edition
    const { data: currentApp, error: fetchError } = await supabaseAdmin
      .from('villa_applications')
      .select('approval_status, selected_edition_id, number_of_accompanying_persons')
      .eq('application_id', applicationId)
      .single();

    if (fetchError || !currentApp) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    // Update the application status
    const { data, error } = await supabaseAdmin
      .from('villa_applications')
      .update({ approval_status: status })
      .eq('application_id', applicationId)
      .select()
      .single();

    if (error) {
      console.error('Error updating application status:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update application status' },
        { status: 500 }
      );
    }

    // Update villa_editions seat count if status changed to/from approved
    const previousStatus = currentApp.approval_status;
    const editionId = currentApp.selected_edition_id;
    // Total seats needed: applicant + accompanying persons
    const totalSeatsNeeded = 1 + (currentApp.number_of_accompanying_persons || 0);

    if (editionId) {
      // If newly approved, increment alloted_seats
      if (status === 'approved' && previousStatus !== 'approved') {
        const { error: updateError } = await supabaseAdmin.rpc(
          'increment_edition_seats',
          { 
            edition_id: editionId, 
            seats_to_add: totalSeatsNeeded 
          }
        );

        // If RPC doesn't exist, use direct update
        if (updateError) {
          console.log('RPC not found, using direct update');
          const { data: edition } = await supabaseAdmin
            .from('villa_editions')
            .select('alloted_seats')
            .eq('id', editionId)
            .single();

          if (edition) {
            await supabaseAdmin
              .from('villa_editions')
              .update({ alloted_seats: edition.alloted_seats + totalSeatsNeeded })
              .eq('id', editionId);
          }
        }
      }
      // If was approved and now rejected/pending, decrement alloted_seats
      else if (previousStatus === 'approved' && status !== 'approved') {
        const { error: updateError } = await supabaseAdmin.rpc(
          'decrement_edition_seats',
          { 
            edition_id: editionId, 
            seats_to_remove: totalSeatsNeeded 
          }
        );

        // If RPC doesn't exist, use direct update
        if (updateError) {
          console.log('RPC not found, using direct update');
          const { data: edition } = await supabaseAdmin
            .from('villa_editions')
            .select('alloted_seats')
            .eq('id', editionId)
            .single();

          if (edition) {
            await supabaseAdmin
              .from('villa_editions')
              .update({ 
                alloted_seats: Math.max(0, edition.alloted_seats - totalSeatsNeeded) 
              })
              .eq('id', editionId);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      data,
      message: `Application ${status} successfully`,
    });
  } catch (error: any) {
    console.error('Error updating application status:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// DELETE - Delete application and update edition seats
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('id');

    if (!applicationId) {
      return NextResponse.json(
        { success: false, error: 'Application ID is required' },
        { status: 400 }
      );
    }

    // First, get the application details to update edition seats if approved
    const { data: application, error: fetchError } = await supabaseAdmin
      .from('villa_applications')
      .select('approval_status, selected_edition_id, number_of_accompanying_persons')
      .eq('application_id', applicationId)
      .single();

    if (fetchError || !application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    // If the application was approved, we need to free up the seats
    if (application.approval_status === 'approved' && application.selected_edition_id) {
      const totalSeatsNeeded = 1 + (application.number_of_accompanying_persons || 0);
      
      // Get current edition seats
      const { data: edition } = await supabaseAdmin
        .from('villa_editions')
        .select('alloted_seats')
        .eq('id', application.selected_edition_id)
        .single();

      if (edition) {
        // Decrease the alloted_seats
        await supabaseAdmin
          .from('villa_editions')
          .update({ 
            alloted_seats: Math.max(0, edition.alloted_seats - totalSeatsNeeded) 
          })
          .eq('id', application.selected_edition_id);
      }
    }

    // Delete the application
    const { error: deleteError } = await supabaseAdmin
      .from('villa_applications')
      .delete()
      .eq('application_id', applicationId);

    if (deleteError) {
      console.error('Error deleting application:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete application' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Application deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting application:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
