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
      <DialogContent className="max-w-sm w-[calc(100%-2rem)] p-7 rounded-3xl">
        {/* Icon chip */}
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <Wand2 className="w-4 h-4 text-foreground/80" strokeWidth={1.5} />
        </div>

        {/* Eyebrow */}
        <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-5">
          Brand Scenes
        </p>

        {/* Title */}
        <DialogTitle className="text-[22px] leading-[1.15] font-medium tracking-tight text-foreground mt-2">
          Scenes that belong to your brand
        </DialogTitle>

        {/* Subtitle */}
        <DialogDescription className="text-[13px] leading-relaxed text-muted-foreground font-light mt-2">
          Custom AI scenes built from your references, reused across every shoot
        </DialogDescription>

        {/* Editorial feature list */}
        <ul className="mt-7 border-t border-border/60">
          {FEATURES.map((label, i) => (
            <li
              key={label}
              className="flex items-start gap-4 py-3.5 border-b border-border/60"
            >
              <span className="text-[10px] tracking-widest text-muted-foreground/70 w-6 pt-0.5 tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-[13px] text-foreground/85 leading-snug flex-1">
                {label}
              </span>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="mt-7 space-y-2">
          <Button
            onClick={handlePrimary}
            className="w-full h-11 rounded-full bg-foreground text-background hover:bg-foreground/90 gap-1.5 group"
          >
            {canCreate ? 'Create Brand Scene' : 'Upgrade plan'}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full h-9 text-[13px] text-muted-foreground hover:text-foreground hover:bg-transparent"
          >
            Maybe later
          </Button>
        </div>

        {!canCreate && (
          <p className="text-[10.5px] tracking-wide text-muted-foreground/80 text-center mt-2">
            Brand Scenes are available on Growth and above
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
