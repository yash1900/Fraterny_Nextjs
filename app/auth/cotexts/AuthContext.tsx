'use client';


import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { useAuthState } from '../hooks/use-auth-state';
import { signIn as authSignIn, signUp as authSignUp, signOut as authSignOut, resendVerificationEmail as authResendVerificationEmail, signInWithGoogle as authSignInWithGoogle } from '@/app/auth/utils/auth';
import { AuthContextType } from '@/app/auth/types/auth';
import { User } from '@supabase/supabase-js';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user: initialUser, session: initialSession, isLoading: initialLoading, isAdmin: initialIsAdmin } = useAuthState();
  const [authState, setAuthState] = useState({
    ready: false,
    loading: true,
    user: initialUser,
    session: initialSession,
    isAdmin: initialIsAdmin,
    error: null as string | null,
  });
  
  // Get navigate and location safely
  const router = useRouter();
  const pathname = usePathname();

  // Centralized verification logic - only processes actual verification tokens
  const handleVerificationRedirect = useCallback(async () => {
  if (typeof window === 'undefined') return;
  
  // Only process if there's actually a verification token
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const accessToken = hashParams.get('access_token');
  const refreshToken = hashParams.get('refresh_token');
  const type = hashParams.get('type');
  
  if (!accessToken || !(type === 'signup' || type === 'recovery' || type === 'invite')) {
    return; // No verification needed, don't reset state
  }
  
  setAuthState(s => ({ ...s, loading: true, error: null }));
  
  try {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || '',
    });
    if (error) {
      setAuthState(s => ({ ...s, loading: false, error: 'Failed to verify email. Please try again.' }));
      return;
    }
    if (data?.session) {
      window.history.replaceState(null, '', window.location.pathname);
      // Refresh user
      const { data: refreshData } = await supabase.auth.getUser();
      setAuthState(s => ({
        ...s,
        user: refreshData?.user || null,
        session: data.session,
        isAdmin: refreshData?.user?.email ? ['malhotrayash1900@gmail.com'].includes(refreshData.user.email) : false,
        ready: true,
        loading: false,
        error: null,
      }));
      return;
    }
  } catch (error) {
    setAuthState(s => ({ ...s, loading: false, error: 'Error handling verification. Please try again.' }));
  }
}, []); // Empty dependency array - no location needed

  // Run verification on mount/location change
  useEffect(() => {
    handleVerificationRedirect();
  }, [handleVerificationRedirect]);

  // Ensure auth is marked as ready once we have a definitive user state
  useEffect(() => {
    if (!initialLoading) {
      setAuthState(s => ({ 
        ...s, 
        ready: true, 
        loading: false, 
        user: initialUser, 
        session: initialSession, 
        isAdmin: initialIsAdmin 
      }));
    }
  }, [initialLoading, initialUser, initialSession, initialIsAdmin]);


  

  // Retry function for verification
  const retryVerification = useCallback(() => {
    handleVerificationRedirect();
  }, [handleVerificationRedirect]);


const signIn = async (email: string, password: string) => {
  const result = await authSignIn(email, password);
  
  const { data } = await supabase.auth.getUser();
  
  setAuthState(s => ({ 
    ...s, 
    user: result.user,
    session: result.session,
    isAdmin: result.user?.email ? ['malhotrayash1900@gmail.com'].includes(result.user.email) : false
  }));
  
  // Add console.log here
  console.log('🧹 Cleaning up sessionStorage...');
  sessionStorage.removeItem('auth_redirect_from');
  sessionStorage.removeItem('google_oauth_return_to');
  console.log('✅ Cleanup done');
};  


const signUp = authSignUp;
  
  const signOut = async () => {
    await authSignOut();
    router.push('/');
    setAuthState(s => ({ ...s, user: null, session: null, isAdmin: false }));
  };
  
  const resendVerificationEmail = authResendVerificationEmail;

  // Add this new function here:
  const signInWithGoogle = async () => {
    const result = await authSignInWithGoogle();
    // The OAuth redirect will handle the rest automatically
    return result;
  };

  const value = {
    user: authState.user as User | null,
    session: authState.session,
    isLoading: authState.loading,
    isAdmin: authState.isAdmin,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    resendVerificationEmail,
    authReady: authState.ready,
    error: authState.error,
    retryVerification,
  } as AuthContextType;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}