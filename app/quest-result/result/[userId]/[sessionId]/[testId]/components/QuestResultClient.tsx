// QuestResultClient.tsx
'use client';

import React, { useState, useRef, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Quote, Film as FilmIcon, BookOpen, Share2, Send, ThumbsUp,
    ThumbsDown,
    ChevronsUp,
    BookmarkPlus,
    Star,
    ScrollText
 } from 'lucide-react';
import Image from 'next/image';
import { ResultData, Film, Book, DualGatewayPricingData } from '../utils/types';
import { tokens, CTA_HEIGHT } from '../utils/constants';
import { sectionIds } from '../utils/sectionHelpers';
import { AuthBanner } from './AuthBanner';
import { ProgressRail } from './ProgressRail';
import { StickyCTA } from './StickyCTA';
import { PaymentSuccessMessage } from './PaymentSuccessMessage';
import { UpsellSheet } from './UpsellSheet';
import { InsightModal } from './InsightModal';
import { FilmModal } from './FilmModal';
import { BookModal } from './BookModal';
import { FeedbackPopup } from './FeedbackPopUp';
import { PDFImageViewer } from './PDFImageViewer';
import { AstrologyModal } from './AstrologyModal';
import { FindingModal } from './FindingModal';
import { PaymentSuccessPopup } from './PaymentSuccessPopup';
import { SectionFrame } from './SectionFrame';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '@/app/auth/cotexts/AuthContext';
import { googleAnalytics } from '@/lib/services/googleAnalytics';
import { fetchDynamicPricing, checkExistingPaymentStatus, startPaymentStatusPolling } from '../utils/paymentHelpers';
import { log } from 'console';

interface QuestResultClientProps {
  initialData: ResultData | null;
  userId: string;
  sessionId: string;
  testId: string;
}

interface User {
  id: string;
  email?: string; // Make email optional to match Supabase
  name?: string;
  // Add other properties you might need
  user_metadata?: any;
  app_metadata?: any;
}


