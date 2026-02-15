import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

import {
  ArrowLeft, ArrowRight, Check, Calendar, Sun, Snowflake, Leaf, Flower2,
  Gift, ShoppingBag, Heart, GraduationCap, Sparkles, Search, Loader2,
  Zap, CreditCard,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { getLandingAssetUrl } from '@/lib/landingAssets';
import { calculateDropCredits, type WorkflowCostConfig } from '@/lib/dropCreditCalculator';
import type { Workflow } from '@/types/workflow';

const WORKFLOW_FALLBACK_IMAGES: Record<string, string> = {
  'Product Listing Set': getLandingAssetUrl('workflows/workflow-product-listing.jpg'),
  'Selfie / UGC Set': getLandingAssetUrl('workflows/workflow-selfie-ugc.jpg'),
  'Flat Lay Set': getLandingAssetUrl('workflows/workflow-flat-lay.jpg'),
};

interface CreativeDropWizardProps {
  onClose: () => void;
}

const THEMES = [
  { id: 'spring', label: 'Spring', icon: Flower2, color: 'text-green-600 bg-green-50 border-green-200' },
  { id: 'summer', label: 'Summer', icon: Sun, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { id: 'autumn', label: 'Autumn', icon: Leaf, color: 'text-orange-600 bg-orange-50 border-orange-200' },
  { id: 'winter', label: 'Winter', icon: Snowflake, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { id: 'holiday', label: 'Holiday', icon: Gift, color: 'text-red-600 bg-red-50 border-red-200' },
  { id: 'black_friday', label: 'Black Friday', icon: ShoppingBag, color: 'text-foreground bg-muted border-border' },
  { id: 'valentines', label: "Valentine's", icon: Heart, color: 'text-pink-600 bg-pink-50 border-pink-200' },
  { id: 'back_to_school', label: 'Back to School', icon: GraduationCap, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  { id: 'custom', label: 'Custom', icon: Sparkles, color: 'text-primary bg-primary/5 border-primary/20' },
];

const STEPS = ['Theme', 'Products', 'Workflows', 'Volume', 'Review'];
const IMAGE_PRESETS = [10, 25, 50, 100];

interface UserProduct {
  id: string;
  title: string;
  image_url: string;
  product_type: string;
}

export function CreativeDropWizard({ onClose }: CreativeDropWizardProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);

  // Step 1: Theme
  const [name, setName] = useState('');
  const [theme, setTheme] = useState('custom');
  const [themeNotes, setThemeNotes] = useState('');
  const [brandProfileId, setBrandProfileId] = useState('');

  // Step 2: Products
  
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [productSearch, setProductSearch] = useState('');

  // Step 3: Workflows
  const [selectedWorkflowIds, setSelectedWorkflowIds] = useState<Set<string>>(new Set());
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([]);

  // Step 4: Volume
  const [frequency, setFrequency] = useState('monthly');
  const [imagesPerDrop, setImagesPerDrop] = useState(25);
  const [customImageCount, setCustomImageCount] = useState('');

  // Queries
  const { data: brandProfiles = [] } = useQuery({
    queryKey: ['brand-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('brand_profiles').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ['user-products-wizard'],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_products').select('id, title, image_url, product_type').order('title');
      if (error) throw error;
      return data as UserProduct[];
    },
  });

  const { data: workflows = [] } = useQuery({
    queryKey: ['workflows'],
    queryFn: async () => {
      const { data, error } = await supabase.from('workflows').select('*').order('sort_order');
      if (error) throw error;
      return data as unknown as Workflow[];
    },
  });

  const { data: models = [] } = useQuery({
    queryKey: ['custom-models'],
    queryFn: async () => {
      const { data, error } = await supabase.from('custom_models').select('*').eq('is_active', true);
      if (error) throw error;
      return data;
    },
  });

  // State is initialized fresh on mount (no reset needed)

  // Credit calculation
  const workflowConfigs: WorkflowCostConfig[] = workflows
    .filter(w => selectedWorkflowIds.has(w.id))
    .map(w => ({
      workflowId: w.id,
      workflowName: w.name,
      hasModel: w.uses_tryon || selectedModelIds.length > 0,
      hasCustomScene: false,
    }));

  const costEstimate = calculateDropCredits(workflowConfigs, imagesPerDrop, selectedModelIds, frequency);

  // Validation per step
  const canNext = (): boolean => {
    switch (step) {
      case 0: return name.trim().length > 0;
      case 1: return selectedProductIds.size > 0;
      case 2: return selectedWorkflowIds.size > 0;
      case 3: return imagesPerDrop > 0;
      case 4: return true;
      default: return false;
    }
  };

  // Save
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const nextRun = new Date();
      if (frequency === 'monthly') nextRun.setMonth(nextRun.getMonth() + 1);
      else if (frequency === 'biweekly') nextRun.setDate(nextRun.getDate() + 14);
      else if (frequency === 'weekly') nextRun.setDate(nextRun.getDate() + 7);

      const { error } = await supabase.from('creative_schedules').insert({
        user_id: user.id,
        name,
        theme,
        theme_notes: themeNotes,
        frequency,
        products_scope: 'selected',
        selected_product_ids: Array.from(selectedProductIds),
        workflow_ids: Array.from(selectedWorkflowIds),
        model_ids: selectedModelIds,
        brand_profile_id: brandProfileId || null,
        images_per_drop: imagesPerDrop,
        estimated_credits: costEstimate.totalCredits,
        active: true,
        next_run_at: frequency === 'one-time' ? null : nextRun.toISOString(),
        scene_config: {},
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creative-schedules'] });
      toast.success('Schedule created successfully!');
      onClose();
    },
    onError: () => toast.error('Failed to create schedule'),
  });

  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(productSearch.toLowerCase())
  );

  const selectedWorkflows = workflows.filter(w => selectedWorkflowIds.has(w.id));
  const needsModelPicker = selectedWorkflows.some(w => w.uses_tryon);

  const themeConfig = THEMES.find(t => t.id === theme);

  return (
    <div className="space-y-0">
      {/* Header with steps */}
      <div className="pb-4 border-b">
          <h2 className="text-lg font-semibold mb-4">Create Creative Drop Schedule</h2>
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-1 flex-1">
                <button
                  onClick={() => i < step && setStep(i)}
                  className={cn(
                    'flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full transition-colors w-full justify-center',
                    i === step && 'bg-primary text-primary-foreground',
                    i < step && 'bg-primary/10 text-primary cursor-pointer',
                    i > step && 'text-muted-foreground'
                  )}
                >
                  {i < step ? <Check className="w-3 h-3" /> : null}
                  <span className="hidden sm:inline">{s}</span>
                  <span className="sm:hidden">{i + 1}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={cn('h-px flex-1 min-w-2', i < step ? 'bg-primary/30' : 'bg-border')} />
                )}
              </div>
            ))}
          </div>
        </div>

      {/* Content */}
      <div className="py-5">
        <div className="min-h-[350px]">
            {/* Step 1: Theme */}
            {step === 0 && (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label>Schedule Name *</Label>
                  <Input
                    placeholder="e.g. Summer 2026 Collection"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Theme</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {THEMES.map(t => {
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setTheme(t.id)}
                          className={cn(
                            'flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all',
                            theme === t.id ? cn(t.color, 'ring-2 ring-offset-1 ring-primary/30') : 'border-border hover:border-primary/30 text-foreground'
                          )}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Brand Profile</Label>
                  <Select value={brandProfileId} onValueChange={setBrandProfileId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand profile (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {brandProfiles.map(bp => (
                        <SelectItem key={bp.id} value={bp.id}>{bp.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Special Instructions</Label>
                  <Textarea
                    placeholder="Any specific mood, style, or seasonal directions for this drop..."
                    value={themeNotes}
                    onChange={e => setThemeNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Products */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Badge variant="secondary">{selectedProductIds.size} selected</Badge>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto">
                  {filteredProducts.map(product => {
                    const isSelected = selectedProductIds.has(product.id);
                    return (
                      <button
                        key={product.id}
                        onClick={() => {
                          const next = new Set(selectedProductIds);
                          isSelected ? next.delete(product.id) : next.add(product.id);
                          setSelectedProductIds(next);
                        }}
                        className={cn(
                          'relative rounded-lg border-2 p-1.5 transition-all text-left',
                          isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                        )}
                      >
                        {isSelected && (
                          <div className="absolute top-1 right-1 z-10 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-primary-foreground" />
                          </div>
                        )}
                        <div className="aspect-square rounded overflow-hidden bg-muted mb-1">
                          <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-xs font-medium truncate">{product.title}</p>
                      </button>
                    );
                  })}
                </div>
                {filteredProducts.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-4">No products found.</p>
                )}
              </div>
            )}

            {/* Step 3: Workflows */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Select which visual styles to include in each drop.</p>
                <div className="space-y-2">
                  {workflows.map(wf => {
                    const isSelected = selectedWorkflowIds.has(wf.id);
                    return (
                      <button
                        key={wf.id}
                        onClick={() => {
                          const next = new Set(selectedWorkflowIds);
                          isSelected ? next.delete(wf.id) : next.add(wf.id);
                          setSelectedWorkflowIds(next);
                        }}
                        className={cn(
                          'w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left',
                          isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                        )}
                      >
                        <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                          <img src={wf.preview_image_url || WORKFLOW_FALLBACK_IMAGES[wf.name] || ''} alt={wf.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{wf.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{wf.description}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {wf.uses_tryon && <Badge variant="secondary" className="text-xs">Model</Badge>}
                          <div className={cn(
                            'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                            isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                          )}>
                            {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Model picker when needed */}
                {needsModelPicker && models.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label>Preferred Models (optional)</Label>
                      <p className="text-xs text-muted-foreground">Select which AI models to use for try-on/UGC workflows.</p>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {models.map(m => {
                          const isSelected = selectedModelIds.includes(m.id);
                          return (
                            <button
                              key={m.id}
                              onClick={() => {
                                setSelectedModelIds(prev =>
                                  isSelected ? prev.filter(id => id !== m.id) : [...prev, m.id]
                                );
                              }}
                              className={cn(
                                'relative rounded-lg border-2 p-1 transition-all',
                                isSelected ? 'border-primary' : 'border-border hover:border-primary/40'
                              )}
                            >
                              {isSelected && (
                                <div className="absolute -top-1 -right-1 z-10 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                                  <Check className="w-2.5 h-2.5 text-primary-foreground" />
                                </div>
                              )}
                              <div className="aspect-[3/4] rounded overflow-hidden bg-muted">
                                <img src={m.image_url} alt={m.name} className="w-full h-full object-cover" />
                              </div>
                              <p className="text-xs text-center mt-1 truncate">{m.name}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 4: Volume & Frequency */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'weekly', label: 'Weekly' },
                      { id: 'biweekly', label: 'Biweekly' },
                      { id: 'monthly', label: 'Monthly' },
                      { id: 'one-time', label: 'One-time' },
                    ].map(f => (
                      <Button
                        key={f.id}
                        variant={frequency === f.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFrequency(f.id)}
                        className="text-xs"
                      >
                        {f.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Images Per Drop</Label>
                  <div className="flex gap-2">
                    {IMAGE_PRESETS.map(n => (
                      <Button
                        key={n}
                        variant={imagesPerDrop === n && !customImageCount ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => { setImagesPerDrop(n); setCustomImageCount(''); }}
                      >
                        {n}
                      </Button>
                    ))}
                    <Input
                      type="number"
                      placeholder="Custom"
                      value={customImageCount}
                      onChange={e => {
                        setCustomImageCount(e.target.value);
                        const val = parseInt(e.target.value);
                        if (val > 0) setImagesPerDrop(val);
                      }}
                      className="w-24"
                    />
                  </div>
                </div>

                <Separator />

                {/* Credit estimate */}
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Credit Estimate</span>
                    </div>
                    {costEstimate.breakdown.length > 0 ? (
                      <>
                        <div className="space-y-1">
                          {costEstimate.breakdown.map(b => (
                            <div key={b.workflowId} className="flex justify-between text-xs">
                              <span className="text-muted-foreground">
                                {b.workflowName}: {b.imageCount} × {b.costPerImage} cr
                              </span>
                              <span className="font-medium">{b.subtotal} credits</span>
                            </div>
                          ))}
                        </div>
                        <Separator />
                        <div className="flex justify-between text-sm font-medium">
                          <span>Per drop</span>
                          <span>{costEstimate.totalCredits} credits</span>
                        </div>
                        {frequency !== 'one-time' && (
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Monthly projection</span>
                            <span>~{costEstimate.monthlyProjection} credits/mo</span>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Credits are deducted when each drop runs, not now.
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground">Select workflows to see cost estimate.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 5: Review */}
            {step === 4 && (
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      {themeConfig && <themeConfig.icon className="w-4 h-4" />}
                      <span className="font-medium">{name}</span>
                      <Badge variant="secondary" className="text-xs">{themeConfig?.label}</Badge>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Products</p>
                        <p className="font-medium">{selectedProductIds.size} selected</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Workflows</p>
                        <p className="font-medium">{selectedWorkflowIds.size} selected</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Images Per Drop</p>
                        <p className="font-medium">{imagesPerDrop}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Frequency</p>
                        <p className="font-medium capitalize">{frequency.replace('-', ' ')}</p>
                      </div>
                    </div>
                    {selectedModelIds.length > 0 && (
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Preferred Models</p>
                        <div className="flex gap-1">
                          {models.filter(m => selectedModelIds.includes(m.id)).map(m => (
                            <Badge key={m.id} variant="secondary" className="text-xs">{m.name}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {themeNotes && (
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Special Instructions</p>
                        <p className="text-sm">{themeNotes}</p>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">Estimated Cost</p>
                        <p className="text-xs text-muted-foreground">per drop</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{costEstimate.totalCredits} credits</p>
                        {frequency !== 'one-time' && (
                          <p className="text-xs text-muted-foreground">~{costEstimate.monthlyProjection}/mo</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Selected workflows list */}
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Workflows</p>
                  {selectedWorkflows.map(wf => (
                    <div key={wf.id} className="flex items-center gap-2 text-sm">
                      <Zap className="w-3 h-3 text-primary" />
                      <span>{wf.name}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {costEstimate.breakdown.find(b => b.workflowId === wf.id)?.imageCount ?? 0} imgs
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Footer */}
      <div className="py-4 border-t flex justify-between">
          <Button variant="outline" onClick={step === 0 ? onClose : () => setStep(s => s - 1)}>
            {step === 0 ? 'Cancel' : <><ArrowLeft className="w-4 h-4 mr-1" /> Back</>}
          </Button>
          {step < 4 ? (
            <Button onClick={() => setStep(s => s + 1)} disabled={!canNext()}>
              Next <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Creating...</> : 'Create Schedule'}
            </Button>
          )}
      </div>
    </div>
  );
}
