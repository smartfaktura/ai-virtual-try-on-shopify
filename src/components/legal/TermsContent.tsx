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
      <p className="text-xs uppercase tracking-wider text-muted-foreground/70 !mb-6">Last updated: 25 May 2026</p>

      <p>
        These Terms of Service ("Terms") form a binding agreement between you and <strong>MB 123PRESETS</strong>, the operator of VOVV.AI ("VOVV.AI", "we", "us", or "our"). Please read them carefully before creating an account, purchasing credits, or using the Service.
      </p>

      <h2>1. Definitions</h2>
      <ul>
        <li>• <strong>"Service"</strong> — the VOVV.AI platform, including all websites, applications, APIs, models, tools, and related features.</li>
        <li>• <strong>"Inputs"</strong> — any content you upload, submit, or provide, including images, prompts, text, products, references, brand assets, scenes, models, faces, and data.</li>
        <li>• <strong>"Generations"</strong> — any image, video, text, or other output produced by the Service from your Inputs.</li>
        <li>• <strong>"Free Generations"</strong> — Generations created using free trials, free plans, free credits, preview access, beta access, or promotional credits.</li>
        <li>• <strong>"Credits"</strong> — usage units required to access generation features.</li>
        <li>• <strong>"User" / "You"</strong> — any person or entity creating an account, accessing, or using the Service.</li>
      </ul>

      <h2>2. Acceptance of Terms</h2>
      <p>
        By creating an account, accessing or using the Service, purchasing credits, subscriptions, or add-ons, or downloading, exporting, publishing, or otherwise using any Generation, you agree to these Terms and our {privacyLink}. If you do not agree, you must not register, purchase, or use the Service.
      </p>
      <p>
        These Terms apply at the moment of registration and continue to apply at every checkout, every purchase, and every use of the Service. If you purchase on behalf of a company or other entity, you confirm that you are authorised to bind that entity to these Terms.
      </p>

      <h2>3. Eligibility</h2>
      <p>
        You must be at least 16 years old to use the Service, and at least 18 years old to purchase paid plans, credits, or add-ons. If you are between 16 and 18, you confirm that you have verifiable parental or legal-guardian consent. The Service is not directed to children under 16.
      </p>

      <h2>4. Account Responsibility</h2>
      <p>You are responsible for:</p>
      <ul>
        <li>• Your account security, including credentials, API keys, and access tokens</li>
        <li>• All activity under your account, including activity by team members, contractors, agencies, clients, or other authorised users</li>
        <li>• Providing accurate, current, and complete information and keeping it up to date</li>
        <li>• Notifying us promptly at <a href="mailto:hello@vovv.ai" className="text-primary hover:underline">hello@vovv.ai</a> of any unauthorised access, suspected breach, or security incident</li>
      </ul>

      <h2>5. Service Description</h2>
      <p>
        VOVV.AI is an AI-powered visual generation platform for e-commerce brands, creators, agencies, and businesses. The Service lets you upload product images, prompts, model and reference photos, scene and brand references, and other inputs to generate AI-powered images, videos, and visual assets for product pages, advertising, social media, campaigns, and other commercial or personal use.
      </p>
      <p>
        The Service is provided on an "as is" and "as available" basis. Features, models, providers, limits, pricing, and behaviour may change at any time.
      </p>

      <h2>6. Experimental / Beta Features</h2>
      <p>
        We may make experimental, preview, or beta features available. These features may be incomplete, unstable, rate-limited, modified, or withdrawn at any time without notice and are provided without warranties of any kind. Generations produced through experimental features may be subject to additional restrictions.
      </p>

      <h2>7. Availability</h2>
      <p>
        We aim to keep the Service available but do not guarantee uninterrupted, error-free, or continuous operation. The Service may be affected by maintenance, updates, third-party provider outages, network failures, or events outside our reasonable control. We are not liable for downtime, delays, lost Generations, or interruptions, except where mandatory law requires otherwise.
      </p>

      <h2>8. Credits, Subscriptions, Payments &amp; Free Trials</h2>

      <h3>8.1 Credits</h3>
      <p>
        Generation features consume Credits. Credits are usage units only. They are not cash, stored value, currency, property, securities, or a financial instrument, and have no monetary value outside the Service.
      </p>
      <p>
        Unless expressly stated otherwise or required by law, unused subscription Credits expire at the end of each billing period, do not roll over, and are not refundable, transferable, or exchangeable for money or other assets. Monthly subscription Credits reset at the end of the monthly billing period.
      </p>

      <h3>8.2 Subscriptions &amp; cancellation</h3>
      <ul>
        <li>• Subscriptions renew automatically at the end of each billing period until cancelled.</li>
        <li>• You may cancel at any time; cancellation takes effect at the end of the current paid period.</li>
        <li>• After cancellation, access continues until the end of the paid period, unless your account is terminated for a violation of these Terms.</li>
        <li>• If a payment fails, we may suspend, restrict, downgrade, or terminate access until payment is resolved.</li>
        <li>• Prices, plans, Credit allocations, and feature limits may change with reasonable prior notice.</li>
      </ul>

      <h3>8.3 Taxes</h3>
      <p>
        Prices may be shown inclusive or exclusive of VAT or other taxes, depending on your location and the checkout or payment-provider settings in force at the time of purchase. You are responsible for any taxes, duties, or charges imposed by your jurisdiction other than taxes based on our net income.
      </p>

      <h3>8.4 Refunds</h3>
      <p>
        Except where required by mandatory consumer law, all purchases of Credits, subscriptions, and add-ons are final and non-refundable, including in cases of partial use, unused Credits, or dissatisfaction with Generations.
      </p>

      <h3>8.5 Free trials, free credits &amp; promotional access</h3>
      <p>
        We may offer free trials, free Credits, free plans, preview access, beta access, or promotional Credits to let you evaluate the Service. Free trial users may test core features subject to the limits we set from time to time.
      </p>
      <p>
        Generations created using free trials, free Credits, free plans, preview access, or promotional Credits ("Free Generations") are provided for evaluation and internal testing only. Unless we expressly state otherwise in writing, you may not use Free Generations for commercial purposes, including paid advertising, product listings, e-commerce stores, marketplaces, client work, resale, public brand campaigns, or commercial social media content.
      </p>
      <p>
        We may watermark, restrict, rate-limit, or remove export or commercial-usage rights for Free Generations at any time. Commercial-use rights begin only once you have an active paid plan or paid Credits, and remain subject to the rest of these Terms and applicable law.
      </p>

      <h3>8.6 EU consumer withdrawal &amp; immediate access</h3>
      <p>
        If you are a consumer resident in the EU, you may have a 14-day right of withdrawal for digital content or digital services. However, this right may be lost once you request immediate access to or performance of the Service and acknowledge that you lose the right of withdrawal once the digital content or service begins, except where mandatory consumer law provides otherwise. By starting to use the Service, generating outputs, or downloading Generations during the withdrawal period, you confirm such request and acknowledgement.
      </p>

      <h2>9. Acceptable Use</h2>
      <p>You must not use the Service to create, upload, generate, request, share, or attempt any of the following:</p>
      <ul>
        <li>• Illegal content or content that violates applicable law in any relevant jurisdiction</li>
        <li>• Content that infringes intellectual property, copyright, trademark, trade dress, design, patent, database, or moral rights</li>
        <li>• Misleading brand mimicry, counterfeit goods, fake endorsements, or unauthorised use of brand assets</li>
        <li>• Impersonation of real people, businesses, or organisations</li>
        <li>• Misuse of public figures, politicians, celebrities, or other identifiable individuals without rights</li>
        <li>• Political deception, election manipulation, disinformation, or coordinated inauthentic behaviour</li>
        <li>• Non-consensual intimate imagery, sexual content involving real people without consent, or revenge content</li>
        <li>• Nudification, simulated clothing removal, or any intimate manipulation of real persons</li>
        <li>• Any content involving minors that is sexual, intimate, suggestive, exploitative, or abusive (see Section 9.1)</li>
        <li>• Harassment, blackmail, stalking, doxxing, threats, or targeted abuse</li>
        <li>• Malware, scraping, automated abuse, denial-of-service activity, reverse engineering, or circumvention of access controls</li>
        <li>• Any attempt to bypass, disable, or interfere with safety systems, content filters, watermarking, or rate limits</li>
        <li>• Misleading product claims, fake before/after results, deceptive advertising, or false testimonials</li>
        <li>• Promotion of illegal or strictly regulated goods or services (e.g. weapons, illicit drugs, regulated financial products) where prohibited</li>
        <li>• Any use of Generations that violates platform rules, advertising policies, marketplace policies, consumer-protection law, data-protection law, or intellectual-property law</li>
      </ul>

      <h3>9.1 Child safety &amp; minors</h3>
      <p>
        You must not create, upload, request, generate, share, distribute, or attempt to create any child sexual abuse material, child sexual exploitation material, sexualised depiction of a minor, or any content involving a person under 18 in a sexual, nude, intimate, suggestive, exploitative, or abusive context, whether real, fictional, AI-generated, manipulated, stylised, or implied. You must not upload faces or likenesses of minors under 18 for any purpose.
      </p>
      <p>
        We may report suspected violations to law enforcement, competent authorities, and applicable hotlines, and may preserve relevant data for that purpose.
      </p>

      <h2>10. Face, Likeness &amp; Biometric Uploads</h2>
      <p>
        You are fully and solely responsible for every face, model, or person you upload, reference, or otherwise make available to the Service. By uploading such material, you confirm that:
      </p>
      <ul>
        <li>• You are either the person shown in the image or you have obtained explicit, informed, written consent from each identifiable person</li>
        <li>• That consent permits upload to an AI service, AI processing, creation of look-alike or derivative AI imagery, and commercial use where applicable</li>
        <li>• You can provide proof of consent on our request</li>
        <li>• No person depicted is under 18</li>
        <li>• You will not upload celebrities, public figures, politicians, employees, ex-partners, private individuals, or any third party for whom you do not hold the necessary rights</li>
      </ul>
      <p>
        You must not use the Service to create sexual, nude, intimate, suggestive, humiliating, harassing, deceptive, defamatory, impersonating, or non-consensual imagery of any real person. You must not use the Service to remove, alter, simulate removal of, or manipulate clothing from a real person, or to create nude, intimate, sexual, suggestive, humiliating, or exploitative imagery of any real person.
      </p>
      <p>
        We may block, remove, suspend, terminate, and report any activity that violates this section. You agree to indemnify and hold VOVV.AI harmless from any claim, loss, or liability arising from face, likeness, or biometric uploads you submit. The liability cap in Section 20 does not apply to this indemnity.
      </p>

      <h2>11. Scene, Brand Scene &amp; Reference Image Uploads</h2>
      <p>
        You are solely responsible for every reference image, scene image, brand image, moodboard, interior, campaign visual, location, packaging, logo, product photograph, or style reference you upload to the Service. By uploading such materials, you confirm that you own them or hold a valid licence or written permission that allows AI use, AI ingestion and processing, derivative outputs, and your intended commercial or personal use.
      </p>
      <p>
        You must not upload materials sourced from Pinterest, Google Images, screenshots, magazine scans, other brands' campaigns, watermarked stock previews, film stills, celebrity images, or other unlicensed sources unless you hold the necessary rights.
      </p>
      <p>
        VOVV.AI does not verify, clear, or guarantee rights in your reference materials before generation. You are responsible for rights clearance. We may remove, block, suspend, terminate, or comply with takedown requests at our discretion. You agree to indemnify and hold VOVV.AI harmless from any claim, loss, or liability arising from reference materials you submit. The liability cap in Section 20 does not apply to this indemnity.
      </p>

      <h2>12. User Responsibility</h2>
      <p>
        You are solely responsible for all Inputs, prompts, and Generations associated with your account, and for reviewing every Generation before any use. You are responsible for legal clearance before publication, advertising, resale, distribution, or any other commercial use, and for compliance with the rules of any external platform on which you use Generations, including Meta, TikTok, Google, Amazon, Shopify, Etsy, other marketplaces, ad networks, and app stores.
      </p>
      <p>
        You are also responsible for how you create, select, edit, download, publish, distribute, advertise, sell, or otherwise use any Generation, including downstream use by your employees, contractors, clients, collaborators, team members, or agencies.
      </p>

      <h2>13. AI Limitations</h2>
      <p>
        AI outputs are probabilistic and may be inaccurate, distorted, unrealistic, defective, biased, offensive, unexpected, or similar to existing people, brands, trademarks, designs, or works. Generations may not accurately preserve product details, logos, labels, packaging, colours, materials, text, human anatomy, faces, poses, or proportions.
      </p>
      <p>
        We do not guarantee accuracy, product fidelity, brand safety, originality, non-infringement, commercial suitability, regulatory compliance, advertising approval, marketplace approval, or any specific result. You must independently inspect and validate every Generation before publication, advertising, resale, or commercial use.
      </p>

      <h2>14. AI Transparency &amp; Disclosure</h2>
      <p>
        Generations are synthetic and AI-generated. You are responsible for any disclosures, labels, or notices required by applicable law, regulators, platforms, ad networks, or marketplaces, including labelling of synthetic media, deepfakes, look-alike imagery, or AI-generated content depicting real persons.
      </p>
      <p>
        Where we apply watermarks, metadata, content credentials, or other provenance signals to Generations, you must not remove, obscure, alter, or interfere with them. VOVV.AI is not responsible for your failure to disclose AI-generated content where disclosure is required.
      </p>

      <h2>15. Intellectual Property &amp; Commercial Use</h2>
      <p>
        As between you and VOVV.AI, we do not claim ownership of Generations you create using the Service. Subject to these Terms, your plan limits, payment status, and applicable law, you may use paid Generations for personal or commercial purposes.
      </p>
      <p>
        However, because Generations are AI-generated, we do not guarantee that any Generation is copyrightable, exclusive, registrable, original, non-infringing, or free from similarity to third-party works, brands, products, people, trademarks, trade dress, designs, or other protected rights. Similar or identical Generations may be produced by other users.
      </p>
      <p>
        Free Generations are not licensed for commercial use unless we expressly state otherwise in writing. The VOVV.AI name, logo, Service, software, models, design, documentation, and underlying technology are owned by us or our licensors and are protected by intellectual-property laws. Nothing in these Terms transfers ownership of the Service to you.
      </p>

      <h2>16. No Training of Private Content</h2>
      <p>
        We do not use your private Inputs or private Generations to train VOVV.AI models or third-party foundation models. We may use aggregated, anonymised, or de-identified operational data, logs, performance metrics, abuse-prevention signals, safety signals, and model-quality insights to operate, secure, debug, monitor abuse, and improve the Service, but not to train models on your private content.
      </p>
      <p>
        Third-party AI providers may process Inputs and Generations only as necessary to provide, secure, and support the Service, subject to applicable provider terms and data-processing commitments. If we ever introduce an opt-in training feature, it will require your explicit opt-in.
      </p>

      <h2>17. Confidentiality</h2>
      <p>
        We treat your account information and private Inputs as confidential and apply reasonable technical and organisational measures to protect them. You agree to keep confidential any non-public information about the Service that we make available to you, including pricing, beta features, technical details, and internal communications.
      </p>

      <h2>18. Third-Party Services</h2>
      <p>
        The Service may rely on third-party providers, including AI model and infrastructure providers such as Google, OpenAI, Kling, and other current or future providers, as well as cloud, storage, payment, email, analytics, and security providers. We may add, remove, replace, or change providers at any time.
      </p>
      <p>
        We are not responsible for third-party provider outages, errors, restrictions, pricing changes, policy changes, model behaviour, model retirement, content filters, or availability. Generations may vary depending on which models or providers are available at the time. Third-party providers may have their own technical limitations and terms.
      </p>

      <h2>19. Indemnification</h2>
      <p>
        You agree to defend, indemnify, and hold harmless VOVV.AI, MB 123PRESETS, and its officers, employees, contractors, and affiliates from and against any claim, demand, loss, liability, damage, fine, penalty, cost, or expense (including reasonable legal fees) arising from or related to: (a) your Inputs, prompts, reference materials, faces, likenesses, or brand assets; (b) your Generations and your use of them; (c) your violation of these Terms or applicable law; (d) your violation of any third-party right, including intellectual-property, privacy, publicity, or consumer-protection rights; and (e) your downstream use, distribution, or commercialisation of any Generation.
      </p>

      <h2>20. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by applicable law, VOVV.AI and MB 123PRESETS will not be liable for any indirect, incidental, consequential, special, exemplary, or punitive damages, or for any loss of profits, revenue, business, data, goodwill, content, opportunity, or anticipated savings, even if advised of the possibility of such damages.
      </p>
      <p>
        Our total aggregate liability for any and all claims arising out of or relating to the Service or these Terms is limited to the greater of (a) the amounts you paid to us for the Service in the 3 months immediately preceding the event giving rise to the claim, or (b) EUR 100.
      </p>
      <p>
        Nothing in these Terms limits liability that cannot be excluded under mandatory law (such as liability for fraud, gross negligence, wilful misconduct, or personal injury). The limitations and caps in this section do not apply to your indemnities under Sections 10 and 11.
      </p>

      <h2>21. Disclaimer</h2>
      <p>
        The Service, Generations, and all related materials are provided "as is" and "as available" without warranties of any kind, whether express, implied, statutory, or otherwise, including any implied warranties of merchantability, fitness for a particular purpose, accuracy, quality, title, non-infringement, originality, or uninterrupted operation, to the maximum extent permitted by law.
      </p>
      <p>
        We do not warrant that Generations will be lawful, accurate, original, non-infringing, suitable for any specific commercial use, or approved by any platform, ad network, marketplace, app store, regulator, or third party.
      </p>

      <h2>22. Copyright, Rights &amp; Content Complaints</h2>
      <p>
        If you believe that content available through the Service infringes your intellectual-property, privacy, publicity, or other rights, please contact us at <a href="mailto:hello@vovv.ai" className="text-primary hover:underline">hello@vovv.ai</a> with sufficient information to identify the content, your rights, and your contact details. We may remove, restrict, or disable access to allegedly infringing content and may suspend or terminate repeat infringers.
      </p>

      <h2>23. DSA Compliance &amp; Content Moderation</h2>
      <p>
        We may use automated systems, provider signals, safety filters, user reports, and human review to detect, prevent, restrict, or remove content that may violate these Terms or applicable law. We may block prompts, refuse Generations, restrict exports, remove content, suspend accounts, or terminate access where we believe there is legal, safety, reputational, operational, or abuse risk.
      </p>
      <p>
        Where required by law, we will provide reasons for our decisions and information about how to lodge a complaint or appeal. Reports of illegal content or violations of these Terms can be sent to <a href="mailto:hello@vovv.ai" className="text-primary hover:underline">hello@vovv.ai</a>.
      </p>

      <h2>24. Termination</h2>
      <p>
        You may stop using the Service and close your account at any time. We may suspend, restrict, or terminate your account or access to all or part of the Service at any time, with or without notice, if we believe you have violated these Terms or applicable law, or where necessary to protect users, third parties, providers, or the Service.
      </p>
      <p>
        On termination, your right to use the Service ends immediately and unused Credits are forfeited, except where mandatory law requires otherwise. Sections that by their nature should survive termination (including IP, indemnities, disclaimers, liability limits, and governing law) will continue to apply.
      </p>

      <h2>25. Data Portability, Deletion &amp; EU Data Act</h2>
      <p>
        Where VOVV.AI qualifies as a provider of data processing services under applicable EU Data Act rules, eligible customers may request export, switching, or deletion of applicable exportable data in accordance with those rules and within timelines set out by law. This does not limit any separate GDPR rights described in our {privacyLink}, which are handled in line with applicable data-protection law.
      </p>

      <h2>26. GDPR — Controller &amp; Processor Roles</h2>
      <p>
        For account, billing, support, analytics, security, fraud-prevention, abuse-prevention, and legal-compliance data, VOVV.AI acts as an independent controller as described in our {privacyLink}. For personal data contained in Inputs that you upload solely for generation purposes, VOVV.AI generally acts as your processor and you act as controller, unless otherwise stated in a separate Data Processing Addendum.
      </p>
      <p>
        You are responsible for ensuring you have a lawful basis and all required consents, notices, and authorisations for any personal data you upload, including face and likeness data. Business and team customers may request a Data Processing Addendum where provided by VOVV.AI.
      </p>

      <h2>27. Governing Law</h2>
      <p>
        These Terms are governed by the laws of the Republic of Lithuania, without regard to its conflict-of-laws rules. The competent courts of Lithuania have exclusive jurisdiction over any dispute arising from or related to these Terms or the Service, except where mandatory consumer law grants you the right to bring proceedings in another forum.
      </p>

      <h2>28. Changes to Terms</h2>
      <p>
        We may update these Terms from time to time. If changes are material, we will provide reasonable notice (for example, by email or in-product notice) before they take effect. Your continued use of the Service after the effective date constitutes acceptance of the updated Terms. If you do not agree, you must stop using the Service.
      </p>

      <h2>29. General</h2>
      <ul>
        <li>• <strong>Entire agreement.</strong> These Terms, together with the {privacyLink} and any additional terms we present at checkout or in-product, form the entire agreement between you and VOVV.AI regarding the Service.</li>
        <li>• <strong>Severability.</strong> If any provision is held unenforceable, the remaining provisions remain in full force.</li>
        <li>• <strong>No waiver.</strong> Our failure to enforce a provision is not a waiver of our right to do so later.</li>
        <li>• <strong>Assignment.</strong> You may not assign these Terms without our prior written consent. We may assign these Terms in connection with a merger, acquisition, restructuring, or sale of assets.</li>
        <li>• <strong>Force majeure.</strong> We are not liable for delays or failures caused by events beyond our reasonable control.</li>
        <li>• <strong>Notices.</strong> Legal notices to us must be sent to <a href="mailto:hello@vovv.ai" className="text-primary hover:underline">hello@vovv.ai</a>.</li>
      </ul>

      <h2>30. Company Information</h2>
      <p>The Service is operated by:</p>
      <ul>
        <li>• <strong>MB 123PRESETS</strong></li>
        <li>• Company code: <strong>306675527</strong></li>
        <li>• VAT: <strong>LT100016637411</strong></li>
        <li>• Registered office: Juozo Balčikonio g. 7-213, Vilnius, Lithuania</li>
        <li>• Registered in Lithuania</li>
        <li>• Contact: <a href="mailto:hello@vovv.ai" className="text-primary hover:underline">hello@vovv.ai</a></li>
      </ul>
    </div>
  );
}
