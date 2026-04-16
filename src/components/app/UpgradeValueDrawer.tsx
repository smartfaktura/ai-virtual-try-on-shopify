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

const DRAWER_PLAN_FEATURES: Record<string, { text: string; badge?: string }[]> = {
  starter: [
    { text: '7.8¢ per credit' },
    { text: 'Up to 100 products' },
  ],
  growth: [
    { text: '5.3¢ per credit' },
    { text: 'Brand Models', badge: 'NEW' },
  ],
  pro: [
    { text: '4.0¢ per credit' },
    { text: 'Unlimited products & profiles' },
  ],
};

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
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const copy = getLayer2Copy(category);
  const avatar = getLayer1Avatar(category);
  const isAnnual = billing === 'annual';

  const handleCheckout = (plan: typeof pricingPlans[number]) => {
    const priceId = isAnnual ? plan.stripePriceIdAnnual : plan.stripePriceIdMonthly;
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
      <SheetContent side="right" className="w-full sm:!max-w-[460px] p-0 h-full">
        <div className="flex flex-col h-full overflow-y-auto p-5 pt-6">

          {/* Header */}
          <SheetHeader className="space-y-2 pb-3 text-left">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 ring-1 ring-border/40">
                <AvatarImage src={avatarUrl} alt={avatar.name} />
                <AvatarFallback className="text-xs">{avatar.name[0]}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <SheetTitle className="text-lg font-semibold tracking-tight">
                  {copy.headline}
                </SheetTitle>
                <SheetDescription className="text-sm text-foreground/60 leading-relaxed mt-0.5">
                  {copy.subline}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Category feature pills */}
          <div className="hidden sm:flex flex-wrap gap-1.5 pb-3">
            {copy.unlockItems.map((item) => (
              <span
                key={item}
                className="inline-flex items-center rounded-full bg-muted/60 border border-border/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
              >
                {item}
              </span>
            ))}
          </div>

          {/* Product context row */}
          {generationContext?.productThumbnail && (
            <div className="flex items-center gap-3 p-2.5 rounded-xl border border-border/40 bg-muted/20 mb-5">
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

          {/* Plan Cards — fills remaining height */}
          <div className="flex-1 flex flex-col gap-3 pb-5">
            {PLAN_CARDS.map(({ planId, centsPerCredit, savingsLabel, recommended }) => {
              const plan = pricingPlans.find(p => p.planId === planId);
              if (!plan) return null;

              const creditsDisplay = typeof plan.credits === 'number' ? plan.credits.toLocaleString() : plan.credits;
              const features = DRAWER_PLAN_FEATURES[planId] ?? [];

              return (
                <div
                  key={planId}
                  className={`rounded-2xl p-3 space-y-2 transition-all ${
                    recommended
                      ? 'border-2 border-primary/50 bg-gradient-to-b from-primary/[0.06] to-primary/[0.02] ring-1 ring-primary/20 shadow-sm'
                      : 'border border-border/40 hover:border-border/60'
                  }`}
                >
                  {/* Plan name + recommended badge */}
                  <div className="flex items-center gap-2">
                    <p className="text-base font-semibold tracking-tight">{plan.name}</p>
                    {recommended && (
                      <Badge className="bg-primary text-primary-foreground text-[10px] px-2 py-0">
                        Recommended
                      </Badge>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold tracking-tight">${plan.monthlyPrice}</span>
                    <span className="text-xs text-muted-foreground">/mo</span>
                  </div>

                  {/* Credits pill + savings */}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-medium">
                      {creditsDisplay} cr · {centsPerCredit}
                    </Badge>
                    {savingsLabel && (
                      <span className="text-[10px] font-medium text-green-600 dark:text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-full">
                        {savingsLabel}
                      </span>
                    )}
                  </div>

                  {/* Plan-specific features checklist */}
                  <div className="space-y-1.5">
                    {features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-[11px] text-muted-foreground leading-tight inline-flex items-center gap-1.5">
                          {feat.text}
                          {feat.badge && (
                            <Badge className="text-[8px] px-1.5 py-0 leading-tight bg-primary text-primary-foreground">
                              {feat.badge}
                            </Badge>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <Button
                    variant={recommended ? 'default' : 'outline'}
                    size="sm"
                    className="w-full rounded-xl h-10 text-sm"
                    onClick={() => handleCheckout(plan.stripePriceIdMonthly)}
                  >
                    {recommended ? `Choose ${plan.name}` : `Start with ${plan.name}`}
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