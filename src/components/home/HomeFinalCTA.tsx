import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HomeFinalCTA() {
  return (
    <section className="py-16 lg:py-32 bg-[#1a1a2e] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-white/40 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-white/30 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60 mb-4">
          Get started
        </p>
        <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-4">
          Try it on your product
        </h2>
        <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-10">
          Upload one photo. See what VOVV creates for your brand.
        </p>

        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="rounded-full h-[3.25rem] px-8 text-base font-semibold bg-white text-[#1a1a2e] hover:bg-white/90 w-full sm:w-auto"
          >
            <Link to="/auth">
              Start free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-full h-[3.25rem] px-8 text-base font-semibold border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white w-full sm:w-auto"
          >
            <Link to="/discover">See real examples</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