export function QuestResultClient({ 
  initialData, 
  userId, 
  sessionId, 
  testId 
}: QuestResultClientProps) {
  const [resultData] = useState<ResultData | null>(initialData);
  const [activeIndex, setActiveIndex] = useState(0);
  const [upsellOpen, setUpsellOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [findingModalOpen, setFindingModalOpen] = useState(false);
  const [selectedFindingIndex, setSelectedFindingIndex] = useState<number | null>(null);
  const [filmModalOpen, setFilmModalOpen] = useState(false);
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [feedbackPopupOpen, setFeedbackPopupOpen] = useState(false);
  const [hasTriggeredFeedback, setHasTriggeredFeedback] = useState(false);
  const [showFeedbackStar, setShowFeedbackStar] = useState(false);
  const [tip, setTip] = useState<string | null>(null);
  const [selectedInsight, setSelectedInsight] = useState<{ index: number; text: string } | null>(null);
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedPrediction, setSelectedPrediction] = useState<any>(null);
  const [selectedFinding, setSelectedFinding] = useState<string | null>(null);
  const router = useRouter();
  const getEffectiveUserId = () => {
    return userId;
  };
  const [assessmentPaymentStatus, setAssessmentPaymentStatus] = useState<{
    ispaymentdone: "success" | null;
    quest_pdf: string;
    quest_status: "generated" | "working" | null;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  //cast the user to User type
  const { user, signInWithGoogle } = useAuth();
  const stopPollingRef = useRef<(() => void) | null>(null);
  const hasResumedPayment = useRef<boolean>(false);
  const hasTrackedSignup = useRef<boolean>(false);

  // Dynamic pricing state
  const [pricing, setPricing] = useState<DualGatewayPricingData>({
    razorpay: {
      main: '₹299',
      original: '₹999',
      currency: 'INR',
      symbol: '₹',
      amount: 299,
      isIndia: true,
      isLoading: true
    },
    paypal: {
      main: '$5',
      original: '$15',
      currency: 'USD',
      amount: 5,
      isIndia: false
    },
    isLoading: true
  });

  const handleCloseSuccessPopup = () => {
    setShowSuccessPopup(false);
  };

  // Check for pending payment context after auth and auto-resume + redirect URL
  useEffect(() => {
    const resumePendingPayment = async () => {
      // Only run if user is authenticated
      if (!user) {
        console.log('🔴 No user yet, skipping payment resume check');
        return;
      }

      console.log(`🔄 Redirecting from anonymous to authenticated user URL ${user.id}`);

      // Redirect from anonymous URL to authenticated user URL
      if (userId === 'anonymous' && user.id) {
        console.log(`🔄 Redirecting from anonymous to authenticated user URL ${user.id}`);
        const authUserId = user.id;
        const username = user.user_metadata?.full_name || 'User';
        const email = user.email || '';
        console.log('💾 Saving session for user:', { sessionId, testId, authUserId });

        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/saveusingsignin`,
            { sessionId, testId, userId: authUserId, username, email }
          );
          console.log('✅ Session saved:', response.data);
          toast.success('Your results have been saved!');
        } catch (error) {
          console.error('❌ Failed to save session:', error);
          toast.error('Failed to save your results. Please try again.');
        }
        const newUrl = `/quest-result/result/${user.id}/${sessionId}/${testId}`;
        router.push(newUrl);
        return; // Exit early, will re-run after redirect
      }

      // Prevent duplicate resumes on tab focus/visibility changes
      if (hasResumedPayment.current) {
        console.log('⏭️ Payment already resumed, skipping duplicate execution');
        return;
      }

      try {
        const { getPaymentContext, clearPaymentContext } = await import('@/app/payment-gateway/shared/paymentApi');
        const paymentContext = getPaymentContext();
        
        if (paymentContext) {
          console.log('🔄 Found pending payment context after auth:', paymentContext);
          
          // Mark as resumed and clear context IMMEDIATELY to prevent refresh from re-triggering
          hasResumedPayment.current = true;
          clearPaymentContext();
          console.log('🧼 Payment context cleared from localStorage - refresh won\'t re-trigger payment');
          
          // Small delay to ensure UI is ready
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Resume the payment (pass flag to prevent re-storing context)
          console.log('▶️ Resuming payment with gateway:', paymentContext.gateway);
          toast.info('Resuming your payment...', {
            position: "top-right"
          });
          await handlePayment(paymentContext.gateway, true); // true = isResuming
        } else {
          console.log('✅ User authenticated, no pending payment to resume');
        }
      } catch (error) {
        console.error('❌ Error resuming pending payment:', error);
      }
    };

    resumePendingPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Fetch dynamic pricing on mount
  useEffect(() => {
    const loadPricing = async () => {
      try {
        const dynamicPricing = await fetchDynamicPricing();
        setPricing(dynamicPricing);
      } catch (error) {
        console.error('Failed to load dynamic pricing:', error);
        // Keep fallback pricing
      }
    };
    
    loadPricing();
  }, []);

  // Check for existing payment status on mount
  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const existingStatus = await checkExistingPaymentStatus(sessionId, testId);
        
        if (existingStatus?.ispaymentdone === 'success') {
          console.log('💳 Found existing payment:', existingStatus);
          setAssessmentPaymentStatus(existingStatus);
          setPaymentSuccess(true);
        }
      } catch (error) {
        console.error('Error checking existing payment:', error);
      }
    };
    checkPaymentStatus();
  }, [sessionId, testId, user?.id]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (stopPollingRef.current) {
        stopPollingRef.current();
      }
    };
  }, []);

  // Track affiliate signup for logged-in users on result page
  useEffect(() => {
    const trackAffiliateSignupIfNeeded = async () => {
      // Prevent duplicate tracking
      if (hasTrackedSignup.current) {
        console.log('⏭️ Affiliate signup already tracked in this session, skipping');
        return;
      }
      
      // Only track if user is logged in and there's an affiliate code
      if (!user?.id || userId === 'anonymous') return;
      
      const referredBy = localStorage.getItem('referred_by');
      if (!referredBy) return;
      
      try {
        console.log('📊 Tracking affiliate signup for logged-in user:', {
          userId: user.id,
          affiliateCode: referredBy,
          sessionId,
          testId
        });
        
        const response = await fetch('/api/tracking/affiliate/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            session_id: sessionId,
            test_id: testId,
            affiliate_code: referredBy,
            ip_address: null,
            device_info: null,
            location: null,
            metadata: {
              signup_time: new Date().toISOString(),
              source: 'quest_completion_logged_in'
            }
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          console.log('✅ Affiliate signup tracked successfully');
          hasTrackedSignup.current = true; // Mark as tracked
          // Don't clear referred_by yet - only clear after purchase
        } else if (result.skipped) {
          console.log('⏭️ Signup already tracked, skipping');
          hasTrackedSignup.current = true; // Mark as tracked even if skipped
        } else {
          console.error('❌ Failed to track affiliate signup:', result.error);
        }
      } catch (error) {
        console.error('❌ Error tracking affiliate signup:', error);
      }
    };
    
    trackAffiliateSignupIfNeeded();
  }, [user, userId, sessionId, testId]);

  // Cleanup quest-related localStorage after successfully reaching result page
  useEffect(() => {
    const cleanupQuestData = () => {
      console.log('🧹 Cleaning up quest data after successful completion...');
      
      const keysToCleanup = [
        'fraterny_quest_session',
        'fraterny_quest_responses',
        'questSessionId',
        'testid',
        'fraterny_device_backup'
      ];
      
      // Clean up specific keys
      keysToCleanup.forEach(key => {
        const removed = localStorage.getItem(key);
        if (removed) {
          localStorage.removeItem(key);
          console.log(`🗑️ Removed: ${key}`);
        }
      });
      
      // Also clean up any quest_tags_* keys
      const allKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('quest_tags_')) {
          allKeys.push(key);
        }
      }
      
      allKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🗑️ Removed tag: ${key}`);
      });
      
      // Clear payment context from sessionStorage
      sessionStorage.removeItem('payment_context');
      sessionStorage.removeItem('session_data');
      
      console.log('✅ Quest data cleanup complete');
    };
    
    // Run cleanup on mount
    cleanupQuestData();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const sections = container.querySelectorAll('[id]');
      let currentIndex = 0;

      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
          currentIndex = index;
        }
      });

      setActiveIndex(currentIndex);

      // Show feedback popup after 2 seconds when user reaches subjects section (index 3)
      if (currentIndex >= 3 && !hasTriggeredFeedback) {
        setHasTriggeredFeedback(true);
        setTimeout(() => {
          setFeedbackPopupOpen(true);
        }, 2000);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasTriggeredFeedback]);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      // send the userdata to the backend to associate the session
      if (user?.id) {
        const userId = user?.id
        const username = user.user_metadata.full_name;
        const email = user?.email || '';
        //console.log('User signed in:', user.user_metadata.full_name, user.email);
        console.log('Associating session with user after sign-in:', { sessionId, testId, userId, username, email });
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/saveusingsignin`, {
          sessionId,
          testId,
          userId,
          username,
          email
        });
        console.log('Sign-in association response:', response);

      }
    } catch (error) {
      console.error('Sign-in error:', error);
      toast.error('Sign-in failed. Please try again.', {
        position: "top-right"
      });
    }
  };


  const handleAuthAction = () => {
    if (user) {
      router.push(`/profile?tab=history`); // or wherever your dashboard is
    } else {
      handleSignIn();
    }
  };


  const handlePayment = async (gateway: 'razorpay' | 'paypal', isResuming: boolean = false) => {
    setPaymentLoading(true);
    
    try {
      console.log(`💳 Initiating ${gateway} payment... (isResuming: ${isResuming})`);

      // Check if user is authenticated
      if (!user) {
        console.log('👤 User not authenticated, initiating sign-in and save flow...');
        
        // Store payment context BEFORE redirecting to auth
        const { storePaymentContext } = await import('@/app/payment-gateway/shared/paymentApi');
        storePaymentContext(sessionId, testId, gateway);
        console.log('💾 Stored payment context for gateway:', gateway);
        
        toast.info('Signing in to save your results and continue payment...', {
          position: "top-right"
        });

        // Trigger Google sign-in (redirect-based)
        await signInWithGoogle();
        await new Promise(resolve => setTimeout(resolve, 1000));

        const signedInUser = user as User | null;
        console.log('👤 User signed in:', signedInUser);
        if (signedInUser?.id) {
          const userId = signedInUser?.id;
          const username = signedInUser?.user_metadata?.first_name
            ? `${signedInUser.user_metadata.first_name} ${signedInUser.user_metadata.last_name || ''}`.trim()
            : 'User';
          const email = signedInUser?.email || '';
          
          console.log('💾 Saving assessment results after sign-in:', { sessionId, testId, userId, username, email });
          
          // Save the assessment results
          const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/saveusingsignin`, {
            sessionId,
            testId,
            userId,
            username,
            email
          });
          
          console.log('✅ Assessment saved:', response);
          toast.success('Results saved! Resuming payment...', {
            position: "top-right"
          });
          
          // Continue with payment flow below (don't return)
        } else {
          // Sign-in failed or cancelled
          setPaymentLoading(false);
          toast.error('Sign-in required to proceed with payment', {
            position: "top-right"
          });
          return;
        }
      }
      
      // Only store payment context if this is NOT a resumed payment
      // (resumed payments already cleared context to prevent re-trigger on refresh)
      if (!isResuming) {
        const { storePaymentContext } = await import('@/app/payment-gateway/shared/paymentApi');
        storePaymentContext(sessionId, testId, gateway);
        console.log('💾 Stored payment context for potential resume');
      } else {
        console.log('⏭️ Skipping context storage - this is a resumed payment');
      }
      
      // Dynamically import the correct payment service
      let paymentResult;
      
      if (gateway === 'razorpay') {
        const { processRazorpayPayment } = await import('@/app/payment-gateway/razorpay/razorpayService');
        paymentResult = await processRazorpayPayment(sessionId, testId, user);
      } else {
        const { processPayPalPayment } = await import('@/app/payment-gateway/paypal/paypalService');
        paymentResult = await processPayPalPayment(sessionId, testId, user);
      }
      
      setPaymentLoading(false);
      
      // Handle payment result
      if (paymentResult.success) {
        console.log('✅ Payment successful, starting status polling...');
        setUpsellOpen(false);
        
        toast.success('Payment successful! Verifying...', {
          position: "top-right"
        });
        
        // Start polling for payment status verification
        const stopPolling = startPaymentStatusPolling(
          sessionId,
          testId,
          (status) => {
            // Status update callback
            if (status) {
              console.log('📊 Payment status update:', status);
              setAssessmentPaymentStatus(status);
            }
          },
          (completedStatus) => {
            // Payment completed callback
            console.log('✅ Payment verified!', completedStatus);
            setPaymentSuccess(true);
            setAssessmentPaymentStatus(completedStatus);
            setShowSuccessPopup(true);
            
            // Clear payment context after successful payment
            const clearContext = async () => {
              const { clearPaymentContext } = await import('@/app/payment-gateway/shared/paymentApi');
              clearPaymentContext();
              console.log('🧹 Cleared payment context after successful payment');
            };
            clearContext();
            
            toast.success('Payment verified successfully!', {
              position: "top-right",
              duration: 5000
            });
          },
          (error) => {
            // Error callback
            console.error('❌ Payment verification failed:', error);
            toast.error('Payment verification timeout. Please refresh the page.', {
              position: "top-right",
              duration: 10000
            });
          }
        );
        
        // Store cleanup function
        stopPollingRef.current = stopPolling;
        
      } else {
        // Payment failed or cancelled
        console.log('❌ Payment failed:', paymentResult.error);
        toast.error(paymentResult.error || 'Payment failed', {
          position: "top-right"
        });
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentLoading(false);
      toast.error(error?.message || 'Payment failed. Please try again.', {
        position: "top-right"
      });
    }
  };

  const handlePDFDownload = () => {
    if (!assessmentPaymentStatus?.quest_pdf) {
      toast.error('PDF not available');
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = assessmentPaymentStatus.quest_pdf;
      link.download = `Quest-Report-${sessionId}.pdf`;
      link.target = '_blank';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Downloading your PDF report!');
    } catch (error) {
      console.error('PDF download error:', error);
      window.open(assessmentPaymentStatus.quest_pdf, '_blank');
      toast.success('Opening your PDF report!');
    }
  };

  const handleCardClick = (index: number) => {
    const insight = mindCard?.insights[index];
    if (insight) {
      setSelectedInsight({ index, text: insight });
    }
  };

  if (!resultData) {
    return (
      <div className="h-screen bg-[#004A7F] flex items-center justify-center">
        <div className="text-center px-4">
          <h2 className="text-4xl font-gilroy-bold text-white mb-4">
            No results found
          </h2>
        </div>
      </div>
    );
  }

  const mindCard = resultData.results["Mind Card"];
  const findings = resultData.results.findings || [];
  const quotes = resultData.results.quotes || [];
  const films = resultData.results.films || [];
  const subjects = resultData.results.subjects || [];
  const books = resultData.results.books || [];
  const actionItem = resultData.results.actionItem || '';

  const mindStats = mindCard?.attributes.map((attr, index) => {
    const scoreText = mindCard.scores[index] || "0/100";
    const scoreValue = parseInt(scoreText.split('/')[0]);
    return {
      label: attr.charAt(0).toUpperCase() + attr.slice(1),
      value: scoreValue
    };
  }) || [];

  console.log(resultData.user_id);
  
  

  return (
    <div className="min-h-screen w-full bg-white text-gray-900">
      <AuthBanner
        onSignIn={handleAuthAction}
        onPayment={handlePayment}
        user={user}
        paymentLoading={paymentLoading}
        activeIndex={activeIndex}
      />

      <div
        ref={containerRef}
        className="w-full overflow-y-auto"
        style={{
          // iOS-friendly height and scrolling
          // Dynamic height: full height in PDF section, reduced height in other sections
          height: activeIndex === 9 ? '100dvh' : `calc(100dvh - ${CTA_HEIGHT}px)`,
          WebkitOverflowScrolling: 'touch',
          overscrollBehaviorY: 'none',
          overscrollBehaviorX: 'none',
          overscrollBehavior: 'none',
          touchAction: 'pan-y',
          // Softer snapping -> less "bounce"
          scrollSnapType: 'y mandatory',
          // Prevent elastic bounce
          position: 'relative',
          isolation: 'isolate'
        }}
      >
        {/* Emotional Section */}
        <SectionFrame
          id="emotional"
          title=""
          sub=""
          shareText={resultData.results["section 1"] || ""}
          themeKey="emotional"
          sessionId={sessionId}
          customClass="pt-16 pb-16 overflow-y-auto"
          testId={testId}
        >
          <div className="relative w-full max-w-[480px] mx-auto pt-4">
            <motion.h1 className="mb-5 text-left">
              <span className="block text-sm uppercase tracking-[0.3em] text-white/70 mb-1">Analysis Complete</span>
              <span className="block text-5xl font-gilroy-bold tracking-tighter bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
                Let's explore Your Mind
              </span>
              <span className="block mt-1 w-20 h-1 bg-white/50 rounded-full"></span>
            </motion.h1>

            <motion.div className="rounded-[28px] bg-white/10 backdrop-blur-xl ring-1 ring-white/20 p-6 text-white">
              <p className="text-sm text-white/80 font-gilroy-regular">Your mind, in one sentence.</p>
              <h2 className="mt-1 text-[44px] leading-[0.95] font-gilroy-bold tracking-tighter">Emotional<br />Mirror</h2>

              <div className="mt-2 rounded-3xl font-gilroy-regular bg-white text-slate-900 p-2 shadow-[0_10px_30px_rgba(0,0,0,.12)]">
                <p className="text-xl leading-tight p-2">{resultData.results["section 1"]}</p>
              </div>
            </motion.div>
          </div>
        </SectionFrame>

        {/* Mind Card Section */}
        <SectionFrame
          id="mind"
          title="Your Mind Card"
          sub="Archetype & stats"
          shareText={`${mindCard?.name || 'Mind Card'}; ${mindStats.map(s => `${s.label} ${s.value}`).join(', ')}.`}
          themeKey="mind"
          customClass="pt-16 pb-16 overflow-y-auto"
          sessionId={sessionId}
          testId={testId}
        >
          <div className="grid grid-rows-[auto_1fr] gap-4">
            {mindCard && (
              <>
                <div className="text-left">
                  <div className="text-teal-900 text-4xl font-normal font-gilroy-bold leading-7 pb-2 pt-2">{mindCard.name}</div>
                  <div className="text-white/80 text-base font-normal font-gilroy-regular leading-tight] ">{mindCard.personality}</div>
                </div>
                <div className="overflow-x-auto">
                  <div className="flex gap-4 pb-4" style={{ width: "max-content" }}>
                    {mindStats.map((stat, i) => {
                      const colors = [
                        { bg: "bg-red-800", decorative: "bg-red-400" },
                        { bg: "bg-purple-900", decorative: "bg-purple-100" },
                        { bg: "bg-stone-400", decorative: "bg-green-100" },
                        { bg: "bg-sky-500", decorative: "bg-sky-100" }
                      ];

                      return (
                        <div onClick={() => handleCardClick(i)} key={stat.label} className={`relative w-60 h-60 ${colors[i].bg} rounded-[10px] overflow-hidden`}>

                          {/* Title */}
                          <div className="absolute left-[20px] top-[30px] opacity-70 mix-blend-hard-light text-white text-3xl font-normal font-gilroy-bold leading-9">
                            {stat.label.split(' ').map((word, idx) => (
                              <div key={idx}>{word}</div>
                            ))}
                          </div>
                          <div className="flex justify-between items-end h-full pl-4">
                            {/* Percentage */}
                            <div className="opacity-90 text-white text-8xl font-normal font-gilroy-bold leading-[96.45px]">
                              {stat.value}%
                            </div>
                            {/* <div className="pb-2">
                                  <ChevronsUp className="h-8 w-8 text-white" />
                                </div> */}
                            <motion.div
                              animate={{ y: [0, -3, 0] }}
                              transition={{
                                duration: 2.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                              className="pb-2"
                            >
                              <ChevronsUp className="h-8 w-8 text-white" />
                            </motion.div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </SectionFrame>

        {/* Findings Section */}
        <SectionFrame
          id="findings"
          title="5 Unique Findings About You"
          sub="Thought Provoking Insights"
          shareText={findings.join("\n")}
          themeKey="findings"
          customClass="pt-14 pb-16 overflow-y-auto"
          sessionId={sessionId}
          testId={testId}
        >
          <div className="w-full">
            <div className="grid grid-cols-2 gap-3 auto-rows-min">
              {findings.slice(0, 4).map((finding, i) => (
                <div
                  key={i}
                  className="bg-[#7dc3e4] rounded-lg p-3 min-h-[80px] flex items-start cursor-pointer"
                  onClick={() => {
                    setSelectedFinding(finding);
                    setSelectedFindingIndex(i);
                    setFindingModalOpen(true);
                  }}
                >
                  <div className="text-white text-lg font-normal font-gilroy-regular leading-tight">
                    {finding.slice(0, 50).trim() + '...'}
                  </div>
                </div>
              ))}
              {findings[4] && (
                <div
                  className="col-span-2 bg-[#7dc3e4] rounded-lg p-3 min-h-[80px] flex items-start cursor-pointer"
                  onClick={() => {
                    setSelectedFinding(findings[4]);
                    setSelectedFindingIndex(4);
                    setFindingModalOpen(true);
                  }}
                >
                  <div className="text-white text-lg font-normal font-gilroy-regular leading-tight">
                    {findings[4].slice(0, 100).trim() + '...'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </SectionFrame>

        {/* Subjects Section */}
        <SectionFrame
          id="subjects"
          title="Subjects You Are Mentally Built to Explore Deeper"
          sub="Deepen the edges"
          shareText={subjects.map(s => `${s.title}: ${s.description}`).join("; ")}
          themeKey="subjects"
          inputClassName="placeholder:text-gray-700 bg-gray-100/30 text-gray-800 border border-gray-300"
          buttonClassName="bg-blue-600 text-white hover:bg-blue-700 border border-blue-600"
          customClass="pt-12 pb-[50px] overflow-y-auto"
          sessionId={sessionId}
          testId={testId}
        >
          <div className="grid h-full content-center gap-3">
            {subjects.map((subject, i) => (
              <div key={i} className="rounded-2xl bg-white p-3 text-[15px]" style={{ border: `1px solid ${tokens.border}` }}>
                <div className="font-gilroy-semibold text-gray-900">{subject.title}</div>
                <div className="text-sm text-gray-600 mt-1 font-gilroy-regular">{subject.description}</div>
                <div className="text-xs text-blue-600 mt-2 font-gilroy-medium">{subject.matchPercentage}% match</div>
              </div>
            ))}
          </div>
        </SectionFrame>

        {/* Quotes Section */}
        {/* <SectionFrame
          id="quotes"
          title="Philosophical Quotes That Mirrors Your Psyche"
          sub="Save the ones that hit"
          shareText={quotes.map((q) => `"${q.text}" — ${q.author}`).join("\n")}
          themeKey="quotes"
          inputClassName="placeholder:text-gray-700 bg-gray-100/30 text-gray-800 border border-gray-300"
          buttonClassName="bg-blue-600 text-white hover:bg-blue-700 border border-blue-600"
          customClass="pt-12 pb-24 overflow-y-auto"
          sessionId={sessionId}
          testId={testId}
        >
          <ul className="grid content-center gap-3 overflow-y-auto">
            {quotes.slice(0, 4).map((quote, i) => (
              <li key={i} className="rounded-2xl bg-white p-3" style={{ border: `1px solid ${tokens.border}` }}>
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center mt-0.5">
                    <Quote className="w-full h-full" color={tokens.accent} />
                  </div>
                  <div>
                    <div className="text-[15px] font-['Inter'] leading-tight">{quote.text}</div>
                    <div className="text-[12px]" style={{ color: tokens.muted }}>— {quote.author}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </SectionFrame> */}

        {/* Films Section */}
        {/* <SectionFrame
          id="films"
          title="Films That Will Hit Closer Than Expected"
          sub="Weekend cues"
          shareText={films.map((f) => `${f.title} — ${f.description}`).join("\n")}
          themeKey="films"
          customClass="pt-16 pb-16 overflow-y-auto"
          sessionId={sessionId}
          testId={testId}
        >
          <div className="overflow-x-auto">
            <div className="flex gap-4 pb-1" style={{ width: "max-content" }}>
              {films.slice(0, 3).map((film, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-3 flex-shrink-0 cursor-pointer"
                  onClick={() => {
                    setSelectedFilm(film);
                    setFilmModalOpen(true);
                  }}
                >
                  <div className="w-40 h-48 relative rounded-lg shadow-[0px_8px_20px_0px_rgba(12,69,240,0.22)] overflow-hidden bg-gradient-to-b from-blue-600 to-blue-700 flex items-center justify-center">
                    {film.imageUrl ? (
                      <>
                        <img
                          src='/film.svg'
                          alt={film.title}
                          className="w-full h-full object-cover"
                        />
                        <img
                          src="/filmiconsvg.svg"
                          alt="Prediction Card"
                          className="absolute bottom-2 left-2 h-6 w-5 z-10 drop-shadow-2xl"
                        />
                      </>
                    ) : (
                      <FilmIcon className="h-16 w-16 text-white/60" />
                    )}
                  </div>
                  <div className="flex gap-2">
                    <div className="text-white w-28 text-center text-lg font-bold font-['Inter'] leading-normal">
                      {film.title}
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionFrame> */}

        {/* Books Section */}
         <SectionFrame
          id="books"
          title="Books You'd Love If You Give Them a Chance"
          sub="3 high-yield picks"
          shareText={books.map((b) => `${b.title} — ${b.author}`).join("\n")}
          inputClassName="placeholder:text-gray-700 bg-gray-100/30 text-gray-800 border border-gray-300"
          buttonClassName="bg-blue-600 text-white hover:bg-blue-700 border border-blue-600"
          themeKey="books"
          customClass="pt-12 pb-12 overflow-y-auto"
          sessionId={sessionId}
          testId={testId}
        >
          <div className="overflow-x-auto">
            <div className="flex gap-4 pb-1" style={{ width: "max-content" }}>
              {books.map((book, i) => {
                const backgrounds = ["#41D9FF", "#0C45F0", "#41D9FF"];

                return (
                  <div key={i} className="flex flex-col items-center gap-3 flex-shrink-0"
                    onClick={() => {
                      console.log('Book clicked:', book); // Add this for debugging
                      setSelectedBook(book);
                      setBookModalOpen(true);
                    }}>
                    {/* Book Card */}
                    <div
                      className="w-40 h-48 relative rounded-lg shadow-[0px_8px_20px_0px_rgba(12,69,240,0.22)] flex items-center justify-center"
                      style={{ backgroundColor: backgrounds[i] }}
                    >
                      <BookOpen className="h-20 w-20 text-white" />
                      <BookmarkPlus className="absolute right-2 bottom-2 h-6 w-6 text-white/70" />
                      {/* <img src="/i-card.png" alt="Prediction Card" className="absolute right-2 bottom-2 h-6 w-6 text-white/70" /> */}
                    </div>

                    {/* Book Text */}
                    <div className="w-36 text-center">
                      <div className="text-neutral-950 text-lg font-bold font-['Inter'] leading-normal">
                        {book.title}
                      </div>
                      <div className="text-gray-500 text-lg font-normal font-['Inter'] leading-normal">
                        {book.author}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </SectionFrame>

        {/* Work Section */}
        <SectionFrame
          id="work"
          title="One Thing To Work On"
          sub="Start today; 60-minute cap"
          shareText={actionItem}
          themeKey="work"
          customClass="pt-20 pb-24 overflow-y-auto"
          sessionId={sessionId}
          testId={testId}
        >
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="rounded-2xl bg-white/10 p-4 text-2xl leading-6">
              <div className="font-gilroy-regular mb-10 text-left leading-snug">{actionItem}</div>
              <div className="opacity-95 text-xl font-gilroy-semibold">One small step could change your direction forever.</div>
            </div>
          </div>
        </SectionFrame>

        {/* PDF Section */}
        <SectionFrame
          id="pdf-report"
          title="Your Complete PDF Report"
          sub="35+ Pages of Deep Analysis"
          shareText="Check out my complete personality analysis from Fraterny!"
          themeKey="pdf-report"
          customClass="pt-16 relative"
          sessionId={sessionId}
          testId={testId}
        >
          <div style={{ paddingBottom: CTA_HEIGHT }}>
            <PDFImageViewer 
              paymentSuccess={paymentSuccess}
              paymentStatus={assessmentPaymentStatus}
              onPDFDownload={handlePDFDownload}
              onUnlockClick={() => {
                if (!paymentSuccess) {
                  googleAnalytics.trackPdfUnlockCTA({
                        session_id: sessionId!,
                        test_id: testId!,
                        user_state: user?.id ? 'logged_in' : 'anonymous'
                    });
                  setUpsellOpen(true);
                }
              }}
              pricing={pricing}
            />
          </div>
        </SectionFrame>
      </div>

      {/* Progress Rail */}
      <div className="fixed right-2 top-1/2 z-[55] -translate-y-1/2 flex flex-col items-center gap-2">
        {sectionIds.map((id, i) => (
          <button
            key={id}
            aria-label={`Jump to ${id}`}
            onClick={() => containerRef.current?.querySelector(`#${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="transition-all"
            style={{
              width: 6,
              height: i === activeIndex ? 20 : 6,
              borderRadius: 9999,
              background: i === activeIndex ? tokens.accent : 'rgba(10,10,10,0.25)'
            }}
          />
        ))}
      </div>

      {/* Sticky CTA + Upsell - Hide when in PDF section */}
      {paymentSuccess ? (
        // Show PaymentSuccessMessage in all sections (fixed sticky conflict)
        <PaymentSuccessMessage userId={userId} />
      ) : (
        // Show StickyCTA in all sections including PDF (fixed sticky conflict)
        <StickyCTA
          onOpen={() => {
            if (!paymentSuccess) {
              // Track PDF unlock CTA click
              googleAnalytics.trackPdfUnlockCTA({
                session_id: sessionId!,
                test_id: testId!,
                user_state: user?.id ? 'logged_in' : 'anonymous'
              });
              setUpsellOpen(true);
            }
          }}
          pricing={pricing}
          percentile={resultData?.pecentile}
          qualityScore={resultData?.qualityscore}
        />
      )}
      {!paymentSuccess && (
        <UpsellSheet
          open={upsellOpen}
          onClose={() => setUpsellOpen(false)}
          onPayment={handlePayment}
          paymentLoading={paymentLoading}
          pricing={pricing}
        />
      )}

      <PaymentSuccessPopup
        open={showSuccessPopup}
        onClose={handleCloseSuccessPopup}
        userId={userId}
      />

      <InsightModal
        insight={selectedInsight}
        onClose={() => setSelectedInsight(null)}
        attribute={selectedInsight ? mindStats[selectedInsight.index]?.label || '' : ''}
      />

      <FilmModal
        film={selectedFilm}
        onClose={() => {
          setSelectedFilm(null);
          setFilmModalOpen(false);
        }}
      />

      {/* <AstrologyModal
        prediction={selectedPrediction}
        onClose={() => {
          setSelectedPrediction(null);
          setAstrologyModalOpen(false);
        }}
      /> */}

      <BookModal
        book={selectedBook}
        onClose={() => {
          setSelectedBook(null);
          setBookModalOpen(false);
        }}
      />

      <FindingModal
        finding={selectedFinding}
        selectedIndex={selectedFindingIndex}
        onClose={() => {
          setSelectedFinding(null);
          setFindingModalOpen(false);
        }}
      />

      <FeedbackPopup
        open={feedbackPopupOpen}
        onClose={() => setFeedbackPopupOpen(false)}
        onDismiss={(hasInteracted) => setShowFeedbackStar(hasInteracted)}
        sessionId={sessionId}
        testId={testId}
        userId={getEffectiveUserId()}
      />

      {/* Sticky Feedback Star */}
      <AnimatePresence>
        {showFeedbackStar && (
          <motion.button
            onClick={() => {
              setShowFeedbackStar(false);
              setFeedbackPopupOpen(true);
            }}
            className="fixed right-5 bottom-20 z-[60] flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 shadow-lg"
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              rotate: 0,
              y: [0, -3, 0]
            }}
            exit={{ opacity: 0, scale: 0, rotate: 180 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              y: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Give feedback"
          >
            <Star className="h-5 w-5 text-white fill-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Tip Tooltip */}
      <AnimatePresence>
        {tip && (
          <motion.div
            className="fixed bottom-20 right-20 z-[65] rounded-2xl bg-black/80 px-3 py-2 text-[12px] text-white max-w-48"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            {tip}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom CTA Space */}
      <div style={{ height: CTA_HEIGHT }} />
    </div>
  );
}
