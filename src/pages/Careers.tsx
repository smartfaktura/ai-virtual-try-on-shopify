import { PageLayout } from '@/components/landing/PageLayout';
import { SEOHead } from '@/components/SEOHead';
import { SITE_URL } from '@/lib/constants';
import { Rocket, Users, Palette, ArrowRight } from 'lucide-react';

const cultureValues = [
  {
    icon: Rocket,
    title: 'Ship fast, learn faster',
    description:
      'We believe in rapid iteration. Ship early, gather feedback, and improve relentlessly.',
  },
  {
    icon: Users,
    title: 'Remote-first culture',
    description:
      'Work from anywhere. Our team spans 8 time zones and we embrace async collaboration.',
  },
  {
    icon: Palette,
    title: 'Creativity meets engineering',
    description:
      'We sit at the intersection of art and technology. Every team member brings a creative lens.',
  },
];

const positions = [
  {
    title: 'Senior ML Engineer',
    team: 'AI / ML',
    location: 'Remote',
    type: 'Full-time',
    description:
      'Build and optimize our generative AI pipeline for product photography. Experience with diffusion models and image generation required.',
  },
  {
    title: 'Product Designer',
    team: 'Design',
    location: 'Remote',
    type: 'Full-time',
    description:
      'Design intuitive interfaces for our visual studio platform. Strong portfolio in SaaS or creative tools preferred.',
  },
  {
    title: 'Growth Lead',
    team: 'Marketing',
    location: 'Remote',
    type: 'Full-time',
    description:
      'Drive user acquisition and retention for VOVV.AI. Experience scaling B2B SaaS products from seed to Series A.',
  },
  {
    title: 'Full-Stack Engineer',
    team: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description:
      'Build features across our React frontend and serverless backend. TypeScript expertise and a passion for developer experience.',
  },
  {
    title: 'Customer Success Manager',
    team: 'Operations',
    location: 'Remote (US/EU)',
    type: 'Full-time',
    description:
      'Help e-commerce brands get the most from VOVV.AI. Strong communication skills and e-commerce background a plus.',
  },
];

export default function Careers() {
  return (
    <PageLayout>
      <SEOHead
        title="Careers at VOVV.AI — Join the Future of AI Photography"
        description="Join the VOVV.AI team. We're hiring engineers, designers, and marketers to build the future of AI-powered e-commerce photography."
        canonical={`${SITE_URL}/careers`}
      />

      <div className="bg-[#FAFAF8]">
        {/* Hero */}
        <section className="pt-20 pb-16 sm:pt-28 sm:pb-20">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Careers
            </p>
            <h1 className="text-foreground text-[2.5rem] sm:text-5xl lg:text-[3.5rem] leading-[1.08] font-semibold tracking-[-0.03em] mb-6">
              Build the future of visual commerce
            </h1>
            <p className="max-w-2xl mx-auto text-muted-foreground text-base sm:text-lg leading-relaxed">
              Join a small, passionate team reimagining how brands create product imagery. We're remote-first, creativity-driven, and growing fast.
            </p>
          </div>
        </section>

        {/* Culture */}
        <section className="py-16 sm:py-20 bg-[#f5f5f3]">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-12">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Why VOVV
              </p>
              <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl font-semibold tracking-tight">
                A studio that feels like a startup
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {cultureValues.map((v) => (
                <div
                  key={v.title}
                  className="bg-white rounded-2xl border border-[#f0efed] shadow-sm p-7"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                    <v.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-[#1a1a2e] text-[17px] font-semibold tracking-tight mb-2">
                    {v.title}
                  </h3>
                  <p className="text-[15px] text-foreground/70 leading-relaxed">{v.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Open positions */}
        <section className="py-16 sm:py-24" id="positions">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-12">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Open roles
              </p>
              <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
                {positions.length} positions open
              </h2>
              <p className="text-muted-foreground text-base">All remote-friendly · Full-time</p>
            </div>

            <div className="space-y-3">
              {positions.map((pos) => (
                <div
                  key={pos.title}
                  className="bg-white rounded-2xl border border-[#f0efed] shadow-sm hover:shadow-md transition-shadow p-7"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-3">
                    <div>
                      <h3 className="text-[#1a1a2e] text-[17px] font-semibold tracking-tight mb-1.5">
                        {pos.title}
                      </h3>
                      <p className="text-[13px] text-muted-foreground">
                        {pos.team} · {pos.location} · {pos.type}
                      </p>
                    </div>
                    <a
                      href={`mailto:hello@vovv.ai?subject=Application: ${pos.title}`}
                      className="inline-flex items-center justify-center gap-1.5 h-10 px-5 rounded-full border border-border text-sm font-semibold text-foreground hover:bg-secondary transition-colors shrink-0"
                    >
                      Apply
                      <ArrowRight size={14} />
                    </a>
                  </div>
                  <p className="text-[15px] text-foreground/70 leading-relaxed">{pos.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 bg-white rounded-2xl border border-[#f0efed] shadow-sm p-8 text-center">
              <h3 className="text-[#1a1a2e] text-[17px] font-semibold tracking-tight mb-2">
                Don't see your role?
              </h3>
              <p className="text-[15px] text-foreground/70 mb-5 leading-relaxed">
                We're always looking for exceptional people. Send your resume and tell us how you'd contribute.
              </p>
              <a
                href="mailto:hello@vovv.ai"
                className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full border border-border text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
              >
                Send open application
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* Final dark CTA */}
      <section className="py-16 lg:py-28 bg-[#1a1a2e] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#475569] blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#64748b] blur-3xl" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50 mb-4">
            Build with us
          </p>
          <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-5">
            Help us shape what's next
          </h2>
          <p className="text-[#9ca3af] text-base sm:text-lg leading-relaxed mb-10">
            Open roles, open inboxes. We read everything.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4">
            <a
              href="#positions"
              className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full bg-white text-[#1a1a2e] text-base font-semibold hover:bg-white/90 transition-colors w-full sm:w-auto"
            >
              See open roles
              <ArrowRight size={16} />
            </a>
            <a
              href="mailto:hello@vovv.ai"
              className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full border border-white/20 text-white text-base font-semibold hover:bg-white/10 transition-colors w-full sm:w-auto"
            >
              Email us
            </a>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
