import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function HomeFinalCTA() {
  return (
    <section className="py-16 lg:py-32 bg-[#1a1a2e] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#475569] blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#64748b] blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50 mb-4">
          Get started
        </p>
        <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-5">
          Your next product shoot starts here
        </h2>
        <p className="text-[#9ca3af] text-base sm:text-lg leading-relaxed mb-10">
          Upload one product photo. Get a full campaign in minutes.
        </p>

        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4">
          <Link
            to="/auth"
            className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full bg-white text-[#1a1a2e] text-base font-semibold hover:bg-white/90 transition-colors w-full sm:w-auto"
          >
            Start free
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/discover"
            className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full border border-white/20 text-white text-base font-semibold hover:bg-white/10 transition-colors w-full sm:w-auto"
          >
            See real examples
          </Link>
        </div>
      </div>
    </section>
  );
}
