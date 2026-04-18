import { useState, useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useParams } from 'react-router-dom';
import { ArrowUp, Download, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { ShimmerImage } from '@/components/ui/shimmer-image';

const ROTATING_WORDS = ['sneakers', 'skincare', 'furniture', 'fashion', 'electronics', 'jewelry'];

/** Map each rotating word to discover_presets categories that best match */
const WORD_CATEGORY_MAP: Record<string, string[]> = {
  sneakers: ['footwear', 'sneakers', 'shoes', 'fashion'],
  skincare: ['skincare', 'beauty', 'cosmetics'],
  furniture: ['furniture', 'home', 'interior', 'lifestyle'],
  fashion: ['fashion', 'clothing', 'apparel', 'lifestyle'],
  electronics: ['electronics', 'tech', 'gadgets'],
  jewelry: ['jewelry', 'accessories', 'luxury'],
};

type GenerationResult = {
  product_name: string;
  original_image: string;
  generated_image: string;
};

type GenerationStep = 'idle' | 'scraping' | 'extracting' | 'generating' | 'done' | 'error';

const STEP_LABELS: Record<GenerationStep, string> = {
  idle: '',
  scraping: 'Scanning website…',
  extracting: 'Finding products…',
  generating: 'Creating product shots…',
  done: 'Done!',
  error: 'Something went wrong',
};

type DiscoverPreset = {
  id: string;
  title: string;
  image_url: string;
  category: string;
  discover_categories: string[];
};

export default function TryShot() {
  const { domain: routeDomain } = useParams<{ domain: string }>();
  const [url, setUrl] = useState(routeDomain || '');
  const [step, setStep] = useState<GenerationStep>('idle');
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [error, setError] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [displayWord, setDisplayWord] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setTimeout>>();

  // Fetch discover presets
  const [presets, setPresets] = useState<DiscoverPreset[]>([]);
  const [presetsLoading, setPresetsLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('discover_presets')
      .select('id, title, image_url, category, discover_categories')
      .order('sort_order', { ascending: true })
      .limit(40)
      .then(({ data }) => {
        setPresets(data ?? []);
        setPresetsLoading(false);
      });
  }, []);

  /** Pick the best preset image for a given rotating word */
  const wordImages = useMemo(() => {
    if (!presets.length) return ROTATING_WORDS.map(() => '');
    return ROTATING_WORDS.map((word) => {
      const cats = WORD_CATEGORY_MAP[word] || [];
      // Try matching discover_categories first, then category field
      const match = presets.find(
        (p) =>
          p.discover_categories?.some((dc) => cats.includes(dc.toLowerCase())) ||
          cats.includes(p.category.toLowerCase())
      );
      // Fallback: just pick a preset by index
      return match?.image_url || presets[ROTATING_WORDS.indexOf(word) % presets.length]?.image_url || '';
    });
  }, [presets]);

  /** Grid categories derived from presets — pick up to 6 unique images */
  const gridItems = useMemo(() => {
    if (!presets.length) return [];
    const labels = ['Beauty', 'Sneakers', 'Electronics', 'Skincare', 'Home & Living', 'Jewelry'];
    const labelCats: Record<string, string[]> = {
      Beauty: ['beauty', 'cosmetics', 'skincare'],
      Sneakers: ['footwear', 'sneakers', 'shoes', 'fashion'],
      Electronics: ['electronics', 'tech', 'gadgets'],
      Skincare: ['skincare', 'beauty', 'cosmetics'],
      'Home & Living': ['home', 'furniture', 'interior', 'lifestyle'],
      Jewelry: ['jewelry', 'accessories', 'luxury'],
    };
    const used = new Set<string>();
    return labels.map((label, idx) => {
      const cats = labelCats[label] || [];
      const match = presets.find(
        (p) =>
          !used.has(p.id) &&
          (p.discover_categories?.some((dc) => cats.includes(dc.toLowerCase())) ||
            cats.includes(p.category.toLowerCase()))
      );
      const chosen = match || presets.filter((p) => !used.has(p.id))[0];
      if (chosen) used.add(chosen.id);
      return { label, image: chosen?.image_url || '' };
    });
  }, [presets]);

  // Typewriter effect
  useEffect(() => {
    const currentWord = ROTATING_WORDS[wordIndex];

    if (!isDeleting && displayWord === currentWord) {
      intervalRef.current = setTimeout(() => setIsDeleting(true), 2000);
      return () => clearTimeout(intervalRef.current);
    }

    if (isDeleting && displayWord === '') {
      setIsDeleting(false);
      setWordIndex((i) => (i + 1) % ROTATING_WORDS.length);
      return;
    }

    const speed = isDeleting ? 40 : 80;
    intervalRef.current = setTimeout(() => {
      setDisplayWord(
        isDeleting
          ? currentWord.slice(0, displayWord.length - 1)
          : currentWord.slice(0, displayWord.length + 1)
      );
    }, speed);

    return () => clearTimeout(intervalRef.current);
  }, [displayWord, isDeleting, wordIndex]);

  // Smooth progress bar
  const cycleDuration = ROTATING_WORDS[wordIndex].length * 120 + 2000;

  useEffect(() => {
    setProgress(0);
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => setProgress(100));
    });
    return () => cancelAnimationFrame(raf1);
  }, [wordIndex]);

  const handleGenerate = async () => {
    const cleanDomain = url.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!cleanDomain || !cleanDomain.includes('.')) {
      setError('Please enter a valid domain like nike.com');
      return;
    }

    setError('');
    setResults([]);
    setStep('scraping');

    try {
      const stepTimer1 = setTimeout(() => setStep('extracting'), 3000);
      const stepTimer2 = setTimeout(() => setStep('generating'), 7000);

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/try-website-shot`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain: cleanDomain }),
        }
      );

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      const data = await response.json();

      if (!response.ok || !data.success) {
        setStep('error');
        setError(data.error || 'Failed to generate. Please try again.');
        return;
      }

      setResults(data.results || []);
      setStep('done');
    } catch (err) {
      console.error('TryShot error:', err);
      setStep('error');
      setError('Network error. Please try again.');
    }
  };

  const isLoading = step === 'scraping' || step === 'extracting' || step === 'generating';

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <a href="https://vovv.ai" className="text-xl font-bold tracking-tight text-foreground">
          VOVV.AI
        </a>
        <a href="https://vovv.ai/auth">
          <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90 px-5 text-xs font-semibold">
            Get Started Free
          </Button>
        </a>
      </nav>

      {/* Hero */}
      <main className="max-w-3xl mx-auto px-6 pb-12 text-center flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
        <h1 className="text-4xl sm:text-5xl md:text-[3.5rem] font-bold tracking-tight leading-[1.1] mb-6 text-foreground">
          Product shots
          <br />
          for{' '}
          <span className="font-bold" style={{ color: 'hsl(217, 60%, 35%)' }}>
            {displayWord}
            <span className="animate-pulse">|</span>
          </span>
        </h1>

        {/* Hero showcase image — synced to typewriter word */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-44 sm:w-52 aspect-[3/4] rounded-2xl overflow-hidden shadow-xl ring-2 ring-primary/10">
            {presetsLoading ? (
              <Skeleton className="w-full h-full" />
            ) : (
              wordImages.map((img, i) => (
                <ShimmerImage
                  key={i}
                  src={img}
                  alt={`${ROTATING_WORDS[i]} product shot`}
                  className="absolute inset-0 w-full h-full object-cover"
                  wrapperClassName="absolute inset-0"
                  style={{ opacity: i === wordIndex ? 1 : 0, transition: 'opacity 700ms ease-in-out' }}
                />
              ))
            )}
            {/* Progress bar at bottom of image */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 z-10">
              <div
                key={wordIndex}
                className="h-full bg-white/80 rounded-r-full"
                style={{
                  width: `${progress}%`,
                  transition: progress === 0 ? 'none' : `width ${cycleDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-base text-muted-foreground max-w-md mx-auto mb-5">
          Enter your online store URL to create AI product shots
        </p>

        {/* URL Input */}
        <div className="max-w-lg mx-auto mb-3">
          <div className="relative flex items-center bg-secondary rounded-full border border-border overflow-hidden">
            <input
              type="text"
              placeholder="Enter online store URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleGenerate()}
              disabled={isLoading}
              className="flex-1 h-14 pl-6 pr-4 bg-transparent text-foreground placeholder:text-muted-foreground text-base outline-none"
            />
            <button
              onClick={handleGenerate}
              disabled={isLoading || !url.trim()}
              className="flex-shrink-0 w-11 h-11 mr-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowUp className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground/50 mt-1 mb-2">
          Free · No sign-up required
        </p>

        {error && <p className="text-sm text-destructive mt-2">{error}</p>}

        {/* Progress */}
        {isLoading && (
          <div className="mt-10 space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm text-muted-foreground">{STEP_LABELS[step]}</span>
            </div>
            <div className="w-48 mx-auto h-1 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: step === 'scraping' ? '30%' : step === 'extracting' ? '60%' : '85%',
                }}
              />
            </div>
          </div>
        )}

        {/* Results */}
        {step === 'done' && results.length > 0 && (
          <div className="mt-14 space-y-8">
            <h2 className="text-2xl font-bold">Your product shots</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {results.map((r, i) => (
                <div key={i} className="rounded-2xl overflow-hidden bg-card border border-border">
                  <div className="aspect-square relative group">
                    <img src={r.generated_image} alt={r.product_name} className="w-full h-full object-cover" />
                    <a
                      href={r.generated_image}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-3 right-3 p-2 rounded-lg bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Download className="w-4 h-4 text-white" />
                    </a>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-sm font-medium truncate">{r.product_name}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="pt-8 border-t border-border">
              <p className="text-muted-foreground mb-4">
                Want more? Get <span className="text-foreground font-semibold">20 free credits</span> when you sign up.
              </p>
              <a href="https://vovv.ai/auth">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                  Start creating for free
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </div>
          </div>
        )}

        {step === 'done' && results.length === 0 && (
          <div className="mt-12 text-muted-foreground">
            <p>We couldn't find any product images on this site. Try a different store URL.</p>
          </div>
        )}
      </main>

      {/* Works with most products */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center mb-3">
          Works with most products
        </h2>
        <div className="w-12 h-0.5 bg-primary mx-auto mb-10" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {presetsLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="rounded-2xl aspect-[3/4]" />
              ))
            : gridItems.map((cat) => (
                <div key={cat.label} className="group relative rounded-2xl overflow-hidden aspect-[3/4]">
                  <ShimmerImage
                    src={cat.image}
                    alt={cat.label}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    aspectRatio="3/4"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                    {cat.label}
                  </span>
                </div>
              ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-muted-foreground/60">
        Powered by{' '}
        <a href="https://vovv.ai" className="text-primary hover:text-primary/80 transition-colors font-medium">
          VOVV.AI
        </a>{' '}
        · AI product photography
      </footer>
    </div>
  );
}
