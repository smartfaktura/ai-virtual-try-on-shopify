import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { ArrowRight, CreditCard, Zap, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { getLandingAssetUrl } from '@/lib/landingAssets';
import { getOptimizedUrl } from '@/lib/imageOptimization';

const h = (file: string) => getLandingAssetUrl(`hero/${file}`);

const trustBadges = [
  { icon: CreditCard, text: 'No credit card required' },
  { icon: Sparkles, text: '20 free credits' },
  { icon: Zap, text: 'Start in seconds' },
];

interface ProductShowcase {
  product: { img: string; label: string; subtitle: string };
  outputs: { img: string; label: string }[];
  caption: string;
}

const showcases: ProductShowcase[] = [
  {
    product: { img: h('hero-product-croptop.jpg'), label: 'Crop Top', subtitle: '1 product photo' },
    outputs: [
      { img: h('hero-croptop-studio-lookbook.png'), label: 'Studio Lookbook' },
      { img: h('hero-croptop-golden-hour.png'), label: 'Golden Hour' },
      { img: h('hero-croptop-cafe-lifestyle.png'), label: 'Café Lifestyle' },
      { img: h('hero-croptop-studio-lounge.png'), label: 'Studio Lounge' },
      { img: h('hero-croptop-basketball-court.png'), label: 'Basketball Court' },
      { img: h('hero-croptop-urban-edge.png'), label: 'Urban Edge' },
      { img: h('hero-croptop-pilates-studio.png'), label: 'Pilates Studio' },
      { img: h('hero-croptop-studio-dark.png'), label: 'Studio Portrait' },
    ],
    caption: 'Same top ∞ environments in under 2 minutes',
  },
  {
    product: { img: h('hero-product-ring-new.png'), label: 'Ring', subtitle: '1 product photo' },
    outputs: [
      { img: h('hero-ring-fabric.png'), label: 'Linen Close-Up' },
      { img: h('hero-ring-portrait.png'), label: 'Model Portrait' },
      { img: h('hero-ring-hand.png'), label: 'On the Hand' },
      { img: h('hero-ring-concrete.png'), label: 'Concrete Block' },
      { img: h('hero-ring-eucalyptus.png'), label: 'Stone & Eucalyptus' },
      { img: h('hero-ring-floating.png'), label: 'Studio Floating' },
      { img: h('hero-ring-golden-light.png'), label: 'Golden Light' },
      { img: h('hero-ring-ugc.png'), label: 'Selfie / UGC' },
    ],
    caption: 'Same ring ∞ scenes in under 2 minutes',
  },
  {
    product: { img: h('hero-product-headphones.png'), label: 'Headphones', subtitle: '1 product photo' },
    outputs: [
      { img: h('hero-hp-desert.png'), label: 'Desert Portrait' },
      { img: h('hero-hp-studio-seated.png'), label: 'Studio Seated' },
      { img: h('hero-hp-elevator.png'), label: 'Elevator Selfie' },
      { img: h('hero-hp-linen.png'), label: 'Linen Editorial' },
      { img: h('hero-hp-cozy.png'), label: 'Cozy Knit' },
      { img: h('hero-hp-pilates.png'), label: 'Pilates Studio' },
      { img: h('hero-hp-white.png'), label: 'White Studio' },
      { img: h('hero-hp-home.png'), label: 'Home Lifestyle' },
    ],
    caption: 'Same headphones ∞ shots in under 2 minutes',
  },
];

const SLOGANS = [
  'Ready When You Are.',
  'No Studio Needed.',
  'Instant Brand Visuals.',
  'Every Product. Every Scene.',
  'Ads That Convert.',
  'Scale Without Limits.',
];

const SLOGANS_MOBILE = [
  'Ready When You Are.',
  'No Studio Needed.',
  'Instant Visuals.',
  'Every Product.',
  'Ads That Convert.',
  'Scale Without Limits.',
];

function useTypewriter(phrases: string[], typingSpeed = 55, deletingSpeed = 30, pauseDuration = 2400) {
  const [displayText, setDisplayText] = useState('');
  const state = useRef({
    phraseIndex: 0,
    charIndex: 0,
    phase: 'typing' as 'typing' | 'pausing' | 'deleting',
  });

  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout>;

    const tick = () => {
      const s = state.current;
      const currentPhrase = phrases[s.phraseIndex];

      if (s.phase === 'typing') {
        s.charIndex++;
        setDisplayText(currentPhrase.slice(0, s.charIndex));
        if (s.charIndex >= currentPhrase.length) {
          s.phase = 'pausing';
          timerId = setTimeout(tick, pauseDuration);
        } else {
          timerId = setTimeout(tick, typingSpeed + Math.random() * 40);
        }
      } else if (s.phase === 'pausing') {
        s.phase = 'deleting';
        timerId = setTimeout(tick, deletingSpeed);
      } else if (s.phase === 'deleting') {
        s.charIndex--;
        setDisplayText(currentPhrase.slice(0, s.charIndex));
        if (s.charIndex <= 0) {
          s.phase = 'typing';
          s.phraseIndex = (s.phraseIndex + 1) % phrases.length;
          timerId = setTimeout(tick, typingSpeed + 200);
        } else {
          timerId = setTimeout(tick, deletingSpeed + Math.random() * 15);
        }
      }
    };

    timerId = setTimeout(tick, typingSpeed);
    return () => clearTimeout(timerId);
  }, [phrases, typingSpeed, deletingSpeed, pauseDuration]);

  return displayText;
}

