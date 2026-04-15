import { useEffect, useState, useRef } from 'react';
import { Sparkles, ArrowRight, Package, User, Camera, Play } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getLandingAssetUrl } from '@/lib/landingAssets';
import { getOptimizedUrl } from '@/lib/imageOptimization';

/* ── Assets (reuse landing page URLs) ── */
const MODEL_AVATARS = [
  { name: 'Zara', src: getOptimizedUrl(getLandingAssetUrl('models/model-female-athletic-mixed.jpg'), { quality: 40, width: 40 }) },
  { name: 'Freya', src: getOptimizedUrl(getLandingAssetUrl('models/model-female-average-nordic.jpg'), { quality: 40, width: 40 }) },
  { name: 'Olivia', src: getOptimizedUrl(getLandingAssetUrl('models/model-035-olivia.jpg'), { quality: 40, width: 40 }) },
];

const CHIP_THUMB = getOptimizedUrl(getLandingAssetUrl('showcase/source-crop-top.jpg'), { quality: 40, width: 40 });
const SCENE_THUMB = getOptimizedUrl(getLandingAssetUrl('showcase/cafe-lifestyle.png'), { quality: 40, width: 40 });

const RESULT_CARDS = [
  { label: 'Studio', src: getOptimizedUrl(getLandingAssetUrl('showcase/virtual-tryon-1.png'), { quality: 50, width: 200 }) },
  { label: 'Court', src: getOptimizedUrl(getLandingAssetUrl('showcase/virtual-tryon-2.png'), { quality: 50, width: 200 }) },
  { label: 'Café', src: getOptimizedUrl(getLandingAssetUrl('showcase/cafe-lifestyle.png'), { quality: 50, width: 200 }) },
];

const PROMPT_TEXT = 'Shoot my crop top on a court, studio, and café';
const CYCLE_MS = 6500;

type ChipKey = 'product' | 'model' | 'scene';

const CHIPS: { key: ChipKey; icon: typeof Package; label: string; delay: number }[] = [
  { key: 'product', icon: Package, label: 'Crop Top', delay: 1200 },
  { key: 'model', icon: User, label: 'Zara +2', delay: 1500 },
  { key: 'scene', icon: Camera, label: 'Scenes', delay: 1800 },
];

/* ── Main card ── */
interface Props { onSelect: () => void; mobileCompact?: boolean; }

