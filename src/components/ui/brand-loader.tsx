import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface BrandLoaderProps {
  fullScreen?: boolean;
  label?: string;
  hints?: string[];
  className?: string;
}

export function BrandLoader({ fullScreen, label, hints, className }: BrandLoaderProps) {
  const [hintIdx, setHintIdx] = useState(0);
  const activeHints = hints && hints.length > 0 ? hints : label ? [label] : [];

  useEffect(() => {
    if (!hints || hints.length < 2) return;
    const id = setInterval(() => setHintIdx((i) => (i + 1) % hints.length), 2000);
    return () => clearInterval(id);
  }, [hints]);

  const content = (
    <div className={cn('flex flex-col items-center gap-5', className)}>
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Orbiting arc */}
        <div
          className="absolute inset-0 rounded-full animate-orbit"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0deg, hsl(var(--primary) / 0.55) 90deg, transparent 130deg)',
            WebkitMask:
              'radial-gradient(circle, transparent 28px, #000 29px, #000 31px, transparent 32px)',
            mask: 'radial-gradient(circle, transparent 28px, #000 29px, #000 31px, transparent 32px)',
          }}
          aria-hidden
        />
        {/* Static faint ring */}
        <div className="absolute inset-0 rounded-full border border-border/60" aria-hidden />
        {/* Monogram */}
        <span className="relative text-[22px] font-semibold text-primary tracking-tight animate-breathe leading-none">
          V
        </span>
      </div>

      {activeHints.length > 0 && (
        <div className="h-4 overflow-hidden text-xs text-muted-foreground tracking-wide">
          <p key={hintIdx} className="animate-fade-in">
            {activeHints[hintIdx]}
          </p>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        {content}
      </div>
    );
  }
  return content;
}
