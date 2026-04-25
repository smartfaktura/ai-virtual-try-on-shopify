import { useMemo } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { JsonLd } from '@/components/JsonLd';

export interface FAQItem {
  q: string;
  a: string;
}

export interface LandingFAQConfigProps {
  eyebrow?: string;
  headline: string;
  intro?: string;
  faqs: FAQItem[];
}

export function LandingFAQConfig({
  eyebrow = 'FAQ',
  headline,
  intro = 'Quick answers to the most common questions.',
  faqs,
}: LandingFAQConfigProps) {
  const faqJsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    }),
    [faqs],
  );

  return (
    <section id="faq" className="py-16 lg:py-32 bg-background">
      <JsonLd data={faqJsonLd} />
      <div className="max-w-2xl mx-auto px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4 text-center">
          {eyebrow}
        </p>
        <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-center mb-4">
          {headline}
        </h2>
        {intro && (
          <p className="text-muted-foreground text-base sm:text-lg text-center mb-12 leading-relaxed">
            {intro}
          </p>
        )}

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
