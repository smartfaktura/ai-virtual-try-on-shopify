import { LandingDecisionMatrix } from '@/components/seo/landing/LandingDecisionMatrix';

export interface WhoShouldChooseWhichProps {
  eyebrow?: string;
  headline: string;
  intro?: string;
  leftTitle: string;
  leftItems: string[];
  rightTitle: string;
  rightItems: string[];
}

/**
 * Thin wrapper around LandingDecisionMatrix so comparison pages get the same
 * decision-framework aesthetic as the rest of the site.
 */
export function WhoShouldChooseWhich(props: WhoShouldChooseWhichProps) {
  return <LandingDecisionMatrix eyebrow={props.eyebrow ?? 'Decision'} {...props} />;
}
