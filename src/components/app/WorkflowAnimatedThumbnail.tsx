import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { Sparkles } from 'lucide-react';

export type StepTransition = 'slide-right' | 'slide-left' | 'slide-up' | 'scale' | 'zoom' | 'fade';

export interface AnimatedStep {
  image: string;
  label: string;
  icon: ReactNode;
  overlay?: 'action' | 'result';
  transition?: StepTransition;
}

interface Props {
  steps: AnimatedStep[];
  stepDuration?: number;
  isActive?: boolean;
}

const DEFAULT_DURATION = 2400;

/* Maps a transition type to enter / exit CSS transforms */
function getTransitionStyles(
  transition: StepTransition,
  phase: 'enter' | 'active' | 'exit' | 'hidden',
): React.CSSProperties {
  const base: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    willChange: 'transform, opacity',
    backfaceVisibility: 'hidden',
  };

  switch (phase) {
    case 'enter':
      return {
        ...base,
        opacity: 0,
        transition: 'transform 0.6s cubic-bezier(.22,1,.36,1), opacity 0.5s ease-out',
        ...(transition === 'slide-right' && { transform: 'translateX(40%)' }),
        ...(transition === 'slide-left' && { transform: 'translateX(-40%)' }),
        ...(transition === 'slide-up' && { transform: 'translateY(30%)' }),
        ...(transition === 'scale' && { transform: 'scale(0.7)' }),
        ...(transition === 'zoom' && { transform: 'scale(1.3)', filter: 'blur(4px)' }),
        ...(transition === 'fade' && { transform: 'scale(1.02)' }),
      };
    case 'active':
      return {
        ...base,
        opacity: 1,
        zIndex: 2,
        transition: 'transform 0.6s cubic-bezier(.22,1,.36,1), opacity 0.5s ease-out, filter 0.5s ease-out',
        transform: 'translateX(0) translateY(0) scale(1)',
        filter: 'blur(0)',
      };
    case 'exit':
      return {
        ...base,
        opacity: 0,
        zIndex: 1,
        transition: 'transform 0.5s cubic-bezier(.22,1,.36,1), opacity 0.4s ease-in',
        ...(transition === 'slide-right' && { transform: 'translateX(-20%) scale(0.95)' }),
        ...(transition === 'slide-left' && { transform: 'translateX(20%) scale(0.95)' }),
        ...(transition === 'slide-up' && { transform: 'translateY(-15%) scale(0.97)' }),
        ...(transition === 'scale' && { transform: 'scale(1.15)', filter: 'blur(2px)' }),
        ...(transition === 'zoom' && { transform: 'scale(0.85)' }),
        ...(transition === 'fade' && { transform: 'scale(0.97)' }),
      };
    case 'hidden':
      return { ...base, opacity: 0, zIndex: 0, transform: 'translateZ(0)' };
  }
}

