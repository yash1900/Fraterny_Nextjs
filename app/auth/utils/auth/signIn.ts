
import { supabase } from '../../../../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { log } from 'console';
import { toast } from 'sonner';

/**
 * Sign in with email and password
 */
export const signIn = async (email: string, password: string): Promise<{user: User | null, session: Session | null}> => {
  try {
    const { error, data } = await supabase.auth.signInWithPassword({ 
      email, 
      password
    });
    
    if (error) throw error;
    
    toast.success('Signed in successfully');
    return { 
      user: data.session?.user ?? null, 
      session: data.session 
    };
  } catch (error: any) {
    toast.error(error.message || 'Error signing in');
    throw error;
  }
};


export const signInWithGoogle = async () => {
  const currentUrl = window.location.href;
  const currentOrigin = window.location.origin;

  console.log('🔍 Current URL:', currentUrl);
  console.log('🔍 Current Origin:', currentOrigin);

  // Check if we have a stored "from" path (set by Auth.tsx)
  const storedFrom = sessionStorage.getItem('auth_redirect_from');
  console.log('🔍 Stored from path:', storedFrom);

  
  const redirectUrl = storedFrom
    ? `${currentOrigin}${storedFrom}`
    : (currentUrl.includes('quest') || currentUrl.includes('quest-result') || currentUrl.includes('affiliates')
        ? currentUrl
        : currentOrigin);

  console.log('🎯 Final redirect URL:', redirectUrl);

  if (storedFrom) {
    sessionStorage.removeItem('auth_redirect_from');
    sessionStorage.removeItem('google_oauth_return_to');
    console.log('🧹 Cleaned up sessionStorage before OAuth redirect');
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl
    }
  });

  if (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }

  return data;
};


// export const signInWithGoogle = async () => {
//   // Add console logs for debugging
//   console.log('🔍 Google OAuth starting...');
  
//   // Store the intended destination before OAuth redirect
//   const from = sessionStorage.getItem('auth_redirect_from');
//   console.log('🔍 Retrieved auth_redirect_from:', from);
  
//   if (from) {
//     sessionStorage.setItem('google_oauth_return_to', from);
//     console.log('✅ Set google_oauth_return_to:', from);
//   }
  
//   const currentUrl = window.location.href;
//   const currentOrigin = window.location.origin;

//   // Use stored destination or fall back to current URL logic
//   const storedDestination = sessionStorage.getItem('google_oauth_return_to');
//   console.log('🔍 storedDestination:', storedDestination);
  
//   const redirectUrl = storedDestination 
//     ? `${currentOrigin}${storedDestination}`
//     : (currentUrl.includes('quest') || currentUrl.includes('quest-result') || currentUrl.includes('affiliates')
//         ? currentUrl
//         : currentOrigin);

//   console.log('🎯 Final redirectUrl:', redirectUrl);

//   const { data, error } = await supabase.auth.signInWithOAuth({
//     provider: 'google',
//     options: {
//       redirectTo: redirectUrl
//     }
//   });

//   if (error) {
//     console.error('Error signing in with Google:', error);
//     throw error;
//   }

//   return data;
// };
