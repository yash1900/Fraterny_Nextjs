// ===================================
// GOOGLE ANALYTICS 4 QUEST TRACKING SERVICE
// Handles GA4 initialization and quest-specific event tracking
// ===================================

// Extend Window interface for gtag
// Declare global types for third-party scripts
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
    fbq: (...args: any[]) => void;
  }
}

interface QuestEventParams {
  session_id: string;
  question_id: string;
  section_id: string;
  user_state: 'anonymous' | 'logged_in';
  question_index?: number;
  section_question_index?: number;
  [key: string]: any;
}

class GoogleAnalyticsService {
  private isInitialized: boolean = false;
  private measurementId: string = '';
  private eventQueue: Array<{ eventName: string; parameters: any }> = [];

  

  constructor() {
    if (typeof window === 'undefined') {
        return;
    }

    this.measurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || '';
    
    if (this.measurementId) {
      this.initializeGA4();
    } else {
      console.warn('⚠️ GA4 Measurement ID not found in environment variables');
    }
  }

  private initializeGA4(): void {
    if (typeof window === 'undefined' || !this.measurementId) {
      console.warn('GA4 cannot initialize: missing measurement ID or running server-side');
      return;
    }

    try {
      // Load GA4 script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
      document.head.appendChild(script);

      // Initialize gtag
      window.dataLayer = window.dataLayer || [];
      window.gtag = function() { 
        window.dataLayer.push(arguments); 
      };
      
      window.gtag('js', new Date());

      const normalizedPath = this.normalizePagePath(window.location.pathname);
      const contentGroup = this.getContentGroup(normalizedPath);

      window.gtag('config', this.measurementId, {

        page_path: this.normalizePagePath(window.location.pathname),
        send_page_view: false,  
        ...(contentGroup && { content_group: contentGroup }),
        
        enhanced_measurement_settings: {
          scrolls: false, 
          outbound_clicks: true,
          site_search: false,
          video_engagement: false,
          file_downloads: false
        },
        // Custom parameters mapping
        custom_map: {
          'custom_session_id': 'session_id',
          'custom_question_id': 'question_id',
          'custom_section_id': 'section_id',
          'custom_user_state': 'user_state'
        }
      });

      this.isInitialized = true;
      // Preserve Google Ads click ID for conversion tracking
      this.preserveGclid();
      // console.log('✅ GA4 Quest Analytics initialized:', this.measurementId);
      
      // Process any queued events
      this.processEventQueue();
      
    } catch (error) {
      console.error('❌ Failed to initialize GA4:', error);
    }
  }

  private processEventQueue(): void {
    if (this.eventQueue.length > 0) {
      this.eventQueue.forEach(({ eventName, parameters }) => {
        this.sendEvent(eventName, parameters);
      });
      this.eventQueue = [];
      console.log('📤 Processed queued GA4 events');
    }
  }

  // private sendEvent(eventName: string, parameters: any): void {
  //   if (!this.isInitialized) {
  //     // Queue event if GA4 not ready
  //     this.eventQueue.push({ eventName, parameters });
  //     return;
  //   }

  //   try {
  //     window.gtag('event', eventName, {
  //       ...parameters,
  //       // Add timestamp for all events
  //       timestamp: Date.now(),
  //       // Add page info
  //       page_location: window.location.href,
  //       page_title: document.title
  //     });
      
  //     // console.log(`📊 GA4 Event: ${eventName}`, parameters);
  //   } catch (error) {
  //     console.error(`❌ Failed to send GA4 event ${eventName}:`, error);
  //   }
  // }

  private sendEvent(eventName: string, parameters: any): void {
  if (!this.isInitialized) {
    // Queue event if GA4 not ready
    this.eventQueue.push({ eventName, parameters });
    return;
  }

  try {
    // Get platform info for UTM tracking
    const platformInfo = this.getStoredPlatformInfo();
    const normalizedPath = this.normalizePagePath(window.location.pathname);
    
    const eventData: any = {
      ...parameters,
      // Add UTM parameters to every event
      campaign_source: platformInfo.source,
      campaign_medium: platformInfo.medium,
      campaign_name: platformInfo.campaign,
      traffic_platform: platformInfo.platform,
      // Existing fields
      timestamp: Date.now(),
      page_location: window.location.origin + normalizedPath,
      page_path: normalizedPath,
      page_title: document.title
    };
    
      window.gtag('event', eventName, eventData);
  
     // console.log(`📊 GA4 Event: ${eventName}`, eventData);
     //  console.log(`🔍 Normalized path: ${normalizedPath}`);
  } catch (error) {
    console.error(`❌ Failed to send GA4 event ${eventName}:`, error);
  }
}

  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);
    return isTablet ? 'tablet' : (isMobile ? 'mobile' : 'desktop');
  }

  /**
 * Normalize page path by replacing dynamic IDs with :id placeholder
 */
