import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function FAQContactStrip() {
  return (
    <section className="py-12 lg:py-20 bg-[#FAFAF8]">
      <div className="max-w-3xl mx-auto px-6">
        <div className="rounded-2xl border border-[#f0efed] bg-white p-8 sm:p-10 text-center">
          <h3 className="text-[#1a1a2e] text-2xl sm:text-3xl font-semibold tracking-[-0.02em] mb-3">
            Still have questions?
          </h3>
          <p className="text-[#6b7280] text-base leading-relaxed mb-8 max-w-md mx-auto">
            Try VOVV with 20 free credits, or get in touch — we usually reply within a day.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full bg-[#1a1a2e] text-white text-base font-semibold hover:bg-[#2a2a3e] transition-colors"
            >
              Start free
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full border border-[#d4d4d4] text-[#1a1a2e] text-base font-semibold hover:bg-[#f5f5f3] transition-colors"
            >
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
