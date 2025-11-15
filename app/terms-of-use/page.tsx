
import React from 'react';
import Navigation from '../website-navigation/components/Navigation';
import Footer from '../website-navigation/components/Footer';

const TermsOfUse = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-sky-950 text-white">
        <div className="max-w-7xl px-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-gilroy-regular mb-6">Terms of Use</h1>
          <p className="text-xl text-gray-300 font-gilroy-light">
            By accessing Fraterny, you agree to be bound by these Terms and Conditions. Please read them carefully before using our services.
          </p>
        </div>
      </section>
      
      {/* Terms Content */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className=" mx-auto">
            
            {/* Overview */}
            <div className="mb-12">
              <p className="text-lg leading-relaxed">
                Welcome to Fraterny, accessible at <a href="https://fraterny.com" className="text-navy hover:underline">https://fraterny.com</a> / <a href="https://fraterny.in" className="text-navy hover:underline">https://fraterny.in</a>. By accessing or using our website, services, or participating in any of our programs, including <strong>Quest by Fraterny</strong> and <strong>Frat Villa</strong>, you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree with any part of these Terms, you must refrain from using the Website or participating in any of our services.
              </p>
            </div>

            {/* Section 1 */}
            <h2 className="text-navy font-playfair text-3xl font-bold mt-12 mb-6">1. Overview and Agreement</h2>
            <p className="mb-4">
              These Terms govern your use of the Website and any Fraterny services you access or purchase through it. This includes, but is not limited to:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li className="mb-2">Participating in <strong>Quest by Fraterny</strong>, our introspective self-discovery product.</li>
              <li className="mb-2">Applying for or attending <strong>Frat Villa</strong>, our immersive residential growth experience.</li>
            </ul>
            <p className="mb-8">
              These Terms incorporate our <strong>Privacy Policy</strong>, <strong>Program Booking Conditions</strong>, and other policies made available to you via the website or email. Fraterny reserves the right to update or revise these Terms at any time. Updates will be posted with a "last revised" date, and continued use of the Website or Services will constitute your acceptance of the revised Terms.
            </p>

            {/* Section 2 */}
            <h2 className="text-navy font-playfair text-3xl font-bold mt-12 mb-6">2. Eligibility and Program Participation</h2>
            <p className="mb-6">
              Fraterny's services are intended strictly for individuals aged <strong>18 years or older</strong>. By using the Website or applying for a Program, you confirm that you are of legal age and have the capacity to enter into binding contracts under applicable law.
            </p>
            <h3 className="text-navy font-playfair text-2xl font-semibold mt-8 mb-4">Quest Requirement for Frat Villa</h3>
            <p className="mb-8">
              Participation in <strong>Frat Villa</strong> is by application only and subject to internal review. Completion of <strong>Quest by Fraterny</strong> is a <strong>mandatory prerequisite</strong> for all Frat Villa applicants, and responses may be evaluated to determine psychological readiness and community fit. Submitting dishonest or misleading information may result in disqualification.
            </p>

            {/* Section 3 */}
            <h2 className="text-navy font-playfair text-3xl font-bold mt-12 mb-6">3. Use and Purpose of Website</h2>
            <p className="mb-4">The Website is provided to:</p>
            <ul className="list-disc pl-6 mb-6">
              <li className="mb-2">Inform users about Fraterny products</li>
              <li className="mb-2">Facilitate applications and program participation</li>
              <li className="mb-2">Deliver digital experiences like Quest</li>
            </ul>
            <p className="mb-4">
              You may not use the Website for any unlawful or prohibited activity. By using the Website, you agree to:
            </p>
            <ol className="list-decimal pl-6 mb-6">
              <li className="mb-2">Comply with all applicable laws and intellectual property rights</li>
              <li className="mb-2">Refrain from disrupting other users or tampering with system functionality</li>
              <li className="mb-2">Avoid sharing false information or impersonating others</li>
              <li className="mb-2">Not resell or redistribute any content or services from the site</li>
              <li className="mb-2">Avoid spam, phishing, or malicious activity</li>
            </ol>
            <p className="mb-8">
              You are granted a limited, non-exclusive, non-transferable license to access content for personal use. Unauthorized reproduction or redistribution is strictly prohibited.
            </p>

            {/* Section 4 */}
            <h2 className="text-navy font-playfair text-3xl font-bold mt-12 mb-6">4. Intellectual Property</h2>
            <p className="mb-4">
              All content on the Website, including branding, visuals, questions, and programs (such as Quest), is the sole intellectual property of Fraterny. You may not:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li className="mb-2">Copy, modify, or distribute any content without written consent</li>
              <li className="mb-2">Reproduce our questions, visual experiences, or frameworks</li>
              <li className="mb-2">Use our name or likeness for commercial or misleading purposes</li>
            </ul>
            <p className="mb-8">
              Violation of this clause may result in legal action and removal from all Fraterny programs.
            </p>

            {/* Section 5 */}
            <h2 className="text-navy font-playfair text-3xl font-bold mt-12 mb-6">5. Data and Privacy</h2>
            <p className="mb-6">
              All user information collected during program registration, Quest participation, or interaction with the website is governed by our Privacy Policy.
            </p>
            <p className="mb-4">We retain and process personal data solely to:</p>
            <ul className="list-disc pl-6 mb-6">
              <li className="mb-2">Deliver experiences</li>
              <li className="mb-2">Evaluate fit for Frat Villa</li>
              <li className="mb-2">Improve our programs</li>
            </ul>
            <p className="mb-8">
              We do not sell or misuse your data. However, we may share limited data with third-party service providers (e.g. payment processors, logistic partners) under confidentiality agreements.
            </p>

            {/* Section 6 */}
            <h2 className="text-navy font-playfair text-3xl font-bold mt-12 mb-6">6. Limitation of Liability</h2>
            <p className="mb-4">Fraterny is not liable for:</p>
            <ul className="list-disc pl-6 mb-6">
              <li className="mb-2">Any indirect, incidental, or consequential damages arising from use of the Website or Services</li>
              <li className="mb-2">Decisions made based on insights from Quest</li>
              <li className="mb-2">Interruptions or technical issues during program access</li>
            </ul>
            <p className="mb-8">
              You agree to indemnify Fraterny, its team, and affiliates against any loss, damage, or legal action resulting from misuse of the Website, breach of these Terms, or any third-party claims arising from your conduct.
            </p>

            {/* Section 7 */}
            <h2 className="text-navy font-playfair text-3xl font-bold mt-12 mb-6">7. User Conduct and Suspension</h2>
            <p className="mb-4">Fraterny reserves the right to terminate or suspend access if a user:</p>
            <ul className="list-disc pl-6 mb-6">
              <li className="mb-2">Violates the Terms or Community Guidelines</li>
              <li className="mb-2">Disrupts the experience of other participants</li>
              <li className="mb-2">Engages in harmful, unethical, or unsafe behavior during any program</li>
            </ul>
            <p className="mb-8">
              This applies to both online and offline conduct. No refunds will be issued for removal due to misconduct.
            </p>

            {/* Section 8 */}
            <h2 className="text-navy font-playfair text-3xl font-bold mt-12 mb-6">8. Program Fees and Payments</h2>
            <p className="mb-4">By enrolling in any paid service (Quest Premium or Frat Villa), you agree to:</p>
            <ul className="list-disc pl-6 mb-6">
              <li className="mb-2">Pay all fees as described at the time of booking</li>
              <li className="mb-2">Abide by the cancellation and refund policies outlined in the <strong>Program Booking Conditions</strong></li>
              <li className="mb-2">Not reverse or chargeback payments without cause</li>
            </ul>
            <p className="mb-8">
              All fees are displayed in INR and include applicable taxes unless otherwise stated.
            </p>

            {/* Section 9 */}
            <h2 className="text-navy font-playfair text-3xl font-bold mt-12 mb-6">9. Disclaimers</h2>
            <ul className="list-disc pl-6 mb-6">
              <li className="mb-3"><strong>Quest by Fraterny</strong> is an introspective tool, not a licensed therapy substitute. Insights are interpretative and designed for reflection, not diagnosis.</li>
              <li className="mb-3"><strong>Frat Villa</strong> is a curated peer-based experience, not a medical, religious, or corporate training service.</li>
            </ul>
            <p className="mb-8">
              Your engagement with these products is voluntary and meant for personal growth.
            </p>

            {/* Section 10 */}
            <h2 className="text-navy font-playfair text-3xl font-bold mt-12 mb-6">10. Dispute Resolution and Governing Law</h2>
            <p className="mb-6">
              These Terms shall be governed by the laws of India. Any disputes shall be subject to arbitration under the <strong>Arbitration and Conciliation Act, 1996</strong>, with venue in <strong>Kolkata, India</strong>.
            </p>
            <p className="mb-8">
              Claims must be raised within <strong>one year</strong> of the incident or be permanently waived.
            </p>

            {/* Section 11 */}
            <h2 className="text-navy font-playfair text-3xl font-bold mt-12 mb-6">11. Changes and Amendments</h2>
            <p className="mb-12">
              Fraterny may update these Terms at its sole discretion. Continued use of the Website or Services after updates will indicate your agreement to the revised Terms.
            </p>
            
            <p className="text-sm text-gray-500 mt-12 italic border-t pt-6">
              Last updated at July 2025
            </p>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default TermsOfUse;