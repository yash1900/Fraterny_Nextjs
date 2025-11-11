/**
 * API Route: /api/settings/editions
 * Methods: GET, POST, PUT, DELETE, PATCH
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Types
interface VillaEdition {
  id: string;
  startDate: string;
  endDate: string;
  timeFrame?: string | null;
  isActive: boolean;
  allocationStatus: 'available' | 'limited' | 'sold_out';
  allotedSeats: number;
  totalSeats: number;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

// Database column mapping helpers
function dbToApi(dbRow: any): VillaEdition {
  return {
    id: dbRow.id,
    startDate: dbRow.start_date,
    endDate: dbRow.end_date,
    timeFrame: dbRow.time_frame,
    isActive: dbRow.is_active,
    allocationStatus: dbRow.allocation_status,
    allotedSeats: dbRow.alloted_seats,
    totalSeats: dbRow.total_seats,
    displayOrder: dbRow.display_order,
    createdAt: dbRow.created_at,
    updatedAt: dbRow.updated_at,
  };
}

function apiToDb(apiData: Partial<VillaEdition>) {
  const dbData: any = {};
  if (apiData.startDate !== undefined) dbData.start_date = apiData.startDate;
  if (apiData.endDate !== undefined) dbData.end_date = apiData.endDate;
  if (apiData.timeFrame !== undefined) dbData.time_frame = apiData.timeFrame;
  if (apiData.isActive !== undefined) dbData.is_active = apiData.isActive;
  if (apiData.allocationStatus !== undefined) dbData.allocation_status = apiData.allocationStatus;
  if (apiData.allotedSeats !== undefined) dbData.alloted_seats = apiData.allotedSeats;
  if (apiData.totalSeats !== undefined) dbData.total_seats = apiData.totalSeats;
  if (apiData.displayOrder !== undefined) dbData.display_order = apiData.displayOrder;
  return dbData;
}

// GET - Fetch editions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const operation = searchParams.get('operation');
    const id = searchParams.get('id');

    // Handle single edition fetch
    if (operation === 'single' && id) {
      const { data, error } = await supabaseAdmin
        .from('villa_editions')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error || !data) {
        return NextResponse.json(
          { success: false, error: 'Edition not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        data: dbToApi(data)
      });
    }

    // Build query
    let query = supabaseAdmin.from('villa_editions').select('*');

    // Handle filtering
    if (operation === 'filter') {
      const isActive = searchParams.get('isActive');
      const status = searchParams.get('status');
      
      if (isActive !== null) {
        query = query.eq('is_active', isActive === 'true');
      }
      
      if (status) {
        query = query.eq('allocation_status', status);
      }
    }

    // Execute query with ordering
    const { data, error } = await query.order('display_order', { ascending: true });
    
    if (error) {
      console.error('Error fetching editions:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch editions' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: data.map(dbToApi)
    });

  } catch (error: any) {
    console.error('Error fetching editions:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// POST - Create new edition
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      startDate,
      endDate,
      timeFrame,
      isActive = true,
      allocationStatus = 'available',
      allotedSeats = 0,
      totalSeats,
      displayOrder
    } = body;

    // Validate required fields
    if (!startDate || !endDate || !totalSeats) {
      return NextResponse.json(
        { success: false, error: 'startDate, endDate, and totalSeats are required' },
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format' },
        { status: 400 }
      );
    }
    
    if (start >= end) {
      return NextResponse.json(
        { success: false, error: 'Start date must be before end date' },
        { status: 400 }
      );
    }

    // Validate seats
    if (totalSeats <= 0 || allotedSeats < 0 || allotedSeats > totalSeats) {
      return NextResponse.json(
        { success: false, error: 'Invalid seat configuration' },
        { status: 400 }
      );
    }

    // Get max display order if not provided
    let finalDisplayOrder = displayOrder;
    if (!finalDisplayOrder) {
      const { data: maxOrderData } = await supabaseAdmin
        .from('villa_editions')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1);
      
      finalDisplayOrder = maxOrderData && maxOrderData.length > 0 
        ? maxOrderData[0].display_order + 1 
        : 1;
    }

    const insertData = {
      start_date: startDate,
      end_date: endDate,
      time_frame: timeFrame || null,
      is_active: isActive,
      allocation_status: allocationStatus,
      alloted_seats: allotedSeats,
      total_seats: totalSeats,
      display_order: finalDisplayOrder,
    };

    const { data, error } = await supabaseAdmin
      .from('villa_editions')
      .insert(insertData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating edition:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create edition' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: dbToApi(data),
      message: 'Edition created successfully'
    });

  } catch (error: any) {
    console.error('Error creating edition:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// PUT - Update existing edition
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Edition ID is required' },
        { status: 400 }
      );
    }

    // Validate updates if provided
    if (updates.startDate && updates.endDate) {
      const start = new Date(updates.startDate);
      const end = new Date(updates.endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return NextResponse.json(
          { success: false, error: 'Invalid date format' },
          { status: 400 }
        );
      }
      
      if (start >= end) {
        return NextResponse.json(
          { success: false, error: 'Start date must be before end date' },
          { status: 400 }
        );
      }
    }

    if (updates.totalSeats !== undefined && updates.totalSeats <= 0) {
      return NextResponse.json(
        { success: false, error: 'Total seats must be greater than 0' },
        { status: 400 }
      );
    }

    if (updates.allotedSeats !== undefined && updates.allotedSeats < 0) {
      return NextResponse.json(
        { success: false, error: 'Alloted seats cannot be negative' },
        { status: 400 }
      );
    }

    const dbUpdates = apiToDb(updates);

    const { data, error } = await supabaseAdmin
      .from('villa_editions')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating edition:', error);
      return NextResponse.json(
        { success: false, error: error.code === 'PGRST116' ? 'Edition not found' : 'Failed to update edition' },
        { status: error.code === 'PGRST116' ? 404 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: dbToApi(data),
      message: 'Edition updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating edition:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// DELETE - Delete edition
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Edition ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('villa_editions')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting edition:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete edition' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Edition deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting edition:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// PATCH - Special operations (reorder, bulk update)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation } = body;

    if (operation === 'reorder') {
      const { editionIds } = body;
      
      if (!Array.isArray(editionIds)) {
        return NextResponse.json(
          { success: false, error: 'editionIds must be an array' },
          { status: 400 }
        );
      }

      // Update display order for each edition
      const updates = editionIds.map((id, index) => 
        supabaseAdmin
          .from('villa_editions')
          .update({ display_order: index + 1 })
          .eq('id', id)
      );

      await Promise.all(updates);

      // Fetch updated editions
      const { data, error } = await supabaseAdmin
        .from('villa_editions')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) {
        return NextResponse.json(
          { success: false, error: 'Failed to reorder editions' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: data.map(dbToApi),
        message: 'Editions reordered successfully'
      });
    }

    if (operation === 'bulk-update') {
      const { updates } = body;
      
      if (!Array.isArray(updates)) {
        return NextResponse.json(
          { success: false, error: 'updates must be an array' },
          { status: 400 }
        );
      }

      const results = [];
      
      for (const update of updates) {
        const { id, ...changes } = update;
        const dbChanges = apiToDb(changes);
        
        const { error } = await supabaseAdmin
          .from('villa_editions')
          .update(dbChanges)
          .eq('id', id);
        
        results.push({ 
          id, 
          success: !error, 
          error: error ? error.message : undefined 
        });
      }

      const hasErrors = results.some(r => !r.success);

      // Fetch updated editions
      const { data } = await supabaseAdmin
        .from('villa_editions')
        .select('*')
        .order('display_order', { ascending: true });

      return NextResponse.json({
        success: !hasErrors,
        results,
        data: hasErrors ? undefined : data?.map(dbToApi),
        message: hasErrors ? 'Some updates failed' : 'Bulk update completed successfully'
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid operation' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Error in PATCH operation:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
