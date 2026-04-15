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
        'relative w-full overflow-hidden bg-gradient-to-b from-muted/20 to-background flex flex-col items-center justify-center',
        mobileCompact ? 'px-3 py-5 gap-3' : 'px-5 py-8 gap-5',
      )}>
        {/* Ambient glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 rounded-full bg-primary/[0.08] blur-3xl pointer-events-none freestyle-glow" />

        {/* Prompt input bar */}
        <div className={cn(
          'freestyle-loop relative z-10 w-full rounded-2xl border border-border/50 bg-muted/50 backdrop-blur-sm shadow-sm flex flex-col',
          mobileCompact ? 'p-3 min-h-[70px]' : 'p-4 min-h-[90px]',
        )}>
          {/* Typewriter text */}
          <div className="flex-1 flex items-start overflow-hidden">
            <span className={cn(
              'freestyle-typewriter text-foreground/80 leading-relaxed font-medium',
              mobileCompact ? 'text-xs' : 'text-sm',
            )}>
              {PROMPT_TEXT}
            </span>
          </div>

          {/* Send icon */}
          <div className="flex justify-end mt-1.5">
            <div className={cn(
              'rounded-lg bg-primary/15 flex items-center justify-center freestyle-send-fade',
              mobileCompact ? 'w-6 h-6' : 'w-7 h-7',
            )}>
              <ArrowUp className={cn('text-primary/70', mobileCompact ? 'w-3 h-3' : 'w-3.5 h-3.5')} />
            </div>
          </div>
        </div>

        {/* Result pills */}
        <div className="freestyle-loop relative z-10 flex items-center justify-center gap-2.5">
          {RESULT_PILLS.map((label, i) => (
            <span
              key={label}
              className={cn(
                'rounded-full border border-border/30 bg-muted/30 text-foreground/70 font-medium freestyle-pill-in',
                mobileCompact ? 'px-2.5 py-0.5 text-[10px]' : 'px-3.5 py-1 text-xs',
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
      <div className={cn('flex flex-col gap-1.5 flex-1', mobileCompact ? 'p-2' : 'p-4')}>
        <h3 className={cn('font-bold tracking-tight leading-tight', mobileCompact ? 'text-xs' : 'text-base')}>
          Freestyle Studio
        </h3>
        {!mobileCompact && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            Type anything. Get styled visuals.
          </p>
        )}
        <div className="pt-1 mt-auto">
          <Button
            size="sm"
            variant="outline"
            className={cn(
              'rounded-full font-semibold gap-1.5 w-full border-primary/20 hover:bg-primary hover:text-primary-foreground transition-colors',
              mobileCompact ? 'h-8 px-3 text-xs' : 'h-9 px-5 text-sm',
            )}
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
          >
            Start Creating
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes freestyle-type {
          from { max-width: 0ch; }
          to { max-width: ${CHAR_COUNT}ch; }
        }
        @keyframes freestyle-blink {
          0%, 100% { border-color: hsl(var(--primary)); }
          50% { border-color: transparent; }
        }
        @keyframes freestyle-pill-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes freestyle-send-in {
          0%, 60% { opacity: 0; transform: scale(0.8); }
          80%, 100% { opacity: 1; transform: scale(1); }
        }
        @keyframes freestyle-loop {
          0%, 5% { opacity: 0; }
          10% { opacity: 1; }
          75% { opacity: 1; }
          90%, 100% { opacity: 0; }
        }
        @keyframes freestyle-glow-pulse {
          0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.15); }
        }
        .freestyle-typewriter {
          display: inline-block;
          overflow: hidden;
          white-space: nowrap;
          max-width: 0ch;
          border-right: 2px solid hsl(var(--primary));
          animation:
            freestyle-type 3s steps(${CHAR_COUNT}, end) 0.7s forwards,
            freestyle-blink 0.75s step-end 0.7s infinite;
        }
        .freestyle-pill-in {
          opacity: 0;
          animation: freestyle-pill-in 0.5s ease-out forwards;
        }
        .freestyle-send-fade {
          opacity: 0;
          animation: freestyle-send-in 3.5s ease-out forwards;
        }
        .freestyle-loop {
          animation: freestyle-loop 8s ease-in-out infinite;
        }
        .freestyle-glow {
          animation: freestyle-glow-pulse 4s ease-in-out infinite;
        }
      `}</style>
    </Card>
  );
}