export function FreestylePromptCard({ onSelect, mobileCompact }: Props) {
  const [cycle, setCycle] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [activeChips, setActiveChips] = useState<Record<ChipKey, boolean>>({ product: false, model: false, scene: false });
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [visibleResults, setVisibleResults] = useState<number[]>([]);
  const [hovered, setHovered] = useState(false);

  // Preload tiny images
  useEffect(() => {
    [...MODEL_AVATARS.map(m => m.src), CHIP_THUMB, SCENE_THUMB, ...RESULT_CARDS.map(r => r.src)]
      .forEach(url => { const img = new Image(); img.src = url; });
  }, []);

  // Animation cycle
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
        charIdx = Math.min(charIdx + 3, PROMPT_TEXT.length);
        setTypedText(PROMPT_TEXT.slice(0, charIdx));
      } else {
        clearInterval(typeTimer);
      }
    }, 30);

    CHIPS.forEach((chip) => {
      timers.push(setTimeout(() => setActiveChips(prev => ({ ...prev, [chip.key]: true })), chip.delay));
    });

    timers.push(setTimeout(() => setGenerating(true), 2400));
    timers.push(setTimeout(() => setProgress(30), 2600));
    timers.push(setTimeout(() => setProgress(65), 2900));
    timers.push(setTimeout(() => setProgress(100), 3200));
    timers.push(setTimeout(() => { setGenerating(false); setShowResults(true); }, 3600));

    RESULT_CARDS.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleResults(prev => [...prev, i]), 3800 + i * 180));
    });

    timers.push(setTimeout(() => setCycle(c => c + 1), CYCLE_MS));

    return () => { clearInterval(typeTimer); timers.forEach(clearTimeout); };
  }, [cycle]);

  return (
    <Card
      className={cn(
        'group relative overflow-hidden border transition-all duration-300 flex flex-col cursor-pointer',
        'hover:shadow-lg',
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onSelect}
    >
      {/* ── Visual area ── */}
      <div className={cn(
        'relative w-full overflow-hidden bg-gradient-to-br from-foreground/[0.02] via-muted/40 to-primary/[0.03]',
        mobileCompact ? 'aspect-[2/3]' : 'aspect-[3/4]',
      )}>
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] z-10 overflow-hidden">
          <div
            className={cn('h-full w-full origin-left transition-transform duration-300', generating ? 'bg-primary' : 'bg-transparent')}
            style={{ transform: `scaleX(${generating ? progress / 100 : 0})` }}
          />
        </div>

        <div className="absolute inset-0 flex flex-col px-2 pt-3 pb-2 gap-1.5">
          {/* Prompt box */}
          <div className={cn(
            'rounded-lg border bg-card/80 backdrop-blur-sm px-2 py-1.5 min-h-[28px] flex items-start transition-colors duration-300',
            hovered ? 'border-primary/30' : 'border-border/50',
          )}>
            <p className="text-[9px] leading-relaxed text-foreground/80 flex-1 line-clamp-2">
              {typedText}
              <span className="inline-block w-[1px] h-2.5 bg-primary/60 ml-0.5 animate-pulse align-text-bottom" />
            </p>
          </div>

          {/* Chips + Generate row */}
          <div className="flex items-center gap-1 overflow-hidden">
            {CHIPS.map((chip) => {
              const Icon = chip.icon;
              const active = activeChips[chip.key];
              const isModel = chip.key === 'model';
              return (
                <div
                  key={chip.key}
                  className={cn(
                    'inline-flex items-center gap-0.5 h-5 px-1.5 rounded-full text-[8px] font-medium border whitespace-nowrap transition-all duration-500 shrink-0',
                    active
                      ? 'border-primary/40 bg-primary/10 text-primary scale-105'
                      : 'border-border/40 bg-muted/30 text-muted-foreground/50',
                  )}
                >
                  {active && isModel ? (
                    <div className="flex -space-x-1 shrink-0">
                      {MODEL_AVATARS.map((m, idx) => (
                        <img key={m.name} src={m.src} alt={m.name}
                          className="w-3 h-3 rounded-full object-cover ring-1 ring-card"
                          style={{ zIndex: MODEL_AVATARS.length - idx }}
                        />
                      ))}
                    </div>
                  ) : active && chip.key === 'product' ? (
                    <img src={CHIP_THUMB} alt="Product" className="w-3 h-3 object-cover rounded ring-1 ring-border/40 shrink-0" />
                  ) : active && chip.key === 'scene' ? (
                    <img src={SCENE_THUMB} alt="Scene" className="w-3 h-3 object-cover rounded ring-1 ring-border/40 shrink-0" />
                  ) : (
                    <Icon className="w-2.5 h-2.5 shrink-0" />
                  )}
                  <span>{active ? chip.label : chip.key.charAt(0).toUpperCase() + chip.key.slice(1)}</span>
                </div>
              );
            })}

            {/* Mini generate button */}
            <div className={cn(
              'ml-auto w-5 h-5 rounded-md flex items-center justify-center transition-all duration-500 shrink-0',
              generating
                ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/30'
                : showResults
                  ? 'bg-primary/80 text-primary-foreground'
                  : 'bg-muted text-muted-foreground',
            )}>
              {generating ? (
                <div className="w-2 h-2 border border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <Play className="w-2 h-2" />
              )}
            </div>
          </div>

          {/* Result images */}
          <div className={cn(
            'flex-1 grid grid-cols-3 gap-1 transition-all duration-500 min-h-0',
            showResults ? 'opacity-100' : 'opacity-0',
          )}>
            {RESULT_CARDS.map((card, i) => (
              <div
                key={i}
                className={cn(
                  'rounded-md overflow-hidden border border-border/40 bg-card transition-all duration-500',
                  visibleResults.includes(i)
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-2 scale-95',
                )}
              >
                <img src={card.src} alt={card.label} className="w-full h-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content area ── */}
      <div className={cn('flex flex-col gap-1 flex-1', mobileCompact ? 'p-2' : 'p-4')}>
        <h3 className={cn('font-bold tracking-tight leading-tight', mobileCompact ? 'text-[11px]' : 'text-sm')}>
          Freestyle Studio
        </h3>
        {!mobileCompact && (
          <p className="text-xs text-muted-foreground leading-relaxed">Describe any shot, scene, or style you want.</p>
        )}
        <div className="pt-1 mt-auto">
          <Button
            size="sm"
            variant="outline"
            className={cn(
              'rounded-full font-semibold gap-1.5 w-full border-primary/20 hover:bg-primary hover:text-primary-foreground transition-colors',
              mobileCompact ? 'h-8 px-3 text-xs' : 'h-8 px-5',
            )}
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
          >
            Create with Prompt
            <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
