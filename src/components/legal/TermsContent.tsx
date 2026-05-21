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
        <li>• Your account security, including credentials and any access tokens</li>
        <li>• All activity under your account, including activity by your team members or authorised users</li>
        <li>• Providing accurate, current, and complete information, and keeping it up to date</li>
        <li>• Notifying us promptly at <a href="mailto:hello@vovv.ai" className="text-primary hover:underline">hello@vovv.ai</a> of any unauthorised access or security incident</li>
      </ul>

      <h2>5. Service Description</h2>
      <p>
        VOVV.AI provides AI-powered visual generation tools. We act solely as a technology provider and tool: Generations are produced at your direction, based on your Inputs and prompts. We do not:
      </p>
      <ul>
        <li>• Pre-screen, curate, or editorially control Inputs or Generations</li>
        <li>• Act as the publisher, broadcaster, or distributor of any content you create or share</li>
        <li>• Endorse any Generation or guarantee it is fit for any particular use</li>
      </ul>
      <p>
        You are the producer, controller, and publisher of every Generation you download, share, or distribute.
      </p>

      <h2>6. Experimental Features (Beta)</h2>
      <p>
        Some features are clearly labelled as beta, preview, experimental, or early-access. Beta features:
      </p>
      <ul>
        <li>• Are provided "as is" without any service-level commitment</li>
        <li>• May change, regress, or be withdrawn at any time without notice</li>
        <li>• May produce unexpected or lower-quality results</li>
        <li>• Are excluded from any uptime, support, or refund commitment</li>
      </ul>
      <p>
        To the maximum extent permitted by law, we have no liability for defects or losses arising solely from beta features.
      </p>

      <h2>7. Availability</h2>
      <p>
        We provide the Service on a commercially reasonable, best-effort basis and do not guarantee uninterrupted or error-free operation. We may perform planned or emergency maintenance, deploy updates, throttle abusive usage, or modify features at any time. Unless we have separately agreed a written SLA with you, no specific uptime is guaranteed.
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

      <h3>Subscription term &amp; auto-renewal</h3>
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
        <li>• Upload, generate, or distribute imagery of any real person without that person's documented, explicit consent (see Section 10)</li>
        <li>• Upload faces of minors (under 18) under any circumstance</li>
        <li>• Upload faces of public figures, celebrities, politicians, or any third party you do not have rights to</li>
        <li>• Create sexual, intimate, nude, suggestive, or non-consensual intimate imagery (NCII) depicting a real person — strictly prohibited and may be reported to law enforcement</li>
        <li>• Create content intended to defame, harass, impersonate, blackmail, stalk, or deceive any person</li>
        <li>• Create political disinformation, election-influencing material, or fraudulent content</li>
        <li>• Use Generations in any way that breaches right-of-publicity, personality rights, defamation, or data-protection laws in any jurisdiction</li>
        <li>• Upload reference, mood-board, or scene images that you do not own or have a clear licence to use as an AI reference, or that mimic another brand's identity in a misleading way (see Section 11)</li>
        <li>• Abuse, reverse-engineer, scrape, or otherwise exploit the Service</li>
      </ul>
      <p>We may suspend or terminate accounts at any time, without refund, for any suspected violation.</p>

      <h2>10. Face, Likeness &amp; Biometric Uploads (Critical)</h2>
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
        <li>• <strong>Carve-out from liability cap.</strong> The liability cap in Section 19 (Limitation of Liability) does not apply to amounts you owe under this indemnity.</li>
      </ul>
      <p>
        If you cannot truthfully make every warranty above for a given upload, you must not upload that face. This rule is non-negotiable.
      </p>

      <h2>11. Scene &amp; Reference Image Uploads (Critical)</h2>
      <p>
        Brand Scenes and similar features let you upload any image as a style, composition, or scene reference that the Service will use to influence Generations. By uploading you make the warranties below.
      </p>
      <ul>
        <li>• <strong>Rights warranty.</strong> For every reference image you upload you warrant that either (a) you own it, (b) you hold a written licence covering AI ingestion and the creation of derivative works, or (c) the image is in the public domain or under a licence (e.g. CC0) that clearly permits this use. Stock-photo previews, Pinterest pins, Google Images results, screenshots of other brands' campaigns, magazine scans, film stills, and watermarked previews are <strong>not</strong> acceptable references.</li>
        <li>• <strong>No third-party brand mimicry.</strong> You will not upload references with the intent to clone another brand's identity, trade dress, packaging, logo, mascot, or recognisable campaign in a way that would mislead consumers or breach trademark, passing-off, or unfair-competition law.</li>
        <li>• <strong>Persons and private property in scenes.</strong> Reference images depicting identifiable people, private interiors, or restricted locations must respect the same consent and rights rules as Section 10 — no minors, no public figures or third parties without rights, no NCII, no surveillance / paparazzi material.</li>
        <li>• <strong>No prohibited content.</strong> You will not upload references that are illegal, sexual, violent, hateful, or otherwise prohibited under Section 9.</li>
        <li>• <strong>Enforcement.</strong> We may, at our sole discretion and without refund, block, remove, refuse to generate from, suspend, or terminate any account, and report to rights-holders or authorities, any reference upload or resulting Generation that appears to violate this section. We will comply with valid DMCA / EU DSA takedown notices targeting reference uploads or their Generations.</li>
        <li>• <strong>Indemnity.</strong> You fully indemnify, defend, and hold harmless VOVV.AI, MB 123PRESETS, and its operators against any claim, fine, regulatory action, or damages — including copyright infringement (US DMCA, EU Copyright Directive, UK CDPA), trademark / trade-dress, passing-off, unfair competition, right-of-publicity, defamation, and EU AI Act Art. 50 — arising from any reference image you uploaded or any Generation derived from it.</li>
        <li>• <strong>Carve-out from liability cap.</strong> The liability cap in Section 19 (Limitation of Liability) does not apply to amounts you owe under this indemnity.</li>
      </ul>
      <p>
        If you cannot truthfully make every warranty above for a given upload, you must not upload that image as a reference. This rule is non-negotiable.
      </p>

      <h2>12. Your Responsibility (Critical)</h2>
      <p>You are fully responsible for:</p>
      <ul>
        <li>• All Inputs you upload or submit</li>
        <li>• All Generations you create, save, download, share, or publish</li>
        <li>• How any Generation is used, modified, or distributed downstream</li>
      </ul>
      <p>
        You act as the publisher of every Generation you take outside the Service, and you are the data controller for any personal data contained in your Inputs (with VOVV.AI acting as processor for those operations). You must ensure:
      </p>
      <ul>
        <li>• Compliance with all applicable laws (consumer-protection, advertising, IP, data-protection, AI-disclosure)</li>
        <li>• Compliance with the rules of any platform where you publish (Meta, TikTok, Amazon, Shopify, ad networks, app stores)</li>
        <li>• That you have obtained and can produce, on request, all consents, licences, and rights covering the people, brands, and assets shown in any Generation you publish</li>
      </ul>

      <h2>13. AI Limitations</h2>
      <p>
        AI outputs are probabilistic. They may:
      </p>
      <ul>
        <li>• Contain factual errors, hallucinations, distortions, or anatomical inaccuracies</li>
        <li>• Inadvertently resemble existing works, people, brands, or trademarks</li>
        <li>• Misinterpret prompts or produce results that are not fit for a particular purpose</li>
        <li>• Vary between generations even with the same Inputs and prompt</li>
      </ul>
      <p>
        You must independently review, validate, and (where applicable) edit every output before publication or commercial use. We make no guarantee of accuracy, originality, non-infringement, or fitness for any particular purpose.
      </p>

      <h2>14. AI Transparency (EU AI Act)</h2>
      <p>
        Generations produced by the Service are AI-generated synthetic content. Where you publish, distribute, or share Generations, you are responsible for:
      </p>
      <ul>
        <li>• Disclosing the AI-generated nature of the content where required by law, including under Article 50 of Regulation (EU) 2024/1689 (the <strong>EU AI Act</strong>) for synthetic image, audio, video, and text content</li>
        <li>• Clearly labelling deep-fake or look-alike content that depicts real persons, places, or events as artificially generated or manipulated</li>
        <li>• Not using Generations for deceptive practices, election interference, or any conduct prohibited under the EU AI Act or equivalent laws in your jurisdiction</li>
        <li>• Preserving any watermark, metadata, or provenance signal we apply to Generations</li>
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
        When you delete content or your account, we may retain copies for a reasonable period (typically up to 30 days, longer where required by law) for backup, audit, fraud-prevention, and legal-compliance purposes, after which they are permanently deleted. See Privacy Policy for full retention rules.
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
        The Service relies on third-party providers to function, including cloud and storage infrastructure, payment processors, AI model providers, email delivery, and analytics. Your use of features that depend on a third-party provider may also be subject to that provider's terms. We are not responsible for the acts, omissions, outages, security incidents, pricing, or policy changes of third-party providers, and we may change providers at any time.
      </p>

      <h3>Force majeure</h3>
      <p>
        We are not liable for any failure, delay, or defect in performance caused by events outside our reasonable control, including outages or failures of third-party infrastructure or AI providers, internet or network failures, acts of government, war, terrorism, civil unrest, strikes, pandemics, or natural disasters. We will notify you as soon as practicable and take reasonable steps to minimise impact. If a force-majeure event materially prevents performance for more than 30 consecutive days, either party may terminate the affected subscription and we will refund any prepaid, unused fees on a pro-rata basis.
      </p>

      <h2>18. Indemnification</h2>
      <p>
        You will defend, indemnify, and hold harmless VOVV.AI, MB 123PRESETS, and their officers, employees, contractors, and affiliates from and against any third-party claim, action, investigation, fine, or proceeding, and any resulting damages, liabilities, settlements, and reasonable legal fees, arising out of or relating to:
      </p>
      <ul>
        <li>• Your Inputs (including any face, likeness, or reference image you upload)</li>
        <li>• Your Generations and any use, modification, or distribution of them</li>
        <li>• Your use of the Service in breach of these Terms or any applicable law</li>
        <li>• Your breach of any third-party right (IP, publicity, privacy, data-protection)</li>
      </ul>
      <p>
        We will promptly notify you of any covered claim, and you will assume sole control of the defence and settlement, provided you do not enter any settlement that imposes an obligation or admission on us without our prior written consent. We may participate in the defence at our own expense with counsel of our choice.
      </p>

      <h2>19. Limitation of Liability</h2>
      <p>To the maximum extent permitted by law:</p>
      <ul>
        <li>• We are not liable for any indirect, incidental, special, consequential, exemplary, or punitive damages</li>
        <li>• We are not liable for loss of profits, revenue, goodwill, data, content, business opportunity, or anticipated savings, whether foreseeable or not</li>
        <li>• Our total aggregate liability for all claims relating to the Service in any 12-month period is capped at the amount you actually paid VOVV.AI for the Service in that 12-month period</li>
      </ul>
      <p>
        Nothing in these Terms excludes or limits liability that cannot lawfully be excluded or limited, including liability for death or personal injury caused by negligence, fraud or fraudulent misrepresentation, gross negligence, wilful misconduct, or any statutory consumer rights that apply to you and cannot be waived. The carve-outs in Sections 10 and 11 (uncapped indemnities) also continue to apply.
      </p>

      <h2>20. Disclaimer</h2>
      <p>
        The Service and all Generations are provided <strong>"AS IS"</strong> and <strong>"AS AVAILABLE"</strong> without warranties of any kind, express, implied, or statutory. To the maximum extent permitted by law, we disclaim all implied warranties, including merchantability, fitness for a particular purpose, non-infringement, accuracy, reliability, availability, and any warranty arising from course of dealing or trade usage. No advice or information obtained from the Service creates any warranty not expressly stated in these Terms.
      </p>

      <h2>21. Copyright &amp; Content Complaints</h2>
      <p>
        If you believe content on the Service infringes your copyright or other rights, send a notice to <a href="mailto:hello@vovv.ai" className="text-primary hover:underline">hello@vovv.ai</a> including:
      </p>
      <ul>
        <li>• Identification of the copyrighted work or right claimed to be infringed</li>
        <li>• A precise URL or description of the allegedly infringing material so we can locate it</li>
        <li>• Your contact details (name, address, email, phone)</li>
        <li>• A statement made in good faith that the use is not authorised by the rights-holder, its agent, or the law</li>
        <li>• A statement, under penalty of perjury, that the information is accurate and that you are the rights-holder or authorised to act on the rights-holder's behalf</li>
        <li>• Your physical or electronic signature</li>
      </ul>
      <p>
        We will review valid notices promptly and may remove or disable access to the material, notify the affected user, and (where appropriate) provide a counter-notice procedure. We terminate accounts of repeat infringers. Knowingly false notices may result in liability under applicable law.
      </p>

      <h2>22. DSA Compliance (EU)</h2>
      <p>
        For users in the EU, we comply with Regulation (EU) 2022/2065 (the <strong>Digital Services Act</strong>) to the extent applicable to the Service. You may report illegal content or violations of these Terms to our single point of contact at <a href="mailto:hello@vovv.ai" className="text-primary hover:underline">hello@vovv.ai</a>. We will:
      </p>
      <ul>
        <li>• Acknowledge and review valid notices in a timely, diligent, and non-arbitrary manner</li>
        <li>• Provide affected users with a statement of reasons when we remove, restrict, or demote content</li>
        <li>• Operate an internal complaints-handling process for content decisions; you may also seek out-of-court dispute settlement where available</li>
        <li>• Give appropriate priority to notices submitted by certified trusted flaggers</li>
      </ul>

      <h2>23. Termination</h2>
      <p>
        You may stop using the Service or close your account at any time from account settings.
      </p>
      <p>
        We may suspend, restrict, or terminate your access immediately and without refund if (a) you breach these Terms or any law, (b) your account is materially overdue on payment, (c) we believe your use creates legal, security, reputational, or operational risk to us or to other users, or (d) we are required to do so by law, regulator, or court order. Where the breach is curable and the risk is not immediate, we will use reasonable efforts to notify you and give you a chance to cure.
      </p>
      <p>
        On termination, your right to access the Service ends and we may delete your Inputs and Generations subject to the backup-retention rule in Section 15. You remain liable for amounts owed up to the date of termination.
      </p>

      <h3>Survival</h3>
      <p>
        Provisions that by their nature should survive termination — including Section 10 (Face, Likeness &amp; Biometric Uploads), Section 11 (Scene &amp; Reference Image Uploads), Section 15 (Intellectual Property), Section 16 (Confidentiality), Section 18 (Indemnification), Section 19 (Limitation of Liability), Section 20 (Disclaimer), Section 25 (Governing Law), and Section 27 (General) — survive termination of your account or these Terms.
      </p>

      <h2>24. Data Portability &amp; Deletion (EU Data Act)</h2>
      <p>
        If you are established in the EU/EEA or otherwise subject to Regulation (EU) 2023/2854 (the <strong>Data Act</strong>), you may at any time, on at least two months' written notice to <a href="mailto:hello@vovv.ai" className="text-primary hover:underline">hello@vovv.ai</a>, request (a) the transfer of your data to another provider in a structured, commonly used, and machine-readable format, or (b) the deletion of your data.
      </p>
      <p>
        We will provide reasonable assistance to support transfer or deletion. We may charge reasonable direct costs to the extent permitted by the Data Act and will provide an itemised invoice.
      </p>
      <p>
        This right is in addition to your data-subject rights under the GDPR (see Privacy Policy) and does not affect any other contractual or statutory rights.
      </p>

      <h2>25. Governing Law</h2>
      <ul>
        <li>• <strong>Business users:</strong> these Terms are governed by the laws of the Republic of Lithuania, and the courts of Vilnius, Lithuania have exclusive jurisdiction over any dispute, subject to any mandatory rules that apply to you.</li>
        <li>• <strong>EU consumers:</strong> you keep the protection of the mandatory laws of the country where you live, and you may bring proceedings in the courts of that country.</li>
        <li>• <strong>Other consumers:</strong> nothing in these Terms removes any mandatory statutory right you have in your country of residence.</li>
      </ul>

      <h2>26. Changes</h2>
      <p>
        We may update these Terms from time to time. For material changes we will give you reasonable advance notice (at least 30 days) by email or via the Service. Non-material changes (clarifications, formatting, contact details) take effect on posting. Continued use of the Service after changes take effect is your acceptance of the updated Terms; if you do not agree, you should stop using the Service and may close your account.
      </p>

      <h2>27. General</h2>
      <ul>
        <li>• <strong>Entire agreement.</strong> These Terms and the Privacy Policy are the entire agreement between you and VOVV.AI regarding the Service and supersede any prior agreements on the same subject.</li>
        <li>• <strong>Severability.</strong> If any provision is held unenforceable, the remaining provisions stay in full force, and the unenforceable provision will be modified to the minimum extent necessary to make it enforceable.</li>
        <li>• <strong>No waiver.</strong> Failure to enforce any right is not a waiver of that right.</li>
        <li>• <strong>Assignment.</strong> You may not assign or transfer these Terms without our prior written consent. We may assign these Terms to an affiliate or successor in connection with a merger, acquisition, or sale of assets.</li>
        <li>• <strong>Notices.</strong> We may send notices to the email associated with your account; you should send notices to <a href="mailto:hello@vovv.ai" className="text-primary hover:underline">hello@vovv.ai</a>.</li>
        <li>• <strong>Language.</strong> The English version of these Terms is the binding version; any translation is provided for convenience only.</li>
        <li>• <strong>No third-party beneficiaries.</strong> These Terms do not create rights for any third party.</li>
      </ul>

      <h2>28. Company Information</h2>
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
