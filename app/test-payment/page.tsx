'use client';

import { useState, useEffect } from 'react';
import { processRazorpayPayment, getBothGatewayPricing } from '@/app/payment-gateway';

export default function TestPaymentPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [pricing, setPricing] = useState<any>(null);
  const [mockSessionId, setMockSessionId] = useState('');
  const [mockTestId, setMockTestId] = useState('');

  // Mock user data for testing
  const mockUser = {
    id: 'test-user-123',
    email: 'test@example.com',
    name: 'Test User',
  };

  // Generate IDs on client side only to avoid hydration mismatch
  useEffect(() => {
    setMockSessionId('test-session-' + Date.now());
    setMockTestId('test-' + Date.now());
  }, []);

  // Test pricing API
  const handleTestPricing = async () => {
    setLoading(true);
    try {
      const pricingData = await getBothGatewayPricing();
      setPricing(pricingData);
      console.log('✅ Pricing loaded:', pricingData);
    } catch (error: any) {
      console.error('❌ Pricing error:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Test Razorpay payment flow
  const handleTestRazorpay = async () => {
    setLoading(true);
    setResult(null);
    try {
      console.log('🚀 Starting Razorpay payment test...');
      
      const paymentResult = await processRazorpayPayment(
        mockSessionId,
        mockTestId,
        mockUser
      );
      
      console.log('✅ Payment result:', paymentResult);
      setResult(paymentResult);
    } catch (error: any) {
      console.error('❌ Payment error:', error);
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Payment Gateway Test Page</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Test Razorpay payment integration with India location
      </p>

      {/* Test Info */}
      <div style={{ 
        background: '#f5f5f5', 
        padding: '15px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3>Test Configuration:</h3>
        <ul>
          <li><strong>User ID:</strong> {mockUser.id}</li>
          <li><strong>Email:</strong> {mockUser.email}</li>
          <li><strong>Session ID:</strong> {mockSessionId}</li>
          <li><strong>Test ID:</strong> {mockTestId}</li>
          <li><strong>Location:</strong> India (isIndia: true)</li>
          <li><strong>Gateway:</strong> Razorpay</li>
        </ul>
      </div>

      {/* Test Buttons */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={handleTestPricing}
          disabled={loading}
          style={{
            padding: '12px 24px',
            background: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
          }}
        >
          {loading ? 'Loading...' : 'Test Pricing API'}
        </button>

        <button
          onClick={handleTestRazorpay}
          disabled={loading}
          style={{
            padding: '12px 24px',
            background: '#3399cc',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
          }}
        >
          {loading ? 'Processing...' : 'Test Razorpay Payment'}
        </button>
      </div>

      {/* Pricing Display */}
      {pricing && (
        <div style={{
          background: '#e8f5e9',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
        }}>
          <h3>Pricing Data:</h3>
          <pre style={{ overflow: 'auto', fontSize: '12px' }}>
            {JSON.stringify(pricing, null, 2)}
          </pre>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div style={{
          background: result.success ? '#e8f5e9' : '#ffebee',
          padding: '15px',
          borderRadius: '8px',
          marginTop: '20px',
        }}>
          <h3>Payment Result:</h3>
          <pre style={{ overflow: 'auto', fontSize: '12px' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {/* Instructions */}
      <div style={{
        marginTop: '40px',
        padding: '20px',
        background: '#fff3cd',
        borderRadius: '8px',
      }}>
        <h3>Testing Instructions:</h3>
        <ol>
          <li>Click "Test Pricing API" to verify pricing endpoint works</li>
          <li>Click "Test Razorpay Payment" to open payment modal</li>
          <li>Check browser console for detailed logs</li>
          <li>Use Razorpay test cards to complete payment</li>
        </ol>
        <p style={{ marginTop: '15px' }}>
          <strong>Razorpay Test Card:</strong><br />
          Card: 4111 1111 1111 1111<br />
          CVV: Any 3 digits<br />
          Expiry: Any future date
        </p>
      </div>
    </div>
  );
}
