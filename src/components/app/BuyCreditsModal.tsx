import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUpRight, Check, Sparkles } from 'lucide-react';
import { creditPacks, pricingPlans } from '@/data/mockData';
import { useCredits, PLAN_CONFIG } from '@/contexts/CreditContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useState } from 'react';
import { DowngradeConfirmation, PLAN_ORDER } from './DowngradeConfirmation';

export function BuyCreditsModal() {
  const { plan, planConfig, buyModalOpen, buyModalDefaultTab, closeBuyModal, refreshBalance } = useCredits();
  const { user } = useAuth();
  const [upgrading, setUpgrading] = useState(false);
  const [downgradeTarget, setDowngradeTarget] = useState<string | null>(null);

  const handlePurchase = async (credits: number) => {
    if (!user) return;
    const { error } = await supabase.rpc('add_purchased_credits', {
      p_user_id: user.id,
      p_amount: credits,
    });
    if (error) {
      toast.error('Failed to add credits: ' + error.message);
    } else {
      await refreshBalance();
      toast.success(`${credits} credits added to your account!`);
    }
  };

  const isDowngrade = (targetPlanId: string) => {
    const currentIdx = PLAN_ORDER.indexOf(plan);
    const targetIdx = PLAN_ORDER.indexOf(targetPlanId);
    return targetIdx < currentIdx;
  };

  const handlePlanClick = (targetPlanId: string) => {
    if (isDowngrade(targetPlanId)) {
      setDowngradeTarget(targetPlanId);
      return;
    }
    handleUpgrade(targetPlanId);
  };

  const handleUpgrade = async (targetPlanId: string) => {
    if (!user || upgrading) return;
    const targetConfig = PLAN_CONFIG[targetPlanId];
    const targetPlan = pricingPlans.find(p => p.planId === targetPlanId);
    if (!targetConfig || !targetPlan) return;

    setUpgrading(true);
    const credits = typeof targetPlan.credits === 'number' ? targetPlan.credits : 99999;

    const { error } = await supabase.rpc('change_user_plan', {
      p_user_id: user.id,
      p_new_plan: targetPlanId,
      p_new_credits: credits,
    });

    if (error) {
      toast.error('Upgrade failed: ' + error.message);
    } else {
      await refreshBalance();
      toast.success(`Upgraded to ${targetConfig.name}! ${credits.toLocaleString()} credits added.`);
      closeBuyModal();
    }
    setUpgrading(false);
  };

  // Plans excluding enterprise & free
  const comparePlans = pricingPlans.filter(p => p.planId !== 'enterprise' && p.planId !== 'free');
  const enterprise = pricingPlans.find(p => p.planId === 'enterprise');

  const isFree = plan === 'free';

  return (
    <Dialog open={buyModalOpen} onOpenChange={closeBuyModal}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden gap-0 p-0">
        <DialogHeader className="px-8 pt-8 pb-4">
          <DialogTitle className="text-xl font-semibold tracking-tight">Credits & Plan</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">Choose how you want to power your creative workflow</p>
        </DialogHeader>

        <Tabs defaultValue={buyModalDefaultTab} key={buyModalDefaultTab} className="w-full flex-1 flex flex-col min-h-0">
          <div className="px-8">
            <TabsList className="w-full h-11 p-1 bg-muted/60">
              <TabsTrigger value="upgrade" className="flex-1 text-sm font-medium h-9">Upgrade Plan</TabsTrigger>
              <TabsTrigger value="topup" className="flex-1 text-sm font-medium h-9">Top Up Credits</TabsTrigger>
            </TabsList>
          </div>

          {/* Upgrade Plan Tab — Horizontal Columns */}
          <TabsContent value="upgrade" className="flex-1 overflow-y-auto px-8 pt-6 pb-8 mt-0">
            <div className="grid grid-cols-3 gap-4">
              {comparePlans.map((p) => {
                const isCurrent = p.planId === plan;
                const isRecommended = (isFree && p.planId === 'growth') ||
                  (!isFree && p.planId === planConfig.nextPlanId);
                const credits = typeof p.credits === 'number' ? p.credits : 0;

                return (
                  <div
                    key={p.planId}
                    className={`relative flex flex-col rounded-2xl border-2 p-6 transition-all ${
                      isCurrent
                        ? 'border-border bg-muted/30 opacity-60'
                        : isRecommended
                          ? 'border-primary bg-primary/[0.03] shadow-md'
                          : 'border-border hover:border-primary/40'
                    }`}
                  >
                    {isRecommended && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground text-xs px-3 py-0.5 font-medium">
                          Recommended
                        </Badge>
                      </div>
                    )}

                    {/* Plan Name */}
                    <h3 className="text-lg font-semibold">{p.name}</h3>

                    {/* Price */}
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-3xl font-bold">${p.monthlyPrice}</span>
                      <span className="text-sm text-muted-foreground">/mo</span>
                    </div>

                    {/* Credits */}
                    <p className="text-sm text-muted-foreground mt-2">
                      {credits.toLocaleString()} credits/month
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ≈ {Math.round(credits / 4).toLocaleString()} images
                    </p>

                    {/* Divider */}
                    <div className="border-t border-border/40 my-4" />

                    {/* Features */}
                    <ul className="space-y-2.5 flex-1">
                      {p.features.slice(1, 6).map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-foreground/80">
                          <Check className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <div className="mt-5">
                      {isCurrent ? (
                        <Button variant="outline" disabled className="w-full h-11 rounded-xl text-sm">
                          Current Plan
                        </Button>
                      ) : (
                        <Button
                          variant={isRecommended ? 'default' : 'outline'}
                          className="w-full h-11 rounded-xl text-sm font-medium"
                          onClick={() => handlePlanClick(p.planId)}
                          disabled={upgrading}
                        >
                          {upgrading ? 'Upgrading…' : isRecommended ? 'Upgrade' : 'Select'}
                          {!upgrading && <ArrowUpRight className="w-3.5 h-3.5 ml-1.5" />}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Enterprise banner */}
            {enterprise && (
              <div className="flex items-center justify-between px-6 py-4 rounded-2xl border border-border bg-muted/20 mt-4">
                <div>
                  <span className="text-sm font-medium">{enterprise.name}</span>
                  <span className="text-sm text-muted-foreground ml-3">Custom pricing · Unlimited everything</span>
                </div>
                <Button variant="ghost" size="sm" className="text-sm h-9 px-4">
                  Contact Sales
                  <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Top Up Tab */}
          <TabsContent value="topup" className="flex-1 overflow-y-auto px-8 pt-6 pb-8 mt-0">
            <p className="text-sm text-muted-foreground mb-6">One-time credit packs · Never expire · Use across all modes</p>

            <div className="grid grid-cols-3 gap-5">
              {creditPacks.map((pack) => (
                <div
                  key={pack.packId}
                  className={`relative p-7 rounded-2xl border-2 text-center transition-all hover:shadow-md ${
                    pack.popular
                      ? 'border-primary bg-primary/[0.03]'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  {pack.popular && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground text-xs px-2.5 py-0.5">Best Value</Badge>
                    </div>
                  )}
                  <div className="space-y-2 pt-1">
                    <p className="text-4xl font-bold">{pack.credits.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">credits</p>
                    <p className="text-xs text-muted-foreground">≈ {Math.round(pack.credits / 4).toLocaleString()} images</p>
                    <div className="pt-3">
                      <p className="text-2xl font-semibold">${pack.price}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{(pack.pricePerCredit * 100).toFixed(1)}¢ per credit</p>
                    </div>
                    <Button
                      variant={pack.popular ? 'default' : 'outline'}
                      className="w-full mt-4 h-11 rounded-xl text-sm font-medium"
                      onClick={() => handlePurchase(pack.credits)}
                    >
                      Buy Credits
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
