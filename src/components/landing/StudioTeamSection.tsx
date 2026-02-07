import { useState } from 'react';
import { CheckCircle2, Zap, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Team member avatars — using our model library portraits
import avatarSophia from '@/assets/models/model-female-average-european.jpg';
import avatarAmara from '@/assets/models/model-female-athletic-black.jpg';
import avatarKenji from '@/assets/models/model-male-athletic-japanese.jpg';
import avatarYuki from '@/assets/models/model-female-slim-asian.jpg';
import avatarOmar from '@/assets/models/model-male-slim-middleeast.jpg';
import avatarSienna from '@/assets/models/model-female-average-irish.jpg';

interface TeamMember {
  name: string;
  role: string;
  specialty: string;
  avatar: string;
  gradient: string;
  borderAccent: string;
}

const TEAM: TeamMember[] = [
  {
    name: 'Sophia',
    role: 'Product Photographer',
    specialty: 'E-commerce listings',
    avatar: avatarSophia,
    gradient: 'from-emerald-500 to-teal-600',
    borderAccent: 'hover:ring-emerald-400/40',
  },
  {
    name: 'Amara',
    role: 'Lifestyle Photographer',
    specialty: 'Real-world context',
    avatar: avatarAmara,
    gradient: 'from-amber-500 to-orange-600',
    borderAccent: 'hover:ring-amber-400/40',
  },
  {
    name: 'Kenji',
    role: 'Campaign Art Director',
    specialty: 'Seasonal & promos',
    avatar: avatarKenji,
    gradient: 'from-blue-500 to-indigo-600',
    borderAccent: 'hover:ring-blue-400/40',
  },
  {
    name: 'Yuki',
    role: 'Ad Creative Specialist',
    specialty: 'Scroll-stopping ads',
    avatar: avatarYuki,
    gradient: 'from-violet-500 to-purple-600',
    borderAccent: 'hover:ring-violet-400/40',
  },
  {
    name: 'Omar',
    role: 'CRO Visual Optimizer',
    specialty: 'Conversions & CTR',
    avatar: avatarOmar,
    gradient: 'from-rose-500 to-pink-600',
    borderAccent: 'hover:ring-rose-400/40',
  },
  {
    name: 'Sienna',
    role: 'Brand Consistency Manager',
    specialty: 'Style & guidelines',
    avatar: avatarSienna,
    gradient: 'from-cyan-500 to-sky-600',
    borderAccent: 'hover:ring-cyan-400/40',
  },
];

const TASK_EXAMPLES = [
  {
    title: 'Monthly Ad Refresh',
    assignees: ['Sophia', 'Yuki', 'Omar'],
    output: '20 ad-ready visuals',
    time: '~12s',
  },
  {
    title: 'New Product Launch',
    assignees: ['Sophia', 'Amara', 'Sienna'],
    output: '15 listing images',
    time: '~8s',
  },
];

function TeamCard({ member, isHighlighted }: { member: TeamMember; isHighlighted: boolean }) {
  return (
    <div
      className={`group relative rounded-2xl overflow-hidden transition-all duration-300 cursor-default ${
        isHighlighted
          ? 'ring-2 ring-primary shadow-lg scale-[1.02]'
          : `ring-1 ring-border hover:ring-2 ${member.borderAccent} hover:shadow-md hover:scale-[1.01]`
      }`}
    >
      {/* Gradient background */}
      <div className={`bg-gradient-to-br ${member.gradient} p-5 pb-16 relative`}>
        {/* Status indicator */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse-subtle" />
          <span className="text-[10px] font-semibold text-white/90 uppercase tracking-wider">
            Online
          </span>
        </div>
        {/* Role title */}
        <h3 className="text-sm font-bold text-white leading-snug">{member.role}</h3>
        <p className="text-xs text-white/75 mt-0.5">{member.specialty}</p>
      </div>

      {/* Avatar — overlapping gradient and white area */}
      <div className="relative bg-card px-5 pb-4 pt-10">
        <div className="absolute -top-8 left-5">
          <div className="w-16 h-16 rounded-full border-[3px] border-card overflow-hidden shadow-lg">
            <img
              src={member.avatar}
              alt={member.name}
              className="w-full h-full object-cover object-top"
              loading="lazy"
            />
          </div>
        </div>
        <p className="text-base font-bold text-foreground">{member.name}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <Zap className="w-3 h-3 text-primary" />
          <span className="text-[10px] text-muted-foreground font-medium">AI-Powered</span>
        </div>
      </div>
    </div>
  );
}

export function StudioTeamSection() {
  const [activeTask, setActiveTask] = useState(0);
  const currentTask = TASK_EXAMPLES[activeTask];

  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6">
          <Badge variant="secondary" className="mb-4 text-xs tracking-wide uppercase">
            Your AI Studio Team
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
            6 AI Professionals. Zero Overhead.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Each specialist has a name, a role, and a skill — working together on every visual
            you create. Like a full creative agency, but instant.
          </p>
        </div>

        {/* Task delegation — floating card */}
        <div className="max-w-xl mx-auto mb-14">
          <div className="rounded-2xl border border-border bg-card shadow-sm p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Live Delegation
              </p>
              <div className="flex gap-1">
                {TASK_EXAMPLES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTask(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === activeTask ? 'bg-primary' : 'bg-border'
                    }`}
                    aria-label={`Task ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            <p className="text-sm font-bold text-foreground mb-3">
              "{currentTask.title}"
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {currentTask.assignees.map((name) => {
                const member = TEAM.find((t) => t.name === name);
                return (
                  <div
                    key={name}
                    className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5"
                  >
                    {member && (
                      <img
                        src={member.avatar}
                        alt={name}
                        className="w-5 h-5 rounded-full object-cover object-top"
                      />
                    )}
                    <span className="text-xs font-medium text-foreground">{name}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Output: <span className="font-medium text-foreground">{currentTask.output}</span>
              </span>
              <span>
                Completed in <span className="font-medium text-foreground">{currentTask.time}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Team grid — Sintra-style colorful cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5 mb-10">
          {TEAM.map((member) => (
            <TeamCard
              key={member.name}
              member={member}
              isHighlighted={currentTask.assignees.includes(member.name)}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button size="lg" className="gap-2" asChild>
            <a href="/auth">
              Meet Your Team <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
