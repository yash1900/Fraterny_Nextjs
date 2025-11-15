



import React from 'react';
import Navigation from '../website-navigation/components/Navigation';
import Footer from '../website-navigation/components/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-sky-950 text-white">
        <div className="max-w-7xl px-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-gilroy-regular mb-6">Privacy Policy</h1>
          <p className="text-xl text-gray-300 font-gilroy-light">
            This Privacy Policy outlines how we collect, use, store, disclose, and safeguard your personal data when you interact with our offerings.
          </p>
        </div>
      </section>
      
      {/* Privacy Policy Content */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="">
            
            {/* Introduction */}
            <div className="mb-12">
              <p className="text-lg leading-relaxed">
                Fraterny ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy outlines how we collect, use, store, disclose, and safeguard your personal data when you interact with our offerings - <strong>Quest by Fraterny</strong> and <strong>Frat Villa</strong> - through our website or services.
              </p>
              <p className="text-lg leading-relaxed mt-4">
                By accessing or using any Fraterny product or platform, you agree to the terms of this Privacy Policy and consent to our data practices.
              </p>
            </div>

            {/* Section 1 */}
            <h2 className="text-navy font-playfair text-3xl font-bold mt-12 mb-6">1. Our Privacy Commitment</h2>
            <p className="mb-6">
              At Fraterny, your data is more than information - it's insight, trust, and a part of your journey with us. We will never sell your data or exploit it. We aim to:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li className="mb-2">Collect only what's essential for your experience</li>
              <li className="mb-2">Keep it secure through encryption and access control</li>
              <li className="mb-2">Use it only for service delivery, internal analysis, or improvement</li>
              <li className="mb-2">Share it only with your explicit consent or legal obligation</li>
            </ul>
            <p className="mb-8">
              While we take every reasonable step to protect your privacy, please note we are not liable for third-party breaches outside our control (e.g., other websites or platforms linked to ours).
            </p>

            {/* Section 2 */}
            <h2 className="text-navy font-playfair text-3xl font-bold mt-12 mb-6">2. Scope of This Policy</h2>
            <p className="mb-4">This Policy applies to all visitors, applicants, and participants of:</p>
            <ul className="list-disc pl-6 mb-6">
              <li className="mb-2"><strong>Quest by Fraterny</strong>: A psychological self-discovery journey to assess alignment and readiness.</li>
              <li className="mb-2"><strong>Frat Villa</strong>: A luxury, cohort-based personal transformation experience — accessible only to individuals who have completed Quest.</li>
            </ul>
            <p className="mb-6">
              This Policy governs all data shared via our website, forms, digital tools, or communication channels.
            </p>
            <p className="mb-8">
              We may update this Policy without prior notice. Please review it regularly to stay informed.
            </p>

            {/* Section 3 */}
            <h2 className="text-navy font-playfair text-3xl font-bold mt-12 mb-6">3. Information We Collect</h2>
            <p className="mb-6">
              We collect the following categories of information ("Personal Information"):
            </p>
            
            <h3 className="text-navy font-playfair text-2xl font-semibold mt-8 mb-4">a. Identity & Profile Data</h3>
            <ul className="list-disc pl-6 mb-6">
              <li className="mb-2">Full name, gender, date of birth, city</li>
              <li className="mb-2">Social handles (if submitted voluntarily)</li>
              <li className="mb-2">Photos or video recordings during the program (with consent)</li>
            </ul>

            <h3 className="text-navy font-playfair text-2xl font-semibold mt-8 mb-4">b. Contact Information</h3>
            <ul className="list-disc pl-6 mb-6">
              <li className="mb-2">Email address, phone number, and communication preferences</li>
            </ul>

            <h3 className="text-navy font-playfair text-2xl font-semibold mt-8 mb-4">c. Psychological & Reflective Data</h3>
            <ul className="list-disc pl-6 mb-6">
              <li className="mb-2">Quest responses, answers to introspective questions</li>
              <li className="mb-2">Journals or feedback submitted during or after programs</li>
              <li className="mb-2">Self-assessment results or behavior-based observations</li>
            </ul>

            <h3 className="text-navy font-playfair text-2xl font-semibold mt-8 mb-4">d. Health & Lifestyle Data (Optional)</h3>
            <ul className="list-disc pl-6 mb-6">
              <li className="mb-2">Allergies, mental or physical health disclosures</li>
              <li className="mb-2">Dietary requirements or accessibility needs</li>
            </ul>

            <h3 className="text-navy font-playfair text-2xl font-semibold mt-8 mb-4">e. Financial & Transactional Data</h3>
            <ul className="list-disc pl-6 mb-6">
              <li className="mb-2">Payment history (via UPI, bank transfer, credit/debit card)</li>
              <li className="mb-2">Invoicing and billing records</li>
              <li className="mb-2">We do <strong>not</strong> collect or store card details directly</li>
            </ul>

            <h3 className="text-navy font-playfair text-2xl font-semibold mt-8 mb-4">f. Technical & Usage Information</h3>
            <ul className="list-disc pl-6 mb-8">
              <li className="mb-2">Device type, IP address, browser details, operating system</li>
              <li className="mb-2">IP address for assessment validation, session recovery, and geographic verification</li>
              <li className="mb-2">Device fingerprinting data (screen resolution, timezone, language settings, platform information) combined with IP address to create unique device identifiers for assessment integrity</li>
              <li className="mb-2">Location data derived from IP address for service eligibility verification</li>
              <li className="mb-2">Cookies and similar technologies (see Section 7)</li>
            </ul>

            {/* Section 4 */}
            <h2 className="text-navy font-playfair text-3xl font-bold mt-12 mb-6">4. How We Use Your Data</h2>
            <p className="mb-4">Your data is used strictly to:</p>
            <ul className="list-disc pl-6 mb-6">
              <li className="mb-2">Evaluate your readiness and fit for Frat Villa through Quest</li>
              <li className="mb-2">Create personalized feedback and insights</li>
              <li className="mb-2">Coordinate pre-event logistics and communication</li>
              <li className="mb-2">Ensure your physical and emotional safety during programs</li>
              <li className="mb-2">Deliver customer support and post-program updates</li>
              <li className="mb-2">Improve future programs through internal analysis</li>
            </ul>
            <p className="mb-8">
              We may anonymize data for research, product development, and performance analysis.
            </p>

            {/* Section 5 */}
            <h2 className="text-navy font-playfair text-3xl font-bold mt-12 mb-6">5. Disclosure of Information</h2>
            <p className="mb-6">
              We do <strong>not</strong> sell, rent, or trade your personal information.
            </p>
            <p className="mb-4">We may share limited data with:</p>
            <ul className="list-disc pl-6 mb-6">
              <li className="mb-2">Internal team members (on a need-to-know basis)</li>
              <li className="mb-2">Program facilitators or psychologists for group preparation</li>
              <li className="mb-2">Accommodation or logistics partners (for health/dietary/safety reasons)</li>
              <li className="mb-2">Third-party service providers (e.g., payment processors, email tools)</li>
              <li className="mb-2">Legal authorities, only when required by law</li>
            </ul>
            <p className="mb-8">
              All third parties are bound by strict confidentiality and data protection obligations.
            </p>

            {/* Section 6 */}
            <h2 className="text-navy font-playfair text-3xl font-bold mt-12 mb-6">6. Public Forums and Community Environments</h2>
            <p className="mb-8">
              Any information you voluntarily share in group discussions, public forums, reflection circles, or post-program communities may be visible to others. We recommend you exercise discretion while sharing sensitive personal stories in semi-public settings, even though the environment is psychologically safe.
            </p>

            {/* Section 7 */}
            <h2 className="text-navy font-playfair text-3xl font-bold mt-12 mb-6">7. Cookies and Analytics</h2>
            <p className="mb-4">We use cookies and tools like Google Analytics to:</p>
            <ul className="list-disc pl-6 mb-6">
              <li className="mb-2">Track website performance</li>
              <li className="mb-2">Understand user behavior</li>
              <li className="mb-2">Maintain session continuity</li>
            </ul>
            <p className="mb-8">
              You can manage your cookie preferences via your browser settings. Disabling cookies may affect your experience.
            </p>

            {/* Section 8 */}
            <h2 className="text-navy font-playfair text-3xl font-bold mt-12 mb-6">8. Retention of Information</h2>
            <ul className="list-disc pl-6 mb-6">
              <li className="mb-2">Data related to Frat Villa or Quest will be retained for a period of <strong>up to 18 months</strong></li>
              <li className="mb-2">Anonymized behavioral data may be retained longer for internal insight and product development</li>
              <li className="mb-2">You can request early deletion of your data (see Section 10)</li>
            </ul>

            {/* Section 9 */}
            <h2 className="text-navy font-playfair text-3xl font-bold mt-12 mb-6">9. Data Security</h2>
            <p className="mb-4">We use industry-standard security measures including:</p>
            <ul className="list-disc pl-6 mb-6">
              <li className="mb-2">End-to-end encryption (in transit and at rest)</li>
              <li className="mb-2">Role-based access to sensitive data</li>
              <li className="mb-2">Regular audits and infrastructure updates</li>
            </ul>
            <p className="mb-8">
              However, no system can be 100% secure. We cannot guarantee protection from unauthorized access beyond our control.
            </p>

            {/* Section 10 */}
            <h2 className="text-navy font-playfair text-3xl font-bold mt-12 mb-6">10. Your Rights</h2>
            <p className="mb-4">You may at any time:</p>
            <ul className="list-disc pl-6 mb-6">
              <li className="mb-2">Request access to your data</li>
              <li className="mb-2">Ask us to correct or update any inaccuracies</li>
              <li className="mb-2">Request deletion of your data from our systems</li>
              <li className="mb-2">Withdraw your consent (where applicable)</li>
              <li className="mb-2">Opt out of marketing or informational emails</li>
            </ul>
            <p className="mb-8">
              To exercise these rights, contact <strong><a href="mailto:support@fraterny.com" className="text-navy hover:underline">support@fraterny.com</a></strong>.
            </p>

            {/* Section 11 */}
            <h2 className="text-navy font-playfair text-3xl font-bold mt-12 mb-6">11. Under 18 Policy</h2>
            <p className="mb-8">
              Fraterny products are strictly meant for users aged <strong>18 and above</strong>. We do not knowingly collect data from minors.
            </p>

            {/* Section 12 */}
            <h2 className="text-navy font-playfair text-3xl font-bold mt-12 mb-6">12. Changes to This Policy</h2>
            <p className="mb-12">
              We may update this Privacy Policy as laws evolve or our services change. Updated versions will be posted with a revised effective date. Continued use of our services indicates acceptance of the latest terms.
            </p>
            
            <p className="text-sm text-gray-500 mt-12 italic border-t pt-6">
              Last updated: July 2025
            </p>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;