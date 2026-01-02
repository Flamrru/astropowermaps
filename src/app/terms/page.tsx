import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service | Astro Power Map",
  description: "Terms of Use & Service for Astro Power Map",
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
        <p className="text-white/50 text-sm mb-10">Last Updated: December 2025</p>

        {/* Content */}
        <div className="prose prose-invert prose-sm max-w-none space-y-8">
          <p className="text-white/80 leading-relaxed">
            These Terms of Use & Service (the &quot;Terms&quot;) are an agreement between Astro Power Map
            (the &quot;Website&quot; / &quot;we&quot; / &quot;us&quot;) and any individual who is a user of Astro Power Map.
          </p>

          <p className="text-white/80 leading-relaxed">
            By using this Website, you accept all the terms of this Agreement. If you do not agree,
            stop using the Website immediately.
          </p>

          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <p className="text-white/90 font-medium mb-2">IMPORTANT:</p>
            <p className="text-white/70 text-sm leading-relaxed">
              This agreement contains a binding arbitration provision and class action waiver in
              Section 10 that affects your rights. Disputes must be resolved in arbitration on an
              individual basis.
            </p>
          </div>

          <p className="text-white/80 leading-relaxed">
            All policies referenced herein, including Privacy Policy, Cookie Policy, and Refund Policy,
            are part of this Agreement. We may change these Terms at any time by posting updates to this page.
            Continued use means you accept changes.
          </p>

          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">1. Service</h2>
            <p className="text-white/80 leading-relaxed">
              Astro Power Map provides digital astrocartography and birth chart analysis, generating
              personalized reports showing power locations and optimal timing based on your birth data.
            </p>
            <p className="text-white/80 leading-relaxed mt-3">
              The Service provides entertainment and informational content based on astrological calculations.
              The Service does NOT provide professional advice of any kind, including financial, medical,
              legal, or life coaching advice.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">2. License</h2>
            <p className="text-white/80 leading-relaxed">
              You are granted a limited, non-exclusive, non-transferable license to access and use the
              Website and Content for your own personal use only.
            </p>
            <p className="text-white/80 leading-relaxed mt-3">You may NOT:</p>
            <ul className="list-disc list-inside text-white/70 space-y-1 mt-2">
              <li>Copy, reproduce, distribute, or sell any Content</li>
              <li>Use automated systems (bots, spiders) to access the Website</li>
              <li>Circumvent security features</li>
              <li>Resell or redistribute your personalized reports</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">3. Intellectual Property</h2>
            <p className="text-white/80 leading-relaxed">
              All content on the Website is our property or our licensors&apos; property and is protected
              by intellectual property laws. Your purchased reports are licensed for personal use only.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">4. Purchases and Payments</h2>
            <p className="text-white/80 leading-relaxed">
              The Service offers one-time purchases of personalized astrocartography reports.
              By purchasing, you agree to pay the stated price.
            </p>
            <p className="text-white/80 leading-relaxed mt-3">
              Reports are delivered digitally and immediately upon payment. Due to digital delivery,
              all sales are generally final.
            </p>
            <p className="text-white/80 leading-relaxed mt-3">
              <strong className="text-white">REFUNDS:</strong> If dissatisfied, you may request a refund
              within 14 days of purchase by emailing support@astropowermap.com. Refunds are reviewed case-by-case.
              We may deny requests that appear fraudulent or abusive.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">5. Disclaimer of Astrological Services</h2>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-4">
              <p className="text-amber-200/90 font-medium">IMPORTANT: READ THIS CAREFULLY.</p>
            </div>
            <p className="text-white/80 leading-relaxed">
              All astrocartography reports, birth chart analyses, &quot;power months,&quot; &quot;power places,&quot;
              and other astrological information are for <strong className="text-white">ENTERTAINMENT AND
              INFORMATIONAL PURPOSES ONLY</strong>.
            </p>
            <p className="text-white/80 leading-relaxed mt-3">We make NO CLAIMS that:</p>
            <ul className="list-disc list-inside text-white/70 space-y-1 mt-2">
              <li>Astrological information will predict future events</li>
              <li>Visiting suggested locations will result in any specific outcomes</li>
              <li>Acting during suggested time periods will produce any specific results</li>
              <li>The information is scientifically validated</li>
            </ul>
            <p className="text-white/80 leading-relaxed mt-4">YOU ACKNOWLEDGE AND AGREE:</p>
            <ul className="list-disc list-inside text-white/70 space-y-1 mt-2">
              <li>Astrology is not a science</li>
              <li>You are solely responsible for your own decisions and actions</li>
              <li>We are not liable for decisions you make based on our Service</li>
              <li>No specific outcomes are guaranteed</li>
            </ul>
            <p className="text-white/80 leading-relaxed mt-4">
              DO NOT use this Service as a substitute for professional advice. Consult qualified
              professionals for financial, medical, legal, or other important decisions.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">6. Disclaimers of Warranties</h2>
            <p className="text-white/80 leading-relaxed">
              TO THE FULLEST EXTENT PERMITTED BY LAW:
            </p>
            <p className="text-white/80 leading-relaxed mt-3">
              The Website is provided &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; without warranties of any kind.
              We disclaim all warranties, express or implied, including merchantability, fitness for a
              particular purpose, and non-infringement.
            </p>
            <p className="text-white/80 leading-relaxed mt-3">
              We do not warrant that the Website will be error-free, uninterrupted, or secure, or that
              results will be accurate or reliable.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">7. Limitation of Liability</h2>
            <p className="text-white/80 leading-relaxed">
              TO THE FULLEST EXTENT PERMITTED BY LAW:
            </p>
            <p className="text-white/80 leading-relaxed mt-3">
              We are not liable for any direct, indirect, incidental, special, consequential, or punitive
              damages arising from your use of the Website or Service, including damages from decisions
              made based on our content.
            </p>
            <p className="text-white/80 leading-relaxed mt-3">
              IF WE ARE FOUND LIABLE, our maximum liability is limited to the amount you paid for the
              specific Report, or $50, whichever is greater.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">8. Indemnification</h2>
            <p className="text-white/80 leading-relaxed">
              You agree to indemnify and hold harmless Astro Power Map and its operators from any claims,
              losses, or damages arising from your use of the Website or violation of these Terms.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">9. Privacy</h2>
            <p className="text-white/80 leading-relaxed">
              Your use of the Website is governed by our{" "}
              <Link href="/privacy" className="text-gold-glow hover:underline">
                Privacy Policy
              </Link>
              . Please review it for information about data collection and use.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">10. Dispute Resolution and Arbitration</h2>
            <p className="text-white/80 leading-relaxed">
              <strong className="text-white">AGREEMENT TO ARBITRATE:</strong> Any dispute arising from
              these Terms or your use of the Service shall be resolved through binding arbitration,
              not court, except for intellectual property claims.
            </p>
            <p className="text-white/80 leading-relaxed mt-3">
              <strong className="text-white">CLASS ACTION WAIVER:</strong> You waive any right to
              participate in a class action lawsuit or class-wide arbitration. All disputes must be
              brought individually.
            </p>
            <p className="text-white/80 leading-relaxed mt-3">
              <strong className="text-white">INFORMAL RESOLUTION:</strong> Before arbitration, contact
              us at support@astropowermap.com and attempt to resolve the dispute informally for at least 30 days.
            </p>
            <p className="text-white/80 leading-relaxed mt-3">
              <strong className="text-white">OPT-OUT:</strong> You may opt out of arbitration by emailing
              support@astropowermap.com within 30 days of first using the Service.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">11. General</h2>
            <p className="text-white/80 leading-relaxed">
              These Terms constitute the entire agreement between you and us. If any provision is invalid,
              the remainder continues in effect. Our failure to enforce any provision is not a waiver.
              We may assign our rights under this Agreement.
            </p>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">12. Contact</h2>
            <p className="text-white/80 leading-relaxed">
              Email:{" "}
              <a href="mailto:support@astropowermap.com" className="text-gold-glow hover:underline">
                support@astropowermap.com
              </a>
            </p>
          </section>

          {/* Final statement */}
          <div className="border-t border-white/10 pt-8 mt-10">
            <p className="text-white/60 text-sm italic">
              By using Astro Power Map, you acknowledge that you have read, understood, and agree to these Terms.
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
