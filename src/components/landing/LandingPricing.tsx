import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pricingPlans } from '@/data/mockData';

export function LandingPricing() {
  const navigate = useNavigate();
  const [annual, setAnnual] = useState(false);

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
            Start free. Automate as you grow. Creative Drops included on Growth and above.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 p-1 rounded-full bg-muted">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                !annual ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                annual ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Annual
              <span className="ml-1.5 text-xs text-primary font-bold">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Main plans — 4 columns on lg, but only non-enterprise */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {mainPlans.map((plan) => {
            const price = annual
              ? Math.round(plan.annualPrice / 12)
              : plan.monthlyPrice;

            return (
              <div
                key={plan.planId}
                className={`relative rounded-2xl border bg-card p-6 flex flex-col ${
                  plan.highlighted
                    ? 'border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/20'
                    : 'border-border'
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
                    {plan.badge}
                  </span>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
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
                    <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                      ≈ {Math.round(plan.credits / 10)} images
                    </p>
                  )}
                </div>

                <ul className="flex-1 space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.highlighted ? 'default' : 'outline'}
                  className="rounded-full font-semibold w-full gap-2"
                  onClick={() => navigate('/auth')}
                >
                  {plan.ctaText}
                  <ArrowRight className="w-4 h-4" />
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
                {enterprisePlan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                variant="outline"
                className="rounded-full font-semibold gap-2 shrink-0"
                onClick={() => navigate('/auth')}
              >
                Contact Sales
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="mt-14 text-center">
          <p className="text-sm text-muted-foreground">
            All plans include unlimited Brand Profiles and workflow access.
          </p>
        </div>
      </div>
    </section>
  );
}
