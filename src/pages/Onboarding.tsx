import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowRight, Check } from 'lucide-react';
import authHero from '@/assets/auth/auth-hero.jpg';

const REFERRAL_OPTIONS = [
  'Social media post',
  'Article, blog, or review',
  'Friend or colleague',
  'Searching online for a tool like this',
  'Ad on Google or YouTube',
  'Content creator or influencer',
  'Ad on social media (Instagram, TikTok, etc.)',
  'Online community (Slack, Discord, Reddit, etc.)',
  'Other',
];

const PRODUCT_CATEGORIES = [
  { id: 'fashion', label: 'Fashion & Apparel' },
  { id: 'skincare', label: 'Skincare & Beauty' },
  { id: 'food', label: 'Food & Drinks' },
  { id: 'home', label: 'Home & Living' },
  { id: 'supplements', label: 'Supplements & Health' },
  { id: 'jewelry', label: 'Jewelry & Accessories' },
  { id: 'electronics', label: 'Electronics & Tech' },
  { id: 'other', label: 'Other' },
];

const TOTAL_STEPS = 3;

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1: Profile
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyUrl, setCompanyUrl] = useState('');

  // Step 2: About
  const [referralSource, setReferralSource] = useState('');

  // Step 3: Categories
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return firstName.trim().length > 0;
      case 2:
        return referralSource.length > 0;
      case 3:
        return selectedCategories.length > 0;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      return;
    }

    // Final step — save everything
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim() || null,
        company_url: companyUrl.trim() || null,
        referral_source: referralSource,
        product_categories: selectedCategories,
        onboarding_completed: true,
      })
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to save profile. Please try again.');
      console.error(error);
    } else {
      toast.success('Welcome to framea.ai!');
      navigate('/app', { replace: true });
    }

    setSaving(false);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left side — Form */}
      <div className="flex-1 flex flex-col px-6 sm:px-12 lg:px-16 xl:px-24 py-8">
        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-12">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
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

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          {/* Step 1: Your Profile */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
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
                    className="h-11"
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
                    className="h-11"
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
                    className="h-11"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Where did you hear about us */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                  How did you find us?
                </h1>
                <p className="text-muted-foreground mt-2">
                  This helps us understand how people discover framea.ai
                </p>
              </div>

              <div className="space-y-1.5">
                <Label>Where did you hear about framea.ai? *</Label>
                <Select value={referralSource} onValueChange={setReferralSource}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {REFERRAL_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 3: Product categories */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                  What do you sell?
                </h1>
                <p className="text-muted-foreground mt-2">
                  Select all that apply — this helps us personalize your experience
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

          {/* Navigation */}
          <div className="mt-10">
            <Button
              onClick={handleNext}
              disabled={!canProceed() || saving}
              className="w-full h-12 rounded-full font-semibold text-base gap-2"
            >
              {saving ? 'Saving…' : step === TOTAL_STEPS ? 'Get Started' : 'Continue'}
              {!saving && <ArrowRight className="w-4 h-4" />}
            </Button>

            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="w-full mt-3 text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Go back
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right side — Hero image (hidden on mobile) */}
      <div className="hidden lg:block lg:w-1/2 xl:w-[55%] relative">
        <img
          src={authHero}
          alt="AI-generated product photography showcase"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute bottom-8 left-8 right-8">
          <p className="text-white/90 text-sm font-medium">
            Generated with brandframe.ai
          </p>
        </div>
      </div>
    </div>
  );
}
