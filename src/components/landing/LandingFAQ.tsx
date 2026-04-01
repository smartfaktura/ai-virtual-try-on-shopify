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
    q: 'What are Templates?',
    a: 'Templates are purpose-built generation pipelines. Choose from six core options — Virtual Try-On, Product Listing, Selfie / UGC, Flat Lay, Mirror Selfie, and Interior / Exterior Staging — each pre-configured with the right prompts, aspect ratios, and model settings for that use case.',
  },
  {
    q: 'What is Freestyle?',
    a: 'Freestyle is our open-ended generation mode. Write any prompt, attach product photos or reference images, apply a Brand Profile and style presets, then generate. It gives you full creative control when none of the standard Workflows fit your vision.',
  },
  {
    q: 'How does Virtual Try-On work?',
    a: 'Upload a clothing item and choose from our library of 40+ diverse AI models across different ethnicities, body types, and ages. Select a pose, framing, and scene, and the AI generates realistic photos of the model wearing your product.',
  },
  {
    q: 'What are Creative Drops?',
    a: 'Creative Drops are automated, recurring visual runs. You choose your products, select your Templates, and set a schedule (monthly or biweekly). Fresh visuals arrive on autopilot — no manual work needed. Available on Growth plans and above.',
  },
  {
    q: 'How does Brand Profile work?',
    a: 'When you create a Brand Profile, you set your preferred tone, lighting style, background, color temperature, and composition rules. Every future generation — across Workflows and Freestyle — uses this profile automatically so your visuals stay on-brand without manual adjustments.',
  },
  {
    q: 'How many credits does each generation cost?',
    a: 'Templates and Virtual Try-On cost 6 credits per image. Freestyle costs 4 credits per image, or 6 credits when you add a model or scene. Your dashboard always shows the exact cost before you generate.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Every new account gets 20 free credits — no credit card required. That\'s enough to run your first Workflow or try Freestyle and see the quality before committing to a plan.',
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
    <section id="faq" className="py-20 sm:py-28 bg-muted/20">
      <JsonLd data={faqJsonLd} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know to get started.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, idx) => (
            <AccordionItem
              key={idx}
              value={`item-${idx}`}
              className="border border-border rounded-xl px-5 bg-card data-[state=open]:shadow-sm"
            >
              <AccordionTrigger className="text-left text-sm font-semibold text-foreground hover:no-underline py-4">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
