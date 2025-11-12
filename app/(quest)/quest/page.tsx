
"use client"
import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ScreenContainer from './sections/ScreenContainer'
import MotionProvider from './animations/MotionProvider';
import { getDeviceInfo, getIP, getLocation } from '@/utils/userInfo';
// import { setMeta } from '../../utils/seo';
// import { clearDynamicMetaTags } from '../../utils/seo';

const QuestLandingPage: React.FC = () => {
  const searchParams = useSearchParams();

  const handleAnalyzeClick = () => {
    console.log('Analyze Me clicked - you can add your logic here');
    // Add any additional logic you need when the button is clicked
  };
  
  // Track affiliate click event (deferred to not block initial render)
  useEffect(() => {
    const refCode = searchParams.get('ref');
    
    if (refCode) {
      // Save to localStorage immediately (fast)
      localStorage.setItem('referred_by', refCode);
      console.log('✅ Affiliate ref saved:', refCode);
      
      // Defer tracking API call until after page is interactive
      const trackClick = async () => {
        try {
          // Get user info
          const deviceInfo = getDeviceInfo();
          const ipAddress = await getIP();
          const locationData = await getLocation();
          
          // Track click via API
          const response = await fetch('/api/tracking/affiliate/click', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              affiliate_code: refCode,
              session_id: null,
              ip_address: ipAddress,
              device_info: deviceInfo,
              location: locationData?.country || null,
              metadata: {
                referrer: document.referrer || 'direct',
                landing_page: window.location.href,
                country_code: locationData?.countryCode || null,
                is_india: locationData?.isIndia || false
              }
            }),
          });
          
          const result = await response.json();
          
          if (result.success) {
            console.log('✅ Click event tracked for affiliate:', refCode);
          } else if (result.skipped) {
            console.log('⚠️ Click already tracked recently:', result.reason);
          } else {
            console.error('❌ Failed to track click:', result.error);
          }
        } catch (error) {
          console.error('❌ Failed to track click event:', error);
        }
      };
      
      // Use requestIdleCallback if available, otherwise setTimeout
      if (typeof window !== 'undefined') {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => trackClick(), { timeout: 2000 });
        } else {
          setTimeout(() => trackClick(), 100);
        }
      }
    }
  }, [searchParams]);


  return (
  <MotionProvider>
      <ScreenContainer 
        onAnalyzeClick={handleAnalyzeClick}
        className=""
        onNavigateToSection={(screen, section) => {
          console.log('🎯 Page level navigation called:', { screen, section });
        }}
      />
    </MotionProvider>
  );
};
export default QuestLandingPage;

