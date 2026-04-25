import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function HowItWorksHero() {
  return (
    <section className="pt-28 pb-16 lg:pt-36 lg:pb-24 bg-[#FAFAF8]">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
          How it works
        </p>
        <h1 className="text-foreground text-[2.5rem] sm:text-5xl lg:text-[3.25rem] leading-[1.08] font-semibold tracking-[-0.03em] mb-6">
          From one product photo
          <br />
          <span className="text-[#4a5578]">to a full visual system.</span>
        </h1>
        <p className="max-w-xl mx-auto text-muted-foreground text-lg leading-relaxed mb-10">
          Upload a product. Pick the visuals you want. Get every angle, scene, and campaign asset in minutes — no studio, no models, no setup.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/auth"
            className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full bg-primary text-primary-foreground text-base font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
          >
            Try it on my product
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/product-visual-library"
            className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full border border-border text-foreground text-base font-semibold hover:bg-secondary transition-colors"
          >
            See examples
          </Link>
        </div>
        <p className="text-[11px] tracking-[0.12em] uppercase text-muted-foreground/60 font-medium mt-8">
          20 free credits · No card required
        </p>
      </div>
    </section>
  );
}
