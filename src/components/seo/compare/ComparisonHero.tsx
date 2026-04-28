import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export interface ComparisonHeroProps {
  eyebrow: string;
  /** Plain string or rich JSX. Use a string for the SEO hub; JSX for the per-comparison page. */
  headline: React.ReactNode;
  subheadline: string;
  primaryCta: { label: string; to: string };
  secondaryCta?: { label: string; to: string };
  pageId?: string;
}

/**
 * Premium, minimal comparison hero. Mirrors the type scale and spacing of
 * LandingHeroSEO but without the image grid — comparison pages lead with copy.
 */
export function ComparisonHero({
  eyebrow,
  headline,
  subheadline,
  primaryCta,
  secondaryCta,
  pageId,
}: ComparisonHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#FAFAF8] pt-28 lg:pt-36 pb-20 lg:pb-28">
      {/* Subtle background wash to match homepage hero ambience */}
      <div className="absolute inset-0 pointer-events-none opacity-60">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-[#eef0f5] blur-3xl" />
      </div>

      <div className="relative z-10 max-w-[1100px] mx-auto px-6 lg:px-10 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-5">
          {eyebrow}
        </p>

        <h1 className="text-[#1a1a2e] text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05] max-w-4xl mx-auto">
          {headline}
        </h1>

        <p className="mt-6 lg:mt-7 text-[#475569] text-base sm:text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto">
          {subheadline}
        </p>

        <div className="mt-10 flex flex-col sm:flex-row flex-wrap justify-center gap-3.5">
          <Link
            to={primaryCta.to}
            data-cta="compare-hero-primary"
            data-page={pageId}
            className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full bg-[#1a1a2e] text-white text-base font-semibold hover:bg-[#0f0f1f] transition-colors w-full sm:w-auto shadow-sm"
          >
            {primaryCta.label}
            <ArrowRight size={16} />
          </Link>
          {secondaryCta && (
            <Link
              to={secondaryCta.to}
              data-cta="compare-hero-secondary"
              data-page={pageId}
              className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full border border-[#1a1a2e]/15 bg-white text-[#1a1a2e] text-base font-semibold hover:bg-white/70 transition-colors w-full sm:w-auto"
            >
              {secondaryCta.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
