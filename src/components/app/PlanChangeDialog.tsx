import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ArrowDownRight, XCircle, RotateCcw, AlertTriangle } from 'lucide-react';
import type { PricingPlan } from '@/types';

export type PlanChangeMode = 'upgrade' | 'downgrade' | 'cancel' | 'reactivate';

interface PlanChangeDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  mode: PlanChangeMode;
  targetPlan?: PricingPlan;
  currentPlanName?: string;
  isAnnual?: boolean;
  currentBalance?: number;
  periodEnd?: string;
}

const modeConfig: Record<PlanChangeMode, {
  icon: typeof ArrowUpRight;
  title: string;
  confirmLabel: string;
  confirmVariant: 'default' | 'destructive';
  iconColor: string;
}> = {
  upgrade: {
    icon: ArrowUpRight,
    title: 'Upgrade Plan',
    confirmLabel: 'Confirm Upgrade',
    confirmVariant: 'default',
    iconColor: 'text-primary',
  },
  downgrade: {
    icon: ArrowDownRight,
    title: 'Downgrade Plan',
    confirmLabel: 'Confirm Downgrade',
    confirmVariant: 'default',
    iconColor: 'text-muted-foreground',
  },
  cancel: {
    icon: XCircle,
    title: 'Cancel Subscription',
    confirmLabel: 'Cancel Subscription',
    confirmVariant: 'destructive',
    iconColor: 'text-destructive',
  },
  reactivate: {
    icon: RotateCcw,
    title: 'Reactivate Subscription',
    confirmLabel: 'Reactivate',
    confirmVariant: 'default',
    iconColor: 'text-primary',
  },
};

export function PlanChangeDialog({
  open,
  onClose,
  onConfirm,
  mode,
  targetPlan,
  currentPlanName,
  isAnnual,
  currentBalance,
  periodEnd,
}: PlanChangeDialogProps) {
  const config = modeConfig[mode];
  const Icon = config.icon;
  const displayPrice = targetPlan
    ? isAnnual ? Math.round(targetPlan.annualPrice / 12) : targetPlan.monthlyPrice
    : 0;
  const credits = targetPlan?.credits;
  const formattedPeriodEnd = periodEnd || 'your next billing date';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className={`p-2.5 rounded-xl bg-muted ${config.iconColor}`}>
              <Icon className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg">{config.title}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {mode === 'upgrade' && targetPlan && (
            <>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You'll be upgraded to <span className="font-semibold text-foreground">{targetPlan.name}</span> at{' '}
                <span className="font-semibold text-foreground">${displayPrice}/mo</span>.
                Your new credits will be available immediately.
              </p>
              <div className="rounded-xl bg-muted/50 border border-border p-4 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-medium">{targetPlan.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Monthly credits</span>
                  <span className="font-medium">{typeof credits === 'number' ? credits.toLocaleString() : credits}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-medium">${displayPrice}/mo</span>
                </div>
              </div>
            </>
          )}

          {mode === 'downgrade' && targetPlan && (
            <>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your plan will change to <span className="font-semibold text-foreground">{targetPlan.name}</span> at
                the end of your billing period on <span className="font-semibold text-foreground">{formattedPeriodEnd}</span>.
              </p>
              <div className="flex items-start gap-3 rounded-xl bg-muted/50 border border-border p-4">
                <AlertTriangle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  You'll keep your current credits and features until then. After the change, you'll receive{' '}
                  {typeof credits === 'number' ? credits.toLocaleString() : credits} credits/month.
                </p>
              </div>
            </>
          )}

          {mode === 'cancel' && (
            <>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your subscription will end on <span className="font-semibold text-foreground">{formattedPeriodEnd}</span>.
                You'll keep your remaining <span className="font-semibold text-foreground">{currentBalance ?? 0}</span> credits
                but won't receive monthly credits anymore.
              </p>
              <div className="flex items-start gap-3 rounded-xl bg-destructive/5 border border-destructive/20 p-4">
                <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  This action takes effect at the end of your billing period. You can reactivate anytime before then.
                </p>
              </div>
            </>
          )}

          {mode === 'reactivate' && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your <span className="font-semibold text-foreground">{currentPlanName}</span> subscription will be restored.
              You'll continue receiving monthly credits on your next billing date.
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Go Back
          </Button>
          <Button variant={config.confirmVariant} onClick={onConfirm}>
            {config.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
