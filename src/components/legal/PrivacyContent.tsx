/**
 * Shared Privacy Policy body — used by both /privacy route and the in-page
 * Auth signup modal. Keep purely presentational; no page chrome.
 */
export function PrivacyContent() {
  return (
    <div className="prose prose-sm max-w-none text-muted-foreground [&_h2]:text-foreground [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-foreground [&_h3]:font-medium [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:mb-4 [&_p]:leading-relaxed [&_ul]:mb-4 [&_ul]:space-y-1 [&_li]:ml-4">

      <h2>1. Introduction</h2>
      <p>
        VOVV.AI ("we," "our," or "us") operates the VOVV.AI platform (the "Service"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service. This policy applies to all users worldwide, including those in the European Economic Area (EEA), United Kingdom, and other jurisdictions with data protection regulations.
      </p>

      <h2>2. Age Restriction</h2>
      <p>
        The Service is not intended for individuals under the age of 16. We do not knowingly collect personal data from anyone under 16 years of age. If you are a parent or guardian and become aware that your child has provided us with personal data, please contact us at <a href="mailto:hello@vovv.ai" className="text-primary hover:underline">hello@vovv.ai</a> and we will take steps to delete such information.
      </p>

      <h2>3. Data Controller and Data Processor</h2>
      <h3>When We Act as Data Controller</h3>
      <p>
        VOVV.AI acts as the <strong>data controller</strong> for the personal data we collect directly from you — such as your account information, usage data, and communication data. As data controller, we determine the purposes and means of processing your personal data.
      </p>
      <h3>When We Act as Data Processor</h3>
      <p>
        When you upload product images, reference materials, or other content that may contain personal data (e.g., model photos), VOVV.AI acts as a <strong>data processor</strong> on your behalf. You, as the data controller, are responsible for ensuring you have the lawful basis and necessary consents to process such data through our Service. We process this data solely under your instructions and for the purpose of providing the Service.
      </p>
      <p>
        For enterprise or team plan users requiring a formal Data Processing Agreement (DPA), please contact us at <a href="mailto:hello@vovv.ai" className="text-primary hover:underline">hello@vovv.ai</a>.
      </p>

      <h2>4. Information We Collect</h2>
      <h3>Account Information</h3>
      <p>
        When you create an account, we collect your name, email address, and password. If you sign up through a third-party service (e.g., Google), we receive your name and email from that provider.
      </p>
      <h3>Product Data</h3>
      <p>
        When you upload product images, we store those images securely to provide the generation service. We also store metadata such as product titles, descriptions, and tags you provide.
      </p>
      <h3>Uploaded Reference Materials</h3>
      <p>
        When you upload reference images, model photos, or other visual materials, we store and process them solely for the purpose of providing the Service. <strong>VOVV.AI does not verify, validate, or screen the rights status of any uploaded content.</strong> You are solely responsible for ensuring you have the necessary rights and permissions for all content you upload (see our Terms of Service for full details).
      </p>
      <h3>Generated Content</h3>
      <p>
        Images and videos generated through our Service are stored in your account. You retain full ownership of all generated content, subject to the intellectual property considerations described in our Terms of Service.
      </p>
      <h3>Usage Data</h3>
      <p>
        We automatically collect certain information including your IP address, browser type, operating system, referring URLs, pages viewed, and actions taken within the Service.
      </p>
      <h3>Payment Data</h3>
      <p>
        Payment processing is handled by Stripe. We do not store your full credit card details. We receive and store only limited payment information such as the last four digits of your card, card type, and billing address.
      </p>

      <h2>5. Lawful Basis for Processing (GDPR)</h2>
      <p>
        If you are located in the EEA, UK, or another jurisdiction that requires a lawful basis for processing personal data, we rely on the following legal bases:
      </p>
      <ul>
        <li>• <strong>Contract performance:</strong> Processing necessary to provide the Service you have signed up for (account management, image generation, credit management).</li>
        <li>• <strong>Legitimate interests:</strong> Processing necessary for our legitimate interests, such as improving the Service, detecting fraud, ensuring security, and conducting analytics — where these interests are not overridden by your rights.</li>
        <li>• <strong>Consent:</strong> Where you have given explicit consent, such as opting in to marketing communications. You may withdraw consent at any time.</li>
        <li>• <strong>Legal obligation:</strong> Processing necessary to comply with legal requirements, such as tax, accounting, or regulatory obligations.</li>
      </ul>

      <h2>6. How We Use Your Information</h2>
      <ul>
        <li>• To provide, maintain, and improve the Service</li>
        <li>• To process your transactions and manage your account</li>
        <li>• To generate images and videos based on your inputs</li>
        <li>• To communicate with you about updates, security alerts, and support</li>
        <li>• To send marketing communications (only with your consent; you may opt out at any time)</li>
        <li>• To monitor usage patterns and optimize performance</li>
        <li>• To detect, prevent, and address technical issues, fraud, and violations of our Terms of Service</li>
      </ul>

      <h2>7. Data Sharing and Third-Party Providers</h2>
      <p>
        We do not sell your personal information. We may share data with:
      </p>
      <ul>
        <li>• <strong>Cloud infrastructure providers</strong> for hosting and data storage</li>
        <li>• <strong>AI model providers</strong> for image and video generation processing</li>
        <li>• <strong>Payment processor (Stripe)</strong> for transaction processing</li>
        <li>• <strong>Analytics providers</strong> for privacy-respecting usage analytics</li>
        <li>• <strong>Email service providers</strong> for transactional and marketing communications</li>
        <li>• <strong>Legal authorities</strong> when required by law or to protect our rights</li>
        <li>• <strong>Business transfers</strong> in the event of a merger, acquisition, or asset sale</li>
      </ul>
      <p>
        All third-party providers are contractually required to maintain appropriate security and data protection standards. For a current list of sub-processors, please contact us at <a href="mailto:hello@vovv.ai" className="text-primary hover:underline">hello@vovv.ai</a>.
      </p>

      <h2>8. AI Training and Data Processing</h2>
      <p>
        Your uploaded product images, reference materials, and generated content are <strong>never</strong> used to train our AI models or any third-party AI models. Your visual data is processed solely to provide the Service to you and is not shared with any third party for AI training purposes.
      </p>
      <p>
        Reference images you upload are processed in real-time to generate outputs and are stored only within your account. We do not aggregate, repurpose, or redistribute any user-uploaded visual content.
      </p>

      <h2>9. Cross-Border Data Transfers</h2>
      <p>
        Your data may be transferred to and processed in countries outside the EEA/UK, including the United States, where our servers and third-party providers are located. When we transfer data outside the EEA/UK, we ensure appropriate safeguards are in place, including:
      </p>
      <ul>
        <li>• Standard Contractual Clauses (SCCs) approved by the European Commission</li>
        <li>• Adequacy decisions where applicable</li>
        <li>• Other appropriate transfer mechanisms recognized under applicable data protection law</li>
      </ul>
      <p>
        You may request a copy of the safeguards in place by contacting us.
      </p>

      <h2>10. Data Security</h2>
      <p>
        We implement industry-standard security measures including encryption at rest and in transit, access controls, and regular security assessments. However, no method of transmission over the Internet is 100% secure.
      </p>

      <h2>11. Data Breach Notification</h2>
      <p>
        In the event of a personal data breach that is likely to result in a risk to your rights and freedoms, we will:
      </p>
      <ul>
        <li>• Notify the relevant supervisory authority within 72 hours of becoming aware of the breach (where required by law)</li>
        <li>• Notify affected individuals without undue delay where the breach is likely to result in a high risk to their rights and freedoms</li>
        <li>• Document all breaches, including their effects and remedial actions taken</li>
      </ul>

      <h2>12. Data Retention</h2>
      <p>
        We retain your data according to the following schedule:
      </p>
      <ul>
        <li>• <strong>Account information:</strong> For as long as your account is active, plus 30 days after deletion request</li>
        <li>• <strong>Uploaded images and Inputs:</strong> For as long as your account is active; deleted within 30 days of account deletion</li>
        <li>• <strong>Generated content:</strong> For as long as your account is active; deleted within 30 days of account deletion</li>
        <li>• <strong>Usage and analytics data:</strong> Up to 24 months, then anonymized or deleted</li>
        <li>• <strong>Payment records:</strong> As required by tax and accounting regulations (typically 7 years)</li>
        <li>• <strong>Support communications:</strong> Up to 36 months after resolution</li>
      </ul>
      <p>
        You may delete your account and associated data at any time through the Settings page.
      </p>

      <h2>13. Your Rights</h2>
      <p>
        Depending on your jurisdiction (including under GDPR, UK GDPR, and other applicable data protection laws), you have the following rights:
      </p>
      <ul>
        <li>• <strong>Right of access:</strong> Request a copy of the personal data we hold about you</li>
        <li>• <strong>Right to rectification:</strong> Request correction of inaccurate or incomplete data</li>
        <li>• <strong>Right to erasure:</strong> Request deletion of your personal data ("right to be forgotten")</li>
        <li>• <strong>Right to restrict processing:</strong> Request that we limit how we use your data</li>
        <li>• <strong>Right to data portability:</strong> Receive your data in a structured, commonly used, machine-readable format</li>
        <li>• <strong>Right to object:</strong> Object to processing based on legitimate interests or for direct marketing</li>
        <li>• <strong>Right to withdraw consent:</strong> Where processing is based on consent, withdraw it at any time without affecting the lawfulness of prior processing</li>
        <li>• <strong>Right to lodge a complaint:</strong> You have the right to lodge a complaint with your local data protection supervisory authority if you believe we have not complied with applicable data protection laws</li>
      </ul>
      <p>
        To exercise any of these rights, contact us at <a href="mailto:hello@vovv.ai" className="text-primary hover:underline">hello@vovv.ai</a>. We will respond within 30 days (or the period required by applicable law).
      </p>

      <h2>14. Automated Decision-Making</h2>
      <p>
        The Service uses AI to generate images and videos based on your inputs. This processing is necessary for the performance of our contract with you (providing the generation service). We do not use automated decision-making or profiling that produces legal or similarly significant effects on you. If you have concerns about any automated processing, please contact us.
      </p>

      <h2>15. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of material changes by email or through the Service at least 30 days before they take effect. Continued use of the Service after changes constitutes acceptance.
      </p>

      <h2>16. Contact Us</h2>
      <p>
        Questions about this Privacy Policy or your data rights? Contact us at{' '}
        <a href="mailto:hello@vovv.ai" className="text-primary hover:underline">
          hello@vovv.ai
        </a>
        .
      </p>
      <p>
        If you are located in the EEA and wish to contact our data protection representative, or if you are unsatisfied with our response to a data rights request, you have the right to lodge a complaint with your local data protection supervisory authority.
      </p>
    </div>
  );
}
