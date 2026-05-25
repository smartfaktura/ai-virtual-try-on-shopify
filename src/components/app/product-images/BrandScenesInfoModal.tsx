import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Wand2, Check, ArrowRight } from 'lucide-react';
import { useCredits } from '@/contexts/CreditContext';

const ELIGIBLE_PLANS = new Set(['growth', 'pro', 'enterprise']);

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

  const bullets = [
    'Lock in a signature visual world for your brand',
    'Build from a reference photo or a written brief',
    'Reuse saved scenes across all future generations',
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Wand2 className="w-5 h-5 text-primary" />
          </div>
          <DialogTitle className="text-xl">Design scenes that only belong to your brand</DialogTitle>
          <DialogDescription className="text-sm">
            Custom AI scenes built from your references and reused across every shoot, so every visual feels unmistakably yours.
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2.5 py-2">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-sm">
              <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="text-foreground/90">{b}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Maybe later
          </Button>
          <Button onClick={handlePrimary} className="gap-1.5">
            {canCreate ? 'Create Brand Scene' : 'Upgrade plan'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {!canCreate && (
          <p className="text-[11px] text-muted-foreground text-center">
            Brand Scenes are available on Growth and above
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