private normalizePagePath(path: string): string {
  if (!path) return '/';
  
  // Replace UUIDs (36-char versions with dashes)
  path = path.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/ig, ':id');
  
  // Replace long session tokens like "session_1757972353324"
  path = path.replace(/session_[0-9]{6,}/ig, 'session/:id');
  
  // Replace other 24–64 hex-like blobs
  path = path.replace(/[0-9a-f]{24,64}/ig, ':id');
  
  // Collapse multiple :id in a row
  path = path.replace(/(:id\/?){2,}/g, ':id/');
  
  // Clean up known quest routes
  path = path
    .replace(/^\/quest-result\/result\/:id\/session\/:id.*/i, '/quest-result/result')
    .replace(/^\/quest-result\/processing\/:id.*/i, '/quest-result/processing')
    .replace(/^\/quest-dashboard\/:id.*/i, '/quest-dashboard')
    .replace(/^\/assessment-list\/:id.*/i, '/assessment-list')
    .replace(/^\/payment-history\/:id.*/i, '/payment-history');
  
  return path;
}


/**
 * Determine content group based on normalized page path
 */
private getContentGroup(path: string): string | undefined {
  // Map normalized paths to content groups
  if (path === '/quest') return 'quest';
  if (path === '/quest-dashboard') return 'quest-dashboard';
  if (path === '/assessment-list') return 'assessment-list';
  if (path === '/quest-result/processing') return 'quest-processing';
  if (path === '/quest-result/result') return 'quest-result';
  
  // Return undefined for pages that don't need content grouping
  return undefined;
}

  private getStoredPlatformInfo(): any {
  try {
    const stored = sessionStorage.getItem('user_platform_info');
    if (stored) {
      const platformInfo = JSON.parse(stored);
      return {
        source: platformInfo.source || 'direct',
        medium: platformInfo.medium || '(none)',
        campaign: platformInfo.campaign || '(none)',
        platform: platformInfo.platform || 'direct'
      };
    }
  } catch (error) {
    console.log('Error getting platform info:', error);
  }
  
  // Fallback if no stored info
  return {
    source: 'direct',
    medium: '(none)',
    campaign: '(none)',
    platform: 'direct'
  };
}

  // ===================================
  // QUEST EVENT TRACKING METHODS
  // ===================================

  /**
   * Track quest session start
   */
  trackQuestStart(params: {
    session_id: string;
    user_state: 'anonymous' | 'logged_in';
    total_questions: number;
    is_resumed_session?: boolean;
  }): void {
    this.sendEvent('quest_start', {
      event_category: 'Quest',
      event_label: 'Session Started',
      session_id: params.session_id,
      user_state: params.user_state,
      total_questions: params.total_questions,
      is_resumed_session: params.is_resumed_session || false,
      device_type: this.getDeviceType()
    });
  }

  /**
   * Track when user views a question
   */
  trackQuestionView(params: {
    session_id: string;
    question_id: string;
    section_id: string;
    user_state: 'anonymous' | 'logged_in';
    question_index: number;
    section_question_index: number;
  }): void {
    this.sendEvent('quest_question_view', {
      event_category: 'Quest',
      event_label: `Question View: ${params.question_id}`,
      session_id: params.session_id,
      question_id: params.question_id,
      section_id: params.section_id,
      user_state: params.user_state,
      question_index: params.question_index,
      section_question_index: params.section_question_index,
      device_type: this.getDeviceType()
    });
  }

  /**
   * Track question completion (successful save)
   */
  trackQuestionComplete(params: {
    session_id: string;
    question_id: string;
    section_id: string;
    user_state: 'anonymous' | 'logged_in';
    question_index: number;
    response_length?: number;
    time_on_question?: number;
  }): void {
    this.sendEvent('quest_question_complete', {
      event_category: 'Quest',
      event_label: `Question Complete: ${params.question_id}`,
      session_id: params.session_id,
      question_id: params.question_id,
      section_id: params.section_id,
      user_state: params.user_state,
      question_index: params.question_index,
      response_length: params.response_length || 0,
      time_on_question: Math.round(params.time_on_question || 0),
      device_type: this.getDeviceType()
    });
  }

  /**
   * Track quest completion
   */
  trackQuestComplete(params: {
    session_id: string;
    user_state: 'anonymous' | 'logged_in';
    total_duration: number;
    questions_completed: number;
  }): void {
    this.sendEvent('quest_complete', {
      event_category: 'Quest',
      event_label: 'Quest Completed',
      session_id: params.session_id,
      user_state: params.user_state,
      total_duration: Math.round(params.total_duration),
      questions_completed: params.questions_completed,
      device_type: this.getDeviceType()
    });

    // Also track as conversion
    this.sendEvent('quest_conversion', {
      event_category: 'Conversion',
      event_label: 'Quest Completed',
      value: params.questions_completed,
      currency: 'points'
    });
  }

  /**
   * Track quest abandonment
   */
  trackQuestAbandon(params: {
    session_id: string;
    question_id: string;
    section_id: string;
    user_state: 'anonymous' | 'logged_in';
    question_index: number;
    session_duration: number;
    abandon_reason?: string;
  }): void {
    this.sendEvent('quest_abandon', {
      event_category: 'Quest',
      event_label: `Abandoned at: ${params.question_id}`,
      session_id: params.session_id,
      question_id: params.question_id,
      section_id: params.section_id,
      user_state: params.user_state,
      question_index: params.question_index,
      session_duration: Math.round(params.session_duration),
      abandon_reason: params.abandon_reason || 'unknown',
      device_type: this.getDeviceType()
    });
  }

  /**
   * Track anonymous user conversion to logged-in
   */
  trackUserConversion(params: {
    session_id: string;
    conversion_point: string; // e.g., 'save_button', 'question_result'
    questions_completed_as_anonymous: number;
  }): void {
    this.sendEvent('user_conversion', {
      event_category: 'User Journey',
      event_label: 'Anonymous to Logged-in',
      session_id: params.session_id,
      conversion_point: params.conversion_point,
      questions_completed_as_anonymous: params.questions_completed_as_anonymous,
      device_type: this.getDeviceType()
    });

    // Track as conversion goal
    this.sendEvent('sign_up', {
      method: 'quest_save'
    });
  }

  /**
   * Track session save
   */
  trackSessionSave(params: {
    session_id: string;
    user_state: 'anonymous' | 'logged_in';
    questions_completed: number;
    save_trigger: 'auto' | 'manual' | 'before_unload';
  }): void {
    this.sendEvent('quest_session_save', {
      event_category: 'Quest',
      event_label: 'Session Saved',
      session_id: params.session_id,
      user_state: params.user_state,
      questions_completed: params.questions_completed,
      save_trigger: params.save_trigger,
      device_type: this.getDeviceType()
    });
  }

  /**
   * Track session resume
   */
  trackSessionResume(params: {
    session_id: string;
    user_state: 'anonymous' | 'logged_in';
    resume_question_id: string;
    time_since_save: number; // in hours
  }): void {
    this.sendEvent('quest_session_resume', {
      event_category: 'Quest',
      event_label: 'Session Resumed',
      session_id: params.session_id,
      user_state: params.user_state,
      resume_question_id: params.resume_question_id,
      time_since_save: Math.round(params.time_since_save * 100) / 100, // Round to 2 decimals
      device_type: this.getDeviceType()
    });
  }

  /**
 * Track page view with normalized path
 */
