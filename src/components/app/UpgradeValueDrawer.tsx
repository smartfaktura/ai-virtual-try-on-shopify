import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, ArrowRight, Crown, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type ConversionCategory, getLayer2Copy } from '@/lib/conversionCopy';
import { pricingPlans } from '@/data/mockData';
import { useCredits } from '@/contexts/CreditContext';
import { useNavigate } from 'react-router-dom';
import { getOptimizedUrl } from '@/lib/imageOptimization';

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

export function UpgradeValueDrawer({ open, onClose, category, generationContext }: UpgradeValueDrawerProps) {
  const { startCheckout } = useCredits();
  const navigate = useNavigate();
  const copy = getLayer2Copy(category);

  const starterPlan = pricingPlans.find(p => p.planId === 'starter');
  const growthPlan = pricingPlans.find(p => p.planId === 'growth');

  const handleCheckout = (priceId: string | undefined) => {
    if (!priceId) return;
    startCheckout(priceId, 'subscription');
    onClose();
  };

  const categoryLabel = category === 'fallback' ? 'product' : category;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:!max-w-[480px] overflow-y-auto p-0 pt-2">
        <div className="p-6 pt-10 space-y-6">
          {/* Header */}
          <SheetHeader className="space-y-1">
            <SheetTitle className="text-lg font-semibold tracking-tight">
              Unlock your full {categoryLabel} visual set
            </SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground">
              Go from a single direction to a complete, campaign-ready collection.
            </SheetDescription>
          </SheetHeader>

          {/* What you created */}
          {generationContext?.productThumbnail && (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-muted/20">
              <div className="w-12 h-12 rounded-lg overflow-hidden border border-border bg-muted/30 flex-shrink-0">
                <img
                  src={getOptimizedUrl(generationContext.productThumbnail, { quality: 60 })}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">1 {categoryLabel} direction</p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {[generationContext.productTitle, generationContext.sceneName, generationContext.modelName]
                    .filter(Boolean)
                    .join(' \u00d7 ')}
                </p>
              </div>
            </div>
          )}

          <Separator />

          {/* What brands create */}
          <div className="space-y-3">
            <p className="text-sm font-semibold tracking-tight">What brands like yours create</p>
            <div className="space-y-2">
              {copy.outcomes.map((outcome) => (
                <div key={outcome} className="flex items-start gap-2.5">
                  <div className="mt-0.5 p-0.5 rounded-full bg-primary/10">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground leading-snug">{outcome}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Plans */}
          <div className="space-y-3">
            <p className="text-sm font-semibold tracking-tight">Choose your plan</p>

            {/* Starter */}
            {starterPlan && (
              <div className="rounded-xl border border-border/60 p-4 space-y-3 hover:border-primary/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{starterPlan.name}</p>
                    <p className="text-xs text-muted-foreground">${starterPlan.monthlyPrice}/mo</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {starterPlan.credits} credits
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['Multi-scene', 'Multi-model', 'Batch export', 'Video'].map(f => (
                    <span key={f} className="text-[11px] sm:text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">{f}</span>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-xl min-h-[40px] text-sm"
                  onClick={() => handleCheckout(starterPlan.stripePriceIdMonthly)}
                >
                  Start with Starter
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            )}

            {/* Growth */}
            {growthPlan && (
              <div className="relative rounded-xl border-2 border-primary/40 bg-primary/[0.02] p-4 pt-3 space-y-3">
                <div className="absolute -top-2.5 left-4">
                  <Badge className="bg-primary text-primary-foreground text-[10px] tracking-wider uppercase px-3 py-0 shadow-sm">
                    Most Popular
                  </Badge>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <p className="text-sm font-semibold">{growthPlan.name}</p>
                    <p className="text-xs text-muted-foreground">${growthPlan.monthlyPrice}/mo</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {typeof growthPlan.credits === 'number' ? growthPlan.credits.toLocaleString() : growthPlan.credits} credits
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['Everything in Starter', 'Brand Models', 'Priority queue'].map(f => (
                    <span key={f} className="text-[11px] sm:text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">{f}</span>
                  ))}
                </div>
                <Button
                  size="sm"
                  className="w-full rounded-xl min-h-[40px] text-sm"
                  onClick={() => handleCheckout(growthPlan.stripePriceIdMonthly)}
                >
                  <Crown className="w-3.5 h-3.5 mr-1.5" />
                  Get Growth
                </Button>
              </div>
            )}

            {/* Compare all */}
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
