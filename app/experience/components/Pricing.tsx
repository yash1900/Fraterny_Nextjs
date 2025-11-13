
'use client'

import { motion } from 'framer-motion';
import Navigation from '@/app/website-navigation/components/Navigation';
import Footer from '@/app/website-navigation/components/Footer';
import { Check, Users, Hotel, Coffee, Award } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { lazy, Suspense, useEffect, useState } from 'react';
// import { formatRegistrationCloseDate } from '@/services/website-settings';
// import { useReactQueryWebsiteSettings } from '@/hooks/useReactQueryWebsiteSettings';
import ResponsiveImage from '@/components/ui/ResponsiveImage';
import { toast } from 'sonner';
import useSectionRevealAnimation from '@/app/assessment/hooks/useSectionRevealAnimation';
import PricingSection from './PricingSection';
import axios from 'axios';

const APPLICATION_FORM_URL = "https://docs.google.com/forms/d/1TTHQN3gG2ZtC26xlh0lU8HeiMc3qDJhfoU2tOh9qLQM/edit";
const LEARN_MORE_URL = "https://docs.google.com/forms/d/1lJIJPAbR3BqiLNRdRrUpuulDYPVGdYN34Th840/edit";
const EXECUTIVE_ESCAPE_MAIL = "mailto:support@fraterny.com?subject=Exclusive%20Escape%20Inquiry";

interface PricingTierProps {
  name: string;
  price: string;
  originalPrice?: string;
  features: string[];
  ctaText: string;
  ctaLink: string;
  isPopular?: boolean;
  applicationsReceived?: number | null;
  className?: string;
  animationDelay?: number;
}

interface WebsiteSettingsData {
  registration_days_left: number;
  available_seats: number;
  registration_close_date: string;
  accepting_applications_for_date: string;
  insider_access_price: string;
  insider_access_original_price: string;
  main_experience_price: string;
  main_experience_original_price: string;
  executive_escape_price: string;
  executive_escape_original_price: string;
  applications_received?: string;
}

const PricingTier = ({ 
  name, 
  price,
  originalPrice,
  features, 
  ctaText, 
  ctaLink, 
  isPopular = false,
  applicationsReceived = null,
  className = "",
  animationDelay = 0
}: PricingTierProps) => {
  // Individual card animation variants
  const cardVariants = {
    hidden: { 
      y: 60,
      opacity: 0,
      scale: 0.9
    },
    visible: { 
      y: 0,
      opacity: 1,
      scale: isPopular ? 1.05 : 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
        delay: animationDelay
      }
    },
    hover: {
      y: -12,
      scale: isPopular ? 1.08 : 1.03,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 25
      }
    }
  };

  // Badge animation variants
  const badgeVariants = {
    hidden: { 
      scale: 0,
      opacity: 0
    },
    visible: { 
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 15,
        delay: animationDelay + 0.2
      }
    }
  };

  // Feature list animation variants
  const featureVariants = {
    hidden: { 
      opacity: 0,
      x: -20
    },
    visible: { 
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut" as const
      }
    }
  };

  // Price animation variants
  const priceVariants = {
    hidden: { 
      opacity: 0,
      y: 20
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: animationDelay + 0.3
      }
    }
  };

  return (
    <motion.div 
      className={`p-6 rounded-xl border ${isPopular ? 'border-black shadow-lg' : 'border-gray-200'} bg-white ${className} group cursor-pointer`}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      whileHover="hover"
      viewport={{ once: true, margin: "-50px" }}
    >
      {/* Badges with scale animation */}
      <div className="flex flex-wrap gap-2 mb-4">
        {isPopular && (
          <motion.div
            variants={badgeVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Badge variant="secondary" className="bg-black text-white font-gilroy-medium">
              Most Popular
            </Badge>
          </motion.div>
        )}
        
        {applicationsReceived !== null && (
          <motion.div
            variants={badgeVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: animationDelay + 0.25 }}
          >
            <Badge variant="outline" className="border-black text-navy bg-transparent font-gilroy-medium">
              {applicationsReceived} Applications received
            </Badge>
          </motion.div>
        )}
      </div>

      {/* Title with fade up */}
      <motion.h3 
        className="text-xl font-gilroy-bold font-bold mb-2"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: animationDelay + 0.1, duration: 0.5 }}
      >
        {name}
      </motion.h3>

      {/* Price section with slide up */}
      <motion.div 
        className="mb-6"
        variants={priceVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {originalPrice && (
          <motion.div 
            className="text-sm text-gray-400 line-through mb-1 font-gilroy-regular"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: animationDelay + 0.4, duration: 0.3 }}
          >
            {originalPrice}
          </motion.div>
        )}
        <motion.span 
          className="text-2xl font-gilroy-semibold text-navy"
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 15, 
            delay: animationDelay + 0.5 
          }}
          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
        >
          {price}
        </motion.span>
      </motion.div>

      {/* Features list with staggered animation */}
      <ul className="space-y-3 mb-6">
        {features.map((feature: string, index: number) => (
          <motion.li 
            key={index} 
            className="flex items-center gap-2"
            variants={featureVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: animationDelay + 0.6 + (index * 0.1) }}
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 15, 
                delay: animationDelay + 0.7 + (index * 0.1) 
              }}
            >
              <Check size={18} className="text-black flex-shrink-0" />
            </motion.div>
            <span className="text-gray-600 font-gilroy-black">{feature}</span>
          </motion.li>
        ))}
      </ul>

      {/* CTA Button with enhanced hover */}
      <motion.a
        href={ctaLink}
        target="_blank"
        rel="noopener noreferrer"
        className={`block text-center py-2 px-4 rounded-lg transition-colors ${
          isPopular 
            ? ' bg-black text-white hover:bg-opacity-90' 
            : 'border border-navy text-navy hover:bg-navy hover:text-white'
        }`}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: animationDelay + 0.8, duration: 0.5 }}
        whileHover={{ 
          scale: 1.05,
          boxShadow: isPopular 
            ? "0 8px 25px rgba(224, 122, 95, 0.3)" 
            : "0 8px 25px rgba(10, 26, 47, 0.2)"
        }}
        whileTap={{ scale: 0.98 }}
        style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
      >
        {ctaText}
      </motion.a>
    </motion.div>
  );
};

