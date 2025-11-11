/**
 * API Route: /api/admin/emails/check
 * Methods: GET
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Database } from '@/integrations/supabase/types';



type AdminEmailData = Database['public']['Tables']['admin_emails']['Row'];

// Check if email is admin (for auth hook)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          isAdmin: false,
          error: 'Email parameter is required',
        },
        { status: 400 }
      );
    }

    // Fetch active admin emails
    const { data, error } = await supabaseAdmin
      .from('admin_emails')
      .select('*')
      .eq('is_active', true);

    if (error || !data) {
      console.warn('Database check failed, using fallback admin emails');
      // Fallback to hardcoded emails if database fails
      const fallbackEmails = [
        'malhotrayash1900@gmail.com',
        'indranilmaiti16@gmail.com',
        'adityasingh7402@gmail.com'
      ];
      const isAdmin = fallbackEmails.includes(email);

      return NextResponse.json({
        success: true,
        isAdmin,
        usingFallback: true,
      });
    }

    const isAdmin = (data as AdminEmailData[]).some(admin => admin.email === email);

    return NextResponse.json({
      success: true,
      isAdmin,
      usingFallback: false,
    });
  } catch (error: any) {
    console.error('❌ Error checking admin email, using fallback:', error);
    // Fallback to hardcoded emails if database fails
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || '';
    const fallbackEmails = [
      'malhotrayash1900@gmail.com',
      'indranilmaiti16@gmail.com',
      'adityasingh7402@gmail.com'
    ];
    const isAdmin = fallbackEmails.includes(email);

    return NextResponse.json({
      success: true,
      isAdmin,
      usingFallback: true,
      error: error.message,
    });
  }
}

