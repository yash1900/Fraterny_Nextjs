import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabase';

// Fallback admin emails in case database is unavailable
const FALLBACK_ADMIN_EMAILS = ['malhotrayash1900@gmail.com', 'indranilmaiti16@gmail.com', 'adityasingh7402@gmail.com'];

/**
 * Hook to manage auth state with Supabase
 */
export function useAuthState() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Function to check if user is admin via API
  const checkAdminStatus = async (email: string | undefined): Promise<boolean> => {
    if (!email) return false;
    
    try {
      const response = await fetch(`/api/admin/emails/check?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      
      if (data.success) {
        return data.isAdmin;
      }
      
      // Fallback if API call fails
      return FALLBACK_ADMIN_EMAILS.includes(email);
    } catch (error) {
      console.warn('Failed to check admin status, using fallback:', error);
      // Fallback to hardcoded emails if anything fails
      return FALLBACK_ADMIN_EMAILS.includes(email);
    }
  };

  useEffect(() => {
    // Get initial session first
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
          const adminStatus = await checkAdminStatus(initialSession.user?.email);
          setIsAdmin(adminStatus);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Set up auth state listener for future changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      // console.log('Auth state change event:', event);
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      // Check admin status asynchronously without blocking
      if (newSession?.user?.email) {
        checkAdminStatus(newSession.user.email).then(adminStatus => {
          setIsAdmin(adminStatus);
        }).catch(error => {
          console.warn('Admin status check failed:', error);
          setIsAdmin(FALLBACK_ADMIN_EMAILS.includes(newSession.user.email!));
        });
      } else {
        setIsAdmin(false);
      }
    });

    // Get initial session
    getInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    session,
    isLoading,
    isAdmin
  };
}
