'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, Mail, Phone, Calendar, Shield, CheckCircle, Clock, 
  XCircle, MapPin, Briefcase, Building, Bell, Edit
} from 'lucide-react';
import { useAuth } from '../../../app/auth/cotexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface ProfileStatsCardProps {
  variant?: 'compact' | 'detailed';
  className?: string;
  onEditClick?: () => void;
}

export default function ProfileStatsCard({ 
  variant = 'detailed', 
  className = '',
  onEditClick
}: ProfileStatsCardProps) {

  const { user, isLoading } = useAuth();
  const router = useRouter();

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  // 🟡 Step 1: Loading Skeleton (keep as is)
  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm animate-pulse"
      >
        <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-8"></div>
        <div className="space-y-6">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-navy/10 dark:bg-navy/30"></div>
              <div className="flex-1">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-2"></div>
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  // 🟠 Step 2: Handle no user (without blocking re-render)
  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-lg p-6 border border-yellow-200 dark:border-yellow-800/50"
      >
        <h3 className="font-semibold mb-2 text-lg">Loading user profile...</h3>
        <p className="text-sm">If this takes too long, try refreshing or logging in again.</p>
      </motion.div>
    );
  }

  // 🟢 Step 3: User is available, render full profile
  const userMetadata = user.user_metadata || {};

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const profileSections = [
    {
      id: 'personal',
      title: 'Personal Information',
      items: [
        {
          id: 'name',
          label: 'Full Name',
          value: `${userMetadata.first_name || ''} ${userMetadata.last_name || ''}`.trim() || 'Not provided',
          icon: User,
          color: 'text-navy',
          bgColor: 'bg-navy/10',
        },
        {
          id: 'email',
          label: 'Email Address',
          value: user.email || 'Not provided',
          verified: userMetadata.email_verified || false,
          icon: Mail,
          color: 'text-terracotta',
          bgColor: 'bg-terracotta/10',
        },
        {
          id: 'phone',
          label: 'Phone Number',
          value: userMetadata.phone || 'Not provided',
          verified: userMetadata.phone_verified || false,
          icon: Phone,
          color: 'text-gold',
          bgColor: 'bg-gold/10',
        }
      ]
    },
    {
      id: 'professional',
      title: 'Professional Information',
      items: [
        {
          id: 'location',
          label: 'Location',
          value: userMetadata.location || 'Not provided',
          icon: MapPin,
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50',
        },
        {
          id: 'job_title',
          label: 'Job Title',
          value: userMetadata.job_title || 'Not provided',
          icon: Briefcase,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
        },
        {
          id: 'company',
          label: 'Company',
          value: userMetadata.company || 'Not provided',
          icon: Building,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
        }
      ]
    },
    {
      id: 'account',
      title: 'Account Information',
      items: [
        {
          id: 'member_since',
          label: 'Member Since',
          value: formatDate(user.created_at),
          icon: Calendar,
          color: 'text-navy',
          bgColor: 'bg-navy/10',
        },
        {
          id: 'last_sign_in',
          label: 'Last Sign In',
          value: formatDate(user.last_sign_in_at || user.created_at),
          icon: Clock,
          color: 'text-terracotta',
          bgColor: 'bg-terracotta/10',
        },
        {
          id: 'notification_preference',
          label: 'Notification Preference',
          value:
            userMetadata.notification_preference === 'all'
              ? 'All Notifications'
              : userMetadata.notification_preference === 'important'
              ? 'Important Only'
              : userMetadata.notification_preference === 'none'
              ? 'No Notifications'
              : 'All Notifications',
          icon: Bell,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
        }
      ]
    }
  ];

  const userBio = userMetadata.bio || '';

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className={` bg-white mx-auto dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-cyan-600 to-blue-800 p-6 md:p-8 text-white">
        <div className="flex justify-between items-start">
          <motion.div variants={itemVariants} className="flex-1">
            <h2 className="text-2xl md:text-3xl font-gilroy-bold mb-2 text-shadow-lg">Account Information</h2>
            <p className="text-sm md:text-base font-gilroy-medium text-white/80 text-shadow-lg">
              Your personal details and account status
            </p>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Button 
              size="sm"
              className="font-gilroy-semibold tracking-[-0.8px] bg-white/20 hover:bg-white/30 text-white shadow-md hover:shadow-xl"
              onClick={() => router.push('/profile?tab=security')}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </motion.div>
        </div>

        <motion.div 
          variants={itemVariants}
          className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/10"
        >
          <Shield className="h-4 w-4 mr-2" />
          <span className='font-gilroy-bold tracking-[-0.2px]'>
            Account Status: {userMetadata.email_verified ? 'Verified' : 'Awaiting Verification'}
          </span>
          {userMetadata.email_verified ? (
            <CheckCircle className="h-4 w-4 ml-2 text-green-300" />
          ) : (
            <XCircle className="h-4 w-4 ml-2 text-amber-300" />
          )}
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="px-6 md:px-8 pt-6 pb-8">
        {userBio && (
          <motion.div 
            variants={itemVariants}
            className="mb-8 pb-6 border-b border-slate-200 dark:border-slate-700"
          >
            <h3 className="text-lg font-medium text-navy mb-3">About</h3>
            <p className="text-gray-700 dark:text-gray-300">{userBio}</p>
          </motion.div>
        )}

        {/* Sections */}
        <div className="space-y-8">
          {profileSections.map((section) => (
            <motion.div key={section.id} variants={itemVariants} className="space-y-4">
              <h3 className="font-gilroy-bold text-lg text-navy border-b border-slate-200 dark:border-slate-700 pb-2">
                {section.title}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6">
                {section.items.map((item) => (
                  <div key={item.id} className="flex space-x-4">
                    <div className={`p-3 h-10 w-10 rounded-full flex-shrink-0 ${item.bgColor}`}>
                      <item.icon className={`h-4 w-4 ${item.color}`} />
                    </div>
                    <div>
                      <div className="font-gilroy-regular text-sm text-gray-500 dark:text-slate-400">
                        {item.label}
                      </div>
                      <div className="font-gilroy-semibold text-navy dark:text-white">
                        {item.value}
                      </div>
                      {'verified' in item && (
                        <div className="mt-1">
                          {item.verified ? (
                            <span className="flex items-center text-xs text-green-600 dark:text-green-400">
                              <CheckCircle className="w-3 h-3 mr-1" /> Verified
                            </span>
                          ) : (
                            <span className="flex items-center text-xs text-amber-600 dark:text-amber-400">
                              <XCircle className="w-3 h-3 mr-1" /> Not verified
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Missing Info Prompt */}
        {(!userMetadata.first_name || !userMetadata.phone || !userMetadata.location || !userMetadata.job_title || !userMetadata.company) && (
          <motion.div 
            variants={itemVariants}
            className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800/50"
          >
            <div className="flex items-center">
              <div className="ml-3">
                <h3 className="text-sm font-gilroy-regular text-amber-800 dark:text-amber-300">
                  Your profile is incomplete
                </h3>
                <div className="mt-2 text-sm font-gilroy-semibold text-amber-700 dark:text-amber-400">
                  <p>Complete your profile to get the most out of your experience.</p>
                </div>
              </div>
              <div className="ml-auto pl-3">
                <Button
                  onClick={() => router.push('/profile?tab=security')}
                  size="sm"
                  className="font-gilroy-semibold tracking-[-1px] bg-amber-300 shadow-md border-amber-500 hover:bg-amber-400 hover:shadow-xl text-amber-800"
                >
                  Complete Profile
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
