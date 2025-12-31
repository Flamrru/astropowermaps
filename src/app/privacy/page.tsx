import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Astro Power Map",
  description: "Privacy Policy for Astro Power Map - How we collect, use, and protect your data",
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="text-white/50 text-sm mb-10">Last Updated: December 2025</p>

        {/* Content */}
        <div className="prose prose-invert prose-sm max-w-none space-y-8">
          <p className="text-white/80 leading-relaxed">
            This Privacy Policy explains how Astro Power Map (&quot;we,&quot; &quot;us,&quot; &quot;our&quot;)
            collects, uses, and shares your personal data.
          </p>

          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">1. Data We Collect</h2>

            <h3 className="text-lg font-medium text-white/90 mt-6 mb-3">Data You Provide:</h3>
            <ul className="list-disc list-inside text-white/70 space-y-1">
              <li>Birth date, birth time, birth location (required for reports)</li>
              <li>Email address</li>
              <li>Quiz responses</li>
              <li>Payment information (processed by third parties; we don&apos;t store card numbers)</li>
            </ul>

            <h3 className="text-lg font-medium text-white/90 mt-6 mb-3">Data Collected Automatically:</h3>
            <ul className="list-disc list-inside text-white/70 space-y-1">
              <li>IP address</li>
              <li>Browser and device information</li>
              <li>Pages visited and usage data</li>
              <li>Cookies and similar technologies</li>
              <li>Marketing attribution (UTM parameters)</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">2. How We Use Your Data</h2>
            <ul className="list-disc list-inside text-white/70 space-y-1">
              <li>Generate your personalized astrocartography report</li>
              <li>Process payments</li>
              <li>Send purchase confirmations</li>
              <li>Respond to support requests</li>
              <li>Analyze and improve our Service</li>
              <li>Send marketing emails (with your consent; you can opt out anytime)</li>
              <li>Prevent fraud</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">3. Legal Basis (EEA Users)</h2>
            <p className="text-white/80 leading-relaxed">
              We process data based on: contract performance (providing the Service), legitimate
              interests (analytics, fraud prevention), consent (marketing), and legal obligations.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">4. Data Sharing</h2>
            <p className="text-white/80 leading-relaxed mb-3">We share data with:</p>
            <ul className="list-disc list-inside text-white/70 space-y-1">
              <li>Payment processors (to process purchases)</li>
              <li>Hosting providers (to store data)</li>
              <li>Analytics providers (to analyze usage)</li>
              <li>Email providers (to send communications)</li>
              <li>Law enforcement (if legally required)</li>
            </ul>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mt-4">
              <p className="text-green-200/90 font-medium">We do NOT sell your personal data.</p>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">5. Data Retention</h2>
            <ul className="list-disc list-inside text-white/70 space-y-1">
              <li>Birth data and reports: Until you request deletion</li>
              <li>Purchase records: 7 years (legal requirements)</li>
              <li>Email: Until unsubscribe + 30 days</li>
              <li>Analytics: 26 months</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">6. Your Rights</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              <strong className="text-white">All users may:</strong> access, correct, or delete your data;
              opt out of marketing.
            </p>
            <p className="text-white/80 leading-relaxed mb-3">
              <strong className="text-white">EEA users (GDPR) may also:</strong> request data portability,
              restrict processing, object to processing, withdraw consent, lodge complaints with authorities.
            </p>
            <p className="text-white/80 leading-relaxed mb-3">
              <strong className="text-white">California users (CCPA) may also:</strong> request disclosure
              of data collected/shared.
            </p>
            <p className="text-white/80 leading-relaxed">
              To exercise rights, email:{" "}
              <a href="mailto:info@astropowermap.com" className="text-gold-glow hover:underline">
                info@astropowermap.com
              </a>
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">7. International Transfers</h2>
            <p className="text-white/80 leading-relaxed">
              Your data may be transferred to countries outside your residence. For EEA transfers,
              we use Standard Contractual Clauses or other approved mechanisms.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">8. Security</h2>
            <p className="text-white/80 leading-relaxed">
              We use encryption and security measures to protect your data, but no method is 100% secure.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">9. Children</h2>
            <p className="text-white/80 leading-relaxed">
              Our Service is not for individuals under 18. We don&apos;t knowingly collect data from
              children. Contact us if you believe we have.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">10. Changes</h2>
            <p className="text-white/80 leading-relaxed">
              We may update this Policy. Changes are posted here with an updated date.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">11. Contact</h2>
            <p className="text-white/80 leading-relaxed">
              Email:{" "}
              <a href="mailto:info@astropowermap.com" className="text-gold-glow hover:underline">
                info@astropowermap.com
              </a>
            </p>
          </section>

          {/* Other policies */}
          <div className="border-t border-white/10 pt-8 mt-10">
            <div className="flex gap-4 text-sm">
              <Link href="/terms" className="text-white/50 hover:text-white/80 transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-white/50 hover:text-white/80 transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
