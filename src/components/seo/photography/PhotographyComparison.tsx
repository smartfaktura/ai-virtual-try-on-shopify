import { Check, X } from 'lucide-react';

const traditional = [
  'Expensive production',
  'Models, locations, props, photographers',
  'Slow turnaround',
  'Hard to test many concepts',
  'New shoot needed for every campaign',
];

const vovv = [
  'Create from one product photo',
  'Generate multiple visual directions',
  'Fast campaign testing',
  'Product page, ads, social, and launch visuals',
  'Built for e-commerce teams',
];

export function PhotographyComparison() {
  return (
    <section className="py-16 lg:py-32 bg-[#f5f5f3]">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Comparison
          </p>
          <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
            Create product visuals without planning a full photoshoot
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
          <div className="bg-white rounded-3xl border border-[#f0efed] shadow-sm p-7 lg:p-9">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-semibold mb-2">
              Traditional photoshoot
            </p>
            <h3 className="text-[#1a1a2e] text-xl font-semibold mb-6">Slow, expensive, hard to scale</h3>
            <ul className="space-y-3">
              {traditional.map((t) => (
                <li key={t} className="flex items-start gap-3 text-[#374151] text-[15px]">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-foreground/5 text-foreground/40 flex items-center justify-center shrink-0">
                    <X size={12} strokeWidth={2.5} />
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#1a1a2e] rounded-3xl shadow-sm p-7 lg:p-9 text-white">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/60 font-semibold mb-2">
              VOVV.AI
            </p>
            <h3 className="text-white text-xl font-semibold mb-6">Fast, flexible, brand-ready</h3>
            <ul className="space-y-3">
              {vovv.map((t) => (
                <li key={t} className="flex items-start gap-3 text-white/90 text-[15px]">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
