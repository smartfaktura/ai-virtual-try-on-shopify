import { useState, useEffect, useCallback } from 'react';
import { Plus, User, MapPin, Sparkles } from 'lucide-react';

// Step images from existing assets
import imgProduct from '@/assets/products/tank-white-1.jpg';
import imgModel from '@/assets/models/model-female-slim-american-blonde.jpg';
import imgScene from '@/assets/poses/pose-lifestyle-coffee.jpg';
import imgResult from '@/assets/drops/drop-model-cream-bodysuit.jpg';

interface Step {
  image: string;
  label: string;
  icon: React.ReactNode;
  overlay?: 'select' | 'result';
}

const steps: Step[] = [
  {
    image: imgProduct,
    label: 'Upload Product',
    icon: <Plus className="w-3.5 h-3.5" />,
    overlay: 'select',
  },
  {
    image: imgModel,
    label: 'Select Model',
    icon: <User className="w-3.5 h-3.5" />,
    overlay: 'select',
  },
  {
    image: imgScene,
    label: 'Choose Scene',
    icon: <MapPin className="w-3.5 h-3.5" />,
    overlay: 'select',
  },
  {
    image: imgResult,
    label: 'Result',
    icon: <Sparkles className="w-3.5 h-3.5" />,
    overlay: 'result',
  },
];

const STEP_DURATION = 2200;
const TRANSITION_DURATION = 600;

export function TryOnAnimatedThumbnail() {
  const [activeStep, setActiveStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const advance = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
      setIsTransitioning(false);
    }, TRANSITION_DURATION);
  }, []);

  useEffect(() => {
    const interval = setInterval(advance, STEP_DURATION);
    return () => clearInterval(interval);
  }, [advance]);

  const current = steps[activeStep];

  return (
    <div className="relative w-full h-full overflow-hidden bg-muted">
      {/* All images stacked, only active one visible */}
      {steps.map((step, i) => (
        <img
          key={i}
          src={step.image}
          alt={step.label}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          style={{
            opacity: i === activeStep && !isTransitioning ? 1 : 0,
            zIndex: i === activeStep ? 1 : 0,
          }}
        />
      ))}

      {/* Overlay for select steps */}
      {current.overlay === 'select' && !isTransitioning && (
        <div className="absolute inset-0 z-10 bg-black/20 flex items-center justify-center">
          <div className="animate-scale-in flex flex-col items-center gap-1.5">
            <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
              {current.icon}
            </div>
          </div>
        </div>
      )}

      {/* Result sparkle overlay */}
      {current.overlay === 'result' && !isTransitioning && (
        <div className="absolute inset-0 z-10 flex items-end justify-center pb-16">
          <div className="animate-scale-in flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-lg">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-semibold text-primary">Generated</span>
          </div>
        </div>
      )}

      {/* Step indicator label */}
      <div className="absolute top-3 left-3 z-20">
        <div
          className="flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full transition-all duration-300"
          key={activeStep}
        >
          {current.icon}
          <span className="text-[10px] font-medium animate-fade-in">{current.label}</span>
        </div>
      </div>

      {/* Progress dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
        {steps.map((_, i) => (
          <div
            key={i}
            className="relative h-1 rounded-full overflow-hidden transition-all duration-300"
            style={{ width: i === activeStep ? 20 : 6, backgroundColor: 'rgba(255,255,255,0.4)' }}
          >
            {i === activeStep && (
              <div
                className="absolute inset-0 bg-white rounded-full"
                style={{
                  animation: `progress-fill ${STEP_DURATION}ms linear`,
                }}
              />
            )}
            {i < activeStep && (
              <div className="absolute inset-0 bg-white rounded-full" />
            )}
          </div>
        ))}
      </div>

      {/* CSS for progress bar animation */}
      <style>{`
        @keyframes progress-fill {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
