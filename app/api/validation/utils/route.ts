/**
 * API Route: /api/validation/utils
 * Methods: POST
 */
import { NextRequest, NextResponse } from 'next/server';

// Validation rules (based on old service)
const VALIDATION_RULES = {
  SESSION_ID: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 255,
    PATTERN: /^[a-zA-Z0-9_-]+$/
  },
  TEST_ID: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-Z0-9_-]+$/
  },
  AMOUNT: {
    MIN: 10000, // ₹100 in paise
    MAX: 10000000 // ₹100,000 in paise
  }
};

// Validation result interface
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Individual validation functions
const validateSessionId = (sessionId: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!sessionId) {
    errors.push('Session ID is required');
    return { isValid: false, errors };
  }
  
  if (typeof sessionId !== 'string') {
    errors.push('Session ID must be a string');
  }
  
  if (sessionId.length < VALIDATION_RULES.SESSION_ID.MIN_LENGTH) {
    errors.push(`Session ID must be at least ${VALIDATION_RULES.SESSION_ID.MIN_LENGTH} characters`);
  }
  
  if (sessionId.length > VALIDATION_RULES.SESSION_ID.MAX_LENGTH) {
    errors.push(`Session ID must be no more than ${VALIDATION_RULES.SESSION_ID.MAX_LENGTH} characters`);
  }
  
  if (!VALIDATION_RULES.SESSION_ID.PATTERN.test(sessionId)) {
    errors.push('Session ID contains invalid characters. Only letters, numbers, hyphens, and underscores are allowed');
  }
  
  return { isValid: errors.length === 0, errors };
};

const validateTestId = (testId: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!testId) {
    errors.push('Test ID is required');
    return { isValid: false, errors };
  }
  
  if (typeof testId !== 'string') {
    errors.push('Test ID must be a string');
  }
  
  if (testId.length < VALIDATION_RULES.TEST_ID.MIN_LENGTH) {
    errors.push(`Test ID must be at least ${VALIDATION_RULES.TEST_ID.MIN_LENGTH} characters`);
  }
  
  if (testId.length > VALIDATION_RULES.TEST_ID.MAX_LENGTH) {
    errors.push(`Test ID must be no more than ${VALIDATION_RULES.TEST_ID.MAX_LENGTH} characters`);
  }
  
  if (!VALIDATION_RULES.TEST_ID.PATTERN.test(testId)) {
    errors.push('Test ID contains invalid characters. Only letters, numbers, hyphens, and underscores are allowed');
  }
  
  return { isValid: errors.length === 0, errors };
};

const validateUserId = (userId: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!userId) {
    errors.push('User ID is required');
    return { isValid: false, errors };
  }
  
  if (typeof userId !== 'string') {
    errors.push('User ID must be a string');
  }
  
  if (userId.trim().length === 0) {
    errors.push('User ID cannot be empty');
  }
  
  return { isValid: errors.length === 0, errors };
};

const validateAmount = (amount: number): ValidationResult => {
  const errors: string[] = [];
  
  if (amount === undefined || amount === null) {
    errors.push('Amount is required');
    return { isValid: false, errors };
  }
  
  if (typeof amount !== 'number') {
    errors.push('Amount must be a number');
  }
  
  if (!Number.isInteger(amount)) {
    errors.push('Amount must be an integer (in paise)');
  }
  
  if (amount < VALIDATION_RULES.AMOUNT.MIN) {
    errors.push(`Amount must be at least ₹${VALIDATION_RULES.AMOUNT.MIN / 100}`);
  }
  
  if (amount > VALIDATION_RULES.AMOUNT.MAX) {
    errors.push(`Amount must be no more than ₹${VALIDATION_RULES.AMOUNT.MAX / 100}`);
  }
  
  return { isValid: errors.length === 0, errors };
};

const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!email) {
    errors.push('Email is required');
    return { isValid: false, errors };
  }
  
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    errors.push('Invalid email format');
  }
  
  return { isValid: errors.length === 0, errors };
};

