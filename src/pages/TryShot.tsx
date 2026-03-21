import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useParams } from 'react-router-dom';
import { ArrowUp, Download, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

import showcaseBeauty from '@/assets/tryshot/showcase-beauty.jpg';
import showcaseSneakers from '@/assets/tryshot/showcase-sneakers.jpg';
import showcaseElectronics from '@/assets/tryshot/showcase-electronics.jpg';
import showcaseSkincare from '@/assets/tryshot/showcase-skincare.jpg';
import showcaseHome from '@/assets/tryshot/showcase-home.jpg';
import showcaseJewelry from '@/assets/tryshot/showcase-jewelry.jpg';

const ROTATING_WORDS = ['sneakers', 'skincare', 'furniture', 'fashion', 'electronics', 'jewelry'];
const WORD_IMAGES = [showcaseSneakers, showcaseSkincare, showcaseHome, showcaseBeauty, showcaseElectronics, showcaseJewelry];

const CATEGORIES = [
  { label: 'Beauty', image: showcaseBeauty },
  { label: 'Sneakers', image: showcaseSneakers },
  { label: 'Electronics', image: showcaseElectronics },
  { label: 'Skincare', image: showcaseSkincare },
  { label: 'Home & Living', image: showcaseHome },
  { label: 'Jewelry', image: showcaseJewelry },
];

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
          <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-5 text-xs font-semibold">
            Get started
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
          <div className="relative w-44 sm:w-52 aspect-[3/4] rounded-2xl overflow-hidden shadow-xl rotate-[-2deg] ring-2 ring-primary/10">
            {WORD_IMAGES.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`${ROTATING_WORDS[i]} product shot`}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out"
                style={{ opacity: i === wordIndex ? 1 : 0 }}
              />
            ))}
            {/* Progress bar at bottom of image */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
              <div
                className="h-full bg-white/80 rounded-r-full transition-all duration-300 ease-linear"
                style={{ width: `${((wordIndex + 1) / ROTATING_WORDS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-base text-muted-foreground max-w-md mx-auto mb-5">
          Enter your online store URL to create AI product shots
        </p>

        {/* URL Input — pill style with embedded submit */}
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
              className="flex-shrink-0 w-11 h-11 mr-1.5 rounded-full bg-primary text-white hover:bg-primary/90 disabled:opacity-40 transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <ArrowUp className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground/50 mt-1 mb-2">
          Free · No sign-up required
        </p>

        {error && (
          <p className="text-sm text-destructive mt-2">{error}</p>
        )}

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
                <div
                  key={i}
                  className="rounded-2xl overflow-hidden bg-white border border-border"
                >
                  <div className="aspect-square relative group">
                    <img
                      src={r.generated_image}
                      alt={r.product_name}
                      className="w-full h-full object-cover"
                    />
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
                Want more? Get <span className="text-foreground font-semibold">60 free credits</span> when you sign up.
              </p>
              <a href="https://vovv.ai/auth">
                <Button className="h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-full">
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
          {CATEGORIES.map((cat) => (
            <div key={cat.label} className="group relative rounded-2xl overflow-hidden aspect-[3/4]">
              <img
                src={cat.image}
                alt={cat.label}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-3 bg-primary text-white text-xs font-medium px-3 py-1 rounded-full">
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
