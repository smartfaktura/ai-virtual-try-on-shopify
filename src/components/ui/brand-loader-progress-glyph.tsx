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
      <div className="flex flex-col items-center gap-2">
        <span
          className="text-base font-semibold text-foreground animate-glyph-breathe leading-none"
          aria-hidden
        >
          VOVV
        </span>
        <div className="relative h-px w-16 overflow-hidden bg-border/60" aria-hidden>
          <div
            className="absolute top-0 left-0 h-px w-[30%] bg-primary animate-glyph-sweep"
          />
        </div>
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
