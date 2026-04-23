import { useState, useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/lib/brandedToast';
import { PRODUCT_CATEGORIES as SHARED_CATEGORIES } from '@/lib/categoryConstants';
import {
  SUB_TYPES_BY_FAMILY,
  getMultiSubFamilies,
  getSingleSubFamilies,
  getAutoIncludedSlugs,
  resolveFamilyNames,
  cleanSubs,
} from '@/lib/onboardingTaxonomy';
import { FAMILY_ORDER } from '@/lib/sceneTaxonomy';
import { ArrowRight, Check } from 'lucide-react';
import { AuthHeroGallery } from '@/components/app/AuthHeroGallery';

const PRODUCT_CATEGORIES = SHARED_CATEGORIES.filter((c) => c.id !== 'any');

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1: Profile
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyUrl, setCompanyUrl] = useState('');
  const [marketingOptIn, setMarketingOptIn] = useState(true);

  // Step 2: Families
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Step 3: Sub-types (only for families with 2+ sub-types)
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);

  // ── Dynamic step calculation ─────────────────────────────────────
  const familyNames = useMemo(
    () => resolveFamilyNames(selectedCategories),
    [selectedCategories],
  );
  const multiSubFamilies = useMemo(
    () => getMultiSubFamilies(familyNames),
    [familyNames],
  );
  const singleSubFamilies = useMemo(
    () => getSingleSubFamilies(familyNames),
    [familyNames],
  );
  const showStep3 = multiSubFamilies.length > 0;
  const totalSteps = showStep3 ? 3 : 2;

  if (!isLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleSubcategory = (slug: string) => {
    setSelectedSubcategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return firstName.trim().length > 0;
      case 2:
        return selectedCategories.length > 0;
      case 3:
        return true; // Step 3 is always optional
      default:
        return true;
    }
  };

  const handleFinish = async (subcategoryPicks: string[]) => {
    if (!user) return;
    setSaving(true);

    // Final sub-categories = user picks in Step 3 + auto-included single-sub-type families.
    // cleanSubs guarantees lowercase, deduped, and only known slugs are stored.
    const finalSubcategories = cleanSubs([
      ...subcategoryPicks.filter(s =>
        multiSubFamilies.some(fam =>
          (SUB_TYPES_BY_FAMILY[fam] ?? []).some(t => t.slug === s),
        ),
      ),
      ...getAutoIncludedSlugs(singleSubFamilies),
    ]);

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim() || null,
        company_url: companyUrl.trim() || null,
        product_categories: selectedCategories,
        product_subcategories: finalSubcategories,
        marketing_emails_opted_in: marketingOptIn,
        onboarding_completed: true,
      } as any)
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to save profile. Please try again.');
      console.error(error);
      setSaving(false);
      return;
    }

    // Sync marketing preference + properties to Resend audience.
    // Standardised payload — see sync-resend-contact for *_csv + primary_* enrichment.
    const familyLabels = selectedCategories
      .map(id => PRODUCT_CATEGORIES.find(c => c.id === id)?.label ?? id);
    const familyNamesForResend = resolveFamilyNames(selectedCategories);
    supabase.functions.invoke('sync-resend-contact', {
      body: {
        email: user.email,
        first_name: firstName.trim(),
        opted_in: marketingOptIn,
        properties: {
          plan: 'free',
          credits_balance: 60,
          has_generated: false,
          signup_date: user.created_at || new Date().toISOString(),
          // Legacy keys (kept for backwards compat with existing Resend rules)
          product_categories: familyLabels.join(', '),
          product_subcategories: finalSubcategories.join(', '),
          // New explicit, segmentable fields
          families: familyNamesForResend,
          subtypes: finalSubcategories,
          primary_family: familyNamesForResend[0] ?? null,
          primary_subtype: finalSubcategories[0] ?? null,
        },
      },
    }).catch(() => {});
    toast.success('Welcome to VOVV.AI!');
    localStorage.setItem(`dashboard_mode_hint_${user.id}`, 'new');
    navigate('/app', { replace: true });
    setSaving(false);
  };

  const handleNext = async () => {
    if (step === 1) {
      setStep(2);
      return;
    }
    if (step === 2) {
      // If Step 3 is not needed, finish directly with empty user picks (auto-included still added)
      if (!showStep3) {
        await handleFinish([]);
        return;
      }
      setStep(3);
      return;
    }
    // step === 3
    await handleFinish(selectedSubcategories);
  };

  const handleSkipStep3 = async () => {
    await handleFinish([]);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left side — Form */}
      <div className="flex-1 flex flex-col px-6 sm:px-12 lg:px-16 xl:px-24 py-8">
        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-12">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i + 1 <= step
                  ? 'w-8 bg-primary'
                  : 'w-2 bg-border'
              }`}
            />
          ))}
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full">
          {/* Step 1: Your Profile */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in max-w-md">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                  Your profile
                </h1>
                <p className="text-muted-foreground mt-2">
                  You can always change this later
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">First name *</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="companyUrl">Company URL</Label>
                  <Input
                    id="companyUrl"
                    type="url"
                    placeholder="https://yourcompany.com"
                    value={companyUrl}
                    onChange={(e) => setCompanyUrl(e.target.value)}
                  />
                </div>

                <div className="flex items-start space-x-2 pt-1">
                  <Checkbox
                    id="marketingOptIn"
                    checked={marketingOptIn}
                    onCheckedChange={(v) => setMarketingOptIn(!!v)}
                    className="mt-0.5"
                  />
                  <label htmlFor="marketingOptIn" className="text-sm text-muted-foreground leading-snug cursor-pointer">
                    Send me news, tips & special offers via email
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Product families */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in max-w-md">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                  What do you sell?
                </h1>
                <p className="text-muted-foreground mt-2">
                  Pick the categories you work with — we'll tailor your dashboard and recommendations
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {PRODUCT_CATEGORIES.map(({ id, label }) => {
                  const isSelected = selectedCategories.includes(id);
                  return (
                    <button
                      key={id}
                      onClick={() => toggleCategory(id)}
                      className={`relative flex items-center gap-2 px-4 py-3 rounded-xl border text-left text-sm font-medium transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5 text-foreground'
                          : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
                      }`}
                    >
                      {isSelected && (
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      )}
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Product sub-types */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                  Tell us what you sell
                </h1>
                <p className="text-muted-foreground mt-2">
                  Optional — pick the specific types you work with for sharper recommendations
                </p>
              </div>

              <div className="space-y-6">
                {multiSubFamilies.map((fam) => {
                  const types = SUB_TYPES_BY_FAMILY[fam] ?? [];
                  return (
                    <div key={fam} className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-muted-foreground">
                          {fam}
                        </span>
                        <div className="flex-1 h-px bg-border" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {types.map(({ slug, label }) => {
                          const isSelected = selectedSubcategories.includes(slug);
                          return (
                            <button
                              key={slug}
                              onClick={() => toggleSubcategory(slug)}
                              className={`relative inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-sm font-medium transition-all ${
                                isSelected
                                  ? 'border-primary bg-primary/5 text-foreground'
                                  : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
                              }`}
                            >
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                              )}
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
          )}

          {/* Navigation */}
          <div className="mt-10 max-w-md">
            <Button
              size="pill"
              onClick={handleNext}
              disabled={!canProceed() || saving}
              className="w-full font-semibold gap-2"
            >
              {saving ? 'Saving…' : step === totalSteps ? 'Get Started' : 'Continue'}
              {!saving && <ArrowRight className="w-4 h-4" />}
            </Button>

            {step === 3 && !saving && (
              <Button
                variant="outline"
                size="pill"
                onClick={handleSkipStep3}
                disabled={saving}
                className="w-full mt-3 font-medium bg-background hover:bg-muted"
              >
                Skip for now
              </Button>
            )}

            {step > 1 && (
              <Button
                variant="ghost"
                size="pill"
                onClick={() => setStep(step - 1)}
                disabled={saving}
                className="w-full mt-2 font-medium text-muted-foreground hover:text-foreground"
              >
                Go back
              </Button>
            )}
          </div>
        </div>
      </div>

      <AuthHeroGallery />
    </div>
  );
}
