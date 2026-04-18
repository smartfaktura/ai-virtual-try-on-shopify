import { useRef, useEffect, useState, useCallback } from 'react';
import { ArrowRight, ArrowUp, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getLandingAssetUrl } from '@/lib/landingAssets';
import { getOptimizedUrl } from '@/lib/imageOptimization';

const PROMPT_TEXT = 'Shoot my white crop top, editorial style, urban café';

const STEP_IMAGES = {
  scene: getOptimizedUrl(getLandingAssetUrl('poses/pose-lifestyle-coffee.jpg'), { quality: 50 }),
  model: getOptimizedUrl(getLandingAssetUrl('models/model-female-slim-asian.jpg'), { quality: 50 }),
  product: getOptimizedUrl(getLandingAssetUrl('workflows/workflow-tryon-product-flatlay.png'), { quality: 50 }),
};

const WORKFLOW_STEPS = [
  { label: 'Scene', image: STEP_IMAGES.scene },
  { label: 'Model', image: STEP_IMAGES.model },
  { label: 'Product', image: STEP_IMAGES.product },
  { label: 'Generate', icon: Zap },
] as const;

const TYPING_SPEED = 42;
const SEND_DELAY = 450;
const PILL_STAGGER = 180;
const HOLD_DURATION = 2800;
const RESTART_DELAY = 900;
const APPLE_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

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
  const [pillsVisible, setPillsVisible] = useState([false, false, false, false]);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAllTimeouts = useCallback(() => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
  }, []);

  const addTimeout = useCallback((fn: () => void, ms: number) => {
    timeouts.current.push(setTimeout(fn, ms));
  }, []);

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

  useEffect(() => {
    if (!isVisible) return;

    let typingInterval: ReturnType<typeof setInterval> | null = null;

    const startCycle = () => {
      setPhase('idle');
      setCharIndex(0);
      setPillsVisible([false, false, false, false]);

      addTimeout(() => {
        setPhase('typing');
        let idx = 0;
        typingInterval = setInterval(() => {
          idx++;
          setCharIndex(idx);
          if (idx >= PROMPT_TEXT.length) {
            if (typingInterval) clearInterval(typingInterval);
            typingInterval = null;
            addTimeout(() => {
              setPhase('sent');
              addTimeout(() => {
                setPhase('pills');
                WORKFLOW_STEPS.forEach((_, i) => {
                  addTimeout(() => {
                    setPillsVisible(prev => {
                      const next = [...prev];
                      next[i] = true;
                      return next;
                    });
                  }, i * PILL_STAGGER);
                });
                addTimeout(() => {
                  setPhase('hold');
                  addTimeout(() => {
                    setPhase('fadeout');
                    addTimeout(startCycle, RESTART_DELAY);
                  }, HOLD_DURATION);
                }, WORKFLOW_STEPS.length * PILL_STAGGER + 200);
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
        'group relative overflow-hidden transition-shadow duration-300 flex flex-col border hover:shadow-lg cursor-pointer rounded-2xl',
      )}
      onClick={onSelect}
    >
      <div className={cn(
        'relative w-full overflow-hidden flex items-center justify-center',
        'bg-gradient-to-b from-muted/40 via-background to-background',
        mobileCompact ? 'aspect-[2/3]' : 'aspect-[3/4]',
      )}>
        {/* Soft radial highlight */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 45%, hsl(var(--primary) / 0.06), transparent 70%)',
        }} />

        <div
          className={cn(
            'relative z-10 w-full flex flex-col items-center gap-2.5 transition-opacity duration-500',
            mobileCompact ? 'px-2' : 'px-4',
            isFading ? 'opacity-0' : 'opacity-100',
          )}
          style={{ transitionTimingFunction: APPLE_EASE }}
        >
          {/* Prompt bar */}
          <div className={cn(
            'w-full rounded-2xl border border-border/40 bg-background/80 backdrop-blur-md flex flex-col shadow-sm',
            mobileCompact ? 'p-3 min-h-[76px]' : 'p-4 min-h-[92px]',
          )}>
            <div className="flex-1 flex items-start">
              <span className={cn(
                'text-foreground leading-relaxed font-normal break-words',
                mobileCompact ? 'text-[13px]' : 'text-[15px]',
              )}>
                {visibleText}
                {showCursor && (
                  <span
                    className="inline-block w-px h-[1.05em] bg-primary ml-0.5 align-middle"
                    style={{ animation: 'pulse 1.4s ease-in-out infinite' }}
                  />
                )}
              </span>
            </div>

            <div className="flex justify-end mt-2">
              <div
                className={cn(
                  'rounded-full bg-primary flex items-center justify-center shadow-sm',
                  'transition-all duration-500',
                  mobileCompact ? 'w-7 h-7' : 'w-8 h-8',
                  showSend ? 'opacity-100 scale-100' : 'opacity-0 scale-75',
                )}
                style={{ transitionTimingFunction: APPLE_EASE }}
              >
                <ArrowUp className={cn('text-primary-foreground', mobileCompact ? 'w-3.5 h-3.5' : 'w-4 h-4')} />
              </div>
            </div>
          </div>

          {/* Visual workflow pills — single row */}
          <div className={cn(
            'flex flex-nowrap items-center justify-center w-full',
            mobileCompact ? 'gap-1' : 'gap-1',
          )}>
            {WORKFLOW_STEPS.map((step, i) => {
              const isGenerate = step.label === 'Generate';
              const hasImage = 'image' in step;
              return (
                <span
                  key={step.label}
                  className={cn(
                    'inline-flex items-center gap-0.5 rounded-full border font-medium flex-shrink-0',
                    'transition-all duration-500',
                    mobileCompact ? 'p-1 text-[9px]' : 'px-1.5 py-0.5 text-[10px]',
                    isGenerate
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'bg-background/60 border-border/40 text-foreground/75 backdrop-blur-sm',
                    pillsVisible[i]
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-1',
                  )}
                  style={{ transitionTimingFunction: APPLE_EASE }}
                >
                  {hasImage ? (
                    <img
                      src={(step as { image: string }).image}
                      alt={step.label}
                      className={cn(
                        'rounded-full object-cover flex-shrink-0',
                        mobileCompact ? 'w-3.5 h-3.5' : 'w-4 h-4',
                      )}
                    />
                  ) : (
                    <Zap className={cn(mobileCompact ? 'w-2.5 h-2.5' : 'w-3 h-3')} />
                  )}
                  <span className={cn(mobileCompact && 'hidden sm:inline')}>{step.label}</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content area — match WorkflowCardCompact exactly */}
      <div className={cn('flex flex-col gap-1.5 flex-1', mobileCompact ? 'p-3' : 'p-4')}>
        <h3 className={cn(
          'font-bold tracking-tight leading-tight',
          mobileCompact ? 'text-sm' : 'text-base',
        )}>
          Freestyle Studio
        </h3>

        {!mobileCompact && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            Type anything and get styled brand visuals in seconds.
          </p>
        )}

        <div className="pt-3 mt-auto">
          <Button
            size="sm"
            className={cn(
              'rounded-full font-semibold gap-1 w-full',
              mobileCompact ? 'h-9 px-4 text-xs' : 'h-10 px-5',
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
