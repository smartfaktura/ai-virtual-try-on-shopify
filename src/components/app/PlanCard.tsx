import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import type { PricingPlan } from '@/types';

type SubscriptionStatus = 'none' | 'active' | 'past_due' | 'canceling';

interface PlanCardProps {
  plan: PricingPlan;
  isAnnual: boolean;
  isCurrentPlan?: boolean;
  currentPlanId?: string;
  subscriptionStatus?: SubscriptionStatus;
  onSelect: (planId: string) => void;
  compact?: boolean;
}

const PLAN_ORDER = ['free', 'starter', 'growth', 'pro', 'enterprise'];

function getCtaLabel(
  plan: PricingPlan,
  currentPlanId: string | undefined,
  subscriptionStatus: SubscriptionStatus,
  isCurrentPlan: boolean,
): string {
  if (!isCurrentPlan) {
    const currentIdx = PLAN_ORDER.indexOf(currentPlanId || 'free');
    const targetIdx = PLAN_ORDER.indexOf(plan.planId);
    if (plan.isEnterprise) return 'Contact Sales';
    return targetIdx > currentIdx ? `Upgrade to ${plan.name}` : `Downgrade to ${plan.name}`;
  }
  if (subscriptionStatus === 'canceling') return 'Reactivate';
  return 'Current Plan';
}

export function PlanCard({
  plan,
  isAnnual,
  isCurrentPlan,
  currentPlanId,
  subscriptionStatus = 'none',
  onSelect,
  compact = false,
}: PlanCardProps) {
  const displayPrice = isAnnual ? Math.round(plan.annualPrice / 12) : plan.monthlyPrice;
  const monthlySavings = plan.monthlyPrice * 12 - plan.annualPrice;
  const ctaLabel = getCtaLabel(plan, currentPlanId, subscriptionStatus, !!isCurrentPlan);
  const isDisabled = isCurrentPlan && subscriptionStatus !== 'canceling';

  return (
    <div className={`relative h-full ${plan.highlighted ? 'ring-2 ring-primary rounded-2xl' : ''}`}>
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <Badge className="bg-primary text-primary-foreground text-[10px] tracking-wide px-3 py-0.5">
            {plan.badge}
          </Badge>
        </div>
      )}
      <Card className="h-full transition-shadow duration-200 hover:shadow-md rounded-2xl">
        <CardContent className={compact ? 'p-4 sm:p-5 space-y-3' : 'p-5 sm:p-6 space-y-5'}>
          {/* Plan Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className={`${compact ? 'text-base' : 'text-lg'} font-bold tracking-tight`}>{plan.name}</h3>
              {isCurrentPlan && <Badge variant="secondary" className="text-[10px]">Current</Badge>}
            </div>

            {plan.isEnterprise ? (
              <div>
                <p className="text-2xl font-bold tracking-tight">Custom</p>
                <p className="text-sm text-muted-foreground">Tailored for your needs</p>
              </div>
            ) : (
              <div>
                <div className="flex items-baseline gap-1">
                  <span className={`${compact ? 'text-2xl' : 'text-3xl'} font-bold tracking-tight`}>${displayPrice}</span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </div>
                {isAnnual && monthlySavings > 0 && (
                  <p className="text-xs text-primary font-medium mt-0.5">Save ${monthlySavings}/year</p>
                )}
              </div>
            )}
          </div>

          {/* Credits */}
          {!plan.isEnterprise && (
            <div className="rounded-xl bg-muted/60 border border-border/50 px-4 py-3 text-center">
              <p className={`${compact ? 'text-lg' : 'text-xl'} font-bold tracking-tight`}>
                {typeof plan.credits === 'number' ? plan.credits.toLocaleString() : plan.credits}
              </p>
              <p className="text-xs text-muted-foreground">credits/month</p>
            </div>
          )}

          {/* Features */}
          <div className={compact ? 'space-y-1.5' : 'space-y-2.5'}>
            {plan.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-2.5">
                <Check className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                <span className={`${compact ? 'text-xs' : 'text-sm'} text-muted-foreground`}>{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Button
            variant={plan.highlighted ? 'default' : 'outline'}
            className="w-full min-h-[44px]"
            onClick={() => onSelect(plan.planId)}
            disabled={isDisabled}
          >
            {ctaLabel}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
