import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Upload, Image, Download } from 'lucide-react';

const steps = [
  {
    num: '01',
    title: 'Upload your product photo',
    text: 'Start with one clean image of your product.',
  },
  {
    num: '02',
    title: 'Choose what you want to create',
    text: 'Select product images, ad creatives, or video.',
  },
  {
    num: '03',
    title: 'Generate and refine',
    text: 'Create multiple outputs, pick your favorites, and export.',
  },
];

function StepVisual({ index }: { index: number }) {
  if (index === 0) {
    // Upload zone mockup
    return (
      <div className="w-full aspect-[4/3] rounded-3xl bg-white border border-[#e8e7e4] shadow-sm p-6 flex items-center justify-center">
        <div className="w-full h-full rounded-2xl border-2 border-dashed border-[#d4d4d4] flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#f5f5f3] flex items-center justify-center">
            <Upload size={22} className="text-[#94a3b8]" />
          </div>
          <div className="space-y-1.5 text-center">
            <div className="h-2.5 w-28 rounded-full bg-[#e8e7e4] mx-auto" />
            <div className="h-2 w-20 rounded-full bg-[#f0efed] mx-auto" />
          </div>
        </div>
      </div>
    );
  }
  if (index === 1) {
    // Selection cards mockup
    return (
      <div className="w-full aspect-[4/3] rounded-3xl bg-white border border-[#e8e7e4] shadow-sm p-5 flex flex-col gap-3">
        <div className="h-2.5 w-24 rounded-full bg-[#e8e7e4]" />
        <div className="flex-1 grid grid-cols-3 gap-3">
          {['from-amber-100 to-orange-50', 'from-rose-100 to-pink-50', 'from-sky-100 to-blue-50'].map((c, i) => (
            <div
              key={i}
              className={`rounded-xl bg-gradient-to-br ${c} border-2 ${i === 0 ? 'border-[#1a1a2e]' : 'border-transparent'} flex flex-col items-center justify-center gap-2 p-2`}
            >
              <Image size={16} className="text-[#94a3b8]" />
              <div className="h-1.5 w-10 rounded-full bg-[#1a1a2e]/10" />
            </div>
          ))}
        </div>
        <div className="h-9 rounded-xl bg-[#1a1a2e] flex items-center justify-center">
          <div className="h-2 w-16 rounded-full bg-white/40" />
        </div>
      </div>
    );
  }
  // Gallery grid mockup
  return (
    <div className="w-full aspect-[4/3] rounded-3xl bg-white border border-[#e8e7e4] shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="h-2.5 w-20 rounded-full bg-[#e8e7e4]" />
        <Download size={14} className="text-[#94a3b8]" />
      </div>
      <div className="flex-1 grid grid-cols-2 gap-2">
        {['from-amber-50 to-orange-50', 'from-rose-50 to-pink-50', 'from-emerald-50 to-teal-50', 'from-sky-50 to-blue-50'].map((c, i) => (
          <div key={i} className={`rounded-xl bg-gradient-to-br ${c} border border-white/60 shadow-inner flex items-center justify-center`}>
            <div className="w-8 h-12 rounded-lg bg-white/40 shadow-inner" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function HomeHowItWorks() {
  const { ref, visible } = useScrollReveal();

  return (
    <section className="py-24 lg:py-32" id="how-it-works">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
            How it works
          </h2>
          <p className="text-[#6b7280] text-lg leading-relaxed">
            Go from product photo to ready-to-use creative in three simple steps.
          </p>
        </div>

        <div ref={ref} className="space-y-20 lg:space-y-28">
          {steps.map((step, i) => {
            const reversed = i % 2 === 1;
            return (
              <div
                key={step.num}
                className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center transition-all duration-700 ${
                  visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${i * 200}ms` }}
              >
                <div className={reversed ? 'lg:order-2' : ''}>
                  <span className="text-5xl lg:text-6xl font-semibold text-[#e8e7e4] block mb-4">
                    {step.num}
                  </span>
                  <h3 className="text-[#1a1a2e] text-2xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-[#6b7280] text-base leading-relaxed max-w-sm">{step.text}</p>
                </div>
                <div className={reversed ? 'lg:order-1' : ''}>
                  <StepVisual index={i} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
