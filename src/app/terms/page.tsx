import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service | Stella+",
  description: "Terms of Use & Service for Stella+ by Astro Power Map",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0a0a12] text-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white/90 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Home</span>
        </Link>

        {/* Header */}
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Terms of Use & Service
        </h1>
        <p className="text-white/50 text-sm mb-10">Last Updated: January 6, 2026</p>

        {/* Content */}
        <div className="prose prose-invert prose-sm max-w-none space-y-8">
          <p className="text-white/80 leading-relaxed">
            These Terms of Use & Service (the &quot;Terms&quot;) are an agreement between Stella+ / Astro Power Map
            (the &quot;Website,&quot; &quot;App,&quot; &quot;Service,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;)
            and any individual who is a user of Stella+ (&quot;you&quot; or &quot;User&quot;).
          </p>

          <p className="text-white/80 leading-relaxed">
            By using this Website or App, you accept all the terms of this Agreement. If you do not agree,
            stop using the Service immediately.
          </p>

          {/* Important Notices */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-200/90 font-medium mb-2">IMPORTANT NOTICES</p>
            <p className="text-white/70 text-sm leading-relaxed mb-2">
              This agreement contains a binding arbitration provision and class action waiver in
              Section 12 that affects your rights. Disputes must be resolved in arbitration on an
              individual basis.
            </p>
            <p className="text-white/70 text-sm leading-relaxed">
              All policies referenced herein, including Privacy Policy, Cookie Policy, and Refund Policy,
              are part of this Agreement. We may change these Terms at any time by posting updates to this page.
              Continued use means you accept changes.
            </p>
          </div>

          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">1. Service Description</h2>
            <p className="text-white/80 leading-relaxed">
              Stella+ provides digital astrocartography and birth chart analysis, generating personalized
              reports showing power locations and optimal timing based on your birth data. The Service includes:
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-1 mt-3">
              <li>Personalized astrocartography maps and reports</li>
              <li>&quot;Power months&quot; and &quot;power places&quot; recommendations</li>
              <li>An AI-powered chat assistant (&quot;Stella&quot;) for astrological guidance</li>
              <li>Daily Power Score and timing recommendations</li>
              <li>Best Day Picker and calendar integration</li>
              <li>2026 yearly forecast and life transits timeline</li>
              <li>Journal prompts and interactive mapping features</li>
            </ul>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mt-4">
              <p className="text-amber-200/90 font-medium">
                THE SERVICE IS PROVIDED FOR ENTERTAINMENT AND INFORMATIONAL PURPOSES ONLY.
              </p>
            </div>
            <p className="text-white/80 leading-relaxed mt-4">
              The Service does NOT provide professional advice of any kind, including but not limited to:
              financial advice, investment advice, medical advice, psychological advice, legal advice,
              life coaching, career counseling, relationship counseling, or any other form of professional guidance.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">2. AI Chat Assistant Disclaimer</h2>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
              <p className="text-red-200/90 font-medium">CRITICAL: PLEASE READ THIS SECTION CAREFULLY.</p>
            </div>
            <p className="text-white/80 leading-relaxed">
              The Service includes an AI-powered chat assistant (&quot;Stella&quot;) that provides astrological
              interpretations, suggestions, and responses based on your birth chart data and questions.
            </p>

            <h3 className="text-lg font-medium text-white mt-6 mb-3">2.1 Nature of AI Responses</h3>
            <p className="text-white/80 leading-relaxed">You acknowledge and agree that:</p>
            <ul className="list-disc list-inside text-white/70 space-y-1 mt-2">
              <li><strong className="text-white">All AI-generated content is for entertainment and informational purposes only</strong></li>
              <li>The AI assistant is an automated system that generates responses based on astrological algorithms and language models</li>
              <li>AI responses are NOT professional advice of any kind</li>
              <li>AI responses may be inaccurate, incomplete, or inappropriate for your specific situation</li>
              <li>The AI assistant cannot assess your personal circumstances, financial situation, health status, or any other real-world factors</li>
              <li>AI responses should NEVER be relied upon for making important life decisions</li>
            </ul>

            <h3 className="text-lg font-medium text-white mt-6 mb-3">2.2 No Reliance on AI Responses</h3>
            <p className="text-white/80 leading-relaxed font-medium">YOU EXPRESSLY ACKNOWLEDGE AND AGREE THAT:</p>
            <ul className="list-disc list-inside text-white/70 space-y-1 mt-2">
              <li>You will NOT make financial decisions (including investments, gambling, purchases, or any monetary decisions) based on AI responses</li>
              <li>You will NOT make health or medical decisions based on AI responses</li>
              <li>You will NOT make legal decisions based on AI responses</li>
              <li>You will NOT make major life decisions (career changes, relocations, relationship decisions) solely based on AI responses</li>
              <li>Any action you take based on AI-generated content is entirely at your own risk and discretion</li>
            </ul>

            <h3 className="text-lg font-medium text-white mt-6 mb-3">2.3 User Responsibility</h3>
            <p className="text-white/80 leading-relaxed font-medium">YOU ASSUME FULL AND COMPLETE RESPONSIBILITY FOR:</p>
            <ul className="list-disc list-inside text-white/70 space-y-1 mt-2">
              <li>All decisions you make after receiving AI-generated content</li>
              <li>All actions you take based on any information, suggestion, or recommendation from the AI assistant</li>
              <li>Any consequences, damages, losses, or outcomes resulting from your reliance on AI-generated content</li>
              <li>Seeking appropriate professional advice before making important decisions</li>
            </ul>

            <h3 className="text-lg font-medium text-white mt-6 mb-3">2.4 Limitation of AI Liability</h3>
            <p className="text-white/80 leading-relaxed font-medium">TO THE MAXIMUM EXTENT PERMITTED BY LAW:</p>
            <ul className="list-disc list-inside text-white/70 space-y-1 mt-2">
              <li>We are NOT liable for any decisions you make based on AI-generated content</li>
              <li>We are NOT liable for any actions you take based on AI suggestions</li>
              <li>We are NOT liable for any financial losses, damages, or negative outcomes resulting from your reliance on AI responses</li>
              <li>We are NOT liable for the accuracy, completeness, or appropriateness of AI-generated content</li>
              <li>We make NO guarantees about the quality, reliability, or suitability of AI responses</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">3. Astrological Services Disclaimer</h2>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-4">
              <p className="text-amber-200/90 font-medium">IMPORTANT: READ THIS CAREFULLY.</p>
            </div>
            <p className="text-white/80 leading-relaxed">
              All astrocartography reports, birth chart analyses, &quot;power months,&quot; &quot;power places,&quot;
              timing recommendations, and other astrological information are for{" "}
              <strong className="text-white">ENTERTAINMENT AND INFORMATIONAL PURPOSES ONLY</strong>.
            </p>

            <h3 className="text-lg font-medium text-white mt-6 mb-3">3.1 No Claims of Accuracy or Predictive Power</h3>
            <p className="text-white/80 leading-relaxed">We make NO CLAIMS that:</p>
            <ul className="list-disc list-inside text-white/70 space-y-1 mt-2">
              <li>Astrological information will predict future events</li>
              <li>Visiting suggested locations will result in any specific outcomes</li>
              <li>Acting during suggested time periods will produce any specific results</li>
              <li>The information provided is scientifically validated</li>
              <li>Any planetary alignments, transits, or astrological factors will influence real-world events</li>
              <li>Following our recommendations will improve your life circumstances</li>
            </ul>

            <h3 className="text-lg font-medium text-white mt-6 mb-3">3.2 User Acknowledgment</h3>
            <p className="text-white/80 leading-relaxed font-medium">YOU ACKNOWLEDGE AND AGREE:</p>
            <ul className="list-disc list-inside text-white/70 space-y-1 mt-2">
              <li>Astrology is not a scientifically validated discipline</li>
              <li>You are solely responsible for your own decisions and actions</li>
              <li>We are not liable for any decisions you make based on our Service</li>
              <li>No specific outcomes are guaranteed</li>
              <li>Astrological information should be treated as entertainment, not guidance</li>
              <li>Any resemblance between astrological predictions and actual events is coincidental</li>
            </ul>

            <h3 className="text-lg font-medium text-white mt-6 mb-3">3.3 Professional Advice Required</h3>
            <p className="text-white/80 leading-relaxed">
              <strong className="text-white">DO NOT</strong> use this Service as a substitute for professional advice.
              You must consult qualified professionals for:
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-1 mt-2">
              <li>Financial and investment decisions</li>
              <li>Medical and health decisions</li>
              <li>Legal matters</li>
              <li>Psychological or mental health concerns</li>
              <li>Career decisions</li>
              <li>Relationship counseling</li>
              <li>Any other important life decisions</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">4. Subscription Terms</h2>

            <h3 className="text-lg font-medium text-white mt-6 mb-3">4.1 Subscription Plans</h3>
            <p className="text-white/80 leading-relaxed">
              The Service is offered on a subscription basis. By subscribing, you agree to:
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-1 mt-2">
              <li>Pay the recurring subscription fee at the interval selected (monthly or annual)</li>
              <li>Automatic renewal of your subscription until cancelled</li>
              <li>Provide accurate and complete payment information</li>
            </ul>

            <h3 className="text-lg font-medium text-white mt-6 mb-3">4.2 Pricing and Billing</h3>
            <ul className="list-disc list-inside text-white/70 space-y-1 mt-2">
              <li>Subscription prices are displayed at the time of purchase</li>
              <li>Prices may change; existing subscribers will be notified of changes before their next billing cycle</li>
              <li>All fees are charged in advance for the upcoming subscription period</li>
              <li>Subscriptions automatically renew unless cancelled before the renewal date</li>
            </ul>

            <h3 className="text-lg font-medium text-white mt-6 mb-3">4.3 Free Trials</h3>
            <p className="text-white/80 leading-relaxed">If a free trial is offered:</p>
            <ul className="list-disc list-inside text-white/70 space-y-1 mt-2">
              <li>You must provide valid payment information to start the trial</li>
              <li>Your subscription will automatically convert to a paid subscription at the end of the trial period unless cancelled</li>
              <li>Trial periods may only be used once per user</li>
              <li>We reserve the right to limit trial eligibility</li>
            </ul>

            <h3 className="text-lg font-medium text-white mt-6 mb-3">4.4 Cancellation</h3>
            <ul className="list-disc list-inside text-white/70 space-y-1 mt-2">
              <li>You may cancel your subscription at any time through your account settings or by contacting support</li>
              <li>Cancellation takes effect at the end of the current billing period</li>
              <li>You will retain access to the Service until the end of your paid period</li>
              <li>No partial refunds are provided for unused portions of a subscription period</li>
            </ul>

            <h3 className="text-lg font-medium text-white mt-6 mb-3">4.5 Refunds</h3>
            <ul className="list-disc list-inside text-white/70 space-y-1 mt-2">
              <li>Refund requests may be submitted within 14 days of purchase by emailing support@astropowermap.com</li>
              <li>Refunds are reviewed on a case-by-case basis</li>
              <li>We reserve the right to deny refund requests that appear fraudulent, abusive, or excessive</li>
              <li>Refunds, if granted, will be processed to the original payment method</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">5. License and Intellectual Property</h2>

            <h3 className="text-lg font-medium text-white mt-6 mb-3">5.1 Limited License</h3>
            <p className="text-white/80 leading-relaxed">
              You are granted a limited, non-exclusive, non-transferable, revocable license to access and use
              the Website, App, and Content for your own personal, non-commercial use only.
            </p>

            <h3 className="text-lg font-medium text-white mt-6 mb-3">5.2 Restrictions</h3>
            <p className="text-white/80 leading-relaxed">You may NOT:</p>
            <ul className="list-disc list-inside text-white/70 space-y-1 mt-2">
              <li>Copy, reproduce, distribute, sell, or commercially exploit any Content</li>
              <li>Use automated systems (bots, spiders, scrapers) to access the Service</li>
              <li>Circumvent, disable, or interfere with security features</li>
              <li>Resell, redistribute, or share your subscription access</li>
              <li>Create derivative works from our Content</li>
              <li>Remove any copyright or proprietary notices</li>
              <li>Use the Service for any illegal purpose</li>
            </ul>

            <h3 className="text-lg font-medium text-white mt-6 mb-3">5.3 Ownership</h3>
            <p className="text-white/80 leading-relaxed">
              All content on the Website and App is our property or our licensors&apos; property and is protected
              by intellectual property laws. Your purchased reports and subscription access are licensed for
              personal use only.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">6. User Conduct</h2>
            <p className="text-white/80 leading-relaxed">You agree not to:</p>
            <ul className="list-disc list-inside text-white/70 space-y-1 mt-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Provide false or misleading information</li>
              <li>Impersonate any person or entity</li>
              <li>Interfere with the proper functioning of the Service</li>
              <li>Attempt to gain unauthorized access to any systems</li>
              <li>Use the Service to harm, harass, or defraud others</li>
              <li>Share your account credentials with others</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">7. User Data and Privacy</h2>
            <p className="text-white/80 leading-relaxed">
              Your use of the Service is governed by our{" "}
              <Link href="/privacy" className="text-gold-glow hover:underline">
                Privacy Policy
              </Link>
              . By using the Service, you consent to the collection, use, and sharing of your information
              as described in the Privacy Policy.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">8. Disclaimers of Warranties</h2>
            <p className="text-white/80 leading-relaxed font-medium">TO THE FULLEST EXTENT PERMITTED BY LAW:</p>
            <p className="text-white/80 leading-relaxed mt-3">
              The Service is provided &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; without warranties of any kind,
              either express or implied.
            </p>
            <p className="text-white/80 leading-relaxed mt-3">
              We expressly disclaim all warranties, including but not limited to:
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-1 mt-2">
              <li>Merchantability</li>
              <li>Fitness for a particular purpose</li>
              <li>Non-infringement</li>
              <li>Accuracy or reliability of content</li>
              <li>Uninterrupted or error-free service</li>
              <li>Security of data transmission</li>
              <li>Results from use of the Service</li>
            </ul>
            <p className="text-white/80 leading-relaxed mt-4">We do not warrant that:</p>
            <ul className="list-disc list-inside text-white/70 space-y-1 mt-2">
              <li>The Service will meet your expectations</li>
              <li>The Service will be uninterrupted, timely, secure, or error-free</li>
              <li>Results obtained from the Service will be accurate or reliable</li>
              <li>Any errors will be corrected</li>
              <li>The Service is free of viruses or harmful components</li>
            </ul>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">9. Limitation of Liability</h2>
            <p className="text-white/80 leading-relaxed font-medium">TO THE FULLEST EXTENT PERMITTED BY LAW:</p>

            <h3 className="text-lg font-medium text-white mt-6 mb-3">9.1 Exclusion of Damages</h3>
            <p className="text-white/80 leading-relaxed">We are NOT liable for any:</p>
            <ul className="list-disc list-inside text-white/70 space-y-1 mt-2">
              <li>Direct, indirect, incidental, special, consequential, or punitive damages</li>
              <li>Loss of profits, revenue, data, or business opportunities</li>
              <li>Personal injury or property damage</li>
              <li>Damages arising from your use of or inability to use the Service</li>
              <li>Damages arising from any content, including AI-generated content</li>
              <li>Damages arising from decisions you make based on our Service</li>
              <li>Damages arising from unauthorized access to your data</li>
              <li>Any other damages of any kind</li>
            </ul>

            <h3 className="text-lg font-medium text-white mt-6 mb-3">9.2 Specific Exclusions</h3>
            <p className="text-white/80 leading-relaxed">
              Without limiting the foregoing, we are specifically NOT liable for:
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-1 mt-2">
              <li><strong className="text-white">Financial losses</strong> from decisions influenced by our Service or AI responses</li>
              <li><strong className="text-white">Investment losses</strong> from any financial decisions made after using our Service</li>
              <li><strong className="text-white">Gambling losses</strong> from any betting or wagering decisions</li>
              <li><strong className="text-white">Relationship outcomes</strong> from decisions about partnerships or marriages</li>
              <li><strong className="text-white">Career outcomes</strong> from job or business decisions</li>
              <li><strong className="text-white">Health outcomes</strong> from decisions about medical treatment</li>
              <li><strong className="text-white">Legal consequences</strong> from any legal decisions</li>
              <li><strong className="text-white">Travel outcomes</strong> from decisions about travel destinations or timing</li>
              <li><strong className="text-white">Any negative life outcomes</strong> that you attribute to following our recommendations</li>
            </ul>

            <h3 className="text-lg font-medium text-white mt-6 mb-3">9.3 Maximum Liability</h3>
            <p className="text-white/80 leading-relaxed">
              <strong className="text-white">IF WE ARE FOUND LIABLE FOR ANY REASON</strong>, our maximum aggregate
              liability to you for all claims arising from or related to the Service is limited to:
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-1 mt-2">
              <li>The amount you paid for the Service in the 12 months preceding the claim, OR</li>
              <li>Fifty US Dollars ($50 USD)</li>
            </ul>
            <p className="text-white/80 leading-relaxed mt-2">Whichever is <strong className="text-white">greater</strong>.</p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">10. Indemnification</h2>
            <p className="text-white/80 leading-relaxed">
              You agree to indemnify, defend, and hold harmless Stella+ / Astro Power Map, its operators,
              affiliates, officers, directors, employees, agents, and licensors from and against any and all
              claims, losses, damages, liabilities, costs, and expenses (including reasonable attorneys&apos; fees)
              arising from or related to:
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-1 mt-2">
              <li>Your use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any rights of another party</li>
              <li>Your decisions or actions based on the Service</li>
              <li>Any content you submit or transmit through the Service</li>
              <li>Your reliance on AI-generated content</li>
            </ul>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">11. Third-Party Services</h2>
            <p className="text-white/80 leading-relaxed">
              The Service may contain links to third-party websites or services. We are not responsible for:
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-1 mt-2">
              <li>The content, accuracy, or practices of third-party sites</li>
              <li>Any transactions you conduct with third parties</li>
              <li>Any damages or losses caused by third-party services</li>
            </ul>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">12. Dispute Resolution and Arbitration</h2>

            <h3 className="text-lg font-medium text-white mt-6 mb-3">12.1 Agreement to Arbitrate</h3>
            <p className="text-white/80 leading-relaxed">
              Any dispute, claim, or controversy arising from or relating to these Terms, the Service, or
              your relationship with us shall be resolved through{" "}
              <strong className="text-white">binding individual arbitration</strong>, not in court, except for:
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-1 mt-2">
              <li>Claims that may be brought in small claims court</li>
              <li>Intellectual property disputes</li>
            </ul>

            <h3 className="text-lg font-medium text-white mt-6 mb-3">12.2 Class Action Waiver</h3>
            <p className="text-white/80 leading-relaxed font-medium">
              YOU WAIVE ANY RIGHT TO PARTICIPATE IN A CLASS ACTION LAWSUIT OR CLASS-WIDE ARBITRATION.
            </p>
            <p className="text-white/80 leading-relaxed mt-2">
              All disputes must be brought in your individual capacity only. You may not:
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-1 mt-2">
              <li>Bring claims as a plaintiff or class member in any class or representative proceeding</li>
              <li>Consolidate claims with those of other users</li>
              <li>Participate in any collective arbitration</li>
            </ul>

            <h3 className="text-lg font-medium text-white mt-6 mb-3">12.3 Informal Resolution</h3>
            <p className="text-white/80 leading-relaxed">Before initiating arbitration, you must:</p>
            <ul className="list-disc list-inside text-white/70 space-y-1 mt-2">
              <li>Contact us at support@astropowermap.com</li>
              <li>Describe your dispute in detail</li>
              <li>Allow at least 30 days for informal resolution</li>
            </ul>

            <h3 className="text-lg font-medium text-white mt-6 mb-3">12.4 Opt-Out Right</h3>
            <p className="text-white/80 leading-relaxed">You may opt out of this arbitration agreement by:</p>
            <ul className="list-disc list-inside text-white/70 space-y-1 mt-2">
              <li>Emailing support@astropowermap.com within 30 days of first using the Service</li>
              <li>Clearly stating your intent to opt out</li>
              <li>Including your name and account information</li>
            </ul>
          </section>

          {/* Section 13 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">13. Governing Law</h2>
            <p className="text-white/80 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction
              in which we operate, without regard to conflict of law principles.
            </p>
          </section>

          {/* Section 14 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">14. Severability</h2>
            <p className="text-white/80 leading-relaxed">
              If any provision of these Terms is found to be invalid, illegal, or unenforceable, the remaining
              provisions shall continue in full force and effect.
            </p>
          </section>

          {/* Section 15 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">15. Entire Agreement</h2>
            <p className="text-white/80 leading-relaxed">
              These Terms, together with the Privacy Policy, Refund Policy, and any other policies referenced
              herein, constitute the entire agreement between you and Stella+ / Astro Power Map regarding the Service.
            </p>
          </section>

          {/* Section 16 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">16. Waiver</h2>
            <p className="text-white/80 leading-relaxed">
              Our failure to enforce any provision of these Terms shall not constitute a waiver of that
              provision or any other provision.
            </p>
          </section>

          {/* Section 17 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">17. Assignment</h2>
            <p className="text-white/80 leading-relaxed">
              We may assign our rights and obligations under these Terms without your consent. You may not
              assign your rights or obligations without our prior written consent.
            </p>
          </section>

          {/* Section 18 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">18. Changes to Terms</h2>
            <p className="text-white/80 leading-relaxed">
              We reserve the right to modify these Terms at any time. Changes will be effective upon posting
              to the Service. Your continued use of the Service after changes constitutes acceptance of the
              modified Terms.
            </p>
          </section>

          {/* Section 19 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">19. Contact Information</h2>
            <p className="text-white/80 leading-relaxed">
              For questions about these Terms, please contact us at:
            </p>
            <p className="text-white/80 leading-relaxed mt-2">
              <strong className="text-white">Email:</strong>{" "}
              <a href="mailto:support@astropowermap.com" className="text-gold-glow hover:underline">
                support@astropowermap.com
              </a>
            </p>
          </section>

          {/* Section 20 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">20. Acknowledgment</h2>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <p className="text-white/90 font-medium mb-3">BY USING STELLA+, YOU ACKNOWLEDGE THAT:</p>
              <ol className="list-decimal list-inside text-white/70 space-y-2">
                <li>You have read and understood these Terms</li>
                <li>You agree to be bound by these Terms</li>
                <li>The Service is for entertainment and informational purposes only</li>
                <li>You will not rely on the Service or AI-generated content for important decisions</li>
                <li>You assume full responsibility for all decisions and actions you take</li>
                <li>You waive all claims against us for outcomes resulting from your use of the Service</li>
              </ol>
            </div>
          </section>

          {/* Final statement */}
          <div className="border-t border-white/10 pt-8 mt-10">
            <p className="text-white/60 text-sm">
              © 2026 Stella+ / Astro Power Map. All rights reserved.
            </p>
          </div>

          {/* Other policies */}
          <div className="flex gap-4 text-sm pt-4">
            <Link href="/privacy" className="text-white/50 hover:text-white/80 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/cookies" className="text-white/50 hover:text-white/80 transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
