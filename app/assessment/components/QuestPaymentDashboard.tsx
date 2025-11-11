import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Filter,
  Home,
  FileText,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '@/app/auth/cotexts/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import axios from 'axios';

// Payment History interfaces
interface PaymentHistoryApiResponse {
  status: number;
  data: PaymentTransaction[];
}

interface PaymentTransaction {
  userId: string;
  sessionId: string;
  testId: string;
  amount: number | null;
  IsIndia: boolean | null;
  paymentStatus: 'success' | 'failed' | 'pending' | 'Start';
  paymentDate: string | null;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  gateway?: 'razorpay' | 'paypal' | null; // Added gateway field
}

interface QuestPaymentDashboardProps {
  className?: string;
}


const QuestPaymentDashboard: React.FC<QuestPaymentDashboardProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [navigationLoading, setNavigationLoading] = useState(false);
  const router = useRouter()
  const userId = user?.id

  // Format date helper function
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (err) {
      return dateString;
    }
  };

  // Format currency helper function with gateway-based logic
  const formatCurrency = (amount: number | null, isIndia: boolean | null, gateway?: 'razorpay' | 'paypal' | null): string => {
    if (amount === null) return 'N/A';
    
    // Gateway-based currency logic
    if (gateway === 'paypal') {
      // PayPal always shows dollar (ignore isIndia)
      return `$${amount.toFixed(2)}`;
    } else if (gateway === 'razorpay') {
      // Razorpay: check isIndia flag
      if (isIndia === true) {
        return `₹${amount.toFixed(2)}`;
      } else {
        return `$${amount.toFixed(2)}`;
      }
    } else {
      // Default logic when gateway is not available (current behavior)
      if (isIndia === true) {
        return `₹${amount.toFixed(2)}`;
      } else {
        return `$${amount.toFixed(2)}`;
      }
    }
  };


  // Get payment status details
  const getPaymentStatus = (status: string) => {
    switch (status) {
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-100',
          iconColor: 'text-green-500',
          textColor: 'text-green-600',
          statusText: 'Completed'
        };
      case 'failed':
        return {
          icon: XCircle,
          bgColor: 'bg-red-100',
          iconColor: 'text-red-500',
          textColor: 'text-red-600',
          statusText: 'Failed'
        };
      case 'pending':
        return {
          icon: Clock,
          bgColor: 'bg-yellow-100',
          iconColor: 'text-yellow-500',
          textColor: 'text-yellow-600',
          statusText: 'Pending'
        };
      case 'Start':
        return {
          icon: Clock,
          bgColor: 'bg-blue-100',
          iconColor: 'text-blue-500',
          textColor: 'text-blue-600',
          statusText: 'Started'
        };
      default:
        return {
          icon: Clock,
          bgColor: 'bg-gray-100',
          iconColor: 'text-gray-500',
          textColor: 'text-gray-600',
          statusText: 'Unknown'
        };
    }
  };

  // API function for fetching payment history
  const fetchPaymentHistory = async (): Promise<PaymentTransaction[]> => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment-history/${userId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            // Add authentication headers if required
            // 'Authorization': `Bearer ${userToken}`
          },
        }
      );

      console.log('Full API response:', response);
      console.log('Response data:', response.data);
      console.log('Is array?', Array.isArray(response.data));
      console.log('Type of response.data:', typeof response.data);

      // Handle both single object and array responses
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && typeof response.data === 'object') {
        // API returns single object, wrap it in an array
        return [response.data];
      } else {
        return [];
      }
    } catch (error) {
      console.error('Payment history fetch error:', error);
      throw error;
    }
  };

  // Fetch payment history data
  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!userId) {
          setError('User not authenticated');
          return;
        }

        console.log('Fetching payment history from API for user:', userId);
        const paymentData = await fetchPaymentHistory();

        console.log('API response data:', paymentData);

        // Check if paymentData is an array before filtering
        if (Array.isArray(paymentData)) {
          // Filter out duplicate entries and entries with 'Start' status that have null values
          const uniquePayments = paymentData.filter((payment, index, self) => {
            // Make sure payment is a valid object with required properties
            if (!payment || typeof payment !== 'object') return false;

            // Remove duplicates based on sessionId and testId
            const isDuplicate = self.findIndex(p =>
              p.sessionId === payment.sessionId &&
              p.testId === payment.testId &&
              p.paymentStatus === payment.paymentStatus
            ) !== index;

            // Keep successful payments and filter out 'Start' status entries with null amounts
            const shouldKeep = payment.paymentStatus === 'success' ||
              (payment.paymentStatus !== 'Start' && payment.amount !== null);

            return !isDuplicate && shouldKeep;
          });

          // Sort payments in descending order by date (latest first)
          const sortedPayments = uniquePayments.sort((a, b) => {
            // Handle null paymentDate by treating them as oldest
            if (!a.paymentDate && !b.paymentDate) return 0;
            if (!a.paymentDate) return 1;
            if (!b.paymentDate) return -1;
            
            const dateA = new Date(a.paymentDate).getTime();
            const dateB = new Date(b.paymentDate).getTime();
            return dateB - dateA; // Descending order (latest first)
          });

          setPayments(sortedPayments);
        } else {
          console.error('Payment data is not an array:', paymentData);
          setError('Invalid payment data received from server');
          setPayments([]);
        }
      } catch (err: any) {
        console.error('Payment history fetch error:', err);

        if (err.code === 'ECONNABORTED') {
          setError('Request timeout - please try again');
        } else if (err.response?.status === 404) {
          setError('No payment history found');
        } else if (err.response?.status === 401) {
          setError('Unauthorized - please log in again');
        } else {
          setError('Failed to load payment history');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, [userId]);

  // Navigation loading state
  if (navigationLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-400 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-lg text-gray-700 font-gilroy-bold">Loading assessments...</p>
          <div className="flex justify-center gap-1 mt-4">
            <div className="w-2 h-2 bg-blue-600 rounded-full" style={{animation: 'pulse 0.5s infinite alternate', animationDelay: '0s'}}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full" style={{animation: 'pulse 0.5s infinite alternate', animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full" style={{animation: 'pulse 0.5s infinite alternate', animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  // Data loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-400 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-lg text-gray-700 font-gilroy-bold">Loading payment history...</p>
          <div className="flex justify-center gap-1 mt-4">
            <div className="w-2 h-2 bg-blue-600 rounded-full" style={{animation: 'pulse 0.5s infinite alternate', animationDelay: '0s'}}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full" style={{animation: 'pulse 0.5s infinite alternate', animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full" style={{animation: 'pulse 0.5s infinite alternate', animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 font-gilroy-regular">
        <header className="bg-gradient-to-br from-cyan-600 to-blue-800 rounded-xl shadow-sm sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-center items-center">
              <h1 className="text-2xl md:text-3xl lg:text-4xl text-center font-gilroy-semibold text-white tracking-tighter">Payment</h1>
              <div className="w-6"></div>
            </div>
          </div>
        </header>

        <main className="p-4">
          <div className="text-center py-16">
            <div className="w-12 h-12 text-red-500 mx-auto mb-4">⚠️</div>
            <h3 className="text-lg font-gilroy-semibold text-gray-900 mb-2">Error Loading Payment History</h3>
            <p className="text-gray-600 font-gilroy-regular mb-4">{error}</p>
            <button
              onClick={() => router.push('/quest')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-gilroy-semibold"
            >
              Back to Quest
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative bg-gray-50 font-gilroy-regular">
      {/* Header */}
      <header className="bg-gradient-to-br from-cyan-600 to-blue-800 rounded-xl shadow-sm sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-center items-center">
              <h1 className="text-xl md:text-2xl lg:text-3xl text-center font-gilroy-semibold text-white tracking-tighter">Payment</h1>
              <div className="w-6"></div>
            </div>
          </div>
        </header>

      {/* Main Content */}
      <main className="p-4 pb-24">
        {payments.length === 0 ? (
          // Empty state
          <div className="text-center py-16">
            <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-gilroy-semibold text-gray-900 mb-2">No Payment History</h3>
            <p className="text-gray-600 font-gilroy-regular mb-6">You haven't made any payments yet.</p>
            {/* <button
              onClick={() => navigate('/assessment')}
              className="px-6 py-3 bg-gradient-to-br from-cyan-600 to-blue-800 text-white rounded-lg hover:bg-blue-700 transition-colors font-gilroy-semibold"
            >
              Take Your First Quest
            </button> */}
          </div>
        ) : (
          // Payment history list
          <div className="space-y-4">
            {payments.map((payment, index) => {
              const statusInfo = getPaymentStatus(payment.paymentStatus);
              const StatusIcon = statusInfo.icon;

              return (
                <motion.div
                  key={`${payment.sessionId}-${payment.testId}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div className={`${statusInfo.bgColor} p-3 rounded-lg mr-4`}>
                        <StatusIcon className={`w-6 h-6 ${statusInfo.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-base font-gilroy-semibold text-gray-800">
                          {payment.paymentStatus === 'success' ? 'Paid' : payment.paymentStatus === 'failed' ? 'Failed' : payment.paymentStatus === 'Start' ? 'Started' : 'Due'}
                          {payment.paymentDate ? ` on ${formatDate(payment.paymentDate)}` : ''}
                        </h2>
                        <p 
                          className=" text-xs font-gilroy-regular text-gray-500 cursor-pointer hover:text-gray-700 transition-colors" 
                          onClick={() => {
                            if (payment.razorpayPaymentId) {
                              navigator.clipboard.writeText(payment.razorpayPaymentId);
                              toast.success('Payment ID copied to clipboard!');
                            }
                          }}
                          title="Click to copy payment ID"
                        >
                          {payment.razorpayPaymentId}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`font-gilroy-semibold ${statusInfo.textColor}`}>
                        {formatCurrency(payment.amount ? payment.amount / 100 : null, payment.IsIndia, payment.gateway)}
                      </p>
                      <p className="text-xs font-gilroy-regular text-gray-400">{statusInfo.statusText}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      {/* <footer className="fixed bottom-0 left-0 right-0 bg-white shadow-t flex justify-around py-3 border-t">
        <div
          className="text-center text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
          onClick={() => navigate(`/quest-dashboard/${userId}`)}
        >
          <Home className="w-6 h-6 mx-auto" />
          <p className="text-xs font-gilroy-semibold">Home</p>
        </div>
        <div
          className="text-center text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
          onClick={() => {
            setNavigationLoading(true);
            setTimeout(() => {
              navigate(`/assessment-list/${userId}`);
            });
          }}
        >
          <FileText className="w-6 h-6 mx-auto" />
          <p className="text-xs font-gilroy-semibold">Results</p>
        </div>
        <div className="text-center text-blue-600">
          <CreditCard className="w-6 h-6 mx-auto" />
          <p className="text-xs font-gilroy-semibold">Payments</p>
        </div>
      </footer> */}
    </div>
  );
};

export default QuestPaymentDashboard;
