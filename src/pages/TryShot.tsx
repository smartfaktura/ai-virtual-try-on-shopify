import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowRight, Download, ExternalLink, Sparkles, Globe, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ROTATING_WORDS = ['sneakers', 'skincare', 'furniture', 'fashion', 'electronics', 'jewelry'];

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
      // Simulate step progression with actual call
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
    <div className="min-h-screen bg-[hsl(222,47%,8%)] text-[hsl(210,20%,98%)]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <a href="https://vovv.ai" className="text-xl font-bold tracking-tight">
          VOVV<span className="text-[hsl(210,17%,70%)]">.AI</span>
        </a>
        <a
          href="https://vovv.ai/auth"
          className="text-sm text-[hsl(210,17%,70%)] hover:text-white transition-colors"
        >
          Sign up free →
        </a>
      </nav>

      {/* Hero */}
      <main className="max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(222,47%,18%)] text-xs text-[hsl(210,17%,70%)] mb-8">
          <Sparkles className="w-3 h-3" />
          Free — no sign-up required
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
          Product shots for{' '}
          <span className="text-[hsl(210,17%,70%)]">
            {displayWord}
            <span className="animate-pulse">|</span>
          </span>
        </h1>

        <p className="text-lg text-[hsl(215,14%,65%)] max-w-xl mx-auto mb-12">
          Enter any store URL. We'll find products and generate AI-styled product photos in seconds.
        </p>

        {/* URL Input */}
        <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mb-4">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(215,14%,65%)]" />
            <Input
              type="text"
              placeholder="nike.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleGenerate()}
              disabled={isLoading}
              className="pl-10 h-12 bg-[hsl(222,47%,11%)] border-[hsl(222,47%,22%)] text-white placeholder:text-[hsl(215,14%,45%)] text-base"
            />
          </div>
          <Button
            onClick={handleGenerate}
            disabled={isLoading || !url.trim()}
            className="h-12 px-6 bg-[hsl(210,17%,70%)] text-[hsl(222,47%,8%)] hover:bg-[hsl(210,17%,80%)] font-semibold"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Generate <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>

        {error && (
          <p className="text-sm text-[hsl(0,62%,45%)] mt-2">{error}</p>
        )}

        {/* Progress */}
        {isLoading && (
          <div className="mt-12 space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[hsl(210,17%,70%)] animate-pulse" />
              <span className="text-sm text-[hsl(210,17%,70%)]">{STEP_LABELS[step]}</span>
            </div>
            <div className="w-64 mx-auto h-1 bg-[hsl(222,47%,18%)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[hsl(210,17%,70%)] rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: step === 'scraping' ? '30%' : step === 'extracting' ? '60%' : '85%',
                }}
              />
            </div>
          </div>
        )}

        {/* Results */}
        {step === 'done' && results.length > 0 && (
          <div className="mt-16 space-y-8">
            <h2 className="text-2xl font-bold">Your product shots</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {results.map((r, i) => (
                <div
                  key={i}
                  className="rounded-2xl overflow-hidden bg-[hsl(222,47%,11%)] border border-[hsl(222,47%,22%)]"
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
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-sm font-medium truncate">{r.product_name}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="pt-8 border-t border-[hsl(222,47%,22%)]">
              <p className="text-[hsl(215,14%,65%)] mb-4">
                Want more? Get <span className="text-white font-semibold">60 free credits</span> when you sign up.
              </p>
              <a href="https://vovv.ai/auth">
                <Button className="h-12 px-8 bg-white text-[hsl(222,47%,8%)] hover:bg-white/90 font-semibold">
                  Start creating for free
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </div>
          </div>
        )}

        {step === 'done' && results.length === 0 && (
          <div className="mt-12 text-[hsl(215,14%,65%)]">
            <p>We couldn't find any product images on this site. Try a different store URL.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-[hsl(215,14%,45%)]">
        Powered by{' '}
        <a href="https://vovv.ai" className="text-[hsl(210,17%,70%)] hover:text-white transition-colors">
          VOVV.AI
        </a>{' '}
        · AI product photography
      </footer>
    </div>
  );
}
