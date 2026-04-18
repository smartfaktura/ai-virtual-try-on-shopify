import { useState } from 'react';
import { Zap, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCredits } from '@/contexts/CreditContext';
import { useUpscaleImages, type UpscaleResolution, type UpscaleItem } from '@/hooks/useUpscaleImages';
import { NoCreditsModal } from '@/components/app/NoCreditsModal';
import { cn } from '@/lib/utils';

interface UpscaleModalProps {
  open: boolean;
  onClose: () => void;
  items: UpscaleItem[];
  onComplete?: (jobIds: string[]) => void;
}

const TIERS: { id: UpscaleResolution; label: string; desc: string; cost: number }[] = [
  { id: '2k', label: '2K', desc: '2048px — Sharp & detailed', cost: 10 },
  { id: '4k', label: '4K', desc: '4096px — Maximum resolution', cost: 15 },
];

export function UpscaleModal({ open, onClose, items, onComplete }: UpscaleModalProps) {
  const [resolution, setResolution] = useState<UpscaleResolution>('2k');
  const [noCreditsOpen, setNoCreditsOpen] = useState(false);
  const { balance } = useCredits();
  const { upscaleImages, isUpscaling, getCreditCost } = useUpscaleImages();

  if (!open || items.length === 0) return null;

  const totalCost = getCreditCost(items.length, resolution);
  const hasEnough = balance >= totalCost;

  const handleUpscale = async () => {
    const jobIds = await upscaleImages(items, resolution);
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
              <h3 className="text-lg font-semibold text-foreground">Upscale Images</h3>
              <p className="text-xs text-muted-foreground">
                {items.length} image{items.length > 1 ? 's' : ''} selected
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resolution picker */}
        <div className="px-6 py-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
            Resolution
          </p>
          <div className="grid grid-cols-2 gap-3">
            {TIERS.map((tier) => (
              <button
                key={tier.id}
                onClick={() => setResolution(tier.id)}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all',
                  resolution === tier.id
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border/40 bg-muted/20 hover:border-border/70'
                )}
              >
                <span className={cn(
                  'text-xl font-bold',
                  resolution === tier.id ? 'text-primary' : 'text-foreground'
                )}>
                  {tier.label}
                </span>
                <span className="text-[11px] text-muted-foreground text-center">{tier.desc}</span>
                <span className={cn(
                  'text-xs font-semibold mt-1',
                  resolution === tier.id ? 'text-primary' : 'text-muted-foreground'
                )}>
                  {tier.cost} credits/image
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Cost summary */}
        <div className="mx-6 px-4 py-3 rounded-xl bg-muted/30 border border-border/30 space-y-1">
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
                Upscaling…
              </>
            ) : !hasEnough ? (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Get Credits to Upscale
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Upscale {items.length > 1 ? `${items.length} Images` : 'Image'} to {resolution.toUpperCase()}
              </>
            )}
          </Button>
        </div>

        <NoCreditsModal open={noCreditsOpen} onClose={() => setNoCreditsOpen(false)} category="fallback" />
      </div>
    </div>
  );
}
