import { useState } from 'react';
import { Zap, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCredits } from '@/contexts/CreditContext';
import { useUpscaleImages, type UpscaleItem } from '@/hooks/useUpscaleImages';
import { NoCreditsModal } from '@/components/app/NoCreditsModal';
import { cn } from '@/lib/utils';

interface UpscaleModalProps {
  open: boolean;
  onClose: () => void;
  items: UpscaleItem[];
  onComplete?: (jobIds: string[]) => void;
}

export function UpscaleModal({ open, onClose, items, onComplete }: UpscaleModalProps) {
  const [noCreditsOpen, setNoCreditsOpen] = useState(false);
  const { balance } = useCredits();
  const { upscaleImages, isUpscaling, getCreditCost } = useUpscaleImages();

  if (!open || items.length === 0) return null;

  const totalCost = getCreditCost(items.length, '4k');
  const hasEnough = balance >= totalCost;

  const handleUpscale = async () => {
    const jobIds = await upscaleImages(items, '4k');
    if (jobIds.length > 0) {
      onComplete?.(jobIds);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-md mx-4 bg-background rounded-2xl shadow-2xl border border-border/40 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Enhance to 4K</h3>
              <p className="text-xs text-muted-foreground">
                {items.length} image{items.length > 1 ? 's' : ''} selected
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4K summary */}
        <div className="px-6 pt-4 pb-2">
          <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-4 flex items-center gap-4">
            <div className="flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-primary text-primary-foreground">
              <span className="text-base font-bold leading-none">4K</span>
              <span className="text-[9px] font-medium opacity-80 mt-0.5">4096px</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">Maximum resolution</p>
              <p className="text-xs text-muted-foreground mt-0.5">Print-ready, sharper textures, richer detail</p>
              <p className="text-xs font-semibold text-primary mt-1.5">15 credits / image</p>
            </div>
          </div>
        </div>

        {/* Cost summary */}
        <div className="mx-6 mt-3 px-4 py-3 rounded-xl bg-muted/30 border border-border/30 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total cost</span>
            <span className="text-sm font-semibold text-foreground flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-primary" />
              {totalCost} credits
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground/70">Your balance</span>
            <span className={cn(
              'text-xs font-medium',
              hasEnough ? 'text-muted-foreground' : 'text-destructive'
            )}>
              {balance} credits
            </span>
          </div>
        </div>

        <div className="px-6 py-5">
          <Button
            onClick={hasEnough ? handleUpscale : () => setNoCreditsOpen(true)}
            disabled={isUpscaling}
            className="w-full font-medium shadow-lg shadow-primary/20"
          >
            {isUpscaling ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Enhancing…
              </>
            ) : !hasEnough ? (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Get Credits to Enhance
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Enhance {items.length > 1 ? `${items.length} Images` : 'Image'} to 4K
              </>
            )}
          </Button>
        </div>

        <NoCreditsModal open={noCreditsOpen} onClose={() => setNoCreditsOpen(false)} category="fallback" />
      </div>
    </div>
  );
}