export function WorkflowAnimatedThumbnail({ steps, stepDuration = DEFAULT_DURATION, isActive = true }: Props) {
  const [activeStep, setActiveStep] = useState(0);
  const [displayStep, setDisplayStep] = useState(0); // what's visually shown
  const [prevDisplayStep, setPrevDisplayStep] = useState<number | null>(null);
  const [animPhase, setAnimPhase] = useState<'idle' | 'entering'>('idle');
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const rafRef = useRef<number>();

  const advance = useCallback(() => {
    setActiveStep((prev) => (prev + 1) % steps.length);
  }, [steps.length]);

  // When activeStep changes, trigger the enter animation
  useEffect(() => {
    if (activeStep === displayStep) return;

    setPrevDisplayStep(displayStep);
    setAnimPhase('entering');

    // Double RAF: first frame applies starting position, second frame triggers transition
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => {
        setDisplayStep(activeStep);
        setAnimPhase('idle');

        // Clear previous step after transition
        timeoutRef.current = setTimeout(() => {
          setPrevDisplayStep(null);
        }, 700);
      });
    });

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [activeStep]); // intentionally not including displayStep to avoid loop

  // Reset on deactivate
  useEffect(() => {
    if (!isActive) {
      setPrevDisplayStep(null);
      setAnimPhase('idle');
      const t = setTimeout(() => {
        setActiveStep(0);
        setDisplayStep(0);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [isActive]);

  // Step interval
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(advance, stepDuration);
    return () => {
      clearInterval(interval);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [advance, stepDuration, isActive]);

  const current = steps[displayStep];

  return (
    <div className="relative w-full h-full overflow-hidden bg-muted">
      {/* Image layers */}
      {steps.map((step, i) => {
        const stepTransition = step.transition || 'slide-right';
        let phase: 'enter' | 'active' | 'exit' | 'hidden';

        if (i === displayStep && animPhase === 'idle') {
          phase = 'active';
        } else if (i === activeStep && animPhase === 'entering') {
          // New step waiting to enter — show at start position
          phase = 'enter';
        } else if (i === prevDisplayStep) {
          phase = 'exit';
        } else {
          phase = 'hidden';
        }

        const style = getTransitionStyles(stepTransition, phase);

        return (
          <img
            key={i}
            src={step.image}
            alt={step.label}
            loading="eager"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              ...style,
              // Ken Burns drift on active image
              ...(phase === 'active' && isActive
                ? { animation: `wf-ken-burns ${stepDuration}ms ease-in-out forwards` }
                : {}),
            }}
          />
        );
      })}

      {/* Action overlay — icon hops in */}
      {isActive && current.overlay === 'action' && animPhase === 'idle' && (
        <div className="absolute inset-0 z-10 bg-black/15 flex items-center justify-center">
          <div
            className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg"
            style={{ animation: 'wf-hop-in 0.4s cubic-bezier(.34,1.56,.64,1) forwards' }}
          >
            {current.icon}
          </div>
        </div>
      )}

      {/* Result overlay — slides up with bounce */}
      {isActive && current.overlay === 'result' && !entering && (
        <div className="absolute inset-0 z-10 flex items-end justify-center pb-14">
          <div
            className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg"
            style={{ animation: 'wf-slide-up-bounce 0.5s cubic-bezier(.34,1.56,.64,1) forwards' }}
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-semibold text-primary">Generated</span>
          </div>
        </div>
      )}

      {/* Step label — slides in from left */}
      {isActive && (
        <div className="absolute top-3 left-3 z-20" key={activeStep}>
          <div
            className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-full"
            style={{ animation: 'wf-label-in 0.45s cubic-bezier(.22,1,.36,1) forwards' }}
          >
            <span
              className="flex items-center justify-center"
              style={{ animation: 'wf-icon-spin 0.5s cubic-bezier(.22,1,.36,1) forwards' }}
            >
              {current.icon}
            </span>
            <span className="text-[10px] font-medium">{current.label}</span>
          </div>
        </div>
      )}

      {/* Step counter pill — bottom right */}
      {isActive && (
        <div
          className="absolute bottom-3 right-3 z-20 bg-black/50 backdrop-blur-sm text-white px-2 py-0.5 rounded-full"
          style={{ animation: 'wf-fade-in 0.3s ease-out forwards' }}
        >
          <span className="text-[10px] font-medium tabular-nums">
            {activeStep + 1}/{steps.length}
          </span>
        </div>
      )}

      {/* Progress bar — bottom */}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 z-20 h-[3px] bg-white/20">
          <div
            key={activeStep}
            className="h-full bg-white/80 rounded-r-full"
            style={{ animation: `wf-progress-bar ${stepDuration}ms linear forwards` }}
          />
        </div>
      )}

      <style>{`
        @keyframes wf-ken-burns {
          0% { transform: scale(1) translate(0, 0); }
          100% { transform: scale(1.06) translate(-1%, -0.5%); }
        }
        @keyframes wf-hop-in {
          0% { opacity: 0; transform: scale(0.3) translateY(20px); }
          60% { opacity: 1; transform: scale(1.1) translateY(-4px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes wf-slide-up-bounce {
          0% { opacity: 0; transform: translateY(24px) scale(0.9); }
          60% { opacity: 1; transform: translateY(-3px) scale(1.02); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes wf-label-in {
          0% { opacity: 0; transform: translateX(-16px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes wf-icon-spin {
          0% { transform: rotate(-90deg) scale(0.6); opacity: 0; }
          100% { transform: rotate(0deg) scale(1); opacity: 1; }
        }
        @keyframes wf-fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes wf-progress-bar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
