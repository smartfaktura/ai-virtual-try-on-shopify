import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Save, Loader2, ChevronDown, X, Plus, Check, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { buildBrandPrompt, COLOR_FEEL_DESCRIPTIONS } from '@/lib/brandPromptBuilder';
import type { BrandProfileData } from '@/lib/brandPromptBuilder';

const STEPS = ['Your Brand', 'Visual Style', 'Avoid These'] as const;

// ── Mood options ─────────────────────────────────────────────────────────
const MOOD_OPTIONS = [
  { value: 'luxury', label: 'Luxury', description: 'Premium, sophisticated, elegant with refined details' },
  { value: 'clean', label: 'Clean', description: 'Minimalist, uncluttered, modern and professional' },
  { value: 'bold', label: 'Bold', description: 'Striking, high-contrast, attention-grabbing' },
  { value: 'minimal', label: 'Minimal', description: 'Simple, lots of negative space, zen-like' },
  { value: 'playful', label: 'Playful', description: 'Vibrant, energetic, fun and dynamic' },
];

// ── Color Feel options ──────────────────────────────────────────────────
const COLOR_FEEL_OPTIONS = [
  { value: 'warm-earthy', label: 'Warm & Earthy', description: 'Amber, terracotta, natural warmth', colors: ['#D4A574', '#C2784E', '#E8C4A0', '#A0522D'] },
  { value: 'cool-crisp', label: 'Cool & Crisp', description: 'Clean whites, blue undertones', colors: ['#B8D4E8', '#7EB0D5', '#D6E8F4', '#5A9BC5'] },
  { value: 'neutral-natural', label: 'Neutral & Natural', description: 'True-to-life, balanced colors', colors: ['#C8BEB4', '#A69E94', '#DDD8D2', '#8C857C'] },
  { value: 'rich-saturated', label: 'Rich & Saturated', description: 'Deep vivid colors, high impact', colors: ['#8B3A8B', '#C44D4D', '#2E6B8A', '#D4A040'] },
  { value: 'muted-soft', label: 'Muted & Soft', description: 'Desaturated pastels, dreamy tones', colors: ['#E8D5E0', '#D5D0E8', '#D0E0D5', '#E8E0D0'] },
  { value: 'vibrant-bold', label: 'Vibrant & Bold', description: 'Bright, punchy, strong contrast', colors: ['#FF6B35', '#FFD23F', '#06D6A0', '#EF476F'] },
  { value: 'monochrome', label: 'Monochrome', description: 'Black, white, and grayscale', colors: ['#1A1A1A', '#666666', '#AAAAAA', '#E5E5E5'] },
  { value: 'pastel-dreamy', label: 'Pastel & Dreamy', description: 'Soft pinks, lavenders, baby blue', colors: ['#F4C2D7', '#C9B1E8', '#B5D8F0', '#F0E4A6'] },
];

// ── Keyword suggestions ─────────────────────────────────────────────────
const KEYWORD_SUGGESTIONS = [
  'sustainable', 'handcrafted', 'premium', 'organic', 'artisan',
  'modern', 'timeless', 'edgy', 'feminine', 'masculine',
  'urban', 'natural', 'luxurious', 'affordable', 'innovative',
  'vintage', 'eco-friendly', 'minimalist', 'high-end', 'bohemian',
  'clinical', 'sporty', 'cozy', 'sophisticated', 'youthful',
  'professional', 'rustic', 'futuristic', 'wholesome', 'sleek',
];

// ── Do-Not suggestions ──────────────────────────────────────────────────
const DO_NOT_SUGGESTIONS = [
  'busy backgrounds', 'neon colors', 'harsh shadows', 'cluttered scenes',
  'overly saturated', 'dark moody', 'text overlays', 'collage layouts',
  'stock photo feel', 'cartoon style', 'vintage filters', 'heavy vignette',
  'watermarks', 'people/models', 'hands visible', 'blurry images',
  'lens flare', 'flat lighting', 'unrealistic colors', 'AI artifacts',
  'reflections', 'props/accessories', 'patterned backgrounds', 'low contrast',
];

interface FormData {
  name: string;
  brand_description: string;
  target_audience: string;
  tone: string;
  color_temperature: string;
  color_palette: string[];
  brand_keywords: string[];
  do_not_rules: string[];
}

