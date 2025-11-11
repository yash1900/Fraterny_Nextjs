'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Target, TrendingUp, Users } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from './cotexts/AuthContext';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { VerificationMessage } from './components/VerificationMessage';
import { ProcessingState } from './components/ProcessingState';
import type { Variants } from 'framer-motion';

// BrandPanel Component - Extracted from Auth.tsx
const BrandPanel = () => {
  const features = [
    {
      icon: <Target className="w-6 h-6" />,
      title: "Discover Your Path",
      description: "Personalized assessments to guide your journey"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Track Your Growth",
      description: "Monitor progress and celebrate milestones"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Join a Community",
      description: "Connect with like-minded individuals"
    }
  ];

  return (
    <div className="h-full flex flex-col justify-center p-8 md:p-12 text-white relative overflow-hidden bg-gradient-to-br from-cyan-700 to-blue-900">
      {/* Animated background effect */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        {/* Brand Header */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center mb-4"
          >
            <Sparkles className="w-10 h-10 mr-3" />
            <h2 className="text-4xl font-bold">FRAT</h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl opacity-90"
          >
            Transform your journey with personalized insights
          </motion.p>
        </div>

        {/* Features List */}
        <div className="space-y-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              className="flex items-start space-x-4"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm opacity-80">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Auth Page Component
export default function AuthPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isLoading, authReady, error, retryVerification } = useAuth();

  // State management
  const [activeView, setActiveView] = useState<'login' | 'register'>('login');
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationError, setVerificationError] = useState(false);

  // Get redirect destination from query params
  const fromQuery = searchParams.get('from');
  const from = fromQuery || '/';

  // Store the intended destination for Google OAuth
  useEffect(() => {
    console.log('🔍 Auth page - from path:', from);
    if (from !== '/') {
      sessionStorage.setItem('auth_redirect_from', from);
      console.log('✅ Stored in sessionStorage:', sessionStorage.getItem('auth_redirect_from'));
    }
  }, [from]);

  // Handle registration success
  const handleRegistrationSuccess = (
    email: string,
    needsEmailVerification: boolean,
    hasError: boolean = false
  ) => {
    if (needsEmailVerification) {
      setVerificationEmailSent(true);
      setVerificationEmail(email);
      setVerificationError(hasError);
    } else {
      setActiveView('login');
    }
  };

  // Show error state if there's an auth error
  if (error) {
    return (
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Authentication Error</h1>
          <p className="text-red-600">{error}</p>
          <button
            className="px-6 py-2 bg-gradient-to-br from-cyan-700 to-blue-900 text-white rounded-lg hover:from-cyan-800 hover:to-blue-950 transition-all text-base font-medium"
            onClick={retryVerification}
          >
            Retry Verification
          </button>
        </div>
      </div>
    );
  }

  const isLogin = activeView === 'login';


    const panelVariants = {
    left: {
        x: '0%',
        transition: {
        type: 'spring' as const,
        stiffness: 80,
        damping: 20,
        mass: 1,
        },
    },
    right: {
        x: '100%',
        transition: {
        type: 'spring' as const,
        stiffness: 80,
        damping: 20,
        mass: 1,
        },
    },
    };

    const formVariants: Variants = {
        hidden: {
            opacity: 0,
            y: 15,
            transition: { duration: 0.2 },
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
            duration: 0.5,
            delay: 0.3,
            ease: [0.4, 0, 0.2, 1],
            },
        },
        exit: {
            opacity: 0,
            y: -15,
            transition: {
            duration: 0.2,
            ease: [0.4, 0, 1, 1],
            },
        },
    };

  return (
    <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden" style={{ height: '800px' }}>
      <div className="h-full relative">
        {/* Mobile View - Stacked */}
        <div className="md:hidden h-full overflow-y-auto">
          {verificationEmailSent ? (
            <div className="p-8">
              <VerificationMessage
                email={verificationEmail}
                hasError={verificationError}
                onBackToSignIn={() => setVerificationEmailSent(false)}
              />
            </div>
          ) : (
            <div className="p-8">
              {/* Mobile Brand Header */}
              <div className="text-center mb-8 pb-8 border-b border-gray-200">
                <div className="flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-cyan-700 mr-2" />
                  <h1 className="text-3xl font-bold text-gray-900">FRAT</h1>
                </div>
                <p className="text-gray-600">Transform your journey</p>
              </div>

              {/* Form Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-gilroy-bold text-gray-900 mb-2">
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-gray-600 font-gilroy-semibold">
                  {isLogin
                    ? 'Sign in to continue your journey'
                    : 'Join us and start your transformation'}
                </p>
              </div>

              {/* Form Content */}
              {isLogin ? (
                <LoginForm redirectTo={from} />
              ) : (
                <RegisterForm onRegistrationSuccess={handleRegistrationSuccess} />
              )}

              {/* Toggle Link */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => setActiveView(isLogin ? 'register' : 'login')}
                  className="text-sm font-gilroy-semibold text-gray-600 hover:text-cyan-600 transition-colors"
                >
                  {isLogin ? (
                    <>
                      Don't have an account?{' '}
                      <span className="font-gilroy-bold text-cyan-600">Sign up</span>
                    </>
                  ) : (
                    <>
                      Already have an account?{' '}
                      <span className="font-gilroy-bold text-cyan-600">Sign in</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop View - Split Panel with Animation */}
        <div className="hidden md:flex h-full relative">
          {/* Brand Panel - Animated */}
          <motion.div
            className="absolute inset-y-0 w-1/2 h-full"
            initial={false}
            animate={isLogin ? 'left' : 'right'}
            variants={panelVariants}
          >
            <BrandPanel />
          </motion.div>

          {/* Form Panel - Animated */}
          <motion.div
            className="absolute inset-y-0 w-1/2 h-full bg-white"
            initial={false}
            animate={isLogin ? 'right' : 'left'}
            variants={panelVariants}
          >
            <div className="h-full flex items-center justify-center p-8 overflow-y-auto">
              <div className="w-full max-w-md">
                {verificationEmailSent ? (
                  <VerificationMessage
                    email={verificationEmail}
                    hasError={verificationError}
                    onBackToSignIn={() => setVerificationEmailSent(false)}
                  />
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeView}
                      variants={formVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      {/* Form Header */}
                      <div className="text-center mb-8">
                        <h2 className="text-3xl font-gilroy-bold text-gray-900 mb-2">
                          {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        <p className="text-gray-600 font-gilroy-semibold">
                          {isLogin
                            ? 'Sign in to continue your journey'
                            : 'Join us and start your transformation'}
                        </p>
                      </div>

                      {/* Form Content */}
                      {isLogin ? (
                        <LoginForm redirectTo={from} />
                      ) : (
                        <RegisterForm onRegistrationSuccess={handleRegistrationSuccess} />
                      )}

                      {/* Toggle Link */}
                      <div className="mt-6 text-center">
                        <button
                          onClick={() => setActiveView(isLogin ? 'register' : 'login')}
                          className="text-sm font-gilroy-semibold text-gray-600 hover:text-cyan-600 transition-colors"
                        >
                          {isLogin ? (
                            <>
                              Don't have an account?{' '}
                              <span className="font-gilroy-bold text-cyan-600">Sign up</span>
                            </>
                          ) : (
                            <>
                              Already have an account?{' '}
                              <span className="font-gilroy-bold text-cyan-600">Sign in</span>
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}