import { Sparkles, ArrowRight, Zap, Sun, Coffee } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const PROMPT_TEXT = 'Shoot my crop top on a court, studio, and café';

const DIRECTIONS = [
  { label: 'Clean Studio', sub: 'subtle light', icon: Sun },
  { label: 'Sport Motion', sub: 'bold energy', icon: Zap },
  { label: 'Warm Social', sub: 'lifestyle feel', icon: Coffee },
] as const;

interface Props {
  onSelect: () => void;
  mobileCompact?: boolean;
}

export function FreestylePromptCard({ onSelect, mobileCompact }: Props) {
  return (
    <Card
      className={cn(
        'group relative overflow-hidden border transition-all duration-300 flex flex-col cursor-pointer',
        'hover:shadow-lg hover:border-primary/30',
      )}
      onClick={onSelect}
    >
      {/* Visual area */}
      <div className={cn(
        'relative w-full overflow-hidden bg-gradient-to-b from-muted/20 to-background flex flex-col items-center justify-center gap-3',
        mobileCompact ? 'aspect-[2/3] px-3 py-4' : 'aspect-[3/4] px-5 py-6',
      )}>
        {/* Ambient glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        {/* Prompt strip */}
        <div className="relative z-10 w-full">
          <div className="backdrop-blur-md bg-background/60 border border-border/30 rounded-xl px-3 py-2 flex items-center gap-2 overflow-hidden">
            <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
            <p className={cn(
              'text-foreground/80 leading-tight truncate freestyle-shimmer-text',
              mobileCompact ? 'text-[10px]' : 'text-xs',
            )}>
              {PROMPT_TEXT}
            </p>
          </div>
        </div>

        {/* Branching SVG */}
        <svg
          viewBox="0 0 200 40"
          className={cn('w-full max-w-[180px] z-10', mobileCompact ? 'h-6' : 'h-8')}
          fill="none"
          aria-hidden
        >
          {[
            'M100,0 C100,20 30,20 30,40',
            'M100,0 L100,40',
            'M100,0 C100,20 170,20 170,40',
          ].map((d, i) => (
            <path
              key={i}
              d={d}
              className="stroke-primary/20"
              strokeWidth="1"
              strokeDasharray="80"
              strokeDashoffset="80"
              style={{
                animation: `freestyle-draw 0.8s ease-out ${0.4 + i * 0.3}s forwards`,
              }}
            />
          ))}
        </svg>

        {/* Output direction cards */}
        <div className="relative z-10 grid grid-cols-3 gap-1.5 w-full">
          {DIRECTIONS.map((dir, i) => {
            const Icon = dir.icon;
            return (
              <div
                key={dir.label}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-lg border border-border/40 bg-muted/30 opacity-0',
                  mobileCompact ? 'px-1.5 py-2' : 'px-2 py-2.5',
                )}
                style={{
                  animation: `freestyle-card-in 0.5s ease-out ${0.5 + i * 0.3}s forwards`,
                }}
              >
                <Icon className={cn('text-primary/60', mobileCompact ? 'w-3 h-3' : 'w-3.5 h-3.5')} />
                <span className={cn('font-semibold text-foreground/80 text-center leading-tight', mobileCompact ? 'text-[8px]' : 'text-[10px]')}>
                  {dir.label}
                </span>
                {!mobileCompact && (
                  <span className="text-[8px] text-muted-foreground leading-tight">{dir.sub}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content area */}
      <div className={cn('flex flex-col gap-1 flex-1', mobileCompact ? 'p-2' : 'p-4')}>
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
          <h3 className={cn('font-bold tracking-tight leading-tight', mobileCompact ? 'text-[11px]' : 'text-sm')}>
            Freestyle Studio
          </h3>
        </div>
        {!mobileCompact && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            Turn a simple prompt into styled, brand-ready visuals
          </p>
        )}
        <div className="pt-1 mt-auto">
          <Button
            size="sm"
            variant="outline"
            className={cn(
              'rounded-full font-semibold gap-1.5 w-full border-primary/20 hover:bg-primary hover:text-primary-foreground transition-colors',
              mobileCompact ? 'h-8 px-3 text-xs' : 'h-8 px-5',
            )}
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
          >
            Create with Prompt
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes freestyle-draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes freestyle-card-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes freestyle-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .freestyle-shimmer-text {
          background: linear-gradient(90deg, hsl(var(--foreground)/0.8) 40%, hsl(var(--primary)) 50%, hsl(var(--foreground)/0.8) 60%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: freestyle-shimmer 3s linear infinite;
        }
      `}</style>
    </Card>
  );
}
