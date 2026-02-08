import { PageLayout } from '@/components/landing/PageLayout';
import { Cookie } from 'lucide-react';

const cookieTypes = [
  {
    name: 'Essential Cookies',
    purpose: 'Required for the Service to function. Includes authentication tokens, session management, and security cookies.',
    duration: 'Session / up to 1 year',
    canDisable: false,
  },
  {
    name: 'Functional Cookies',
    purpose: 'Remember your preferences such as language, theme (light/dark mode), and default generation settings.',
    duration: 'Up to 1 year',
    canDisable: true,
  },
  {
    name: 'Analytics Cookies',
    purpose: 'Help us understand how you use the Service so we can improve it. We use privacy-respecting analytics that do not track you across sites.',
    duration: 'Up to 1 year',
    canDisable: true,
  },
  {
    name: 'Performance Cookies',
    purpose: 'Monitor Service performance, load times, and error rates to ensure a reliable experience.',
    duration: 'Up to 30 days',
    canDisable: true,
  },
];

export default function CookiePolicy() {
  return (
    <PageLayout>
      <section className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Cookie className="w-4 h-4" />
              Legal
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight mb-4">
              Cookie Policy
            </h1>
            <p className="text-sm text-muted-foreground">Last updated: February 2026</p>
          </div>

          <div className="prose prose-sm max-w-none text-muted-foreground [&_h2]:text-foreground [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-foreground [&_h3]:font-medium [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:mb-4 [&_p]:leading-relaxed [&_ul]:mb-4 [&_ul]:space-y-1 [&_li]:ml-4">
            <p>
              <em>
                This is a template cookie policy provided for informational purposes. We recommend consulting with a legal professional to ensure compliance with applicable laws.
              </em>
            </p>

            <h2>1. What Are Cookies?</h2>
            <p>
              Cookies are small text files stored on your device when you visit a website. They help the website remember your preferences and understand how you interact with it. VOVV.AI uses cookies and similar technologies to provide, protect, and improve the Service.
            </p>

            <h2>2. Cookies We Use</h2>

            <div className="overflow-x-auto mb-8">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 pr-4 text-foreground font-semibold">Type</th>
                    <th className="text-left py-3 pr-4 text-foreground font-semibold">Purpose</th>
                    <th className="text-left py-3 pr-4 text-foreground font-semibold">Duration</th>
                    <th className="text-left py-3 text-foreground font-semibold">Required?</th>
                  </tr>
                </thead>
                <tbody>
                  {cookieTypes.map((cookie) => (
                    <tr key={cookie.name} className="border-b border-border">
                      <td className="py-3 pr-4 font-medium text-foreground align-top">{cookie.name}</td>
                      <td className="py-3 pr-4 align-top">{cookie.purpose}</td>
                      <td className="py-3 pr-4 align-top whitespace-nowrap">{cookie.duration}</td>
                      <td className="py-3 align-top">
                        {cookie.canDisable ? (
                          <span className="text-muted-foreground">Optional</span>
                        ) : (
                          <span className="text-foreground font-medium">Required</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2>3. Third-Party Cookies</h2>
            <p>
              We do not use third-party advertising cookies. Our analytics are privacy-respecting and do not track you across other websites. Payment processing cookies from our payment provider (Stripe) may be set when you make a purchase.
            </p>

            <h2>4. How to Manage Cookies</h2>
            <p>
              You can control cookies through your browser settings. Most browsers allow you to:
            </p>
            <ul>
              <li>• View and delete existing cookies</li>
              <li>• Block cookies from specific or all websites</li>
              <li>• Set preferences for first-party vs. third-party cookies</li>
              <li>• Enable "Do Not Track" signals</li>
            </ul>
            <p>
              Please note that disabling essential cookies may prevent you from using certain features of the Service, such as staying logged in.
            </p>

            <h2>5. Local Storage</h2>
            <p>
              In addition to cookies, we use browser local storage to save your application preferences (such as theme settings and generation defaults). This data stays on your device and is not transmitted to our servers.
            </p>

            <h2>6. Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time. Changes will be posted on this page with an updated "Last updated" date.
            </p>

            <h2>7. Contact Us</h2>
            <p>
              Questions about our use of cookies? Contact us at{' '}
              <a href="mailto:legal@vovv.ai" className="text-primary hover:underline">
                legal@vovv.ai
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
