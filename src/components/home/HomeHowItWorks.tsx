import { useScrollReveal } from '@/hooks/useScrollReveal';

const steps = [
  {
    num: '01',
    title: 'Upload your product photo',
    text: 'Start with one clean image of your product.',
    mockColor: 'from-[#f5f0eb] to-[#e8e3dd]',
  },
  {
    num: '02',
    title: 'Choose what you want to create',
    text: 'Select product images, ad creatives, or video.',
    mockColor: 'from-amber-50 to-orange-50',
  },
  {
    num: '03',
    title: 'Generate and refine',
    text: 'Create multiple outputs, pick your favorites, and export.',
    mockColor: 'from-rose-50 to-pink-50',
  },
];

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
                {/* Text */}
                <div className={reversed ? 'lg:order-2' : ''}>
                  <span className="text-5xl lg:text-6xl font-semibold text-[#e8e7e4] block mb-4">
                    {step.num}
                  </span>
                  <h3 className="text-[#1a1a2e] text-2xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-[#6b7280] text-base leading-relaxed max-w-sm">{step.text}</p>
                </div>

                {/* Mock visual */}
                <div className={reversed ? 'lg:order-1' : ''}>
                  <div className={`w-full aspect-[4/3] rounded-3xl bg-gradient-to-br ${step.mockColor} shadow-sm`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
