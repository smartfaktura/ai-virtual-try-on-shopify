import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
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
  iconBg: string;
  iconColor: string;
}> = {
  upgrade: {
    icon: ArrowUpRight,
    title: 'Upgrade Plan',
    confirmLabel: 'Confirm Upgrade',
    confirmVariant: 'default',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  downgrade: {
    icon: ArrowDownRight,
    title: 'Downgrade Plan',
    confirmLabel: 'Confirm Downgrade',
    confirmVariant: 'default',
    iconBg: 'bg-muted',
    iconColor: 'text-muted-foreground',
  },
  cancel: {
    icon: XCircle,
    title: 'Cancel Subscription',
    confirmLabel: 'Cancel Subscription',
    confirmVariant: 'destructive',
    iconBg: 'bg-destructive/10',
    iconColor: 'text-destructive',
  },
  reactivate: {
    icon: RotateCcw,
    title: 'Reactivate Subscription',
    confirmLabel: 'Reactivate',
    confirmVariant: 'default',
    iconBg: 'bg-primary/10',
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
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden border-border/50 shadow-2xl">
        {/* Header */}
        <div className="px-8 pt-8 pb-5">
          <div className="flex items-center gap-3.5">
            <div className={`p-3 rounded-xl ${config.iconBg}`}>
              <Icon className={`w-5 h-5 ${config.iconColor}`} />
            </div>
            <h2 className="text-lg font-semibold tracking-tight">{config.title}</h2>
          </div>
        </div>

        <div className="px-8 pb-6 space-y-5">
          {mode === 'upgrade' && targetPlan && (
            <>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You'll be upgraded to <span className="font-semibold text-foreground">{targetPlan.name}</span> at{' '}
                <span className="font-semibold text-foreground">${displayPrice}/mo</span>.
                Your new credits will be available immediately.
              </p>
              <div className="rounded-2xl bg-muted/30 border border-border/40 p-5 space-y-2.5">
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
              <div className="flex items-start gap-3 rounded-2xl bg-muted/30 border border-border/40 p-5">
                <AlertTriangle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground leading-relaxed">
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
              <div className="flex items-start gap-3 rounded-2xl bg-destructive/5 border border-destructive/15 p-5">
                <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground leading-relaxed">
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

        <DialogFooter className="px-8 pb-8 pt-0 gap-3 sm:gap-3">
          <Button variant="outline" onClick={onClose} className="rounded-xl min-h-[44px]">
            Go Back
          </Button>
          <Button variant={config.confirmVariant} onClick={onConfirm} className="rounded-xl min-h-[44px]">
            {config.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
