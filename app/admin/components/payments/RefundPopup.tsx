'use client';

import React, { useState } from 'react';
import { X, CreditCard, Search, CheckCircle, AlertTriangle, XCircle, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

// Note: RefundPopup is migrated but refund API services need to be implemented
// For now, this component will show UI but refund functionality is disabled

// Type stubs
type PayPalTransactionLookupResult = any;
type PayPalRefundResult = any;
type RazorpayTransactionLookupResult = any;
type RazorpayRefundResult = any;
type RefundRequest = any;

// API functions using Next.js routes
const lookupPayPalTransaction = async (id: string): Promise<any> => {
  const response = await fetch(`/api/admin/refund/paypal/lookup?transactionId=${id}`);
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Failed to lookup PayPal transaction');
  return result;
};

const processPayPalRefund = async (data: any): Promise<any> => {
  const response = await fetch('/api/admin/refund/paypal/process', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  return result;
};

const lookupRazorpayTransaction = async (id: string): Promise<any> => {
  const response = await fetch(`/api/admin/refund/razorpay/lookup?paymentId=${id}`);
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Failed to lookup Razorpay transaction');
  return result;
};

const processRazorpayRefund = async (data: any): Promise<any> => {
  const response = await fetch('/api/admin/refund/razorpay/process', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  return result;
};

const formatRazorpayAmount = (amount: number): string => {
  return (amount / 100).toFixed(2);
};

const initiateRefund = async (request: RefundRequest): Promise<any> => {
  const response = await fetch('/api/admin/refund', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  const result = await response.json();
  return result;
};


interface RefundPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

type Gateway = 'paypal' | 'razorpay' | null;
type Step = 'gateway-selection' | 'transaction-input' | 'transaction-details' | 'refund-processing';
type TransactionLookupResult = PayPalTransactionLookupResult | RazorpayTransactionLookupResult;
type RefundResult = PayPalRefundResult | RazorpayRefundResult;

const RefundPopup: React.FC<RefundPopupProps> = ({ isOpen, onClose }) => {
  // State management
  const [currentStep, setCurrentStep] = useState<Step>('gateway-selection');
  const [selectedGateway, setSelectedGateway] = useState<Gateway>(null);
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<TransactionLookupResult | null>(null);
  const [refundResult, setRefundResult] = useState<RefundResult | null>(null);

  // Helper function to save refund tracking data
  const saveRefundTrackingData = async (
    gateway: string,
    transactionId: string,
    lookupData: TransactionLookupResult,
    refundData: RefundResult
  ) => {
    try {
      // Debug log to see the actual data structure
      console.log('🔍 Debug - Lookup data structure:', JSON.stringify(lookupData, null, 2));
      console.log('🔍 Debug - Database data:', JSON.stringify(lookupData.database_data, null, 2));
      console.log('🔍 Debug - User data:', JSON.stringify(lookupData.database_data?.user_data, null, 2));
      
      const refundRequest: RefundRequest = {
        transaction_id: lookupData.database_data?.transaction_id || null,
        payment_id: gateway === 'razorpay' ? transactionId : lookupData.database_data?.payment_id || '',
        order_id: lookupData.database_data?.order_id || '',
        session_id: lookupData.database_data?.session_id || '',
        testid: lookupData.database_data?.testid || null,
        user_id: lookupData.database_data?.user_data?.user_id || 
                  lookupData.database_data?.user_id || 
                  lookupData.database_data?.userId || 
                  lookupData.database_data?.userid || '',
        refund_amount: (() => {
          if (gateway === 'paypal' && 'paypal_data' in lookupData && lookupData.paypal_data) {
            // PayPal v2 API returns amount in dollars - convert to cents for storage
            return Math.round(parseFloat(lookupData.paypal_data.amount?.value || '0') * 100);
          } else if (gateway === 'razorpay' && 'razorpay_data' in lookupData && lookupData.razorpay_data) {
            // Razorpay amount is already in paise - use as is
            return lookupData.razorpay_data.amount;
          }
          return lookupData.database_data?.total_paid || 0;
        })(),
        original_amount: lookupData.database_data?.total_paid || 0,
        currency: gateway === 'razorpay' ? 'INR' : 'USD',
        gateway: gateway === 'razorpay' ? 'Razorpay' : gateway === 'paypal' ? 'paypal' : gateway,
        reason: 'admin_refund',
        admin_notes: refundData.success 
          ? `Admin processed refund via ${gateway} gateway - SUCCESS`
          : `Admin attempted refund via ${gateway} gateway - FAILED: ${refundData.error || refundData.message}`,
        initiated_by: 'admin', // You might want to get actual admin user ID
        customer_name: lookupData.database_data?.user_data?.user_name || '',
        customer_email: lookupData.database_data?.user_data?.email || '',
        customer_mobile: lookupData.database_data?.user_data?.mobile_number || '',
        original_transaction_data: lookupData.database_data || {},
        // Map gateway refund ID correctly for both gateways
        gateway_refund_id: refundData.success ? (refundData.refund_id || refundData.id) : null,
        gateway_refund_status: refundData.success ? (refundData.status || refundData.state) : null,
      };

      const result = await initiateRefund(refundRequest);
      
      if (result.success) {
        console.log(`✅ Refund ${refundData.success ? 'success' : 'failure'} tracking data saved successfully`);
        if (!refundData.success) {
          toast.info('Refund attempt tracked in system (failed refund logged)');
        }
      } else {
        console.error('❌ Failed to save refund tracking data:', result.error);
        // Don't fail the main refund process if tracking fails
        toast.error(`Refund ${refundData.success ? 'processed' : 'attempt'} but tracking data not saved: ` + result.error);
      }
    } catch (error: any) {
      console.error('❌ Error saving refund tracking data:', error);
      // Don't fail the main refund process if tracking fails
      toast.error(`Refund ${refundData.success ? 'processed' : 'attempt'} but tracking failed: ` + error.message);
    }
  };

  // Reset state when popup closes
  const handleClose = () => {
    setCurrentStep('gateway-selection');
    setSelectedGateway(null);
    setTransactionId('');
    setLookupResult(null);
    setRefundResult(null);
    setLoading(false);
    onClose();
  };

  // Handle gateway selection
  const handleGatewaySelect = (gateway: Gateway) => {
    setSelectedGateway(gateway);
    setCurrentStep('transaction-input');
  };

  // Handle transaction lookup
  const handleTransactionLookup = async () => {
    if (!transactionId.trim()) {
      toast.error(`Please enter a ${selectedGateway === 'razorpay' ? 'payment ID' : 'transaction ID'}`);
      return;
    }

    if (!selectedGateway) {
      toast.error('Please select a payment gateway');
      return;
    }

    setLoading(true);
    try {
      let result: TransactionLookupResult;
      
      if (selectedGateway === 'paypal') {
        result = await lookupPayPalTransaction(transactionId.trim());
      } else if (selectedGateway === 'razorpay') {
        result = await lookupRazorpayTransaction(transactionId.trim());
      } else {
        throw new Error('Unsupported gateway');
      }
      
      setLookupResult(result);
      setCurrentStep('transaction-details');
    } catch (error: any) {
      toast.error('Failed to lookup transaction: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle refund processing
  const handleProcessRefund = async () => {
    if (!lookupResult?.can_refund) {
      toast.error('Cannot process refund for this transaction');
      return;
    }

    if (!selectedGateway) {
      toast.error('Please select a payment gateway');
      return;
    }

    setLoading(true);
    setCurrentStep('refund-processing');

    try {
      let refund: RefundResult;
      
      if (selectedGateway === 'paypal') {
        if (!('paypal_data' in lookupResult) || !lookupResult.paypal_data) {
          throw new Error('PayPal transaction data not found');
        }
        
        // Extract amount and currency from PayPal data
        const refundAmount = lookupResult.paypal_data.amount?.value || '0';
        const refundCurrency = lookupResult.paypal_data.amount?.currency_code || 'USD';
        
        refund = await processPayPalRefund({
          transaction_id: transactionId,
          amount: refundAmount,
          currency: refundCurrency,
          description: `Admin refund for transaction ${transactionId}`,
        });
      } else if (selectedGateway === 'razorpay') {
        if (!('razorpay_data' in lookupResult) || !lookupResult.razorpay_data) {
          throw new Error('Razorpay transaction data not found');
        }
        
        // Amount is already in paise, no conversion needed
        const refundAmountInPaise = lookupResult.razorpay_data.amount;
        
        refund = await processRazorpayRefund({
          payment_id: transactionId,
          amount: refundAmountInPaise, // Pass amount in paise
          notes: { reason: 'Admin refund', admin_processed: 'true' },
          speed: 'normal',
        });
      } else {
        throw new Error('Unsupported gateway');
      }
      
      setRefundResult(refund);
      
      // Save refund tracking data for both successful and failed refunds
      await saveRefundTrackingData(selectedGateway, transactionId, lookupResult, refund);
      
      if (refund.success) {
        toast.success('Refund processed successfully!');
      } else {
        toast.error('Refund failed: ' + refund.error);
      }
    } catch (error: any) {
      toast.error('Failed to process refund: ' + error.message);
      setRefundResult({
        success: false,
        error: error.message,
        message: 'Failed to process refund',
      });
    } finally {
      setLoading(false);
    }
  };

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return {
          className: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          label: 'Verified ✓'
        };
      case 'UNRECORDED':
        return {
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: AlertTriangle,
          label: 'Unrecorded ⚠️'
        };
      case 'NOT_IN_PAYPAL':
        return {
          className: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
          label: 'Not in PayPal ❌'
        };
      case 'NOT_IN_RAZORPAY':
        return {
          className: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
          label: 'Not in Razorpay ❌'
        };
      case 'NOT_FOUND':
        return {
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: XCircle,
          label: 'Not Found ❌'
        };
      default:
        return {
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: XCircle,
          label: 'Unknown'
        };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Process Refund
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-semibold"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Step 1: Gateway Selection */}
          {currentStep === 'gateway-selection' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Payment Gateway</h3>
                <p className="text-gray-600">Choose the payment gateway to process the refund</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* PayPal Option */}
                <button
                  onClick={() => handleGatewaySelect('paypal')}
                  className="flex flex-col items-center p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">PayPal</h4>
                  <p className="text-sm text-gray-600 text-center mt-1">Process refund via PayPal</p>
                </button>

                {/* Razorpay Option */}
                <button
                  onClick={() => handleGatewaySelect('razorpay')}
                  className="flex flex-col items-center p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Razorpay</h4>
                  <p className="text-sm text-gray-600 text-center mt-1">Process refund via Razorpay</p>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Transaction Input */}
          {currentStep === 'transaction-input' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Enter {selectedGateway === 'paypal' ? 'PayPal' : 'Razorpay'} Transaction ID
                </h3>
                <p className="text-gray-600">Enter the transaction ID to lookup and verify the payment</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {selectedGateway === 'razorpay' ? 'Payment ID' : 'Transaction ID'}
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder={
                      selectedGateway === 'paypal' 
                        ? 'PAY-XXXXXXXXXX or sale ID' 
                        : selectedGateway === 'razorpay'
                        ? 'pay_XXXXXXXXXX'
                        : 'Transaction ID'
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setCurrentStep('gateway-selection')}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    disabled={loading}
                  >
                    Back
                  </button>
                  <button
                    onClick={handleTransactionLookup}
                    disabled={loading || !transactionId.trim()}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {loading ? 'Checking...' : 'Check Transaction'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Transaction Details */}
          {currentStep === 'transaction-details' && lookupResult && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Transaction Details</h3>
                <div className="flex justify-center">
                  {(() => {
                    const badge = getStatusBadge(lookupResult.status);
                    const Icon = badge.icon;
                    return (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${badge.className}`}>
                        <Icon className="h-4 w-4 mr-2" />
                        {badge.label}
                      </span>
                    );
                  })()}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 text-center mb-4">{lookupResult.message}</p>
                
                {/* Database Data */}
                {lookupResult.database_data && (
                  <div className="mb-4 p-3 bg-white rounded border">
                    <h4 className="font-medium text-gray-900 mb-2">📊 Database Information</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="font-medium">User:</span> {lookupResult.database_data.user_data?.user_name || 'N/A'}</div>
                      <div><span className="font-medium">Email:</span> {lookupResult.database_data.user_data?.email || 'N/A'}</div>
                      <div><span className="font-medium">Test ID:</span> {lookupResult.database_data.testid}</div>
                      <div><span className="font-medium">Amount:</span> 
                        {selectedGateway === 'razorpay' 
                          ? `₹${(lookupResult.database_data.total_paid / 100).toFixed(2)}`
                          : `$${(lookupResult.database_data.total_paid / 100).toFixed(2)}`
                        }
                      </div>
                      <div className="col-span-2"><span className="font-medium">Date:</span> {new Date(lookupResult.database_data.payment_completed_time || lookupResult.database_data.session_start_time).toLocaleString()}</div>
                    </div>
                  </div>
                )}

                {/* PayPal Data */}
                {'paypal_data' in lookupResult && lookupResult.paypal_data && (
                  <div className="mb-4 p-3 bg-white rounded border">
                    <h4 className="font-medium text-gray-900 mb-2">💳 PayPal Information</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="font-medium">Amount:</span> {lookupResult.paypal_data.amount?.currency_code || 'USD'} {lookupResult.paypal_data.amount?.value || '0.00'}</div>
                      <div><span className="font-medium">Status:</span> {lookupResult.paypal_data.status}</div>
                      <div className="col-span-2"><span className="font-medium">Created:</span> {new Date(lookupResult.paypal_data.create_time).toLocaleString()}</div>
                      <div className="col-span-2"><span className="font-medium">Capture ID:</span> {lookupResult.paypal_data.id}</div>
                      {lookupResult.paypal_data.final_capture && (
                        <div className="col-span-2"><span className="font-medium">Final Capture:</span> {lookupResult.paypal_data.final_capture ? 'Yes' : 'No'}</div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Razorpay Data */}
                {'razorpay_data' in lookupResult && lookupResult.razorpay_data && (
                  <div className="mb-4 p-3 bg-white rounded border">
                    <h4 className="font-medium text-gray-900 mb-2">💳 Razorpay Information</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="font-medium">Amount:</span> {lookupResult.razorpay_data.currency} {formatRazorpayAmount(lookupResult.razorpay_data.amount)}</div>
                      <div><span className="font-medium">Status:</span> {lookupResult.razorpay_data.status}</div>
                      <div><span className="font-medium">Method:</span> {lookupResult.razorpay_data.method}</div>
                      <div><span className="font-medium">Captured:</span> {lookupResult.razorpay_data.captured ? 'Yes' : 'No'}</div>
                      <div><span className="font-medium">Refunded:</span> ₹{formatRazorpayAmount(lookupResult.razorpay_data.amount_refunded)}</div>
                      <div><span className="font-medium">Order ID:</span> {lookupResult.razorpay_data.order_id}</div>
                      <div className="col-span-2"><span className="font-medium">Created:</span> {new Date(lookupResult.razorpay_data.created_at * 1000).toLocaleString()}</div>
                      <div className="col-span-2"><span className="font-medium">Payment ID:</span> {lookupResult.razorpay_data.id}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setCurrentStep('transaction-input')}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
                {lookupResult.can_refund && (
                  <button
                    onClick={handleProcessRefund}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Process Refund
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Refund Processing/Result */}
          {currentStep === 'refund-processing' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {loading ? 'Processing Refund...' : 'Refund Result'}
                </h3>
                
                {loading && (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                )}

                {refundResult && !loading && (
                  <div className={`p-4 rounded-lg ${refundResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-center justify-center mb-2">
                      {refundResult.success ? (
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      ) : (
                        <XCircle className="h-8 w-8 text-red-600" />
                      )}
                    </div>
                    
                    <h4 className={`font-semibold mb-2 ${refundResult.success ? 'text-green-800' : 'text-red-800'}`}>
                      {refundResult.success ? 'Refund Successful!' : 'Refund Failed'}
                    </h4>
                    
                    <p className={`text-sm ${refundResult.success ? 'text-green-700' : 'text-red-700'}`}>
                      {refundResult.message}
                    </p>
                    
                    {refundResult.success && (
                      <div className="mt-3 text-sm text-green-700">
                        <p><strong>Refund ID:</strong> {refundResult.refund_id}</p>
                        <p><strong>Amount:</strong> 
                          {selectedGateway === 'razorpay' && 'amount' in refundResult && typeof refundResult.amount === 'number'
                            ? `₹${formatRazorpayAmount(refundResult.amount)}`
                            : `${refundResult.currency} ${refundResult.amount}`
                          }
                        </p>
                        <p><strong>Status:</strong> {'state' in refundResult ? refundResult.state : refundResult.status}</p>
                        {'speed' in refundResult && refundResult.speed && (
                          <p><strong>Speed:</strong> {refundResult.speed}</p>
                        )}
                      </div>
                    )}
                    
                    {!refundResult.success && refundResult.error && (
                      <div className="mt-3 text-sm text-red-700">
                        <p><strong>Error:</strong> {refundResult.error}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {!loading && (
                <div className="flex justify-center">
                  <button
                    onClick={handleClose}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RefundPopup;