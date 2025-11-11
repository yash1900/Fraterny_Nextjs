import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, X, Globe, AlertCircle } from 'lucide-react';
import { isInAppBrowser, getInAppBrowserName, openInDefaultBrowser } from './inAppBrowserDetector';

interface BrowserPopupProps {
  onClose?: () => void;
}

const BrowserPopup: React.FC<BrowserPopupProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [appName, setAppName] = useState('');
  const [hasUserDismissed, setHasUserDismissed] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the popup in this session
    const dismissed = sessionStorage.getItem('browserPopupDismissed');
    if (dismissed === 'true') {
      setHasUserDismissed(true);
      return;
    }

    // Check if in an in-app browser
    if (isInAppBrowser()) {
      setIsVisible(true);
      setAppName(getInAppBrowserName());
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setHasUserDismissed(true);
    sessionStorage.setItem('browserPopupDismissed', 'true');
    if (onClose) onClose();
  };

  const handleOpenBrowser = () => {
    openInDefaultBrowser();
    // Keep popup open for a moment to show user the action was triggered
    setTimeout(() => {
      handleClose();
    }, 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    // You could add a toast notification here
  };

  if (hasUserDismissed || !isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            onClick={handleClose}
          />

          {/* Popup Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-x-4 top-16 -translate-y-1/2 max-w-md mx-auto z-[9999] md:inset-x-auto md:left-1/2 md:-translate-x-1/2"
          >
            <div className="relative overflow-hidden rounded-3xl">
              {/* Gradient background effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-cyan-400/20 to-blue-600/20" />
              
              {/* Glassmorphism container */}
              <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 p-8">
                
                {/* Close button */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>

                {/* Icon and Alert */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full blur-xl opacity-50" />
                    <div className="relative bg-gradient-to-br from-blue-400 to-cyan-400 p-4 rounded-full">
                      <Globe size={32} className="text-white" />
                    </div>
                  </div>
                </div>

                {/* Title and Description */}
                <div className="text-center mb-8">
                  <h2 className="text-4xl font-normal font-gilroy-bold text-white mb-3">
                    Open in Default Browser
                  </h2>
                  <p className="text-white/80 text-xl font-gilroy-regular">
                    For the best Quest Experience, we recommend using your default browser.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  {/* Primary CTA */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleOpenBrowser}
                    className="relative group overflow-hidden rounded-2xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 transition-transform group-hover:scale-110" />
                    <div className="relative bg-gradient-to-r from-blue-500/90 to-cyan-400/90 backdrop-blur-sm px-6 py-4 flex items-center justify-center gap-3">
                      <span className="text-white font-[600] text-xl font-gilroy-bold">
                        Open Browser
                      </span>
                      <ExternalLink size={20} className="text-white" />
                    </div>
                  </motion.button>

                  {/* Secondary CTA */}
                  <button
                    onClick={handleCopyLink}
                    className="px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 font-gilroy-semibold text-lg hover:bg-white/20 transition-colors"
                  >
                    Copy URL
                  </button>

                  {/* Continue anyway link */}
                  <button
                    onClick={handleClose}
                    className="text-white/60 text-base underline hover:text-white/80 transition-colors mt-2 font-gilroy-regular"
                  >
                    Continue on {appName}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BrowserPopup;