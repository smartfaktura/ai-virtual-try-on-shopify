import { useState, useRef, useEffect } from 'react';
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
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/lib/brandedToast';
import { cn } from '@/lib/utils';
import { TEAM_MEMBERS } from '@/data/teamData';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import {
  Users, Upload, Sparkles, Crown, Loader2, Trash2, Camera, Wand2,
  Check, Star, Palette, Baby, UserCheck, Globe, ShieldCheck, ImagePlus,
  Pencil, Info,
} from 'lucide-react';

/* ── Plan gate upgrade prompt ── */
function UpgradeHero() {
  const { openBuyModal } = useCredits();
  return (
    <div className="flex flex-col items-center text-center py-20 px-4 max-w-2xl mx-auto gap-10">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest mb-4">
          <Crown className="h-3.5 w-3.5" /> Growth & Pro
        </div>
        <h2 className="text-3xl font-bold tracking-tight">My Brand Models</h2>
        <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
          Create unlimited custom AI models — any gender, age, ethnicity, or body type — that match your brand identity perfectly.
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

      <Button size="lg" className="gap-2 px-8" onClick={openBuyModal}>
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

const LOADING_AVATARS = TEAM_MEMBERS.slice(0, 6);

function BrandedLoadingState({ isPublicMode = false }: { isPublicMode?: boolean }) {
  const [tipIndex, setTipIndex] = useState(0);
  const [activeAvatar, setActiveAvatar] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const estimateSeconds = isPublicMode ? 90 : 40;
  const estimateLabel = isPublicMode ? '~1-2 min' : '~30-50 sec';
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
    const avatarTimer = setInterval(() => {
      setActiveAvatar((i) => (i + 1) % LOADING_AVATARS.length);
    }, 2200);
    const elapsed = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => { clearInterval(tipTimer); clearInterval(avatarTimer); clearInterval(elapsed); };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-6">
      {/* Team avatar carousel */}
      <div className="relative w-32 h-32">
        {LOADING_AVATARS.map((member, i) => (
          <div
            key={member.name}
            className={cn(
              "absolute inset-0 flex items-center justify-center transition-all duration-700",
              i === activeAvatar ? "opacity-100 scale-100" : "opacity-0 scale-90"
            )}
          >
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-lg">
              <img
                src={getOptimizedUrl(member.avatar, { quality: 60 })}
                alt={member.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ))}
        {/* Pulse ring */}
        <div className="absolute inset-0 rounded-2xl border-2 border-primary/10 animate-pulse" />
      </div>

      {/* Active member name */}
      <div className="text-center space-y-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/70">
          {LOADING_AVATARS[activeAvatar]?.name} · {LOADING_AVATARS[activeAvatar]?.expertiseTag}
        </p>
      </div>

      <div className="text-center space-y-2">
        <p className="text-sm font-semibold text-foreground">
          {isPublicMode ? 'Generating 3 model variations…' : 'Creating your brand model...'}
        </p>
        <p className="text-xs text-muted-foreground h-4 transition-all duration-300">{overtimeMsg || LOADING_TIPS[tipIndex]}</p>
      </div>

      {/* Progress bar + time info */}
      <div className="w-full max-w-xs space-y-2">
        <Progress value={progress} className="h-1.5 [&>div]:transition-all [&>div]:duration-1000 [&>div]:ease-linear" />
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Est. {estimateLabel}</span>
          <span className="font-mono">{elapsed}s elapsed</span>
        </div>
      </div>

      <div className="flex gap-1.5">
        {LOADING_TIPS.map((_, i) => (
          <div key={i} className={cn("w-1.5 h-1.5 rounded-full transition-colors duration-300", i === tipIndex ? "bg-primary" : "bg-muted")} />
        ))}
      </div>

      {/* Server-side info */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-muted/40 border border-border/40 max-w-xs">
        <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Generation happens server-side. You can safely navigate away — your model will appear here when ready.
        </p>
      </div>
    </div>
  );
}

/* ── Unified Generator ── */
function UnifiedGenerator({ onSuccess, isAdmin }: { onSuccess: () => void; isAdmin: boolean }) {
  // Model name
  const [modelName, setModelName] = useState('');

  // Essentials
  const [gender, setGender] = useState('Female');
  const [age, setAge] = useState([28]);
  const [ethnicity, setEthnicity] = useState('Caucasian');
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
  const fileRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading } = useFileUpload();

  const [generating, setGenerating] = useState(false);
  const [makePublic, setMakePublic] = useState(false);
  const [variations, setVariations] = useState<string[]>([]);
  const [pendingMeta, setPendingMeta] = useState<{ metadata: any; name: string } | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<number>(0);
  const [publishing, setPublishing] = useState(false);
  const { balance, refreshBalance } = useCredits();
  const queryClient = useQueryClient();

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

  const canGenerate = !generating && (makePublic || balance >= 20) && !isUploading &&
    (!useReference || (uploadedUrl && termsAccepted));

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setGenerating(true);
    try {
      const finalName = modelName.trim() || `${gender} Model`;
      const body: any = {
        mode: useReference && uploadedUrl ? 'combined' : 'generator',
        name: finalName,
        description: {
          gender, age: age[0], ethnicity, morphology,
          eyeColor, hairStyle, hairColor, skinTone, faceShape,
          expression, facialHair: gender === 'Male' ? facialHair : '',
          distinctive,
        },
      };
      if (useReference && uploadedUrl) {
        body.imageUrl = uploadedUrl;
      }
      if (makePublic) {
        body.makePublic = true;
      }

      const { data, error } = await supabase.functions.invoke('generate-user-model', { body });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Admin public: show variation picker
      if (makePublic && data?.variations) {
        setVariations(data.variations);
        setPendingMeta({ metadata: data.metadata, name: data.name || finalName });
        setSelectedVariation(0);
        return; // stay on page, show picker
      }

      toast.success('Model generated successfully!');
      refreshBalance();
      setModelName('');
      setPreviewUrl(null);
      setUploadedUrl(null);
      setTermsAccepted(false);
      setMakePublic(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Generation failed');
    } finally {
      setGenerating(false);
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

  const handleCancelVariations = () => {
    setVariations([]);
    setPendingMeta(null);
    setGenerating(false);
  };

  // ── Variation picker screen ──
  if (variations.length > 0) {
    return (
      <div className="space-y-5">
        <div className="text-center space-y-1">
          <h3 className="font-semibold text-base">Choose the Best Variation</h3>
          <p className="text-xs text-muted-foreground">{variations.length} variations generated · Select your favorite and publish</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {variations.map((url, i) => (
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
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleCancelVariations}
            disabled={publishing}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 gap-2"
            onClick={handlePublishVariation}
            disabled={publishing}
          >
            {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />}
            Publish as Public Model
          </Button>
        </div>
      </div>
    );
  }

  if (generating) {
    return <BrandedLoadingState isPublicMode={makePublic} />;
  }

  return (
    <div className="space-y-5 pt-1">
      {/* ── Model Name ── */}
      <div className="space-y-2">
        <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">Model Name</Label>
        <Input
          placeholder="e.g. Sarah, Alex, Brand Ambassador..."
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
          maxLength={40}
          className="h-9"
        />
      </div>

      {/* ── Essentials ── */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">Gender</Label>
          <ChipSelect options={['Female', 'Male']} value={gender} onChange={setGender} />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">Age — {age[0]}</Label>
          <Slider min={4} max={70} step={1} value={age} onValueChange={setAge} />
          <div className="flex justify-between text-[10px] text-muted-foreground/50">
            <span>4</span><span>18</span><span>35</span><span>50</span><span>70</span>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">Ethnicity</Label>
          <ChipSelect options={['Caucasian', 'Asian', 'African', 'Hispanic', 'Middle Eastern', 'South Asian', 'Mixed']} value={ethnicity} onChange={setEthnicity} />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">Morphology</Label>
          <ChipSelect options={['slim', 'athletic', 'average', 'plus-size']} value={morphology} onChange={setMorphology} />
        </div>
      </div>

      {/* ── Separator ── */}
      <div className="h-px bg-border/60" />

      {/* ── Details (open by default) ── */}
      <div className="space-y-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">Appearance Details</p>

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

        {/* Facial hair — male only */}
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

      {/* ── Separator ── */}
      <div className="h-px bg-border/60" />

      {/* ── Optional reference image ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImagePlus className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="ref-toggle" className="text-xs font-medium cursor-pointer">Use reference image</Label>
          </div>
          <Switch
            id="ref-toggle"
            checked={useReference}
            onCheckedChange={(v) => {
              setUseReference(v);
              if (!v) { setPreviewUrl(null); setUploadedUrl(null); setTermsAccepted(false); }
            }}
          />
        </div>

        {useReference && (
          <div className="space-y-3 pl-1">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Upload a reference photo to guide the AI. The generated model will resemble the person in the image while using your settings above.
            </p>

            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

            {!previewUrl ? (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-2.5 hover:border-primary/40 hover:bg-muted/20 transition-all duration-150"
              >
                <div className="rounded-full bg-muted p-2.5">
                  <Camera className="h-5 w-5 text-muted-foreground" />
                </div>
                <span className="text-xs text-muted-foreground">Click or paste (⌘V) reference photo</span>
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

            {/* Terms & Conditions */}
            {uploadedUrl && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/60">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                  className="mt-0.5"
                />
                <label htmlFor="terms" className="text-[11px] text-muted-foreground leading-relaxed cursor-pointer">
                  <ShieldCheck className="h-3.5 w-3.5 inline mr-1 text-primary" />
                  I confirm I own the rights to this image or have permission to use it as a reference. I accept full responsibility for the content I upload and agree to the terms of service.
                </label>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Admin: Make Public ── */}
      {isAdmin && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <Checkbox
            id="make-public"
            checked={makePublic}
            onCheckedChange={(checked) => setMakePublic(checked === true)}
            className="mt-0.5"
          />
          <label htmlFor="make-public" className="text-[11px] text-muted-foreground leading-relaxed cursor-pointer">
            <ShieldCheck className="h-3.5 w-3.5 inline mr-1 text-primary" />
            <strong>Add as public model</strong> — visible to all users, no credits charged
          </label>
        </div>
      )}

      {/* ── Credit info & Generate ── */}
      <div className="space-y-3 pt-1">
        {!makePublic && (
          <div className="flex items-center justify-between text-xs px-0.5">
            <span className="text-muted-foreground">Cost: <strong className="text-foreground">20 credits</strong></span>
            <span className={cn("font-medium", balance >= 20 ? "text-foreground" : "text-destructive")}>
              Balance: {balance} credits
            </span>
          </div>
        )}

        <Button className="w-full gap-2" disabled={!canGenerate} onClick={handleGenerate}>
          <Wand2 className="h-4 w-4" />
          {makePublic ? 'Generate Public Model (free)' : 'Generate Brand Model (20 credits)'}
        </Button>

        {!makePublic && balance < 20 && (
          <p className="text-xs text-destructive text-center">Not enough credits. You need at least 20.</p>
        )}

        {/* Server-side generation note */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-border/30">
          <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Generation happens server-side. You can safely navigate away — your model will appear here when ready.
          </p>
        </div>
      </div>
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
    <Card className="overflow-hidden group border-border/60 hover:border-border transition-colors duration-150">
      <div className="aspect-[3/4] relative bg-muted">
        <img src={getOptimizedUrl(model.image_url, { quality: 60 })} alt={model.name} className="w-full h-full object-cover" />
        <button
          type="button"
          onClick={() => onDelete(model.id)}
          className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-150 hover:bg-destructive hover:text-destructive-foreground"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
        <Badge className="absolute bottom-2 left-2 bg-primary/90 text-primary-foreground backdrop-blur-sm text-[9px] font-bold uppercase tracking-wider">
          Brand Model
        </Badge>
      </div>
      <div className="p-3 space-y-1.5">
        <div className="flex items-center gap-1.5 group/name">
          {isEditing ? (
            <input
              ref={inputRef}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') { setEditName(model.name); setIsEditing(false); } }}
              maxLength={40}
              className="font-semibold text-sm w-full bg-transparent border-b border-primary outline-none"
            />
          ) : (
            <>
              <p className="font-semibold text-sm truncate flex-1">{model.name}</p>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="opacity-0 group-hover/name:opacity-100 transition-opacity p-0.5 hover:text-primary"
              >
                <Pencil className="h-3 w-3" />
              </button>
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-1">
          {model.gender && <Badge variant="outline" className="text-[10px] border-border/60">{model.gender}</Badge>}
          {model.ethnicity && <Badge variant="outline" className="text-[10px] border-border/60">{model.ethnicity}</Badge>}
          {model.age_range && <Badge variant="outline" className="text-[10px] border-border/60">{model.age_range}</Badge>}
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
      <PageHeader title="My Brand Models" subtitle="Create and manage your custom AI models for consistent brand imagery">
        <div />
      </PageHeader>

      {!isPaid ? (
        <>
          <UpgradeHero />
          {/* Show locked models for downgraded users */}
          {models.length > 0 && (
            <div className="space-y-4 mt-6">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold flex items-center gap-2 text-base">
                  <Users className="h-4 w-4 text-muted-foreground" /> Your Brand Models
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
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8 mt-2">
          {/* Creation panel */}
          <Card className="p-6 h-fit border-border/60">
            <h3 className="font-semibold mb-1 flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" /> Create New Model
            </h3>
            <p className="text-xs text-muted-foreground mb-5">Describe your ideal model · 20 credits per generation</p>

            <UnifiedGenerator onSuccess={() => refetch()} isAdmin={isAdmin} />
          </Card>

          {/* Models grid */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-muted-foreground" /> My Models
              </h3>
              {models.length > 0 && <Badge variant="secondary" className="text-[10px]">{models.length}</Badge>}
            </div>
            {models.length === 0 ? (
              <Card className="p-12 flex flex-col items-center gap-4 text-center border-dashed border-border/60">
                <div className="rounded-full bg-muted p-4">
                  <Users className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">No models yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Create your first brand model using the panel on the left.</p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {models.map((m) => (
                  <ModelCard key={m.id} model={m} onDelete={handleDelete} onRename={handleRename} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
