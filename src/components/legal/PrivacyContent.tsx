/**
 * Shared Privacy Policy body — used by both /privacy route and the in-page
 * Auth signup modal. Keep purely presentational; no page chrome.
 */
export function PrivacyContent() {
  return (
    <div className="prose prose-sm max-w-none text-muted-foreground [&_h2]:text-foreground [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-foreground [&_h3]:font-medium [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:mb-4 [&_p]:leading-relaxed [&_ul]:mb-4 [&_ul]:space-y-1 [&_li]:ml-4">

      <h2>1. Introduction</h2>
      <p>
        This policy explains how we process your data under the General Data Protection Regulation and other applicable privacy laws.
      </p>

      <h2>2. Company Information</h2>
      <p>VOVV.AI is operated by:</p>
      <ul>
        <li>• <strong>MB 123PRESETS</strong></li>
        <li>• Company code: 306675527</li>
        <li>• VAT: LT100016637411</li>
        <li>• Registered in Lithuania</li>
        <li>• Contact: <a href="mailto:hello@vovv.ai" className="text-primary hover:underline">hello@vovv.ai</a></li>
      </ul>

      <h2>3. Roles</h2>
      <ul>
        <li>• We are <strong>Data Controller</strong> for account data</li>
        <li>• We are <strong>Data Processor</strong> for user-uploaded content</li>
      </ul>

      <h2>4. Data We Collect</h2>
      <ul>
        <li>• Account data (name, email)</li>
        <li>• Uploaded content</li>
        <li>• Generated content</li>
        <li>• Usage data (IP, browser, actions)</li>
        <li>• Payment data (via Stripe)</li>
      </ul>

      <h2>5. Legal Basis</h2>
      <p>We process data based on:</p>
      <ul>
        <li>• Contract</li>
        <li>• Legitimate interests</li>
        <li>• Consent</li>
        <li>• Legal obligations</li>
      </ul>

      <h2>6. How We Use Data</h2>
      <ul>
        <li>• Provide and improve the Service</li>
        <li>• Process transactions</li>
        <li>• Generate outputs</li>
        <li>• Communicate with users</li>
        <li>• Prevent fraud and abuse</li>
      </ul>

      <h2>7. Subprocessors</h2>
      <p>We may use:</p>
      <ul>
        <li>• Cloud providers (AWS, GCP)</li>
        <li>• AI providers</li>
        <li>• Payment providers</li>
        <li>• Analytics tools</li>
      </ul>
      <p>All are contractually bound to protect data.</p>

      <h2>8. AI Data Use</h2>
      <p>
        We do not use your data to train AI models.
      </p>

      <h2>9. International Transfers</h2>
      <p>We use safeguards such as:</p>
      <ul>
        <li>• Standard Contractual Clauses (SCCs)</li>
        <li>• Approved transfer mechanisms</li>
      </ul>

      <h2>10. Data Retention</h2>
      <ul>
        <li>• Account data: until deletion + 30 days</li>
        <li>• Content: until deletion + 30 days</li>
        <li>• Analytics: up to 24 months</li>
        <li>• Payments: up to 7 years</li>
      </ul>

      <h2>11. Security</h2>
      <p>
        We use encryption and security controls to protect your data.
      </p>

      <h2>12. Breach Notification</h2>
      <p>
        We notify authorities within 72 hours if required by law.
      </p>

      <h2>13. Your Rights</h2>
      <p>You can:</p>
      <ul>
        <li>• Access your data</li>
        <li>• Correct your data</li>
        <li>• Delete your data</li>
        <li>• Export your data</li>
        <li>• Object to processing</li>
      </ul>
      <p>
        Contact: <a href="mailto:hello@vovv.ai" className="text-primary hover:underline">hello@vovv.ai</a>
      </p>

      <h2>14. Cookies</h2>
      <p>We use cookies for:</p>
      <ul>
        <li>• Functionality</li>
        <li>• Analytics</li>
      </ul>
      <p>
        Where required, we request consent before using non-essential cookies.
      </p>

      <h2>15. Automated Processing</h2>
      <p>
        AI is used to generate outputs. No decisions with legal effects are made.
      </p>

      <h2>16. Changes</h2>
      <p>
        We may update this policy with notice.
      </p>
    </div>
  );
}
