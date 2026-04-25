import { Link } from 'react-router-dom';
import { ArrowRight, Library, Sparkles, Users } from 'lucide-react';

const CARDS = [
  {
    Icon: Library,
    eyebrow: '1600+ scenes',
    title: 'Scene Library',
    text: 'Browse every visual direction across studio, lifestyle, editorial, and campaign styles.',
    href: '/product-visual-library',
    cta: 'Open the library',
  },
  {
    Icon: Sparkles,
    eyebrow: 'Presets',
    title: 'Explore',
    text: 'Real visuals from real brands. Click any preset and recreate it with your own product.',
    href: '/discover',
    cta: 'Explore presets',
  },
  {
    Icon: Users,
    eyebrow: 'Your cast',
    title: 'Brand Models',
    text: '40+ ready-to-shoot AI models — or train your own brand face and reuse it forever.',
    href: '/auth',
    cta: 'Start with a model',
  },
];

export function HowItWorksTriple() {
  return (
    <section className="py-16 lg:py-32 bg-[#f5f5f3]">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Where to start
          </p>
          <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
            Three doors into your first shoot.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {CARDS.map((c) => (
            <Link
              key={c.title}
              to={c.href}
              className="group flex flex-col bg-white rounded-3xl border border-[#f0efed] shadow-sm p-7 lg:p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#1a1a2e] text-white flex items-center justify-center mb-5">
                <c.Icon size={20} strokeWidth={1.75} />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-2">
                {c.eyebrow}
              </p>
              <h3 className="text-[#1a1a2e] text-xl font-semibold tracking-tight mb-3">{c.title}</h3>
              <p className="text-[#6b7280] text-sm leading-relaxed mb-6 flex-1">{c.text}</p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-2.5 transition-all">
                {c.cta}
                <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
