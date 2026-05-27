import { useState, useEffect, useCallback } from 'react';
import { SEOHead } from '@/components/SEOHead';
import { gtagViewItem } from '@/lib/gtag';
import { Building2, Check, ExternalLink, Loader2, Plus, RotateCcw } from 'lucide-react';
import { PRODUCT_CATEGORIES } from '@/lib/categoryConstants';
import { PlanChangeDialog, type PlanChangeMode } from '@/components/app/PlanChangeDialog';
import { FeedbackBanner } from '@/components/app/FeedbackBanner';
import { AdminFeedbackPanel } from '@/components/app/AdminFeedbackPanel';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { PageHeader } from '@/components/app/PageHeader';
import { PlanCard } from '@/components/app/PlanCard';
import { CreditPackCard } from '@/components/app/CreditPackCard';
import { useCredits } from '@/contexts/CreditContext';
import { useAuth } from '@/contexts/AuthContext';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { supabase } from '@/integrations/supabase/client';
import { pricingPlans, creditPacks } from '@/data/mockData';
import { toast } from '@/lib/brandedToast';
import {
  SUB_TYPES_BY_FAMILY,
  getMultiSubFamilies,
  getSingleSubFamilies,
  getAutoIncludedSlugs,
  resolveFamilyNames,
  cleanSubs,
} from '@/lib/onboardingTaxonomy';

interface UserSettings {
  emailOnComplete: boolean;
  emailOnFailed: boolean;
  emailLowCredits: boolean;
  
  inAppComplete: boolean;
  inAppFailed: boolean;
  inAppTips: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  emailOnComplete: false,
  emailOnFailed: true,
  emailLowCredits: true,
  
  inAppComplete: true,
  inAppFailed: true,
  inAppTips: true,
};

