// 'use client'

// import React from 'react';
// import { motion } from 'framer-motion';
// import useSectionRevealAnimation from '@/app/assessment/hooks/useSectionRevealAnimation';

// const features = [
//     {
//       title: "Creates an Optimized Environment:",
//       description: "The Fratvilla group is carefully selected based on the harmony, diversity, and thinking depth of their Quest results, ensuring a dynamic and supportive environment for all attendees."
//     },
//     {
//       title: "Instills the Psychology of Success:",
//       description: "Through a series of specially designed activities and the application of our \"Fratrules,\" you'll learn to embody the mindset of a high-achiever."
//     },
//     {
//       title: "Fosters Genuine Connection:",
//       description: "Fratvilla is designed to maximize personal growth and bonding, creating a powerful network of ambitious individuals who will support you long after the experience is over."
//     }
//   ];

// const AboutFratVilla = () => {

//   const firstSectionHeaderAnimation = useSectionRevealAnimation({
//       variant: 'slide-up',
//       once: false,
//       threshold: { desktop: 0.3, mobile: 0.2 },
//       duration: 0.7,
//       staggerChildren: 0.2
//     });
    
//   return (
//     <section className="py-4 md:py-8 bg-white  ">
//       <div className=" mx-auto px-6">
//         <div className="max-w-7xl mx-auto">

//           <motion.div
//           ref={firstSectionHeaderAnimation.ref} 
//                 variants={firstSectionHeaderAnimation.parentVariants}
//                 initial="hidden"
//                 animate={firstSectionHeaderAnimation.controls} >
//             <h2
//                 className="text-4xl md:text-5xl lg:text-7xl font-gilroy-regular mb-6 text-left md:text-left text-black"
//             >
//                 About FratVilla
//             </h2>
            
//             <p 
//                 className="text-xl md:text-xl lg:text-2xl font-gilroy-medium text-left mb-8 text-black"
//             >
//                 Fratvilla is our exclusive, hyper-luxurious 6-day experience for 20 ambitious 
//                 individuals in a secret villa. It's an immersive, real-world application of the 
//                 principles discovered through Quest, where you'll be surrounded by a curated 
//                 group of like-minded peers.
//             </p>
//           </motion.div>


//             <motion.section className=" bg-white rounded-xl max-w-7xl"
//             ref={firstSectionHeaderAnimation.ref} 
//                 variants={firstSectionHeaderAnimation.parentVariants}
//                 initial="hidden"
//                 animate={firstSectionHeaderAnimation.controls} >


//                 <div className="max-w-7xl mx-auto">
//                     <div className=" text-center">
//                         <h2 
//                 className="text-4xl md:text-5xl lg:text-7xl font-gilroy-regular mb-6 text-left md:text-left text-black"
//             >
//                 What FratVilla Does
//             </h2>

//                     {/* Feature Boxes */}
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
//                         {features.map((feature, index) => (
//                         <motion.div 
                            
                            
//                             key={index}
//                             className="bg-white/10 backdrop-blur-md rounded-xl p-6 md:p-8 text-left border border-white/20 shadow-xl hover:bg-white/20 hover:border-white/30 hover:shadow-2xl transition-all duration-300 "
//                         >
//                             <h3 
//                             className="text-xl md:text-2xl lg:text-3xl font-gilroy-bold text-neutral-900 sm:h-16 md:h-28 lg:h-24 lg:mb-4"
//                             >
//                             {feature.title}
//                             </h3>
//                             <p 
//                             className="text-lg font-gilroy-regular md:text-xl lg:text-xl text-black mt-4"
//                             >
//                             {feature.description}
//                             </p>
//                         </motion.div>
//                         ))}
//                     </div>
//                     </div>
//                 </div>
//             </motion.section>

//         </div>
//       </div>
//     </section>
//   );
// };

// export default AboutFratVilla;


'use client'

import React from 'react';
import { motion } from 'framer-motion';
import useSectionRevealAnimation from '@/app/assessment/hooks/useSectionRevealAnimation';

