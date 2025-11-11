'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import ProfileLayout from '../components/ProfileLayout';
import ProfileHeader from '../components/ProfileHeader';
import ProfileNavigation from '../components/ProfileNavigation';

// ============================================
// TYPE DEFINITIONS
// ============================================

type ProfileContextType = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

interface ProfileClientLayoutProps {
  children: React.ReactNode;
  user: User;
}

// ============================================
// CONTEXT SETUP
// ============================================

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const VALID_TABS = ['overview', 'history', 'application', 'security'] as const;

// ============================================
// CLIENT COMPONENT
// ============================================

export default function ProfileClientLayout({ 
  children, 
  user 
}: ProfileClientLayoutProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get tab from URL query params
  const tabParam = searchParams.get('tab') || 'overview';
  const initialTab = VALID_TABS.includes(tabParam as any) ? tabParam : 'overview';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Update state when URL changes
  useEffect(() => {
    const newTab = searchParams.get('tab') || 'overview';
    if (VALID_TABS.includes(newTab as any)) {
      setActiveTab(newTab);
    }
  }, [searchParams]);
  
  // Fallback: client-side auth check (belt & suspenders)
  useEffect(() => {
    if (!user) {
      sessionStorage.setItem('auth_redirect_from', '/profile');
      router.push('/auth');
    }
  }, [user, router]);
  
  return (
    <ProfileContext.Provider value={{ activeTab, setActiveTab }}>
      <ProfileLayout>
        <ProfileHeader />
        <ProfileNavigation activeTab={activeTab} />
        {children}
      </ProfileLayout>
    </ProfileContext.Provider>
  );
}

// ============================================
// CONTEXT HOOK
// ============================================

export function useProfileContext() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfileContext must be used within ProfileClientLayout');
  }
  return context;
}