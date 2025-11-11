// import React from 'react';
// import { motion } from 'framer-motion';
// import { useSectionRevealAnimation } from '../../home/hooks/useSectionRevealAnimation';

// const experiences = [
//     {
//       title: "Exclusive and Curated:",
//       description: "Fratvilla is an invitation-only experience, ensuring that every attendee is a genuine and authentic individual committed to personal growth."
//     },
//     {
//       title: "Holistic Approach:",
//       description: "We focus on a holistic approach to soft skills, providing not just tactics and hacks, but a deep understanding of the underlying principles of success."
//     },
//     {
//       title: "Secret Events:",
//       description: "Members who have been a part of the Fratvilla experience will have access to exclusive, secret events, further expanding their network and opportunities."
//     }
//   ];


// // Timeline events data
// // const timelineEvents = [
// //   { time: "11:30 AM", title: "Brainstorming Breakfasts", description: "Start your day with engaging discussions" },
// //   { time: "1:00 PM", title: "Team Activity Afternoons", description: "Collaborative sessions and workshops" },
// //   { time: "6:00 PM", title: "Simulation Sunsets", description: "Apply learnings in practical scenarios" },
// //   { time: "12:00 AM", title: "Midnight Momentum", description: "Deep conversations and connections" },
// // ];

// const TimelineSection = () => {
//   // Section title animation
//   const titleAnimation = useSectionRevealAnimation({
//     variant: 'fade-up',
//     once: true
//     threshold: { desktop: 0.3, mobile: 0.2 },
//     duration: 0.7,
//     staggerChildren: 0.3
//   });

//   // Timeline cards animation with sophisticated reveals (similar to HowItWorks steps)
//   const cardsAnimation = useSectionRevealAnimation({
//     variant: 'slide-up',
//     once: true
//     threshold: { desktop: 0.2, mobile: 0.15 },
//     duration: 0.6,
//     staggerChildren: 0.2,
//     delayChildren: 0.3
//   });

//   // Card hover animation variants
//   const cardVariants = {
//     hidden: { 
//       y: 60,
//       opacity: 0,
//       scale: 0.9
//     },
//     visible: { 
//       y: 0,
//       opacity: 1,
//       scale: 1,
//       transition: {
//         type: "spring",
//         stiffness: 100,
//         damping: 15
//       }
//     },
//     hover: {
//       y: -8,
//       scale: 1.02,
//       transition: {
//         type: "spring",
//         stiffness: 400,
//         damping: 25
//       }
//     }
//   };

//   // Time badge animation variants - REMOVED

//   return (
//     <section className=" bg-neutral-100 p-5">
//       <section className="py-4 md:py-8">
//         <div className="max-w-7xl mx-auto">
//           <div className=" text-center">
//             <h2 
//               className="text-3xl md:text-5xl lg:text-7xl font-gilroy-regular text-left mb-6 text-neutral-800"
//             >
//               The Fratvilla Experience
//             </h2>

//             {/* Feature Boxes */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               {experiences.map((experience, index) => (
//                 <div 
//                   key={index}
//                   className="bg-neutral-100 backdrop-blur-md rounded-xl p-6 md:p-8 text-left border border-cyan-700/20 shadow-lg hover:shadow-xl transition-all duration-500"
//                 >
//                   <h3 
//                     className="text-xl md:text-2xl lg:text-3xl font-gilroy-bold text-neutral-900 mb-6 h-8 md:h-16 lg:h-20"
//                   >
//                     {experience.title}
//                   </h3>
//                   <p 
//                     className="text-lg md:text-xl font-gilroy-regular"
//                   >
//                     {experience.description}
//                   </p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>
//     </section>

//   );
// };

// export default TimelineSection;

import React from 'react';
import { motion } from 'framer-motion';
import { useSectionRevealAnimation } from '../../home/hooks/useSectionRevealAnimation';

const experiences = [
    {
      title: "Exclusive and Curated:",
      description: "Fratvilla is an invitation-only experience, ensuring that every attendee is a genuine and authentic individual committed to personal growth."
    },
    {
      title: "Holistic Approach:",
      description: "We focus on a holistic approach to soft skills, providing not just tactics and hacks, but a deep understanding of the underlying principles of success."
    },
    {
      title: "Secret Events:",
      description: "Members who have been a part of the Fratvilla experience will have access to exclusive, secret events, further expanding their network and opportunities."
    }
  ];

const TimelineSection = () => {
  // Section title animation
  const titleAnimation = useSectionRevealAnimation({
    variant: 'fade-up',
    once: true,
    threshold: { desktop: 0.3, mobile: 0.2 },
    duration: 0.7,
    staggerChildren: 0.3
  });

  // Cards animation - exactly matching PricingSection FeatureCards
  const cardsAnimation = useSectionRevealAnimation({
    variant: 'slide-up',
    once: true,
    threshold: { desktop: 0.1, mobile: 0.05 },
    duration: 0.6,
    staggerChildren: 0.15,
    delayChildren: 0.2
  });

  // Card animation variants - exactly matching FeatureCard from PricingSection
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
    <section className="bg-neutral-100 p-5">
      <section className="py-4 md:py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            {/* Animated Title */}
            <motion.div
              ref={titleAnimation.ref}
              variants={titleAnimation.parentVariants}
              initial="hidden"
              animate={titleAnimation.controls}
            >
              <motion.h2 
                className="text-3xl md:text-5xl lg:text-7xl font-gilroy-regular text-left mb-6 text-neutral-800"
                variants={titleAnimation.childVariants}
              >
                The Fratvilla Experience
              </motion.h2>
            </motion.div>

            {/* Feature Boxes - Coordinated staggered animation like PricingSection */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              ref={cardsAnimation.ref}
              variants={cardsAnimation.parentVariants}
              initial="hidden"
              animate={cardsAnimation.controls}
            >
              {experiences.map((experience, index) => (
                <motion.div
                  key={index}
                  variants={cardsAnimation.childVariants}
                >
                  <motion.div 
                    className="bg-neutral-100 backdrop-blur-md rounded-xl p-6 md:p-8 text-left border border-cyan-700/20 shadow-lg hover:shadow-xl transition-all duration-500 cursor-pointer"
                
                    viewport={{ once: true, margin: "-20px" }}
                  >
                    <h3 
                      className="text-xl md:text-2xl lg:text-3xl font-gilroy-bold text-neutral-900 mb-6 h-8 md:h-16 lg:h-20"
                    >
                      {experience.title}
                    </h3>
                    <p 
                      className="text-lg md:text-xl font-gilroy-regular"
                    >
                      {experience.description}
                    </p>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </section>
  );
};

export default TimelineSection;