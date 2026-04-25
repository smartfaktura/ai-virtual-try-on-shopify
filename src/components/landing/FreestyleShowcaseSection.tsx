import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sparkles, Camera, Package, Play, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { cn } from '@/lib/utils';
import { getLandingAssetUrl } from '@/lib/landingAssets';
import { getOptimizedUrl } from '@/lib/imageOptimization';

const PROMPT_TEXT_FULL = 'Shoot my crop top on a basketball court, in a clean studio, and a sunny café';
const PROMPT_TEXT_MOBILE = 'Shoot my crop top on a court, studio, and café';
const CYCLE_MS = 8000;

const MODEL_AVATARS = [
  { name: 'Zara', src: getOptimizedUrl(getLandingAssetUrl('models/model-female-athletic-mixed.jpg'), { quality: 50 }) },
  { name: 'Freya', src: getOptimizedUrl(getLandingAssetUrl('models/model-female-average-nordic.jpg'), { quality: 50 }) },
  { name: 'Olivia', src: getOptimizedUrl(getLandingAssetUrl('models/model-035-olivia.jpg'), { quality: 50 }) },
];

const CHIPS = [
  {
    key: 'product' as const,
    icon: Package,
    label: 'Crop Top',
    mobileLabel: 'Crop Top',
    thumb: getOptimizedUrl(getLandingAssetUrl('showcase/source-crop-top.jpg'), { quality: 50 }),
    delay: 1500,
  },
  {
    key: 'model' as const,
    icon: User,
    label: 'Zara +2',
    mobileLabel: 'Zara +2',
    thumb: '',
    delay: 1800,
  },
  {
    key: 'scene' as const,
    icon: Camera,
    label: 'Select scenes',
    mobileLabel: 'Scenes',
    thumb: getOptimizedUrl(getLandingAssetUrl('showcase/cafe-lifestyle.png'), { quality: 50 }),
    delay: 2200,
  },
];

const RESULT_CARDS = [
  { label: 'Studio', src: getOptimizedUrl(getLandingAssetUrl('showcase/virtual-tryon-1.png'), { quality: 60 }) },
  { label: 'Basketball Court', src: getOptimizedUrl(getLandingAssetUrl('showcase/virtual-tryon-2.png'), { quality: 60 }) },
  { label: 'Café', src: getOptimizedUrl(getLandingAssetUrl('showcase/cafe-lifestyle.png'), { quality: 60 }) },
];

type ChipKey = 'product' | 'model' | 'scene';

