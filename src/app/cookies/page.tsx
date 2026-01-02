import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Cookie Policy | Astro Power Map",
  description: "Cookie Policy for Astro Power Map - How we use cookies and similar technologies",
};

export default function CookiesPage() {
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
          Cookie Policy
        </h1>
        <p className="text-white/50 text-sm mb-10">Last Updated: December 2025</p>

        {/* Content */}
        <div className="prose prose-invert prose-sm max-w-none space-y-8">
          <p className="text-white/80 leading-relaxed">
            This Cookie Policy explains how Astro Power Map (&quot;we,&quot; &quot;us,&quot; &quot;our&quot;)
            uses cookies and similar technologies when you visit our website.
          </p>

          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">1. What Are Cookies?</h2>
            <p className="text-white/80 leading-relaxed">
              Cookies are small text files stored on your device when you visit a website.
              They help websites remember your preferences and understand how you use the site.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">2. Types of Cookies We Use</h2>

            <h3 className="text-lg font-medium text-white/90 mt-6 mb-3">Essential Cookies</h3>
            <p className="text-white/70 leading-relaxed mb-2">
              These cookies are necessary for the website to function properly. They enable basic
              features like page navigation, secure areas access, and saving your quiz progress.
            </p>
            <ul className="list-disc list-inside text-white/60 space-y-1 text-sm">
              <li>Session management</li>
              <li>Quiz progress tracking</li>
              <li>Security and authentication</li>
            </ul>

            <h3 className="text-lg font-medium text-white/90 mt-6 mb-3">Analytics Cookies</h3>
            <p className="text-white/70 leading-relaxed mb-2">
              These cookies help us understand how visitors interact with our website by collecting
              and reporting information anonymously.
            </p>
            <ul className="list-disc list-inside text-white/60 space-y-1 text-sm">
              <li>Page views and navigation patterns</li>
              <li>Time spent on pages</li>
              <li>Device and browser information</li>
            </ul>

            <h3 className="text-lg font-medium text-white/90 mt-6 mb-3">Marketing Cookies</h3>
            <p className="text-white/70 leading-relaxed mb-2">
              These cookies track your visit to our website and may be used to show you relevant
              advertisements on other websites.
            </p>
            <ul className="list-disc list-inside text-white/60 space-y-1 text-sm">
              <li>Meta Pixel for advertising</li>
              <li>Attribution tracking (UTM parameters)</li>
            </ul>

            <h3 className="text-lg font-medium text-white/90 mt-6 mb-3">Functional Cookies</h3>
            <p className="text-white/70 leading-relaxed mb-2">
              These cookies remember your preferences and choices to provide enhanced functionality.
            </p>
            <ul className="list-disc list-inside text-white/60 space-y-1 text-sm">
              <li>Language preferences</li>
              <li>Previously entered birth data</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">3. Third-Party Cookies</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              We use services from third parties that may set their own cookies:
            </p>
            <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left px-4 py-3 text-white/80 font-medium">Service</th>
                    <th className="text-left px-4 py-3 text-white/80 font-medium">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="px-4 py-3 text-white/70">Stripe</td>
                    <td className="px-4 py-3 text-white/60">Payment processing and fraud prevention</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-white/70">Meta (Facebook)</td>
                    <td className="px-4 py-3 text-white/60">Advertising and conversion tracking</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-white/70">Supabase</td>
                    <td className="px-4 py-3 text-white/60">Database and authentication</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-white/70">Mapbox</td>
                    <td className="px-4 py-3 text-white/60">Map functionality</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">4. How to Manage Cookies</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              You can control and manage cookies in several ways:
            </p>

            <h3 className="text-lg font-medium text-white/90 mt-4 mb-2">Browser Settings</h3>
            <p className="text-white/70 leading-relaxed mb-3">
              Most browsers allow you to block or delete cookies through their settings. Here are
              links to manage cookies in popular browsers:
            </p>
            <ul className="list-disc list-inside text-white/60 space-y-1 text-sm">
              <li>
                <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-gold-glow hover:underline">
                  Google Chrome
                </a>
              </li>
              <li>
                <a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-gold-glow hover:underline">
                  Mozilla Firefox
                </a>
              </li>
              <li>
                <a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-gold-glow hover:underline">
                  Safari
                </a>
              </li>
              <li>
                <a href="https://support.microsoft.com/en-us/windows/manage-cookies-in-microsoft-edge-view-allow-block-delete-and-use-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer" className="text-gold-glow hover:underline">
                  Microsoft Edge
                </a>
              </li>
            </ul>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mt-4">
              <p className="text-amber-200/90 text-sm">
                <strong>Note:</strong> Blocking essential cookies may affect the functionality of our website.
                Some features may not work properly if cookies are disabled.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">5. Cookie Retention</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              Different cookies are stored for different periods:
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-1">
              <li><strong className="text-white">Session cookies:</strong> Deleted when you close your browser</li>
              <li><strong className="text-white">Persistent cookies:</strong> Remain until they expire or you delete them (typically 30 days to 2 years)</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">6. Updates to This Policy</h2>
            <p className="text-white/80 leading-relaxed">
              We may update this Cookie Policy from time to time. Any changes will be posted on this
              page with an updated &quot;Last Updated&quot; date.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-xl font-semibold text-white mt-10 mb-4">7. Contact Us</h2>
            <p className="text-white/80 leading-relaxed">
              If you have questions about our use of cookies, please contact us at:{" "}
              <a href="mailto:support@astropowermap.com" className="text-gold-glow hover:underline">
                support@astropowermap.com
              </a>
            </p>
          </section>

          {/* Other policies */}
          <div className="border-t border-white/10 pt-8 mt-10">
            <div className="flex gap-4 text-sm">
              <Link href="/terms" className="text-white/50 hover:text-white/80 transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-white/50 hover:text-white/80 transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