const validateDateString = (dateString: string, fieldName: string = 'Date'): ValidationResult => {
  const errors: string[] = [];
  
  if (!dateString) {
    errors.push(`${fieldName} is required`);
    return { isValid: false, errors };
  }
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    errors.push(`${fieldName} is not a valid date`);
  }
  
  return { isValid: errors.length === 0, errors };
};

const validatePricingTier = (tier: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!tier) {
    errors.push('Pricing tier is required');
    return { isValid: false, errors };
  }
  
  if (!['early', 'regular'].includes(tier)) {
    errors.push('Pricing tier must be either "early" or "regular"');
  }
  
  return { isValid: errors.length === 0, errors };
};

const validateGateway = (gateway: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!gateway) {
    errors.push('Gateway is required');
    return { isValid: false, errors };
  }
  
  if (!['razorpay', 'paypal'].includes(gateway)) {
    errors.push('Gateway must be either "razorpay" or "paypal"');
  }
  
  return { isValid: errors.length === 0, errors };
};

const validatePaymentStatus = (status: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!status) {
    errors.push('Payment status is required');
    return { isValid: false, errors };
  }
  
  if (!['success', 'failed', 'pending'].includes(status)) {
    errors.push('Payment status must be "success", "failed", or "pending"');
  }
  
  return { isValid: errors.length === 0, errors };
};

const validatePhoneNumber = (phone: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!phone) {
    errors.push('Phone number is required');
    return { isValid: false, errors };
  }
  
  // Remove spaces, hyphens, and parentheses
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Check for valid phone number pattern (Indian format)
  const phonePattern = /^\+?[1-9]\d{1,14}$/;
  if (!phonePattern.test(cleanPhone)) {
    errors.push('Invalid phone number format');
  }
  
  return { isValid: errors.length === 0, errors };
};

const validateURL = (url: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!url) {
    errors.push('URL is required');
    return { isValid: false, errors };
  }
  
  try {
    new URL(url);
  } catch {
    errors.push('Invalid URL format');
  }
  
  return { isValid: errors.length === 0, errors };
};

// Utility functions
const sanitizeString = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

const isNotEmpty = (value: any): boolean => {
  return value !== null && value !== undefined && value !== '';
};

