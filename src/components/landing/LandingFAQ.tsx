import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { JsonLd } from '@/components/JsonLd';
import { useMemo } from 'react';

const faqs = [
  {
    q: 'Will the images look AI-generated?',
    a: 'No. Our AI generates studio-quality images indistinguishable from professional photography. Combined with your Brand Profile, every image maintains consistent, realistic lighting and composition automatically.',
  },
  {
    q: 'What are Visual Types?',
    a: 'Visual Types are built for specific content goals. Choose from seven core options — Virtual Try-On, Product Listing, Selfie / UGC, Flat Lay, Mirror Selfie, Picture Perspectives, and Interior / Exterior Staging — each pre-configured with the right prompts, aspect ratios, and model settings for that use case.',
  },
  {
    q: 'What is Freestyle?',
    a: 'Freestyle is our open-ended generation mode. Write any prompt, attach product photos or reference images, apply a Brand Profile and style presets, then generate. It gives you full creative control when none of the standard Visual Types fit your vision.',
  },
  {
    q: 'How does Virtual Try-On work?',
    a: 'Upload a clothing item and choose from our library of 40+ diverse AI models across different ethnicities, body types, and ages. Select a pose, framing, and scene, and the AI generates realistic photos of the model wearing your product.',
  },
  {
    q: 'What is the Content Calendar?',
    a: 'The Content Calendar automates recurring visual runs. You choose your products, select your Visual Types, and set a schedule (monthly or biweekly). Fresh visuals arrive on autopilot — no manual work needed. Available on Growth plans and above.',
  },
  {
    q: 'How does Brand Profile work?',
    a: 'When you create a Brand Profile, you set your preferred tone, lighting style, background, color temperature, and composition rules. Every future generation — across Visual Studio and Freestyle — uses this profile automatically so your visuals stay on-brand without manual adjustments.',
  },
  {
    q: 'How many credits does each generation cost?',
    a: 'Visual Types and Virtual Try-On cost 6 credits per image. Freestyle costs 4 credits per image, or 6 credits when you add a model or scene. Your dashboard always shows the exact cost before you generate.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Every new account gets 20 free credits — no credit card required. That\'s enough to run your first Visual Type or try Freestyle and see the quality before committing to a plan.',
  },
  {
    q: 'What image formats and sizes are supported?',
    a: 'We support all common aspect ratios (1:1, 4:5, 16:9, 9:16) and output high-resolution images suitable for e-commerce, social media, ads, and print. You can download in JPEG or PNG format.',
  },
  {
    q: 'Can I cancel my subscription anytime?',
    a: 'Absolutely. You can cancel, upgrade, or downgrade your plan at any time. There are no long-term contracts or cancellation fees. Unused monthly credits don\'t roll over, but top-up credits never expire.',
  },
];

export function LandingFAQ() {
  const faqJsonLd = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  }), []);

  return (
    <section id="faq" className="py-16 lg:py-32 bg-[#f5f5f3]">
      <JsonLd data={faqJsonLd} />
      <div className="max-w-2xl mx-auto px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4 text-center">
          FAQ
        </p>
        <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-center mb-4">
          Frequently asked questions
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg text-center mb-12 leading-relaxed">
          Quick answers before you commit.
        </p>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, idx) => (
            <AccordionItem
              key={idx}
              value={`item-${idx}`}
              className="bg-white rounded-2xl border border-[#f0efed] px-6 shadow-sm data-[state=open]:shadow-md transition-shadow"
            >
              <AccordionTrigger className="text-[#1a1a2e] text-base sm:text-[17px] font-semibold py-6 hover:no-underline text-left">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-foreground/70 text-[15px] sm:text-base leading-relaxed pb-6">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
