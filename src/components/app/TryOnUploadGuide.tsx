import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getLandingAssetUrl } from '@/lib/landingAssets';

const goodExamples = [
  { src: getLandingAssetUrl('products/tank-white-1.jpg'), label: 'Front-facing' },
  { src: getLandingAssetUrl('products/sports-bra-black-1.jpg'), label: 'Single item' },
  { src: getLandingAssetUrl('products/leggings-black-1.jpg'), label: 'Clean background' },
];

const badExamples = [
  { src: getLandingAssetUrl('products/avoid-flatlay.jpg'), label: 'Busy background' },
  { src: getLandingAssetUrl('products/avoid-lowcontrast.jpg'), label: 'Too many items' },
  { src: getLandingAssetUrl('products/avoid-cropped.jpg'), label: 'Cropped photo' },
];

export function TryOnUploadGuide() {
  const [activeTab, setActiveTab] = useState<'good' | 'bad'>('good');
  const [autoCycle, setAutoCycle] = useState(true);

  useEffect(() => {
    if (!autoCycle) return;
    const timer = setInterval(() => {
      setActiveTab(prev => (prev === 'good' ? 'bad' : 'good'));
    }, 4000);
    return () => clearInterval(timer);
  }, [autoCycle]);

  const handleTabClick = (tab: 'good' | 'bad') => {
    setActiveTab(tab);
    setAutoCycle(false);
  };

  const examples = activeTab === 'good' ? goodExamples : badExamples;

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Tab buttons */}
      <div className="flex">
        <button
          type="button"
          onClick={() => handleTabClick('good')}
          className={cn(
            'flex-1 py-1.5 px-2 text-[11px] font-semibold transition-colors flex items-center justify-center gap-1',
            activeTab === 'good'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500'
              : 'text-muted-foreground hover:bg-muted/50 border-b border-border'
          )}
        >
          <Check className="w-3 h-3" />
          Best
        </button>
        <button
          type="button"
          onClick={() => handleTabClick('bad')}
          className={cn(
            'flex-1 py-1.5 px-2 text-[11px] font-semibold transition-colors flex items-center justify-center gap-1',
            activeTab === 'bad'
              ? 'bg-destructive/10 text-destructive border-b-2 border-destructive'
              : 'text-muted-foreground hover:bg-muted/50 border-b border-border'
          )}
        >
          <X className="w-3 h-3" />
          Avoid
        </button>
      </div>

      {/* Content */}
      <div className="p-2">
        <div
          key={activeTab}
          className="grid grid-cols-3 gap-1.5 animate-in fade-in slide-in-from-bottom-1 duration-300"
        >
          {examples.map((ex, i) => (
            <div key={i} className="relative">
              <div className="aspect-square rounded-md overflow-hidden border border-border bg-muted">
                <img
                  src={ex.src}
                  alt={ex.label}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Badge */}
              <div
                className={cn(
                  'absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-sm',
                  activeTab === 'good'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-destructive text-destructive-foreground'
                )}
              >
                {activeTab === 'good' ? (
                  <Check className="w-2 h-2" strokeWidth={3} />
                ) : (
                  <X className="w-2 h-2" strokeWidth={3} />
                )}
              </div>
              <p className="text-[9px] text-muted-foreground mt-0.5 text-center leading-tight truncate">
                {ex.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Auto-cycle indicator */}
      {autoCycle && (
        <div className="h-0.5 bg-muted overflow-hidden">
          <div
            key={activeTab}
            className="h-full bg-primary/40"
            style={{ animation: 'progress 4s linear forwards' }}
          />
        </div>
      )}

      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
