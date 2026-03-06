import { useState, useEffect } from 'react';
import { Sparkles, User, Camera, Palette, RatioIcon, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

const PROMPT_TEXT = 'Editorial portrait in golden hour light, wearing our summer collection on a rooftop terrace...';
const CYCLE_MS = 11000;

interface ChipState {
  model: boolean;
  scene: boolean;
  style: boolean;
  ratio: boolean;
}

const CHIPS = [
  { key: 'model' as const, icon: User, label: 'Sofia', delay: 3000 },
  { key: 'scene' as const, icon: Camera, label: 'Rooftop Terrace', delay: 4000 },
  { key: 'style' as const, icon: Palette, label: 'Editorial', delay: 5000 },
  { key: 'ratio' as const, icon: RatioIcon, label: '4:5', delay: 5500 },
];

const RESULT_CARDS = [
  { label: 'Warm tones', gradient: 'from-amber-500/60 to-orange-400/40' },
  { label: 'Golden hour', gradient: 'from-yellow-400/50 to-rose-400/40' },
  { label: 'Soft shadows', gradient: 'from-rose-400/50 to-purple-400/40' },
];

const FEATURES = [
  'Write any creative prompt',
  'Mix models, scenes & styles',
  'Apply brand presets instantly',
  'Generate in any aspect ratio',
];

export function FreestyleShowcaseSection() {
  const [cycle, setCycle] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [chips, setChips] = useState<ChipState>({ model: false, scene: false, style: false, ratio: false });
  const [generating, setGenerating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [visibleResults, setVisibleResults] = useState<number[]>([]);

  useEffect(() => {
    // Reset state
    setTypedText('');
    setChips({ model: false, scene: false, style: false, ratio: false });
    setGenerating(false);
    setShowResults(false);
    setVisibleResults([]);

    const timers: ReturnType<typeof setTimeout>[] = [];

    // Typewriter
    let charIdx = 0;
    const typeTimer = setInterval(() => {
      if (charIdx < PROMPT_TEXT.length) {
        charIdx++;
        setTypedText(PROMPT_TEXT.slice(0, charIdx));
      } else {
        clearInterval(typeTimer);
      }
    }, 35);

    // Chips
    CHIPS.forEach(chip => {
      timers.push(setTimeout(() => setChips(prev => ({ ...prev, [chip.key]: true })), chip.delay));
    });

    // Generate pulse
    timers.push(setTimeout(() => setGenerating(true), 6200));

    // Results
    timers.push(setTimeout(() => {
      setGenerating(false);
      setShowResults(true);
    }, 7200));

    RESULT_CARDS.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleResults(prev => [...prev, i]), 7400 + i * 250));
    });

    // Loop
    timers.push(setTimeout(() => setCycle(c => c + 1), CYCLE_MS));

    return () => {
      clearInterval(typeTimer);
      timers.forEach(clearTimeout);
    };
  }, [cycle]);

  return (
    <section className="py-20 md:py-28 bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Copy */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Freestyle Studio
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
              Your Creative Studio.{' '}
              <span className="text-primary">No Limits.</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-md leading-relaxed">
              Write any prompt, pick a model and scene, apply your brand style — and watch
              studio-quality images appear in seconds. Complete creative freedom, zero photography overhead.
            </p>
            <ul className="space-y-2.5">
              {FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-foreground/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="/auth"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              Try Freestyle Free
              <Sparkles className="w-4 h-4" />
            </a>
          </div>

          {/* Right — Animated Demo */}
          <div className="relative">
            <div className="rounded-2xl border border-border/60 bg-card shadow-xl overflow-hidden">
              {/* Mock window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-muted/30">
                <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-status-warning/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-status-success/60" />
                <span className="ml-2 text-[10px] text-muted-foreground font-medium tracking-wide uppercase">Freestyle Studio</span>
              </div>

              <div className="p-4 space-y-3">
                {/* Prompt area */}
                <div className="rounded-xl border border-border/50 bg-background p-3 min-h-[72px]">
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {typedText}
                    <span className="inline-block w-[2px] h-4 bg-primary ml-0.5 animate-pulse align-text-bottom" />
                  </p>
                </div>

                {/* Chips row */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {CHIPS.map(chip => {
                    const Icon = chip.icon;
                    const active = chips[chip.key];
                    return (
                      <div
                        key={chip.key}
                        className={cn(
                          'inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[11px] font-medium border transition-all duration-500',
                          active
                            ? 'border-primary/40 bg-primary/10 text-primary scale-105'
                            : 'border-border/50 bg-muted/30 text-muted-foreground/50'
                        )}
                      >
                        <Icon className="w-3 h-3" />
                        {active ? chip.label : chip.key.charAt(0).toUpperCase() + chip.key.slice(1)}
                      </div>
                    );
                  })}
                </div>

                {/* Generate button */}
                <div
                  className={cn(
                    'w-full h-9 rounded-lg text-xs font-semibold transition-all duration-500 flex items-center justify-center gap-2',
                    generating
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-[1.02]'
                      : showResults
                        ? 'bg-primary/80 text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                  )}
                >
                  {generating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      Generate
                    </>
                  )}
                </div>

                {/* Results grid */}
                <div className={cn('grid grid-cols-3 gap-2 transition-all duration-500', showResults ? 'opacity-100' : 'opacity-0')}>
                  {RESULT_CARDS.map((card, i) => (
                    <div
                      key={i}
                      className={cn(
                        'rounded-lg overflow-hidden transition-all duration-500',
                        visibleResults.includes(i)
                          ? 'opacity-100 translate-y-0 scale-100'
                          : 'opacity-0 translate-y-3 scale-95'
                      )}
                    >
                      <div className={cn('aspect-[4/5] bg-gradient-to-br', card.gradient)} />
                      <div className="px-2 py-1.5 bg-muted/50">
                        <p className="text-[9px] text-muted-foreground font-medium truncate">{card.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
