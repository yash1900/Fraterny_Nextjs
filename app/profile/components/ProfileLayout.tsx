'use client'

import React from 'react';

interface ProfileLayoutProps {
  children: React.ReactNode;
}

const ProfileLayout = ({ children }: ProfileLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full bg-white shadow-sm overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default ProfileLayout;