import { LandingFAQConfig, type FAQItem } from '@/components/seo/landing/LandingFAQConfig';

export type { FAQItem };

export interface ComparisonFAQProps {
  eyebrow?: string;
  headline: string;
  intro?: string;
  faqs: FAQItem[];
}

/**
 * Wraps LandingFAQConfig so FAQPage JSON-LD + accordion styling stay
 * consistent across every comparison page.
 */
export function ComparisonFAQ({
  eyebrow = 'Comparison FAQ',
  headline,
  intro = 'Quick answers to common questions about both tools.',
  faqs,
}: ComparisonFAQProps) {
  return (
    <LandingFAQConfig eyebrow={eyebrow} headline={headline} intro={intro} faqs={faqs} />
  );
}
