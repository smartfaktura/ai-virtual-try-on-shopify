import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, ArrowRight, Check, Sparkles, Sun, Camera, Layout, ShieldX, Eye,
  Plus, X, Pencil,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  buildBrandPrompt,
  getIdentityImpact,
  getToneImpact,
  getLightingImpact,
  getCompositionImpact,
  getExclusionImpact,
  TONE_DESCRIPTIONS,
  type BrandProfileData,
} from '@/lib/brandPromptBuilder';

// ── Options ──────────────────────────────────────────────────────────────

const TONE_OPTIONS = ['luxury', 'clean', 'bold', 'minimal', 'playful'];
const LIGHTING_OPTIONS = ['soft diffused', 'dramatic side', 'natural window', 'studio flat', 'golden hour', 'high key'];
const BACKGROUND_OPTIONS = ['studio', 'lifestyle', 'gradient', 'pattern', 'contextual'];
const COLOR_TEMP_OPTIONS = ['warm', 'neutral', 'cool'];
const COMPOSITION_OPTIONS = ['centered', 'rule-of-thirds', 'dynamic', 'symmetrical', 'off-center'];
const SCENE_SUGGESTIONS = ['minimalist studio', 'outdoor natural light', 'urban street', 'cozy interior', 'beach/seaside', 'botanical garden', 'industrial loft', 'café setting'];

const STEPS = [
  { key: 'identity', label: 'Brand Identity', icon: Sparkles },
  { key: 'tone', label: 'Visual Tone', icon: Eye },
  { key: 'lighting', label: 'Lighting & Color', icon: Sun },
  { key: 'composition', label: 'Composition', icon: Layout },
  { key: 'exclusions', label: 'Exclusions', icon: ShieldX },
  { key: 'review', label: 'Review & Save', icon: Check },
] as const;

type StepKey = (typeof STEPS)[number]['key'];

// ── Prompt Impact Box ────────────────────────────────────────────────────

function PromptImpactBox({ text }: { text: string }) {
  return (
    <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/60 mb-1.5">Prompt Impact</p>
      <pre className="text-xs text-foreground/70 whitespace-pre-wrap font-sans leading-relaxed">{text}</pre>
    </div>
  );
}

// ── Chip Picker (for tags / keywords / scenes) ───────────────────────────

