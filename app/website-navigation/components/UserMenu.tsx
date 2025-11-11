// UserMenu.tsx - User Dropdown Menu Component for Next.js
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '../../auth/cotexts/AuthContext';
import { ADMIN_NAV_LINKS } from '../constants/constants';
import { toast } from 'sonner';

interface UserMenuProps {
  isScrolled: boolean;
}

const UserMenu: React.FC<UserMenuProps> = ({ isScrolled }) => {
  const { user, signOut, isAdmin } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (err) {
      console.error('Error signing out:', err);
      toast.error('Sign out failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center space-x-2 focus:outline-none"
          aria-label="User menu"
        >
          <div
            className={`w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center ${
              isScrolled ? 'text-navy' : 'text-navy'
            }`}
          >
            {user?.user_metadata?.first_name ? (
              <span className="text-white font-medium">
                {user.user_metadata.first_name.charAt(0).toUpperCase()}
              </span>
            ) : (
              <User size={18} className="text-white" />
            )}
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-48">
        <DropdownMenuLabel className="text-sm px-4">
          <Link href="/profile" className="flex items-center space-x-2 hover:text-primary">
            Your Profile
          </Link>
          <div className="text-xs text-gray-500 mt-1">
            {isAdmin ? 'Administrator' : 'User'}
          </div>
        </DropdownMenuLabel>

        {isAdmin && ADMIN_NAV_LINKS.length > 0 && (
          <>
            <DropdownMenuSeparator />
            {ADMIN_NAV_LINKS.map((link) => (
              <DropdownMenuItem
                key={link.name}
                onClick={() => handleNavigation(link.href)}
                className="cursor-pointer"
              >
                {link.name}
              </DropdownMenuItem>
            ))}
          </>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer"
          disabled={loading}
        >
          <LogOut size={16} className="mr-2" />
          {loading ? 'Signing out...' : 'Sign Out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;