trackPageView(): void {
  const normalizedPath = this.normalizePagePath(window.location.pathname);
  const contentGroup = this.getContentGroup(normalizedPath);
  
  this.sendEvent('page_view', {
    page_location: window.location.origin + normalizedPath + window.location.search,
    page_path: normalizedPath,
    page_title: document.title,
     ...(contentGroup && { content_group: contentGroup }) 
  });
}

  /**
   * Get initialization status
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Get measurement ID (for debugging)
   */
  getMeasurementId(): string {
    return this.measurementId;
  }

  /**
 * Preserve Google Ads click ID (gclid) for conversion tracking
 */
// private preserveGclid(): void {
//   try {
//     const urlParams = new URLSearchParams(window.location.search);
//     const gclid = urlParams.get('gclid');
    
//     if (gclid) {
//       // Store gclid in both session and local storage
//       sessionStorage.setItem('gclid', gclid);
//       localStorage.setItem('gclid', gclid);
//       console.log('Google Ads click ID preserved:', gclid);
//     }

//     // Preserve Reddit source parameters
//     const utmSource = urlParams.get('utm_source');
//     const isFromReddit = utmSource?.toLowerCase().includes('reddit') || 
//                       document.referrer.toLowerCase().includes('reddit');

//     if (isFromReddit) {
//       sessionStorage.setItem('reddit_source', 'true');
//       localStorage.setItem('reddit_source', 'true');
//       console.log('Reddit traffic source preserved');
//     }
//   } catch (error) {
//     console.error('Failed to preserve gclid:', error);
//   }
// }

