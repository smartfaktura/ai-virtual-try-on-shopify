import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Wand2, ArrowRight } from 'lucide-react';
import { useCredits } from '@/contexts/CreditContext';

const ELIGIBLE_PLANS = new Set(['growth', 'pro', 'enterprise']);

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FEATURES = [
  'Lock in a signature visual world for your brand',
  'Build from a reference photo or a written brief',
  'Reuse saved scenes across all future generations',
];

export function BrandScenesInfoModal({ open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const { plan, openBuyModal } = useCredits();
  const canCreate = ELIGIBLE_PLANS.has(plan);

  const handlePrimary = () => {
    onOpenChange(false);
    if (canCreate) {
      navigate('/app/brand-scenes');
    } else {
      openBuyModal('brand-scenes-gate');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px] w-[calc(100%-2rem)] p-8 rounded-3xl">
        {/* Icon chip — soft ring */}
        <div className="w-11 h-11 rounded-full border border-border/70 bg-gradient-to-b from-muted/40 to-transparent flex items-center justify-center">
          <Wand2 className="w-[15px] h-[15px] text-foreground/80" strokeWidth={1.25} />
        </div>

        {/* Eyebrow + hairline */}
        <div className="mt-6">
          <p className="text-[9.5px] tracking-[0.24em] uppercase text-muted-foreground/80">
            Brand Scenes
          </p>
          <div className="w-6 h-px bg-border mt-2.5" />
        </div>

        {/* Title */}
        <DialogTitle className="text-[24px] leading-[1.1] font-light tracking-[-0.01em] text-foreground mt-4">
          Scenes that belong to your brand
        </DialogTitle>

        {/* Subtitle */}
        <DialogDescription className="text-[12.5px] leading-relaxed text-muted-foreground/90 font-light mt-2.5">
          Custom AI scenes built from your references, reused across every shoot
        </DialogDescription>

        {/* Editorial feature list */}
        <ul className="mt-7 border-t border-border/40">
          {FEATURES.map((label, i) => (
            <li
              key={label}
              className="flex items-start gap-5 py-4 border-b border-border/40"
            >
              <span className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground/60 w-5 pt-1 tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-[13px] text-foreground/90 leading-snug font-light flex-1">
                {label}
              </span>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="mt-7 space-y-1.5">
          <Button
            onClick={handlePrimary}
            className="w-full h-11 rounded-full bg-foreground text-background hover:bg-foreground/90 gap-1.5 text-[13px] font-medium tracking-tight group"
          >
            {canCreate ? 'Create Brand Scene' : 'Upgrade plan'}
            <ArrowRight className="w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full h-9 text-[11px] tracking-[0.15em] uppercase text-muted-foreground/70 hover:text-foreground hover:bg-transparent"
          >
            Maybe later
          </Button>
        </div>

        {!canCreate && (
          <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground/60 text-center mt-3">
            Available on Growth and above
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
