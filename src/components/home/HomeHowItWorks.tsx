import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Upload, Download } from 'lucide-react';
import { getOptimizedUrl } from '@/lib/imageOptimization';

const SUPABASE_PUBLIC =
  'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/product-uploads';
const PREVIEW = (id: string) =>
  `${SUPABASE_PUBLIC}/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/${id}.jpg`;

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

// Step 1 — single original product
const STEP1_ORIGINAL = PREVIEW('1776523219756-c5vnc7'); // Ghost mannequin swimwear

// Step 2 — 3 scene options to "pick"
const STEP2_OPTIONS = [
  { src: PREVIEW('1776524131703-gvh4bb'), label: 'Sunbathing' },
  { src: PREVIEW('1776524132929-q8upyp'), label: 'Yacht Bow' },
  { src: PREVIEW('1776574228066-oyklfz'), label: 'Golden Horizon' },
];

// Step 3 — final 4 generated outputs
const STEP3_OUTPUTS = [
  PREVIEW('1776524131703-gvh4bb'),
  PREVIEW('1776524132929-q8upyp'),
  PREVIEW('1776574228066-oyklfz'),
  PREVIEW('1776524128011-dcnlpo'),
];

function StepVisual({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="w-full aspect-[3/2] rounded-3xl bg-white border border-[#e8e7e4] shadow-sm p-5 sm:p-6 flex gap-4">
        <div className="flex-1 rounded-2xl overflow-hidden bg-muted/30 relative">
          <img
            src={getOptimizedUrl(STEP1_ORIGINAL, { quality: 60 })}
            alt="Uploaded product"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <span className="absolute top-2 right-2 text-[10px] font-semibold uppercase tracking-wider bg-primary/90 text-primary-foreground px-2 py-0.5 rounded-full">
            Original
          </span>
        </div>
        <div className="w-32 sm:w-40 rounded-2xl border-2 border-dashed border-[#d4d4d4] flex flex-col items-center justify-center gap-3 px-3">
          <div className="w-12 h-12 rounded-2xl bg-[#f5f5f3] flex items-center justify-center">
            <Upload size={20} className="text-[#94a3b8]" />
          </div>
          <div className="space-y-1.5 text-center w-full">
            <div className="h-2 w-3/4 rounded-full bg-[#e8e7e4] mx-auto" />
            <div className="h-1.5 w-1/2 rounded-full bg-[#f0efed] mx-auto" />
          </div>
        </div>
      </div>
    );
  }
  if (index === 1) {
    return (
      <div className="w-full aspect-[3/2] rounded-3xl bg-white border border-[#e8e7e4] shadow-sm p-5 sm:p-6 flex flex-col gap-3">
        <div className="h-2.5 w-28 rounded-full bg-[#e8e7e4]" />
        <div className="flex-1 grid grid-cols-3 gap-3">
          {STEP2_OPTIONS.map((opt, i) => (
            <div
              key={i}
              className={`rounded-xl overflow-hidden border-2 ${i === 0 ? 'border-[#1a1a2e]' : 'border-transparent'} relative bg-muted/30`}
            >
              <img
                src={getOptimizedUrl(opt.src, { quality: 60 })}
                alt={opt.label}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
        <div className="h-10 rounded-xl bg-[#1a1a2e] flex items-center justify-center">
          <span className="text-[12px] font-medium text-white/90 tracking-wide">Generate</span>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full aspect-[3/2] rounded-3xl bg-white border border-[#e8e7e4] shadow-sm p-5 sm:p-6 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="h-2.5 w-24 rounded-full bg-[#e8e7e4]" />
        <Download size={16} className="text-[#94a3b8]" />
      </div>
      <div className="flex-1 grid grid-cols-2 gap-3">
        {STEP3_OUTPUTS.map((src, i) => (
          <div key={i} className="rounded-xl overflow-hidden bg-muted/30 relative">
            <img
              src={getOptimizedUrl(src, { quality: 60 })}
              alt={`Generated output ${i + 1}`}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function HomeHowItWorks() {
  const { ref, visible } = useScrollReveal();

  return (
    <section className="py-16 lg:py-32" id="how-it-works">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-14 lg:mb-20">
          <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
            How it works
          </h2>
          <p className="text-[#6b7280] text-lg leading-relaxed">
            Go from product photo to ready-to-use creative in three simple steps.
          </p>
        </div>

        <div ref={ref} className="space-y-16 lg:space-y-28">
          {steps.map((step, i) => {
            const reversed = i % 2 === 1;
            return (
              <div
                key={step.num}
                className={`grid lg:grid-cols-2 gap-8 lg:gap-20 items-center transition-all duration-700 ${
                  visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${i * 200}ms` }}
              >
                <div className={`order-2 lg:order-none ${reversed ? 'lg:order-2' : ''}`}>
                  <span className="text-5xl lg:text-6xl font-semibold text-[#e8e7e4] block mb-4">
                    {step.num}
                  </span>
                  <h3 className="text-[#1a1a2e] text-2xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-[#6b7280] text-base leading-relaxed max-w-sm">{step.text}</p>
                </div>
                <div className={`order-1 lg:order-none ${reversed ? 'lg:order-1' : ''}`}>
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