const features = [
    {
      title: "Creates an Optimized Environment:",
      description: "The Fratvilla group is carefully selected based on the harmony, diversity, and thinking depth of their Quest results, ensuring a dynamic and supportive environment for all attendees."
    },
    {
      title: "Instills the Psychology of Success:",
      description: "Through a series of specially designed activities and the application of our \"Fratrules,\" you'll learn to embody the mindset of a high-achiever."
    },
    {
      title: "Fosters Genuine Connection:",
      description: "Fratvilla is designed to maximize personal growth and bonding, creating a powerful network of ambitious individuals who will support you long after the experience is over."
    }
  ];

const AboutFratVilla = () => {

  // First section header animation - for "About FratVilla" title and description
  const headerAnimation = useSectionRevealAnimation({
    variant: 'fade-up',
    once: true,
    threshold: { desktop: 0.3, mobile: 0.2 },
    duration: 0.7,
    staggerChildren: 0.2
  });

  // Second section header animation - for "What FratVilla Does" title
  const secondHeaderAnimation = useSectionRevealAnimation({
    variant: 'fade-up',
    once: true,
    threshold: { desktop: 0.3, mobile: 0.2 },
    duration: 0.6
  });

  // Feature cards animation - exactly matching PricingSection
  const featureCardsAnimation = useSectionRevealAnimation({
    variant: 'slide-up',
    once: true,
    threshold: { desktop: 0.1, mobile: 0.05 },
    duration: 0.6,
    staggerChildren: 0.15,
    delayChildren: 0.2
  });

  // Individual card animation variants - exactly matching FeatureCard from PricingSection
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
    
  return (
    <section className="py-4 md:py-8 bg-white">
      <div className="mx-auto px-6">
        <div className="max-w-7xl mx-auto">

          {/* First Section - About FratVilla */}
          <motion.div
            ref={headerAnimation.ref}
            variants={headerAnimation.parentVariants}
            initial="hidden"
            animate={headerAnimation.controls}
          >
            <motion.h2
              className="text-4xl md:text-5xl lg:text-7xl font-gilroy-regular mb-6 text-left md:text-left text-black"
              variants={headerAnimation.childVariants}
            >
              About FratVilla
            </motion.h2>
            
            <motion.p 
              className="text-xl md:text-xl lg:text-2xl font-gilroy-medium text-left mb-8 text-black"
              variants={headerAnimation.childVariants}
            >
              Fratvilla is our exclusive, hyper-luxurious 6-day experience for 20 ambitious 
              individuals in a secret villa. It's an immersive, real-world application of the 
              principles discovered through Quest, where you'll be surrounded by a curated 
              group of like-minded peers.
            </motion.p>
          </motion.div>

          {/* Second Section - What FratVilla Does */}
          <section className="bg-white rounded-xl max-w-7xl">
            <div className="max-w-7xl mx-auto">
              <div className="text-center">
                {/* Section Title */}
                <motion.div
                  ref={secondHeaderAnimation.ref}
                  variants={secondHeaderAnimation.parentVariants}
                  initial="hidden"
                  animate={secondHeaderAnimation.controls}
                >
                  <motion.h2 
                    className="text-4xl md:text-5xl lg:text-7xl font-gilroy-regular mb-6 text-left md:text-left text-black"
                    variants={secondHeaderAnimation.childVariants}
                  >
                    What FratVilla Does
                  </motion.h2>
                </motion.div>

                {/* Feature Cards with staggered animation */}
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
                  ref={featureCardsAnimation.ref}
                  variants={featureCardsAnimation.parentVariants}
                  initial="hidden"
                  animate={featureCardsAnimation.controls}
                >
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      variants={featureCardsAnimation.childVariants}
                    >
                      <motion.div 
                        className="bg-white/10 backdrop-blur-md rounded-xl p-6 md:p-8 text-left border border-white/20 shadow-xl hover:bg-white/20 hover:border-white/30 hover:shadow-2xl transition-all duration-300 cursor-pointer"
                        variants={cardVariants}
                        whileHover="hover"
                      >
                        <h3 
                          className="text-xl md:text-2xl lg:text-3xl font-gilroy-bold text-neutral-900 sm:h-16 md:h-28 lg:h-24 lg:mb-4"
                        >
                          {feature.title}
                        </h3>
                        
                        <p 
                          className="text-lg font-gilroy-regular md:text-xl lg:text-xl text-black mt-4 h-36 mb-8"
                        >
                          {feature.description}
                        </p>
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </section>
  );
};

export default AboutFratVilla;