interface FeatureCardProps {
  icon: React.ComponentType<{ size: number; className: string }>;
  title: string;
  description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => (
  <div className="flex gap-4 items-start">
    <div className="p-2 rounded-full bg-navy/5">
      <Icon size={24} className="text-navy" />
    </div>
    <div>
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  </div>
);



const Pricing = () => {
//   const { settings, isLoading } = useReactQueryWebsiteSettings();
const [settings, setSettings] = useState<WebsiteSettingsData | null>(null);
const [loading, setLoading] = useState(true);

const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings');
      console.log(`response is: ${response}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      console.log(data);
      
      setSettings(data);
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
};

useEffect(() => {
    fetchSettings();
}, []);

  
  // Animation configurations for different sections
  
  // Hero section animations
  const heroTitleAnimation = useSectionRevealAnimation({
    variant: 'fade-up',
    once: true,
    duration: 0.8,
    staggerChildren: 0.3
  });

  // Pricing cards animation
  const pricingCardsAnimation = useSectionRevealAnimation({
    variant: 'slide-up',
    once: true,
    duration: 0.6,
    staggerChildren: 0.2,
    delayChildren: 0.2
  });

  const prices = {
    insiderAccess: settings?.insider_access_price || "₹499/month",
    insiderAccessOriginal: settings?.insider_access_original_price || "₹699/month",
    mainExperience: settings?.main_experience_price || "₹45,000 - ₹60,000",
    mainExperienceOriginal:  settings?.main_experience_original_price || "₹65,000 - ₹80,000",
    executiveEscape: settings?.executive_escape_price || "₹1,50,000+",
    executiveEscapeOriginal: settings?.executive_escape_original_price || "₹1,85,000+",
    spotsRemaining: settings?.available_seats || 5,
    applicationsReceived: settings?.applications_received ? parseInt(settings.applications_received) : null
  };

  return (
    <div className="min-h-screen bg-white">
      
      {/* Hero Section */}
      <section className=" text-white relative overflow-hidden">
        

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl">
            
            {/* Hero Title with scroll animation */}
            <motion.div
              ref={heroTitleAnimation.ref}
              variants={heroTitleAnimation.parentVariants}
              initial="hidden"
              animate={heroTitleAnimation.controls}
            >
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Cards Section */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          
          {/* Pricing Cards Grid */}
          <motion.div 
            className="grid md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto"
            ref={pricingCardsAnimation.ref}
            variants={pricingCardsAnimation.parentVariants}
            initial="hidden"
            animate={pricingCardsAnimation.controls}
          >
            <motion.div variants={pricingCardsAnimation.childVariants}>
              <PricingTier
                name="Insider Access"
                price={prices.insiderAccess}
                originalPrice={prices.insiderAccessOriginal}
                features={[
                  "Digital Content Only",
                  "Digital Resources",
                  "No Community Access",
                  "No Accommodation",
                  "No Dining & Activities"
                ]}
                ctaText="Learn More"
                ctaLink={LEARN_MORE_URL}
                animationDelay={0}
              />
            </motion.div>

            <motion.div variants={pricingCardsAnimation.childVariants}>
              <PricingTier
                name="The Main Experience"
                price={prices.mainExperience}
                originalPrice={prices.mainExperienceOriginal}
                features={[
                  "In-Person Retreat",
                  "Exclusive Cohort (20 People)",
                  "Interactive & Hands-on Workshops",
                  "Shared 10+BHK Luxury Villa",
                  "Gourmet Meals and Group Activities",
                  "Lifetime access to the exclusive Fraterny Community"
                ]}
                ctaText="Apply Now"
                ctaLink={APPLICATION_FORM_URL}
                isPopular={true}
                applicationsReceived={prices.applicationsReceived}
                animationDelay={0.1}
              />
            </motion.div>

            <motion.div variants={pricingCardsAnimation.childVariants}>
              <PricingTier
                name="Executive Escape"
                price={prices.executiveEscape}
                originalPrice={prices.executiveEscapeOriginal}
                features={[
                  "Private Luxury Experience",
                  "8-10 People Only",
                  "Complete Flexibility",
                  "Private Master Bedrooms",
                  "Exclusive Networking",
                  "Personalized Gourmet Meals"
                ]}
                ctaText="Apply for Consideration"
                ctaLink={EXECUTIVE_ESCAPE_MAIL}
                animationDelay={0.2}
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      <PricingSection 
            APPLICATION_FORM_URL={APPLICATION_FORM_URL}
            EXECUTIVE_ESCAPE_MAIL={EXECUTIVE_ESCAPE_MAIL}
            prices={prices}
        />

    </div>
  );
};

export default Pricing;