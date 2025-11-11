'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { getDeviceIdentifier } from '../../../../../../ip-finder/deviceFingerprint';
import { useAuth } from '../../../../../auth/cotexts/AuthContext';

// TypeScript interfaces for recovery API
interface RecoverySession {
  session_id: string;
  test_id: string;
  user_id: string;
  completion_date: string;
  completion_percentage: number;
}

interface RecoveryApiResponse {
  success: boolean;
  sessions: RecoverySession[];
  message?: string;
}

//Entire Process to display during processing
const psychologicalFacts = [
  "Processing your answers securely...",
  "Cleaning and organising your responses...",
  "Calibrating weights so no single answer dominates...",
  "Balancing literal text with implied meaning...",
  "Reviewing the quality and depth of your responses...",
  "Quantifying uncertainty where answers are ambiguous...",
  "Searching the knowledge database for in-depth analysis...",
  "Analysing the emotional tone of the answers...",
  "Mapping shifts in mood across topics...",
  "Measuring emphasis vs understatement in phrasing...",
  "Detecting recurring themes and motifs...",
  "Looking for quiet signals you might underplay...",
  "Understanding your thought patterns based on answer combinations...",
  "Estimating confidence vs hesitation in wording...",
  "Measuring intensity behind key statements...",
  "Testing multiple interpretations for each signal...",
  "Weighing contradictions vs consistencies...",
  "Connecting answers to reveal pattern clusters...",
  "Creating a detailed summary of your personality and internal drivers...",
  "Locating edge cases that make you unique...",
  "Compressing complex patterns into takeaways...",
  "Generating your share-ready summary tiles...",
  
];

