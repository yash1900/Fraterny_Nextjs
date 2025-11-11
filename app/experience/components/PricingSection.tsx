'use client'


import { motion } from 'framer-motion';
import { Users, Hotel, Coffee, Award } from 'lucide-react';
import useSectionRevealAnimation from '@/app/assessment/hooks/useSectionRevealAnimation';
import { LucideIcon } from 'lucide-react';

// TypeScript interfaces
interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface PricesType {
  acceptingApplicationsFor?: string;
  spotsRemaining?: string | number;
}

interface PricingSectionProps {
  APPLICATION_FORM_URL: string;
  EXECUTIVE_ESCAPE_MAIL: string;
  prices: PricesType;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => {
  // Feature card animation variants
  const cardVariants = {
    hidden: { 
      y: 40,
      opacity: 0,
      scale: 0.95
    },
    visible: { 
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 25
      }
    }
  };

  // Icon animation variants
  const iconVariants = {
    hidden: { 
      scale: 0,
      rotate: -180
    },
    visible: { 
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 15,
        delay: 0.2
      }
    }
  };

  return (
    <motion.div 
      className="flex gap-4 items-start group cursor-pointer"
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      whileHover="hover"
      viewport={{ once: true, margin: "-20px" }}
    >
      <motion.div 
        className="p-2 rounded-full bg-navy/5 group-hover:bg-navy/10 transition-colors"
        variants={iconVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <Icon size={24} className="text-navy" />
      </motion.div>
      <div>
        <motion.h3 
          className="font-gilroy-semibold mb-1"
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >       
          {title}
        </motion.h3>
        <motion.p 
          className="text-gray-600 text-sm font-gilroy-regular"
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {description}
        </motion.p>
      </div>
    </motion.div>
  );
};

