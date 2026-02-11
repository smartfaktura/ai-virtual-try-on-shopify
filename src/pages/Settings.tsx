import { useState, useEffect, useCallback } from 'react';
import { HelpCircle, MessageSquare, Building2, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/app/PageHeader';
import { PlanCard } from '@/components/app/PlanCard';
import { CreditPackCard } from '@/components/app/CreditPackCard';
import { useCredits } from '@/contexts/CreditContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { pricingPlans, creditPacks } from '@/data/mockData';
import type { BrandTone, BackgroundStyle } from '@/types';
import { toast } from 'sonner';

interface UserSettings {
  brandTone: BrandTone;
  backgroundStyle: BackgroundStyle;
  negatives: string;
  consistencyEnabled: boolean;
  defaultAspectRatio: string;
  defaultImageCount: string;
  defaultQuality: 'standard' | 'high';
  publishMode: 'add' | 'replace';
  autoPublish: boolean;
  restrictPromptEditing: boolean;
  emailOnComplete: boolean;
  emailOnFailed: boolean;
  emailLowCredits: boolean;
  emailWeeklyDigest: boolean;
  inAppComplete: boolean;
  inAppFailed: boolean;
  inAppTips: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  brandTone: 'clean',
  backgroundStyle: 'studio',
  negatives: 'text overlays, busy backgrounds, watermarks',
  consistencyEnabled: true,
  defaultAspectRatio: '1:1',
  defaultImageCount: '4',
  defaultQuality: 'standard',
  publishMode: 'add',
  autoPublish: false,
  restrictPromptEditing: true,
  emailOnComplete: true,
  emailOnFailed: true,
  emailLowCredits: true,
  emailWeeklyDigest: false,
  inAppComplete: true,
  inAppFailed: true,
  inAppTips: true,
};

export default function Settings() {
  const { user } = useAuth();
  const { balance, plan, planConfig, refreshBalance } = useCredits();

  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const currentPlanId = plan;
  const creditsTotal = planConfig.monthlyCredits;
  const creditsPercentage = creditsTotal === Infinity ? 100 : Math.min(100, (balance / creditsTotal) * 100);

  const mainPlans = pricingPlans.filter(p => !p.isEnterprise);
  const enterprisePlan = pricingPlans.find(p => p.isEnterprise);

  // Load settings from database
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('settings')
        .eq('user_id', user.id)
        .single();

      if (data?.settings && typeof data.settings === 'object' && !Array.isArray(data.settings)) {
        setSettings(prev => ({ ...prev, ...(data.settings as Partial<UserSettings>) }));
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
    const { error } = await supabase
      .from('profiles')
      .update({ settings: JSON.parse(JSON.stringify(settings)) })
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to save settings');
    } else {
      toast.success('Settings saved successfully!');
    }
    setIsSaving(false);
  };

  const handlePlanSelect = (planId: string) => {
    if (planId === 'enterprise') toast.info('Our team will reach out to discuss your needs!');
    else toast.info('Payment integration coming soon — plan changes will be available shortly.');
  };

  const handleCreditPurchase = (packId: string) => {
    toast.info('Payment integration coming soon — credit purchases will be available shortly.');
  };

  return (
    <PageHeader title="Settings">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="w-full justify-start mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="plans">Plans & Credits</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        {/* ─── General Tab ─── */}
        <TabsContent value="general" className="space-y-6">
          {/* Brand Defaults */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <div>
                <h2 className="text-base font-semibold">Brand Defaults</h2>
                <p className="text-sm text-muted-foreground">Set default brand settings for all new generations</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default Brand Tone</Label>
                  <Select value={settings.brandTone} onValueChange={v => updateSetting('brandTone', v as BrandTone)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clean">Clean</SelectItem>
                      <SelectItem value="luxury">Luxury</SelectItem>
                      <SelectItem value="playful">Playful</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Default Background Style</Label>
                  <Select value={settings.backgroundStyle} onValueChange={v => updateSetting('backgroundStyle', v as BackgroundStyle)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="studio">Studio</SelectItem>
                      <SelectItem value="lifestyle">Lifestyle</SelectItem>
                      <SelectItem value="gradient">Gradient</SelectItem>
                      <SelectItem value="pattern">Pattern</SelectItem>
                      <SelectItem value="contextual">Contextual Scene</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Default Negative List</Label>
                <Input value={settings.negatives} onChange={e => updateSetting('negatives', e.target.value)} />
                <p className="text-xs text-muted-foreground">Comma-separated list of things to avoid in generations</p>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="consistency" checked={settings.consistencyEnabled} onCheckedChange={v => updateSetting('consistencyEnabled', !!v)} />
                <div>
                  <Label htmlFor="consistency">Enable style consistency by default</Label>
                  <p className="text-xs text-muted-foreground">Keep visual style consistent across all generations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Default Image Settings */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <div>
                <h2 className="text-base font-semibold">Default Image Settings</h2>
                <p className="text-sm text-muted-foreground">Set defaults for new generation jobs</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default Aspect Ratio</Label>
                  <Select value={settings.defaultAspectRatio} onValueChange={v => updateSetting('defaultAspectRatio', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1:1">1:1 (Square)</SelectItem>
                      <SelectItem value="4:5">4:5 (Portrait)</SelectItem>
                      <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                      <SelectItem value="9:16">9:16 (Story)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Default Image Count</Label>
                  <Select value={settings.defaultImageCount} onValueChange={v => updateSetting('defaultImageCount', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 image</SelectItem>
                      <SelectItem value="4">4 images</SelectItem>
                      <SelectItem value="8">8 images</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <div>
                <h2 className="text-base font-semibold">Notifications</h2>
                <p className="text-sm text-muted-foreground">Manage how you receive updates</p>
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Email Notifications</h3>
                {([
                  { key: 'emailOnComplete' as const, label: 'Generation complete', help: 'Receive email when image generation finishes' },
                  { key: 'emailOnFailed' as const, label: 'Generation failed', help: 'Receive email if generation encounters an error' },
                  { key: 'emailLowCredits' as const, label: 'Low credits warning', help: "Get notified when credits drop below 10%" },
                  { key: 'emailWeeklyDigest' as const, label: 'Weekly usage digest', help: 'Weekly summary of generations and credit usage' },
                ] as const).map(n => (
                  <div key={n.key} className="flex items-start space-x-2">
                    <Checkbox id={n.key} checked={settings[n.key]} onCheckedChange={v => updateSetting(n.key, !!v)} />
                    <div>
                      <Label htmlFor={n.key}>{n.label}</Label>
                      <p className="text-xs text-muted-foreground">{n.help}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">In-App Notifications</h3>
                {([
                  { key: 'inAppComplete' as const, label: 'Show generation complete' },
                  { key: 'inAppFailed' as const, label: 'Show generation errors' },
                  { key: 'inAppTips' as const, label: 'Show tips and suggestions', help: 'Occasional tips to improve your generations' },
                ] as const).map(n => (
                  <div key={n.key} className="flex items-start space-x-2">
                    <Checkbox id={n.key} checked={settings[n.key]} onCheckedChange={v => updateSetting(n.key, !!v)} />
                    <div>
                      <Label htmlFor={n.key}>{n.label}</Label>
                      {'help' in n && n.help && <p className="text-xs text-muted-foreground">{n.help}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Save Settings'}
            </Button>
          </div>
        </TabsContent>

        {/* ─── Plans & Credits Tab ─── */}
        <TabsContent value="plans" className="space-y-6">
          {/* Current Plan */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold">Current Plan</h3>
                    <Badge className="bg-primary/10 text-primary">{planConfig.name}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {creditsTotal === Infinity ? 'Unlimited' : creditsTotal.toLocaleString()} credits/{plan === 'free' ? 'bonus' : 'month'}
                    {plan !== 'free' && ' • Renews Feb 15, 2026'}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Credits Remaining</span>
                  <span className="text-sm font-semibold">{balance} / {creditsTotal === Infinity ? '∞' : creditsTotal}</span>
                </div>
                <Progress value={creditsPercentage} className="h-2" />
                <p className="text-xs text-muted-foreground">Resets on the 1st of each month</p>
              </div>
            </CardContent>
          </Card>

          {/* Choose Your Plan */}
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Choose Your Plan</h3>
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                className={`px-4 py-2 text-sm font-medium transition-colors ${billingPeriod === 'monthly' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
                onClick={() => setBillingPeriod('monthly')}
              >
                Monthly
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium transition-colors ${billingPeriod === 'annual' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
                onClick={() => setBillingPeriod('annual')}
              >
                Annual (Save 17%)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mainPlans.map(p => (
              <PlanCard
                key={p.planId}
                plan={p}
                isAnnual={billingPeriod === 'annual'}
                isCurrentPlan={p.planId === currentPlanId}
                onSelect={handlePlanSelect}
              />
            ))}
          </div>

          {/* Enterprise banner */}
          {enterprisePlan && (
            <div className="rounded-2xl border bg-card p-6 sm:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-primary/10 p-3">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{enterprisePlan.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Need custom volume? Get unlimited visuals, dedicated support, and custom integrations.
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
                      {enterprisePlan.features.slice(0, 4).map((f, i) => (
                        <span key={i} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Check className="w-3.5 h-3.5 text-primary" /> {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <Button size="lg" onClick={() => handlePlanSelect('enterprise')} className="shrink-0">
                  Contact Sales
                </Button>
              </div>
            </div>
          )}

          {/* Credit packs */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <div>
                <h3 className="text-base font-semibold">Need More Credits?</h3>
                <p className="text-sm text-muted-foreground">Purchase additional credits anytime • Credits never expire</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {creditPacks.map(pack => (
                  <CreditPackCard key={pack.packId} pack={pack} onPurchase={handleCreditPurchase} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Account Tab ─── */}
        <TabsContent value="account" className="space-y-6">
          {/* Download & Export */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <div>
                <h2 className="text-base font-semibold">Download & Export Defaults</h2>
                <p className="text-sm text-muted-foreground">Configure how generated images are exported</p>
              </div>
              <div className="space-y-2">
                <Label>Default Export Mode</Label>
                <Select value={settings.publishMode} onValueChange={v => updateSetting('publishMode', v as 'add' | 'replace')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">Download individually</SelectItem>
                    <SelectItem value="replace">Download as ZIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox id="autoDownload" checked={settings.autoPublish} onCheckedChange={v => updateSetting('autoPublish', !!v)} />
                <div>
                  <Label htmlFor="autoDownload">Auto-download successful generations</Label>
                  <p className="text-xs text-muted-foreground">Automatically download images when generation completes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Model Settings */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <div>
                <h2 className="text-base font-semibold">AI Model Settings</h2>
                <p className="text-sm text-muted-foreground">Configure the AI image generation model</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Model:</span>
                <Badge variant="secondary">vovv-v1</Badge>
                <span className="text-xs text-muted-foreground">(Latest stable version)</span>
              </div>
              <div className="space-y-2">
                <Label>Default Quality Mode</Label>
                <Select value={settings.defaultQuality} onValueChange={v => updateSetting('defaultQuality', v as 'standard' | 'high')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard (4 credits/image)</SelectItem>
                    <SelectItem value="high">High (10 credits/image)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Team & Permissions */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <div>
                <h2 className="text-base font-semibold">Team & Permissions</h2>
                <p className="text-sm text-muted-foreground">Control access to advanced features</p>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox id="restrictPrompt" checked={settings.restrictPromptEditing} onCheckedChange={v => updateSetting('restrictPromptEditing', !!v)} />
                <div>
                  <Label htmlFor="restrictPrompt">Restrict prompt editing to admins only</Label>
                  <p className="text-xs text-muted-foreground">Only admin users can edit prompts directly</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Help & Support */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <div>
                <h2 className="text-base font-semibold">Help & Support</h2>
                <p className="text-sm text-muted-foreground">Get help and learn more about the app</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="w-full" onClick={() => window.open('https://brandframe.ai/docs', '_blank')}>
                  <HelpCircle className="w-4 h-4 mr-2" /> Documentation
                </Button>
                <Button variant="outline" className="w-full" onClick={() => window.open('mailto:support@brandframe.ai', '_blank')}>
                  <MessageSquare className="w-4 h-4 mr-2" /> Contact Support
                </Button>
                <Button variant="outline" className="w-full" onClick={() => window.open('https://brandframe.ai/faq', '_blank')}>
                  <HelpCircle className="w-4 h-4 mr-2" /> FAQ
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-semibold">About</h2>
                  <Badge variant="secondary">v1.2.0</Badge>
                </div>
                <p className="text-xs text-muted-foreground">VOVV.AI — AI-powered product photography</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Save Settings'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </PageHeader>
  );
}
