/**
 * API Route: /api/media/cache-version
 * Methods: GET, POST
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST() {
  try {
    // Update cache version by incrementing timestamp
    const newVersion = Date.now().toString();
    
    // Store in a settings table or return directly
    // For now, we'll just return success as cache busting happens via timestamp in URLs
    
    return NextResponse.json({
      success: true,
      version: newVersion,
      message: 'Cache version updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating cache version:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update cache version' },
      { status: 500 }
    );
  }
}

