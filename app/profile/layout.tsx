'use client';

import { redirect } from 'next/navigation';
import ProfileClientLayout from './contexts/profile-client';
import { useAuth } from '../auth/cotexts/AuthContext';
import type { ReactNode } from 'react';

interface ProfileLayoutProps {
  children: ReactNode;
}

export default function ProfileLayout({
  children,
}: ProfileLayoutProps) {
  // Server-side auth check
  const { user } = useAuth();

  // Redirect on server if not authenticated
  if (!user) {
    redirect('/auth');
  }

  // Pass user data to client component
  return (
    <ProfileClientLayout user={user}>
      {children}
    </ProfileClientLayout>
  );
}