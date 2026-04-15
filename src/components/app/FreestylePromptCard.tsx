import { ArrowRight, ArrowUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const PROMPT_TEXT = 'Shoot my crop top on a court, studio, and café';
const CHAR_COUNT = PROMPT_TEXT.length;

const RESULT_PILLS = ['Studio', 'Court', 'Café'] as const;

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
        'relative w-full overflow-hidden bg-gradient-to-b from-muted/30 to-background flex flex-col items-center justify-center',
        mobileCompact ? 'aspect-[2/3] px-3 py-4 gap-3' : 'aspect-[3/4] px-5 py-6 gap-4',
      )}>
        {/* Ambient glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        {/* Prompt input bar */}
        <div className={cn(
          'relative z-10 w-full rounded-2xl border border-border/30 bg-muted/40 backdrop-blur-sm flex flex-col',
          mobileCompact ? 'p-2.5 min-h-[60px]' : 'p-3.5 min-h-[80px]',
        )}>
          {/* Typewriter text */}
          <div className="flex-1 flex items-start">
            <span className={cn(
              'freestyle-typewriter text-foreground/80 leading-relaxed',
              mobileCompact ? 'text-[10px]' : 'text-xs',
            )}>
              {PROMPT_TEXT}
            </span>
          </div>

          {/* Send icon */}
          <div className="flex justify-end mt-1">
            <div className={cn(
              'rounded-lg bg-primary/10 flex items-center justify-center freestyle-send-fade',
              mobileCompact ? 'w-5 h-5' : 'w-6 h-6',
            )}>
              <ArrowUp className={cn('text-primary/50', mobileCompact ? 'w-2.5 h-2.5' : 'w-3 h-3')} />
            </div>
          </div>
        </div>

        {/* Result pills */}
        <div className="relative z-10 flex items-center justify-center gap-2">
          {RESULT_PILLS.map((label, i) => (
            <span
              key={label}
              className={cn(
                'rounded-full border border-border/20 bg-muted/20 text-foreground/60 font-medium freestyle-pill-in',
                mobileCompact ? 'px-2 py-0.5 text-[8px]' : 'px-3 py-1 text-[10px]',
              )}
              style={{
                animationDelay: `${3.2 + i * 0.3}s`,
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Content area */}
      <div className={cn('flex flex-col gap-1 flex-1', mobileCompact ? 'p-2' : 'p-4')}>
        <h3 className={cn('font-bold tracking-tight leading-tight', mobileCompact ? 'text-[11px]' : 'text-sm')}>
          Freestyle Studio
        </h3>
        {!mobileCompact && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            Type anything. Get styled visuals.
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
            Start Creating
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes freestyle-type {
          from { width: 0; }
          to { width: 100%; }
        }
        @keyframes freestyle-blink {
          0%, 100% { border-color: hsl(var(--primary)); }
          50% { border-color: transparent; }
        }
        @keyframes freestyle-pill-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes freestyle-send-in {
          0%, 60% { opacity: 0; }
          80%, 100% { opacity: 1; }
        }
        .freestyle-typewriter {
          display: inline-block;
          overflow: hidden;
          white-space: nowrap;
          width: 0;
          border-right: 2px solid hsl(var(--primary));
          animation:
            freestyle-type 3s steps(${CHAR_COUNT}, end) forwards,
            freestyle-blink 0.75s step-end infinite;
        }
        .freestyle-pill-in {
          opacity: 0;
          animation: freestyle-pill-in 0.4s ease-out forwards;
        }
        .freestyle-send-fade {
          opacity: 0;
          animation: freestyle-send-in 3.5s ease-out forwards;
        }
      `}</style>
    </Card>
  );
}
