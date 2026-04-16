import { useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, Sparkles, Zap } from 'lucide-react';
import { creditPacks } from '@/data/mockData';
import { useCredits } from '@/contexts/CreditContext';
import { type ConversionCategory, getLayer3Headline, getLayer3Subline } from '@/lib/conversionCopy';

interface NoCreditsModalProps {
  open: boolean;
  onClose: () => void;
  category?: ConversionCategory;
  generationCount?: number;
  /** Override plan for admin preview */
  previewPlan?: string;
}

function getUpgradeNudge(plan: string): { text: string; targetPlan: string } | null {
  if (plan === 'starter') return { text: 'Upgrade to Growth for 3× more monthly credits', targetPlan: 'growth' };
  if (plan === 'growth') return { text: 'Upgrade to Pro for 3× more monthly credits', targetPlan: 'pro' };
  return null;
}

export function NoCreditsModal({ open, onClose, category = 'fallback', generationCount = 0, previewPlan }: NoCreditsModalProps) {
  const { startCheckout, plan: userPlan, openBuyModal } = useCredits();
  const plan = previewPlan ?? userPlan;
  const isFree = plan === 'free';

  // Free users: redirect to the full BuyCreditsModal (Plans tab) instead
  useEffect(() => {
    if (open && isFree) {
      openBuyModal();
      onClose();
    }
  }, [open, isFree, openBuyModal, onClose]);

  const handleCreditPurchase = (stripePriceId: string | undefined) => {
    if (!stripePriceId) return;
    startCheckout(stripePriceId, 'payment');
    onClose();
  };

  const headline = getLayer3Headline(category);
  const subline = generationCount > 0
    ? getLayer3Subline(generationCount)
    : 'Top up credits to continue this session';

  const upgradeNudge = getUpgradeNudge(plan);

  // Don't render anything for free users — they get redirected to BuyCreditsModal
  if (isFree) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden border-border/50 shadow-2xl">
        {/* Header */}
        <div className="px-5 sm:px-8 pt-8 pb-5 bg-gradient-to-b from-muted/60 to-background border-b border-border/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight">{headline}</h2>
          </div>
          <p className="text-sm text-muted-foreground">{subline}</p>
        </div>

        {/* Content — Paid User: Credit Top-up Packs */}
        <div className="px-5 sm:px-8 py-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 overflow-visible">
            {creditPacks.map((pack) => (
              <div
                key={pack.packId}
                className={`relative rounded-2xl border-2 text-center transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                  pack.popular
                    ? 'border-primary bg-primary/[0.03] shadow-md shadow-primary/5 pt-4'
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
                    onClick={() => handleCreditPurchase(pack.stripePriceId)}
                  >
                    Purchase
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Upgrade nudge for Starter / Growth users */}
          {upgradeNudge && (
            <div className="rounded-2xl border border-border/50 bg-muted/20 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm tracking-tight">{upgradeNudge.text}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Better economics + more monthly credits included</p>
                </div>
              </div>
              <Button variant="outline" className="min-h-[44px] rounded-xl text-xs font-medium shrink-0" asChild>
                <a href="/app/settings">
                  View Plans
                  <ArrowUpRight className="w-3.5 h-3.5 ml-1.5" />
                </a>
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="px-5 sm:px-8 pb-7 pt-0">
          <Button variant="outline" onClick={onClose} className="rounded-xl min-h-[44px] w-full sm:w-auto">
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
