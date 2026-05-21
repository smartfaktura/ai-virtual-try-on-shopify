import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/contexts/CreditContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserModels, useDeleteUserModel } from '@/hooks/useUserModels';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useFileUpload } from '@/hooks/useFileUpload';
import { PageHeader } from '@/components/app/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel, SelectSeparator } from '@/components/ui/select';
import { toast } from '@/lib/brandedToast';
import { NoCreditsModal } from '@/components/app/NoCreditsModal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { cn } from '@/lib/utils';
import { TEAM_MEMBERS } from '@/data/teamData';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { mockModels } from '@/data/mockData';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Users, Upload, Sparkles, Crown, Loader2, Trash2, Camera, Wand2,
  Check, Star, Palette, Baby, UserCheck, Globe, ShieldCheck, ImagePlus,
  Pencil, Info, Plus, ArrowRight, ChevronDown,
} from 'lucide-react';

/* ── Plan gate upgrade prompt ── */
function UpgradeHero() {
  const { openBuyModal } = useCredits();
  return (
    <div className="flex flex-col items-center text-center py-16 px-4 max-w-2xl mx-auto gap-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest mb-4">
          <Crown className="h-3.5 w-3.5" /> Growth & Pro
        </div>
        <h2 className="text-3xl font-bold tracking-tight">Brand Models</h2>
        <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
          Unlimited custom AI models built to match your brand — any gender, age, ethnicity, or body type
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
        {[
          { icon: UserCheck, label: 'Brand Consistency', desc: 'Same model across every campaign' },
          { icon: Globe, label: 'Any Ethnicity & Age', desc: 'Represent your diverse audience' },
          { icon: Baby, label: 'Kids Models', desc: 'Generate child models safely with AI' },
          { icon: Palette, label: 'Custom Looks', desc: 'Upload a reference or describe from scratch' },
        ].map((b) => (
          <Card key={b.label} className="flex items-start gap-3.5 p-5 text-left border-border/60">
            <div className="rounded-lg bg-primary/10 p-2 shrink-0">
              <b.icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">{b.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{b.desc}</p>
            </div>
          </Card>
        ))}
      </div>

      <Button size="pill" className="gap-2" onClick={() => openBuyModal()}>
        <Crown className="h-4 w-4" /> Upgrade to Growth
      </Button>
    </div>
  );
}

