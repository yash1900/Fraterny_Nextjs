
import React from 'react';
import Navigation from '../website-navigation/components/Navigation';
import Footer from '../website-navigation/components/Footer';
import Link from 'next/link';

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-sky-950 text-white">
        <div className="max-w-7xl px-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-gilroy-regular mb-6">Refund & Cancellation Policy</h1>
          <p className="text-xl text-gray-300 font-gilroy-light">
            Understanding our policies regarding refunds and cancellations.
          </p>
        </div>
      </section>
      
      {/* Refund Policy Content */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="">
            <p className="text-lg">
              Our refund and cancellation policies are outlined in our Terms and Conditions. Please refer to the Cancellation section in our <Link href="/terms-and-conditions" className="font-gilroy-bold underline">Terms and Conditions</Link> for detailed information.
            </p>
            
            <p className="text-sm text-gray-500 mt-12 italic">
              Last updated: February 2025
            </p>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default RefundPolicy;