const PricingSection = ({ APPLICATION_FORM_URL, EXECUTIVE_ESCAPE_MAIL, prices }: PricingSectionProps) => {
  // Animation configurations for different sections
  
  // First section animations
  const firstSectionHeaderAnimation = useSectionRevealAnimation({
    variant: 'fade-up',
    once: true,
    threshold: { desktop: 0.3, mobile: 0.2 },
    duration: 0.7,
    staggerChildren: 0.2
  });

  const firstSectionFeaturesAnimation = useSectionRevealAnimation({
    variant: 'slide-up',
    once: true,
    threshold: { desktop: 0.1, mobile: 0.05 },
    duration: 0.6,
    staggerChildren: 0.15,
    delayChildren: 0.2
  });

  const firstSectionCtaAnimation = useSectionRevealAnimation({
    variant: 'fade-up',
    once: true,
    threshold: { desktop: 0.6, mobile: 0.5 },
    duration: 0.6
  });

  // Second section animations
  const secondSectionHeaderAnimation = useSectionRevealAnimation({
    variant: 'fade-up',
    once: true,
    threshold: { desktop: 0.3, mobile: 0.2 },
    duration: 0.7,
    staggerChildren: 0.2
  });

  const secondSectionFeaturesAnimation = useSectionRevealAnimation({
    variant: 'slide-up',
    once: true,
    threshold: { desktop: 0.1, mobile: 0.05 },
    duration: 0.6,
    staggerChildren: 0.15,
    delayChildren: 0.2
  });

  const secondSectionCtaAnimation = useSectionRevealAnimation({
    variant: 'fade-up',
    once: true,
    threshold: { desktop: 0.6, mobile: 0.5 },
    duration: 0.6
  });

  // Final section animations
  const finalSectionAnimation = useSectionRevealAnimation({
    variant: 'fade-up',
    once: true,
    threshold: { desktop: 0.3, mobile: 0.2 },
    duration: 0.8,
    staggerChildren: 0.3
  });

  return (
    <>
      {/* First Section - Ultimate 7-Day Retreat */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            
            {/* Section Header */}
            <motion.div
              ref={firstSectionHeaderAnimation.ref}
              variants={firstSectionHeaderAnimation.parentVariants}
              initial="hidden"
              animate={firstSectionHeaderAnimation.controls}
            >
              <motion.h2 
                className="text-2xl sm:text-3xl md:text-4xl font-gilroy-bold mb-3 sm:mb-4"
                variants={firstSectionHeaderAnimation.childVariants}
              >
                The Ultimate 7-Day Retreat
              </motion.h2>
              
              <motion.p 
                className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-12 font-gilroy-medium"
                variants={firstSectionHeaderAnimation.childVariants}
              >
                Curated experiences, deep conversations, and a high-value network that will stay with you for life.
              </motion.p>
            </motion.div>
            
            {/* Features Grid */}
            <motion.div 
              className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12"
              ref={firstSectionFeaturesAnimation.ref}
              variants={firstSectionFeaturesAnimation.parentVariants}
              initial="hidden"
              animate={firstSectionFeaturesAnimation.controls}
            >
              <motion.div variants={firstSectionFeaturesAnimation.childVariants}>
                <FeatureCard
                  icon={Users}
                  title="Curated Group"
                  description="Small, highly curated group of 20 individuals"
                />
              </motion.div>
              
              <motion.div variants={firstSectionFeaturesAnimation.childVariants}>
                <FeatureCard
                  icon={Hotel}
                  title="Luxury Stay"
                  description="Luxury villa stay with gourmet meals"
                />
              </motion.div>
              
              <motion.div variants={firstSectionFeaturesAnimation.childVariants}>
                <FeatureCard
                  icon={Coffee}
                  title="High-Impact Sessions"
                  description="Workshops, simulations, and strategy sessions"
                />
              </motion.div>
              
              <motion.div variants={firstSectionFeaturesAnimation.childVariants}>
                <FeatureCard
                  icon={Award}
                  title="Premium Access"
                  description="Direct access to frameworks and templates"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Second Section - Private High-Level Conversations */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            
            {/* Section Header */}
            <motion.div
              ref={secondSectionHeaderAnimation.ref}
              variants={secondSectionHeaderAnimation.parentVariants}
              initial="hidden"
              animate={secondSectionHeaderAnimation.controls}
            >
              <motion.h2 
                className="text-2xl sm:text-3xl md:text-4xl font-gilroy-bold mb-3 sm:mb-4"
                variants={secondSectionHeaderAnimation.childVariants}
              >
                Private, High-Level Conversations
              </motion.h2>
              
              <motion.p 
                className="text-lg font-gilroy-medium sm:text-xl text-gray-600 mb-8 sm:mb-12"
                variants={secondSectionHeaderAnimation.childVariants}
              >
                No structured sessions, no group activities – just a space for networking and deep discussions.
              </motion.p>
            </motion.div>
            
            {/* Features Grid */}
            <motion.div 
              className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12"
              ref={secondSectionFeaturesAnimation.ref}
              variants={secondSectionFeaturesAnimation.parentVariants}
              initial="hidden"
              animate={secondSectionFeaturesAnimation.controls}
            >
              <motion.div variants={secondSectionFeaturesAnimation.childVariants}>
                <FeatureCard
                  icon={Users}
                  title="Exclusive Group"
                  description="Limited to 8-10 high-level individuals per villa"
                />
              </motion.div>
              
              <motion.div variants={secondSectionFeaturesAnimation.childVariants}>
                <FeatureCard
                  icon={Hotel}
                  title="Private Rooms"
                  description="Private rooms in a luxury villa"
                />
              </motion.div>
              
              <motion.div variants={secondSectionFeaturesAnimation.childVariants}>
                <FeatureCard
                  icon={Coffee}
                  title="Flexible Schedule"
                  description="No structured workshops - pure networking"
                />
              </motion.div>
              
              <motion.div variants={secondSectionFeaturesAnimation.childVariants}>
                <FeatureCard
                  icon={Award}
                  title="Elite Access"
                  description="Invitation-only experience"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final Section - Limited Spots */}
      {/* <section className="py-16 sm:py-20 bg-navy text-white">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="max-w-2xl mx-auto">

            <motion.div
              ref={finalSectionAnimation.ref}
              variants={finalSectionAnimation.parentVariants}
              initial="hidden"
              animate={finalSectionAnimation.controls}
            >
              <motion.h2 
                className="text-2xl sm:text-3xl md:text-4xl font-playfair mb-3 sm:mb-4"
                variants={finalSectionAnimation.childVariants}
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
              >
                Limited Spots, Lifetime Impact
              </motion.h2>
              
              <motion.p 
                className="text-lg sm:text-xl mb-6 sm:mb-8"
                variants={finalSectionAnimation.childVariants}
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
              >
                We keep the group small and highly curated. If you're ready to experience a network that will change your trajectory, apply now.
              </motion.p>
              
              
              <motion.p 
                className="text-sm text-gray-300"
                variants={finalSectionAnimation.childVariants}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false }}
                transition={{ 
                  type: "spring", 
                  stiffness: 200, 
                  damping: 15, 
                  delay: 0.8 
                }}
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 200 }}
              >
                Only {prices.spotsRemaining} spots remaining
              </motion.p>
            </motion.div>
          </div>
        </div>
      </section> */}
    </>
  );
};

export default PricingSection;