private preserveGclid(): void {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const gclid = urlParams.get('gclid');

    if (gclid) {
      sessionStorage.setItem('gclid', gclid);
      localStorage.setItem('gclid', gclid);
      console.log('Google Ads click ID preserved:', gclid);
    }

    // Preserve Facebook Click ID (fbclid)
    const fbclid = urlParams.get('fbclid');
    if (fbclid) {
      sessionStorage.setItem('fbclid', fbclid);
      localStorage.setItem('fbclid', fbclid);
      console.log('Meta (Facebook) click ID preserved:', fbclid);
    }

    // Preserve Reddit source parameters
    const utmSource = urlParams.get('utm_source');
    const isFromReddit = utmSource?.toLowerCase().includes('reddit') || 
                      document.referrer.toLowerCase().includes('reddit');

    if (isFromReddit) {
      sessionStorage.setItem('reddit_source', 'true');
      localStorage.setItem('reddit_source', 'true');
      console.log('Reddit traffic source preserved');
    }

    // Preserve Meta (Facebook/Instagram) source parameters
    const isFromMeta = utmSource?.toLowerCase().includes('facebook') || 
                       utmSource?.toLowerCase().includes('instagram') ||
                       utmSource === 'fb' || 
                       utmSource === 'ig' ||
                       document.referrer.toLowerCase().includes('facebook') ||
                       document.referrer.toLowerCase().includes('instagram');

    if (isFromMeta) {
      sessionStorage.setItem('meta_source', 'true');
      localStorage.setItem('meta_source', 'true');
      console.log('Meta traffic source preserved');
    }
  } catch (error) {
    console.error('Error preserving click IDs:', error);
  }
}




/**
 * Check if user came from Reddit traffic
 */
 isRedditTraffic(): boolean {
  try {
    // Check URL parameters for Reddit UTM
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');
    const utmMedium = urlParams.get('utm_medium');
    
    // Check for Reddit-specific parameters
    if (utmSource && utmSource.toLowerCase().includes('reddit')) {
      return true;
    }
    
    // Check referrer for Reddit domains
    const referrer = document.referrer.toLowerCase();
    if (referrer.includes('reddit.com') || referrer.includes('redd.it')) {
      return true;
    }
    
    // Check stored Reddit parameters
    const storedRedditSource = sessionStorage.getItem('reddit_source') || localStorage.getItem('reddit_source');
    if (storedRedditSource) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking Reddit traffic:', error);
    return false;
  }
}

/**
 * Check if current user came from Meta (Facebook/Instagram) traffic
 */
