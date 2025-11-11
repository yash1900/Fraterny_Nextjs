import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Admin email list - matches the existing pattern from emails/check route
const FALLBACK_ADMIN_EMAILS = [
  'malhotrayash1900@gmail.com',
  'adityasingh7402@gmail.com',
  'aditya@fraterny.com',
];

/**
 * Check if an email belongs to an admin user
 */
export async function isAdminEmail(email: string): Promise<boolean> {
  if (!email) return false;

  try {
    // Try to fetch from database first
    const { data, error } = await supabaseAdmin
      .from('admin_emails')
      .select('email')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (!error && data) {
      return true;
    }

    // Fallback to hardcoded list
    return FALLBACK_ADMIN_EMAILS.includes(email.toLowerCase());
  } catch (error) {
    console.error('Error checking admin email:', error);
    // Fallback to hardcoded list on error
    return FALLBACK_ADMIN_EMAILS.includes(email.toLowerCase());
  }
}

/**
 * Verify admin authentication from request headers
 * Expects an Authorization header with format: "Bearer <token>"
 */
export async function verifyAdminAuth(request: NextRequest): Promise<{
  isAdmin: boolean;
  email?: string;
  error?: string;
}> {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { isAdmin: false, error: 'Missing or invalid authorization header' };
    }

    const token = authHeader.substring(7);
    
    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user?.email) {
      return { isAdmin: false, error: 'Invalid or expired token' };
    }

    // Check if the user's email is in the admin list
    const adminCheck = await isAdminEmail(user.email);

    return {
      isAdmin: adminCheck,
      email: user.email,
      error: adminCheck ? undefined : 'User is not an admin',
    };
  } catch (error: any) {
    console.error('Error verifying admin auth:', error);
    return { isAdmin: false, error: error.message || 'Authentication failed' };
  }
}

/**
 * Middleware helper to require admin authentication
 * Returns a 401/403 response if user is not authenticated or not an admin
 */
export async function requireAdminAuth(
  request: NextRequest
): Promise<{ email: string } | Response> {
  const authResult = await verifyAdminAuth(request);

  if (!authResult.isAdmin) {
    return new Response(
      JSON.stringify({
        success: false,
        error: authResult.error || 'Unauthorized access',
      }),
      {
        status: authResult.email ? 403 : 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  return { email: authResult.email! };
}
