import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
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
      <DialogContent className="max-w-sm w-[calc(100%-2rem)] p-6 sm:p-7 rounded-3xl">
        {/* Icon chip — matches trigger banner */}
        <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
          <Wand2 className="w-4 h-4 text-primary" />
        </div>

        {/* Eyebrow */}
        <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-5">
          Brand Scenes
        </p>

        {/* Title — bold app aesthetic */}
        <DialogTitle className="text-2xl font-bold tracking-tight text-foreground mt-1.5">
          Scenes that belong to your brand
        </DialogTitle>

        {/* Subtitle */}
        <DialogDescription className="text-sm text-muted-foreground mt-2">
          Custom AI scenes built from your references, reused across every shoot
        </DialogDescription>

        {/* Feature list */}
        <ul className="mt-6 border-t border-border/50">
          {FEATURES.map((label, i) => (
            <li
              key={label}
              className="flex items-start gap-4 py-3.5 border-b border-border/50"
            >
              <span className="text-xs font-medium text-primary/70 w-5 pt-0.5 tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-sm text-foreground/90 leading-snug flex-1">
                {label}
              </span>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="mt-6 space-y-1.5">
          <Button
            onClick={handlePrimary}
            className="w-full h-11 rounded-full text-sm font-semibold gap-1.5 group"
          >
            {canCreate ? 'Create Brand Scene' : 'Upgrade plan'}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full h-9 text-xs text-muted-foreground hover:text-foreground hover:bg-transparent"
          >
            Maybe later
          </Button>
        </div>

        {!canCreate && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Brand Scenes are available on Growth and above
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
