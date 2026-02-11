import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUpRight, Check, Sparkles } from 'lucide-react';
import { creditPacks, pricingPlans } from '@/data/mockData';
import { useCredits } from '@/contexts/CreditContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function BuyCreditsModal() {
  const { plan, planConfig, buyModalOpen, closeBuyModal, refreshBalance } = useCredits();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isFree = plan === 'free';

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

  const handleUpgrade = () => {
    closeBuyModal();
    navigate('/app/settings');
  };

  // Plans excluding enterprise
  const standardPlans = pricingPlans.filter(p => p.planId !== 'enterprise');
  const enterprise = pricingPlans.find(p => p.planId === 'enterprise');

  return (
    <Dialog open={buyModalOpen} onOpenChange={closeBuyModal}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden gap-0 p-0">
        <DialogHeader className="px-8 pt-8 pb-4">
          <DialogTitle className="text-xl font-semibold tracking-tight">Credits & Plan</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">Choose how you want to power your creative workflow</p>
        </DialogHeader>

        <Tabs defaultValue={isFree ? 'upgrade' : 'topup'} className="w-full flex-1 flex flex-col min-h-0">
          <div className="px-8">
            <TabsList className="w-full h-11 p-1 bg-muted/60">
              <TabsTrigger value="upgrade" className="flex-1 text-sm font-medium h-9">Upgrade Plan</TabsTrigger>
              <TabsTrigger value="topup" className="flex-1 text-sm font-medium h-9">Top Up Credits</TabsTrigger>
            </TabsList>
          </div>

          {/* Upgrade Plan Tab */}
          <TabsContent value="upgrade" className="flex-1 overflow-y-auto px-8 pt-5 pb-8 space-y-4 mt-0">
            {standardPlans.map((p) => {
              const isCurrent = p.planId === plan;
              const isRecommended = (isFree && p.planId === 'growth') || 
                (!isFree && p.planId === planConfig.nextPlanId);

              return (
                <div
                  key={p.planId}
                  className={`relative rounded-2xl border-2 p-6 transition-all ${
                    isCurrent
                      ? 'border-border bg-muted/30 opacity-60'
                      : isRecommended
                        ? 'border-primary bg-primary/[0.03] shadow-sm'
                        : 'border-border hover:border-primary/40'
                  }`}
                >
                  {isRecommended && (
                    <div className="absolute -top-3 left-6">
                      <Badge className="bg-primary text-primary-foreground text-xs px-3 py-0.5 font-medium">
                        Recommended
                      </Badge>
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-baseline gap-3">
                        <h3 className="text-lg font-semibold">{p.name}</h3>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold">${p.monthlyPrice}</span>
                          <span className="text-sm text-muted-foreground">/mo</span>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {typeof p.credits === 'number'
                          ? `${p.credits.toLocaleString()} credits per month · ≈ ${Math.round(p.credits / 4)} images`
                          : 'Unlimited credits'}
                      </p>

                      <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-1">
                        {p.features.slice(0, 4).map((feature) => (
                          <li key={feature} className="flex items-center gap-2 text-sm text-foreground/80">
                            <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex-shrink-0 pt-1">
                      {isCurrent ? (
                        <Button variant="outline" size="sm" disabled className="h-10 px-5 rounded-xl text-sm">
                          Current Plan
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant={isRecommended ? 'default' : 'outline'}
                          className="h-10 px-5 rounded-xl text-sm font-medium"
                          onClick={handleUpgrade}
                        >
                          {isRecommended ? 'Upgrade' : 'Select'}
                          <ArrowUpRight className="w-3.5 h-3.5 ml-1.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Enterprise */}
            {enterprise && (
              <div className="flex items-center justify-between px-6 py-4 rounded-2xl border border-border bg-muted/20">
                <div>
                  <span className="text-sm font-medium">{enterprise.name}</span>
                  <span className="text-sm text-muted-foreground ml-3">Custom pricing · Unlimited everything</span>
                </div>
                <Button variant="ghost" size="sm" className="text-sm h-9 px-4" onClick={handleUpgrade}>
                  Contact Sales
                  <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Top Up Tab */}
          <TabsContent value="topup" className="flex-1 overflow-y-auto px-8 pt-5 pb-8 mt-0">
            <p className="text-sm text-muted-foreground mb-5">One-time credit packs · Never expire · Use across all modes</p>

            <div className="grid grid-cols-3 gap-4">
              {creditPacks.map((pack) => (
                <div
                  key={pack.packId}
                  className={`relative p-6 rounded-2xl border-2 text-center transition-all hover:shadow-md ${
                    pack.popular
                      ? 'border-primary bg-primary/[0.03]'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  {pack.popular && (
                    <div className="absolute -top-2.5 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground text-xs px-2.5 py-0.5">Best Value</Badge>
                    </div>
                  )}
                  <div className="space-y-2 pt-1">
                    <p className="text-3xl font-bold">{pack.credits}</p>
                    <p className="text-sm text-muted-foreground">credits</p>
                    <p className="text-xs text-muted-foreground">≈ {Math.round(pack.credits / 4)} images</p>
                    <div className="pt-2">
                      <p className="text-xl font-semibold">${pack.price}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{(pack.pricePerCredit * 100).toFixed(1)}¢ per credit</p>
                    </div>
                    <Button
                      variant={pack.popular ? 'default' : 'outline'}
                      className="w-full mt-3 h-10 rounded-xl text-sm font-medium"
                      onClick={() => handlePurchase(pack.credits)}
                    >
                      Buy Credits
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-xs text-muted-foreground mt-6">
              Need more?{' '}
              <button onClick={() => {}} className="underline underline-offset-2 hover:text-foreground transition-colors">
                Upgrade your plan
              </button>{' '}
              for monthly credits included.
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