const optimizeProduct = (url: string) => getOptimizedUrl(url, { quality: 70 });
const optimizeOutput = (url: string) => getOptimizedUrl(url, { quality: 70 });

export function HeroSection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const scrollRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeScene, setActiveScene] = useState(0);
  const [pulsed, setPulsed] = useState(false);
  const [visibleDot, setVisibleDot] = useState(0);
  const typedText = useTypewriter(isMobile ? SLOGANS_MOBILE : SLOGANS);
  const visitedScenes = useRef(new Set([0]));

  const current = showcases[activeScene];
  const activeScrollEl = scrollRefs.current[activeScene];

  // Product image preload is handled by <link rel="preload"> in index.html

  // Only preload scene 0 outputs + product thumbnails for other scenes
  useEffect(() => {
    showcases[0].outputs.forEach(o => { new Image().src = optimizeOutput(o.img); });
    // Prefetch just the product thumbnails for inactive scenes (small images)
    showcases.slice(1).forEach(scene => { new Image().src = optimizeProduct(scene.product.img); });
  }, []);

  // Preload a scene's outputs on demand
  const preloadScene = useCallback((index: number) => {
    if (visitedScenes.current.has(index)) return;
    visitedScenes.current.add(index);
    showcases[index].outputs.forEach(o => { new Image().src = optimizeOutput(o.img); });
  }, []);

  const selectScene = useCallback((index: number) => {
    preloadScene(index);
    setActiveScene(index);
  }, [preloadScene]);

  // One-time attention pulse on product pills after 2s
  useEffect(() => {
    const t = setTimeout(() => setPulsed(true), 2000);
    return () => clearTimeout(t);
  }, []);

  const updateScrollState = useCallback(() => {
    const el = scrollRefs.current[activeScene];
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    const itemWidth = 165;
    const idx = Math.round(el.scrollLeft / itemWidth);
    setVisibleDot(Math.min(idx, current.outputs.length - 1));
  }, [activeScene, current.outputs.length]);

  // Reset scroll when switching scenes
  useEffect(() => {
    const el = scrollRefs.current[activeScene];
    if (el) {
      el.scrollTo({ left: 0 });
      setVisibleDot(0);
      requestAnimationFrame(updateScrollState);
    }
  }, [activeScene, updateScrollState]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRefs.current[activeScene];
    if (!el) return;
    const amount = 220;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/8 rounded-full blur-3xl opacity-30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto mb-14">
          <h1 className="text-[2rem] sm:text-5xl lg:text-6xl font-semibold text-foreground tracking-tight leading-[1.1] mb-6">
            <span className="hidden sm:inline">Your AI Visual Team.</span>
            <span className="sm:hidden">Your AI Visual Team.</span>
            <br />
            <span className="text-primary inline-block whitespace-nowrap h-[1.15em] sm:h-auto">
              {typedText}
              <span className="inline-block w-[3px] h-[0.85em] bg-primary ml-0.5 align-middle animate-[blink_1s_step-end_infinite]" />
            </span>
          </h1>

          <p className="hidden sm:block text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload a product photo and create high-quality visuals for ads, product listings, and campaigns in seconds.
          </p>
          <p className="sm:hidden text-[15px] text-muted-foreground max-w-xs mx-auto mb-8 leading-relaxed">
            Upload one product photo, get ∞ brand ready visuals in seconds.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="rounded-full px-8 py-6 text-base font-semibold gap-2 shadow-lg shadow-primary/25" onClick={() => navigate(user ? '/app/workflows' : '/auth')}>
              Create My First Visual Set
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full px-8 py-6 text-base font-semibold"
              asChild
            >
              <Link to="/discover">See Real Examples</Link>
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
            {trustBadges.map((badge) => (
              <div key={badge.text} className="flex items-center gap-2 text-sm text-muted-foreground">
                <badge.icon className="w-4 h-4 text-primary" />
                {badge.text}
              </div>
            ))}
          </div>
        </div>

        {/* Visual showcase: Upload → Carousel of outputs */}
        <div className="max-w-6xl mx-auto">
          {/* ===== MOBILE: Carousel with arrows + bottom product strip ===== */}
          <div className="flex md:hidden flex-col gap-2 px-2">
            {/* Output images carousel with arrow buttons */}
            <div className="relative">
              {/* Left arrow — hidden at scroll start */}
              <button
                onClick={() => scroll('left')}
                className={`absolute -left-1 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-card/95 border border-border shadow-md flex items-center justify-center backdrop-blur-sm transition-all duration-200 active:scale-90 ${
                  canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>
              {/* Right arrow — hidden at scroll end */}
              <button
                onClick={() => scroll('right')}
                className={`absolute -right-1 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-card/95 border border-border shadow-md flex items-center justify-center backdrop-blur-sm transition-all duration-200 active:scale-90 ${
                  canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5 text-foreground" />
              </button>

              {/* Edge gradient overlays */}
              {canScrollLeft && (
                <div className="absolute left-0 top-0 bottom-1 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none rounded-l-xl" />
              )}
              {canScrollRight && (
                <div className="absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none rounded-r-xl" />
              )}

              {showcases.map((showcase, sceneIdx) => (
                <div
                  key={sceneIdx}
                  ref={el => { scrollRefs.current[sceneIdx] = el; }}
                  onScroll={sceneIdx === activeScene ? updateScrollState : undefined}
                  data-hero-carousel
                  className="flex gap-2.5 overflow-x-auto pb-1 snap-x snap-mandatory px-4"
                  style={{ display: sceneIdx === activeScene ? 'flex' : 'none', scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
                >
                  {showcase.outputs.map((output, idx) => (
                    <div key={output.label} className="flex-shrink-0 w-[155px] snap-start">
                      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                        <div className="relative aspect-[3/4]">
                          <ShimmerImage
                            src={optimizeOutput(output.img)}
                            alt={output.label}
                            className="w-full h-full object-cover"
                            aspectRatio="3/4"
                            width={155}
                            height={207}
                            loading={sceneIdx === 0 && idx < 3 ? 'eager' : 'lazy'}
                            fetchPriority={sceneIdx === 0 && idx < 2 ? 'high' : undefined}
                          />
                          <span className="absolute bottom-1.5 left-1.5 text-[9px] font-semibold bg-primary/80 text-primary-foreground px-1.5 py-0.5 rounded" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                            {output.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Dot indicators */}
            <div className="flex gap-1.5 justify-center pt-1">
              {current.outputs.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const el = scrollRefs.current[activeScene];
                    if (el) el.scrollTo({ left: i * 168, behavior: 'smooth' });
                  }}
                  className={`rounded-full transition-all duration-200 ${
                    visibleDot === i
                      ? 'w-4 h-1.5 bg-primary'
                      : 'w-1.5 h-1.5 bg-muted-foreground/30'
                  }`}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>

            {/* Bottom product strip: thumbnail + text + scene pills */}
            <div className="flex items-center gap-2.5 px-2">
              <div className="relative flex-shrink-0 w-12 h-16 rounded-lg overflow-hidden border border-border shadow-sm">
                {showcases.map((sc, scIdx) => (
                  <ShimmerImage
                    key={scIdx}
                    src={optimizeProduct(sc.product.img)}
                    alt={sc.product.label}
                    wrapperClassName="absolute inset-0"
                    className="w-full h-full object-cover"
                    width={48}
                    height={64}
                    fetchPriority={scIdx === 0 ? 'high' : undefined}
                    style={{ opacity: scIdx === activeScene ? 1 : 0, transition: 'opacity 0.3s' }}
                  />
                ))}
              </div>
              <div className="flex flex-col gap-1.5 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-foreground whitespace-nowrap">1 photo</span>
                  <ArrowRight className="w-3 h-3 text-primary flex-shrink-0" />
                  <span className="text-[11px] font-bold text-primary whitespace-nowrap">∞ results</span>
                </div>
                <span className="text-[10px] text-muted-foreground">Switch product ↓</span>
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                  {showcases.map((sc, i) => (
                    <button
                      key={i}
                      onClick={() => selectScene(i)}
                      onMouseEnter={() => preloadScene(i)}
                      className={`px-3 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
                        activeScene === i
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm scale-105'
                          : 'bg-card text-muted-foreground border-border/80 hover:border-primary/40'
                      }`}
                    >
                      {sc.product.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-center text-[11px] text-muted-foreground">
              {current.caption}
            </p>
          </div>

          {/* ===== DESKTOP: Side-by-side upload + carousel ===== */}
          <div className="hidden md:flex md:items-center gap-8">
            {/* Original upload card with scene switcher */}
            <div className="flex-shrink-0 w-[200px]">
              <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-lg">
                <div className="relative aspect-[3/4]">
                  {showcases.map((sc, scIdx) => (
                    <ShimmerImage
                      key={scIdx}
                      src={optimizeProduct(sc.product.img)}
                      alt={sc.product.label}
                      wrapperClassName="absolute inset-0"
                      className="w-full h-full object-cover transition-opacity duration-500"
                      width={200}
                      height={267}
                      fetchPriority={scIdx === 0 ? 'high' : undefined}
                      style={{ opacity: scIdx === activeScene ? 1 : 0 }}
                    />
                  ))}
                  <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-background/90 text-foreground z-10">
                    Your Upload
                  </span>
                </div>
                <div className="p-3 text-center">
                  <p className="text-sm font-semibold text-foreground">{current.product.subtitle}</p>
                  <p className="text-xs text-muted-foreground">That's all you need</p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-1.5 mt-3">
                <span className="text-[11px] text-muted-foreground">Try different products</span>
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  {showcases.map((sc, i) => (
                    <button
                      key={i}
                      onClick={() => selectScene(i)}
                      onMouseEnter={() => preloadScene(i)}
                      className={`px-3 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                        activeScene === i
                          ? 'bg-primary text-primary-foreground border-primary shadow-md scale-105'
                          : `bg-card text-muted-foreground border-border/80 hover:border-primary/40 hover:text-foreground hover:bg-accent/50 ${
                              !pulsed ? 'animate-[pillPulse_1.5s_ease-in-out_2s_2]' : ''
                            }`
                      }`}
                    >
                      {sc.product.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Flow arrow */}
            <div className="flex-shrink-0 flex flex-col items-center gap-1">
              <div className="w-10 h-px bg-border" />
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <ChevronRight className="w-4 h-4 text-primary" />
              </div>
              <div className="w-10 h-px bg-border" />
            </div>

            {/* Output carousel */}
            <div className="flex-1 min-w-0 relative">
              <button
                onClick={() => scroll('left')}
                className={`absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-card border border-border shadow-md flex items-center justify-center transition-all ${
                  canScrollLeft ? 'opacity-100 hover:bg-accent' : 'opacity-0 pointer-events-none'
                }`}
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4 text-foreground" />
              </button>
              <button
                onClick={() => scroll('right')}
                className={`absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-card border border-border shadow-md flex items-center justify-center transition-all ${
                  canScrollRight ? 'opacity-100 hover:bg-accent' : 'opacity-0 pointer-events-none'
                }`}
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4 text-foreground" />
              </button>

              {canScrollRight && (
                <div className="absolute right-0 top-0 bottom-3 w-16 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
              )}

              {showcases.map((showcase, sceneIdx) => (
                <div
                  key={sceneIdx}
                  ref={el => { scrollRefs.current[sceneIdx] = el; }}
                  onScroll={sceneIdx === activeScene ? updateScrollState : undefined}
                  data-hero-carousel
                  className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory"
                  style={{ display: sceneIdx === activeScene ? 'flex' : 'none', scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
                >
                  {showcase.outputs.map((output, idx) => (
                    <div key={output.label} className="flex-shrink-0 w-[180px] snap-start group">
                      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-md group-hover:shadow-lg group-hover:border-primary/30 transition-all duration-300">
                        <div className="relative aspect-[3/4]">
                          <ShimmerImage
                            src={optimizeOutput(output.img)}
                            alt={output.label}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            decoding="async"
                            loading={sceneIdx === 0 && idx < 3 ? 'eager' : 'lazy'}
                            fetchPriority={sceneIdx === 0 && idx < 2 ? 'high' : undefined}
                            aspectRatio="3/4"
                            width={180}
                            height={240}
                          />
                          <span className="absolute bottom-2 left-2 text-[10px] font-semibold bg-primary text-primary-foreground px-2 py-0.5 rounded">
                            {output.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              <div className="flex items-center justify-center gap-1.5 mt-2">
                {current.outputs.map((_, idx) => (
                  <div
                    key={idx}
                    className={`rounded-full transition-all duration-300 ${
                      idx === visibleDot ? 'w-4 h-1.5 bg-primary' : 'w-1.5 h-1.5 bg-border'
                    }`}
                  />
                ))}
              </div>

              <p className="text-center text-xs text-muted-foreground mt-2">
                {current.caption}
              </p>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
