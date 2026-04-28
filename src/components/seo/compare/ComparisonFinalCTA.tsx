import { LandingFinalCTASEO } from '@/components/seo/landing/LandingFinalCTASEO';

export interface ComparisonFinalCTAProps {
  eyebrow?: string;
  headline: string;
  copy: string;
  primaryCta: { label: string; to: string };
  secondaryCta?: { label: string; to: string };
  pageId?: string;
}

export function ComparisonFinalCTA(props: ComparisonFinalCTAProps) {
  return <LandingFinalCTASEO {...props} />;
}
