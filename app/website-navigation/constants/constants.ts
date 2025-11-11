// Navigation Constants for Next.js Migration
// This file centralizes all navigation links used across the application

export interface NavLink {
  name: string;
  href: string;
  external?: boolean;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
}

// Main navigation links (Header - Desktop & Mobile)
export const MAIN_NAV_LINKS: NavLink[] = [
  { name: 'FratVilla', href: '/experience' },
  { name: 'Quest', href: '/quest' },
  { name: 'Blog', href: '/blog' },
  { name: 'FAQ', href: '/faq' },
];

// Footer navigation links
export const FOOTER_NAV_LINKS: NavLink[] = [
  { name: 'FratVilla', href: '/experience' },
  { name: 'Quest', href: '/quest' },
  { name: 'Process', href: '/process' },
  { name: 'FAQ', href: '/faq' },
];

// Admin navigation links (only visible to admin users)
export const ADMIN_NAV_LINKS: NavLink[] = [
  { name: 'Admin Dashboard', href: '/admin/dashboard', requiresAdmin: true },
];

// User-specific links (visible when logged in)
export const USER_NAV_LINKS: NavLink[] = [
  { name: 'Your Profile', href: '/profile', requiresAuth: true },
];

// Auth links
export const AUTH_NAV_LINKS = {
  signIn: { name: 'Sign In', href: '/auth' },
};

// Helper function to get sign-in link with redirect
export const getSignInLinkWithRedirect = (currentPath: string): string => {
  return `/auth?from=${encodeURIComponent(currentPath)}`;
};