import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

import tankWhite from '@/assets/products/tank-white-1.jpg';
import sportsBra from '@/assets/products/sports-bra-black-1.jpg';
import leggingsBlack from '@/assets/products/leggings-black-1.jpg';
import avoidFlatlay from '@/assets/products/avoid-flatlay.jpg';
import avoidLowcontrast from '@/assets/products/avoid-lowcontrast.jpg';
import avoidCropped from '@/assets/products/avoid-cropped.jpg';

const goodExamples = [
  { src: tankWhite, label: 'Clear front-facing photo' },
  { src: sportsBra, label: 'Single item, well-lit' },
  { src: leggingsBlack, label: 'Clean background' },
];

const badExamples = [
  { src: avoidFlatlay, label: 'Flat-lay, not on a person' },
  { src: avoidLowcontrast, label: 'Too dark, low contrast' },
  { src: avoidCropped, label: 'Cropped, missing full view' },
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
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Tab buttons */}
      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => handleTabClick('good')}
          className={cn(
            'flex-1 py-2 px-3 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5',
            activeTab === 'good'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500'
              : 'text-muted-foreground hover:bg-muted/50'
          )}
        >
          <Check className="w-3.5 h-3.5" />
          What Works Best
        </button>
        <button
          type="button"
          onClick={() => handleTabClick('bad')}
          className={cn(
            'flex-1 py-2 px-3 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5',
            activeTab === 'bad'
              ? 'bg-destructive/10 text-destructive border-b-2 border-destructive'
              : 'text-muted-foreground hover:bg-muted/50'
          )}
        >
          <X className="w-3.5 h-3.5" />
          What to Avoid
        </button>
      </div>

      {/* Content with animation */}
      <div className="p-3">
        <div key={activeTab} className="grid grid-cols-3 gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {examples.map((ex, i) => (
            <div key={i} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border border-border bg-muted">
                <img
                  src={ex.src}
                  alt={ex.label}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Badge */}
              <div
                className={cn(
                  'absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center shadow-sm',
                  activeTab === 'good'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-destructive text-destructive-foreground'
                )}
              >
                {activeTab === 'good' ? (
                  <Check className="w-2.5 h-2.5" strokeWidth={3} />
                ) : (
                  <X className="w-2.5 h-2.5" strokeWidth={3} />
                )}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 text-center leading-tight">
                {ex.label}
              </p>
            </div>
          ))}
        </div>

        {/* Tips text */}
        <div className="mt-2">
          {activeTab === 'good' ? (
            <p className="text-[11px] text-muted-foreground">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Tip:</span> Use a front-facing photo of a single item on a model or mannequin. Well-lit with minimal wrinkles.
            </p>
          ) : (
            <p className="text-[11px] text-muted-foreground">
              <span className="text-destructive font-medium">Avoid:</span> Flat-lay photos, dark/low-contrast shots, or cropped images missing parts of the garment.
            </p>
          )}
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
