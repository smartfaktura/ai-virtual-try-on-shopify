import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

import tankWhite from '@/assets/products/tank-white-1.jpg';
import sportsBra from '@/assets/products/sports-bra-black-1.jpg';
import leggingsBlack from '@/assets/products/leggings-black-1.jpg';
import hoodieGray from '@/assets/products/hoodie-gray-1.jpg';
import fauxFurJacket from '@/assets/products/faux-fur-jacket-1.jpg';
import joggersBeige from '@/assets/products/joggers-beige-1.jpg';

const goodExamples = [
  { src: tankWhite, label: 'Clear front-facing photo' },
  { src: sportsBra, label: 'Single item, well-lit' },
  { src: leggingsBlack, label: 'Clean background' },
];

const badExamples = [
  { src: fauxFurJacket, label: 'Clothing hidden under layers' },
  { src: hoodieGray, label: 'Low contrast, hard to detect' },
  { src: joggersBeige, label: 'Cropped — missing full outfit' },
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
            'flex-1 py-2.5 px-4 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5',
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
            'flex-1 py-2.5 px-4 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5',
            activeTab === 'bad'
              ? 'bg-destructive/10 text-destructive border-b-2 border-destructive'
              : 'text-muted-foreground hover:bg-muted/50'
          )}
        >
          <X className="w-3.5 h-3.5" />
          What to Avoid
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-3">
          {examples.map((ex, i) => (
            <div key={`${activeTab}-${i}`} className="relative group animate-in fade-in duration-500">
              <div className="aspect-[3/4] rounded-lg overflow-hidden border border-border bg-muted">
                <img
                  src={ex.src}
                  alt={ex.label}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Badge */}
              <div
                className={cn(
                  'absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center shadow-sm',
                  activeTab === 'good'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-destructive text-destructive-foreground'
                )}
              >
                {activeTab === 'good' ? (
                  <Check className="w-3 h-3" strokeWidth={3} />
                ) : (
                  <X className="w-3 h-3" strokeWidth={3} />
                )}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5 text-center leading-tight">
                {ex.label}
              </p>
            </div>
          ))}
        </div>

        {/* Tips text */}
        <div className="mt-3 space-y-1">
          {activeTab === 'good' ? (
            <>
              <p className="text-[11px] text-muted-foreground">
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Tip:</span> Use a front-facing photo of a single garment on a model, mannequin, or clean hanger. Well-lit with minimal wrinkles works best.
              </p>
            </>
          ) : (
            <>
              <p className="text-[11px] text-muted-foreground">
                <span className="text-destructive font-medium">Avoid:</span> Flat-lay photos, selfie-style shots, group photos, or images where accessories cover the garment. Bad lighting reduces quality.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Auto-cycle indicator */}
      {autoCycle && (
        <div className="h-0.5 bg-muted overflow-hidden">
          <div
            key={activeTab}
            className="h-full bg-primary/40 animate-[progress_4s_linear]"
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