const PsychologicalFactsCards = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 5000); // 5 seconds for less percieved time

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentIndex === psychologicalFacts.length) {
      // Reset to 0 after the transition completes
      const timeout = setTimeout(() => {
        setCurrentIndex(0);
      }, 1000); // Wait for the 1s transition to complete
      
      return () => clearTimeout(timeout);
    }
  }, [currentIndex]);

  return (
    <div className="relative overflow-hidden w-full">
      <div 
        className="flex transition-transform duration-1000 ease-in-out"
        style={{
          transform: `translateX(calc(-${currentIndex * 100}% - ${currentIndex * 16}px))`
        }}
      >
        {[...psychologicalFacts].map((fact, index) => (
          <div
            key={index}
            className="w-full h-auto relative bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 rounded-xl border-2 border-blue-400 overflow-hidden flex-shrink-0 mr-4"
          >
            <div className="flex items-center justify-center h-full p-1">
              <p className="text-white text-2xl font-normal font-gilroy-regular text-center leading-snug">
                {fact}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


export interface QuestProcessingProps {
  className?: string;
  gifSrc?: string; // Optional prop to customize the GIF source
}

export function QuestProcessing({ className = '', gifSrc = '/analysis1.gif' }: QuestProcessingProps) {
  const [factIndex, setFactIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimedOut, setIsTimedOut] = useState(false);
  
  // New states for result polling
  const [isPolling, setIsPolling] = useState(false);
  const pollCountRef = useRef(0); // Use ref instead of state to avoid stale closure
  const [resultStatus, setResultStatus] = useState<'processing' | 'ready' | 'error'>('processing');
  
  // Recovery polling states
  const [isRecoveryPolling, setIsRecoveryPolling] = useState(false);
  const [recoveredTestId, setRecoveredTestId] = useState<string | null>(null);
  const [recoveredSessionData, setRecoveredSessionData] = useState<{userId: string, sessionId: string} | null>(null);
  const recoveryPollCountRef = useRef(0);

    const params = useParams();
    const router = useRouter();
    const { userId, sessionId, testId } = params;

    
    
    useEffect(() => {
      if (!sessionId || !userId || !testId) {
        setResultStatus('error');
        return;
      }

      let pollInterval: NodeJS.Timeout;
      let isActive = true;

      const pollForResults = async (): Promise<boolean> => {
        try {
          console.log(`📡 Checking status for testId: ${testId} (Attempt ${pollCountRef.current + 1})`);
          
          const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/status/${testId}`, {
            headers: { 'Content-Type': 'application/json' },
          });

          const data = response.data;
          console.log('📊 Polling response:', data);
          
          // Three simple conditions:
          
          if (data.status === 'ready') {
            console.log('✅ Analysis complete! Navigating to results...');
            setResultStatus('ready');
            setIsPolling(false);
            
            setTimeout(() => {
              if (isActive) {
                router.push(`/quest-result/result/${userId}/${sessionId}/${testId}`);
              }
            }, 2000);
            
            return true; // Stop polling
          }
          
          if (data.status === 'error') {
            console.log('❌ Analysis failed on server');
            setResultStatus('error');
            setIsPolling(false);
            return true; // Stop polling
          }
          
          if (data.status === 'processing') {
            console.log('⏳ Still processing, continuing to poll...');
            return false; // Continue polling
          }
          
          // Unknown status - treat as still processing
          console.warn('⚠️ Unknown status:', data.status, 'continuing to poll...');
          return false; // Continue polling
          
        } catch (error) {
          console.error('❌ Polling request failed:', error);
          
          // Increment poll count using ref
          pollCountRef.current += 1;
          
          console.log(`📊 Polling attempt ${pollCountRef.current} failed`);

          // Stop after 8 failed attempts
          if (pollCountRef.current >= 8) {
            console.error('⏰ Max polling attempts reached (8 attempts)');
            setResultStatus('error');
            setIsPolling(false);
            return true; // Stop polling
          }
          
          return false; // Continue polling despite error
        }
      };

      const startPolling = async () => {
        if (!isActive) return;
        
        console.log('🚀 Starting simplified polling...');
        setIsPolling(true);
        setResultStatus('processing');
        pollCountRef.current = 0; // Reset poll count

        // Wait 5 seconds before first poll
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        if (!isActive) return;

        // First poll
        const shouldStop = await pollForResults();
        
        if (!shouldStop && isActive) {
          // Start interval polling every 15 seconds
          pollInterval = setInterval(async () => {
            if (!isActive) {
              clearInterval(pollInterval);
              return;
            }
            
            pollCountRef.current += 1;
            console.log(`🔄 Starting interval polling attempt ${pollCountRef.current}`);
            
            // Check max attempts before making request
            if (pollCountRef.current > 10) {
              console.error('⏰ Max interval attempts reached (10 attempts)');
              setResultStatus('error');
              setIsPolling(false);
              clearInterval(pollInterval);
              return;
            }
            
            const stop = await pollForResults();
            
            if (stop) {
              clearInterval(pollInterval);
            }
          }, 15000);
        }
      };

      startPolling();

      // Cleanup
      return () => {
        isActive = false;
        setIsPolling(false);
        if (pollInterval) {
          clearInterval(pollInterval);
        }
      };

    }, [testId]);

    // Recovery polling useEffect - separate from main polling
    useEffect(() => {
      if (!recoveredTestId || !isRecoveryPolling) return;

      let recoveryInterval: NodeJS.Timeout;
      let isActive = true;

      const pollRecoveredTestId = async (): Promise<boolean> => {
        try {
          console.log(`🔄 [RECOVERY] Checking recovered testId: ${recoveredTestId} (Attempt ${recoveryPollCountRef.current + 1})`);

          const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/status/${recoveredTestId}`, {
            headers: { 'Content-Type': 'application/json' },
          });

          const data = response.data;
          console.log('📊 [RECOVERY] Status response:', data);
          
          if (data.status === 'ready') {
            console.log('✅ [RECOVERY] Recovered testId is READY! Navigating to results...');
            setIsRecoveryPolling(false);
            setIsPolling(false); // Stop original polling too
            
            const resultUrl = `/quest-result/result/${recoveredSessionData?.userId}/${recoveredSessionData?.sessionId}/${recoveredTestId}`;
            console.log('🎯 [RECOVERY] Navigating to results:', resultUrl);
            window.location.href = resultUrl;
            return true;
          }
          
          if (data.status === 'error') {
            console.log('❌ [RECOVERY] Recovered testId failed');
            setIsRecoveryPolling(false);
            // Continue with original polling, don't stop it
            return true;
          }
          
          if (data.status === 'processing') {
            console.log('⏳ [RECOVERY] Recovered testId still processing, continuing recovery polling...');
            return false;
          }
          
          console.warn('❓ [RECOVERY] Unknown status:', data.status);
          return false;
          
        } catch (error) {
          console.error('❌ [RECOVERY] Polling failed:', error);
          recoveryPollCountRef.current += 1;
          
          console.log(`📊 [RECOVERY] Recovery attempt ${recoveryPollCountRef.current} failed`);
          
          if (recoveryPollCountRef.current >= 5) {
            console.error('⏰ [RECOVERY] Max recovery polling attempts reached (5 attempts)');
            setIsRecoveryPolling(false);
            // Don't stop original polling, let it continue
            return true;
          }
          
          return false;
        }
      };

      const startRecoveryPolling = async () => {
        if (!isActive) return;
        
        console.log('🚀 [RECOVERY] Starting recovery polling...');
        recoveryPollCountRef.current = 0;

        // Wait 2 seconds before first recovery poll
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (!isActive) return;

        // First recovery poll
        const shouldStop = await pollRecoveredTestId();
        
        if (!shouldStop && isActive) {
          // Start interval polling every 10 seconds (faster than main polling)
          recoveryInterval = setInterval(async () => {
            if (!isActive || !isRecoveryPolling) {
              clearInterval(recoveryInterval);
              return;
            }
            
            recoveryPollCountRef.current += 1;
            const stop = await pollRecoveredTestId();
            
            if (stop) {
              clearInterval(recoveryInterval);
            }
          }, 10000); // 10 seconds
        }
      };

      startRecoveryPolling();

      // Cleanup
      return () => {
        isActive = false;
        setIsRecoveryPolling(false);
        if (recoveryInterval) {
          clearInterval(recoveryInterval);
        }
      };

    }, [recoveredTestId, isRecoveryPolling, recoveredSessionData]);

    useEffect(() => {
      const factInterval = setInterval(() => {
        setFactIndex(prevIndex => (prevIndex + 1) % psychologicalFacts.length);
      }, 8000);

      return () => clearInterval(factInterval);
    }, []);

  const { user } = useAuth();
  
  // Recovery function - attempt to find recent submissions
  const handleRecoveryAttempt = async () => {
    console.log('🔄 Starting recovery attempt...');
    setResultStatus('processing'); // Show loading state
    
    try {
      // Get device identifier (IP + fingerprint)
      const deviceIdentifier = await getDeviceIdentifier();
      // console.log('📱 Got device identifier for recovery:');
      // console.log('   IP:', deviceIdentifier.ip);
      // console.log('   DeviceHash:', deviceIdentifier.deviceHash);
      // console.log('   UserID:', user?.id || 'anonymous');
      
      // Call recovery API to find recent submissions (last 30 minutes)
      const requestPayload = {
        ip: deviceIdentifier.ip,
        deviceHash: deviceIdentifier.deviceHash,
        userId: user?.id || undefined,
        timeLimit: 30 // Request last 30 minutes
      };
      
      console.log('🚀 Sending recovery API request with payload:', requestPayload);

      const response = await axios.post<RecoveryApiResponse>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quest/recover`, requestPayload);

      // console.log('📊 ===== RECOVERY API RESPONSE =====');
      // console.log('Full response object:', response);
      // console.log('Response status:', response.status);
      // console.log('Response data:', response.data);
      // console.log('==================================');
      
      
      if (response.data?.sessions) {
        console.log('📄 Sessions found in response:');
        response.data.sessions.forEach((session: RecoverySession, index: number) => {
          // console.log(`   Session ${index + 1}:`, session);
          // console.log(`     - session_id: ${session.session_id}`);
          // console.log(`     - test_id: ${session.test_id}`);
          // console.log(`     - user_id: ${session.user_id}`);
          // console.log(`     - completion_date: ${session.completion_date}`);
        });
      } else {
        console.log('❌ No sessions array in response');
      }
      
      // Now check the conditions
      // console.log('🧪 Checking conditions...');
      // console.log('Condition 1 - response.data.success:', response.data.success);
      // console.log('Condition 2 - response.data.sessions exists:', !!response.data.sessions);
      // console.log('Condition 3 - sessions length > 0:', (response.data.sessions?.length || 0) > 0);
      
      if (response.data.success && response.data.sessions && response.data.sessions.length > 0) {
        console.log('✅ All conditions passed - processing recovery...');
        
        // Get the latest session (first one, since API returns ordered by most recent)
        const latestSession = response.data.sessions[0];
        const recoveredTestId = latestSession.test_id;
        
        console.log('🎯 Selected latest session:', latestSession);
        console.log('🆔 Recovered testId:', recoveredTestId);
        
        // Instead of navigating immediately, start recovery polling
        console.log('🚀 Starting DUAL POLLING system:');
        console.log('   🔴 Original polling: continues with testId:', testId);
        console.log('   🟢 Recovery polling: starts with testId:', recoveredTestId);
        
        // Set recovery states to start recovery polling
        setRecoveredTestId(recoveredTestId);
        setRecoveredSessionData({
          userId: latestSession.user_id,
          sessionId: latestSession.session_id
        });
        setIsRecoveryPolling(true);
        
        // Don't stop the original polling, let both run simultaneously
        console.log('✨ Both polling systems will now run in parallel!');
        console.log('   - Original polling continues every 15 seconds');
        console.log('   - Recovery polling starts every 10 seconds');
        
      } else {
        console.log('❌ Conditions failed - no valid sessions found');
        console.log('Reason: success=' + response.data.success + ', sessions=' + (response.data.sessions?.length || 0));
        
        if (response.data.message) {
          console.log('API message:', response.data.message);
        }
        
        console.log('🔄 Falling back to page reload in 3 seconds...');
        console.log('📝 CHECK THE LOGS ABOVE - Page reload in 3 seconds!');
        
        // Add delay before reload so you can see the logs
        setTimeout(() => {
          console.log('🚀 Page reload starting now...');
          window.location.reload();
        }, 3000); // 3 second delay
      }
      
    } catch (error: any) {
      console.error('❌ ===== RECOVERY ERROR =====');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('========================');
      
      console.log('🔄 Error fallback - reloading page in 3 seconds...');
      console.log('📝 CHECK THE ERROR LOGS ABOVE - Page reload in 3 seconds!');
      
      // Add delay before reload so you can see the logs
      setTimeout(() => {
        console.log('🚀 Error page reload starting now...');
        window.location.reload();
      }, 3000); // 3 second delay
    }
  };

  // Error state - show submit again option
  if (resultStatus === 'error') {
    return (
      <div className='h-screen max-h-screen relative overflow-hidden flex items-center justify-center'>
        <div className="text-center px-4">
          {/* <h2 className="text-2xl font-gilroy-bold text-black mb-4">
            Something went wrong
          </h2> */}
          <p className="text-lg text-gray-700 mb-6">
            Analysis took longer than expected. Please check again if your results are ready.
          </p>
          <button
            onClick={handleRecoveryAttempt}
            disabled={isPolling}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-gilroy-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isPolling ? 'Checking...' : 'Check Again'}
          </button>
        </div>
      </div>
    );
  }

    // Results ready state
    if (resultStatus === 'ready') {
      return (
        <div className='min-h-screen bg-[#004A7F] max-h-screen relative overflow-hidden flex items-center justify-center'>
          <div className="text-center px-4">
            <h2 className="text-4xl font-gilroy-bold text-white mb-4">
              Your Results are Ready!
            </h2>
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            </div>
          </div>
        </div>
      );
    }


    return (
      <div className='h-screen max-h-screen relative overflow-hidden'>
        {/* GIF Background */}
        <div>
          <img 
            src={gifSrc}
            className="absolute -top-36 w-full h-full object-cover z-0"
            alt="Processing animation background"
          />
        </div>
        
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0" />
        {/* Card-by-Card Sliding Facts */}
        <div className="absolute bottom-44 w-full px-4">
          <PsychologicalFactsCards />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-20 flex justify-center items-center w-full"
        >
          {/* Processing Message */}
          <div className="text-center px-2 mt-80">
            <p className="text-black font-normal text-2xl font-gilroy-semibold tracking-tighter pb-2">
              Generating in 1-2 minutes...
            </p>
            
            {/* Show recovery polling status if active */}
            {/*{isRecoveryPolling && (
              <div className="mt-4 bg-white/90 rounded-lg p-3 mx-4">
                <p className="text-green-600 text-sm font-gilroy-bold mb-1">
                  ✨ Dual Polling Active
                </p>
                <p className="text-gray-700 text-xs">
                  🔴 Original: {testId?.substring(0, 8)}...
                </p>
                <p className="text-gray-700 text-xs">
                  🟢 Recovery: {recoveredTestId?.substring(0, 8)}...
                </p>
              </div>
            )}*/}
          </div>
        </motion.div>
      </div> 
    );
    }

export default QuestProcessing;
