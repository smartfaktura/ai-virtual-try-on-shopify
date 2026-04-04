import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { ImageIcon, Coins, ChevronRight, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DetailSettings, ProductImageScene } from './types';

interface Step3SettingsProps {
  details: DetailSettings;
  onDetailsChange: (d: DetailSettings) => void;
  productCount?: number;
  sceneCount?: number;
  selectedScenes?: ProductImageScene[];
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

function MiniRatioChips({ value, globalValue, onChange }: { value: string; globalValue: string; onChange: (v: string) => void }) {
  const ratios = ['1:1', '4:5', '3:4', '9:16', '16:9'];
  const isDefault = value === globalValue;
  return (
    <div className="flex gap-1">
      {ratios.map(r => {
        const isActive = value === r;
        const isGlobalDefault = r === globalValue;
        return (
          <button
            key={r}
            type="button"
            onClick={() => onChange(r)}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium transition-all border cursor-pointer',
              isActive
                ? 'bg-primary text-primary-foreground border-primary'
                : isGlobalDefault
                  ? 'bg-muted/60 text-muted-foreground border-border/60 hover:border-primary/40'
                  : 'bg-muted/30 text-muted-foreground/70 border-border/40 hover:border-primary/40'
            )}
          >
            <RatioShape ratio={r} />
            {r}
          </button>
        );
      })}
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

export function ProductImagesStep3Settings({ details, onDetailsChange, productCount = 0, sceneCount = 0, selectedScenes = [] }: Step3SettingsProps) {
  const [overridesOpen, setOverridesOpen] = useState(false);
  const update = (partial: Partial<DetailSettings>) => onDetailsChange({ ...details, ...partial });

  const globalRatio = details.aspectRatio || '1:1';
  const overrides = details.sceneAspectOverrides || {};
  const hasOverrides = Object.values(overrides).some(v => v !== globalRatio);

  const ratioOptions = ASPECT_RATIOS.map(r => ({
    ...r,
    icon: <RatioShape ratio={r.value} />,
  }));

  const imgCount = parseInt(details.imageCount || '1', 10);
  const costPerImage = 6;
  const totalImages = productCount * sceneCount * imgCount;
  const totalCredits = totalImages * costPerImage;

  const handleSceneRatioChange = (sceneId: string, ratio: string) => {
    const next = { ...overrides };
    if (ratio === globalRatio) {
      delete next[sceneId];
    } else {
      next[sceneId] = ratio;
    }
    update({ sceneAspectOverrides: next });
  };

  const resetAllOverrides = () => {
    update({ sceneAspectOverrides: {} });
  };

  const overrideCount = Object.values(overrides).filter(v => v !== globalRatio).length;

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
              <RatioShape ratio={globalRatio} />
              <span className="text-sm font-semibold">Format</span>
              <span className="text-xs text-muted-foreground">(applies to all)</span>
            </div>
            <ChipSelector label="" value={globalRatio} onChange={v => update({ aspectRatio: v })} options={ratioOptions} />
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

      {selectedScenes.length > 0 && (
        <Collapsible open={overridesOpen} onOpenChange={setOverridesOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer group w-full">
            <ChevronRight className={cn('w-4 h-4 transition-transform', overridesOpen && 'rotate-90')} />
            <span>Customize format per scene</span>
            <span className="text-xs text-muted-foreground/70">({selectedScenes.length} scene{selectedScenes.length !== 1 ? 's' : ''})</span>
            {hasOverrides && (
              <span className="ml-auto text-xs font-medium text-primary">{overrideCount} custom</span>
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card className="mt-3">
              <CardContent className="p-3 space-y-2">
                {selectedScenes.map(scene => {
                  const sceneRatio = overrides[scene.id] || globalRatio;
                  const isCustom = overrides[scene.id] && overrides[scene.id] !== globalRatio;
                  return (
                    <div key={scene.id} className={cn(
                      'flex flex-col sm:flex-row sm:items-center gap-2 p-2 rounded-lg transition-colors',
                      isCustom ? 'bg-primary/5 border border-primary/20' : 'bg-muted/30'
                    )}>
                      <div className="flex items-center gap-2 min-w-0 sm:w-48">
                        <span className={cn(
                          'text-xs font-medium truncate',
                          isCustom ? 'text-foreground' : 'text-muted-foreground'
                        )}>
                          {scene.title}
                        </span>
                        {isCustom && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium flex-shrink-0">
                            custom
                          </span>
                        )}
                      </div>
                      <MiniRatioChips
                        value={sceneRatio}
                        globalValue={globalRatio}
                        onChange={(r) => handleSceneRatioChange(scene.id, r)}
                      />
                    </div>
                  );
                })}
                {hasOverrides && (
                  <button
                    type="button"
                    onClick={resetAllOverrides}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mt-1 ml-auto cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset all to default
                  </button>
                )}
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      )}

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
