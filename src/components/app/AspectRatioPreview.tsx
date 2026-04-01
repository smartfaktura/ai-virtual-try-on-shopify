import type { AspectRatio } from '@/types';
import { AlertCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AspectRatioPreviewProps {
  ratio: AspectRatio;
  size?: 'small' | 'medium' | 'large';
}

const ratioConfig: Record<AspectRatio, { width: number; height: number; label: string }> = {
  '1:1': { width: 1, height: 1, label: 'Square' },
  '4:5': { width: 4, height: 5, label: 'Portrait' },
  '9:16': { width: 9, height: 16, label: 'Story' },
  '16:9': { width: 16, height: 9, label: 'Wide' },
};

const sizeConfig = { small: 44, medium: 60, large: 80 };

export function AspectRatioPreview({ ratio, size = 'medium' }: AspectRatioPreviewProps) {
  const config = ratioConfig[ratio];
  const maxSize = sizeConfig[size];
  const aspectRatio = config.width / config.height;
  let width: number, height: number;
  if (aspectRatio > 1) { width = maxSize; height = maxSize / aspectRatio; }
  else { height = maxSize; width = Math.max(maxSize * aspectRatio, 28); }

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="border-2 border-primary rounded-sm bg-primary/10 flex items-center justify-center" style={{ width: `${width}px`, height: `${height}px` }}>
        <span className="text-xs font-semibold">{ratio}</span>
      </div>
      <p className="text-xs font-medium text-center">{config.label}</p>
    </div>
  );
}

// Multi-select version
interface AspectRatioMultiSelectorProps {
  value: Set<AspectRatio>;
  onChange: (ratios: Set<AspectRatio>) => void;
}

export function AspectRatioMultiSelector({ value, onChange }: AspectRatioMultiSelectorProps) {
  const ratios: AspectRatio[] = ['1:1', '4:5', '9:16', '16:9'];
  const toggle = (ratio: AspectRatio) => {
    const next = new Set(value);
    if (next.has(ratio)) {
      next.delete(ratio);
    } else {
      next.add(ratio);
    }
    onChange(next);
  };
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold">Image Size</p>
        <p className="text-xs text-muted-foreground mt-0.5">Tap to select one or more sizes</p>
      </div>
      {value.size > 1 && (
        <p className="text-xs text-muted-foreground">{value.size} sizes × each scene</p>
      )}
      <div className="flex gap-3 flex-wrap">
        {ratios.map((ratio) => {
          const selected = value.has(ratio);
          return (
            <button type="button" key={ratio} onClick={() => toggle(ratio)}
              className={cn(
                'relative p-4 rounded-xl border-2 transition-all flex-1 min-w-[120px]',
                selected
                  ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                  : 'border-border/60 hover:border-muted-foreground'
              )}>
              {selected && (
                <Check className="absolute top-2 right-2 w-4 h-4 text-primary" />
              )}
              <AspectRatioPreview ratio={ratio} size="small" />
            </button>
          );
        })}
      </div>
      <div className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 text-destructive text-sm font-medium transition-all",
        value.size === 0 ? "opacity-100" : "opacity-0 h-0 overflow-hidden py-0"
      )}>
        <AlertCircle className="w-4 h-4 shrink-0" />
        Select at least 1 image size
      </div>
    </div>
  );
}

// Legacy single-select (kept for backward compat)
interface AspectRatioSelectorProps {
  value: AspectRatio;
  onChange: (ratio: AspectRatio) => void;
}

export function AspectRatioSelector({ value, onChange }: AspectRatioSelectorProps) {
  const ratios: AspectRatio[] = ['1:1', '4:5', '9:16', '16:9'];
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold">Image Size</p>
        <p className="text-xs text-muted-foreground mt-0.5">Choose a size for your images</p>
      </div>
      <div className="flex gap-3 flex-wrap">
        {ratios.map((ratio) => {
          const selected = value === ratio;
          return (
            <button key={ratio} onClick={() => onChange(ratio)}
              className={cn(
                'relative p-4 rounded-xl border-2 transition-all flex-1 min-w-[120px]',
                selected
                  ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                  : 'border-border/60 hover:border-muted-foreground'
              )}>
              {selected && (
                <Check className="absolute top-2 right-2 w-4 h-4 text-primary" />
              )}
              <AspectRatioPreview ratio={ratio} size="small" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
