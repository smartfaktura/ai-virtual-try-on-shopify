import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, ArrowUpRight, Check, Zap, Sparkles, Video, Wand2, Layers } from 'lucide-react';
import { creditPacks, pricingPlans } from '@/data/mockData';
import { useCredits } from '@/contexts/CreditContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function BuyCreditsModal() {
  const { balance, plan, planConfig, buyModalOpen, closeBuyModal, addCredits } = useCredits();
  const navigate = useNavigate();

  const monthlyCredits = planConfig.monthlyCredits;
  const hasBonus = balance > monthlyCredits && monthlyCredits !== Infinity;
  const usagePercent = monthlyCredits === Infinity
    ? 100
    : hasBonus
      ? 100
      : Math.min(100, Math.max(3, (balance / monthlyCredits) * 100));

  const isFree = plan === 'free';

  // Determine recommended next plan
  const nextPlanId = planConfig.nextPlanId;
  const nextPlan = nextPlanId ? pricingPlans.find(p => p.planId === nextPlanId) : null;

  // For free users, recommend Growth (most popular) as primary, Starter as alternative
  const recommendedPlan = isFree
    ? pricingPlans.find(p => p.planId === 'growth')!
    : nextPlan;
  const altPlan = isFree
    ? pricingPlans.find(p => p.planId === 'starter')!
    : null;

  const handlePurchase = (credits: number) => {
    addCredits(credits);
    toast.success(`Added ${credits} credits to your account!`);
    closeBuyModal();
  };

  const handleUpgrade = () => {
    closeBuyModal();
    navigate('/app/settings');
  };

  // Feature unlock highlights for CRO
  const featureUnlocks = [
    { icon: Wand2, label: 'Virtual Try-On', desc: 'Dress AI models in your garments' },
    { icon: Video, label: 'Video Generation', desc: 'Animate product photos' },
    { icon: Layers, label: 'Bulk Generation', desc: 'Generate hundreds at once' },
    { icon: Sparkles, label: 'Creative Drops', desc: 'Auto-generated campaigns' },
  ];

  return (
    <Dialog open={buyModalOpen} onOpenChange={closeBuyModal}>
      <DialogContent className="max-w-xl max-h-[85vh] flex flex-col overflow-hidden gap-5">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-lg tracking-tight">Credits & Plan</DialogTitle>
          <p className="text-sm text-muted-foreground">Manage your credits and subscription</p>
        </DialogHeader>

        {/* Compact balance bar */}
        <div className="flex-shrink-0 p-5 rounded-xl bg-muted/50 border border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-muted-foreground" />
              <span className="text-3xl font-bold">{balance}</span>
              <span className="text-sm text-muted-foreground">credits</span>
            </div>
            <Badge variant="secondary" className="text-[10px]">{planConfig.name}</Badge>
          </div>
          <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                hasBonus ? 'bg-accent-foreground/60' : 'bg-primary'
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-muted-foreground">
              {hasBonus
                ? `${balance} available (includes bonus)`
                : `${balance} / ${monthlyCredits === Infinity ? '∞' : monthlyCredits.toLocaleString()}`
              }
            </span>
            {hasBonus && (
              <span className="text-xs text-primary font-medium">Bonus credits ✓</span>
            )}
          </div>
        </div>

        <Tabs defaultValue={isFree ? 'upgrade' : 'topup'} className="w-full flex-1 flex flex-col min-h-0">
          <TabsList className="w-full flex-shrink-0">
            <TabsTrigger value="topup" className="flex-1 text-xs">Top Up</TabsTrigger>
            <TabsTrigger value="upgrade" className="flex-1 text-xs">Upgrade Plan</TabsTrigger>
          </TabsList>

          {/* Top Up Tab */}
          <TabsContent value="topup" className="flex-1 overflow-y-auto space-y-3 mt-3">
            <p className="text-xs text-muted-foreground">Credits never expire • Use across all modes</p>

            <div className="grid grid-cols-3 gap-2.5">
              {creditPacks.map((pack) => (
                <div
                  key={pack.packId}
                  className={`relative p-3 rounded-lg border-2 text-center transition-all hover:shadow-sm ${
                    pack.popular
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {pack.popular && (
                    <div className="absolute -top-2.5 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground text-[9px] px-1.5 py-0">Best Value</Badge>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-xl font-bold leading-tight">{pack.credits}</p>
                    <p className="text-[10px] text-muted-foreground">≈ {Math.round(pack.credits / 4)} images</p>
                    <p className="text-base font-semibold">${pack.price}</p>
                    <p className="text-[10px] text-muted-foreground">{(pack.pricePerCredit * 100).toFixed(1)}¢/cr</p>
                    <Button
                      variant={pack.popular ? 'default' : 'outline'}
                      className="w-full mt-1"
                      size="sm"
                      onClick={() => handlePurchase(pack.credits)}
                    >
                      Buy
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Upgrade Plan Tab */}
          <TabsContent value="upgrade" className="flex-1 overflow-y-auto space-y-3 mt-3">
            {recommendedPlan ? (
              <>
                {/* Value-focused recommended plan card */}
                <div className="p-3.5 rounded-lg border-2 border-primary bg-primary/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-sm">{recommendedPlan.name}</span>
                    </div>
                    <Badge className="bg-primary text-primary-foreground text-[9px]">
                      {isFree ? 'Most Popular' : 'Recommended'}
                    </Badge>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">${recommendedPlan.monthlyPrice}</span>
                    <span className="text-xs text-muted-foreground">/mo</span>
                    <span className="text-xs text-muted-foreground ml-1">•</span>
                    <span className="text-xs text-muted-foreground ml-1">
                      {typeof recommendedPlan.credits === 'number'
                        ? `${recommendedPlan.credits.toLocaleString()} credits`
                        : 'Unlimited'}
                    </span>
                  </div>

                  {/* Feature unlock grid — the CRO focus */}
                  {isFree && (
                    <div className="grid grid-cols-2 gap-2">
                      {featureUnlocks.map(({ icon: Icon, label, desc }) => (
                        <div key={label} className="flex items-start gap-2 p-2 rounded-md bg-background/60">
                          <Icon className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-medium leading-tight">{label}</p>
                            <p className="text-[10px] text-muted-foreground leading-tight">{desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Non-free users: show key features list */}
                  {!isFree && (
                    <ul className="space-y-1">
                      {recommendedPlan.features.slice(0, 4).map((feature) => (
                        <li key={feature} className="flex items-center gap-1.5 text-xs">
                          <Check className="w-3 h-3 text-primary flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}

                  <Button className="w-full" size="sm" onClick={handleUpgrade}>
                    Upgrade to {recommendedPlan.name}
                    <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>

                {/* Alt plan for free users */}
                {altPlan && (
                  <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/30">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{altPlan.name}</span>
                      <span className="text-[10px] text-muted-foreground">
                        ${altPlan.monthlyPrice}/mo • {typeof altPlan.credits === 'number' ? `${altPlan.credits.toLocaleString()} cr` : '∞'}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs h-7 px-2.5" onClick={handleUpgrade}>
                      View
                      <ArrowUpRight className="w-3 h-3 ml-0.5" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                You're on our highest plan! Contact sales for custom options.
              </div>
            )}

            <button
              onClick={handleUpgrade}
              className="w-full text-center text-[11px] text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            >
              Compare all plans in Settings
            </button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
