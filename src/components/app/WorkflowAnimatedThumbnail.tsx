import { useState, useEffect, useRef, type ReactNode } from 'react';
import { Sparkles } from 'lucide-react';

/* ── Types ── */

export type ElementAnimation = 'slide-left' | 'slide-right' | 'slide-up' | 'pop';
export type ElementType = 'product' | 'model' | 'scene' | 'action' | 'badge';

export interface SceneElement {
  type: ElementType;
  image?: string;
  label: string;
  sublabel?: string;
  icon: ReactNode;
  position: React.CSSProperties;
  enterDelay: number; // seconds
  animation: ElementAnimation;
}

export interface WorkflowScene {
  background: string;
  elements: SceneElement[];
}

interface Props {
  scene: WorkflowScene;
  isActive?: boolean;
}

/* ── Floating element renderer ── */

function FloatingEl({ element }: { element: SceneElement }) {
  const animName = {
    'slide-left': 'wf-slide-in-left',
    'slide-right': 'wf-slide-in-right',
    'slide-up': 'wf-slide-in-up',
    'pop': 'wf-pop-in',
  }[element.animation];

  const style: React.CSSProperties = {
    ...element.position,
    opacity: 0,
    animation: `${animName} 0.55s cubic-bezier(.22,1,.36,1) ${element.enterDelay}s forwards`,
  };

  switch (element.type) {
    case 'product':
    case 'scene':
      return (
        <div className="absolute" style={style}>
          <div className="wf-card bg-white rounded-xl overflow-hidden flex items-center gap-2.5 pr-3">
            <img
              src={element.image}
              className="w-12 h-14 object-cover"
              alt=""
              style={{ imageRendering: 'auto' }}
            />
            <div className="min-w-0 py-1">
              {element.sublabel && (
                <div className="text-[7px] text-neutral-400 uppercase tracking-[0.08em] leading-none mb-0.5 font-medium">
                  {element.sublabel}
                </div>
              )}
              <div className="text-[11px] font-semibold leading-tight whitespace-nowrap text-neutral-800">
                {element.label}
              </div>
            </div>
          </div>
        </div>
      );

    case 'model':
      return (
        <div className="absolute flex flex-col items-center gap-1.5" style={style}>
          <div className="wf-card-circle rounded-full p-[3px] bg-white">
            <img
              src={element.image}
              className="w-[52px] h-[52px] rounded-full object-cover"
              alt=""
              style={{ imageRendering: 'auto' }}
            />
          </div>
          <span className="text-[9px] font-semibold bg-white/95 text-neutral-700 px-2.5 py-[3px] rounded-full wf-card-shadow">
            {element.label}
          </span>
        </div>
      );

    case 'action':
      return (
        <div className="absolute" style={style}>
          <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center wf-card-shadow">
            {element.icon}
          </div>
        </div>
      );

    case 'badge':
      return (
        <div className="absolute" style={style}>
          <div className="bg-white rounded-full px-3 py-1.5 wf-card-shadow flex items-center gap-1.5">
            <span className="text-primary">{element.icon}</span>
            <span className="text-[10px] font-semibold text-neutral-700">{element.label}</span>
          </div>
        </div>
      );

    default:
      return null;
  }
}

/* ── Main component ── */

