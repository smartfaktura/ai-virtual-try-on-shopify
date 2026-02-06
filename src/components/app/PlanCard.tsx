import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check } from 'lucide-react';
import type { PricingPlan } from '@/types';

interface PlanCardProps {
  plan: PricingPlan;
  isAnnual: boolean;
  isCurrentPlan?: boolean;
  onSelect: (planId: string) => void;
}

export function PlanCard({ plan, isAnnual, isCurrentPlan, onSelect }: PlanCardProps) {
  const displayPrice = isAnnual ? Math.round(plan.annualPrice / 12) : plan.monthlyPrice;
  const monthlySavings = plan.monthlyPrice * 12 - plan.annualPrice;
  
  return (
    <div className={`relative h-full ${plan.highlighted ? 'ring-2 ring-primary rounded-xl' : ''}`}>
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <Badge className="bg-primary text-primary-foreground">{plan.badge}</Badge>
        </div>
      )}
      <Card className="h-full">
        <CardContent className="p-5 space-y-4">
          {/* Plan Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">{plan.name}</h3>
              {isCurrentPlan && <Badge variant="secondary">Current</Badge>}
            </div>
            
            {plan.isEnterprise ? (
              <div>
                <p className="text-2xl font-bold">Custom</p>
                <p className="text-sm text-muted-foreground">Tailored for your needs</p>
              </div>
            ) : (
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">${displayPrice}</span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </div>
                {isAnnual && monthlySavings > 0 && (
                  <p className="text-sm text-primary">Save ${monthlySavings}/year</p>
                )}
              </div>
            )}
          </div>

          {/* Credits */}
          {!plan.isEnterprise && (
            <div className="bg-muted rounded-lg p-3 text-center">
              <p className="text-lg font-semibold">
                {typeof plan.credits === 'number' ? plan.credits.toLocaleString() : plan.credits}
              </p>
              <p className="text-sm text-muted-foreground">credits/month</p>
            </div>
          )}

          <Separator />

          {/* Features */}
          <div className="space-y-2">
            {plan.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Button
            variant={plan.highlighted ? 'default' : 'outline'}
            className="w-full"
            onClick={() => onSelect(plan.planId)}
            disabled={isCurrentPlan}
          >
            {isCurrentPlan ? 'Current Plan' : plan.ctaText}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
