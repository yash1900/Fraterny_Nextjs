import { supabase } from '@/integrations/supabase/client';

export interface TrackingEventData {
  affiliate_code: string;
  event_type: 'click' | 'signup' | 'questionnaire_completed' | 'pdf_purchased';
  user_id?: string | null;
  session_id?: string | null;
  test_id?: string | null;
  ip_address?: string | null;
  device_info?: Record<string, any> | null;
  location?: string | null;
  metadata?: Record<string, any> | null;
  revenue?: number;
  commission_earned?: number;
  conversion_value?: number | null;
}

/**
 * Insert a tracking event into the tracking_events table
 */
export async function createTrackingEvent(eventData: TrackingEventData) {
  try {
    // Duplicate prevention logic
    if (eventData.event_type === 'click') {
      // For 'click' events: Check if same IP + affiliate_code exists in last 5 minutes
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      
      const { data: existingClick, error: checkError } = await supabase
        .from('tracking_events')
        .select('id')
        .eq('event_type', 'click')
        .eq('affiliate_code', eventData.affiliate_code)
        .eq('ip_address', eventData.ip_address)
        .gte('timestamp', fiveMinutesAgo)
        .limit(1)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Error checking for duplicate click:', checkError);
      }

      if (existingClick) {
        console.log('⚠️ Click already tracked recently (within 5 min), skipping insertion');
        return { skipped: true, reason: 'duplicate_click' };
      }
    }

    if (eventData.event_type === 'questionnaire_completed') {
      // For 'questionnaire_completed': Check if same test_id + session_id exists (any time)
      const { data: existingCompletion, error: checkError } = await supabase
        .from('tracking_events')
        .select('id')
        .eq('event_type', 'questionnaire_completed')
        .eq('test_id', eventData.test_id)
        .eq('session_id', eventData.session_id)
        .limit(1)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Error checking for duplicate completion:', checkError);
      }

      if (existingCompletion) {
        console.log('⚠️ Questionnaire completion already tracked for this test, skipping insertion');
        return { skipped: true, reason: 'duplicate_completion' };
      }
    }

    // No duplicate found, proceed with insertion
    const { data, error } = await supabase
      .from('tracking_events')
      .insert([
        {
          affiliate_code: eventData.affiliate_code,
          event_type: eventData.event_type,
          user_id: eventData.user_id || null,
          session_id: eventData.session_id || null,
          test_id: eventData.test_id || null,
          ip_address: eventData.ip_address || null,
          device_info: eventData.device_info || null,
          location: eventData.location || null,
          metadata: eventData.metadata || null,
          revenue: eventData.revenue || 0.00,
          commission_earned: eventData.commission_earned || 0.00,
          conversion_value: eventData.conversion_value || null,
          timestamp: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('❌ Error creating tracking event:', error);
      throw error;
    }

    console.log('✅ Tracking event created:', data);
    return data;
  } catch (error) {
    console.error('❌ Failed to create tracking event:', error);
    throw error;
  }
}

/**
 * Get device information for tracking
 */
export function getDeviceInfo() {
  const userAgent = navigator.userAgent;
  
  const detectBrowser = (): string => {
    if (userAgent.indexOf('Chrome') > -1) return 'Chrome';
    if (userAgent.indexOf('Safari') > -1) return 'Safari';
    if (userAgent.indexOf('Firefox') > -1) return 'Firefox';
    if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident') > -1) return 'Internet Explorer';
    if (userAgent.indexOf('Edge') > -1) return 'Edge';
    return 'Unknown';
  };

  const detectOS = (): string => {
    if (userAgent.indexOf('Windows') > -1) return 'Windows';
    if (userAgent.indexOf('Mac') > -1) return 'Mac';
    if (userAgent.indexOf('Linux') > -1) return 'Linux';
    if (userAgent.indexOf('Android') > -1) return 'Android';
    if (userAgent.indexOf('iOS') > -1) return 'iOS';
    return 'Unknown';
  };

  const detectDeviceType = (): string => {
    if (/mobile|android|iphone|ipad|ipod/i.test(userAgent.toLowerCase())) {
      return /ipad/i.test(userAgent.toLowerCase()) ? 'tablet' : 'mobile';
    }
    return 'desktop';
  };

  return {
    browser: detectBrowser(),
    os: detectOS(),
    device_type: detectDeviceType(),
    user_agent: userAgent
  };
}

/**
 * Get user's IP address (placeholder - actual implementation would need backend support)
 */
export async function getUserIP(): Promise<string | null> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Failed to get IP address:', error);
    return null;
  }
}