export function WorkflowAnimatedThumbnail({ scene, isActive = true }: Props) {
  const [iteration, setIteration] = useState(0);

  // Compute timing from element delays
  const maxDelay = Math.max(...scene.elements.map((e) => e.enterDelay));
  const elementsExitAt = maxDelay + 1.8;
  const badgeAt = elementsExitAt + 0.35;
  const totalDuration = badgeAt + 1.6;

  // Loop the animation
  useEffect(() => {
    if (!isActive) {
      setIteration(0);
      return;
    }
    const timer = setInterval(() => setIteration((i) => i + 1), totalDuration * 1000);
    return () => clearInterval(timer);
  }, [isActive, totalDuration]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-muted" key={isActive ? iteration : 'static'}>
      {/* Background — always visible, subtle Ken Burns on hover */}
      <img
        src={scene.background}
        alt=""
        loading="eager"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          transform: 'translateZ(0)',
          ...(isActive
            ? { animation: `wf-ken-burns ${totalDuration}s ease-in-out forwards` }
            : {}),
        }}
      />

      {isActive && (
        <>
          {/* Light gradient overlay — fades in, then lifts at result time */}
          <div
            className="absolute inset-0 z-[1]"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.35), rgba(0,0,0,0.08) 40%, rgba(0,0,0,0.12))',
              opacity: 0,
              animation: `wf-fade-in 0.4s ease-out forwards, wf-fade-out 0.5s ease-in ${elementsExitAt}s forwards`,
            }}
          />

          {/* Floating elements container — exits together */}
          <div
            className="absolute inset-0 z-10"
            style={{
              animation: `wf-container-exit 0.45s ease-in ${elementsExitAt}s forwards`,
            }}
          >
            {scene.elements.map((el, i) => (
              <FloatingEl key={i} element={el} />
            ))}
          </div>

          {/* Shimmer sweep — processing indicator */}
          <div
            className="absolute inset-0 z-[5] pointer-events-none overflow-hidden"
            style={{
              opacity: 0,
              animation: `wf-fade-in 0.2s ease-out ${elementsExitAt - 0.3}s forwards, wf-fade-out 0.3s ease-in ${elementsExitAt + 0.2}s forwards`,
            }}
          >
            <div
              className="absolute inset-y-0 w-1/3"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
                animation: `wf-shimmer 0.8s ease-in-out ${elementsExitAt - 0.2}s forwards`,
              }}
            />
          </div>

          {/* "Generated" badge — pops in after elements exit */}
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20"
            style={{
              opacity: 0,
              animation: `wf-badge-pop 0.45s cubic-bezier(.34,1.56,.64,1) ${badgeAt}s forwards`,
            }}
          >
            <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-full wf-card-shadow">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-[11px] font-bold text-primary tracking-wide">Generated</span>
            </div>
          </div>
        </>
      )}

      <style>{`
        .wf-card {
          box-shadow: 0 4px 20px -4px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.6);
        }
        .wf-card-circle {
          box-shadow: 0 4px 20px -4px rgba(0,0,0,0.15), 0 0 0 2px rgba(255,255,255,0.8);
        }
        .wf-card-shadow {
          box-shadow: 0 4px 20px -4px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.5);
        }
        @keyframes wf-ken-burns {
          0% { transform: scale(1) translate(0,0); }
          100% { transform: scale(1.05) translate(-0.5%, -0.5%); }
        }
        @keyframes wf-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes wf-fade-out {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        @keyframes wf-container-exit {
          from { opacity: 1; transform: scale(1); }
          to   { opacity: 0; transform: scale(0.96) translateY(-4px); }
        }
        @keyframes wf-slide-in-left {
          from { opacity: 0; transform: translateX(-28px) scale(0.9); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes wf-slide-in-right {
          from { opacity: 0; transform: translateX(28px) scale(0.9); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes wf-slide-in-up {
          from { opacity: 0; transform: translateY(22px) scale(0.9); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes wf-pop-in {
          0%  { opacity: 0; transform: scale(0.3); }
          70% { opacity: 1; transform: scale(1.1); }
          100%{ opacity: 1; transform: scale(1); }
        }
        @keyframes wf-badge-pop {
          0%  { opacity: 0; transform: translateX(-50%) translateY(12px) scale(0.5); }
          70% { opacity: 1; transform: translateX(-50%) translateY(-2px) scale(1.06); }
          100%{ opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
        @keyframes wf-shimmer {
          from { left: -33%; }
          to   { left: 100%; }
        }
      `}</style>
    </div>
  );
}
