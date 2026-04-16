import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ArrowRight, Crown, Layers, TrendingUp, Zap, Target } from 'lucide-react';

import { type ConversionCategory, getLayer2Copy, getLayer1Avatar } from '@/lib/conversionCopy';
import { pricingPlans } from '@/data/mockData';
import { useCredits } from '@/contexts/CreditContext';
import { useNavigate } from 'react-router-dom';
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

const VALUE_ROWS = [
  { icon: Layers, metric: '500–4,500 monthly credits', detail: 'Keep creating without stopping' },
  { icon: TrendingUp, metric: 'Up to 48% lower cost per visual', detail: 'Bigger plans = better value' },
  { icon: Zap, metric: 'Priority processing', detail: 'Faster generation on Growth+' },
  { icon: Target, metric: 'Brand Models & scale', detail: 'Custom models and unlimited products on Pro' },
];

const PLAN_CARDS = [
  {
    planId: 'starter' as const,
    positioning: 'Start scaling beyond free',
    centsPerCredit: '7.8¢',
    recommended: false,
  },
  {
    planId: 'growth' as const,
    positioning: 'Best value for active brands',
    centsPerCredit: '5.3¢',
    recommended: true,
  },
  {
    planId: 'pro' as const,
    positioning: 'Brand Models · Unlimited products',
    centsPerCredit: '4.0¢',
    recommended: false,
  },
];

export function UpgradeValueDrawer({ open, onClose, category, generationContext }: UpgradeValueDrawerProps) {
  const { startCheckout } = useCredits();
  const navigate = useNavigate();
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
      <SheetContent side="right" className="w-full sm:!max-w-[480px] overflow-y-auto p-0 pt-2">
        <div className="p-6 pt-10 space-y-5">

          {/* Section 1: Category-Aware Header */}
          <SheetHeader className="space-y-2">
            <div className="flex items-center gap-2.5">
              <Avatar className="w-7 h-7 ring-1 ring-border/40">
                <AvatarImage src={avatarUrl} alt={avatar.name} />
                <AvatarFallback className="text-[10px]">{avatar.name[0]}</AvatarFallback>
              </Avatar>
              <SheetTitle className="text-lg font-semibold tracking-tight">
                {copy.headline}
              </SheetTitle>
            </div>
            <SheetDescription className="text-sm text-muted-foreground">
              {copy.subline}
            </SheetDescription>
          </SheetHeader>

          {/* Product context row */}
          {generationContext?.productThumbnail && (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-muted/20">
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-border bg-muted/30 flex-shrink-0">
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

          <Separator />

          {/* Section 2: Category-Aware Unlock Grid */}
          <div className="space-y-2.5">
            <p className="text-sm font-semibold tracking-tight">What you can create next</p>
            <div className="grid grid-cols-3 gap-2">
              {copy.unlockItems.map((item) => (
                <span
                  key={item}
                  className="text-xs text-muted-foreground bg-muted/40 px-2.5 py-1.5 rounded-lg text-center"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <Separator />

          {/* Section 3: Why Brands Upgrade */}
          <div className="space-y-2.5">
            <p className="text-sm font-semibold tracking-tight">Why brands upgrade</p>
            <div className="space-y-3">
              {VALUE_ROWS.map(({ icon: Icon, metric, detail }) => (
                <div key={metric} className="flex items-start gap-3">
                  <div className="mt-0.5 p-1 rounded-md bg-primary/5 flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-primary/70" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug">{metric}</p>
                    <p className="text-xs text-muted-foreground">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Section 4: Plan Comparison */}
          <div className="space-y-3">
            <p className="text-sm font-semibold tracking-tight">Choose your plan</p>

            {PLAN_CARDS.map(({ planId, positioning, centsPerCredit, recommended }) => {
              const plan = pricingPlans.find(p => p.planId === planId);
              if (!plan) return null;

              return (
                <div
                  key={planId}
                  className={`relative rounded-xl p-4 space-y-3 transition-colors ${
                    recommended
                      ? 'border-2 border-primary/40 bg-primary/[0.02] pt-3'
                      : 'border border-border/60 hover:border-primary/30'
                  }`}
                >
                  {recommended && (
                    <div className="absolute -top-2.5 left-4">
                      <Badge className="bg-primary text-primary-foreground text-[10px] tracking-wider uppercase px-3 py-0 shadow-sm">
                        Recommended
                      </Badge>
                    </div>
                  )}

                  <div className={`flex items-center justify-between ${recommended ? 'pt-1' : ''}`}>
                    <div>
                      <p className="text-sm font-semibold">{plan.name}</p>
                      <p className="text-xs text-muted-foreground">${plan.monthlyPrice}/mo</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        {typeof plan.credits === 'number' ? plan.credits.toLocaleString() : plan.credits} credits
                      </Badge>
                      <span className="bg-primary/10 text-primary text-[11px] font-medium px-2 py-0.5 rounded-full">
                        {centsPerCredit}/img
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">{positioning}</p>

                  <Button
                    variant={recommended ? 'default' : 'outline'}
                    size="sm"
                    className="w-full rounded-xl min-h-[40px] text-sm"
                    onClick={() => handleCheckout(plan.stripePriceIdMonthly)}
                  >
                    {recommended && <Crown className="w-3.5 h-3.5 mr-1.5" />}
                    Get {plan.name}
                    {!recommended && <ArrowRight className="w-3.5 h-3.5 ml-1.5" />}
                  </Button>
                </div>
              );
            })}

            <Button
              variant="link"
              size="sm"
              className="w-full text-xs text-muted-foreground"
              onClick={() => { navigate('/app/settings'); onClose(); }}
            >
              Compare all plans
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
