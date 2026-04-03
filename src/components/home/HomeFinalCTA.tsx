import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function HomeFinalCTA() {
  return (
    <section className="py-16 lg:py-32 bg-[#1a1a2e] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#475569] blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#64748b] blur-3xl" />
      </div>

      <div className="absolute top-12 left-[10%] w-20 h-28 rounded-xl bg-white/5 border border-white/5 -rotate-12 pointer-events-none" />
      <div className="absolute bottom-16 right-[12%] w-24 h-32 rounded-xl bg-white/5 border border-white/5 rotate-6 pointer-events-none" />
      <div className="absolute top-1/3 right-[8%] w-16 h-20 rounded-lg bg-white/3 border border-white/3 rotate-12 pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
        <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-5">
          Try it on your product
        </h2>
        <p className="text-[#9ca3af] text-lg leading-relaxed mb-8">
          Upload one photo and see what VOVV can create for your brand in minutes.
        </p>

        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3">
          <Link
            to="/auth"
            className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full bg-white text-[#1a1a2e] text-[15px] font-medium hover:bg-white/90 transition-colors w-full sm:w-auto"
          >
            Start free
            <ArrowRight size={16} />
          </Link>
          <a
            href="#examples"
            className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full border border-white/20 text-white text-[15px] font-medium hover:bg-white/10 transition-colors w-full sm:w-auto"
          >
            See real examples
          </a>
        </div>
      </div>
    </section>
  );
}
