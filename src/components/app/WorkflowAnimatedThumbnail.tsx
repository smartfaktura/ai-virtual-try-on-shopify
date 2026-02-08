import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { Sparkles } from 'lucide-react';

export interface AnimatedStep {
  image: string;
  label: string;
  icon: ReactNode;
  overlay?: 'action' | 'result';
}

interface Props {
  steps: AnimatedStep[];
  stepDuration?: number;
  isActive?: boolean;
}

const DEFAULT_DURATION = 2200;

export function WorkflowAnimatedThumbnail({ steps, stepDuration = DEFAULT_DURATION, isActive = true }: Props) {
  const [activeStep, setActiveStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const advance = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
      setIsTransitioning(false);
    }, 500);
  }, [steps.length]);

  // Reset to first frame when deactivated
  useEffect(() => {
    if (!isActive) {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveStep(0);
        setIsTransitioning(false);
      }, 300);
    }
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(advance, stepDuration);
    return () => clearInterval(interval);
  }, [advance, stepDuration, isActive]);

  const current = steps[activeStep];

  return (
    <div className="relative w-full h-full overflow-hidden bg-muted">
      {steps.map((step, i) => (
        <img
          key={i}
          src={step.image}
          alt={step.label}
          loading="eager"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          style={{
            opacity: i === activeStep && !isTransitioning ? 1 : 0,
            zIndex: i === activeStep ? 1 : 0,
            transform: 'translateZ(0)',
          }}
        />
      ))}

      {/* Action overlay */}
      {isActive && current.overlay === 'action' && !isTransitioning && (
        <div className="absolute inset-0 z-10 bg-black/20 flex items-center justify-center">
          <div className="animate-scale-in">
            <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
              {current.icon}
            </div>
          </div>
        </div>
      )}

      {/* Result overlay */}
      {isActive && current.overlay === 'result' && !isTransitioning && (
        <div className="absolute inset-0 z-10 flex items-end justify-center pb-16">
          <div className="animate-scale-in flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-lg">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-semibold text-primary">Generated</span>
          </div>
        </div>
      )}

      {/* Step label — only on hover */}
      {isActive && (
        <div className="absolute top-3 left-3 z-20 animate-fade-in">
          <div
            className="flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full"
            key={activeStep}
          >
            {current.icon}
            <span className="text-[10px] font-medium animate-fade-in">{current.label}</span>
          </div>
        </div>
      )}

      {/* Progress dots — only on hover */}
      {isActive && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 animate-fade-in">
          {steps.map((_, i) => (
            <div
              key={i}
              className="relative h-1 rounded-full overflow-hidden transition-all duration-300"
              style={{ width: i === activeStep ? 20 : 6, backgroundColor: 'rgba(255,255,255,0.4)' }}
            >
              {i === activeStep && (
                <div
                  className="absolute inset-0 bg-white rounded-full"
                  style={{ animation: `wf-progress ${stepDuration}ms linear` }}
                />
              )}
              {i < activeStep && <div className="absolute inset-0 bg-white rounded-full" />}
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes wf-progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
