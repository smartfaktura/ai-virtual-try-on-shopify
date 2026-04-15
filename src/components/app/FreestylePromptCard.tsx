import { useRef, useEffect, useState, useCallback } from 'react';
import { ArrowRight, ArrowUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const PROMPT_TEXT = 'Shoot my crop top on a court, studio, and café';
const RESULT_PILLS = ['Studio', 'Court', 'Café'] as const;

const TYPING_SPEED = 55;
const SEND_DELAY = 400;
const PILL_STAGGER = 250;
const HOLD_DURATION = 2200;
const FADE_DURATION = 600;
const RESTART_DELAY = 800;

type Phase = 'idle' | 'typing' | 'sent' | 'pills' | 'hold' | 'fadeout';

interface Props {
  onSelect: () => void;
  mobileCompact?: boolean;
}

export function FreestylePromptCard({ onSelect, mobileCompact }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [charIndex, setCharIndex] = useState(0);
  const [pillsVisible, setPillsVisible] = useState([false, false, false]);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAllTimeouts = useCallback(() => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
  }, []);

  const addTimeout = useCallback((fn: () => void, ms: number) => {
    timeouts.current.push(setTimeout(fn, ms));
  }, []);

  // Intersection observer
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Animation loop
  useEffect(() => {
    if (!isVisible) return;

    let typingInterval: ReturnType<typeof setInterval> | null = null;

    const startCycle = () => {
      setPhase('idle');
      setCharIndex(0);
      setPillsVisible([false, false, false]);

      // Brief idle pause then start typing
      addTimeout(() => {
        setPhase('typing');
        let idx = 0;
        typingInterval = setInterval(() => {
          idx++;
          setCharIndex(idx);
          if (idx >= PROMPT_TEXT.length) {
            if (typingInterval) clearInterval(typingInterval);
            typingInterval = null;
            // Send pulse
            addTimeout(() => {
              setPhase('sent');
              // Pills phase
              addTimeout(() => {
                setPhase('pills');
                RESULT_PILLS.forEach((_, i) => {
                  addTimeout(() => {
                    setPillsVisible(prev => {
                      const next = [...prev];
                      next[i] = true;
                      return next;
                    });
                  }, i * PILL_STAGGER);
                });
                // Hold
                addTimeout(() => {
                  setPhase('hold');
                  // Fade out
                  addTimeout(() => {
                    setPhase('fadeout');
                    // Restart
                    addTimeout(startCycle, RESTART_DELAY);
                  }, HOLD_DURATION);
                }, RESULT_PILLS.length * PILL_STAGGER + 200);
              }, SEND_DELAY);
            }, SEND_DELAY);
          }
        }, TYPING_SPEED);
      }, 600);
    };

    startCycle();

    return () => {
      clearAllTimeouts();
      if (typingInterval) clearInterval(typingInterval);
    };
  }, [isVisible, addTimeout, clearAllTimeouts]);

  const visibleText = PROMPT_TEXT.substring(0, charIndex);
  const isFading = phase === 'fadeout';
  const showSend = phase === 'sent' || phase === 'pills' || phase === 'hold';
  const showCursor = phase === 'typing' || phase === 'idle';

  return (
    <Card
      ref={ref}
      className={cn(
        'group relative overflow-hidden transition-shadow duration-300 flex flex-col border hover:shadow-lg cursor-pointer',
      )}
      onClick={onSelect}
    >
      {/* Thumbnail / animation area */}
      <div className={cn(
        'relative w-full overflow-hidden bg-gradient-to-b from-muted/30 to-background flex flex-col items-center justify-center',
        mobileCompact ? 'aspect-[2/3]' : 'aspect-[3/4]',
      )}>
        {/* Ambient glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-primary/[0.06] blur-3xl pointer-events-none" />

        {/* Animated content */}
        <div
          className={cn(
            'relative z-10 w-full flex flex-col gap-3 transition-opacity duration-500',
            mobileCompact ? 'px-3' : 'px-5',
            isFading ? 'opacity-0' : 'opacity-100',
          )}
        >
          {/* Prompt bar */}
          <div className={cn(
            'w-full rounded-xl border border-border/40 bg-muted/40 backdrop-blur-sm flex flex-col',
            mobileCompact ? 'p-2.5 min-h-[60px]' : 'p-3 min-h-[76px]',
          )}>
            {/* Text area */}
            <div className="flex-1 flex items-start">
              <span className={cn(
                'text-foreground/80 leading-relaxed font-medium break-words',
                mobileCompact ? 'text-xs' : 'text-sm',
              )}>
                {visibleText}
                {showCursor && (
                  <span className="inline-block w-[2px] h-[1em] bg-primary/70 ml-0.5 align-middle animate-pulse" />
                )}
              </span>
            </div>

            {/* Send button */}
            <div className="flex justify-end mt-1.5">
              <div
                className={cn(
                  'rounded-lg bg-primary/15 flex items-center justify-center transition-all duration-300',
                  mobileCompact ? 'w-6 h-6' : 'w-7 h-7',
                  showSend ? 'opacity-100 scale-100' : 'opacity-0 scale-75',
                )}
              >
                <ArrowUp className={cn('text-primary/70', mobileCompact ? 'w-3 h-3' : 'w-3.5 h-3.5')} />
              </div>
            </div>
          </div>

          {/* Result pills */}
          <div className="flex items-center justify-center gap-2">
            {RESULT_PILLS.map((label, i) => (
              <span
                key={label}
                className={cn(
                  'rounded-full border border-border/30 bg-muted/30 text-foreground/70 font-medium transition-all duration-400',
                  mobileCompact ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-0.5 text-xs',
                  pillsVisible[i]
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-1.5',
                )}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Content area — matches WorkflowCardCompact */}
      <div className={cn('flex flex-col gap-1 flex-1', mobileCompact ? 'p-2' : 'p-4')}>
        <h3 className={cn(
          'font-bold tracking-tight leading-tight',
          mobileCompact ? 'text-[11px]' : 'text-sm',
        )}>
          Freestyle Studio
        </h3>

        {!mobileCompact && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            Type anything. Get styled visuals.
          </p>
        )}

        <div className="pt-1 mt-auto">
          <Button
            size="sm"
            className={cn(
              'rounded-full font-semibold gap-1 w-full',
              mobileCompact ? 'h-8 px-3 text-xs' : 'h-8 px-5',
            )}
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
          >
            {mobileCompact ? 'Start' : 'Start Creating'}
            <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
