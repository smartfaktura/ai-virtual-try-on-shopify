import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Check } from 'lucide-react';

import { type ConversionCategory, getLayer2Copy, getLayer1Avatar } from '@/lib/conversionCopy';
import { pricingPlans } from '@/data/mockData';
import { useCredits } from '@/contexts/CreditContext';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { getLandingAssetUrl } from '@/lib/landingAssets';

interface GenerationContext {
  productThumbnail?: string;
  productTitle?: string;
  sceneName?: string;
  modelName?: string;
}

interface UpgradeValueDrawerProps {
  open: boolean;
  onClose: () => void;
  category: ConversionCategory;
  generationContext?: GenerationContext;
}

const PLAN_CARDS = [
  {
    planId: 'starter' as const,
    centsPerCredit: '7.8¢',
    savingsLabel: null,
    recommended: false,
  },
  {
    planId: 'growth' as const,
    centsPerCredit: '5.3¢',
    savingsLabel: 'Save 32%',
    recommended: true,
  },
  {
    planId: 'pro' as const,
    centsPerCredit: '4.0¢',
    savingsLabel: 'Save 49%',
    recommended: false,
  },
];

export function UpgradeValueDrawer({ open, onClose, category, generationContext }: UpgradeValueDrawerProps) {
  const { startCheckout } = useCredits();
  const copy = getLayer2Copy(category);
  const avatar = getLayer1Avatar(category);

  const handleCheckout = (priceId: string | undefined) => {
    if (!priceId) return;
    startCheckout(priceId, 'subscription');
    onClose();
  };

  const avatarUrl = getOptimizedUrl(
    getLandingAssetUrl(`team/avatar-${avatar.avatarKey}.jpg`),
    { quality: 60 }
  );

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:!max-w-[440px] overflow-y-auto p-0 pt-2">
        <div className="p-5 pt-10 space-y-3">

          {/* Header */}
          <SheetHeader className="space-y-1.5 border-b border-border/30 pb-3">
            <div className="flex items-center gap-2.5">
              <Avatar className="w-7 h-7 ring-1 ring-border/40">
                <AvatarImage src={avatarUrl} alt={avatar.name} />
                <AvatarFallback className="text-[10px]">{avatar.name[0]}</AvatarFallback>
              </Avatar>
              <SheetTitle className="text-base font-semibold tracking-tight">
                {copy.headline}
              </SheetTitle>
            </div>
            <SheetDescription className="text-sm text-muted-foreground/80 leading-relaxed">
              {copy.subline}
            </SheetDescription>
          </SheetHeader>

          {/* Benefits */}
          <div className="space-y-1.5">
            {[
              '1,000+ personalized editorial shots',
              'Monthly campaign drops for social & marketing',
              'Priority processing and batch generation',
            ].map((text) => (
              <div key={text} className="flex items-center gap-2">
                <Check className="w-3 h-3 text-primary shrink-0" />
                <span className="text-xs text-muted-foreground">{text}</span>
              </div>
            ))}
          </div>

          {/* Trust line */}
          <p className="text-xs text-muted-foreground/60 text-center">
            Join 2,000+ brands creating with VOVV
          </p>

          {/* Product context row */}
          {generationContext?.productThumbnail && (
            <div className="flex items-center gap-3 p-2.5 rounded-xl border border-border/60 bg-muted/20">
              <div className="w-9 h-9 rounded-lg overflow-hidden border border-border bg-muted/30 flex-shrink-0">
                <img
                  src={getOptimizedUrl(generationContext.productThumbnail, { quality: 60 })}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">1 direction created</p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {[generationContext.productTitle, generationContext.sceneName, generationContext.modelName]
                    .filter(Boolean)
                    .join(' × ')}
                </p>
              </div>
            </div>
          )}

          {/* Plan Cards */}
          <div className="space-y-2">
            <p className="text-sm font-semibold tracking-tight">Choose your plan</p>

            {PLAN_CARDS.map(({ planId, centsPerCredit, savingsLabel, recommended }) => {
              const plan = pricingPlans.find(p => p.planId === planId);
              if (!plan) return null;

              const creditsDisplay = typeof plan.credits === 'number' ? plan.credits.toLocaleString() : plan.credits;

              return (
                <div
                  key={planId}
                  className={`rounded-xl p-3 space-y-2 transition-all ${
                    recommended
                      ? 'border-2 border-primary/40 bg-primary/[0.03] shadow-sm'
                      : 'border border-border/60 hover:border-primary/30'
                  }`}
                >
                  {/* Plan header: name · price + credits pill */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{plan.name} · ${plan.monthlyPrice}/mo</p>
                      {recommended && (
                        <Badge className="bg-primary text-primary-foreground text-[10px] px-2 py-0">
                          Recommended
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[10px]">
                        {creditsDisplay} cr · {centsPerCredit}
                      </Badge>
                      {savingsLabel && (
                        <span className="text-[10px] font-medium text-green-600 dark:text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-full">
                          {savingsLabel}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    variant={recommended ? 'default' : 'outline'}
                    size="sm"
                    className="w-full rounded-xl min-h-[36px] text-sm"
                    onClick={() => handleCheckout(plan.stripePriceIdMonthly)}
                  >
                    {recommended ? `Get ${creditsDisplay} credits` : `Start with ${creditsDisplay} credits`}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
