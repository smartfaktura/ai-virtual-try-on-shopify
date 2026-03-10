import { PageLayout } from '@/components/landing/PageLayout';
import { FileText } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { SITE_URL } from '@/lib/constants';

export default function TermsOfService() {
  return (
    <PageLayout>
      <SEOHead title="Terms of Service — VOVV AI" description="Read the VOVV AI terms of service. Understand your rights and responsibilities when using our AI product photography platform." canonical={`${SITE_URL}/terms`} />
      <section className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <FileText className="w-4 h-4" />
              Legal
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight mb-4">
              Terms of Service
            </h1>
            <p className="text-sm text-muted-foreground">Last updated: March 2026</p>
          </div>

          <div className="prose prose-sm max-w-none text-muted-foreground [&_h2]:text-foreground [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-foreground [&_h3]:font-medium [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:mb-4 [&_p]:leading-relaxed [&_ul]:mb-4 [&_ul]:space-y-1 [&_li]:ml-4">
            <p>
              <em>
                This is a template terms of service provided for informational purposes. We recommend consulting with a legal professional to ensure compliance with applicable laws.
              </em>
            </p>

            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using VOVV.AI (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the Service. These Terms constitute a legally binding agreement between you and VOVV.AI.
            </p>

            <h2>2. Account Registration</h2>
            <p>
              You must create an account to use the Service. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate and complete information and keep it updated.
            </p>

            <h2>3. Service Description</h2>
            <p>
              VOVV.AI provides AI-powered product photography generation tools (the "Service"). You upload product images and reference materials, and our Service generates styled product photographs, lifestyle images, on-model shots, and videos based on your selections and inputs.
            </p>
            <p>
              <strong>VOVV.AI is a tool provider only.</strong> We provide automated generation tools and do not exercise editorial control over the content you create. We have no obligation to review, monitor, screen, or approve any content you upload or any outputs generated through the Service. The creative decisions, inputs, and resulting outputs are entirely yours.
            </p>

            <h2>4. Credits and Payment</h2>
            <p>
              The Service operates on a credit-based system. Credits are consumed when generating images or videos. Credit allocations depend on your subscription plan. Purchased credits are non-refundable except as described in our refund policy. We reserve the right to modify pricing with 30 days' notice.
            </p>

            <h2>5. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>• Use the Service to generate illegal, harmful, defamatory, obscene, or misleading content</li>
              <li>• Upload content you do not have the right to use, including copyrighted or trademarked material owned by third parties</li>
              <li>• Generate recognizable likenesses of real individuals without their explicit written consent</li>
              <li>• Create deepfakes, deceptive media, or content designed to mislead others about the identity of persons depicted</li>
              <li>• Generate content that violates any person's privacy, publicity, or moral rights</li>
              <li>• Upload or generate content depicting minors in any inappropriate context</li>
              <li>• Use the Service to produce counterfeit goods imagery or to infringe on any brand's trademarks or trade dress</li>
              <li>• Attempt to reverse-engineer, copy, or extract our AI models or underlying technology</li>
              <li>• Use automated scripts to access the Service without permission</li>
              <li>• Resell or redistribute the Service without authorization</li>
              <li>• Interfere with or disrupt the Service or its infrastructure</li>
            </ul>
            <p>
              We reserve the right to suspend or terminate your account immediately if we become aware of any violation of these restrictions, without prior notice or refund.
            </p>

            <h2>6. Your Uploads — Representations and Warranties</h2>
            <p>
              By uploading any content to the Service (including but not limited to product images, reference photos, model photos, background images, and any other visual materials), you represent and warrant that:
            </p>
            <ul>
              <li>• You own or have obtained all necessary rights, licenses, consents, and permissions for all content you upload</li>
              <li>• If your uploads contain recognizable likenesses of any individual, you have obtained their explicit written consent for use in AI-generated imagery</li>
              <li>• Your uploads do not infringe any third-party intellectual property rights, privacy rights, publicity rights, or moral rights</li>
              <li>• You have full authority to grant the licenses described in these Terms</li>
              <li>• Your uploads comply with all applicable laws and regulations in your jurisdiction</li>
            </ul>
            <p>
              <strong>VOVV.AI does not verify, validate, or screen uploaded content.</strong> We rely entirely on your representations and warranties above. You acknowledge that uploading content in violation of this section constitutes a material breach of these Terms and may result in immediate account termination.
            </p>

            <h2>7. Your Responsibility for Generated Content</h2>
            <p>
              <strong>You are solely and exclusively responsible for ALL content generated through the Service ("Generations"),</strong> including but not limited to:
            </p>
            <ul>
              <li>• <strong>The decision</strong> to create such Generations</li>
              <li>• <strong>Any use, distribution, publication, display, commercialization, or sharing</strong> of Generations</li>
              <li>• <strong>Ensuring</strong> that Generations do not infringe any third-party intellectual property, privacy, publicity, or moral rights</li>
              <li>• <strong>Any claims, damages, or liability</strong> arising from third parties' exposure to your Generations</li>
              <li>• <strong>Compliance</strong> with all applicable laws, regulations, and industry standards when distributing or using Generations</li>
              <li>• <strong>Reviewing</strong> all Generations for accuracy, appropriateness, and potential issues before any commercial or public use</li>
            </ul>
            <p>
              VOVV.AI provides generation tools only, exercises no editorial control over Generations, and bears no responsibility whatsoever for how Generations are used, distributed, or commercialized after creation. You acknowledge that AI-generated content may contain artifacts, inaccuracies, unintended resemblances, or imperfections, and it is your sole responsibility to review all outputs.
            </p>

            <h2>8. Intellectual Property</h2>
            <h3>Your Content</h3>
            <p>
              You retain all rights to the product images you upload. By uploading images, you grant us a limited, non-exclusive license to process them solely for providing the Service. This license terminates when you delete your account or the relevant content.
            </p>
            <h3>Generated Content Ownership</h3>
            <p>
              Subject to your compliance with these Terms and your subscription plan, you own the Generations created through your use of the Service. However, see Section 9 regarding the intellectual property status of AI-generated content.
            </p>
            <h3>Our Property</h3>
            <p>
              The Service, including its design, features, AI models, algorithms, and branding, is owned by VOVV.AI and protected by intellectual property laws. Nothing in these Terms grants you rights to our trademarks, logos, or proprietary technology.
            </p>

            <h2>9. Intellectual Property Status of AI-Generated Content</h2>
            <p>
              <strong>The intellectual property status of AI-generated content is legally evolving and unsettled.</strong> You acknowledge and agree that:
            </p>
            <ul>
              <li>• Certain jurisdictions may not recognize copyright protection for content generated by artificial intelligence</li>
              <li>• VOVV.AI makes no representations or warranties regarding the copyrightability, patentability, or other intellectual property protection of any Generations</li>
              <li>• The legal landscape around AI-generated content is rapidly changing and varies by jurisdiction</li>
              <li>• You should not rely on AI-generated content as a basis for intellectual property claims without independent legal advice</li>
            </ul>
            <p>
              If you intend to seek intellectual property protection for Generations, we strongly recommend consulting with qualified legal counsel in your jurisdiction.
            </p>

            <h2>10. Indemnification</h2>
            <p>
              <strong>You agree to indemnify, defend, and hold harmless VOVV.AI,</strong> its officers, directors, employees, agents, affiliates, successors, and assigns from and against any and all claims, damages, liabilities, losses, costs, and expenses (including reasonable attorneys' fees) arising out of or relating to:
            </p>
            <ul>
              <li>• Your use of the Service</li>
              <li>• Any content you upload to the Service</li>
              <li>• Any Generations you create, distribute, publish, or commercialize</li>
              <li>• Your violation of these Terms or any applicable law</li>
              <li>• Your infringement of any third-party intellectual property, privacy, publicity, or other rights</li>
              <li>• Any breach of your representations and warranties under these Terms</li>
              <li>• Any claim by a third party related to your uploads or Generations</li>
            </ul>
            <p>
              This indemnification obligation shall survive the termination of your account and these Terms.
            </p>

            <h2>11. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL VOVV.AI, ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, BUSINESS OPPORTUNITIES, GOODWILL, OR REPUTATION, ARISING FROM YOUR USE OF THE SERVICE, YOUR GENERATIONS, OR ANY CONTENT UPLOADED TO THE SERVICE.
            </p>
            <p>
              IN NO EVENT SHALL VOVV.AI BE LIABLE FOR ANY CLAIMS ARISING FROM YOUR GENERATIONS, INCLUDING BUT NOT LIMITED TO CLAIMS OF INTELLECTUAL PROPERTY INFRINGEMENT, VIOLATION OF PRIVACY OR PUBLICITY RIGHTS, DEFAMATION, OR ANY OTHER THIRD-PARTY CLAIMS RELATED TO YOUR USE OF GENERATED CONTENT.
            </p>
            <p>
              OUR TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE TOTAL AMOUNT YOU HAVE PAID TO VOVV.AI IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO THE CLAIM.
            </p>

            <h2>12. Disclaimer of Warranties</h2>
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p>
              WITHOUT LIMITING THE FOREGOING, VOVV.AI DOES NOT WARRANT THAT:
            </p>
            <ul>
              <li>• THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE</li>
              <li>• GENERATIONS WILL BE ACCURATE, COMPLETE, OR FREE FROM ARTIFACTS OR IMPERFECTIONS</li>
              <li>• GENERATIONS WILL NOT RESEMBLE REAL PERSONS, BRANDS, OR COPYRIGHTED WORKS</li>
              <li>• GENERATIONS WILL BE SUITABLE FOR ANY PARTICULAR COMMERCIAL PURPOSE</li>
              <li>• GENERATIONS WILL BE ELIGIBLE FOR COPYRIGHT OR OTHER INTELLECTUAL PROPERTY PROTECTION</li>
            </ul>

            <h2>13. DMCA and Copyright Takedowns</h2>
            <p>
              VOVV.AI respects the intellectual property rights of others. If you believe that content on our Service infringes your copyright, you may submit a takedown notice to:
            </p>
            <p>
              <a href="mailto:hello@vovv.ai" className="text-primary hover:underline">
                hello@vovv.ai
              </a>
            </p>
            <p>
              Your notice must include: (i) identification of the copyrighted work; (ii) identification of the infringing material; (iii) your contact information; (iv) a statement of good faith belief; and (v) a statement under penalty of perjury that the information is accurate and you are authorized to act on behalf of the copyright owner.
            </p>
            <p>
              We will respond to valid takedown requests in accordance with applicable law. Users who receive a takedown notice may submit a counter-notification if they believe the removal was in error.
            </p>

            <h2>14. Termination</h2>
            <p>
              You may terminate your account at any time through the Settings page. We may suspend or terminate your access immediately and without prior notice if you violate these Terms, engage in conduct that we determine is harmful to the Service or other users, or if we are required to do so by law. Upon termination, your right to use the Service ceases immediately. Sections 6, 7, 9, 10, 11, 12, and 15 shall survive termination.
            </p>

            <h2>15. Governing Law and Dispute Resolution</h2>
            <p>
              These Terms are governed by the laws of the State of Delaware, United States, without regard to conflict of law principles. Any disputes arising from these Terms or the Service shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association, except that either party may seek injunctive relief in any court of competent jurisdiction.
            </p>

            <h2>16. Changes to Terms</h2>
            <p>
              We may modify these Terms at any time. We will notify you of material changes via email or through the Service at least 30 days before they take effect. Continued use after changes constitutes acceptance. If you do not agree to the updated Terms, you must stop using the Service.
            </p>

            <h2>17. Severability</h2>
            <p>
              If any provision of these Terms is held to be invalid or unenforceable, such provision shall be struck and the remaining provisions shall be enforced to the fullest extent under law.
            </p>

            <h2>18. Contact Us</h2>
            <p>
              Questions about these Terms? Contact us at{' '}
              <a href="mailto:hello@vovv.ai" className="text-primary hover:underline">
                hello@vovv.ai
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