// GET - Individual validation operations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const operation = searchParams.get('operation');
    
    if (!operation) {
      return NextResponse.json(
        {
          success: false,
          error: 'Operation is required',
          availableOperations: [
            'session-id', 'test-id', 'user-id', 'amount', 'email', 
            'date', 'pricing-tier', 'gateway', 'payment-status', 
            'phone', 'url', 'rules'
          ]
        },
        { status: 400 }
      );
    }
    
    // Return validation rules
    if (operation === 'rules') {
      return NextResponse.json({
        success: true,
        data: VALIDATION_RULES
      });
    }
    
    const value = searchParams.get('value');
    let result: ValidationResult;
    
    switch (operation) {
      case 'session-id':
        if (!value) {
          return NextResponse.json(
            { success: false, error: 'value parameter is required' },
            { status: 400 }
          );
        }
        result = validateSessionId(value);
        break;
        
      case 'test-id':
        if (!value) {
          return NextResponse.json(
            { success: false, error: 'value parameter is required' },
            { status: 400 }
          );
        }
        result = validateTestId(value);
        break;
        
      case 'user-id':
        if (!value) {
          return NextResponse.json(
            { success: false, error: 'value parameter is required' },
            { status: 400 }
          );
        }
        result = validateUserId(value);
        break;
        
      case 'amount':
        const amount = searchParams.get('amount');
        if (!amount) {
          return NextResponse.json(
            { success: false, error: 'amount parameter is required' },
            { status: 400 }
          );
        }
        const numAmount = parseInt(amount);
        if (isNaN(numAmount)) {
          return NextResponse.json(
            { success: false, error: 'amount must be a valid number' },
            { status: 400 }
          );
        }
        result = validateAmount(numAmount);
        break;
        
      case 'email':
        if (!value) {
          return NextResponse.json(
            { success: false, error: 'value parameter is required' },
            { status: 400 }
          );
        }
        result = validateEmail(value);
        break;
        
      case 'date':
        if (!value) {
          return NextResponse.json(
            { success: false, error: 'value parameter is required' },
            { status: 400 }
          );
        }
        const fieldName = searchParams.get('fieldName') || 'Date';
        result = validateDateString(value, fieldName);
        break;
        
      case 'pricing-tier':
        if (!value) {
          return NextResponse.json(
            { success: false, error: 'value parameter is required' },
            { status: 400 }
          );
        }
        result = validatePricingTier(value);
        break;
        
      case 'gateway':
        if (!value) {
          return NextResponse.json(
            { success: false, error: 'value parameter is required' },
            { status: 400 }
          );
        }
        result = validateGateway(value);
        break;
        
      case 'payment-status':
        if (!value) {
          return NextResponse.json(
            { success: false, error: 'value parameter is required' },
            { status: 400 }
          );
        }
        result = validatePaymentStatus(value);
        break;
        
      case 'phone':
        if (!value) {
          return NextResponse.json(
            { success: false, error: 'value parameter is required' },
            { status: 400 }
          );
        }
        result = validatePhoneNumber(value);
        break;
        
      case 'url':
        if (!value) {
          return NextResponse.json(
            { success: false, error: 'value parameter is required' },
            { status: 400 }
          );
        }
        result = validateURL(value);
        break;
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid operation' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      data: result
    });
    
  } catch (error: any) {
    console.error('Error in validation utils GET:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// POST - Batch validation and complex validation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, data } = body;
    
    if (!operation) {
      return NextResponse.json(
        { success: false, error: 'operation is required' },
        { status: 400 }
      );
    }
    
    // Handle batch validation
    if (operation === 'batch') {
      if (!data || typeof data !== 'object') {
        return NextResponse.json(
          { success: false, error: 'data object is required for batch validation' },
          { status: 400 }
        );
      }
      
      const results: { [key: string]: ValidationResult } = {};
      let hasErrors = false;
      
      for (const [field, value] of Object.entries(data)) {
        let result: ValidationResult;
        
        switch (field) {
          case 'sessionId':
          case 'session_id':
            result = validateSessionId(value as string);
            break;
          case 'testId':
          case 'test_id':
            result = validateTestId(value as string);
            break;
          case 'userId':
          case 'user_id':
            result = validateUserId(value as string);
            break;
          case 'amount':
            result = validateAmount(value as number);
            break;
          case 'email':
            result = validateEmail(value as string);
            break;
          case 'pricingTier':
          case 'pricing_tier':
            result = validatePricingTier(value as string);
            break;
          case 'gateway':
            result = validateGateway(value as string);
            break;
          case 'paymentStatus':
          case 'payment_status':
            result = validatePaymentStatus(value as string);
            break;
          case 'phone':
          case 'phoneNumber':
          case 'phone_number':
            result = validatePhoneNumber(value as string);
            break;
          case 'url':
          case 'returnUrl':
          case 'return_url':
            result = validateURL(value as string);
            break;
          default:
            result = {
              isValid: false,
              errors: [`Unknown field: ${field}`]
            };
        }
        
        results[field] = result;
        if (!result.isValid) hasErrors = true;
      }
      
      return NextResponse.json({
        success: true,
        data: {
          isValid: !hasErrors,
          results,
          errorCount: Object.values(results).filter(r => !r.isValid).length
        }
      });
    }
    
    // Handle payment context validation
    if (operation === 'payment-context') {
      if (!data) {
        return NextResponse.json(
          { success: false, error: 'data is required for payment context validation' },
          { status: 400 }
        );
      }
      
      const errors: string[] = [];
      
      // Validate required fields
      const sessionIdResult = validateSessionId(data.originalSessionId || data.sessionId);
      if (!sessionIdResult.isValid) {
        errors.push(...sessionIdResult.errors.map(e => `Session: ${e}`));
      }
      
      const testIdResult = validateTestId(data.testId);
      if (!testIdResult.isValid) {
        errors.push(...testIdResult.errors);
      }
      
      if (data.sessionStartTime) {
        const startTimeResult = validateDateString(data.sessionStartTime, 'Session start time');
        if (!startTimeResult.isValid) {
          errors.push(...startTimeResult.errors);
        }
      }
      
      if (data.returnUrl) {
        const urlResult = validateURL(data.returnUrl);
        if (!urlResult.isValid) {
          errors.push(...urlResult.errors);
        }
      }
      
      if (data.timestamp && typeof data.timestamp !== 'number') {
        errors.push('Timestamp must be a number');
      }
      
      return NextResponse.json({
        success: true,
        data: {
          isValid: errors.length === 0,
          errors
        }
      });
    }
    
    // Handle payment completion validation
    if (operation === 'payment-completion') {
      if (!data) {
        return NextResponse.json(
          { success: false, error: 'data is required for payment completion validation' },
          { status: 400 }
        );
      }
      
      const errors: string[] = [];
      
      // Validate user ID
      const userIdResult = validateUserId(data.userId);
      if (!userIdResult.isValid) {
        errors.push(...userIdResult.errors);
      }
      
      // Validate session IDs
      const originalSessionResult = validateSessionId(data.originalSessionId);
      if (!originalSessionResult.isValid) {
        errors.push(...originalSessionResult.errors.map(e => `Original ${e}`));
      }
      
      const paymentSessionResult = validateSessionId(data.paymentSessionId);
      if (!paymentSessionResult.isValid) {
        errors.push(...paymentSessionResult.errors.map(e => `Payment ${e}`));
      }
      
      // Validate test ID
      const testIdResult = validateTestId(data.testId);
      if (!testIdResult.isValid) {
        errors.push(...testIdResult.errors);
      }
      
      // Validate gateway
      const gatewayResult = validateGateway(data.gateway);
      if (!gatewayResult.isValid) {
        errors.push(...gatewayResult.errors);
      }
      
      // Validate payment data
      if (!data.paymentData || typeof data.paymentData !== 'object') {
        errors.push('Payment data is required and must be an object');
      } else {
        const paymentData = data.paymentData;
        
        // Gateway-specific validation
        if (data.gateway === 'razorpay') {
          if (!paymentData.order_id || typeof paymentData.order_id !== 'string') {
            errors.push('Razorpay order ID is required');
          }
          if (!paymentData.payment_id || typeof paymentData.payment_id !== 'string') {
            errors.push('Razorpay payment ID is required');
          }
          if (!paymentData.razorpay_signature || typeof paymentData.razorpay_signature !== 'string') {
            errors.push('Razorpay signature is required');
          }
        } else if (data.gateway === 'paypal') {
          if (!paymentData.order_id || typeof paymentData.order_id !== 'string') {
            errors.push('PayPal order ID is required');
          }
          if (!paymentData.payment_id || typeof paymentData.payment_id !== 'string') {
            errors.push('PayPal payment ID is required');
          }
        }
        
        // Common validation
        const statusResult = validatePaymentStatus(paymentData.status);
        if (!statusResult.isValid) {
          errors.push(...statusResult.errors.map(e => `Payment ${e}`));
        }
        
        if (paymentData.amount !== undefined) {
          const amountResult = validateAmount(paymentData.amount);
          if (!amountResult.isValid) {
            errors.push(...amountResult.errors.map(e => `Payment ${e}`));
          }
        }
      }
      
      return NextResponse.json({
        success: true,
        data: {
          isValid: errors.length === 0,
          errors
        }
      });
    }
    
    // Handle sanitization
    if (operation === 'sanitize') {
      if (!data || typeof data !== 'object') {
        return NextResponse.json(
          { success: false, error: 'data object is required for sanitization' },
          { status: 400 }
        );
      }
      
      const sanitized: { [key: string]: any } = {};
      
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') {
          sanitized[key] = sanitizeString(value);
        } else {
          sanitized[key] = value;
        }
      }
      
      return NextResponse.json({
        success: true,
        data: sanitized
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid operation' },
      { status: 400 }
    );
    
  } catch (error: any) {
    console.error('Error in validation utils POST:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
