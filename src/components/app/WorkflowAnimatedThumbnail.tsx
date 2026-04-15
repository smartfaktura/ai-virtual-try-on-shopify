import { useState, useEffect, useMemo, useRef, memo, type ReactNode } from 'react';
import { Sparkles, Home } from 'lucide-react';
import { getOptimizedUrl } from '@/lib/imageOptimization';

/* ── Image preloader hook ── */

function usePreloadImages(urls: string[]) {
  const [ready, setReady] = useState(false);
  const key = urls.join('|');

  useEffect(() => {
    if (urls.length === 0) { setReady(true); return; }
    let cancelled = false;
    setReady(false);
    Promise.all(
      urls.map(
        (src) =>
          new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = src;
          }),
      ),
    ).then(() => { if (!cancelled) setReady(true); });
    return () => { cancelled = true; };
  }, [key]);

  return ready;
}

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
  enterDelay: number;
  animation: ElementAnimation;
}

export interface WorkflowScene {
  background: string;
  backgrounds?: string[];
  elements: SceneElement[];
  mode?: 'recipe' | 'carousel' | 'upscale' | 'staging';
  slideLabels?: string[];
  objectPosition?: string;
  recipe?: { image: string; label: string }[];
  recipeResult?: string;
  interval?: number;
}

interface Props {
  scene: WorkflowScene;
  isActive?: boolean;
  compact?: boolean;
  /** True when rendered inside the mobile 2-col grid — uses true compact sizes instead of CSS scale */
  mobileCompact?: boolean;
  /** True when rendered inside a modal — uses same small sizes as mobileCompact */
  modalCompact?: boolean;
}

/* ── Floating element renderer ── */

