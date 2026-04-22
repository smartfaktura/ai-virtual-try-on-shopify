import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  fullScreen?: boolean;
  label?: string;
  hints?: string[];
  className?: string;
  size?: number;
}

export function BrandLoaderAperture({ fullScreen, label, hints, className, size = 56 }: Props) {
  const [hintIdx, setHintIdx] = useState(0);
  const activeHints = hints && hints.length > 0 ? hints : label ? [label] : [];

  useEffect(() => {
    if (!hints || hints.length < 2) return;
    const id = setInterval(() => setHintIdx((i) => (i + 1) % hints.length), 2000);
    return () => clearInterval(id);
  }, [hints]);

  const blades = Array.from({ length: 6 });

  const content = (
    <div className={cn('flex flex-col items-center gap-5', className)}>
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
        aria-hidden
      >
        {/* hairline ring */}
        <div className="absolute inset-0 rounded-full border border-border/70" />
        {/* blades */}
        <div className="absolute inset-[6px] animate-aperture">
          <svg viewBox="-50 -50 100 100" className="w-full h-full">
            {blades.map((_, i) => {
              const angle = (360 / blades.length) * i;
              return (
                <polygon
                  key={i}
                  points="0,-44 12,0 0,8 -12,0"
                  fill="hsl(var(--primary) / 0.7)"
                  transform={`rotate(${angle})`}
                />
              );
            })}
            {/* center hole */}
            <circle r="6" fill="hsl(var(--background))" />
          </svg>
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
