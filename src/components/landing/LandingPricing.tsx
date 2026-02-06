import { useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pricingPlans } from '@/data/mockData';

export function LandingPricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Start free with 5 credits. No credit card required. Scale as you grow.
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
              <span className="ml-1.5 text-xs text-primary font-bold">Save 17%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {pricingPlans.map((plan) => {
            const price = plan.isEnterprise
              ? null
              : annual
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
                  {price !== null ? (
                    <div className="mt-2">
                      <span className="text-4xl font-extrabold text-foreground">${price}</span>
                      <span className="text-muted-foreground text-sm">/mo</span>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <span className="text-2xl font-bold text-foreground">Custom</span>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {typeof plan.credits === 'number' ? `${plan.credits.toLocaleString()} credits/month` : 'Unlimited credits'}
                  </p>
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
                >
                  {plan.ctaText}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>

        {/* Competitor comparison */}
        <div className="mt-14 max-w-2xl mx-auto">
          <div className="rounded-2xl bg-muted/40 border border-border p-6">
            <h3 className="text-base font-bold text-foreground text-center mb-4">
              Save 60-80% Compared to Alternatives
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { name: 'nanobanna', price: '$0.008', highlight: true },
                { name: 'Competitor A', price: '$0.03', highlight: false },
                { name: 'Competitor B', price: '$0.05', highlight: false },
              ].map((comp) => (
                <div
                  key={comp.name}
                  className={`text-center p-3 rounded-xl ${
                    comp.highlight
                      ? 'bg-primary/10 border border-primary/20'
                      : 'bg-card border border-border'
                  }`}
                >
                  <p className="text-xs font-medium text-muted-foreground">{comp.name}</p>
                  <p className="text-xl font-bold text-foreground mt-1">{comp.price}</p>
                  <p className="text-[10px] text-muted-foreground">per image</p>
                  {comp.highlight && (
                    <p className="text-[10px] font-bold text-primary mt-1">You save up to 84%</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
