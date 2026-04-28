import { Sparkles } from 'lucide-react';

export interface VOVVDifferenceSectionProps {
  eyebrow?: string;
  headline: string;
  copy: string;
  bullets: string[];
  background?: 'background' | 'soft';
}

export function VOVVDifferenceSection({
  eyebrow = 'Where VOVV.AI is different',
  headline,
  copy,
  bullets,
  background = 'background',
}: VOVVDifferenceSectionProps) {
  const bg = background === 'soft' ? 'bg-[#f5f5f3]' : 'bg-background';

  return (
    <section className={`py-16 lg:py-32 ${bg}`}>
      <div className="max-w-[1100px] mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 mb-5">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#1a1a2e] text-white">
                <Sparkles size={13} strokeWidth={2} />
              </span>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {eyebrow}
              </p>
            </div>
            <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl lg:text-[44px] font-semibold tracking-tight leading-[1.1]">
              {headline}
            </h2>
            <p className="mt-5 text-[#475569] text-base sm:text-lg leading-relaxed">
              {copy}
            </p>
          </div>

          <ul className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {bullets.map((item) => (
              <li
                key={item}
                className="bg-white rounded-2xl border border-[#f0efed] shadow-sm p-5 text-[#1a1a2e] text-[15px] leading-relaxed"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