const defaultFormData: FormData = {
  name: '',
  brand_description: '',
  target_audience: '',
  tone: 'clean',
  color_temperature: 'neutral-natural',
  color_palette: [],
  brand_keywords: [],
  do_not_rules: [],
};

export default function BrandProfileWizard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(defaultFormData);
  const [saving, setSaving] = useState(false);
  const [customKeyword, setCustomKeyword] = useState('');
  const [customRule, setCustomRule] = useState('');
  const [newColor, setNewColor] = useState('#');
  const [reviewOpen, setReviewOpen] = useState(false);

  // Load existing profile for editing
  const { data: existing, isLoading: loadingExisting } = useQuery({
    queryKey: ['brand-profile', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('brand_profiles').select('*').eq('id', id!).single();
      if (error) throw error;
      return data;
    },
    enabled: isEditing,
  });

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name || '',
        brand_description: existing.brand_description || '',
        target_audience: existing.target_audience || '',
        tone: existing.tone || 'clean',
        color_temperature: existing.color_temperature || 'neutral-natural',
        color_palette: existing.color_palette || [],
        brand_keywords: existing.brand_keywords || [],
        do_not_rules: existing.do_not_rules || [],
      });
    }
  }, [existing]);

  const update = (key: keyof FormData, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const toggleChip = (key: 'brand_keywords' | 'do_not_rules', value: string) => {
    setForm(prev => {
      const arr = prev[key];
      return { ...prev, [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] };
    });
  };

  const addCustomChip = (key: 'brand_keywords' | 'do_not_rules', value: string, clearFn: (v: string) => void) => {
    const trimmed = value.trim();
    if (trimmed && !form[key].includes(trimmed)) {
      update(key, [...form[key], trimmed]);
    }
    clearFn('');
  };

  const removeColor = (idx: number) => update('color_palette', form.color_palette.filter((_, i) => i !== idx));

  const addColor = () => {
    if (newColor.match(/^#[0-9A-Fa-f]{6}$/) && !form.color_palette.includes(newColor)) {
      update('color_palette', [...form.color_palette, newColor]);
      setNewColor('#');
    }
  };

  // Build prompt preview
  const promptData: Partial<BrandProfileData> = {
    name: form.name,
    brand_description: form.brand_description,
    target_audience: form.target_audience,
    tone: form.tone,
    color_temperature: form.color_temperature,
    color_palette: form.color_palette,
    brand_keywords: form.brand_keywords,
    do_not_rules: form.do_not_rules,
  };
  const promptPreview = buildBrandPrompt(promptData);

  const canProceed = step === 0 ? form.name.trim().length > 0 : true;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < STEPS.length - 1 && canProceed) {
      setStep(step + 1);
    } else if (step === STEPS.length - 1 && form.name.trim()) {
      handleSave();
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const payload = {
        user_id: user.id,
        name: form.name.trim(),
        brand_description: form.brand_description.trim(),
        target_audience: form.target_audience.trim(),
        tone: form.tone,
        color_temperature: form.color_temperature,
        color_palette: form.color_palette,
        brand_keywords: form.brand_keywords,
        do_not_rules: form.do_not_rules,
        // Leave removed fields at defaults
        lighting_style: 'natural',
        background_style: 'contextual',
        composition_bias: 'varied',
        preferred_scenes: [] as string[],
        photography_reference: '',
      };

      if (isEditing) {
        const { error } = await supabase.from('brand_profiles').update(payload).eq('id', id!);
        if (error) throw error;
        toast.success('Brand profile updated');
      } else {
        const { error } = await supabase.from('brand_profiles').insert(payload);
        if (error) throw error;
        toast.success('Brand profile created');
      }
      queryClient.invalidateQueries({ queryKey: ['brand-profiles'] });
      navigate('/app/brand-profiles');
    } catch (e) {
      toast.error('Failed to save brand profile');
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loadingExisting) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={handleFormSubmit} className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate('/app/brand-profiles')}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Brand Profiles
      </button>

      {/* Title */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{isEditing ? 'Edit Profile' : 'New Brand Profile'}</h1>
        <p className="text-sm text-muted-foreground mt-1">Define how your brand looks across every generation.</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-0">
        {STEPS.map((label, i) => (
          <React.Fragment key={label}>
            <button
              type="button"
              onClick={() => (i < step || canProceed) && setStep(i)}
              className="flex items-center gap-2 group"
            >
              <span
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all',
                  i === step
                    ? 'bg-primary text-primary-foreground'
                    : i < step
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                )}
              >
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </span>
              <span className={cn(
                'text-xs font-medium hidden sm:inline transition-colors',
                i === step ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={cn(
                'w-10 h-px mx-2',
                i < step ? 'bg-primary/30' : 'bg-border'
              )} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step content */}
      <Card className="border-border/50">
        <CardContent className="p-6 space-y-6">

          {/* ──────── STEP 1: Your Brand ──────── */}
          {step === 0 && (
            <>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Brand Name *</label>
                  <Input
                    value={form.name}
                    onChange={e => update('name', e.target.value)}
                    placeholder="e.g. AURA Skincare"
                    className="bg-background"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={form.brand_description}
                    onChange={e => update('brand_description', e.target.value)}
                    placeholder="One or two sentences about your brand's identity…"
                    rows={2}
                    className="bg-background resize-none"
                  />
                  <p className="text-[11px] text-muted-foreground">Helps the AI understand your brand personality.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Target Audience</label>
                  <Input
                    value={form.target_audience}
                    onChange={e => update('target_audience', e.target.value)}
                    placeholder="e.g. Women 25-40 interested in clean beauty"
                    className="bg-background"
                  />
                </div>
              </div>
            </>
          )}

          {/* ──────── STEP 2: Visual Style ──────── */}
          {step === 1 && (
            <>
              {/* Mood */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Mood</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {MOOD_OPTIONS.map(mood => (
                    <button
                      type="button"
                      key={mood.value}
                      onClick={() => update('tone', mood.value)}
                      className={cn(
                        'text-left p-4 rounded-xl border transition-all',
                        form.tone === mood.value
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                          : 'border-border/50 hover:border-border hover:bg-muted/30'
                      )}
                    >
                      <p className="text-sm font-medium">{mood.label}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{mood.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Feel */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Color Feel</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {COLOR_FEEL_OPTIONS.map(cf => (
                    <button
                      type="button"
                      key={cf.value}
                      onClick={() => update('color_temperature', cf.value)}
                      className={cn(
                        'text-left rounded-xl border overflow-hidden transition-all',
                        form.color_temperature === cf.value
                          ? 'border-primary ring-1 ring-primary/20'
                          : 'border-border/50 hover:border-border'
                      )}
                    >
                      <div className="h-6 w-full flex">
                        {cf.colors.map((color, i) => (
                          <div key={i} className="flex-1 h-full" style={{ backgroundColor: color }} />
                        ))}
                      </div>
                      <div className="p-3 pt-2">
                        <p className="text-xs font-medium">{cf.label}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{cf.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand Colors (optional) */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Brand Colors <span className="text-muted-foreground font-normal">(optional)</span></label>
                <div className="flex items-center gap-2 flex-wrap">
                  {form.color_palette.map((color, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => removeColor(i)}
                      className="group relative w-8 h-8 rounded-lg border border-border flex-shrink-0 transition-transform hover:scale-105"
                      style={{ backgroundColor: color }}
                      title={`${color} — click to remove`}
                    >
                      <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 rounded-lg">
                        <X className="w-3 h-3 text-white" />
                      </span>
                    </button>
                  ))}
                  <div className="flex items-center gap-1.5">
                    <Input
                      value={newColor}
                      onChange={e => setNewColor(e.target.value)}
                      placeholder="#F5E6D3"
                      className="w-24 h-8 text-xs bg-background"
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); addColor(); } }}
                    />
                    <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={addColor}>
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Brand Keywords */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Brand Keywords</label>
                <div className="flex flex-wrap gap-1.5">
                  {KEYWORD_SUGGESTIONS.map(kw => (
                    <button
                      type="button"
                      key={kw}
                      onClick={() => toggleChip('brand_keywords', kw)}
                      className={cn(
                        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
                        form.brand_keywords.includes(kw)
                          ? 'bg-primary/10 border-primary/30 text-primary'
                          : 'bg-muted/50 border-border/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      {form.brand_keywords.includes(kw)
                        ? <X className="w-3 h-3 -ml-0.5" />
                        : <Plus className="w-3 h-3 -ml-0.5" />
                      }
                      {kw}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <Input
                    value={customKeyword}
                    onChange={e => setCustomKeyword(e.target.value)}
                    placeholder="Add custom keyword…"
                    className="h-8 text-xs bg-background flex-1"
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); addCustomChip('brand_keywords', customKeyword, setCustomKeyword); } }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => addCustomChip('brand_keywords', customKeyword, setCustomKeyword)}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
                {form.brand_keywords.filter(kw => !KEYWORD_SUGGESTIONS.includes(kw)).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {form.brand_keywords.filter(kw => !KEYWORD_SUGGESTIONS.includes(kw)).map(kw => (
                      <Badge
                        key={kw}
                        variant="secondary"
                        className="text-[11px] cursor-pointer hover:bg-destructive/10"
                        onClick={() => toggleChip('brand_keywords', kw)}
                      >
                        {kw} <X className="w-2.5 h-2.5 ml-1" />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ──────── STEP 3: Avoid These ──────── */}
          {step === 2 && (
            <>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Things to Avoid</label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">These are injected as negative prompts in every generation.</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {DO_NOT_SUGGESTIONS.map(rule => (
                    <button
                      type="button"
                      key={rule}
                      className={cn(
                        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
                        form.do_not_rules.includes(rule)
                          ? 'bg-destructive/10 border-destructive/30 text-destructive'
                          : 'bg-muted/50 border-border/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      {form.do_not_rules.includes(rule)
                        ? <X className="w-3 h-3 -ml-0.5" />
                        : <Plus className="w-3 h-3 -ml-0.5" />
                      }
                      {rule}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  <Input
                    value={customRule}
                    onChange={e => setCustomRule(e.target.value)}
                    placeholder="Add custom exclusion…"
                    className="h-8 text-xs bg-background flex-1"
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); addCustomChip('do_not_rules', customRule, setCustomRule); } }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => addCustomChip('do_not_rules', customRule, setCustomRule)}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
                {form.do_not_rules.filter(r => !DO_NOT_SUGGESTIONS.includes(r)).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {form.do_not_rules.filter(r => !DO_NOT_SUGGESTIONS.includes(r)).map(rule => (
                      <Badge
                        key={rule}
                        variant="secondary"
                        className="text-[11px] cursor-pointer hover:bg-destructive/10"
                        onClick={() => toggleChip('do_not_rules', rule)}
                      >
                        ✕ {rule} <X className="w-2.5 h-2.5 ml-1" />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Prompt preview */}
              <Collapsible open={reviewOpen} onOpenChange={setReviewOpen}>
                <CollapsibleTrigger asChild>
                  <button type="button" className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-primary/20 bg-primary/5 text-sm hover:bg-primary/10 transition-colors">
                    <span className="flex items-center gap-2 text-xs font-medium">
                      <Eye className="w-3.5 h-3.5" />
                      What the AI will see
                    </span>
                    <ChevronDown className={cn('w-4 h-4 transition-transform', reviewOpen && 'rotate-180')} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
                    {promptPreview.styleGuide ? (
                      <pre className="text-[11px] text-foreground/80 whitespace-pre-wrap font-mono leading-relaxed">
                        {promptPreview.styleGuide}
                      </pre>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">Fill in your brand details to see the prompt preview.</p>
                    )}
                    {promptPreview.negatives.length > 0 && (
                      <div className="pt-2 border-t border-primary/10">
                        <p className="text-[10px] font-semibold text-destructive/70 uppercase tracking-wider mb-1">Excluded</p>
                        <p className="text-[11px] text-foreground/70">{promptPreview.negatives.join(', ')}</p>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={() => step > 0 ? setStep(step - 1) : navigate('/app/brand-profiles')}
          className="gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          {step > 0 ? 'Back' : 'Cancel'}
        </Button>

        {step < STEPS.length - 1 ? (
          <Button type="submit" disabled={!canProceed} className="gap-1.5">
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button type="submit" disabled={saving || !form.name.trim()} className="gap-1.5">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEditing ? 'Save Changes' : 'Create Profile'}
          </Button>
        )}
      </div>
    </form>
  );
}
