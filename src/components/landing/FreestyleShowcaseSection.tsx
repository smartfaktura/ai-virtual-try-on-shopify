import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, User, Camera, Package, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { getLandingAssetUrl } from '@/lib/landingAssets';
import { cn } from '@/lib/utils';

const PROMPT_TEXT = 'Editorial portrait in golden hour light, wearing our summer collection on a rooftop terrace...';
const CYCLE_MS = 12000;

const CHIPS = [
  {
    key: 'product' as const,
    icon: Package,
    label: 'Cropped Tee',
    thumb: getLandingAssetUrl('hero/hero-product-tshirt.jpg'),
    delay: 3000,
  },
  {
    key: 'model' as const,
    icon: User,
    label: 'Sofia',
    thumb: getLandingAssetUrl('hero/hero-model-blonde.jpg'),
    delay: 4000,
    round: true,
  },
  {
    key: 'scene' as const,
    icon: Camera,
    label: 'Rooftop',
    thumb: getLandingAssetUrl('hero/hero-scene-yoga.jpg'),
    delay: 5000,
  },
];

const RESULT_CARDS = [
  { label: 'Studio Portrait', src: getLandingAssetUrl('hero/hero-output-studio.jpg') },
  { label: 'Coffee Shop', src: getLandingAssetUrl('hero/hero-output-coffee.jpg') },
  { label: 'Rooftop Editorial', src: getLandingAssetUrl('hero/hero-output-rooftop.jpg') },
];

type ChipKey = 'product' | 'model' | 'scene';

export function FreestyleShowcaseSection() {
  const navigate = useNavigate();
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
      if (charIdx < PROMPT_TEXT.length) {
        charIdx = Math.min(charIdx + 2, PROMPT_TEXT.length);
        setTypedText(PROMPT_TEXT.slice(0, charIdx));
      } else {
        clearInterval(typeTimer);
      }
    }, 50);

    CHIPS.forEach((chip) => {
      timers.push(
        setTimeout(
          () => setActiveChips((prev) => ({ ...prev, [chip.key]: true })),
          chip.delay,
        ),
      );
    });

    timers.push(setTimeout(() => setGenerating(true), 6000));
    timers.push(setTimeout(() => setProgress(30), 6200));
    timers.push(setTimeout(() => setProgress(65), 6600));
    timers.push(setTimeout(() => setProgress(100), 7000));

    timers.push(
      setTimeout(() => {
        setGenerating(false);
        setShowResults(true);
      }, 7500),
    );

    RESULT_CARDS.forEach((_, i) => {
      timers.push(
        setTimeout(() => setVisibleResults((prev) => [...prev, i]), 7700 + i * 300),
      );
    });

    timers.push(setTimeout(() => setCycle((c) => c + 1), CYCLE_MS));

    return () => {
      clearInterval(typeTimer);
      timers.forEach(clearTimeout);
    };
  }, [cycle]);

  return (
    <section className="py-20 md:py-28 relative overflow-hidden bg-[hsl(30,20%,98%)]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] md:w-[800px] md:h-[800px] bg-primary/[0.04] rounded-full blur-2xl md:blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 max-w-4xl">
        {/* Centered header */}
        <div className="text-center space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Freestyle Studio
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
            Your Creative Studio.{' '}
            <span className="text-primary">No Limits.</span>
          </h2>

          <p className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto">
            Describe what you want, pick your inputs, and get studio-quality images in seconds.
          </p>
        </div>

        {/* Demo panel — flattened toolbar style */}
        <div className="relative">
          <div className="rounded-2xl border border-border/60 bg-card shadow-xl overflow-hidden">
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

            <div className="p-4 md:p-5">
              {/* Prompt area */}
              <div className="rounded-xl border border-border/50 bg-background px-4 py-3 mb-4 min-h-[56px] flex items-start">
                <p className="text-sm text-foreground/90 leading-relaxed flex-1">
                  {typedText}
                  <span className="inline-block w-[2px] h-4 bg-primary ml-0.5 animate-pulse align-text-bottom" />
                </p>
              </div>

              {/* Chips + Generate row */}
              <div className="flex items-center gap-2 flex-wrap">
                {CHIPS.map((chip) => {
                  const Icon = chip.icon;
                  const active = activeChips[chip.key];
                  return (
                    <div
                      key={chip.key}
                      className={cn(
                        'inline-flex items-center gap-1.5 h-8 px-2.5 rounded-full text-[11px] font-medium border transition-[color,background-color,border-color,transform] duration-500',
                        active
                          ? 'border-primary/40 bg-primary/10 text-primary scale-105'
                          : 'border-border/50 bg-muted/30 text-muted-foreground/50',
                      )}
                    >
                      {active ? (
                        <img
                          src={chip.thumb}
                          alt={chip.label}
                          className={cn(
                            'w-5 h-5 object-cover',
                            chip.round ? 'rounded-full' : 'rounded',
                          )}
                        />
                      ) : (
                        <Icon className="w-3.5 h-3.5" />
                      )}
                      {active
                        ? chip.label
                        : chip.key.charAt(0).toUpperCase() + chip.key.slice(1)}
                    </div>
                  );
                })}

                {/* Generate button inline */}
                <button
                  className={cn(
                    'ml-auto h-8 px-4 rounded-lg text-xs font-semibold transition-[color,background-color,box-shadow,transform] duration-500 flex items-center gap-2',
                    generating
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-[1.02]'
                      : showResults
                        ? 'bg-primary/80 text-primary-foreground'
                        : 'bg-muted text-muted-foreground',
                  )}
                >
                  {generating ? (
                    <>
                      <div className="w-3 h-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3" />
                      Generate
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results grid */}
          <div
            className={cn(
              'grid grid-cols-3 gap-3 mt-4 transition-opacity duration-500',
              showResults ? 'opacity-100' : 'opacity-0 pointer-events-none',
            )}
          >
            {RESULT_CARDS.map((card, i) => (
              <div
                key={i}
                className={cn(
                  'rounded-xl overflow-hidden border border-border/50 bg-card shadow-md transition-all duration-500',
                  visibleResults.includes(i)
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-4 scale-95',
                )}
              >
                <ShimmerImage
                  src={card.src}
                  alt={card.label}
                  aspectRatio="4/5"
                  className="w-full h-full object-cover"
                />
                <div className="px-2.5 py-1.5 bg-card">
                  <p className="text-[10px] text-muted-foreground font-medium truncate">
                    {card.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA below results */}
        <div className="text-center mt-10">
          <Button
            size="lg"
            className="rounded-full px-8 py-6 text-base font-semibold gap-2 shadow-lg shadow-primary/25"
            onClick={() => navigate('/auth')}
          >
            Try Freestyle Free
            <Sparkles className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
