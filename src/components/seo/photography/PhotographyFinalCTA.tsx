import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function PhotographyFinalCTA() {
  return (
    <section className="py-16 lg:py-32 bg-[#FAFAF8]">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-5">
          Turn one product photo into your next visual campaign
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed mb-10">
          Create product page images, lifestyle visuals, ads, social content, and campaign-ready creative with VOVV.AI.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/app/generate/product-images"
            className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full bg-primary text-primary-foreground text-base font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
          >
            Create your first visuals free
            <ArrowRight size={16} />
          </Link>
          <a
            href="#categories"
            className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full border border-border text-foreground text-base font-semibold hover:bg-secondary transition-colors"
          >
            Explore categories
          </a>
        </div>
      </div>
    </section>
  );
}
