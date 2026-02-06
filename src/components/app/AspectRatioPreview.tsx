import type { AspectRatio } from '@/types';

interface AspectRatioPreviewProps {
  ratio: AspectRatio;
  size?: 'small' | 'medium' | 'large';
}

const ratioConfig: Record<AspectRatio, { width: number; height: number; label: string; useCase: string }> = {
  '1:1': { width: 1, height: 1, label: 'Square', useCase: 'Instagram & Listings' },
  '4:5': { width: 4, height: 5, label: 'Portrait', useCase: 'Stories & Pinterest' },
  '16:9': { width: 16, height: 9, label: 'Wide', useCase: 'Banners & Facebook' },
};

const sizeConfig = { small: 40, medium: 60, large: 80 };

export function AspectRatioPreview({ ratio, size = 'medium' }: AspectRatioPreviewProps) {
  const config = ratioConfig[ratio];
  const maxSize = sizeConfig[size];
  const aspectRatio = config.width / config.height;
  let width: number, height: number;
  if (aspectRatio > 1) { width = maxSize; height = maxSize / aspectRatio; }
  else { height = maxSize; width = maxSize * aspectRatio; }

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="border-2 border-primary rounded-sm bg-primary/10 flex items-center justify-center" style={{ width: `${width}px`, height: `${height}px` }}>
        <span className="text-xs font-semibold">{ratio}</span>
      </div>
      <div className="text-center">
        <p className="text-xs font-medium">{config.label}</p>
        <p className="text-xs text-muted-foreground">{config.useCase}</p>
      </div>
    </div>
  );
}

interface AspectRatioSelectorProps {
  value: AspectRatio;
  onChange: (ratio: AspectRatio) => void;
}

export function AspectRatioSelector({ value, onChange }: AspectRatioSelectorProps) {
  const ratios: AspectRatio[] = ['1:1', '4:5', '16:9'];
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold">Image Size</p>
        <p className="text-xs text-muted-foreground">Choose the best size for where you'll use the image</p>
      </div>
      <div className="flex gap-3 flex-wrap">
        {ratios.map((ratio) => (
          <button key={ratio} onClick={() => onChange(ratio)}
            className={`p-4 rounded-lg border transition-all flex-1 min-w-[120px] ${
              value === ratio ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border hover:border-muted-foreground'
            }`}>
            <AspectRatioPreview ratio={ratio} size="small" />
          </button>
        ))}
      </div>
    </div>
  );
}
