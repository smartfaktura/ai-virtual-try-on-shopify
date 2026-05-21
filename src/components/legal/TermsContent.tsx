/**
 * Shared Terms of Service body — used by both /terms route and the in-page
 * Auth signup modal. Keep purely presentational; no page chrome.
 */
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PrivacyContent } from './PrivacyContent';

export function TermsContent() {
  const privacyLink = (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="underline underline-offset-2 text-foreground hover:text-primary transition-colors font-medium"
        >
          Privacy Policy
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Privacy Policy</DialogTitle>
        </DialogHeader>
        <PrivacyContent />
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="prose prose-sm max-w-none text-muted-foreground [&_h2]:text-foreground [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-foreground [&_h3]:font-medium [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:mb-4 [&_p]:leading-relaxed [&_ul]:mb-4 [&_ul]:space-y-1 [&_li]:ml-4">

      <h2>1. Definitions</h2>
      <ul>
        <li>• <strong>"Service"</strong> — the VOVV.AI platform, including all applications, APIs, and tools.</li>
        <li>• <strong>"Inputs"</strong> — content you upload (images, text, prompts, data).</li>
        <li>• <strong>"Generations"</strong> — outputs created by the Service.</li>
        <li>• <strong>"Credits"</strong> — usage units for generation features.</li>
        <li>• <strong>"User" / "You"</strong> — any person or entity using the Service.</li>
      </ul>

      <h2>2. Acceptance of Terms</h2>
      <p>
        By using the Service, you agree to these Terms and our {privacyLink}. If you do not agree, you must not use the Service.
      </p>

      <h2>3. Eligibility</h2>
      <p>
        You must be at least 16 years old or have parental consent.
      </p>

      <h2>4. Account Responsibility</h2>
      <p>You are responsible for:</p>
      <ul>
        <li>• Your account security</li>
        <li>• All activity under your account</li>
        <li>• Providing accurate information</li>
      </ul>

      <h2>5. Service Description</h2>
      <p>
        VOVV.AI provides AI-powered visual generation tools. We act solely as a technology provider. We do not:
      </p>
      <ul>
        <li>• Control Inputs</li>
        <li>• Review content</li>
        <li>• Act as publisher</li>
      </ul>

      <h2>6. Experimental Features</h2>
      <p>Some features may be beta:</p>
      <ul>
        <li>• May change or break</li>
        <li>• Provided without guarantees</li>
      </ul>

      <h2>7. Availability</h2>
      <p>
        We do not guarantee uninterrupted or error-free operation.
      </p>

      <h2>8. Credits and Payments</h2>
      <ul>
        <li>• Credits are required for usage</li>
        <li>• Credits are non-refundable except where required by law</li>
        <li>• Prices may change with notice</li>
      </ul>
      <p>
        <strong>EU Consumers:</strong> You may have a 14-day withdrawal right unless you:
      </p>
      <ul>
        <li>• request immediate service delivery</li>
        <li>• and waive this right at checkout</li>
      </ul>

      <h3>Subscription term & auto-renewal</h3>
      <ul>
        <li>• Subscriptions renew automatically at the end of each billing period (monthly plans renew monthly, annual plans renew annually) at the then-current price using the payment method on file, until cancelled.</li>
        <li>• You can cancel at any time from account settings. Cancellation takes effect at the end of the current paid period; you keep access until then.</li>
        <li>• Price changes apply to the next renewal after we have given you reasonable advance notice (at least 30 days for material increases). Continued use after the new price takes effect is acceptance of the new price.</li>
        <li>• Credits and add-ons remain non-refundable except where required by law.</li>
      </ul>

      <h2>9. Acceptable Use</h2>
      <p>You must NOT:</p>
      <ul>
        <li>• Violate any applicable law or regulation</li>
        <li>• Upload content you do not own or have rights to</li>
        <li>• Upload, generate, or distribute imagery of any real person without that person's documented, explicit consent (see §10)</li>
        <li>• Upload faces of minors (under 18) under any circumstance</li>
        <li>• Upload faces of public figures, celebrities, politicians, or any third party you do not have rights to</li>
        <li>• Create sexual, intimate, nude, suggestive, or non-consensual intimate imagery (NCII) depicting a real person — strictly prohibited and may be reported to law enforcement</li>
        <li>• Create content intended to defame, harass, impersonate, blackmail, stalk, or deceive any person</li>
        <li>• Create political disinformation, election-influencing material, or fraudulent content</li>
        <li>• Use Generations in any way that breaches right-of-publicity, personality rights, defamation, or data-protection laws in any jurisdiction</li>
        <li>• Upload reference, mood-board, or scene images that you do not own or have a clear licence to use as an AI reference, or that mimic another brand's identity in a misleading way (see §11)</li>
        <li>• Abuse, reverse-engineer, scrape, or otherwise exploit the Service</li>
      </ul>
      <p>We may suspend or terminate accounts at any time, without refund, for any suspected violation.</p>

      <h2>10. Face, Likeness & Biometric Uploads (Critical)</h2>
      <p>
        The Reference Photo feature lets you upload a face so the Service can generate an AI model resembling that person. This is our highest-risk feature and carries the strictest rules. By using it you make the warranties below and accept the responsibilities that follow.
      </p>
      <ul>
        <li>• <strong>Consent warranty.</strong> For every face you upload you warrant that either (a) you are that person, or (b) you hold that person's explicit, informed, written consent to upload their face to an AI generation service, to create AI imagery resembling them, and to use those generations (including commercially, where applicable).</li>
        <li>• <strong>No minors.</strong> You will never upload a face of any person under 18, in any context.</li>
        <li>• <strong>No third parties without rights.</strong> You will not upload faces of public figures, celebrities, politicians, employees, ex-partners, or any other third party for whom you cannot produce consent on request.</li>
        <li>• <strong>No intimate or sexual content.</strong> You will not use uploaded faces to create sexual, nude, intimate, suggestive, or harassing imagery. Such uploads may be reported to law enforcement and competent regulators.</li>
        <li>• <strong>Special-category data (GDPR Art. 9).</strong> Uploaded face images are biometric / special-category personal data. The lawful basis is the explicit consent of you and (where different) the data subject. The data subject may withdraw consent and request deletion at any time via <a href="mailto:hello@vovv.ai" className="text-primary hover:underline">hello@vovv.ai</a>.</li>
        <li>• <strong>Enforcement.</strong> We may, at our sole discretion and without refund, block, remove, refuse to generate, suspend, or terminate any account, and report to law enforcement or regulators, any upload or Generation that appears to violate this section.</li>
        <li>• <strong>Indemnity.</strong> You fully indemnify, defend, and hold harmless VOVV.AI, MB 123PRESETS, and its operators against any claim, fine, regulatory action, investigation, or damages — including under GDPR (Art. 82), right-of-publicity / personality-rights laws, defamation, intellectual-property law, the US TAKE IT DOWN Act, the UK Online Safety Act, and EU AI Act Art. 50 — arising from any face or likeness you uploaded or any Generation you created or distributed.</li>
        <li>• <strong>Carve-out from liability cap.</strong> The liability cap in §19 (Limitation of Liability) does not apply to amounts you owe under this indemnity.</li>
      </ul>
      <p>
        If you cannot truthfully make every warranty above for a given upload, you must not upload that face. This rule is non-negotiable.
      </p>

      <h2>11. Scene & Reference Image Uploads (Critical)</h2>
      <p>
        Brand Scenes and similar features let you upload any image as a style, composition, or scene reference that the Service will use to influence Generations. By uploading you make the warranties below.
      </p>
      <ul>
        <li>• <strong>Rights warranty.</strong> For every reference image you upload you warrant that either (a) you own it, (b) you hold a written licence covering AI ingestion and the creation of derivative works, or (c) the image is in the public domain or under a licence (e.g. CC0) that clearly permits this use. Stock-photo previews, Pinterest pins, Google Images results, screenshots of other brands' campaigns, magazine scans, film stills, and watermarked previews are <strong>not</strong> acceptable references.</li>
        <li>• <strong>No third-party brand mimicry.</strong> You will not upload references with the intent to clone another brand's identity, trade dress, packaging, logo, mascot, or recognisable campaign in a way that would mislead consumers or breach trademark, passing-off, or unfair-competition law.</li>
        <li>• <strong>Persons and private property in scenes.</strong> Reference images depicting identifiable people, private interiors, or restricted locations must respect the same consent and rights rules as §10 — no minors, no public figures or third parties without rights, no NCII, no surveillance / paparazzi material.</li>
        <li>• <strong>No prohibited content.</strong> You will not upload references that are illegal, sexual, violent, hateful, or otherwise prohibited under §9.</li>
        <li>• <strong>Enforcement.</strong> We may, at our sole discretion and without refund, block, remove, refuse to generate from, suspend, or terminate any account, and report to rights-holders or authorities, any reference upload or resulting Generation that appears to violate this section. We will comply with valid DMCA / EU DSA takedown notices targeting reference uploads or their Generations.</li>
        <li>• <strong>Indemnity.</strong> You fully indemnify, defend, and hold harmless VOVV.AI, MB 123PRESETS, and its operators against any claim, fine, regulatory action, or damages — including copyright infringement (US DMCA, EU Copyright Directive, UK CDPA), trademark / trade-dress, passing-off, unfair competition, right-of-publicity, defamation, and EU AI Act Art. 50 — arising from any reference image you uploaded or any Generation derived from it.</li>
        <li>• <strong>Carve-out from liability cap.</strong> The liability cap in §19 (Limitation of Liability) does not apply to amounts you owe under this indemnity.</li>
      </ul>
      <p>
        If you cannot truthfully make every warranty above for a given upload, you must not upload that image as a reference. This rule is non-negotiable.
      </p>

      <h2>12. Your Responsibility (Critical)</h2>
      <p>You are fully responsible for:</p>
      <ul>
        <li>• All Inputs</li>
        <li>• All Generations</li>
        <li>• How content is used or published</li>
      </ul>
      <p>You act as the publisher and controller of content. You must ensure:</p>
      <ul>
        <li>• Legal compliance</li>
        <li>• Advertising compliance</li>
        <li>• Platform policy compliance</li>
      </ul>

      <h2>13. AI Limitations</h2>
      <p>AI outputs:</p>
      <ul>
        <li>• May contain errors</li>
        <li>• May resemble existing content</li>
        <li>• Are not guaranteed to be unique or lawful</li>
      </ul>
      <p>You must independently review all outputs.</p>

      <h2>14. AI Transparency (EU AI Act)</h2>
      <p>You are responsible for:</p>
      <ul>
        <li>• Disclosing AI-generated content where required</li>
        <li>• Ensuring compliance with applicable laws</li>
      </ul>

      <h2>15. Intellectual Property</h2>
      <ul>
        <li>• You retain ownership of Inputs</li>
        <li>• You own Generations (subject to law)</li>
        <li>• VOVV.AI owns all platform technology</li>
      </ul>

      <h3>Limited operational licence</h3>
      <p>
        You grant VOVV.AI a worldwide, non-exclusive, royalty-free licence to host, store, transmit, process, modify, copy, display, and create derivative works of your Inputs and Generations solely to operate, secure, support, and improve the Service for you, and — where you choose to share — to enable sharing with collaborators, team members, or destinations you select. The licence terminates when you delete the content or close your account, subject to the backup-retention rule below.
      </p>

      <h3>Service data</h3>
      <p>
        All aggregated, anonymised, or de-identified usage data, logs, performance metrics, and model-quality insights derived from operation of the Service are owned by VOVV.AI and may be used to operate, secure, and improve the Service. We do not disclose your Inputs, Generations, or personal data to third parties in non-anonymised form except as described in the Privacy Policy.
      </p>

      <h3>Feedback</h3>
      <p>
        Ideas, suggestions, or feedback you send us are non-confidential. You assign all rights in such feedback to VOVV.AI, and we may use it without restriction, compensation, or attribution.
      </p>

      <h3>Backup retention after deletion</h3>
      <p>
        When you delete content or your account, we may retain copies for a reasonable period (typically up to 30 days, longer where required by law) for backup, audit, fraud-prevention, and legal-compliance purposes, after which they are permanently deleted. See Privacy Policy §10 for full retention rules.
      </p>

      <h2>16. Confidentiality</h2>
      <p>
        Each party will treat the other party's non-public information disclosed under or in connection with these Terms as confidential, use it only to perform under these Terms, and not disclose it to third parties without consent except (a) as required by law or regulator, or (b) to employees, contractors, or subprocessors bound by equivalent confidentiality obligations.
      </p>
      <p>
        Confidentiality obligations survive termination for two (2) years; trade secrets are protected for as long as they qualify as such under applicable law.
      </p>
      <p>
        We treat your Inputs and Generations as confidential and do not use them to train AI models.
      </p>

      <h2>17. Third-Party Services</h2>
      <p>
        We rely on third-party providers and are not responsible for their actions.
      </p>

      <h3>Force majeure</h3>
      <p>
        We are not liable for any failure, delay, or defect in performance caused by events outside our reasonable control, including outages or failures of third-party infrastructure or AI providers, internet or network failures, acts of government, war, terrorism, civil unrest, strikes, pandemics, or natural disasters. We will notify you as soon as practicable and take reasonable steps to minimise impact. If a force-majeure event materially prevents performance for more than 30 consecutive days, either party may terminate the affected subscription and we will refund any prepaid, unused fees on a pro-rata basis.
      </p>

      <h2>18. Indemnification</h2>
      <p>You agree to indemnify VOVV.AI against claims arising from:</p>
      <ul>
        <li>• Your Inputs</li>
        <li>• Your Generations</li>
        <li>• Your use of the Service</li>
      </ul>

      <h2>19. Limitation of Liability</h2>
      <p>To the maximum extent permitted by law, we are not liable for:</p>
      <ul>
        <li>• Indirect or consequential damages</li>
        <li>• Loss of profits, data, or business</li>
      </ul>
      <p>Total liability is limited to what you paid in the past 12 months.</p>

      <h2>20. Disclaimer</h2>
      <p>
        The Service is provided "as is" with no guarantees.
      </p>

      <h2>21. Copyright & Content Complaints</h2>
      <p>
        Report issues: <a href="mailto:hello@vovv.ai" className="text-primary hover:underline">hello@vovv.ai</a>. We may remove content if required.
      </p>

      <h2>22. DSA Compliance (EU)</h2>
      <p>
        Users may report illegal content. We may remove or restrict such content.
      </p>

      <h2>23. Termination</h2>
      <p>
        We may suspend or terminate access at any time.
      </p>

      <h3>Survival</h3>
      <p>
        Provisions that by their nature should survive termination — including §10 (Face, Likeness & Biometric Uploads), §11 (Scene & Reference Image Uploads), §15 (Intellectual Property), §16 (Confidentiality), §18 (Indemnification), §19 (Limitation of Liability), §20 (Disclaimer), and §26 (Governing Law) — survive termination of your account or these Terms.
      </p>

      <h2>24. Data Portability & Deletion (EU Data Act)</h2>
      <p>
        If you are established in the EU/EEA or otherwise subject to Regulation (EU) 2023/2854 (the <strong>Data Act</strong>), you may at any time, on at least two months' written notice to <a href="mailto:hello@vovv.ai" className="text-primary hover:underline">hello@vovv.ai</a>, request (a) the transfer of your data to another provider in a structured, commonly used, and machine-readable format, or (b) the deletion of your data.
      </p>
      <p>
        We will provide reasonable assistance to support transfer or deletion. We may charge reasonable direct costs to the extent permitted by the Data Act and will provide an itemised invoice.
      </p>
      <p>
        This right is in addition to your data-subject rights under the GDPR (see Privacy Policy §13) and does not affect any other contractual or statutory rights.
      </p>

      <h2>25. Governing Law</h2>
      <ul>
        <li>• If you are a business: Delaware law applies</li>
        <li>• If you are an EU consumer: you retain rights under local law</li>
      </ul>

      <h2>26. Changes</h2>
      <p>
        We may update these Terms with notice.
      </p>

      <h2>27. Company Information</h2>
      <p>VOVV.AI is operated by:</p>
      <ul>
        <li>• <strong>MB 123PRESETS</strong></li>
        <li>• Company code: 306675527</li>
        <li>• VAT: LT100016637411</li>
        <li>• Registered in Lithuania</li>
        <li>• Contact: <a href="mailto:hello@vovv.ai" className="text-primary hover:underline">hello@vovv.ai</a></li>
      </ul>
    </div>
  );
}
