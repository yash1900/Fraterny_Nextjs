'use client';

import { motion, useScroll, useTransform } from 'framer-motion';

const HeroSection = () => {

  // Scroll-based parallax effects
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0.9, 0.6]);

  // Simple fade animations - no complex scroll triggers for hero section

  // Use React Query powered hook for settings
  // const { settings, isLoading } = useReactQueryWebsiteSettings();
  
  // useEffect(() => {
  //   if (settings?.registration_close_date) {
  //     const days = utilsCalculateDaysLeft(settings.registration_close_date);
  //     setDaysLeft(days);
  //   }
  // }, [settings?.registration_close_date]);

  // Animated counter for days left
  // const renderDaysLeft = () => {
  //   if (isLoading) {
  //     return (
  //       <motion.div 
  //         className="animate-pulse"
  //         initial={{ opacity: 0 }}
  //         animate={{ opacity: 1 }}
  //         transition={{ duration: 0.3 }}
  //       >
  //         <div className="h-6 w-32 bg-gray-200 rounded"></div>
  //       </motion.div>
  //     );
  //   }

  //   if (!settings?.registration_close_date) {
  //     return null;
  //   }

  //   if (daysLeft === 0) {
  //     return (
  //       <motion.span 
  //         className="text-red-600 font-semibold"
  //         initial={{ scale: 0.8, opacity: 0 }}
  //         animate={{ scale: 1, opacity: 1 }}
  //         transition={{ type: 'spring', stiffness: 200, damping: 10 }}
  //         style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
  //       >
  //         Registration Closed
  //       </motion.span>
  //     );
  //   }

  //   if (daysLeft === null) {
  //     return null;
  //   }

  //   return (
  //     <motion.span 
  //       className="text-terracotta font-semibold"
  //       initial={{ scale: 0.8, opacity: 0 }}
  //       animate={{ scale: 1, opacity: 1 }}
  //       transition={{ 
  //         type: 'spring', 
  //         stiffness: 200, 
  //         damping: 10,
  //         delay: 0.2 
  //       }}
  //     >
  //       {daysLeft} {daysLeft === 1 ? 'day' : 'days'}
  //     </motion.span>
  //   );
  // };

  return (
    <section className="min-h-screen bg-navy text-white relative overflow-hidden flex flex-col items-start justify-center">
      {/* Enhanced parallax background with scroll effects */}
      <motion.div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ y: backgroundY }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <picture>
          {/* Mobile image */}
          <source
            media="(max-width: 640px)"
            srcSet="/hero-mobile.webp"
            type="image/webp"
          />
          {/* Desktop image */}
          <img 
            src="/hero-desktop.webp" 
            alt="Luxury villa experience setting" 
            className="h-full w-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
        </picture>
      </motion.div>
      
      {/* Enhanced gradient overlay with scroll opacity */}
      <motion.div 
        className="absolute inset-0"
        style={{ 
          opacity: overlayOpacity,
          background: `linear-gradient(to right, 
            rgba(10, 26, 47, 0.9) 0%,
            rgba(10, 26, 47, 0.7) 50%,
            rgba(10, 26, 47, 0.4) 100%
          )`
        }}
      />

      {/* Hero Content with advanced scroll triggers */}
      <div className="mx-6 py-24 sm:py-32 relative z-10">
        <div className="max-w-2xl flex flex-col items-start justify-start gap-1">
          
          {/* Title with instant fade animation */}
          <motion.h1 
            className="text-left sm:text-center md:text-center lg:text-center xl:text-left text-4xl lg:text-7xl md:text-7xl font-playfair font-bold tracking-tight sm:mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <span className='font-gilroy-light text-neutral-50'>
              Where{' '}
            </span>
            <span className='font-gilroy-bold text-neutral-100 italic'>
              Ambition
            </span>
            <br />
            <span className='font-gilroy-light text-neutral-50'>
              Finds Its {' '}
            </span>
            <span className='font-gilroy-bold text-neutral-100 italic'>
              Tribe
            </span>
          </motion.h1>

          {/* Subtitle with instant fade animation */}
          <motion.p 
            className="text-left sm:text-center md:text-center lg:text-center xl:text-left sm:text-lg md:text-xl text-gray-200 text-base mb-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
          >
            Surround yourself with the right people
          </motion.p>

          {/* CTA Button with instant fade animation */}
          <motion.div
            className="flex justify-start sm:justify-center md:justify-center lg:justify-center xl:justify-start mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3, ease: "easeOut" }}
          >
            {/* <motion.a 
              href="https://docs.google.com/forms/d/1TTHQN3gG2ZtC26xlh0lU8HeiMc3qDJhfoU2tOh9qLQM/edit" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="px-6 sm:px-8 py-3 bg-terracotta text-white rounded-lg hover:bg-opacity-90 transition-all text-base sm:text-lg font-medium w-fit flex items-center gap-2 group"
            >
              <span>The Frat Villa Entry</span>
              <ArrowRight 
                size={20} 
                className="transition-transform group-hover:translate-x-1" 
              />
            </motion.a> */}
          </motion.div>
          
          {/* Countdown with instant fade animation */}
          <motion.div
            className="text-center sm:text-center md:text-center lg:text-center xl:text-left"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3, ease: "easeOut" }}
          >
            <div 
              className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg px-4 sm:px-6 py-3 sm:py-4 inline-block w-fit"
            >
              <p 
                className="text-sm md:text-base text-gray-300 mb-1"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
              >
                Villa Registrations close in:
              </p>
              {/* <div 
                className="text-xl font-mono"
              >
                {renderDaysLeft()}
              </div> */}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;