function ContentPreferencesSection() {
  const { user } = useAuth();
  const [cats, setCats] = useState<string[]>([]);
  const [subs, setSubs] = useState<string[]>([]);
  const [original, setOriginal] = useState<{ cats: string[]; subs: string[] }>({ cats: [], subs: [] });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('product_categories, product_subcategories')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        const c = (data?.product_categories as string[]) ?? [];
        const s = ((data as any)?.product_subcategories as string[]) ?? [];
        setCats(c);
        setSubs(s);
        setOriginal({ cats: c, subs: s });
      });
  }, [user]);

  const toggle = (id: string) =>
    setCats((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));

  const toggleSub = (slug: string) =>
    setSubs((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));




  const familyNames = resolveFamilyNames(cats);
  const multiSubFamilies = getMultiSubFamilies(familyNames);
  const singleSubFamilies = getSingleSubFamilies(familyNames);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Drop sub-picks no longer reachable (e.g. user removed the parent family),
      // re-add single-sub-type auto-includes, then normalise via cleanSubs (lowercase / dedup / valid-slug only).
      const validSubSlugs = new Set(
        multiSubFamilies.flatMap(fam => (SUB_TYPES_BY_FAMILY[fam] ?? []).map(t => t.slug)),
      );
      const finalSubs = cleanSubs([
        ...subs.filter(s => validSubSlugs.has(s)),
        ...getAutoIncludedSlugs(singleSubFamilies),
      ]);

      const { error } = await supabase
        .from('profiles')
        .update({ product_categories: cats, product_subcategories: finalSubs } as any)
        .eq('user_id', user.id);

      if (error) {
        toast.error('Failed to save');
        return;
      }

      setSubs(finalSubs);
      setOriginal({ cats, subs: finalSubs });
      toast.success('Preferences saved');

      // Fire-and-forget Resend sync — never block the UI on this
      void (async () => {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('marketing_emails_opted_in, plan, credits_balance, first_name')
            .eq('user_id', user.id)
            .maybeSingle();
          if (!profile) return;
          const familyLabels = cats
            .map(id => PRODUCT_CATEGORIES.find(c => c.id === id)?.label ?? id);
          supabase.functions.invoke('sync-resend-contact', {
            body: {
              email: user.email,
              user_id: user.id,
              first_name: profile.first_name,
              opted_in: profile.marketing_emails_opted_in,
              properties: {
                plan: profile.plan,
                credits_balance: profile.credits_balance,
                product_categories: familyLabels.join(', '),
                product_subcategories: finalSubs.join(', '),
                families: familyNames,
                subtypes: finalSubs,
                primary_family: familyNames[0] ?? null,
                primary_subtype: finalSubs[0] ?? null,
              },
            },
          }).catch(() => {});

          // Custom Event for automations triggered on category/profile updates
          supabase.functions.invoke('track-resend-event', {
            body: {
              email: user.email,
              user_id: user.id,
              event: 'profile.updated',
              attributes: {
                plan: profile.plan,
                families: familyNames,
                primary_family: familyNames[0] ?? null,
                subtypes: finalSubs,
              },
            },
          }).catch(() => {});
        } catch {
          /* non-critical */
        }
      })();
    } catch (err) {
      console.error('Preferences save failed:', err);
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="space-y-3">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
          Preferences
        </p>
        <h3 className="text-2xl font-semibold tracking-tight leading-none">Content preferences</h3>
        <p className="text-sm text-muted-foreground">
          Select categories that match your products — this tailors your dashboard experience
        </p>
      </div>

      <div className="my-7 border-t border-border/60" />

      <div className="grid grid-cols-2 gap-3">
        {PRODUCT_CATEGORIES.map(({ id, label }) => (
          <div key={id} className="flex items-center gap-3">
            <Checkbox
              id={`pref-${id}`}
              checked={cats.includes(id)}
              onCheckedChange={() => toggle(id)}
            />
            <Label htmlFor={`pref-${id}`} className="text-sm font-medium cursor-pointer">
              {label}
            </Label>
          </div>
        ))}
      </div>

      {multiSubFamilies.length > 0 && (
        <>
          <div className="my-7 border-t border-border/60" />
          <div className="space-y-4">
            <div className="space-y-1.5">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
                Specific product types
              </p>
              <p className="text-xs text-muted-foreground">
                Optional — pick the precise types you work with for sharper recommendations
              </p>
            </div>
            <div className="space-y-5">
              {multiSubFamilies.map((fam) => {
                const types = SUB_TYPES_BY_FAMILY[fam] ?? [];
                return (
                  <div key={fam} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-muted-foreground">
                        {fam}
                      </span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {types.map(({ slug, label }) => {
                        const isSelected = subs.includes(slug);
                        return (
                          <button
                            key={slug}
                            type="button"
                            onClick={() => toggleSub(slug)}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-[13px] font-medium transition-all ${
                              isSelected
                                ? 'border-primary bg-primary/5 text-foreground'
                                : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 text-primary" />}
                            <span>{label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      <div className="my-7 border-t border-border/60" />

      <div className="flex items-center gap-4 flex-wrap">
        <Button className="h-11 rounded-xl px-6" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save preferences'}
        </Button>
        <button
          onClick={() => { setCats(original.cats); setSubs(original.subs); }}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset to onboarding selection
        </button>
      </div>
    </div>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();

  useEffect(() => { gtagViewItem('Settings', 'settings_page'); }, []);
  const { balance, plan, planConfig, subscriptionStatus, currentPeriodEnd, billingInterval, startCheckout, openCustomerPortal, openBuyModal } = useCredits();

  const [portalLoading, setPortalLoading] = useState(false);
  const handlePortal = async () => {
    setPortalLoading(true);
    try { await openCustomerPortal(); } finally { setPortalLoading(false); }
  };

  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<PlanChangeMode>('upgrade');
  const [selectedPlan, setSelectedPlan] = useState<import('@/types').PricingPlan | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [marketingOptIn, setMarketingOptIn] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>(billingInterval || 'monthly');

  const currentPlanId = plan;
  const creditsTotal = planConfig.monthlyCredits;
  const creditsPercentage = creditsTotal === Infinity ? 100 : Math.min(100, (balance / creditsTotal) * 100);

  const mainPlans = pricingPlans.filter(p => !p.isEnterprise);
  const enterprisePlan = pricingPlans.find(p => p.isEnterprise);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('settings, marketing_emails_opted_in')
        .eq('user_id', user.id)
        .single();

      if (data?.settings && typeof data.settings === 'object' && !Array.isArray(data.settings)) {
        setSettings(prev => ({ ...prev, ...(data.settings as Partial<UserSettings>) }));
      }
      if (data && typeof data.marketing_emails_opted_in === 'boolean') {
        setMarketingOptIn(data.marketing_emails_opted_in);
      }
      setIsLoaded(true);
    };
    load();
  }, [user]);

  const updateSetting = useCallback(<K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          settings: JSON.parse(JSON.stringify(settings)),
          marketing_emails_opted_in: marketingOptIn,
        })
        .eq('user_id', user.id);

      if (error) {
        toast.error('Failed to save settings');
        return;
      }

      toast.success('Settings saved successfully!');

      // Fire-and-forget Resend sync — never block the UI on this
      void (async () => {
        try {
          const { resolveFamilyNames } = await import('@/lib/onboardingTaxonomy');
          const { data: profileData } = await supabase
            .from('profiles')
            .select('product_categories, product_subcategories, first_name')
            .eq('user_id', user.id)
            .maybeSingle();
          const cats = ((profileData?.product_categories as string[]) ?? []);
          const subs = (((profileData as any)?.product_subcategories as string[]) ?? []);
          const familyLabels = cats.map(id => PRODUCT_CATEGORIES.find(c => c.id === id)?.label ?? id);
          const familyNames = resolveFamilyNames(cats);
          supabase.functions.invoke('sync-resend-contact', {
            body: {
              email: user.email,
              user_id: user.id,
              first_name: profileData?.first_name,
              opted_in: marketingOptIn,
              properties: {
                plan,
                credits_balance: balance,
                has_generated: true,
                signup_date: user.created_at || new Date().toISOString(),
                product_categories: familyLabels.join(', '),
                product_subcategories: subs.join(', '),
                families: familyNames,
                subtypes: subs,
                primary_family: familyNames[0] ?? null,
                primary_subtype: subs[0] ?? null,
              },
            },
          }).catch(() => {});

          supabase.functions.invoke('track-resend-event', {
            body: {
              email: user.email,
              user_id: user.id,
              event: 'profile.updated',
              attributes: {
                plan,
                families: familyNames,
                primary_family: familyNames[0] ?? null,
                subtypes: subs,
              },
            },
          }).catch(() => {});
        } catch {
          /* non-critical */
        }
      })();
    } catch (err) {
      console.error('Settings save failed:', err);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const PLAN_ORDER = ['free', 'starter', 'growth', 'pro', 'enterprise'];

  const handlePlanSelect = (planId: string) => {
    if (planId === 'enterprise') {
      toast.info('Our team will reach out to discuss your needs!');
      return;
    }
    const target = pricingPlans.find(p => p.planId === planId);
    if (!target) return;

    const currentIdx = PLAN_ORDER.indexOf(plan);
    const targetIdx = PLAN_ORDER.indexOf(planId);

    if (planId === plan && subscriptionStatus === 'canceling') {
      setDialogMode('reactivate');
    } else if (planId === 'free') {
      setDialogMode('cancel');
    } else if (targetIdx > currentIdx) {
      setDialogMode('upgrade');
    } else {
      setDialogMode('downgrade');
    }

    setSelectedPlan(target);
    setDialogOpen(true);
  };

  const handleDialogConfirm = async () => {
    setCheckoutLoading(true);
    try {
      if (selectedPlan && (dialogMode === 'upgrade' || dialogMode === 'downgrade')) {
        if (subscriptionStatus === 'active' || subscriptionStatus === 'canceling') {
          await openCustomerPortal();
        } else {
          const priceId = billingPeriod === 'annual' ? selectedPlan.stripePriceIdAnnual : selectedPlan.stripePriceIdMonthly;
          if (priceId) {
            await startCheckout(priceId, 'subscription', selectedPlan.name);
          }
        }
      } else if (dialogMode === 'cancel' || dialogMode === 'reactivate') {
        await openCustomerPortal();
      }
    } catch {
      setCheckoutLoading(false);
    }
  };

  const [topUpLoadingId, setTopUpLoadingId] = useState<string | null>(null);

  const handleCreditPurchase = async (packId: string) => {
    const pack = creditPacks.find(p => p.packId === packId);
    if (pack?.stripePriceId) {
      setTopUpLoadingId(packId);
      try {
        await startCheckout(pack.stripePriceId, 'payment', `${pack.credits} Credits`);
      } catch {
        setTopUpLoadingId(null);
      }
    }
  };

  return (
    <>
    <SEOHead title="Settings — VOVV.AI" description="Manage your VOVV.AI account settings, plan, and preferences." noindex />
    <div className="animate-in fade-in duration-500">
      <PageHeader title="Settings">
        <div className="space-y-6">
        {/* ─── Current Plan ─── */}
        {!(plan === 'free' && subscriptionStatus === 'none') && (() => {
          const currentPlanData = pricingPlans.find(p => p.planId === plan);
          const displayPrice = currentPlanData
            ? billingInterval === 'annual'
              ? Math.round(currentPlanData.annualPrice / 12)
              : currentPlanData.monthlyPrice
            : null;
          const renewalLabel = currentPeriodEnd && plan !== 'free'
            ? `${subscriptionStatus === 'canceling' ? 'Access until' : 'Renews'} ${currentPeriodEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
            : null;
          const daysLeft = currentPeriodEnd
            ? Math.max(0, Math.ceil((currentPeriodEnd.getTime() - Date.now()) / 86400000))
            : null;
          const isInfinite = creditsTotal === Infinity;
          return (
            <div className="rounded-2xl border border-border bg-card p-7 sm:p-9 shadow-sm">
              {/* Band 1 — Plan identity */}
              <div className="space-y-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
                  Current plan
                </p>
                <div className="flex items-end justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-semibold tracking-tight leading-none">
                      {planConfig.name}
                    </h3>
                    {plan !== 'free' && (
                      <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-medium">
                        {billingInterval === 'annual' ? 'Annual' : 'Monthly'}
                      </Badge>
                    )}
                  </div>
                  {plan !== 'free' && billingInterval !== 'annual' && (
                    <button
                      className="text-sm text-primary hover:underline underline-offset-4 font-medium disabled:opacity-50"
                      onClick={handlePortal}
                      disabled={portalLoading}
                    >
                      {portalLoading ? 'Redirecting…' : 'Switch to annual · save 20%'}
                    </button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground tabular-nums">
                  {displayPrice !== null && displayPrice > 0 && <>${displayPrice}/mo</>}
                  {displayPrice !== null && displayPrice > 0 && renewalLabel && ' · '}
                  {renewalLabel}
                </p>
              </div>

              {/* Divider */}
              <div className="my-7 border-t border-border/60" />

              {/* Band 2 — Credits usage */}
              <div className="space-y-4">
                <div className="flex items-end justify-between gap-4">
                  <span className="text-sm text-muted-foreground">
                    Credits this cycle
                  </span>
                  <span className="text-2xl font-semibold tracking-tight tabular-nums leading-none">
                    {balance.toLocaleString()}
                    <span className="text-muted-foreground/70 font-normal text-base"> / {isInfinite ? '∞' : creditsTotal.toLocaleString()}</span>
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden ring-1 ring-inset ring-border/40">
                  <div
                    className="h-full bg-foreground rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(2, creditsPercentage))}%` }}
                  />
                </div>
                {(daysLeft !== null || plan === 'free') && (
                  <p className="text-xs text-muted-foreground">
                    {daysLeft !== null && plan !== 'free'
                      ? `Resets in ${daysLeft} day${daysLeft === 1 ? '' : 's'} · Top up anytime`
                      : 'Top up anytime'}
                  </p>
                )}
              </div>

              {/* Band 3 — Billing actions */}
              {plan !== 'free' && (
                <>
                  <div className="my-7 border-t border-border/60" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button className="w-full h-11 rounded-xl" onClick={() => openBuyModal('settings')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Top up credits
                    </Button>
                    <Button variant="secondary" className="w-full h-11 rounded-xl" onClick={handlePortal} disabled={portalLoading}>
                      {portalLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ExternalLink className="w-4 h-4 mr-2" />}
                      {portalLoading ? 'Redirecting…' : 'Manage billing & invoices'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          );
        })()}

        {/* ─── Choose Your Plan ─── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
              Plans
            </p>
            <h3 className="text-2xl font-semibold tracking-tight leading-none">Choose your plan</h3>
            <p className="text-sm text-muted-foreground">Built for ongoing brand-ready visual production</p>
          </div>
          <div className="inline-flex self-start sm:self-auto rounded-full border border-border bg-card p-1 shadow-sm">
            <button
              className={`h-9 px-4 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${billingPeriod === 'monthly' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setBillingPeriod('monthly')}
            >
              Monthly
            </button>
            <button
              className={`h-9 px-4 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${billingPeriod === 'annual' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setBillingPeriod('annual')}
            >
              Annual · Save 20%
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {mainPlans.map(p => (
            <PlanCard
              key={p.planId}
              plan={p}
              isAnnual={billingPeriod === 'annual'}
              isCurrentPlan={p.planId === currentPlanId}
              currentPlanId={currentPlanId}
              subscriptionStatus={subscriptionStatus}
              billingInterval={billingInterval}
              onSelect={handlePlanSelect}
              compact
            />
          ))}
        </div>

        {/* Enterprise banner */}
        {enterprisePlan && (
          <div className="rounded-2xl border border-border bg-card p-7 sm:p-9 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-3 flex-1">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
                  Enterprise
                </p>
                <h3 className="text-2xl font-semibold tracking-tight leading-none">{enterprisePlan.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Need custom volume? Get unlimited visuals, dedicated support, and custom integrations.
                </p>
                <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
                  {enterprisePlan.features.slice(0, 4).map((f, i) => (
                    <span key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-3.5 h-3.5 text-foreground" /> {typeof f === 'string' ? f : f.text}
                    </span>
                  ))}
                </div>
              </div>
              <Button className="h-11 rounded-xl shrink-0 px-6" onClick={() => window.location.href = 'mailto:hello@vovv.ai?subject=Enterprise%20Plan%20Inquiry'}>
                Contact Sales
              </Button>
            </div>
          </div>
        )}

        {/* Credit packs */}
        <div className="rounded-2xl border border-border bg-card p-7 sm:p-9 shadow-sm">
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
              Top-up
            </p>
            <h3 className="text-2xl font-semibold tracking-tight leading-none">Need more credits</h3>
            <p className="text-sm text-muted-foreground">Purchase additional credits anytime · Credits never expire</p>
          </div>
          <div className="my-7 border-t border-border/60" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {creditPacks.map(pack => (
              <CreditPackCard key={pack.packId} pack={pack} onPurchase={handleCreditPurchase} isLoading={topUpLoadingId === pack.packId} disabled={!!topUpLoadingId} />
            ))}
          </div>
        </div>

        {/* Cancel subscription link */}
        {plan !== 'free' && subscriptionStatus !== 'canceling' && (
          <div className="text-center">
            <button
              className="text-sm text-muted-foreground hover:text-destructive transition-colors underline underline-offset-4"
              onClick={() => {
                setDialogMode('cancel');
                setSelectedPlan(null);
                setDialogOpen(true);
              }}
            >
              Cancel subscription
            </button>
          </div>
        )}
        {plan !== 'free' && subscriptionStatus === 'canceling' && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Your subscription will end at the end of your billing period.{' '}
              <button
                className="text-primary hover:underline underline-offset-4"
                onClick={() => {
                  setDialogMode('reactivate');
                  setSelectedPlan(null);
                  setDialogOpen(true);
                }}
              >
                Reactivate
              </button>
            </p>
          </div>
        )}

        {/* ─── Notifications ─── */}
        <div className="rounded-2xl border border-border bg-card p-7 sm:p-9 shadow-sm">
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
              Notifications
            </p>
            <h2 className="text-2xl font-semibold tracking-tight leading-none">Notifications</h2>
            <p className="text-sm text-muted-foreground">Manage how you receive updates</p>
          </div>

          <div className="my-7 border-t border-border/60" />

          <div className="space-y-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Email notifications</h3>
            {([
              { key: 'emailOnComplete' as const, label: 'Generation complete', help: 'Receive email when image generation finishes' },
              { key: 'emailOnFailed' as const, label: 'Generation failed', help: 'Receive email if generation encounters an error' },
              { key: 'emailLowCredits' as const, label: 'Low credits warning', help: "Get notified when credits drop below 10%" },
            ] as const).map(n => (
              <div key={n.key} className="flex items-start gap-3">
                <Checkbox id={n.key} checked={settings[n.key]} onCheckedChange={v => updateSetting(n.key, !!v)} className="mt-0.5" />
                <div className="space-y-0.5">
                  <Label htmlFor={n.key} className="text-sm font-medium">{n.label}</Label>
                  <p className="text-xs text-muted-foreground">{n.help}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="my-7 border-t border-border/60" />

          <div className="space-y-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Marketing & promotions</h3>
            <div className="flex items-start gap-3">
              <Checkbox id="marketingOptIn" checked={marketingOptIn} onCheckedChange={v => setMarketingOptIn(!!v)} className="mt-0.5" />
              <div className="space-y-0.5">
                <Label htmlFor="marketingOptIn" className="text-sm font-medium">News, tips & special offers</Label>
                <p className="text-xs text-muted-foreground">Receive product updates, tips, and occasional promotions via email</p>
              </div>
            </div>
          </div>

          <div className="my-7 border-t border-border/60" />

          <div className="space-y-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">In-app notifications</h3>
            {([
              { key: 'inAppComplete' as const, label: 'Show generation complete' },
              { key: 'inAppFailed' as const, label: 'Show generation errors' },
              { key: 'inAppTips' as const, label: 'Show tips and suggestions', help: 'Occasional tips to improve your generations' },
            ] as const).map(n => (
              <div key={n.key} className="flex items-start gap-3">
                <Checkbox id={n.key} checked={settings[n.key]} onCheckedChange={v => updateSetting(n.key, !!v)} className="mt-0.5" />
                <div className="space-y-0.5">
                  <Label htmlFor={n.key} className="text-sm font-medium">{n.label}</Label>
                  {'help' in n && n.help && <p className="text-xs text-muted-foreground">{n.help}</p>}
                </div>
              </div>
            ))}
          </div>

          <div className="my-7 border-t border-border/60" />

          <div className="flex">
            <Button className="h-11 rounded-xl px-6" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Save preferences'}
            </Button>
          </div>
        </div>

        {/* Content Preferences — own card */}
        <div className="rounded-2xl border border-border bg-card p-7 sm:p-9 shadow-sm">
          <ContentPreferencesSection />
        </div>


        {/* Admin: User Feedback */}
        {isAdmin && (
          <div className="mt-4">
            <AdminFeedbackPanel />
          </div>
        )}

            {/* Feedback Banner */}
            <FeedbackBanner />
        </div>
      </PageHeader>
    </div>

     <PlanChangeDialog
      open={dialogOpen}
      onClose={() => { setDialogOpen(false); setCheckoutLoading(false); }}
      onConfirm={handleDialogConfirm}
      mode={dialogMode}
      targetPlan={selectedPlan || undefined}
      currentPlanName={planConfig.name}
      isAnnual={billingPeriod === 'annual'}
      currentBalance={balance}
      hasActiveSubscription={subscriptionStatus === 'active' || subscriptionStatus === 'canceling'}
      loading={checkoutLoading}
    />
    </>
  );
}
