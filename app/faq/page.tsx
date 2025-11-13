'use client';

import { useState } from 'react';
import Navigation from '@/app/website-navigation/components/Navigation';
import Footer from '@/app/website-navigation/components/Footer';
import { ChevronDown, Mail, Phone } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from 'framer-motion';

const FAQ = () => {
  const faqs = [
    {
      question: "What will I get out of this experience?",
      answer: "Our 7-day retreat is designed to immerse you in a high-energy environment with ambitious founders, aspiring entrepreneurs, and driven professionals. You'll build lifelong friendships, create unforgettable memories, and gain access to a handpicked community that fuels your growth. Expect curated networking, deep conversations, and transformative experiences—all tailored to accelerate both your professional ambitions and personal evolution."
    },
    {
      question: "Who is this experience designed for?",
      answer: "This experience is designed for highly ambitious individuals who refuse to settle for mediocrity. It's for those who dream big, take bold action, and want to surround themselves with an inner circle of like-minded, driven individuals. A brotherhood that pushes, supports, and accelerates each other's success."
    },
    {
      question: "What kind of activities and learning can I expect?",
      answer: "Our program goes beyond traditional learning—expect interactive workshops, brainstorming sprints, and real-world startup simulations. You'll collaborate with high-caliber peers in activities designed to ignite creativity and sharpen execution skills. We don't believe business education should be behind a paywall but you should be passionate enough to access it, so we will give you a comprehensive document covering every aspect of building a business—from ideation to scale with lifetime access. But the real takeaway? A powerful community that has your back long after the retreat ends, providing lifelong support and opportunities to grow together."
    },
    {
      question: "Is there a structured schedule, or is it more flexible?",
      answer: "Our retreat strikes the perfect balance between structured learning and personal freedom. Each day blends high-impact workshops, deep-dive discussions, and open-ended time for reflection, exploration, or spontaneous collaborations. Whether you're brainstorming the next big idea by the pool or engaging in thought-provoking debates over dinner, every moment is designed to spark growth and connection."
    },
    {
      question: "What about the venue, food, and people?",
      answer: "Our retreats are set in stunning, handpicked villas designed to inspire deep thinking and meaningful connections. Picture yourself brainstorming by the infinity pool, enjoying gourmet meals crafted to fuel your mind, and unwinding in spaces built for both focus and relaxation. You'll be surrounded by a diverse group of high-achievers—founders, creators, and professionals—ensuring every conversation sparks fresh ideas and new perspectives."
    },
    {
      question: "How does the application and screening process work?",
      answer: "Applying is simple—fill out a quick form, and if shortlisted, we'll have a brief screening call. This isn't an interview; it's a conversation to ensure you align with our community's values and ambitions. We carefully curate each cohort to create the best possible environment for deep connections, collaboration, and growth."
    },
    {
      question: "Can I apply with my friends or colleagues?",
      answer: "Absolutely! Applying with friends or colleagues can amplify your experience, making collaborations smoother and discussions more impactful. Plus, we offer exclusive incentives for group applications—because great ideas thrive in great company. Whether you're co-founders, teammates, or just like-minded individuals, this retreat is designed to strengthen your network and accelerate your growth together."
    },
    {
      question: "Is prior startup or business experience required?",
      answer: "No. What matters most is your drive, curiosity, and willingness to engage with a high-caliber community. If you're ready to think bigger and take action, you'll fit right in."
    },
    {
      question: "What if I need to cancel or change my booking?",
      answer: "We understand that plans can change. Please refer to our terms and conditions for specific details on cancellations and modifications. If you need any assistance, our team is happy to help you navigate your options."
    },
    {
      question: "What if I'm an introvert?",
      answer: "While there are plenty of opportunities for networking and collaboration, we also ensure space for personal reflection and relaxation. Many introverts find that our structured yet flexible environment allows them to connect meaningfully at their own pace."
    },
    {
      question: "What if I don't get selected?",
      answer: "If you're not selected for the current cohort, we offer priority access for future programs. This ensures that you remain connected with our community and have opportunities to join us in the future."
    },
    {
      question: "What happens after the experience?",
      answer: "Post-retreat, you don't just leave with memories—you gain lifelong access to an exclusive community of high-achievers. You'll receive updates on future events, private networking opportunities, and ongoing support to help you leverage the connections and insights from the retreat. Whether it's collaborating on a new venture or seeking advice, your cohort will remain your inner circle for years to come."
    },
    {
      question: "What should I bring to the retreat?",
      answer: "A laptop, aesthetic clothes, and an open mind."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-sky-950 text-white">
        <motion.div className="px-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-gilroy-regular mb-6">
              Frequently Asked <span className='text-white font-gilroy-semibold'>Questions</span>
            </h1>
            <p className="text-xl text-gray-300 font-gilroy-light">
              Everything you need to know about the Fraterny experience
            </p>
          </div>
        </motion.div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="px-6 max-w-7xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-gray-200 rounded-lg px-6 py-2 hover:border-black transition-colors"
              >
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-left text-2xl font-medium text-navy hover:text-black transition-colors font-gilroy-medium">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 text-xl font-gilroy-semibold">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Contact Information */}
          <div className="mt-16 p-8 bg-gray-50 rounded-lg border border-gray-200">
            <h2 className="text-2xl font-gilroy-semibold text-navy mb-6">Still have questions?</h2>
            <p className="text-gray-600 mb-6 font-gilroy-regular">
              We're here to help! Reach out to us through any of these channels:
            </p>
            <div className="space-y-4">
              <a 
                href="mailto:support@fraterny.com" 
                className="flex items-center gap-3 text-gray-600 transition-colors font-gilroy-regular"
              >
                <Mail size={20} />
                <span>support@fraterny.com</span>
              </a>
              <a 
                href="https://wa.me/919004809251" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-3 text-gray-600 transition-colors font-gilroy-regular"
              >
                <Phone size={20} />
                <span>WhatsApp: +91 9004809251</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQ;
