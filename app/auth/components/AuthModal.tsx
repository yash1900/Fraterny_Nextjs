'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Target, TrendingUp, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LoginForm } from '../components/LoginForm';
import { RegisterForm } from '../components/RegisterForm';
import { VerificationMessage } from '../components/VerificationMessage';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultView?: 'login' | 'register';
  redirectTo?: string;
}

// Brand Features for modal
const BrandFeatures = () => {
  const features = [
    {
      icon: <Target className="w-5 h-5" />,
      title: "Discover Your Path",
      description: "Personalized assessments"
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: "Track Growth",
      description: "Monitor your progress"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Join Community",
      description: "Connect with others"
    }
  ];

  return (
    <div className="hidden md:block bg-gradient-to-br from-cyan-700 to-blue-900 rounded-l-xl p-8 text-white">
      <div className="flex items-center mb-6">
        <Sparkles className="w-8 h-8 mr-2" />
        <h3 className="text-2xl font-bold">FRAT</h3>
      </div>
      
      <p className="text-sm opacity-90 mb-8">
        Transform your journey with personalized insights
      </p>
      
      <div className="space-y-4">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start space-x-3"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              {feature.icon}
            </div>
            <div>
              <h4 className="font-semibold text-sm">{feature.title}</h4>
              <p className="text-xs opacity-80">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export function AuthModal({ 
  open, 
  onOpenChange, 
  defaultView = 'login',
  redirectTo = '/'
}: AuthModalProps) {
  const [activeView, setActiveView] = useState<'login' | 'register'>(defaultView);
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationError, setVerificationError] = useState(false);

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

  const handleLoginSuccess = () => {
    // Close modal on successful login
    onOpenChange(false);
  };

  // Reset state when modal closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset to default state when closing
      setTimeout(() => {
        setActiveView(defaultView);
        setVerificationEmailSent(false);
        setVerificationEmail('');
        setVerificationError(false);
      }, 300); // Wait for close animation
    }
    onOpenChange(open);
  };

  const isLogin = activeView === 'login';

  // Form animation variants
  const formVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0, 
      y: -10,
      transition: { duration: 0.2 }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden">
        {/* Hidden accessibility elements */}
        <DialogHeader className="sr-only">
          <DialogTitle>
            {isLogin ? 'Sign In' : 'Create Account'}
          </DialogTitle>
          <DialogDescription>
            {isLogin ? 'Sign in to your account' : 'Create a new account to get started'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 min-h-[600px]">
          {/* Brand Panel - Hidden on mobile */}
          <BrandFeatures />

          {/* Form Panel */}
          <div className="p-8 flex flex-col justify-center">
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
                  className="space-y-6"
                >
                  {/* Mobile Brand Header */}
                  <div className="md:hidden text-center mb-6">
                    <div className="flex items-center justify-center mb-2">
                      <Sparkles className="w-6 h-6 text-cyan-700 mr-2" />
                      <h2 className="text-2xl font-bold text-gray-900">FRAT</h2>
                    </div>
                    <p className="text-sm text-gray-600">Transform your journey</p>
                  </div>

                  {/* Form Header */}
                  <div className="text-center">
                    <h2 className="text-2xl font-gilroy-bold text-gray-900 mb-2">
                      {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-gray-600 text-sm font-gilroy-semibold">
                      {isLogin
                        ? 'Sign in to continue your journey'
                        : 'Join us and start your transformation'}
                    </p>
                  </div>

                  {/* Form Content */}
                  <div>
                    {isLogin ? (
                      <LoginForm 
                        redirectTo={redirectTo}
                      />
                    ) : (
                      <RegisterForm 
                        onRegistrationSuccess={handleRegistrationSuccess}
                      />
                    )}
                  </div>

                  {/* Toggle Link */}
                  <div className="text-center">
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
      </DialogContent>
    </Dialog>
  );
}