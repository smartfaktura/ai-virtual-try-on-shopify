import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  fullScreen?: boolean;
  label?: string;
  hints?: string[];
  className?: string;
}

export function BrandLoaderProgressGlyph({ fullScreen, label, hints, className }: Props) {
  const [hintIdx, setHintIdx] = useState(0);
  const activeHints = hints && hints.length > 0 ? hints : label ? [label] : [];

  useEffect(() => {
    if (!hints || hints.length < 2) return;
    const id = setInterval(() => setHintIdx((i) => (i + 1) % hints.length), 2000);
    return () => clearInterval(id);
  }, [hints]);

  const content = (
    <div className={cn('flex flex-col items-center gap-5', className)}>
      <div className="flex flex-col items-center gap-2.5">
        <span
          className="text-[15px] font-medium tracking-[0.18em] text-foreground leading-none"
          aria-hidden
        >
          VOVV.AI
        </span>
        <div
          className="relative h-px w-20 overflow-hidden bg-gradient-to-r from-transparent via-border to-transparent"
          aria-hidden
        >
          <div
            className="absolute top-0 left-0 h-px w-[40%] bg-gradient-to-r from-transparent via-primary to-transparent animate-glyph-sweep"
          />
        </div>
      </div>

      {activeHints.length > 0 && (
        <div className="h-4 overflow-hidden text-[11px] uppercase tracking-[0.14em] text-muted-foreground/80">
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
