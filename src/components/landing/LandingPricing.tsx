import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/contexts/CreditContext';
import { Check, ArrowRight, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { pricingPlans } from '@/data/mockData';

const PLAN_ORDER = ['free', 'starter', 'growth', 'pro'];

export function LandingPricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { plan: currentPlan, subscriptionStatus } = useCredits();
  const [annual, setAnnual] = useState(false);

  const currentPlanIndex = PLAN_ORDER.indexOf(currentPlan);
  const mainPlans = pricingPlans.filter((p) => !p.isEnterprise);
  const enterprisePlan = pricingPlans.find((p) => p.isEnterprise);

  return (
    <section id="pricing" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Start free. Automate as you grow. Content Calendar included on Growth and above.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center p-1 rounded-full bg-muted">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                !annual ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                annual ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Annual
              <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Main plans — 4 columns on lg, but only non-enterprise */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {mainPlans.map((plan) => {
            const price = annual
              ? Math.round(plan.annualPrice / 12)
              : plan.monthlyPrice;

            const planIndex = PLAN_ORDER.indexOf(plan.planId);
            const isCurrentPlan = !!user && plan.planId === currentPlan;
            const isHigher = !!user && planIndex > currentPlanIndex;
            const isLower = !!user && planIndex < currentPlanIndex && planIndex >= 0;
            const isDisabled = isCurrentPlan && subscriptionStatus !== 'canceling';

            let ctaLabel = plan.ctaText;
            let ctaRoute = user ? '/app' : '/auth';
            if (user) {
              if (isCurrentPlan) {
                ctaLabel = subscriptionStatus === 'canceling' ? 'Reactivate Plan' : 'Current Plan';
                ctaRoute = '/app/settings';
              } else if (isHigher) {
                ctaLabel = `Upgrade to ${plan.name}`;
                ctaRoute = '/app/settings';
              } else if (isLower) {
                ctaLabel = `Downgrade to ${plan.name}`;
                ctaRoute = '/app/settings';
              }
            }

            return (
              <div
                key={plan.planId}
                className={`relative rounded-2xl border bg-card p-6 flex flex-col ${
                  isCurrentPlan
                    ? 'border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/20'
                    : plan.highlighted && !user
                      ? 'border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/20'
                      : 'border-border'
                }`}
              >
                {isCurrentPlan ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
                    Current Plan
                  </span>
                ) : plan.badge && !user ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
                    {plan.badge}
                  </span>
                ) : null}

                <div className="mb-6">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                    {isCurrentPlan && subscriptionStatus === 'canceling' && (
                      <Badge variant="destructive" className="text-[10px]">Canceling</Badge>
                    )}
                  </div>
                  <div className="mt-2">
                    <span className="text-4xl font-extrabold text-foreground">${price}</span>
                    <span className="text-muted-foreground text-sm">/mo</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {typeof plan.credits === 'number'
                      ? `${plan.credits.toLocaleString()} credits/month`
                      : 'Unlimited visuals'}
                  </p>
                  {typeof plan.credits === 'number' && (
                    <>
                      <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                        ≈ {Math.round(plan.credits / 5)} images
                      </p>
                      {price > 0 && plan.credits > 0 && (
                        <p className="text-[10px] text-primary/70 font-medium mt-0.5">
                          ${(price / plan.credits).toFixed(3)} per credit
                        </p>
                      )}
                    </>
                  )}
                </div>

                <ul className="flex-1 space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      {typeof feature === 'string' ? feature : (
                        <span className="inline-flex items-center gap-1.5">
                          {feature.text}
                          {feature.badge && (
                            <Badge className="text-[9px] px-1.5 py-0 leading-tight bg-primary text-primary-foreground">
                              {feature.badge}
                            </Badge>
                          )}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={
                    user
                      ? (isCurrentPlan ? 'secondary' : isHigher ? 'default' : 'outline')
                      : (plan.highlighted ? 'default' : 'outline')
                  }
                  className="rounded-full font-semibold w-full gap-2"
                  disabled={isDisabled}
                  onClick={() => navigate(ctaRoute)}
                >
                  {ctaLabel}
                  {!isDisabled && <ArrowRight className="w-4 h-4" />}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Enterprise — full-width banner below */}
        {enterprisePlan && (
          <div className="mt-10 max-w-6xl mx-auto rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-10">
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{enterprisePlan.name}</h3>
                  <p className="text-sm text-muted-foreground">Custom pricing for large teams</p>
                </div>
              </div>

              <ul className="flex-1 flex flex-wrap gap-x-6 gap-y-2">
                {enterprisePlan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    {typeof feature === 'string' ? feature : feature.text}
                  </li>
                ))}
              </ul>

              <Button
                variant="outline"
                className="rounded-full font-semibold gap-2 shrink-0"
                onClick={() => navigate('/contact')}
              >
                Contact Sales
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
