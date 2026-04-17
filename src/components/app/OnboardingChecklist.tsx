import { useNavigate } from 'react-router-dom';
import { Check, Upload, Palette, Sparkles, Wand2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TEAM_MEMBERS } from '@/data/teamData';
import { TeamAvatarHoverCard } from '@/components/landing/TeamAvatarHoverCard';
import { getOptimizedUrl } from '@/lib/imageOptimization';

const findMember = (name: string) => TEAM_MEMBERS.find(m => m.name === name)!;

interface OnboardingChecklistProps {
  productCount: number;
  brandProfileCount: number;
  jobCount: number;
  freestyleCount: number;
}

const steps = [
  {
    key: 'products',
    title: 'Upload Your First Product',
    description: 'Add a product image to start generating visuals.',
    icon: Upload,
    path: '/app/products/new',
    cta: 'Add Product',
    memberName: 'Sophia',
  },
  {
    key: 'brand',
    title: 'Create Your Brand Profile',
    description: 'Set your visual style - tone, lighting, colors.',
    icon: Palette,
    path: '/app/brand-profiles',
    cta: 'Go to Brand Profiles',
    memberName: 'Sienna',
  },
  {
    key: 'generate',
    title: 'Generate Your First Visual Set',
    description: 'Product Photos or Virtual Try-On - your choice.',
    icon: Sparkles,
    path: '/app/workflows',
    cta: 'Open Visual Studio',
    memberName: 'Kenji',
  },
  {
    key: 'freestyle',
    title: 'Try Freestyle Studio',
    description: 'Pick a product, model & scene - generate in one click.',
    icon: Wand2,
    path: '/app/freestyle',
    cta: 'Try Freestyle',
    memberName: 'Amara',
  },
] as const;

export function OnboardingChecklist({ productCount, brandProfileCount, jobCount, freestyleCount }: OnboardingChecklistProps) {
  const navigate = useNavigate();

  const completionMap: Record<string, boolean> = {
    products: productCount > 0,
    brand: brandProfileCount > 0,
    generate: jobCount > 0,
    freestyle: freestyleCount > 0,
  };

  const completedCount = Object.values(completionMap).filter(Boolean).length;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Progress bar */}
      <div className="h-1 w-full bg-muted">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${(completedCount / steps.length) * 100}%` }}
        />
      </div>

      <div className="px-6 pt-3 pb-5">
        <div className="space-y-0">
          {steps.map((step, index) => {
            const done = completionMap[step.key];
            const isLast = index === steps.length - 1;
            const member = findMember(step.memberName);
            return (
              <div
                key={step.key}
                className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 py-5 sm:py-4 ${!isLast ? 'border-b border-border' : ''}`}
              >
                {/* Top row on mobile: number + avatar + title */}
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Step number circle */}
                  <div className={`w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    done
                      ? 'bg-primary/10 text-primary'
                      : 'bg-primary text-primary-foreground'
                  }`}>
                    {done ? <Check className="w-4 h-4" /> : String(index + 1).padStart(2, '0')}
                  </div>

                  {/* Team member avatar */}
                  <TeamAvatarHoverCard member={member} side="right">
                    <button className="focus:outline-none flex-shrink-0">
                      <div className="w-14 h-14 sm:w-12 sm:h-12 rounded-xl overflow-hidden border border-border">
                        <img
                          src={getOptimizedUrl(member.avatar, { quality: 60 })}
                          alt={member.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                        />
                      </div>
                    </button>
                  </TeamAvatarHoverCard>

                  {/* Title + description inline on mobile */}
                  <div className="flex-1 min-w-0 sm:hidden">
                    <h3 className={`text-sm font-semibold ${done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                      {step.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                      {member.name} · {member.role}
                    </p>
                  </div>
                </div>

                {/* Desktop: title + description */}
                <div className="hidden sm:block flex-1 min-w-0">
                  <h3 className={`text-sm font-semibold ${done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                    {step.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                    {member.name} · {member.role}
                  </p>
                </div>

                {!done && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full sm:w-auto rounded-full font-semibold gap-1 flex-shrink-0 min-h-[44px] sm:min-h-0"
                    onClick={() => navigate(step.path)}
                  >
                    {step.cta}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground pt-4 border-t border-border mt-1">
          {completedCount} of {steps.length} complete
        </p>
      </div>
    </div>
  );
}