function ChipPicker({
  label,
  items,
  suggestions,
  onAdd,
  onRemove,
  placeholder,
}: {
  label: string;
  items: string[];
  suggestions?: string[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
  placeholder: string;
}) {
  const [inputValue, setInputValue] = useState('');

  const addItem = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !items.includes(trimmed)) {
      onAdd(trimmed);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  };

  const unusedSuggestions = suggestions?.filter(s => !items.includes(s)) || [];

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-9 text-sm"
        />
        <Button variant="outline" size="sm" onClick={addItem} type="button" className="h-9 px-3">
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item, i) => (
            <Badge key={i} variant="secondary" className="gap-1 pr-1 text-xs">
              {item}
              <button onClick={() => onRemove(item)} className="ml-0.5 hover:text-destructive">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      {unusedSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {unusedSuggestions.slice(0, 6).map(s => (
            <button
              key={s}
              onClick={() => onAdd(s)}
              className="text-[11px] px-2 py-0.5 rounded-full border border-dashed border-border text-muted-foreground hover:bg-muted transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Option Selector (radio-like chips) ───────────────────────────────────

function OptionSelector({
  label,
  description,
  options,
  value,
  onChange,
}: {
  label: string;
  description?: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div>
        <Label>{label}</Label>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium border transition-all capitalize',
              value === opt
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-foreground/70 hover:bg-muted'
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Color Palette Manager ────────────────────────────────────────────────

function ColorPaletteInput({
  colors,
  onAdd,
  onRemove,
}: {
  colors: string[];
  onAdd: (color: string) => void;
  onRemove: (color: string) => void;
}) {
  const [inputValue, setInputValue] = useState('');

  const addColor = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !colors.includes(trimmed)) {
      onAdd(trimmed);
      setInputValue('');
    }
  };

  return (
    <div className="space-y-2">
      <Label>Color Palette</Label>
      <p className="text-xs text-muted-foreground">Add hex codes or color names (e.g. #F5E6D3, ivory, sage)</p>
      <div className="flex gap-2">
        <Input
          placeholder="e.g. #F5E6D3 or ivory"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addColor(); } }}
          className="h-9 text-sm"
        />
        <Button variant="outline" size="sm" onClick={addColor} type="button" className="h-9 px-3">
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>
      {colors.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {colors.map((color, i) => {
            const isHex = color.startsWith('#');
            return (
              <Badge key={i} variant="secondary" className="gap-1.5 pr-1 text-xs">
                {isHex && (
                  <span
                    className="w-3 h-3 rounded-full border border-border flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                )}
                {color}
                <button onClick={() => onRemove(color)} className="ml-0.5 hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main Wizard Component ────────────────────────────────────────────────

export default function BrandProfileWizard() {
  const navigate = useNavigate();
  const { id: editId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isEditing = !!editId;

  // Form state
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [brandDescription, setBrandDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [tone, setTone] = useState('clean');
  const [brandKeywords, setBrandKeywords] = useState<string[]>([]);
  const [lightingStyle, setLightingStyle] = useState('soft diffused');
  const [colorTemperature, setColorTemperature] = useState('neutral');
  const [colorPalette, setColorPalette] = useState<string[]>([]);
  const [backgroundStyle, setBackgroundStyle] = useState('studio');
  const [compositionBias, setCompositionBias] = useState('centered');
  const [preferredScenes, setPreferredScenes] = useState<string[]>([]);
  const [doNotRules, setDoNotRules] = useState<string[]>([]);
  const [photographyReference, setPhotographyReference] = useState('');

  // Load profile for editing
  const { data: existingProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['brand-profile', editId],
    queryFn: async () => {
      if (!editId) return null;
      const { data, error } = await supabase
        .from('brand_profiles')
        .select('*')
        .eq('id', editId)
        .single();
      if (error) throw error;
      return data as unknown as BrandProfileData & { id: string; user_id: string };
    },
    enabled: !!editId,
  });

  useEffect(() => {
    if (existingProfile) {
      setName(existingProfile.name);
      setBrandDescription(existingProfile.brand_description || '');
      setTargetAudience(existingProfile.target_audience || '');
      setTone(existingProfile.tone || 'clean');
      setBrandKeywords(existingProfile.brand_keywords || []);
      setLightingStyle(existingProfile.lighting_style || 'soft diffused');
      setColorTemperature(existingProfile.color_temperature || 'neutral');
      setColorPalette(existingProfile.color_palette || []);
      setBackgroundStyle(existingProfile.background_style || 'studio');
      setCompositionBias(existingProfile.composition_bias || 'centered');
      setPreferredScenes(existingProfile.preferred_scenes || []);
      setDoNotRules(existingProfile.do_not_rules || []);
      setPhotographyReference(existingProfile.photography_reference || '');
    }
  }, [existingProfile]);

  const currentData: Partial<BrandProfileData> = {
    name,
    brand_description: brandDescription,
    target_audience: targetAudience,
    tone,
    brand_keywords: brandKeywords,
    lighting_style: lightingStyle,
    color_temperature: colorTemperature,
    color_palette: colorPalette,
    background_style: backgroundStyle,
    composition_bias: compositionBias,
    preferred_scenes: preferredScenes,
    do_not_rules: doNotRules,
    photography_reference: photographyReference,
  };

  const { styleGuide } = buildBrandPrompt(currentData);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const payload = {
        user_id: user.id,
        name,
        brand_description: brandDescription,
        target_audience: targetAudience,
        tone,
        brand_keywords: brandKeywords,
        lighting_style: lightingStyle,
        color_temperature: colorTemperature,
        color_palette: colorPalette,
        background_style: backgroundStyle,
        composition_bias: compositionBias,
        preferred_scenes: preferredScenes,
        do_not_rules: doNotRules,
        photography_reference: photographyReference,
      };
      if (isEditing && editId) {
        const { error } = await supabase.from('brand_profiles').update(payload).eq('id', editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('brand_profiles').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-profiles'] });
      toast.success(isEditing ? 'Brand profile updated' : 'Brand profile created');
      navigate('/app/brand-profiles');
    },
    onError: () => toast.error('Failed to save brand profile'),
  });

  const canContinue = step === 0 ? name.trim().length > 0 : true;
  const currentStepKey = STEPS[step].key;

  const goToStep = (targetStep: number) => {
    if (targetStep >= 0 && targetStep < STEPS.length) setStep(targetStep);
  };

  if (isEditing && isLoadingProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/app/brand-profiles')}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Brand Profiles
      </button>

      {/* Title */}
      <div>
        <h1 className="text-xl font-semibold">{isEditing ? 'Edit Brand Profile' : 'Create Brand Profile'}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Step {step + 1} of {STEPS.length}: {STEPS[step].label}
        </p>
      </div>

      {/* Progress */}
      <Progress value={((step + 1) / STEPS.length) * 100} className="h-1.5" />

      {/* Step indicator chips */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <button
              key={s.key}
              onClick={() => { if (i < step || (i <= step && canContinue)) goToStep(i); }}
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors whitespace-nowrap',
                i === step
                  ? 'bg-primary text-primary-foreground'
                  : i < step
                  ? 'bg-primary/10 text-primary cursor-pointer'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              <Icon className="w-3 h-3" />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6 space-y-5">
          {/* Step 1: Brand Identity */}
          {currentStepKey === 'identity' && (
            <>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="brand-name">Brand / Profile Name *</Label>
                  <Input
                    id="brand-name"
                    placeholder="e.g. My Premium Brand"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="brand-desc">Brand Description</Label>
                  <Textarea
                    id="brand-desc"
                    placeholder="What is your brand about? What makes it unique?"
                    value={brandDescription}
                    onChange={e => setBrandDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="target-audience">Target Audience</Label>
                  <Input
                    id="target-audience"
                    placeholder="e.g. Women 25-40, eco-conscious, active lifestyle"
                    value={targetAudience}
                    onChange={e => setTargetAudience(e.target.value)}
                  />
                </div>
              </div>
              <PromptImpactBox text={getIdentityImpact(currentData)} />
            </>
          )}

          {/* Step 2: Visual Tone */}
          {currentStepKey === 'tone' && (
            <>
              <div className="space-y-5">
                <div className="space-y-3">
                  <div>
                    <Label>What tone defines your brand?</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      This sets the overall visual personality for all generated images.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {TONE_OPTIONS.map(t => (
                      <button
                        key={t}
                        onClick={() => setTone(t)}
                        className={cn(
                          'px-4 py-3 rounded-lg border text-left transition-all',
                          tone === t
                            ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                            : 'border-border hover:bg-muted'
                        )}
                      >
                        <p className="text-sm font-medium capitalize">{t}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {TONE_DESCRIPTIONS[t] || t}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
                <ChipPicker
                  label="Brand Keywords"
                  items={brandKeywords}
                  suggestions={['sustainable', 'handcrafted', 'heritage', 'modern', 'organic', 'premium', 'artisanal', 'innovative']}
                  onAdd={kw => setBrandKeywords(prev => [...prev, kw])}
                  onRemove={kw => setBrandKeywords(prev => prev.filter(k => k !== kw))}
                  placeholder="e.g. sustainable, handcrafted"
                />
              </div>
              <PromptImpactBox text={getToneImpact(currentData)} />
            </>
          )}

          {/* Step 3: Lighting & Color */}
          {currentStepKey === 'lighting' && (
            <>
              <div className="space-y-5">
                <OptionSelector
                  label="Lighting Style"
                  description="How should images be lit?"
                  options={LIGHTING_OPTIONS}
                  value={lightingStyle}
                  onChange={setLightingStyle}
                />
                <OptionSelector
                  label="Color Temperature"
                  description="Overall warmth of the image."
                  options={COLOR_TEMP_OPTIONS}
                  value={colorTemperature}
                  onChange={setColorTemperature}
                />
                <ColorPaletteInput
                  colors={colorPalette}
                  onAdd={c => setColorPalette(prev => [...prev, c])}
                  onRemove={c => setColorPalette(prev => prev.filter(x => x !== c))}
                />
              </div>
              <PromptImpactBox text={getLightingImpact(currentData)} />
            </>
          )}

          {/* Step 4: Composition & Background */}
          {currentStepKey === 'composition' && (
            <>
              <div className="space-y-5">
                <OptionSelector
                  label="Background Style"
                  description="Default backdrop for product images."
                  options={BACKGROUND_OPTIONS}
                  value={backgroundStyle}
                  onChange={setBackgroundStyle}
                />
                <OptionSelector
                  label="Composition Bias"
                  description="How the subject is framed."
                  options={COMPOSITION_OPTIONS}
                  value={compositionBias}
                  onChange={setCompositionBias}
                />
                <ChipPicker
                  label="Preferred Scenes"
                  items={preferredScenes}
                  suggestions={SCENE_SUGGESTIONS}
                  onAdd={s => setPreferredScenes(prev => [...prev, s])}
                  onRemove={s => setPreferredScenes(prev => prev.filter(x => x !== s))}
                  placeholder="e.g. minimalist studio"
                />
              </div>
              <PromptImpactBox text={getCompositionImpact(currentData)} />
            </>
          )}

          {/* Step 5: Exclusion Rules */}
          {currentStepKey === 'exclusions' && (
            <>
              <div className="space-y-5">
                <ChipPicker
                  label="Do-Not Rules"
                  items={doNotRules}
                  suggestions={['text overlays', 'busy backgrounds', 'watermarks', 'neon colors', 'heavy filters', 'cartoon style']}
                  onAdd={r => setDoNotRules(prev => [...prev, r])}
                  onRemove={r => setDoNotRules(prev => prev.filter(x => x !== r))}
                  placeholder="e.g. no text overlays"
                />
                <div className="space-y-1.5">
                  <Label htmlFor="photo-ref">Photography Reference Notes</Label>
                  <p className="text-xs text-muted-foreground">
                    Any additional creative direction or photographic style references.
                  </p>
                  <Textarea
                    id="photo-ref"
                    placeholder="e.g. Inspired by kinfolk magazine aesthetic, muted earth tones, editorial feel"
                    value={photographyReference}
                    onChange={e => setPhotographyReference(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <PromptImpactBox text={getExclusionImpact(currentData)} />
            </>
          )}

          {/* Step 6: Review & Save */}
          {currentStepKey === 'review' && (
            <div className="space-y-5">
              {/* Summary sections */}
              <ReviewSection
                title="Brand Identity"
                stepIndex={0}
                onEdit={() => goToStep(0)}
                items={[
                  { label: 'Name', value: name },
                  { label: 'Description', value: brandDescription || '—' },
                  { label: 'Target Audience', value: targetAudience || '—' },
                ]}
              />
              <ReviewSection
                title="Visual Tone"
                stepIndex={1}
                onEdit={() => goToStep(1)}
                items={[
                  { label: 'Tone', value: tone },
                  { label: 'Keywords', value: brandKeywords.length > 0 ? brandKeywords.join(', ') : '—' },
                ]}
              />
              <ReviewSection
                title="Lighting & Color"
                stepIndex={2}
                onEdit={() => goToStep(2)}
                items={[
                  { label: 'Lighting', value: lightingStyle },
                  { label: 'Temperature', value: colorTemperature },
                  { label: 'Palette', value: colorPalette.length > 0 ? colorPalette.join(', ') : '—' },
                ]}
              />
              <ReviewSection
                title="Composition"
                stepIndex={3}
                onEdit={() => goToStep(3)}
                items={[
                  { label: 'Background', value: backgroundStyle },
                  { label: 'Composition', value: compositionBias },
                  { label: 'Scenes', value: preferredScenes.length > 0 ? preferredScenes.join(', ') : '—' },
                ]}
              />
              <ReviewSection
                title="Exclusions"
                stepIndex={4}
                onEdit={() => goToStep(4)}
                items={[
                  { label: 'Do-Not Rules', value: doNotRules.length > 0 ? doNotRules.join(', ') : '—' },
                  { label: 'Photo Reference', value: photographyReference || '—' },
                ]}
              />

              {/* Full prompt preview */}
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/60">
                  Full Prompt Preview — What the AI receives
                </p>
                <pre className="text-xs text-foreground/70 whitespace-pre-wrap font-sans leading-relaxed">
                  {styleGuide || 'No brand context configured.'}
                </pre>
                {doNotRules.length > 0 && (
                  <pre className="text-xs text-destructive/70 whitespace-pre-wrap font-sans leading-relaxed mt-2">
                    EXCLUDE: {doNotRules.join(', ')}
                  </pre>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => step === 0 ? navigate('/app/brand-profiles') : goToStep(step - 1)}
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          {step === 0 ? 'Cancel' : 'Back'}
        </Button>

        {step < STEPS.length - 1 ? (
          <Button onClick={() => goToStep(step + 1)} disabled={!canContinue}>
            Continue
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        ) : (
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={!name.trim() || saveMutation.isPending}
          >
            {saveMutation.isPending ? 'Saving...' : isEditing ? 'Update Profile' : 'Create Profile'}
            <Check className="w-4 h-4 ml-1.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Review Section Helper ────────────────────────────────────────────────

function ReviewSection({
  title,
  stepIndex,
  onEdit,
  items,
}: {
  title: string;
  stepIndex: number;
  onEdit: () => void;
  items: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <Button variant="ghost" size="sm" onClick={onEdit} className="h-7 px-2 text-xs">
          <Pencil className="w-3 h-3 mr-1" />
          Edit
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
        {items.map(({ label, value }) => (
          <div key={label} className="text-xs">
            <span className="text-muted-foreground">{label}: </span>
            <span className="text-foreground capitalize">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
