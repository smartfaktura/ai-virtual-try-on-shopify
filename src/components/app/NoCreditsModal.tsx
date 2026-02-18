import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, AlertCircle } from 'lucide-react';
import { creditPacks } from '@/data/mockData';
import { useCredits } from '@/contexts/CreditContext';

interface NoCreditsModalProps {
  open: boolean;
  onClose: () => void;
}

export function NoCreditsModal({ open, onClose }: NoCreditsModalProps) {
  const { startCheckout } = useCredits();

  const handlePurchase = (stripePriceId: string | undefined) => {
    if (!stripePriceId) return;
    startCheckout(stripePriceId, 'payment');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden border-border/50 shadow-2xl">
        {/* Header */}
        <div className="px-8 pt-8 pb-5 bg-gradient-to-b from-muted/60 to-background border-b border-border/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-destructive/10">
              <AlertCircle className="w-5 h-5 text-destructive" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight">You're out of credits</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Purchase credits to continue generating professional product images.
          </p>
        </div>

        {/* Packs */}
        <div className="px-8 py-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {creditPacks.map((pack) => (
              <div
                key={pack.packId}
                className={`relative rounded-2xl border-2 text-center transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                  pack.popular
                    ? 'border-primary bg-primary/[0.03] shadow-md shadow-primary/5'
                    : 'border-border/60 hover:border-primary/30 bg-background'
                }`}
              >
                {pack.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-primary text-primary-foreground text-[10px] tracking-widest uppercase px-4 py-0.5 shadow-lg shadow-primary/20">
                      Best Value
                    </Badge>
                  </div>
                )}
                <div className="p-6 sm:p-7 space-y-4">
                  <div className="space-y-1">
                    <p className="text-3xl font-bold tracking-tight">{pack.credits.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-semibold">credits</p>
                  </div>
                  <div className="h-px bg-border/60 mx-3" />
                  <div className="space-y-1">
                    <p className="text-xl font-semibold tracking-tight">${pack.price}</p>
                    <p className="text-xs text-muted-foreground">{(pack.pricePerCredit * 100).toFixed(1)}¢ each</p>
                  </div>
                  <Button
                    variant={pack.popular ? 'default' : 'outline'}
                    className="w-full min-h-[44px] rounded-xl text-sm font-medium"
                    onClick={() => handlePurchase(pack.stripePriceId)}
                  >
                    Purchase
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border/50 bg-muted/20 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-sm tracking-tight">Upgrade Your Plan</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Get more monthly credits + unlock premium features
              </p>
            </div>
            <Button variant="outline" className="min-h-[44px] rounded-xl text-xs font-medium shrink-0" asChild>
              <a href="/app/settings">
                View Plans
                <ArrowUpRight className="w-3.5 h-3.5 ml-1.5" />
              </a>
            </Button>
          </div>
        </div>

        <DialogFooter className="px-8 pb-7 pt-0">
          <Button variant="outline" onClick={onClose} className="rounded-xl min-h-[44px]">
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
