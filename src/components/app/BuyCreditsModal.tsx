import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, ArrowUpRight, Check, Zap } from 'lucide-react';
import { creditPacks, pricingPlans } from '@/data/mockData';
import { useCredits } from '@/contexts/CreditContext';
import { PLAN_CONFIG } from '@/contexts/CreditContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function BuyCreditsModal() {
  const { balance, plan, planConfig, buyModalOpen, closeBuyModal, addCredits } = useCredits();
  const navigate = useNavigate();

  const monthlyCredits = planConfig.monthlyCredits;
  const usagePercent = monthlyCredits === Infinity
    ? 100
    : Math.min(100, Math.max(3, (balance / monthlyCredits) * 100));

  // Determine recommended next plan
  const nextPlanId = planConfig.nextPlanId;
  const nextPlan = nextPlanId ? pricingPlans.find(p => p.planId === nextPlanId) : null;
  const currentPlanData = pricingPlans.find(p => p.planId === plan);

  // For free users, recommend Growth (most popular) as primary, Starter as alternative
  const isFree = plan === 'free';
  const recommendedPlan = isFree
    ? pricingPlans.find(p => p.planId === 'growth')!
    : nextPlan;
  const altPlan = isFree
    ? pricingPlans.find(p => p.planId === 'starter')!
    : null;

  // Calculate savings vs top-ups for recommended plan
  const recommendedCredits = recommendedPlan && typeof recommendedPlan.credits === 'number' ? recommendedPlan.credits : 0;
  const topUpCostForRecommended = Math.round(recommendedCredits * 0.026);

  const handlePurchase = (credits: number) => {
    addCredits(credits);
    toast.success(`Added ${credits} credits to your account!`);
    closeBuyModal();
  };

  const handleUpgrade = () => {
    closeBuyModal();
    navigate('/app/settings');
  };

  return (
    <Dialog open={buyModalOpen} onOpenChange={closeBuyModal}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Credits & Plan</DialogTitle>
        </DialogHeader>

        {/* Current balance & plan badge */}
        <div className="p-3 rounded-lg bg-muted border border-border space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Balance</span>
            </div>
            <Badge variant="secondary" className="text-xs">{planConfig.name} Plan</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold">{balance} credits</span>
            <span className="text-xs text-muted-foreground">
              / {monthlyCredits === Infinity ? '∞' : monthlyCredits.toLocaleString()} {plan === 'free' ? 'bonus' : 'monthly'}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>

        <Tabs defaultValue={isFree ? 'upgrade' : 'topup'} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="topup" className="flex-1">Top Up</TabsTrigger>
            <TabsTrigger value="upgrade" className="flex-1">Upgrade Plan</TabsTrigger>
          </TabsList>

          {/* Top Up Tab */}
          <TabsContent value="topup" className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Credits never expire • Use across all generation modes</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {creditPacks.map((pack) => (
                <div
                  key={pack.packId}
                  className={`relative p-4 rounded-lg border-2 text-center transition-all hover:shadow-md ${
                    pack.popular
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-muted hover:border-primary'
                  }`}
                >
                  {pack.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">Best Value</Badge>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <p className="text-2xl font-bold">{pack.credits}</p>
                    <p className="text-xs text-muted-foreground">credits</p>
                    <p className="text-xs text-muted-foreground">≈ {Math.round(pack.credits / 4)} images</p>
                    <p className="text-lg font-semibold">${pack.price}</p>
                    <p className="text-xs text-muted-foreground">{(pack.pricePerCredit * 100).toFixed(1)}¢ / credit</p>
                    <Button
                      variant={pack.popular ? 'default' : 'outline'}
                      className="w-full"
                      size="sm"
                      onClick={() => handlePurchase(pack.credits)}
                    >
                      Buy
                    </Button>
                    <p className="text-xs text-muted-foreground">{(balance + pack.credits).toLocaleString()} after</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Upgrade Plan Tab */}
          <TabsContent value="upgrade" className="space-y-4">
            {recommendedPlan ? (
              <>
                <div className="p-4 rounded-lg border-2 border-primary bg-primary/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="font-semibold">{recommendedPlan.name} Plan</span>
                    </div>
                    <Badge className="bg-primary text-primary-foreground">
                      {isFree ? 'Most Popular' : 'Recommended'}
                    </Badge>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">${recommendedPlan.monthlyPrice}</span>
                    <span className="text-sm text-muted-foreground">/month</span>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {typeof recommendedPlan.credits === 'number' ? recommendedPlan.credits.toLocaleString() : 'Unlimited'} credits/month
                    {' '}• ≈ {typeof recommendedPlan.credits === 'number' ? Math.round(recommendedPlan.credits / 4).toLocaleString() : '∞'} images
                  </p>

                  {/* Savings highlight */}
                  {recommendedCredits > 0 && recommendedPlan.monthlyPrice > 0 && (
                    <div className="p-2.5 rounded-md bg-primary/10 text-sm">
                      <span className="font-medium">Save vs top-ups: </span>
                      <span className="text-muted-foreground">
                        {recommendedCredits.toLocaleString()} credits as top-ups would cost ~${topUpCostForRecommended}
                        {' '}— you save <span className="font-semibold text-primary">${topUpCostForRecommended - recommendedPlan.monthlyPrice}/month</span>
                      </span>
                    </div>
                  )}

                  {/* Key features */}
                  <ul className="space-y-1.5">
                    {recommendedPlan.features.slice(0, 5).map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button className="w-full" onClick={handleUpgrade}>
                    Upgrade to {recommendedPlan.name}
                    <ArrowUpRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>

                {/* Alt plan for free users */}
                {altPlan && (
                  <div className="p-3 rounded-lg border border-border bg-muted/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{altPlan.name} Plan</span>
                        <span className="text-sm text-muted-foreground">— ${altPlan.monthlyPrice}/mo</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {typeof altPlan.credits === 'number' ? altPlan.credits.toLocaleString() : '∞'} credits
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm" className="w-full" onClick={handleUpgrade}>
                      View {altPlan.name} Plan
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                You're on our highest plan! Contact sales for custom options.
              </div>
            )}

            <Separator />

            <button
              onClick={handleUpgrade}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            >
              Compare all plans in Settings
            </button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
