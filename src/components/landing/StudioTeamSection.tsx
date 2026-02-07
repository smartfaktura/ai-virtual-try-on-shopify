import { Camera, Tent, Clapperboard, Megaphone, BarChart3, Shield, CheckCircle2 } from 'lucide-react';

const teamMembers = [
  {
    icon: Camera,
    title: 'Product Photographer',
    description: 'Clean listing visuals',
  },
  {
    icon: Tent,
    title: 'Lifestyle Photographer',
    description: 'Real-world context shots',
  },
  {
    icon: Clapperboard,
    title: 'Campaign Art Director',
    description: 'Seasonal and promo visuals',
  },
  {
    icon: Megaphone,
    title: 'Ad Creative Specialist',
    description: 'Scroll-stopping ad formats',
  },
  {
    icon: BarChart3,
    title: 'CRO Visual Optimizer',
    description: 'Compositions that convert',
  },
  {
    icon: Shield,
    title: 'Brand Consistency Manager',
    description: 'Locks your look',
  },
];

const taskExamples = [
  {
    title: 'Monthly Ad Refresh',
    roles: ['Product Photographer', 'Ad Creative Specialist', 'CRO Optimizer'],
    time: '~12 seconds',
  },
  {
    title: 'Launch Product Listing Set',
    roles: ['Product Photographer', 'Brand Manager', 'Export Assistant'],
    time: '~8 seconds',
  },
];

export function StudioTeamSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-4">
            A Full Studio Team — Working in Seconds
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Photographers, designers, and CRO experts collaborate behind the scenes to create brand-ready visuals. You just choose what you're making.
          </p>
        </div>

        {/* Task delegation examples — shown first for impact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto mb-12">
          {taskExamples.map((task) => (
            <div
              key={task.title}
              className="rounded-2xl border border-border bg-muted/30 p-5 sm:p-6"
            >
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Example Task
              </p>
              <p className="text-sm font-bold text-foreground mb-4">
                {task.title}
              </p>
              <div className="flex flex-wrap gap-3 mb-4">
                {task.roles.map((role) => (
                  <div key={role} className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    {role}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Completed in {task.time}
              </p>
            </div>
          ))}
        </div>

        {/* Team cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {teamMembers.map((member) => (
            <div
              key={member.title}
              className="p-5 rounded-2xl border border-border bg-card hover:shadow-md hover:border-primary/20 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  <member.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Ready
                </span>
              </div>
              <h3 className="text-sm font-bold text-foreground mb-1">{member.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{member.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