const FloatingEl = memo(function FloatingEl({ element, compact, mobileCompact, modalCompact }: { element: SceneElement; compact?: boolean; mobileCompact?: boolean; modalCompact?: boolean }) {
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

  // Optimize element images — model circles use quality-only to preserve face crop
  const optimizedImage = element.image
    ? getOptimizedUrl(element.image, { quality: 60 })
    : undefined;

  // Mobile compact: use genuinely smaller elements instead of CSS scale
  if (mobileCompact || modalCompact) {
    switch (element.type) {
      case 'product':
      case 'scene':
        return (
          <div className="absolute" style={style}>
            <div className="wf-card bg-white rounded-lg overflow-hidden flex items-center gap-1.5 pr-2">
              <img
                src={optimizedImage}
                className="w-9 h-10 object-cover bg-neutral-50"
                alt=""
                style={{ imageRendering: 'auto' }}
              />
              <div className="min-w-0 py-0.5">
                {element.sublabel && (
                  <div className="text-[7px] text-neutral-400 uppercase tracking-[0.08em] leading-none mb-0.5 font-medium">
                    {element.sublabel}
                  </div>
                )}
                <div className="text-[10px] font-semibold leading-tight whitespace-nowrap text-neutral-800">
                  {element.label}
                </div>
              </div>
            </div>
          </div>
        );

      case 'model':
        return (
          <div className="absolute flex flex-col items-center gap-1" style={style}>
            <div className="wf-card-circle rounded-full p-[2px] bg-white">
              <img
                src={optimizedImage}
                className="w-[38px] h-[38px] rounded-full object-cover"
                alt=""
                style={{ imageRendering: 'auto' }}
              />
            </div>
            <span className="text-[9px] font-semibold bg-white/95 text-neutral-700 px-1.5 py-[2px] rounded-full wf-card-shadow">
              {element.label}
            </span>
          </div>
        );

      case 'action':
        return (
          <div className="absolute" style={style}>
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center wf-card-shadow">
              {element.icon}
            </div>
          </div>
        );

      case 'badge':
        return (
          <div className="absolute" style={style}>
            <div className="bg-white rounded-full px-2 py-1 wf-card-shadow flex items-center gap-1">
              <span className="text-primary">{element.icon}</span>
              <span className="text-[9px] font-semibold text-neutral-700">{element.label}</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  }

  // Default / desktop compact: use CSS scale for backward compat
  if (compact) {
    style.transform = 'scale(0.72)';
    style.transformOrigin = 'top left';
  }

  switch (element.type) {
    case 'product':
    case 'scene':
      return (
        <div className="absolute" style={style}>
          <div className="wf-card bg-white rounded-xl overflow-hidden flex items-center gap-2.5 pr-3">
            <img
              src={optimizedImage}
              className="w-14 h-16 object-cover bg-neutral-50"
              alt=""
              style={{ imageRendering: 'auto' }}
            />
            <div className="min-w-0 py-1">
              {element.sublabel && (
                <div className="text-[9px] text-neutral-400 uppercase tracking-[0.08em] leading-none mb-0.5 font-medium">
                  {element.sublabel}
                </div>
              )}
              <div className="text-[13px] font-semibold leading-tight whitespace-nowrap text-neutral-800">
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
              src={optimizedImage}
              className="w-[60px] h-[60px] rounded-full object-cover"
              alt=""
              style={{ imageRendering: 'auto' }}
            />
          </div>
          <span className="text-[11px] font-semibold bg-white/95 text-neutral-700 px-2.5 py-[3px] rounded-full wf-card-shadow">
            {element.label}
          </span>
        </div>
      );

    case 'action':
      return (
        <div className="absolute" style={style}>
          <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center wf-card-shadow">
            {element.icon}
          </div>
        </div>
      );

    case 'badge':
      return (
        <div className="absolute" style={style}>
          <div className="bg-white rounded-full px-3 py-1.5 wf-card-shadow flex items-center gap-1.5">
            <span className="text-primary">{element.icon}</span>
            <span className="text-[12px] font-semibold text-neutral-700">{element.label}</span>
          </div>
        </div>
      );

    default:
      return null;
  }
});

/* ── Carousel mode component ── */

function CarouselThumbnail({ scene, isActive, mobileCompact, modalCompact }: { scene: WorkflowScene; isActive: boolean; mobileCompact?: boolean; modalCompact?: boolean }) {
  const rawBackgrounds = scene.backgrounds ?? [scene.background];
  const backgrounds = useMemo(
    () => rawBackgrounds.map((bg) => getOptimizedUrl(bg, { quality: 60, width: 600 })),
    [rawBackgrounds],
  );
  const INTERVAL = scene.interval ?? 2500;
  const [current, setCurrent] = useState(0);
  const [progressKey, setProgressKey] = useState(0);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const currentRef = useRef(0);

  // Preload next 2 images ahead for smooth carousel transitions
  useEffect(() => {
    if (!isActive || backgrounds.length <= 1) return;
    const next1 = (currentRef.current + 1) % backgrounds.length;
    const next2 = (currentRef.current + 2) % backgrounds.length;
    [next1, next2].forEach((i) => {
      const img = new Image();
      img.src = backgrounds[i];
    });
  }, [current, isActive, backgrounds]);

  // Preload only the element images (small chips)
  const elementUrls = useMemo(
    () => scene.elements.filter((el) => el.image).map((el) =>
      getOptimizedUrl(el.image!, { quality: 60 })
    ),
    [scene.elements],
  );
  const elementsReady = usePreloadImages(elementUrls);

  useEffect(() => {
    if (!isActive || backgrounds.length <= 1) return;
    const t = setInterval(() => {
      const next = (currentRef.current + 1) % backgrounds.length;
      currentRef.current = next;
      setCurrent(next);
      setProgressKey((k) => k + 1);
    }, INTERVAL);
    return () => clearInterval(t);
  }, [isActive, backgrounds.length]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-muted">
      {/* Progress bar */}
      {isActive && backgrounds.length > 1 && initialLoaded && (
        <div className="absolute top-0 left-0 right-0 z-30 h-[3px] bg-white/20">
          <div
            key={progressKey}
            className="h-full bg-white/70"
            style={{
              animation: `wf-progress-fill ${INTERVAL}ms linear forwards`,
            }}
          />
        </div>
      )}

      {/* Shimmer placeholder */}
      {!initialLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-muted/40 via-muted/70 to-muted/40 bg-[length:200%_100%] animate-shimmer" />
      )}

      {/* Single image — instant swap */}
      <img
        src={backgrounds[current]}
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-center"
        onLoad={() => {
          if (!initialLoaded) setInitialLoaded(true);
        }}
      />

      {/* Gradient overlay */}
      {!modalCompact && (
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.4), rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.15))',
          }}
        />
      )}

      {/* Persistent overlay elements — only when element images ready */}
      {isActive && elementsReady && !modalCompact && (
        <div className="absolute inset-0 z-10" style={{ animation: 'wf-fade-in 0.4s ease-out forwards' }}>
          {scene.elements.map((el, i) => (
            <FloatingEl key={i} element={el} mobileCompact={mobileCompact} modalCompact={modalCompact} />
          ))}
        </div>
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
        @keyframes wf-progress-fill {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes wf-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes wf-pop-in {
          0%  { opacity: 0; transform: scale(0.3); }
          70% { opacity: 1; transform: scale(1.1); }
          100%{ opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

/* ── Upscale mode component ── */

function UpscaleThumbnail({ scene, isActive }: { scene: WorkflowScene; isActive: boolean }) {
  const [bgLoaded, setBgLoaded] = useState(false);
  const [phase, setPhase] = useState<'blur' | 'wiping' | 'sharp'>('blur');
  const bgSrc = useMemo(() => getOptimizedUrl(scene.background, { quality: 60 }), [scene.background]);

  useEffect(() => {
    if (!isActive) {
      setPhase('blur');
      return;
    }
    let timer: ReturnType<typeof setTimeout>;

    function startCycle() {
      setPhase('blur');
      // After 1s of blur, start wipe
      timer = setTimeout(() => {
        setPhase('wiping');
        // After 1.5s wipe, hold sharp
        timer = setTimeout(() => {
          setPhase('sharp');
          // Hold sharp 2s, then fade back to blur
          timer = setTimeout(() => {
            startCycle();
          }, 2000);
        }, 1500);
      }, 1000);
    }

    startCycle();
    return () => clearTimeout(timer);
  }, [isActive]);

  const showSharpLayer = phase === 'wiping' || phase === 'sharp';

  return (
    <div className="relative w-full h-full overflow-hidden bg-muted">
      {/* Blurred layer (always visible underneath) */}
      <img
        src={bgSrc}
        alt=""
        className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 ${bgLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{ filter: 'blur(1.5px) saturate(0.97)', transform: 'scale(1.015)' }}
        onLoad={() => setBgLoaded(true)}
      />

      {isActive && bgLoaded && (
        <>
          {/* Sharp layer — wipes in left-to-right via clip-path, fades out on reset */}
          <img
            src={bgSrc}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{
              clipPath: showSharpLayer
                ? (phase === 'wiping' ? undefined : 'inset(0 0% 0 0)')
                : 'inset(0 100% 0 0)',
              animation: phase === 'wiping'
                ? 'wf-upscale-wipe 1.5s ease-in-out forwards'
                : undefined,
              opacity: phase === 'blur' ? 0 : 1,
              transition: phase === 'blur' ? 'opacity 0.5s ease-out' : undefined,
            }}
          />

          {/* Vertical divider line tracking the wipe edge */}
          {phase === 'wiping' && (
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-white/80 z-[15]"
              style={{
                left: '0%',
                animation: 'wf-divider-move 1.5s ease-in-out forwards',
                boxShadow: '0 0 8px rgba(255,255,255,0.5)',
              }}
            />
          )}

          {/* "Original" badge — top-left, visible during blur & wiping */}
          <div
            className="absolute top-3 left-3 z-20"
            style={{
              opacity: phase === 'blur' ? 1 : 0,
              transition: 'opacity 0.3s ease-out',
              animation: phase === 'blur' ? 'wf-slide-in-left 0.45s cubic-bezier(.22,1,.36,1) forwards' : undefined,
            }}
          >
            <div className="bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
              <span className="text-[10px] font-semibold text-white/90 tracking-wide">Original</span>
            </div>
          </div>

          {/* "Enhanced 4K" badge — bottom-right, appears after wipe */}
          <div
            className="absolute bottom-3 right-3 z-20"
            style={{
              opacity: phase === 'sharp' ? 1 : 0,
              transform: phase === 'sharp' ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.5)',
              transition: 'opacity 0.4s ease-out, transform 0.4s cubic-bezier(.34,1.56,.64,1)',
            }}
          >
            <div className="bg-white rounded-full px-3 py-1.5 wf-card-shadow flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="text-[11px] font-bold text-primary tracking-wide">Enhanced 4K</span>
            </div>
          </div>

          {/* Shimmer sweep across the sharp reveal */}
          {phase === 'sharp' && (
            <div
              className="absolute inset-0 z-[12] pointer-events-none overflow-hidden"
              style={{ animation: 'wf-fade-in 0.2s ease-out forwards, wf-fade-out 0.3s ease-in 0.8s forwards' }}
            >
              <div
                className="absolute inset-y-0 w-1/3"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                  animation: 'wf-shimmer 0.8s ease-in-out forwards',
                }}
              />
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes wf-upscale-wipe {
          from { clip-path: inset(0 100% 0 0); }
          to   { clip-path: inset(0 0% 0 0); }
        }
        @keyframes wf-divider-move {
          from { left: 0%; }
          to   { left: calc(100% - 2px); }
        }
        .wf-card-shadow {
          box-shadow: 0 4px 20px -4px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.5);
        }
        @keyframes wf-slide-in-left {
          from { opacity: 0; transform: translateX(-28px) scale(0.9); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes wf-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes wf-fade-out {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        @keyframes wf-shimmer {
          from { left: -33%; }
          to   { left: 100%; }
        }
      `}</style>
    </div>
  );
}

/* ── Staging mode component (before/after wipe slider) ── */

type StagingPhase = 'empty-hold' | 'wiping-in' | 'styled-hold' | 'wiping-out';

const STAGING_TIMINGS = {
  'empty-hold': 2000,
  'wiping-in': 1500,
  'styled-hold': 2500,
  'wiping-out': 1500,
} as const;

function StagingThumbnail({ scene, isActive }: { scene: WorkflowScene; isActive: boolean }) {
  const backgrounds = scene.backgrounds ?? [scene.background];
  const labels = scene.slideLabels ?? backgrounds.map((_, i) => `Style ${i + 1}`);
  // styles = non-empty backgrounds (skip index 0 which is the empty room)
  const styledBackgrounds = backgrounds.slice(1);
  const styledLabels = labels.slice(1);
  const emptyRoom = backgrounds[0];

  const [styleIndex, setStyleIndex] = useState(0);
  const [phase, setPhase] = useState<StagingPhase>('empty-hold');
  const [bgLoaded, setBgLoaded] = useState(false);

  // Optimized URLs
  const optimizedEmpty = useMemo(() => getOptimizedUrl(emptyRoom, { quality: 60 }), [emptyRoom]);
  const optimizedStyled = useMemo(
    () => styledBackgrounds.map((bg) => getOptimizedUrl(bg, { quality: 60 })),
    [styledBackgrounds],
  );

  // Phase state machine
  useEffect(() => {
    if (!isActive || styledBackgrounds.length === 0) {
      setPhase('empty-hold');
      setStyleIndex(0);
      return;
    }

    let timer: ReturnType<typeof setTimeout>;

    function nextPhase(current: StagingPhase) {
      switch (current) {
        case 'empty-hold':
          setPhase('wiping-in');
          timer = setTimeout(() => nextPhase('wiping-in'), STAGING_TIMINGS['wiping-in']);
          break;
        case 'wiping-in':
          setPhase('styled-hold');
          timer = setTimeout(() => nextPhase('styled-hold'), STAGING_TIMINGS['styled-hold']);
          break;
        case 'styled-hold':
          setPhase('wiping-out');
          timer = setTimeout(() => nextPhase('wiping-out'), STAGING_TIMINGS['wiping-out']);
          break;
        case 'wiping-out':
          setStyleIndex((prev) => (prev + 1) % styledBackgrounds.length);
          setPhase('empty-hold');
          timer = setTimeout(() => nextPhase('empty-hold'), STAGING_TIMINGS['empty-hold']);
          break;
      }
    }

    // Start the cycle
    setPhase('empty-hold');
    setStyleIndex(0);
    timer = setTimeout(() => nextPhase('empty-hold'), STAGING_TIMINGS['empty-hold']);

    return () => clearTimeout(timer);
  }, [isActive, styledBackgrounds.length]);

  const currentStyledSrc = optimizedStyled[styleIndex] || '';
  const currentLabel = styledLabels[styleIndex] || '';
  const showStyledLayer = phase === 'wiping-in' || phase === 'styled-hold' || phase === 'wiping-out';
  const isEmptyPhase = phase === 'empty-hold';

  return (
    <div className="relative w-full h-full overflow-hidden bg-muted">
      {/* Shimmer placeholder */}
      {!bgLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-muted/40 via-muted/70 to-muted/40 bg-[length:200%_100%] animate-shimmer" />
      )}

      {/* Empty room — always visible as base layer */}
      <img
        src={optimizedEmpty}
        alt=""
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${bgLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setBgLoaded(true)}
      />

      {isActive && bgLoaded && styledBackgrounds.length > 0 && (
        <>
          {/* Styled layer — wipes in/out via clip-path */}
          <img
            key={styleIndex}
            src={currentStyledSrc}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              clipPath: phase === 'wiping-in'
                ? undefined
                : phase === 'styled-hold'
                  ? 'inset(0 0% 0 0)'
                  : phase === 'wiping-out'
                    ? undefined
                    : 'inset(0 100% 0 0)',
              animation: phase === 'wiping-in'
                ? `wf-staging-wipe-in ${STAGING_TIMINGS['wiping-in']}ms ease-in-out forwards`
                : phase === 'wiping-out'
                  ? `wf-staging-wipe-out ${STAGING_TIMINGS['wiping-out']}ms ease-in-out forwards`
                  : undefined,
              opacity: showStyledLayer ? 1 : 0,
              transition: !showStyledLayer ? 'opacity 0.3s ease-out' : undefined,
            }}
          />

          {/* Vertical divider line */}
          {(phase === 'wiping-in' || phase === 'wiping-out') && (
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-white/80 z-[15]"
              style={{
                animation: phase === 'wiping-in'
                  ? `wf-staging-divider-in ${STAGING_TIMINGS['wiping-in']}ms ease-in-out forwards`
                  : `wf-staging-divider-out ${STAGING_TIMINGS['wiping-out']}ms ease-in-out forwards`,
                boxShadow: '0 0 8px rgba(255,255,255,0.5)',
              }}
            />
          )}

          {/* Gradient overlay */}
          <div
            className="absolute inset-0 z-[1] pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.4), rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.1))' }}
          />

          {/* "Empty Room" label — visible during empty-hold */}
          <div
            className="absolute top-3 left-3 z-20"
            style={{
              opacity: isEmptyPhase ? 1 : 0,
              transition: 'opacity 0.4s ease-in-out',
            }}
          >
            <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full wf-card-shadow">
              <Home className="w-3 h-3 text-muted-foreground" />
              <span className="text-[11px] font-bold tracking-wide text-muted-foreground">Empty Room</span>
            </div>
          </div>

          {/* Style label — visible during styled-hold */}
          <div
            className="absolute top-3 left-3 z-20"
            style={{
              opacity: phase === 'styled-hold' ? 1 : 0,
              transition: 'opacity 0.4s ease-in-out',
            }}
          >
            <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full wf-card-shadow">
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="text-[11px] font-bold tracking-wide text-primary">{currentLabel}</span>
            </div>
          </div>

          {/* "Generated" badge — visible during styled-hold */}
          <div
            className="absolute bottom-7 right-3 z-20"
            style={{
              opacity: phase === 'styled-hold' ? 1 : 0,
              transform: phase === 'styled-hold' ? 'translateY(0) scale(1)' : 'translateY(6px) scale(0.8)',
              transition: 'opacity 0.4s ease-in-out, transform 0.4s ease-in-out',
            }}
          >
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full wf-card-shadow">
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="text-[11px] font-bold text-primary tracking-wide">Generated</span>
            </div>
          </div>

        </>
      )}

      <style>{`
        @keyframes wf-staging-wipe-in {
          from { clip-path: inset(0 100% 0 0); }
          to   { clip-path: inset(0 0% 0 0); }
        }
        @keyframes wf-staging-wipe-out {
          from { clip-path: inset(0 0% 0 0); }
          to   { clip-path: inset(0 100% 0 0); }
        }
        @keyframes wf-staging-divider-in {
          from { left: 0%; }
          to   { left: calc(100% - 2px); }
        }
        @keyframes wf-staging-divider-out {
          from { left: calc(100% - 2px); }
          to   { left: 0%; }
        }
        .wf-card-shadow {
          box-shadow: 0 4px 20px -4px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.5);
        }
      `}</style>
    </div>
  );
}

/* ── Main component ── */

export function WorkflowAnimatedThumbnail({ scene, isActive = true, compact = false, mobileCompact = false, modalCompact = false }: Props) {
  const isCarousel = scene.mode === 'carousel';
  const isUpscale = scene.mode === 'upscale';
  const isStaging = scene.mode === 'staging';
  const [iteration, setIteration] = useState(0);
  const [bgLoaded, setBgLoaded] = useState(false);

  // Only preload the small element images (not backgrounds)
  const elementUrls = useMemo(
    () => scene.elements.filter((el) => el.image).map((el) =>
      getOptimizedUrl(el.image!, { quality: 60 })
    ),
    [scene.elements],
  );
  const elementsReady = usePreloadImages(elementUrls);

  // Compute timing from element delays (only used for recipe mode)
  const maxDelay = (isCarousel || isUpscale || isStaging || scene.elements.length === 0) ? 0 : Math.max(...scene.elements.map((e) => e.enterDelay));
  const elementsExitAt = maxDelay + 1.8;
  const badgeAt = elementsExitAt + 0.35;
  const totalDuration = badgeAt + 1.6;

  // Loop the animation (recipe mode only)
  useEffect(() => {
    if (isCarousel || isUpscale || isStaging || !isActive) {
      setIteration(0);
      return;
    }
    const timer = setInterval(() => setIteration((i) => i + 1), totalDuration * 1000);
    return () => clearInterval(timer);
  }, [isActive, totalDuration, isCarousel, isUpscale, isStaging]);

  // Delegate to specialized components
  if (isCarousel) return <CarouselThumbnail scene={scene} isActive={isActive} mobileCompact={mobileCompact} modalCompact={modalCompact} />;
  if (isUpscale) return <UpscaleThumbnail scene={scene} isActive={isActive} />;
  if (isStaging) return <StagingThumbnail scene={scene} isActive={isActive} />;

  const rawBgSrc = scene.backgrounds ? scene.backgrounds[iteration % scene.backgrounds.length] : scene.background;
  const bgSrc = useMemo(() => getOptimizedUrl(rawBgSrc, { quality: 60 }), [rawBgSrc]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-muted">
      {/* Shimmer placeholder while background loads */}
      {!bgLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-muted/40 via-muted/70 to-muted/40 bg-[length:200%_100%] animate-shimmer" />
      )}

      {/* Background — renders immediately, fades in when loaded */}
      <img
        src={bgSrc}
        alt=""
        loading="eager"
        decoding="async"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${bgLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{
          objectPosition: scene.objectPosition ?? 'center',
          transform: 'translateZ(0)',
        }}
        onLoad={() => setBgLoaded(true)}
      />

      {isActive && elementsReady && !modalCompact && (
        <div key={iteration}>
          {/* Light gradient overlay */}
          <div
            className="absolute inset-0 z-[1]"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.35), rgba(0,0,0,0.08) 40%, rgba(0,0,0,0.12))',
              opacity: 0,
              animation: `wf-fade-in 0.4s ease-out forwards, wf-fade-out 0.5s ease-in ${elementsExitAt}s forwards`,
            }}
          />

          {/* Floating elements container */}
          <div
            className="absolute inset-0 z-10"
            style={{
              animation: `wf-container-exit 0.45s ease-in ${elementsExitAt}s forwards`,
            }}
          >
            {scene.elements.map((el, i) => (
              <FloatingEl key={i} element={el} compact={compact} mobileCompact={mobileCompact} modalCompact={modalCompact} />
            ))}
          </div>

          {/* Shimmer sweep */}
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

          {/* "Generated" badge */}
          <div
            className={`absolute ${mobileCompact ? 'bottom-2' : compact ? 'bottom-3' : 'bottom-4'} left-1/2 -translate-x-1/2 z-20`}
            style={{
              opacity: 0,
              animation: `wf-badge-pop 0.45s cubic-bezier(.34,1.56,.64,1) ${badgeAt}s forwards`,
            }}
          >
            <div className={`flex items-center gap-2 bg-white ${mobileCompact ? 'px-2 py-1' : compact ? 'px-2.5 py-1.5' : 'px-3.5 py-2'} rounded-full wf-card-shadow`}>
              <Sparkles className={`${mobileCompact || compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-primary`} />
              <span className={`${mobileCompact ? 'text-[9px]' : compact ? 'text-[10px]' : 'text-[11px]'} font-bold text-primary tracking-wide`}>Generated</span>
            </div>
          </div>
        </div>
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
