import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Sparkles, AlertTriangle } from 'lucide-react';
import { pricingPlans } from '@/data/mockData';
import { useCredits } from '@/contexts/CreditContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const PLAN_ORDER = ['free', 'starter', 'growth', 'pro', 'enterprise'];

/** Features lost when downgrading from a higher tier */
function getLostFeatures(currentPlanId: string, targetPlanId: string): string[] {
  const current = pricingPlans.find(p => p.planId === currentPlanId);
  const target = pricingPlans.find(p => p.planId === targetPlanId);
  if (!current || !target) return [];

  const targetFeatureSet = new Set(target.features.map(f => f.toLowerCase()));
  return current.features.filter(f => !targetFeatureSet.has(f.toLowerCase()));
}

interface DowngradeConfirmationProps {
  open: boolean;
  targetPlanId: string;
  onClose: () => void;
  onDowngradeComplete: () => void;
}

type Step = 'confirm' | 'retention';

export function DowngradeConfirmation({
  open,
  targetPlanId,
  onClose,
  onDowngradeComplete,
}: DowngradeConfirmationProps) {
  const { plan, balance, refreshBalance } = useCredits();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('confirm');
  const [loading, setLoading] = useState(false);

  const currentPlan = pricingPlans.find(p => p.planId === plan);
  const targetPlan = pricingPlans.find(p => p.planId === targetPlanId);
  const lostFeatures = getLostFeatures(plan, targetPlanId);

  const discountedPrice = currentPlan ? Math.round(currentPlan.monthlyPrice * 0.9 * 100) / 100 : 0;

  const executeDowngrade = async () => {
    if (!user || !targetPlan) return;
    setLoading(true);
    const credits = typeof targetPlan.credits === 'number' ? targetPlan.credits : 99999;

    const { error } = await supabase.rpc('change_user_plan', {
      p_user_id: user.id,
      p_new_plan: targetPlanId,
      p_new_credits: credits,
    });

    if (error) {
      toast.error('Downgrade failed: ' + error.message);
    } else {
      await refreshBalance();
      toast.success(`Switched to ${targetPlan.name}. Your credits have been preserved.`);
      onDowngradeComplete();
    }
    setLoading(false);
  };

  const handleClaimDiscount = () => {
    toast.success(`🎉 10% discount applied! You'll pay $${discountedPrice}/mo for ${currentPlan?.name}.`);
    handleClose();
  };

  const handleClose = () => {
    setStep('confirm');
    onClose();
  };

  if (!currentPlan || !targetPlan) return null;

  return (
    <>
      {/* Step 1: Are you sure? */}
      <AlertDialog open={open && step === 'confirm'} onOpenChange={(o) => !o && handleClose()}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <AlertDialogTitle className="text-lg">Downgrade to {targetPlan.name}?</AlertDialogTitle>
            </div>
            <AlertDialogDescription asChild>
              <div className="space-y-4 text-sm">
                {lostFeatures.length > 0 && (
                  <div>
                    <p className="text-muted-foreground mb-2">You'll lose access to:</p>
                    <ul className="space-y-1.5">
                      {lostFeatures.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-foreground/70">
                          <span className="text-destructive mt-0.5">✕</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <p className="text-emerald-400 text-sm">
                    Your remaining <strong>{balance.toLocaleString()} credits</strong> will stay in your account.
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2">
            <AlertDialogCancel onClick={handleClose}>Keep Current Plan</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                setStep('retention');
              }}
            >
              Yes, Downgrade
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Step 2: Retention offer */}
      <AlertDialog open={open && step === 'retention'} onOpenChange={(o) => !o && handleClose()}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-primary" />
              <AlertDialogTitle className="text-lg">Before you go…</AlertDialogTitle>
            </div>
            <AlertDialogDescription asChild>
              <div className="space-y-4 text-sm">
                <p className="text-muted-foreground">
                  How about <strong>10% off</strong> your current plan?
                </p>

                <div className="rounded-xl border-2 border-primary/40 bg-primary/[0.04] p-4 text-center space-y-1">
                  <Badge className="bg-primary text-primary-foreground text-xs px-3 py-0.5 mb-2">
                    Exclusive Offer
                  </Badge>
                  <p className="text-2xl font-bold text-foreground">
                    ${discountedPrice}
                    <span className="text-sm text-muted-foreground font-normal">/mo</span>
                  </p>
                  <p className="text-xs text-muted-foreground line-through">
                    ${currentPlan.monthlyPrice}/mo
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Stay on {currentPlan.name} with all your features
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2 flex-col sm:flex-col gap-2 sm:space-x-0">
            <Button
              className="w-full"
              onClick={handleClaimDiscount}
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Claim 10% Off
            </Button>
            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={executeDowngrade}
              disabled={loading}
            >
              {loading ? 'Downgrading…' : 'No thanks, downgrade'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export { PLAN_ORDER };