/* ── Chip selector ── */
function ChipSelect({ options, value, onChange, columns }: { options: string[]; value: string; onChange: (v: string) => void; columns?: number }) {
  return (
    <div className={cn("flex flex-wrap gap-2", columns && `grid grid-cols-${columns}`)}>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150',
            value === o
              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
              : 'bg-muted/40 text-muted-foreground border-border hover:border-primary/40 hover:bg-muted/60',
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

/* ── Branded loading state with VOVV.AI team avatars ── */
const LOADING_TIPS = [
  "Setting up studio lighting...",
  "AI is crafting realistic skin texture...",
  "Composing the perfect studio portrait...",
  "Adjusting three-point Profoto lighting...",
  "Refining facial details and expression...",
  "Almost there — finalizing your brand model...",
];

const FALLBACK_AVATAR = TEAM_MEMBERS[0]?.avatar;

function BrandedLoadingState({ previewUrl }: { previewUrl?: string }) {
  const [tipIndex, setTipIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const estimateSeconds = 90;
  const ratio = elapsed / estimateSeconds;
  const progress = ratio <= 1 ? Math.min(ratio * 90, 90) : Math.min(90 + (ratio - 1) * 5, 95);

  const overtimeMsg =
    ratio >= 2 ? 'Almost there — high-quality results take extra time…' :
    ratio >= 1.3 ? 'Taking a bit longer than usual — still working…' :
    null;

  useEffect(() => {
    const tipTimer = setInterval(() => {
      setTipIndex((i) => (i + 1) % LOADING_TIPS.length);
    }, 3500);
    const elapsedTimer = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => { clearInterval(tipTimer); clearInterval(elapsedTimer); };
  }, []);

  const avatarSrc = previewUrl || (FALLBACK_AVATAR ? getOptimizedUrl(FALLBACK_AVATAR, { quality: 60 }) : '');

  return (
    <Card>
      <CardContent className="p-10 flex flex-col items-center gap-6">
        <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-primary/20 animate-pulse-subtle">
          {avatarSrc ? (
            <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-primary/10 flex items-center justify-center">
              <Users className="w-7 h-7 text-primary" />
            </div>
          )}
        </div>

        <div className="text-center">
          <h2 className="text-lg font-semibold">Creating your brand model…</h2>
          <p className="text-sm text-muted-foreground mt-1 h-5 transition-all duration-300">
            {overtimeMsg || LOADING_TIPS[tipIndex]}
          </p>
        </div>

        <div className="w-full max-w-md space-y-2">
          <Progress value={progress} className="h-2 [&>div]:transition-all [&>div]:duration-1000 [&>div]:ease-linear" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Est. ~1–2 min</span>
            <span className="font-mono">{elapsed}s elapsed</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-muted/40 border border-border/40 max-w-md">
          <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Stay on this page — you'll pick your favorite of 3 variations next
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Section card (hoisted to module scope to prevent input remount/focus loss) ── */
const Section = ({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) => (
  <Card className="p-4 sm:p-6 border-border/60">
    <div className="flex items-baseline justify-between mb-5 pb-3 border-b border-border/50">
      <h3 className="text-[11px] font-semibold uppercase tracking-widest text-foreground">{title}</h3>
      {hint && <span className="text-[10px] text-muted-foreground/70">{hint}</span>}
    </div>
    {children}
  </Card>
);

/* ── Age slider (local state, commits on release — avoids re-rendering heavy parent on every drag pixel) ── */
const AgeSlider = ({ value, onCommit }: { value: number; onCommit: (n: number) => void }) => {
  const [local, setLocal] = useState(value);
  useEffect(() => { setLocal(value); }, [value]);
  return (
    <div className="space-y-2">
      <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">Age — {local}</Label>
      <Slider
        min={4}
        max={70}
        step={1}
        value={[local]}
        onValueChange={(v) => setLocal(v[0])}
        onValueCommit={(v) => onCommit(v[0])}
      />
      <div className="flex justify-between text-[10px] text-muted-foreground/50">
        <span>4</span><span>18</span><span>35</span><span>50</span><span>70</span>
      </div>
    </div>
  );
};

/* ── Unified Generator ── */
export function UnifiedGenerator({ onSuccess, isAdmin, layout = 'card' }: { onSuccess: () => void; isAdmin: boolean; layout?: 'card' | 'sections' }) {
  // Model name
  const [modelName, setModelName] = useState('');

  // Essentials
  const [gender, setGender] = useState('Female');
  const [age, setAge] = useState([28]);
  const [ethnicity, setEthnicity] = useState('Northern European');
  const [morphology, setMorphology] = useState('average');

  // Details
  const [eyeColor, setEyeColor] = useState('');
  const [hairStyle, setHairStyle] = useState('');
  const [hairColor, setHairColor] = useState('');
  const [skinTone, setSkinTone] = useState('');

  // Reset hair style when gender changes
  useEffect(() => {
    setHairStyle('');
    setFacialHair('None');
  }, [gender]);
  const [faceShape, setFaceShape] = useState('');
  const [expression, setExpression] = useState('Confident');
  const [facialHair, setFacialHair] = useState('None');
  const [distinctive, setDistinctive] = useState('');

  // Reference toggle
  const [useReference, setUseReference] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [referenceNotes, setReferenceNotes] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading } = useFileUpload();

  // Creation-mode chooser (only used by the sections layout)
  const [creationMode, setCreationMode] = useState<'chooser' | 'reference' | 'manual'>(
    layout === 'sections' ? 'chooser' : 'manual'
  );
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [makePublic, setMakePublic] = useState(false);
  const [variations, setVariations] = useState<string[]>([]);
  const [failedCount, setFailedCount] = useState(0);
  const [pendingMeta, setPendingMeta] = useState<{ metadata: any; name: string; sourceImageUrl?: string } | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<number>(0);
  const [publishing, setPublishing] = useState(false);
  const { balance, refreshBalance } = useCredits();
  const queryClient = useQueryClient();
  const [noCreditsOpen, setNoCreditsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const processFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
    const url = await upload(file);
    if (url) setUploadedUrl(url);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  // Clipboard paste support for reference image
  useEffect(() => {
    if (!useReference || previewUrl) return;
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) processFile(file);
          return;
        }
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [useReference, previewUrl]);

  const trimmedName = modelName.trim();
  const isReferenceMode = creationMode === 'reference';
  const validationError: string | null =
    trimmedName.length < 2 ? 'Add a model name (min 2 characters)' :
    isReferenceMode && !uploadedUrl ? 'Upload a reference photo to continue' :
    isUploading ? 'Waiting for upload to finish…' :
    isReferenceMode && uploadedUrl && !termsAccepted ? 'Confirm the content & rights policy to continue' :
    !makePublic && balance < 20 ? 'Not enough credits — top up to continue' :
    null;
  const isLowCreditsError = !makePublic && balance < 20 && trimmedName.length >= 2 && !isUploading && (!isReferenceMode || (uploadedUrl && termsAccepted));
  const canGenerate = !generating && !validationError;

  const SKIP_KEY = 'vovv:brand-model-confirm-skip';

  const buildGenerateBody = () => {
    const finalName = modelName.trim() || `${gender} Model`;
    if (isReferenceMode && uploadedUrl) {
      return {
        mode: 'reference',
        name: finalName,
        imageUrl: uploadedUrl,
        notes: referenceNotes.trim() || undefined,
        ...(makePublic ? { makePublic: true } : {}),
      };
    }
    return {
      mode: 'generator',
      name: finalName,
      description: {
        gender, age: age[0], ethnicity, morphology,
        eyeColor, hairStyle, hairColor, skinTone, faceShape,
        expression, facialHair: gender === 'Male' ? facialHair : '',
        distinctive,
      },
      ...(makePublic ? { makePublic: true } : {}),
    };
  };

  const runGenerate = async () => {
    setGenerating(true);
    try {
      const body = buildGenerateBody();
      const { data, error } = await supabase.functions.invoke('generate-user-model', { body });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.variations) {
        setVariations(data.variations);
        setFailedCount(typeof data.failed_count === 'number' ? data.failed_count : 0);
        setPendingMeta({ metadata: data.metadata, name: data.name || (body as any).name, sourceImageUrl: data.sourceImageUrl });
        setSelectedVariation(0);
        if (data.partial) {
          toast.error(`Only ${data.variations.length} of 3 variations succeeded — you can regenerate the missing ones.`);
        }
        return;
      }

      toast.success('Model generated successfully!');
      refreshBalance();
      setModelName('');
      setPreviewUrl(null);
      setUploadedUrl(null);
      setTermsAccepted(false);
      setReferenceNotes('');
      setMakePublic(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerate = async () => {
    if (!canGenerate) return;
    // Reference mode requires a second confirmation step (skippable per-session).
    if (isReferenceMode && uploadedUrl) {
      const skip = typeof window !== 'undefined' && sessionStorage.getItem(SKIP_KEY) === '1';
      if (!skip) { setConfirmOpen(true); return; }
    }
    await runGenerate();
  };

  const handleRegenerateMissing = async () => {
    if (regenerating) return;
    setRegenerating(true);
    try {
      const body = buildGenerateBody();
      const { data, error } = await supabase.functions.invoke('generate-user-model', { body });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const newVars: string[] = data?.variations || [];
      // Fill empty slots until we have 3
      const merged = [...variations];
      for (const v of newVars) {
        if (merged.length >= 3) break;
        merged.push(v);
      }
      setVariations(merged);
      setFailedCount(Math.max(0, 3 - merged.length));
      if (merged.length === 3) toast.success('All 3 variations ready.');
    } catch (err: any) {
      toast.error(err.message || 'Regeneration failed');
    } finally {
      setRegenerating(false);
    }
  };

  const handlePublishVariation = async () => {
    if (!pendingMeta || !variations[selectedVariation]) return;
    setPublishing(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-user-model', {
        body: {
          action: 'publish-public',
          selectedUrl: variations[selectedVariation],
          metadata: pendingMeta.metadata,
          name: pendingMeta.name,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success('Public model published for all users!');
      queryClient.invalidateQueries({ queryKey: ['custom-models'] });
      setVariations([]);
      setPendingMeta(null);
      setMakePublic(false);
      setModelName('');
      setPreviewUrl(null);
      setUploadedUrl(null);
      setTermsAccepted(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Failed to publish model');
    } finally {
      setPublishing(false);
    }
  };

  const handleSaveBrandModel = async () => {
    if (!pendingMeta || !variations[selectedVariation]) return;
    setPublishing(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-user-model', {
        body: {
          action: 'save-brand-model',
          selectedUrl: variations[selectedVariation],
          metadata: pendingMeta.metadata,
          name: pendingMeta.name,
          sourceImageUrl: pendingMeta.sourceImageUrl || 'generator',
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success('Brand model saved successfully!');
      refreshBalance();
      queryClient.invalidateQueries({ queryKey: ['user-models'] });
      setVariations([]);
      setPendingMeta(null);
      setModelName('');
      setPreviewUrl(null);
      setUploadedUrl(null);
      setTermsAccepted(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save model');
    } finally {
      setPublishing(false);
    }
  };

  const handleCancelVariations = () => {
    setVariations([]);
    setPendingMeta(null);
    setGenerating(false);
  };

  // ── Variation picker screen ──
  if (variations.length > 0) {
    return (
      <Card>
        <CardContent className="p-8 sm:p-10 space-y-8">
          <div className="text-center space-y-1.5">
            <h3 className="font-semibold text-lg">Choose the Best Variation</h3>
            <p className="text-xs text-muted-foreground">
              {failedCount > 0
                ? `${variations.length} of 3 variations generated — regenerate to fill the missing slot${failedCount > 1 ? 's' : ''}.`
                : `${variations.length} variations generated · Select your favorite and publish`}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 sm:gap-5 mt-2">
            {Array.from({ length: 3 }).map((_, i) => {
              const url = variations[i];
              if (!url) {
                return (
                  <div
                    key={`empty-${i}`}
                    className="relative aspect-[3/4] rounded-xl border-2 border-dashed border-border/60 bg-muted/30 flex flex-col items-center justify-center gap-2 text-muted-foreground"
                  >
                    <Wand2 className="h-5 w-5 opacity-60" />
                    <span className="text-[10px] uppercase tracking-wider">Generation failed</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-1 h-7 text-[11px]"
                      onClick={handleRegenerateMissing}
                      disabled={regenerating}
                    >
                      {regenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Regenerate'}
                    </Button>
                  </div>
                );
              }
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedVariation(i)}
                  className={cn(
                    "relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all duration-200",
                    selectedVariation === i
                      ? "border-primary shadow-lg ring-2 ring-primary/20 scale-[1.02]"
                      : "border-border/60 hover:border-border opacity-80 hover:opacity-100"
                  )}
                >
                  <img src={url} alt={`Variation ${i + 1}`} className="w-full h-full object-cover" />
                  {selectedVariation === i && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1 shadow-md">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2">
                    <Badge className={cn(
                      "text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm",
                      selectedVariation === i ? "bg-primary/90 text-primary-foreground" : "bg-background/80 text-foreground"
                    )}>
                      #{i + 1}
                    </Badge>
                  </div>
                </button>
              );
            })}
          </div>


          <div className="flex gap-3 pt-4 border-t border-border/50">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCancelVariations}
              disabled={publishing}
            >
              Cancel
            </Button>
            {makePublic ? (
              <Button
                className="flex-1 gap-2"
                onClick={handlePublishVariation}
                disabled={publishing}
              >
                {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />}
                Publish as Public Model
              </Button>
            ) : (
              <Button
                className="flex-1 gap-2"
                onClick={handleSaveBrandModel}
                disabled={publishing}
              >
                {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Save as Brand Model
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (generating) {
    return <BrandedLoadingState previewUrl={previewUrl ?? undefined} />;
  }

  // ── Form content blocks (shared between layouts) ──
  const essentialsBlock = (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between">
          <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">Model Name</Label>
          <span className={cn(
            "text-[10px] tabular-nums",
            modelName.length >= 28 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground/50"
          )}>{modelName.length}/32</span>
        </div>
        <Input
          placeholder="e.g. Sarah, Alex, Brand Ambassador"
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
          maxLength={32}
          className="h-9"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">Gender</Label>
        <ChipSelect options={['Female', 'Male']} value={gender} onChange={setGender} />
      </div>

      <AgeSlider value={age[0]} onCommit={(n) => setAge([n])} />

      <div className="space-y-2">
        <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">Region / Look</Label>
        <Select value={ethnicity} onValueChange={setEthnicity}>
          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
          <SelectContent className="max-h-80">
            <SelectGroup>
              <SelectLabel className="px-2 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">European</SelectLabel>
              {['Northern European', 'British / Irish', 'Scandinavian', 'Mediterranean', 'Eastern European'].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel className="px-2 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Latin / Hispanic</SelectLabel>
              {['Latin American', 'Iberian'].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel className="px-2 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Asian</SelectLabel>
              {['East Asian', 'South Asian', 'Southeast Asian'].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel className="px-2 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">African / Afro-descendant</SelectLabel>
              {['African', 'Afro-Caribbean', 'Afro-European'].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel className="px-2 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Other</SelectLabel>
              {['Middle Eastern / North African', 'Mixed heritage'].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">Morphology</Label>
        <ChipSelect options={['slim', 'athletic', 'average', 'plus-size']} value={morphology} onChange={setMorphology} />
      </div>
    </div>
  );

  const appearanceBlock = (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Eye Color</Label>
          <Select value={eyeColor} onValueChange={setEyeColor}>
            <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
            <SelectContent>
              {['Brown', 'Blue', 'Green', 'Hazel', 'Gray', 'Amber'].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Skin Tone</Label>
          <Select value={skinTone} onValueChange={setSkinTone}>
            <SelectTrigger><SelectValue placeholder="Natural" /></SelectTrigger>
            <SelectContent>
              {['Fair', 'Light', 'Medium', 'Olive', 'Tan', 'Brown', 'Dark'].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Hair Style</Label>
          <Select value={hairStyle} onValueChange={setHairStyle}>
            <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
            <SelectContent>
              {(gender === 'Male'
                ? ['Short straight', 'Short curly', 'Buzz cut', 'Crew cut', 'Fade', 'Slicked back', 'Medium wavy', 'Bald', 'Afro', 'Man bun']
                : ['Long straight', 'Long curly', 'Medium wavy', 'Short straight', 'Short curly', 'Bob', 'Braids', 'Ponytail', 'Bun', 'Pixie cut']
              ).map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Hair Color</Label>
          <Select value={hairColor} onValueChange={setHairColor}>
            <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
            <SelectContent>
              {['Black', 'Dark brown', 'Light brown', 'Blonde', 'Red', 'Auburn', 'Gray', 'White', 'Platinum'].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Face Shape</Label>
          <Select value={faceShape} onValueChange={setFaceShape}>
            <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
            <SelectContent>
              {['Oval', 'Round', 'Square', 'Heart', 'Diamond', 'Oblong'].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Expression</Label>
          <Select value={expression} onValueChange={setExpression}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {['Neutral', 'Smile', 'Serious', 'Confident', 'Soft'].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {gender === 'Male' && (
        <div className="space-y-1.5">
          <Label className="text-xs">Facial Hair</Label>
          <ChipSelect options={['None', 'Stubble', 'Short beard', 'Full beard', 'Goatee', 'Mustache']} value={facialHair} onChange={setFacialHair} />
        </div>
      )}

      <div className="space-y-1.5">
        <Label className="text-xs">Signature Feature</Label>
        <p className="text-[10px] text-muted-foreground/60 -mt-0.5">Add a unique characteristic to make your model stand out</p>
        <Select value={distinctive} onValueChange={setDistinctive}>
          <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
          <SelectContent>
            {['Freckles', 'Dimples', 'Sharp jawline', 'High cheekbones', 'Full lips', 'Tattoos', 'Glasses', 'Beauty mark'].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const referenceBlock = (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <ImagePlus className="h-4 w-4 text-muted-foreground" />
        <Label className="text-xs font-medium">Reference image <span className="text-muted-foreground/60 font-normal">· optional</span></Label>
      </div>
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Upload a photo to guide the AI. The generated model will resemble the person in the image while using your settings above.
      </p>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      {!previewUrl ? (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file && file.type.startsWith('image/')) processFile(file);
          }}
          className={cn(
            "w-full border-2 border-dashed rounded-xl p-6 sm:p-8 flex flex-col items-center gap-2.5 transition-all duration-150",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/40 hover:bg-muted/20"
          )}
        >
          <div className="rounded-full bg-muted p-2.5">
            <Camera className="h-5 w-5 text-muted-foreground" />
          </div>
          <span className="text-xs text-muted-foreground">Click, drag, or paste (⌘V) reference photo</span>
          <span className="text-[10px] text-muted-foreground/60">JPG, PNG · Clear face visible</span>
        </button>
      ) : (
        <div className="relative w-28 h-36 rounded-xl overflow-hidden mx-auto border border-border shadow-sm">
          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
          <button
            type="button"
            className="absolute top-1.5 right-1.5 bg-background/80 backdrop-blur rounded-full p-1 hover:bg-destructive hover:text-destructive-foreground transition-colors"
            onClick={() => { setPreviewUrl(null); setUploadedUrl(null); setTermsAccepted(false); }}
          >
            <Trash2 className="h-3 w-3" />
          </button>
          {isUploading && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          )}
        </div>
      )}

      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-2">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-destructive/90">
          <ShieldCheck className="h-3.5 w-3.5" />
          Content &amp; rights policy
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Only upload photos of yourself, people who have given you explicit written permission, or images you fully own. Do not upload photos of celebrities, minors without guardian consent, or anyone whose likeness you don't have the right to use. VOVV.AI is not liable for misuse — you accept full responsibility for any reference you upload.
        </p>
      </div>

      <div
        role={uploadedUrl ? 'button' : undefined}
        onClick={() => { if (uploadedUrl) setTermsAccepted((v) => !v); }}
        className={cn(
          "flex items-start gap-3 p-3 rounded-lg border transition-colors",
          uploadedUrl ? "bg-muted/40 border-border/60 cursor-pointer hover:bg-muted/60" : "bg-muted/20 border-border/30 opacity-60"
        )}
      >
        <Checkbox
          id="terms"
          checked={termsAccepted}
          disabled={!uploadedUrl}
          onCheckedChange={(checked) => setTermsAccepted(checked === true)}
          onClick={(e) => e.stopPropagation()}
          className="mt-0.5"
        />
        <span className={cn("text-[11px] leading-relaxed", uploadedUrl ? "text-muted-foreground" : "text-muted-foreground/70")}>
          I confirm I own or have explicit permission to use this image, and I accept full responsibility under the VOVV.AI Content Policy.
        </span>
      </div>
    </div>
  );

  const adminBlock = isAdmin ? (
    <div
      role="button"
      onClick={() => setMakePublic((v) => !v)}
      className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20 cursor-pointer hover:bg-primary/10 transition-colors"
    >
      <Checkbox
        id="make-public"
        checked={makePublic}
        onCheckedChange={(checked) => setMakePublic(checked === true)}
        onClick={(e) => e.stopPropagation()}
        className="mt-0.5"
      />
      <span className="text-[11px] text-muted-foreground leading-relaxed">
        <ShieldCheck className="h-3.5 w-3.5 inline mr-1 text-primary" />
        <strong>Add as public model</strong> — visible to all users, no credits charged
      </span>
    </div>
  ) : null;

  const inlineFooterBlock = (
    <div className="space-y-3 pt-1">
      {!makePublic && (
        <div className="flex items-center justify-between text-xs px-0.5">
          <span className="text-muted-foreground">Cost: <strong className="text-foreground">20 credits</strong></span>
          <span className={cn("font-medium", balance >= 20 ? "text-foreground" : "text-destructive")}>
            Balance: {balance} credits
          </span>
        </div>
      )}

      {validationError && (
        <p className={cn(
          "text-[11px] text-center",
          isLowCreditsError ? "text-destructive" : "text-muted-foreground"
        )}>
          {validationError}
        </p>
      )}

      <Button
        className="w-full gap-2"
        disabled={!canGenerate}
        onClick={handleGenerate}
        title={validationError || undefined}
      >
        <Wand2 className="h-4 w-4" />
        {makePublic ? 'Generate Public Model (free)' : 'Generate Brand Model (20 credits)'}
      </Button>

      {isLowCreditsError && (
        <button
          type="button"
          onClick={() => setNoCreditsOpen(true)}
          className="text-xs text-destructive text-center w-full hover:underline cursor-pointer"
        >
          Buy credits →
        </button>
      )}
      <NoCreditsModal open={noCreditsOpen} onClose={() => setNoCreditsOpen(false)} category="fallback" />

      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-border/30">
        <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Stay on this page — you'll pick your favorite of 3 variations next
        </p>
      </div>
    </div>
  );

  // ── Sections layout (premium wizard) ──
  if (layout === 'sections') {


    return (
      <div className="space-y-5 pb-32">
        <Section title="Essentials">{essentialsBlock}</Section>

        <Collapsible>
          <Card className="p-4 sm:p-6 border-border/60">
            <CollapsibleTrigger className="group w-full flex items-baseline justify-between mb-0 pb-0 text-left">
              <div className="flex items-baseline gap-3">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-foreground">Appearance</h3>
                <span className="text-[10px] text-muted-foreground/70">All optional</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-5 pt-5 border-t border-border/50">
                {appearanceBlock}
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        <Section title="Reference" hint="Optional">{referenceBlock}</Section>

        <Section title="Summary">
          <div>
            <p className="text-sm font-medium">
              {modelName.trim() || <span className="text-muted-foreground">New brand model</span>}
            </p>
            {(() => {
              const chips = [
                gender,
                age?.[0] != null ? `${age[0]} yrs` : null,
                ethnicity,
                morphology && morphology !== 'average' ? morphology : null,
                hairColor,
              ].filter(Boolean) as string[];
              if (chips.length === 0) return null;
              return (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {chips.map((c) => (
                    <span key={c} className="text-[10px] uppercase tracking-wider text-muted-foreground/80 bg-muted/50 px-1.5 py-0.5 rounded">
                      {c}
                    </span>
                  ))}
                </div>
              );
            })()}
          </div>

          <div className="h-px bg-border/50 my-4" />

          <div className="text-xs">
            <span className="font-medium text-foreground">3 variations</span>
            <span className="text-muted-foreground"> · {makePublic ? 'Free' : '20 credits'}</span>
          </div>

          {validationError && (
            isLowCreditsError ? (
              <button
                type="button"
                onClick={() => setNoCreditsOpen(true)}
                className="mt-2 text-[11px] text-destructive hover:underline cursor-pointer block"
              >
                {validationError} →
              </button>
            ) : (
              <p className="mt-2 text-[11px] text-destructive">{validationError}</p>
            )
          )}
        </Section>

        {adminBlock && <Section title="Admin">{adminBlock}</Section>}

        {/* Sticky footer — floating pill (matches /app/generate/product-images) */}
        <div className="fixed bottom-4 left-0 right-0 lg:left-[var(--sidebar-offset)] z-50 px-4">
          <div className="max-w-3xl mx-auto bg-background border border-border rounded-2xl shadow-lg p-4 flex items-center justify-between gap-4">
            <Button variant="outline" onClick={onSuccess}>Back</Button>
            {validationError ? (
              isLowCreditsError ? (
                <button
                  type="button"
                  onClick={() => setNoCreditsOpen(true)}
                  className="text-xs text-destructive text-center flex-1 hover:underline cursor-pointer"
                >
                  {validationError} →
                </button>
              ) : (
                <span className="text-xs text-muted-foreground text-center flex-1">{validationError}</span>
              )
            ) : (
              <span className="flex-1" />
            )}
            <Button
              disabled={!canGenerate}
              onClick={handleGenerate}
              title={validationError || undefined}
            >
              {makePublic ? 'Generate · free' : 'Generate'}
            </Button>
          </div>
        </div>
        <NoCreditsModal open={noCreditsOpen} onClose={() => setNoCreditsOpen(false)} category="fallback" />
      </div>
    );
  }

  // ── Default single-card layout (legacy) ──
  return (
    <div className="space-y-5 pt-1">
      {essentialsBlock}
      <div className="h-px bg-border/60" />
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">Appearance Details</p>
      {appearanceBlock}
      <div className="h-px bg-border/60" />
      {referenceBlock}
      {adminBlock}
      {inlineFooterBlock}
    </div>
  );
}

/* ── Model card with inline rename ── */
function ModelCard({ model, onDelete, onRename }: { model: any; onDelete: (id: string) => void; onRename: (id: string, name: string) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(model.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const handleSave = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== model.name) {
      onRename(model.id, trimmed);
    } else {
      setEditName(model.name);
    }
    setIsEditing(false);
  };

  return (
    <Card className="overflow-hidden group border-border/50 hover:border-border transition-all duration-200 hover:shadow-md bg-card">
      <div className="aspect-[3/4] relative bg-muted">
        <img src={getOptimizedUrl(model.image_url, { quality: 60 })} alt={model.name} className="w-full h-full object-cover" />
        <button
          type="button"
          onClick={() => onDelete(model.id)}
          className="absolute top-1.5 right-1.5 bg-background/70 backdrop-blur-md rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all duration-150 hover:bg-destructive hover:text-destructive-foreground"
          aria-label="Delete model"
        >
          <Trash2 className="h-3 w-3" />
        </button>
        <Link
          to={`/app/workflows?model=${model.id}`}
          className="absolute inset-x-1.5 bottom-1.5 translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 bg-background/95 backdrop-blur-md rounded-md px-2 py-1.5 text-[10px] font-semibold tracking-wide flex items-center justify-center gap-1 hover:bg-primary hover:text-primary-foreground shadow-sm"
        >
          Use in Visual Studio <ArrowRight className="h-2.5 w-2.5" />
        </Link>
      </div>
      <div className="px-2.5 py-2 space-y-1.5">
        <div className="flex items-center gap-1 group/name min-h-[18px]">
          {isEditing ? (
            <input
              ref={inputRef}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') { setEditName(model.name); setIsEditing(false); } }}
              maxLength={40}
              className="font-medium text-[13px] w-full bg-transparent border-b border-primary outline-none"
            />
          ) : (
            <>
              <p className="font-medium text-[13px] truncate flex-1">{model.name}</p>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="opacity-0 group-hover/name:opacity-100 transition-opacity p-0.5 hover:text-primary"
                aria-label="Rename model"
              >
                <Pencil className="h-2.5 w-2.5" />
              </button>
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-1">
          {model.gender && <span className="text-[9px] uppercase tracking-wider text-muted-foreground/80 bg-muted/50 px-1.5 py-0.5 rounded">{model.gender}</span>}
          {model.ethnicity && <span className="text-[9px] uppercase tracking-wider text-muted-foreground/80 bg-muted/50 px-1.5 py-0.5 rounded">{model.ethnicity}</span>}
        </div>
      </div>
    </Card>
  );
}

/* ── Main page ── */
export default function BrandModels() {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { models, refetch } = useUserModels();
  const deleteMutation = useDeleteUserModel();

  const { data: profile } = useQuery({
    queryKey: ['profile-plan', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('plan').eq('user_id', user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const plan = profile?.plan || 'free';
  const isPaid = ['growth', 'pro', 'enterprise'].includes(plan);

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Model deleted');
    } catch {
      toast.error('Failed to delete model');
    }
  };

  const handleRename = async (id: string, name: string) => {
    try {
      const { error } = await supabase.from('user_models').update({ name }).eq('id', id);
      if (error) throw error;
      toast.success('Model renamed');
      refetch();
    } catch {
      toast.error('Failed to rename model');
    }
  };

  return (
    <div className="space-y-6">
      {isPaid && (
        <PageHeader title="Brand Models" subtitle="Custom AI models that match your brand">
          {models.length > 0 ? (
            <Button asChild className="gap-2">
              <Link to="/app/models/new">
                <Plus className="h-4 w-4" /> New brand model
              </Link>
            </Button>
          ) : null}
        </PageHeader>
      )}

      {!isPaid ? (
        <>
          <UpgradeHero />
          {/* Show locked models for downgraded users */}
          {models.length > 0 && (
            <div className="space-y-4 mt-6">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold flex items-center gap-2 text-base">
                  <Users className="h-4 w-4 text-muted-foreground" /> My Brand Models
                </h3>
                <Badge variant="secondary" className="text-[10px]">{models.length}</Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {models.map((m) => (
                  <Card key={m.id} className="overflow-hidden border-border/60 opacity-50 grayscale relative">
                    <div className="aspect-[3/4] relative bg-muted">
                      <img src={getOptimizedUrl(m.image_url, { quality: 60 })} alt={m.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-background/30">
                        <Crown className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div className="p-3 space-y-1">
                      <p className="font-semibold text-sm truncate">{m.name}</p>
                      <p className="text-[10px] text-muted-foreground">Upgrade to unlock</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      ) : models.length === 0 ? (
        <div className="flex flex-col items-center text-center py-24 px-4 max-w-lg mx-auto gap-7">
          <div className="flex items-end justify-center">
            {mockModels.slice(0, 3).map((m, i) => (
              <img
                key={m.modelId}
                src={m.previewUrl}
                alt={m.name}
                loading="lazy"
                className={cn(
                  "w-24 aspect-[3/4] rounded-xl object-cover shadow-sm ring-2 ring-background",
                  i === 1 ? "z-10 scale-110" : "opacity-90",
                  i > 0 && "-ml-3"
                )}
              />
            ))}
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight">No brand models yet</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Brand models are custom AI faces you reuse across every campaign — same person, every scene, fully on-brand
            </p>
          </div>
          <Button asChild size="pill" className="gap-2">
            <Link to="/app/models/new">
              <Plus className="h-4 w-4" /> Create your first brand model
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {/* Dashed "New model" tile */}
          <Link
            to="/app/models/new"
            className="aspect-[3/4] rounded-lg border border-dashed border-border/60 hover:border-primary/50 hover:bg-muted/20 transition-all duration-200 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary group"
          >
            <div className="rounded-full bg-muted/50 p-2 group-hover:bg-primary/10 transition-colors">
              <Plus className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-medium tracking-wide">New brand model</span>
          </Link>
          {models.map((m) => (
            <ModelCard key={m.id} model={m} onDelete={handleDelete} onRename={handleRename} />
          ))}
        </div>
      )}
    </div>
  );
}

