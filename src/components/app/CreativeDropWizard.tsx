import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import {
  ArrowLeft, ArrowRight, Check, CalendarIcon, Sun, Snowflake, Leaf, Flower2,
  Gift, ShoppingBag, Heart, GraduationCap, Sparkles, Search, Loader2,
  Zap, CreditCard, Clock, RocketIcon, Repeat,
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
  { id: 'spring', label: 'Spring', icon: Flower2 },
  { id: 'summer', label: 'Summer', icon: Sun },
  { id: 'autumn', label: 'Autumn', icon: Leaf },
  { id: 'winter', label: 'Winter', icon: Snowflake },
  { id: 'holiday', label: 'Holiday', icon: Gift },
  { id: 'black_friday', label: 'Black Friday', icon: ShoppingBag },
  { id: 'valentines', label: "Valentine's", icon: Heart },
  { id: 'back_to_school', label: 'Back to School', icon: GraduationCap },
  { id: 'custom', label: 'Custom', icon: Sparkles },
];

const STEPS = ['Theme', 'Products', 'Workflows', 'Schedule', 'Review'];
const IMAGE_PRESETS = [10, 25, 50, 100];
const ASPECT_RATIOS = [
  { id: '1:1', label: '1:1', w: 1, h: 1 },
  { id: '4:5', label: '4:5', w: 4, h: 5 },
  { id: '9:16', label: '9:16', w: 9, h: 16 },
  { id: '16:9', label: '16:9', w: 16, h: 9 },
];

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

  // Step 3: Workflows + format
  const [selectedWorkflowIds, setSelectedWorkflowIds] = useState<Set<string>>(new Set());
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([]);
  const [workflowFormats, setWorkflowFormats] = useState<Record<string, string>>({});

  // Step 4: Delivery & Volume
  const [deliveryMode, setDeliveryMode] = useState<'now' | 'scheduled'>('now');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
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

  // Credit calculation
  const workflowConfigs: WorkflowCostConfig[] = workflows
    .filter(w => selectedWorkflowIds.has(w.id))
    .map(w => ({
      workflowId: w.id,
      workflowName: w.name,
      hasModel: w.uses_tryon || selectedModelIds.length > 0,
      hasCustomScene: false,
    }));

  const effectiveFrequency = deliveryMode === 'now' ? 'one-time' : frequency;
  const costEstimate = calculateDropCredits(workflowConfigs, imagesPerDrop, selectedModelIds, effectiveFrequency);

  // Validation per step
  const canNext = (): boolean => {
    switch (step) {
      case 0: return name.trim().length > 0;
      case 1: return selectedProductIds.size > 0;
      case 2: return selectedWorkflowIds.size > 0;
      case 3: return imagesPerDrop > 0 && (deliveryMode === 'now' || !!startDate);
      case 4: return true;
      default: return false;
    }
  };

  // Save
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const effectiveStartDate = deliveryMode === 'now' ? new Date() : startDate!;
      let nextRun: Date | null = null;
      if (deliveryMode === 'scheduled') {
        nextRun = new Date(effectiveStartDate);
      }

      // Build scene_config with per-workflow aspect ratios
      const sceneConfig: Record<string, { aspect_ratio: string }> = {};
      selectedWorkflowIds.forEach(id => {
        sceneConfig[id] = { aspect_ratio: workflowFormats[id] || '1:1' };
      });

      const { error } = await supabase.from('creative_schedules').insert({
        user_id: user.id,
        name,
        theme,
        theme_notes: themeNotes,
        frequency: deliveryMode === 'now' ? 'one-time' : frequency,
        products_scope: 'selected',
        selected_product_ids: Array.from(selectedProductIds),
        workflow_ids: Array.from(selectedWorkflowIds),
        model_ids: selectedModelIds,
        brand_profile_id: brandProfileId || null,
        images_per_drop: imagesPerDrop,
        estimated_credits: costEstimate.totalCredits,
        active: true,
        start_date: effectiveStartDate.toISOString(),
        next_run_at: nextRun ? nextRun.toISOString() : null,
        scene_config: sceneConfig,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creative-schedules'] });
      toast.success(deliveryMode === 'now' ? 'Drop created — generating now!' : 'Schedule created successfully!');
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

  const getWorkflowFormat = (id: string) => workflowFormats[id] || '1:1';

  return (
    <div className="space-y-0">
      {/* Header — elegant step indicator */}
      <div className="pb-6">
        <h2 className="text-xl font-semibold tracking-tight mb-1">Create Your Drop</h2>
        <p className="text-sm text-muted-foreground mb-6">Design and schedule your creative content generation</p>
        <div className="flex items-center gap-0">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <button
                onClick={() => i < step && setStep(i)}
                className={cn(
                  'flex items-center gap-2 text-xs font-medium transition-all',
                  i <= step ? 'text-foreground' : 'text-muted-foreground/50',
                  i < step && 'cursor-pointer hover:text-primary',
                )}
              >
                <div className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all border-2',
                  i === step && 'bg-primary text-primary-foreground border-primary shadow-sm',
                  i < step && 'bg-primary/10 text-primary border-primary/30',
                  i > step && 'bg-muted text-muted-foreground/50 border-transparent',
                )}>
                  {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className="hidden sm:inline">{s}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={cn('flex-1 h-px mx-2', i < step ? 'bg-primary/30' : 'bg-border')} />
              )}
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Content */}
      <div className="py-8">
        <div className="min-h-[380px]">

          {/* ─── Step 1: Theme ─── */}
          {step === 0 && (
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-2">
                <p className="section-label">Schedule Name</p>
                <Input
                  placeholder="e.g. Summer 2026 Collection"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="h-12 rounded-xl text-sm"
                />
              </div>

              <div className="space-y-3">
                <p className="section-label">Theme</p>
                <div className="grid grid-cols-3 gap-3">
                  {THEMES.map(t => {
                    const Icon = t.icon;
                    return (
                      <button
                         key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={cn(
                          'flex items-center gap-2.5 px-4 py-3.5 rounded-2xl border-2 text-sm font-medium transition-all',
                          theme === t.id
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm text-foreground'
                            : 'border-border hover:border-primary/30 hover:shadow-sm text-foreground bg-card'
                        )}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <p className="section-label">Brand Profile</p>
                <Select value={brandProfileId} onValueChange={setBrandProfileId}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Select brand profile (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {brandProfiles.length === 0 ? (
                      <div className="px-3 py-4 text-center">
                        <p className="text-xs text-muted-foreground mb-1">No profiles yet</p>
                        <a href="/app/brand-profiles" className="text-xs text-primary hover:underline">Create one →</a>
                      </div>
                    ) : (
                      brandProfiles.map(bp => (
                        <SelectItem key={bp.id} value={bp.id}>{bp.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <p className="section-label">Special Instructions</p>
                <Textarea
                  placeholder="Any specific mood, style, or seasonal directions for this drop..."
                  value={themeNotes}
                  onChange={e => setThemeNotes(e.target.value)}
                  rows={3}
                  className="rounded-xl"
                />
              </div>
            </div>
          )}

          {/* ─── Step 2: Products ─── */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  className="pl-10 h-12 rounded-xl"
                />
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="rounded-full px-3 py-1">{selectedProductIds.size} selected</Badge>
                {filteredProducts.length > 0 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 px-2"
                      onClick={() => setSelectedProductIds(new Set(filteredProducts.map(p => p.id)))}
                    >
                      Select All
                    </Button>
                    {selectedProductIds.size > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7 px-2 text-muted-foreground"
                        onClick={() => setSelectedProductIds(new Set())}
                      >
                        Clear
                      </Button>
                    )}
                  </>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3 max-h-[320px] overflow-y-auto pr-1">
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
                        'relative rounded-2xl border-2 p-2 transition-all text-left group',
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-primary/40 hover:shadow-sm bg-card'
                      )}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-sm">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                      <div className="aspect-square rounded-xl overflow-hidden bg-muted mb-2">
                        <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                      </div>
                      <p className="text-xs font-medium truncate px-0.5">{product.title}</p>
                    </button>
                  );
                })}
              </div>
              {filteredProducts.length === 0 && (
                <div className="text-center py-8 rounded-2xl bg-muted/30">
                  <p className="text-sm text-muted-foreground">No products found.</p>
                </div>
              )}
            </div>
          )}

          {/* ─── Step 3: Workflows + Format ─── */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <p className="text-sm text-muted-foreground">Select visual styles and choose image orientation for each.</p>
              <div className="space-y-3">
                {workflows.map(wf => {
                  const isSelected = selectedWorkflowIds.has(wf.id);
                  return (
                    <div key={wf.id} className="space-y-0">
                      <button
                        onClick={() => {
                          const next = new Set(selectedWorkflowIds);
                          isSelected ? next.delete(wf.id) : next.add(wf.id);
                          setSelectedWorkflowIds(next);
                        }}
                        className={cn(
                          'w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left',
                          isSelected
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-border hover:border-primary/40 hover:shadow-sm bg-card'
                        )}
                      >
                        <div className="w-14 h-14 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                          <img src={wf.preview_image_url || WORKFLOW_FALLBACK_IMAGES[wf.name] || ''} alt={wf.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold">{wf.name}</p>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{wf.description}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {wf.uses_tryon && <Badge variant="secondary" className="text-xs rounded-full">Model</Badge>}
                          <div className={cn(
                            'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                            isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                          )}>
                            {isSelected && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                          </div>
                        </div>
                      </button>

                      {/* Aspect ratio chips — show when selected */}
                      {isSelected && (
                        <div className="flex items-center gap-2 pl-[4.5rem] pt-2 pb-1 animate-fade-in">
                          <span className="text-xs text-muted-foreground mr-1">Format:</span>
                          {ASPECT_RATIOS.map(ar => (
                            <button
                              key={ar.id}
                              onClick={() => setWorkflowFormats(prev => ({ ...prev, [wf.id]: ar.id }))}
                              className={cn(
                                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all',
                                getWorkflowFormat(wf.id) === ar.id
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-border hover:border-primary/30 text-muted-foreground bg-card'
                              )}
                            >
                              <div
                                className={cn(
                                  'rounded-[2px] border',
                                  getWorkflowFormat(wf.id) === ar.id ? 'border-primary' : 'border-muted-foreground/40',
                                )}
                                style={{ width: `${Math.round(ar.w / Math.max(ar.w, ar.h) * 12)}px`, height: `${Math.round(ar.h / Math.max(ar.w, ar.h) * 12)}px` }}
                              />
                              {ar.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Model picker when needed */}
              {needsModelPicker && models.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <p className="section-label">Preferred Models</p>
                    <p className="text-xs text-muted-foreground">Select which AI models to use for try-on/UGC workflows.</p>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
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
                              'relative rounded-xl border-2 p-1.5 transition-all',
                              isSelected ? 'border-primary shadow-sm' : 'border-border hover:border-primary/40 bg-card'
                            )}
                          >
                            {isSelected && (
                              <div className="absolute -top-1.5 -right-1.5 z-10 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-sm">
                                <Check className="w-3 h-3 text-primary-foreground" />
                              </div>
                            )}
                            <div className="aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                              <img src={m.image_url} alt={m.name} className="w-full h-full object-cover" />
                            </div>
                            <p className="text-xs text-center mt-1.5 truncate font-medium">{m.name}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ─── Step 4: Delivery & Volume ─── */}
          {step === 3 && (
            <div className="space-y-8 animate-fade-in">

              {/* Delivery mode */}
              <div className="space-y-3">
                <p className="section-label">Delivery</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setDeliveryMode('now')}
                    className={cn(
                      'flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all text-center',
                      deliveryMode === 'now'
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border hover:border-primary/30 bg-card hover:shadow-sm'
                    )}
                  >
                    <RocketIcon className={cn('w-5 h-5', deliveryMode === 'now' ? 'text-primary' : 'text-muted-foreground')} />
                    <span className="text-sm font-semibold">Generate Now</span>
                    <span className="text-xs text-muted-foreground">Run immediately</span>
                  </button>
                  <button
                    onClick={() => setDeliveryMode('scheduled')}
                    className={cn(
                      'flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all text-center',
                      deliveryMode === 'scheduled'
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border hover:border-primary/30 bg-card hover:shadow-sm'
                    )}
                  >
                    <Clock className={cn('w-5 h-5', deliveryMode === 'scheduled' ? 'text-primary' : 'text-muted-foreground')} />
                    <span className="text-sm font-semibold">Schedule</span>
                    <span className="text-xs text-muted-foreground">Pick a date & recur</span>
                  </button>
                </div>
              </div>

              {/* Schedule options — only when scheduled */}
              {deliveryMode === 'scheduled' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="space-y-2">
                    <p className="section-label">First Drop Date</p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full h-12 rounded-xl justify-start text-left font-normal',
                            !startDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <p className="section-label">Repeat</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'weekly', label: 'Weekly' },
                        { id: 'biweekly', label: 'Biweekly' },
                        { id: 'monthly', label: 'Monthly' },
                      ].map(f => (
                        <Button
                          key={f.id}
                          variant={frequency === f.id ? 'default' : 'outline'}
                          onClick={() => setFrequency(f.id)}
                          className="h-11 rounded-xl text-sm"
                        >
                          {f.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {startDate && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Repeat className="w-3.5 h-3.5" />
                      First drop: {format(startDate, 'MMM d, yyyy')}, then every {frequency.replace('-', ' ')}
                    </p>
                  )}
                </div>
              )}

              <Separator />

              {/* Images per drop */}
              <div className="space-y-3">
                <p className="section-label">Images Per Drop</p>
                <div className="flex gap-2">
                  {IMAGE_PRESETS.map(n => (
                    <Button
                      key={n}
                      variant={imagesPerDrop === n && !customImageCount ? 'default' : 'outline'}
                      onClick={() => { setImagesPerDrop(n); setCustomImageCount(''); }}
                      className="h-11 rounded-xl flex-1"
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
                    className="w-24 h-11 rounded-xl"
                  />
                </div>
              </div>

              {/* Credit estimate */}
              <Card className="rounded-2xl border shadow-sm">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold">Credit Estimate</span>
                  </div>
                  {costEstimate.breakdown.length > 0 ? (
                    <>
                      <div className="space-y-1.5">
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
                      <div className="flex justify-between text-sm font-semibold">
                        <span>Per drop</span>
                        <span>{costEstimate.totalCredits} credits</span>
                      </div>
                      {deliveryMode === 'scheduled' && (
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Monthly projection</span>
                          <span>~{costEstimate.monthlyProjection} credits/mo</span>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Credits are deducted when {deliveryMode === 'now' ? 'the drop generates' : 'each drop runs'}.
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">Select workflows to see cost estimate.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ─── Step 5: Review ─── */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">

              {/* Delivery card — prominent */}
              <Card className="rounded-2xl border-2 border-primary/20 bg-primary/[0.03] shadow-sm">
                <CardContent className="p-5 flex items-center gap-4">
                  {deliveryMode === 'now' ? (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <RocketIcon className="w-5 h-5 text-primary" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CalendarIcon className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold">
                      {deliveryMode === 'now'
                        ? 'Generates immediately after creation'
                        : `First drop: ${startDate ? format(startDate, 'MMM d, yyyy') : '—'}`
                      }
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {deliveryMode === 'now'
                        ? 'One-time generation — credits deducted now'
                        : `Then every ${frequency.replace('-', ' ')} — credits deducted per drop`
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Summary */}
              <Card className="rounded-2xl shadow-sm">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    {themeConfig && <themeConfig.icon className="w-4 h-4" />}
                    <span className="font-semibold">{name}</span>
                    <Badge variant="secondary" className="text-xs rounded-full">{themeConfig?.label}</Badge>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Products</p>
                      <p className="font-semibold">{selectedProductIds.size} selected</p>
                      {products.filter(p => selectedProductIds.has(p.id)).length > 0 && (
                        <div className="flex gap-1.5 mt-2 flex-wrap">
                          {products.filter(p => selectedProductIds.has(p.id)).slice(0, 6).map(p => (
                            <div key={p.id} className="w-8 h-8 rounded-md overflow-hidden bg-muted flex-shrink-0">
                              <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                            </div>
                          ))}
                          {selectedProductIds.size > 6 && (
                            <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center flex-shrink-0 text-[10px] font-medium text-muted-foreground">
                              +{selectedProductIds.size - 6}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Images Per Drop</p>
                      <p className="font-semibold">{imagesPerDrop}</p>
                    </div>
                  </div>
                  {selectedModelIds.length > 0 && (
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1.5">Preferred Models</p>
                      <div className="flex gap-1 flex-wrap">
                        {models.filter(m => selectedModelIds.includes(m.id)).map(m => (
                          <Badge key={m.id} variant="secondary" className="text-xs rounded-full">{m.name}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {themeNotes && (
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Instructions</p>
                      <p className="text-sm">{themeNotes}</p>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-semibold">Estimated Cost</p>
                      <p className="text-xs text-muted-foreground">per drop</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold tracking-tight">{costEstimate.totalCredits} credits</p>
                      {deliveryMode === 'scheduled' && (
                        <p className="text-xs text-muted-foreground">~{costEstimate.monthlyProjection}/mo</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Selected workflows with format */}
              <div className="space-y-2">
                <p className="section-label">Workflows</p>
                {selectedWorkflows.map(wf => (
                  <div key={wf.id} className="flex items-center gap-3 text-sm p-3 rounded-xl bg-card border">
                    <Zap className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span className="font-medium flex-1">{wf.name}</span>
                    <Badge variant="outline" className="text-xs rounded-full">{getWorkflowFormat(wf.id)}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {costEstimate.breakdown.find(b => b.workflowId === wf.id)?.imageCount ?? 0} imgs
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer — pill buttons + branding */}
      <div className="pt-4 border-t flex items-center justify-between">
        <Button
          variant="outline"
          onClick={step === 0 ? onClose : () => setStep(s => s - 1)}
          className="rounded-full h-11 px-6"
        >
          {step === 0 ? 'Cancel' : <><ArrowLeft className="w-4 h-4 mr-1.5" /> Back</>}
        </Button>

        <span className="text-[10px] text-muted-foreground/40 tracking-widest uppercase hidden sm:inline">
          Powered by VOVV.AI
        </span>

        {step < 4 ? (
          <Button
            onClick={() => setStep(s => s + 1)}
            disabled={!canNext()}
            className="rounded-full h-11 px-6 gap-1.5"
          >
            Next <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="rounded-full h-11 px-6 gap-1.5"
          >
            {saveMutation.isPending
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
              : deliveryMode === 'now' ? 'Generate Now' : 'Create Schedule'
            }
          </Button>
        )}
      </div>
    </div>
  );
}
