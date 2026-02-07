import { useState } from 'react';
import { HelpCircle, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
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
import { CompetitorComparison } from '@/components/app/CompetitorComparison';
import { useCredits } from '@/contexts/CreditContext';
import { pricingPlans, creditPacks } from '@/data/mockData';
import type { BrandTone, BackgroundStyle } from '@/types';
import { toast } from 'sonner';

export default function Settings() {
  const { balance, addCredits } = useCredits();

  const [brandTone, setBrandTone] = useState<BrandTone>('clean');
  const [backgroundStyle, setBackgroundStyle] = useState<BackgroundStyle>('studio');
  const [negatives, setNegatives] = useState('text overlays, busy backgrounds, watermarks');
  const [consistencyEnabled, setConsistencyEnabled] = useState(true);

  const [publishMode, setPublishMode] = useState<'add' | 'replace'>('add');
  const [autoPublish, setAutoPublish] = useState(false);
  const [defaultQuality, setDefaultQuality] = useState<'standard' | 'high'>('standard');
  const [defaultAspectRatio, setDefaultAspectRatio] = useState('1:1');
  const [defaultImageCount, setDefaultImageCount] = useState('4');
  const [restrictPromptEditing, setRestrictPromptEditing] = useState(true);

  const [emailOnComplete, setEmailOnComplete] = useState(true);
  const [emailOnFailed, setEmailOnFailed] = useState(true);
  const [emailLowCredits, setEmailLowCredits] = useState(true);
  const [emailWeeklyDigest, setEmailWeeklyDigest] = useState(false);
  const [inAppComplete, setInAppComplete] = useState(true);
  const [inAppFailed, setInAppFailed] = useState(true);
  const [inAppTips, setInAppTips] = useState(true);

  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const currentPlanId = 'growth';

  const creditsTotal = 1000;
  const creditsPercentage = (balance / creditsTotal) * 100;

  const handleSave = () => toast.success('Settings saved successfully!');
  const handlePlanSelect = (planId: string) => {
    if (planId === 'enterprise') toast.info('Our team will reach out to discuss your needs!');
    else toast.success(`Switched to ${planId} plan!`);
  };
  const handleCreditPurchase = (packId: string) => {
    const pack = creditPacks.find(p => p.packId === packId);
    if (pack) {
      addCredits(pack.credits);
      toast.success(`Purchased ${pack.credits} credits for $${pack.price}!`);
    }
  };

  return (
    <PageHeader title="Settings">
      <div className="space-y-6">
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
                <Select value={brandTone} onValueChange={v => setBrandTone(v as BrandTone)}>
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
                <Select value={backgroundStyle} onValueChange={v => setBackgroundStyle(v as BackgroundStyle)}>
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
              <Input value={negatives} onChange={e => setNegatives(e.target.value)} />
              <p className="text-xs text-muted-foreground">Comma-separated list of things to avoid in generations</p>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="consistency" checked={consistencyEnabled} onCheckedChange={v => setConsistencyEnabled(!!v)} />
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
                <Select value={defaultAspectRatio} onValueChange={setDefaultAspectRatio}>
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
                <Select value={defaultImageCount} onValueChange={setDefaultImageCount}>
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
              {[
                { id: 'emailComplete', label: 'Generation complete', help: 'Receive email when image generation finishes', checked: emailOnComplete, set: setEmailOnComplete },
                { id: 'emailFailed', label: 'Generation failed', help: 'Receive email if generation encounters an error', checked: emailOnFailed, set: setEmailOnFailed },
                { id: 'emailLow', label: 'Low credits warning', help: "Get notified when credits drop below 10%", checked: emailLowCredits, set: setEmailLowCredits },
                { id: 'emailDigest', label: 'Weekly usage digest', help: 'Weekly summary of generations and credit usage', checked: emailWeeklyDigest, set: setEmailWeeklyDigest },
              ].map(n => (
                <div key={n.id} className="flex items-start space-x-2">
                  <Checkbox id={n.id} checked={n.checked} onCheckedChange={v => n.set(!!v)} />
                  <div>
                    <Label htmlFor={n.id}>{n.label}</Label>
                    <p className="text-xs text-muted-foreground">{n.help}</p>
                  </div>
                </div>
              ))}
            </div>
            <Separator />
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">In-App Notifications</h3>
              {[
                { id: 'inAppComplete', label: 'Show generation complete', checked: inAppComplete, set: setInAppComplete },
                { id: 'inAppFailed', label: 'Show generation errors', checked: inAppFailed, set: setInAppFailed },
                { id: 'inAppTips', label: 'Show tips and suggestions', help: 'Occasional tips to improve your generations', checked: inAppTips, set: setInAppTips },
              ].map(n => (
                <div key={n.id} className="flex items-start space-x-2">
                  <Checkbox id={n.id} checked={n.checked} onCheckedChange={v => n.set(!!v)} />
                  <div>
                    <Label htmlFor={n.id}>{n.label}</Label>
                    {('help' in n && n.help) && <p className="text-xs text-muted-foreground">{n.help}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Download & Export */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <div>
              <h2 className="text-base font-semibold">Download & Export Defaults</h2>
              <p className="text-sm text-muted-foreground">Configure how generated images are exported</p>
            </div>
            <div className="space-y-2">
              <Label>Default Export Mode</Label>
              <Select value={publishMode} onValueChange={v => setPublishMode(v as 'add' | 'replace')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Download individually</SelectItem>
                  <SelectItem value="replace">Download as ZIP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-start space-x-2">
              <Checkbox id="autoDownload" checked={autoPublish} onCheckedChange={v => setAutoPublish(!!v)} />
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
              <Badge variant="secondary">brandframe-v1</Badge>
              <span className="text-xs text-muted-foreground">(Latest stable version)</span>
            </div>
            <div className="space-y-2">
              <Label>Default Quality Mode</Label>
              <Select value={defaultQuality} onValueChange={v => setDefaultQuality(v as 'standard' | 'high')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard (1 credit/image)</SelectItem>
                  <SelectItem value="high">High (2 credits/image)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Plans & Billing */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Plans & Billing</h2>
            <p className="text-sm text-muted-foreground">Choose the plan that's right for your business</p>
          </div>

          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold">Current Plan</h3>
                    <Badge className="bg-primary/10 text-primary">Growth</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">500 credits/month • Renews Feb 15, 2026</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Credits Remaining</span>
                  <span className="text-sm font-semibold">{balance} / {creditsTotal}</span>
                </div>
                <Progress value={creditsPercentage} className="h-2" />
                <p className="text-xs text-muted-foreground">Resets on the 1st of each month</p>
              </div>
            </CardContent>
          </Card>

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
            {pricingPlans.map(plan => (
              <PlanCard
                key={plan.planId}
                plan={plan}
                isAnnual={billingPeriod === 'annual'}
                isCurrentPlan={plan.planId === currentPlanId}
                onSelect={handlePlanSelect}
              />
            ))}
          </div>

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

          <CompetitorComparison />
        </div>

        {/* Team & Permissions */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <div>
              <h2 className="text-base font-semibold">Team & Permissions</h2>
              <p className="text-sm text-muted-foreground">Control access to advanced features</p>
            </div>
            <div className="flex items-start space-x-2">
              <Checkbox id="restrictPrompt" checked={restrictPromptEditing} onCheckedChange={v => setRestrictPromptEditing(!!v)} />
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
              <Button variant="outline" className="w-full" onClick={() => window.open('https://docs.example.com', '_blank')}>
                <HelpCircle className="w-4 h-4 mr-2" /> Documentation
              </Button>
              <Button variant="outline" className="w-full" onClick={() => window.open('mailto:support@example.com', '_blank')}>
                <MessageSquare className="w-4 h-4 mr-2" /> Contact Support
              </Button>
              <Button variant="outline" className="w-full" onClick={() => window.open('https://docs.example.com/faq', '_blank')}>
                <HelpCircle className="w-4 h-4 mr-2" /> FAQ
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <div>
              <h2 className="text-base font-semibold">About</h2>
              <p className="text-sm text-muted-foreground">App information and updates</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Version</span>
                  <Badge variant="secondary">1.2.0</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Last updated: 2026-01-28</p>
              </div>
              <Button variant="link" onClick={() => toast.info('Changelog coming soon!')}>What's New</Button>
            </div>
          </CardContent>
        </Card>

        {/* Save */}
        <div className="flex justify-end">
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </div>
    </PageHeader>
  );
}
