import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function HomeFinalCTA() {
  return (
    <section className="py-24 lg:py-32 bg-[#1a1a2e] relative overflow-hidden">
      {/* Subtle background blobs */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#475569] blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#64748b] blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
        <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-5">
          Try it on your product
        </h2>
        <p className="text-[#9ca3af] text-lg leading-relaxed mb-8">
          Upload one photo and see what VOVV can create for your brand in minutes.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 h-12 px-7 rounded-xl bg-white text-[#1a1a2e] text-[15px] font-medium hover:bg-white/90 transition-colors"
          >
            Start free
            <ArrowRight size={16} />
          </Link>
          <a
            href="#examples"
            className="inline-flex items-center gap-2 h-12 px-7 rounded-xl border border-white/20 text-white text-[15px] font-medium hover:bg-white/10 transition-colors"
          >
            See real examples
          </a>
        </div>
      </div>
    </section>
  );
}
