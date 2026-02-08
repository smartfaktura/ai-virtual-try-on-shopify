import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, ArrowUpRight, Check, Zap } from 'lucide-react';
import { creditPacks, pricingPlans } from '@/data/mockData';
import { useCredits } from '@/contexts/CreditContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const CURRENT_PLAN_ID = 'growth';
const PLAN_CREDITS = 2500;

export function BuyCreditsModal() {
  const { balance, buyModalOpen, closeBuyModal, addCredits } = useCredits();
  const navigate = useNavigate();

  const currentPlan = pricingPlans.find(p => p.planId === CURRENT_PLAN_ID)!;
  const nextPlan = pricingPlans.find(p => p.planId === 'pro')!;
  const usagePercent = Math.min(100, Math.max(3, (balance / PLAN_CREDITS) * 100));

  // Calculate cost of buying equivalent credits as top-ups
  // Using the best pack rate (pack_4000 at $0.0223/credit)
  const nextPlanCredits = typeof nextPlan.credits === 'number' ? nextPlan.credits : 0;
  const topUpCostForNextPlanCredits = Math.round(nextPlanCredits * 0.026);

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
            <Badge variant="secondary" className="text-xs">{currentPlan.name} Plan</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold">{balance} credits</span>
            <span className="text-xs text-muted-foreground">/ {PLAN_CREDITS.toLocaleString()} monthly</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>

        <Tabs defaultValue="topup" className="w-full">
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
            <div className="p-4 rounded-lg border-2 border-primary bg-primary/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="font-semibold">{nextPlan.name} Plan</span>
                </div>
                <Badge className="bg-primary text-primary-foreground">Recommended</Badge>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">${nextPlan.monthlyPrice}</span>
                <span className="text-sm text-muted-foreground">/month</span>
              </div>

              <p className="text-sm text-muted-foreground">
                {typeof nextPlan.credits === 'number' ? nextPlan.credits.toLocaleString() : 'Unlimited'} credits/month
                {' '}• ≈ {typeof nextPlan.credits === 'number' ? Math.round(nextPlan.credits / 4).toLocaleString() : '∞'} images
              </p>

              {/* Savings highlight */}
              <div className="p-2.5 rounded-md bg-primary/10 text-sm">
                <span className="font-medium">Save vs top-ups: </span>
                <span className="text-muted-foreground">
                  {nextPlanCredits.toLocaleString()} credits as top-ups would cost ~${topUpCostForNextPlanCredits}
                  {' '}— you save <span className="font-semibold text-primary">${topUpCostForNextPlanCredits - nextPlan.monthlyPrice}/month</span>
                </span>
              </div>

              {/* Key features */}
              <ul className="space-y-1.5">
                {nextPlan.features.slice(0, 5).map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button className="w-full" onClick={handleUpgrade}>
                Upgrade to {nextPlan.name}
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

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
