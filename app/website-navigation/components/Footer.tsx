'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Mail } from 'lucide-react';
import Link from 'next/link';
import { useSectionRevealAnimation } from '../../home/hooks/useSectionRevealAnimation';

const Footer = () => {
  // Footer main content animation
  const footerAnimation = useSectionRevealAnimation({
    variant: 'fade-up' as const,
    once: false,
    threshold: { desktop: 0.2, mobile: 0.1 },
    duration: 0.7,
    staggerChildren: 0.15,
    delayChildren: 0.1
  });

  // Copyright section animation
  const copyrightAnimation = useSectionRevealAnimation({
    variant: 'fade-up' as const,
    once: false,
    threshold: { desktop: 0.3, mobile: 0.2 },
    duration: 0.6,
    staggerChildren: 0.1,
    delayChildren: 0.3
  });

  // Social media button variants
  const socialButtonVariants = {
    hidden: { 
      scale: 0,
      rotate: -180,
      opacity: 0
    },
    visible: { 
      scale: 1,
      rotate: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 15
      }
    },
    hover: {
      scale: 1.1,
      y: -3,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 25
      }
    },
    tap: {
      scale: 0.95
    }
  };

  // Navigation link variants
  const linkVariants = {
    hidden: {
      opacity: 0,
      x: -20
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4
      }
    },
    hover: {
      x: 5,
      color: "#ffffff",
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 25
      }
    }
  };

  // CTA button variants
  const ctaVariants = {
    hidden: {
      scale: 0.8,
      opacity: 0,
      y: 20
    },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 150,
        damping: 15
      }
    },
    hover: {
      scale: 1.05,
      y: -2,
      boxShadow: "0 10px 25px rgba(255, 255, 255, 0.2)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    },
    tap: {
      scale: 0.98
    }
  };

  // Logo animation variants
  const logoVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      rotate: -10
    },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring" as const,
        stiffness: 150,
        damping: 15,
        delay: 0.1
      }
    },
    hover: {
      scale: 1.05,
      rotate: 2,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 25
      }
    }
  };

  return (
    <footer className="bg-neutral-800 backdrop-blur-xl border border-neutral-200 text-white py-12">
      <div className="container mx-auto px-6">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-8"
          ref={footerAnimation.ref}
          variants={footerAnimation.parentVariants}
          initial="hidden"
          animate={footerAnimation.controls}
        >
          {/* Brand Section */}
          <motion.div 
            className="space-y-4"
            variants={footerAnimation.childVariants}
          >
            <motion.a 
              href="/" 
              className="block"
              variants={logoVariants}
              whileHover="hover"
            >
              <img 
                src="/lovable-uploads/ffcba562-8c6d-44dc-8607-53afc45d3a57.png" 
                alt="Fraternity Logo" 
                className="h-8 brightness-0 invert" 
              />
            </motion.a>
            <motion.p 
              className="text-white/80 font-gilroy-semibold"
              initial={{ opacity: 0, y: 10 }}
              animate={{ 
                opacity: footerAnimation.isInView ? 1 : 0,
                y: footerAnimation.isInView ? 0 : 10
              }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Shared Ambitions
            </motion.p>
          </motion.div>

          {/* Navigation Section */}
          <motion.div
            variants={footerAnimation.childVariants}
          >
            <motion.h3 
              className="text-lg font-gilroy-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: footerAnimation.isInView ? 1 : 0,
                y: footerAnimation.isInView ? 0 : 20
              }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Navigate
            </motion.h3>
            <motion.ul 
              className="space-y-2"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              initial="hidden"
              animate={footerAnimation.isInView ? "visible" : "hidden"}
            >
              {[
                { href: "/experience", text: "FratVilla" },
                { href: "/quest", text: "Quest" },
                { href: "/process", text: "Process" },
                { href: "/faq", text: "FAQ" }
              ].map((link, index) => (
                <motion.li key={link.href} variants={linkVariants}>
                  <motion.a 
                    href={link.href} 
                    className="text-white/70 hover:text-white transition-colors font-gilroy-regular"
                    variants={linkVariants}
                    whileHover="hover"
                  >
                    {link.text}
                  </motion.a>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          {/* Connect Section */}
          <motion.div
            variants={footerAnimation.childVariants}
          >
            <motion.h3 
              className="text-lg font-gilroy-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: footerAnimation.isInView ? 1 : 0,
                y: footerAnimation.isInView ? 0 : 20
              }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Connect
            </motion.h3>
            
            {/* Social Media Icons */}
            <motion.div 
              className="flex space-x-4 mb-4"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              initial="hidden"
              animate={footerAnimation.isInView ? "visible" : "hidden"}
            >
              {/* Instagram */}
              <motion.a 
                href="https://www.instagram.com/join.fraterny/?hl=en" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 rounded-lg transition-colors shadow-md hover:shadow-lg" 
                style={{
                  background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)'
                }}
                variants={socialButtonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Instagram size={20} color="white" />
              </motion.a>

              {/* X/Twitter */}
              <motion.a 
                href="https://x.com/frat_erny" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-black p-2 rounded-lg transition-colors flex items-center justify-center shadow-md hover:shadow-lg" 
                style={{
                  width: '36px',
                  height: '36px'
                }}
                variants={socialButtonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <img src="/lovable-uploads/61ec65a3-b814-47bf-95c0-67d3091504ad.png" alt="X Logo" className="w-5 h-5" />
              </motion.a>

              {/* Email */}
              <motion.a 
                href="mailto:support@fraterny.com?subject=User%20Query" 
                className="bg-cyan-500 hover:bg-cyan-600 p-2 rounded-lg transition-colors shadow-md hover:shadow-lg"
                variants={socialButtonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Mail size={20} color="white" />
              </motion.a>
            </motion.div>
            
            {/* Legal Links */}
            <motion.ul 
              className="space-y-2"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.08
                  }
                }
              }}
              initial="hidden"
              animate={footerAnimation.isInView ? "visible" : "hidden"}
            >
              {[
                { to: "/terms-and-conditions", text: "Terms and Conditions" },
                { to: "/privacy-policy", text: "Privacy Policy" },
                { to: "/terms-of-use", text: "Terms of Use" }
              ].map((link) => (
                <motion.li key={link.to} variants={linkVariants}>
                  <Link 
                    href={link.to} 
                    className="text-white/70 hover:text-white transition-colors font-gilroy-regular"
                  >
                    <motion.span
                      variants={linkVariants}
                      whileHover="hover"
                    >
                      {link.text}
                    </motion.span>
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          {/* CTA Section */}
          <motion.div 
            className="flex flex-col items-start"
            variants={footerAnimation.childVariants}
          >
            <motion.a 
              href="/quest" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="px-8 py-3 bg-white text-cyan-700 rounded-lg hover:bg-opacity-90 transition-colors font-gilroy-bold shadow-md hover:shadow-lg"
              whileTap="tap"
              initial="hidden"
              animate={footerAnimation.isInView ? "visible" : "hidden"}
            >
              Start Quest
            </motion.a>
          </motion.div>
        </motion.div>
        
        {/* Copyright Section */}
        <motion.div 
          className="text-center mt-12 pt-8 border-t border-white/20"
          ref={copyrightAnimation.ref}
          variants={copyrightAnimation.parentVariants}
          initial="hidden"
          animate={copyrightAnimation.controls}
        >
          <motion.div 
            className="mb-2"
            variants={copyrightAnimation.childVariants}
          >
            <motion.p 
              className="py-[9px] text-lg text-white font-gilroy-bold"
              variants={copyrightAnimation.childVariants}
            >
              FRATERNY
            </motion.p>
            <motion.p 
              className="text-white/70 font-gilroy-regular"
              variants={copyrightAnimation.childVariants}
            >
              <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link> / <Link href="/terms-of-use" className="hover:text-white transition-colors">Terms of Use</Link> / <Link href="/refund-policy" className="hover:text-white transition-colors">Refund & Cancellation Policy</Link>
            </motion.p>
          </motion.div>
          <motion.p 
            className="text-white/70 font-gilroy-regular"
            variants={copyrightAnimation.childVariants}
          >
            All Rights Reserved 2025
          </motion.p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;