import { Camera, Tent, Megaphone, BarChart3, Shield, FileOutput } from 'lucide-react';

const teamMembers = [
  {
    icon: Camera,
    title: 'Product Photographer',
    description: 'Clean studio shots, white backgrounds, and detail-perfect product images for every listing.',
  },
  {
    icon: Tent,
    title: 'Lifestyle Photographer',
    description: 'Contextual scenes that place your products in real-world environments — cafes, homes, outdoors.',
  },
  {
    icon: Megaphone,
    title: 'Ad Creative Specialist',
    description: 'Scroll-stopping ad visuals optimized for social feeds, stories, and paid campaigns.',
  },
  {
    icon: BarChart3,
    title: 'CRO Visual Optimizer',
    description: 'Multiple angles and styles to A/B test which images drive the highest conversion rates.',
  },
  {
    icon: Shield,
    title: 'Brand Consistency Manager',
    description: 'Ensures every image matches your brand tone, lighting, and composition rules — automatically.',
  },
  {
    icon: FileOutput,
    title: 'Format & Export Assistant',
    description: 'Delivers images in every aspect ratio you need — square for feeds, portrait for stories, landscape for banners.',
  },
];

export function StudioTeamSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-4">
            Meet Your AI Studio Team
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Six specialized roles working together to produce professional visuals — all powered by AI, all on autopilot.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member) => (
            <div
              key={member.title}
              className="p-6 rounded-2xl border border-border bg-card hover:shadow-md hover:border-primary/20 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <member.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">{member.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{member.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
