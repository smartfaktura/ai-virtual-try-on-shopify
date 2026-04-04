import { Card, CardContent } from '@/components/ui/card';
import { ImageIcon, Coins } from 'lucide-react';
import type { DetailSettings } from './types';

interface Step3SettingsProps {
  details: DetailSettings;
  onDetailsChange: (d: DetailSettings) => void;
  productCount?: number;
  sceneCount?: number;
}

function RatioShape({ ratio }: { ratio: string }) {
  const size = 14;
  const shapes: Record<string, { w: number; h: number }> = {
    '1:1': { w: 10, h: 10 },
    '4:5': { w: 9, h: 11 },
    '3:4': { w: 8, h: 11 },
    '9:16': { w: 7, h: 12 },
    '16:9': { w: 12, h: 7 },
  };
  const s = shapes[ratio] || { w: 10, h: 10 };
  const x = (size - s.w) / 2;
  const y = (size - s.h) / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
      <rect x={x} y={y} width={s.w} height={s.h} rx={1.5} className="fill-none stroke-current" strokeWidth={1.5} />
    </svg>
  );
}

function ChipSelector({ label, value, onChange, options }: { label: string; value?: string; onChange: (v: string) => void; options: { value: string; label: string; icon?: React.ReactNode }[] }) {
  return (
    <div className="space-y-2">
      {label && <span className="text-xs font-medium text-muted-foreground">{label}</span>}
      <div className="flex flex-wrap gap-1.5">
        {options.map(o => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(value === o.value ? '' : o.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border cursor-pointer ${
              value === o.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
            }`}
          >
            {o.icon}
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const ASPECT_RATIOS = [
  { value: '1:1', label: 'Square 1:1' },
  { value: '4:5', label: 'Portrait 4:5' },
  { value: '3:4', label: 'Tall 3:4' },
  { value: '9:16', label: 'Story 9:16' },
  { value: '16:9', label: 'Landscape 16:9' },
];

const IMAGE_COUNT_OPTIONS = [
  { value: '1', label: '1 image' },
  { value: '2', label: '2 images' },
  { value: '3', label: '3 images' },
  { value: '4', label: '4 images' },
];

export function ProductImagesStep3Settings({ details, onDetailsChange, productCount = 0, sceneCount = 0 }: Step3SettingsProps) {
  const update = (partial: Partial<DetailSettings>) => onDetailsChange({ ...details, ...partial });

  const ratioOptions = ASPECT_RATIOS.map(r => ({
    ...r,
    icon: <RatioShape ratio={r.value} />,
  }));

  const imgCount = parseInt(details.imageCount || '1', 10);
  const costPerImage = 6;
  const totalImages = productCount * sceneCount * imgCount;
  const totalCredits = totalImages * costPerImage;

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Generation settings</h2>
        <p className="text-sm text-muted-foreground mt-1">Choose format and how many images per scene.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <RatioShape ratio={details.aspectRatio || '1:1'} />
              <span className="text-sm font-semibold">Format</span>
            </div>
            <ChipSelector label="" value={details.aspectRatio || '1:1'} onChange={v => update({ aspectRatio: v })} options={ratioOptions} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Images per scene</span>
            </div>
            <ChipSelector label="" value={details.imageCount || '1'} onChange={v => update({ imageCount: v })} options={IMAGE_COUNT_OPTIONS} />
          </CardContent>
        </Card>
      </div>

      {productCount > 0 && sceneCount > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-2.5 border border-border/60">
          <Coins className="w-4 h-4 text-primary flex-shrink-0" />
          <span>
            <span className="font-medium text-foreground">{productCount}</span> product{productCount !== 1 ? 's' : ''}{' '}
            · <span className="font-medium text-foreground">{sceneCount}</span> scene{sceneCount !== 1 ? 's' : ''}{' '}
            · <span className="font-medium text-foreground">{imgCount}</span> image{imgCount !== 1 ? 's' : ''}{' '}
            = <span className="font-bold text-foreground">{totalImages} images</span>{' '}
            — <span className="font-bold text-primary">{totalCredits} credits</span>
          </span>
        </div>
      )}
    </div>
  );
}