export function FreestyleShowcaseSection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [cycle, setCycle] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [activeChips, setActiveChips] = useState<Record<ChipKey, boolean>>({
    product: false,
    model: false,
    scene: false,
  });
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [visibleResults, setVisibleResults] = useState<number[]>([]);

  const promptText = isMobile ? PROMPT_TEXT_MOBILE : PROMPT_TEXT_FULL;

  // Preload tiny chip/avatar images so they're cached before animation reveals them
  useEffect(() => {
    const urls = [
      ...MODEL_AVATARS.map(m => m.src),
      ...CHIPS.map(c => c.thumb).filter(Boolean),
    ];
    urls.forEach(url => { const img = new Image(); img.src = url; });
  }, []);

  useEffect(() => {
    setTypedText('');
    setActiveChips({ product: false, model: false, scene: false });
    setGenerating(false);
    setProgress(0);
    setShowResults(false);
    setVisibleResults([]);

    const timers: ReturnType<typeof setTimeout>[] = [];

    let charIdx = 0;
    const typeTimer = setInterval(() => {
      if (charIdx < promptText.length) {
        charIdx = Math.min(charIdx + 3, promptText.length);
        setTypedText(promptText.slice(0, charIdx));
      } else {
        clearInterval(typeTimer);
      }
    }, 30);

    CHIPS.forEach((chip) => {
      timers.push(
        setTimeout(
          () => setActiveChips((prev) => ({ ...prev, [chip.key]: true })),
          chip.delay,
        ),
      );
    });

    timers.push(setTimeout(() => setGenerating(true), 3000));
    timers.push(setTimeout(() => setProgress(30), 3200));
    timers.push(setTimeout(() => setProgress(65), 3500));
    timers.push(setTimeout(() => setProgress(100), 3800));

    timers.push(
      setTimeout(() => {
        setGenerating(false);
        setShowResults(true);
      }, 4200),
    );

    RESULT_CARDS.forEach((_, i) => {
      timers.push(
        setTimeout(() => setVisibleResults((prev) => [...prev, i]), 4400 + i * 200),
      );
    });

    timers.push(setTimeout(() => setCycle((c) => c + 1), CYCLE_MS));

    return () => {
      clearInterval(typeTimer);
      timers.forEach(clearTimeout);
    };
  }, [cycle, promptText]);

  return (
    <section className="py-16 lg:py-32 relative overflow-hidden bg-[#FAFAF8]">
      <div className="container mx-auto px-6 lg:px-10 relative z-10 max-w-4xl">
        {/* Centered header */}
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Freestyle Studio
          </p>

          <h2 className="text-foreground text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-4">
            Your creative studio.{' '}
            <span className="text-primary">No limits.</span>
          </h2>

          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed hidden md:block">
            Describe what you want, pick your inputs, and get studio-quality images in seconds.
          </p>
          <p className="text-muted-foreground text-base leading-relaxed md:hidden">
            Describe it, generate it. Studio quality in seconds.
          </p>
        </div>

        {/* Demo panel — flattened toolbar style */}
        <div className="relative">
          <div className="rounded-3xl border border-[#f0efed] bg-white shadow-sm shadow-foreground/[0.04] overflow-hidden">
            {/* Progress bar */}
            <div className="h-[2px] rounded-t-2xl overflow-hidden">
              <div
                className={cn(
                  'h-full w-full origin-left transition-transform duration-300',
                  generating ? 'bg-primary' : 'bg-transparent',
                )}
                style={{ transform: `scaleX(${generating ? progress / 100 : 0})` }}
              />
            </div>

            <div className="p-3 md:p-5">
              {/* Prompt area */}
              <div className="rounded-xl border border-border/50 bg-background px-3 md:px-4 py-3 mb-4 h-[56px] md:h-[72px] flex items-start overflow-hidden">
                <p className="text-xs md:text-sm text-foreground/90 leading-relaxed flex-1 whitespace-nowrap overflow-hidden text-ellipsis md:whitespace-normal md:overflow-visible">
                  {typedText}
                  <span className="inline-block w-[2px] h-4 bg-primary ml-0.5 animate-pulse align-text-bottom" />
                </p>
              </div>

              {/* Chips + Generate row */}
              <div className="flex flex-nowrap items-center gap-1.5 sm:gap-2 h-10 overflow-hidden pl-1">
                {CHIPS.map((chip) => {
                  const Icon = chip.icon;
                  const active = activeChips[chip.key];
                  const isModel = chip.key === 'model';
                  return (
                    <div
                      key={chip.key}
                      className={cn(
                        'inline-flex items-center gap-1 sm:gap-1.5 h-8 px-2.5 sm:px-3 rounded-full text-[11px] font-medium border whitespace-nowrap transition-[color,background-color,border-color,transform] duration-500 shrink-0',
                        active
                          ? 'border-primary/40 bg-primary/10 text-primary sm:scale-105'
                          : 'border-border/50 bg-muted/30 text-muted-foreground/50',
                      )}
                    >
                      {active && isModel ? (
                        <div className="flex -space-x-1.5 shrink-0">
                          {MODEL_AVATARS.map((m, idx) => (
                            <img
                              key={m.name}
                              src={m.src}
                              alt={m.name}
                              className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover ring-1 ring-card"
                              style={{ zIndex: MODEL_AVATARS.length - idx }}
                            />
                          ))}
                        </div>
                      ) : active ? (
                        <img
                          src={chip.thumb}
                          alt={chip.label}
                          width={20}
                          height={20}
                          className="w-4 h-4 sm:w-5 sm:h-5 object-cover rounded ring-1 ring-border/40 bg-muted shrink-0"
                        />
                      ) : (
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span>
                        {active
                          ? (isMobile ? chip.mobileLabel : chip.label)
                          : chip.key.charAt(0).toUpperCase() + chip.key.slice(1)}
                      </span>
                    </div>
                  );
                })}

                {/* Generate button inline */}
                <button
                  className={cn(
                    'w-8 h-8 sm:w-auto sm:h-8 sm:px-4 rounded-lg text-xs font-semibold transition-[color,background-color,box-shadow,transform] duration-500 flex items-center justify-center gap-1.5 sm:gap-2 shrink-0 sm:ml-auto',
                    generating
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 sm:scale-[1.02]'
                      : showResults
                        ? 'bg-primary/80 text-primary-foreground'
                        : 'bg-muted text-muted-foreground',
                  )}
                >
                  {generating ? (
                    <>
                      <div className="w-3 h-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      <span className="hidden sm:inline">Generating…</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3" />
                      <span className="hidden sm:inline">Generate</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results grid */}
          <div className="mt-4">
          <div
            className={cn(
              'grid grid-cols-3 gap-3 transition-all duration-500',
              showResults ? 'opacity-100 visible' : 'opacity-0 invisible',
            )}
          >
            {RESULT_CARDS.map((card, i) => (
              <div
                key={i}
                className={cn(
                  'rounded-2xl overflow-hidden border border-[#f0efed] bg-white shadow-sm shadow-foreground/[0.04] transition-[opacity,transform] duration-500 will-change-[opacity,transform]',
                  visibleResults.includes(i)
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-4 scale-95',
                )}
              >
                <ShimmerImage
                  src={card.src}
                  alt={card.label}
                  loading="lazy"
                  aspectRatio="4/5"
                  className="w-full h-full object-cover"
                />
                <div className="px-2.5 py-1.5 bg-white">
                  <p className="text-[10px] text-muted-foreground font-medium truncate">
                    {card.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* CTA below results */}
        <div className="flex flex-col items-center gap-3 mt-12 lg:mt-16">
          <Button
            size="lg"
            className="rounded-full h-[3.25rem] px-8 text-base font-semibold gap-2 shadow-lg shadow-primary/25"
            onClick={() => navigate(user ? '/app/freestyle' : '/freestyle')}
          >
            Try Freestyle Free
            <Sparkles className="w-4 h-4" />
          </Button>
          <p className="text-xs text-muted-foreground">
            Free to start · No card required
          </p>
        </div>
      </div>
    </section>
  );
}
