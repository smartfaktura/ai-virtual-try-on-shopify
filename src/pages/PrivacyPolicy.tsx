import { PageLayout } from '@/components/landing/PageLayout';
import { Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <PageLayout>
      <section className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Legal
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight mb-4">
              Privacy Policy
            </h1>
            <p className="text-sm text-muted-foreground">Last updated: February 2026</p>
          </div>

          <div className="prose prose-sm max-w-none text-muted-foreground [&_h2]:text-foreground [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-foreground [&_h3]:font-medium [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:mb-4 [&_p]:leading-relaxed [&_ul]:mb-4 [&_ul]:space-y-1 [&_li]:ml-4">
            <p>
              <em>
                This is a template privacy policy provided for informational purposes. We recommend consulting with a legal professional to ensure compliance with applicable laws.
              </em>
            </p>

            <h2>1. Introduction</h2>
            <p>
              VOVV.AI ("we," "our," or "us") operates the VOVV.AI platform (the "Service"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.
            </p>

            <h2>2. Information We Collect</h2>
            <h3>Account Information</h3>
            <p>
              When you create an account, we collect your name, email address, and password. If you sign up through a third-party service (e.g., Google), we receive your name and email from that provider.
            </p>
            <h3>Product Data</h3>
            <p>
              When you upload product images, we store those images securely to provide the generation service. We also store metadata such as product titles, descriptions, and tags you provide.
            </p>
            <h3>Generated Content</h3>
            <p>
              Images and videos generated through our Service are stored in your account. You retain full ownership of all generated content.
            </p>
            <h3>Usage Data</h3>
            <p>
              We automatically collect certain information including your IP address, browser type, operating system, referring URLs, pages viewed, and actions taken within the Service.
            </p>

            <h2>3. How We Use Your Information</h2>
            <ul>
              <li>• To provide, maintain, and improve the Service</li>
              <li>• To process your transactions and manage your account</li>
              <li>• To generate images and videos based on your inputs</li>
              <li>• To communicate with you about updates, security alerts, and support</li>
              <li>• To monitor usage patterns and optimize performance</li>
              <li>• To detect, prevent, and address technical issues and fraud</li>
            </ul>

            <h2>4. Data Sharing</h2>
            <p>
              We do not sell your personal information. We may share data with:
            </p>
            <ul>
              <li>• <strong>Service providers</strong> who assist in operating our platform (hosting, analytics, payment processing)</li>
              <li>• <strong>Legal authorities</strong> when required by law or to protect our rights</li>
              <li>• <strong>Business transfers</strong> in the event of a merger, acquisition, or asset sale</li>
            </ul>

            <h2>5. AI Training</h2>
            <p>
              Your uploaded product images and generated content are <strong>never</strong> used to train our AI models. Your visual data is used solely to provide the Service to you.
            </p>

            <h2>6. Data Security</h2>
            <p>
              We implement industry-standard security measures including encryption at rest and in transit, access controls, and regular security audits. However, no method of transmission over the Internet is 100% secure.
            </p>

            <h2>7. Data Retention</h2>
            <p>
              We retain your account information and content for as long as your account is active. You may delete your account and associated data at any time through the Settings page. Upon deletion, we remove your data within 30 days.
            </p>

            <h2>8. Your Rights</h2>
            <p>
              Depending on your jurisdiction, you may have the right to:
            </p>
            <ul>
              <li>• Access the personal data we hold about you</li>
              <li>• Request correction of inaccurate data</li>
              <li>• Request deletion of your data</li>
              <li>• Object to or restrict processing of your data</li>
              <li>• Data portability — receive your data in a portable format</li>
            </ul>

            <h2>9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes by email or through the Service. Continued use of the Service after changes constitutes acceptance.
            </p>

            <h2>10. Contact Us</h2>
            <p>
              Questions about this Privacy Policy? Contact us at{' '}
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
