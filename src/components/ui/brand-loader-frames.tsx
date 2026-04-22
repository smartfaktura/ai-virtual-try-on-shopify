import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  fullScreen?: boolean;
  label?: string;
  hints?: string[];
  className?: string;
}

export function BrandLoaderFrames({ fullScreen, label, hints, className }: Props) {
  const [hintIdx, setHintIdx] = useState(0);
  const activeHints = hints && hints.length > 0 ? hints : label ? [label] : [];

  useEffect(() => {
    if (!hints || hints.length < 2) return;
    const id = setInterval(() => setHintIdx((i) => (i + 1) % hints.length), 2000);
    return () => clearInterval(id);
  }, [hints]);

  const content = (
    <div className={cn('flex flex-col items-center gap-5', className)}>
      <div className="relative" style={{ width: 80, height: 64 }} aria-hidden>
        {/* back frame — 5:4 tilt right */}
        <div
          className="absolute left-1/2 top-1/2 w-[52px] h-[42px] rounded-[3px] border border-border bg-card animate-frame-fan"
          style={{ transform: 'translate(-50%,-50%) rotate(6deg)', animationDelay: '0ms' }}
        />
        {/* mid frame — 1:1 */}
        <div
          className="absolute left-1/2 top-1/2 w-[44px] h-[44px] rounded-[3px] border border-border bg-card animate-frame-fan"
          style={{ transform: 'translate(-50%,-50%) rotate(-6deg)', animationDelay: '180ms' }}
        />
        {/* front frame — 4:5 with primary tint */}
        <div
          className="absolute left-1/2 top-1/2 w-[40px] h-[50px] rounded-[3px] border border-border bg-card overflow-hidden animate-frame-fan"
          style={{ transform: 'translate(-50%,-50%) rotate(0deg)', animationDelay: '360ms' }}
        >
          <div
            className="absolute inset-0 animate-frame-tint"
            style={{
              background:
                'linear-gradient(135deg, hsl(var(--primary) / 0.55), hsl(var(--primary) / 0.15))',
              animationDelay: '360ms',
            }}
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
