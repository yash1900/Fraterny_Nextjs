'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/auth/cotexts/AuthContext';
import { getInfluencerByEmail, updateInfluencerLocation } from '@/lib/services/influencer';
import { getUserLocation } from '@/lib/services/location';
import { Users, TrendingUp, DollarSign, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AffiliatesPage() {
  const { user, isLoading: authLoading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    // If user is logged in, check if they're an influencer
    if (user && user.email && !authLoading) {
      checkInfluencerAccess(user.email);
    }
  }, [user, authLoading]);

  const checkInfluencerAccess = async (email: string) => {
    setChecking(true);
    try {
      const response = await getInfluencerByEmail(email);
      
      if (response.success && response.data) {
        // User is an influencer
        const influencer = response.data;
        
        // Detect and save location if not already set
        if (influencer.is_india === null || influencer.is_india === undefined) {
          try {
            console.log('🌍 Detecting influencer location...');
            const locationData = await getUserLocation();
            console.log('🌍 Location detected:', locationData);
            
            // Update influencer with location
            await updateInfluencerLocation(influencer.id, locationData.isIndia);
            console.log('✅ Influencer location saved:', locationData.isIndia ? 'India' : 'International');
          } catch (error) {
            console.error('❌ Failed to detect/save location:', error);
            // Continue to dashboard even if location detection fails
          }
        }
        
        // Redirect to dashboard
        router.push('/affiliates/dashboard');
      } else {
        // User is not an influencer
        toast.error('Access Denied', {
          description: 'You are not registered as an influencer. Please contact the admin.',
        });
      }
    } catch (error) {
      console.error('Error checking influencer access:', error);
      toast.error('Error', {
        description: 'Failed to verify influencer status',
      });
    } finally {
      setChecking(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // After OAuth redirect, the useEffect will check influencer status
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      toast.error('Sign In Failed', {
        description: error.message || 'Failed to sign in with Google',
      });
    }
  };

  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-4">
              Affiliate Dashboard
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Track your performance, earnings, and grow your income
            </p>
          </div>

          {/* Stats Preview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-medium">Track Clicks</h3>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">Real-time</p>
              <p className="text-sm text-gray-500 mt-2">Monitor every click on your affiliate links</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-medium">Track Sales</h3>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">Conversions</p>
              <p className="text-sm text-gray-500 mt-2">See detailed conversion funnels</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-medium">Earn Money</h3>
                <DollarSign className="h-8 w-8 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">Commissions</p>
              <p className="text-sm text-gray-500 mt-2">Get paid for every successful referral</p>
            </motion.div>
          </div>

          {/* Sign In Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-12 shadow-xl border border-gray-100 text-center"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Sign in to Your Dashboard
            </h2>
            <p className="text-gray-600 mb-8">
              Access your affiliate dashboard to track performance and earnings
            </p>

            <button
              onClick={handleGoogleSignIn}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm hover:shadow-md"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>

            <p className="text-sm text-gray-500 mt-6">
              Only registered influencers can access the dashboard.
              <br />
              Contact the admin to become an affiliate partner.
            </p>
          </motion.div>

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-16 text-center"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              What You&apos;ll Get
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <div className="text-left p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-2">📊 Real-time Analytics</h4>
                <p className="text-gray-600 text-sm">
                  Track clicks, signups, and conversions in real-time with detailed charts
                </p>
              </div>
              <div className="text-left p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-2">💰 Commission Tracking</h4>
                <p className="text-gray-600 text-sm">
                  Monitor your earnings and commission rates for every sale
                </p>
              </div>
              <div className="text-left p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-2">🔗 Unique Affiliate Links</h4>
                <p className="text-gray-600 text-sm">
                  Get your personalized tracking link with QR code for easy sharing
                </p>
              </div>
              <div className="text-left p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-2">📈 Conversion Funnel</h4>
                <p className="text-gray-600 text-sm">
                  Understand your audience with detailed conversion funnel analysis
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
