import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function PhotographyFinalCTA() {
  return (
    <section className="py-16 lg:py-32 bg-[#1a1a2e] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#475569] blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#64748b] blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50 mb-4">
          Get started
        </p>
        <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-5">
          Turn one product photo into your next visual campaign
        </h2>
        <p className="text-[#9ca3af] text-base sm:text-lg leading-relaxed mb-10">
          Create product page images, lifestyle visuals, ads, social content, and campaign-ready creative with VOVV.AI.
        </p>

        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4">
          <Link
            to="/app/generate/product-images"
            className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full bg-white text-[#1a1a2e] text-base font-semibold hover:bg-white/90 transition-colors w-full sm:w-auto"
          >
            Create your first visuals free
            <ArrowRight size={16} />
          </Link>
          <a
            href="#categories"
            className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full border border-white/20 text-white text-base font-semibold hover:bg-white/10 transition-colors w-full sm:w-auto"
          >
            Explore categories
          </a>
        </div>
      </div>
    </section>
  );
}