isMetaTraffic(): boolean {
  try {
    // Check URL parameters for Facebook Click ID (fbclid)
    const urlParams = new URLSearchParams(window.location.search);
    const fbclid = urlParams.get('fbclid');
    
    if (fbclid) {
      return true;
    }
    
    // Check stored fbclid in storage
    const storedFbclid = sessionStorage.getItem('fbclid') || localStorage.getItem('fbclid');
    if (storedFbclid) {
      return true;
    }
    
    // Check URL parameters for Meta UTM sources
    const utmSource = urlParams.get('utm_source');
    if (utmSource) {
      const source = utmSource.toLowerCase();
      if (source.includes('facebook') || source.includes('instagram') || source === 'fb' || source === 'ig') {
        return true;
      }
    }
    
    // Check referrer for Meta domains
    const referrer = document.referrer.toLowerCase();
    if (referrer.includes('facebook.com') || 
        referrer.includes('fb.com') || 
        referrer.includes('instagram.com')) {
      return true;
    }
    
    // Check stored platform info
    const platformInfo = this.getStoredPlatformInfo();
    if (platformInfo.platform === 'facebook' || platformInfo.platform === 'instagram') {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking Meta traffic:', error);
    return false;
  }
}

  // ===================================
// PAYMENT EVENT TRACKING METHODS
// ===================================

/**
 * Track payment initiation from result page
 */
trackPaymentInitiated(params: {
  session_id: string;
  test_id: string;
  user_state: 'anonymous' | 'logged_in';
  payment_amount: number;
  pricing_tier: 'early' | 'regular';
}): void {
  this.sendEvent('payment_initiated_from_result_page', {
    event_category: 'Payment',
    event_label: 'Payment Started',
    session_id: params.session_id,
    test_id: params.test_id,
    user_state: params.user_state,
    payment_amount: params.payment_amount,
    pricing_tier: params.pricing_tier,
    device_type: this.getDeviceType()
  });
}

/**
 * Track payment modal opened successfully
 */
trackPaymentModalOpened(params: {
  session_id: string;
  order_id: string;
  amount: number;
  currency: string;
}): void {
  this.sendEvent('payment_modal_opened_from_result_page', {
    event_category: 'Payment',
    event_label: 'Payment Modal Opened',
    session_id: params.session_id,
    order_id: params.order_id,
    amount: params.amount,
    currency: params.currency,
    device_type: this.getDeviceType()
  });
}

/**
 * Track successful payment from result page
 */
trackPaymentSuccess(params: {
  session_id: string;
  payment_id: string;
  order_id: string;
  amount: number;
}): void {
  this.sendEvent('payment_success_from_result_page', {
    event_category: 'Payment',
    event_label: 'Payment Completed',
    session_id: params.session_id,
    payment_id: params.payment_id,
    order_id: params.order_id,
    amount: params.amount,
    device_type: this.getDeviceType()
  });
}

/**
 * Track payment completed (end-to-end verification)
 */
trackPaymentCompleted(params: {
  session_id: string;
  payment_id: string;
  verification_success: boolean;
  total_duration: number;
}): void {
  this.sendEvent('payment_completed_from_result_page', {
    event_category: 'Payment',
    event_label: 'Payment Fully Completed',
    session_id: params.session_id,
    payment_id: params.payment_id,
    verification_success: params.verification_success,
    total_duration: Math.round(params.total_duration),
    device_type: this.getDeviceType()
  });
}


trackGoogleAdsConversion(params: {
  session_id: string;
  payment_id: string;
  amount: number;
  currency: string;
}): void {
  try {
    const conversionId = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID;
    
    if (!conversionId || !this.isInitialized) {
      return;
    }

    window.gtag('event', 'conversion', {
      send_to: conversionId,
      value: params.amount,
      currency: params.currency,
      event_callback: function() {
        console.log('Google Ads conversion tracked successfully');
      }
    });
  } catch (error) {
    console.error('Failed to track Google Ads conversion:', error);
  }
}


/**
 * Track Reddit conversion
 */
trackRedditConversion(params: {
  session_id: string;
  payment_id: string;
  amount: number;
  currency: string;
}): void {
  try {
    const conversionId = process.env.NEXT_PUBLIC_REDDIT_CONVERSION_ID;
    
    if (!conversionId) {
      return;
    }

    window.dataLayer.push({
      event: "Purchase",
      conversionId: conversionId,
      currency: params.currency,
      transactionValue: params.amount
    });
    
    console.log('Reddit conversion tracked successfully');
  } catch (error) {
    console.error('Failed to track Reddit conversion:', error);
  }
}


/**
 * Track Meta Pixel conversion (Purchase event)
 */
trackMetaPixelPurchase(params: {
  session_id: string;
  payment_id: string;
  amount: number;
  currency: string;
}): void {
  try {
    // Check if Meta Pixel is loaded
    if (typeof window.fbq === 'undefined') {
      console.warn('Meta Pixel not loaded');
      return;
    }

    // Track Purchase event with deduplication
    window.fbq('track', 'Purchase', {
      value: params.amount,
      currency: params.currency,
      content_type: 'product',
      content_ids: [params.session_id],
      content_name: 'Quest Assessment Report'
    }, {
      eventID: params.payment_id  // Use payment_id as eventID for deduplication
    });
    
    console.log('Meta Pixel Purchase conversion tracked successfully');
  } catch (error) {
    console.error('Failed to track Meta Pixel conversion:', error);
  }
}

/**
 * Track Meta Pixel InitiateCheckout event (when payment is initiated)
 */
trackMetaPixelInitiateCheckout(params: {
  session_id: string;
  test_id: string;
  amount: number;
  currency: string;
}): void {
  try {
    // Check if Meta Pixel is loaded
    if (typeof window.fbq === 'undefined') {
      console.warn('Meta Pixel not loaded');
      return;
    }

    // Generate unique eventID for this checkout initiation
    const eventID = 'checkout_' + params.session_id + '_' + Date.now();

    // Track InitiateCheckout event with deduplication
    window.fbq('track', 'InitiateCheckout', {
      value: params.amount,
      currency: params.currency,
      content_type: 'product',
      content_ids: [params.session_id],
      content_name: 'Quest Assessment Report'
    }, {
      eventID: eventID
    });
    
    console.log('Meta Pixel InitiateCheckout tracked successfully');
  } catch (error) {
    console.error('Failed to track Meta Pixel InitiateCheckout:', error);
  }
}


/**
 * Track Meta Pixel custom event when payment is cancelled
 */
trackMetaPixelPaymentCancelled(params: {
  session_id: string;
  amount: number;
  currency: string;
}): void {
  try {
    // Check if Meta Pixel is loaded
    if (typeof window.fbq === 'undefined') {
      console.warn('Meta Pixel not loaded');
      return;
    }

    // Generate unique eventID for this cancellation
    const eventID = 'cancel_' + params.session_id + '_' + Date.now();

    // Track custom event for payment cancellation
    window.fbq('trackCustom', 'PaymentCancelled', {
      value: params.amount,
      currency: params.currency,
      content_type: 'product',
      content_ids: [params.session_id]
    }, {
      eventID: eventID
    });
    
    console.log('Meta Pixel PaymentCancelled tracked successfully');
  } catch (error) {
    console.error('Failed to track Meta Pixel PaymentCancelled:', error);
  }
}

/**
 * Track payment failure from result page
 */
trackPaymentFailed(params: {
  session_id: string;
  failure_reason: string;
  error_code?: string;
  amount: number;
}): void {
  this.sendEvent('payment_failed_from_result_page', {
    event_category: 'Payment',
    event_label: 'Payment Failed',
    session_id: params.session_id,
    failure_reason: params.failure_reason,
    error_code: params.error_code || 'unknown',
    amount: params.amount,
    device_type: this.getDeviceType()
  });
}

/**
 * Track payment cancellation from result page
 */
trackPaymentCancelled(params: {
  session_id: string;
  cancel_reason: string;
  amount: number;
}): void {
  this.sendEvent('payment_cancelled_from_result_page', {
    event_category: 'Payment',
    event_label: 'Payment Cancelled',
    session_id: params.session_id,
    cancel_reason: params.cancel_reason,
    amount: params.amount,
    device_type: this.getDeviceType()
  });
}

/**
 * Track PDF unlock CTA button click
 */
trackPdfUnlockCTA(params: {
  session_id: string;
  test_id: string;
  user_state: 'anonymous' | 'logged_in';
}): void {
  this.sendEvent('pdf_unlock_cta_clicked_from_result_page', {
    event_category: 'Engagement',
    event_label: 'PDF Unlock CTA Clicked',
    session_id: params.session_id,
    test_id: params.test_id,
    user_state: params.user_state,
    device_type: this.getDeviceType()
  });
}

/**
 * Track payment initiation from dashboard page
 */
trackPaymentInitiatedFromDashboard(params: {
  session_id: string;
  test_id: string;
  user_state: 'anonymous' | 'logged_in';
  payment_amount: number;
  pricing_tier: 'early' | 'regular';
}): void {
  this.sendEvent('payment_initiated_from_dashboard_page', {
    event_category: 'Payment',
    event_label: 'Payment Started',
    session_id: params.session_id,
    test_id: params.test_id,
    user_state: params.user_state,
    payment_amount: params.payment_amount,
    pricing_tier: params.pricing_tier,
    device_type: this.getDeviceType()
  });
}

/**
 * Track PDF unlock CTA button click from dashboard
 */
trackPdfUnlockCTAFromDashboard(params: {
  session_id: string;
  test_id: string;
  user_state: 'anonymous' | 'logged_in';
}): void {
  this.sendEvent('pdf_unlock_cta_clicked_from_dashboard_page', {
    event_category: 'Engagement',
    event_label: 'PDF Unlock CTA Clicked',
    session_id: params.session_id,
    test_id: params.test_id,
    user_state: params.user_state,
    device_type: this.getDeviceType()
  });
}

}

// Export singleton instance
export const googleAnalytics = new GoogleAnalyticsService();

// Export class for testing
export { GoogleAnalyticsService };

// Export types
export type { QuestEventParams };