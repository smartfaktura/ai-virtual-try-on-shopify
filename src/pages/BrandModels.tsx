import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/contexts/CreditContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserModels, useGenerateUserModel, useDeleteUserModel } from '@/hooks/useUserModels';
import { useFileUpload } from '@/hooks/useFileUpload';
import { PageHeader } from '@/components/app/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Users, Upload, Sparkles, Crown, Loader2, Trash2, ChevronDown, Camera, Wand2,
  Check, Star, Palette, Baby, UserCheck, Globe, ShieldCheck,
} from 'lucide-react';

/* ── Plan gate upgrade prompt ── */
function UpgradeHero() {
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

      <Button size="lg" className="gap-2 px-8" onClick={() => window.location.href = '/pricing'}>
        <Crown className="h-4 w-4" /> Upgrade to Growth
      </Button>
    </div>
  );
}

/* ── Chip selector ── */
function ChipSelect({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
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

/* ── Reference tab ── */
function ReferenceTab({ onSuccess }: { onSuccess: () => void }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading } = useFileUpload();
  const generateMutation = useGenerateUserModel();
  const { balance, refreshBalance } = useCredits();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
    const url = await upload(file);
    if (url) setUploadedUrl(url);
  };

  const handleGenerate = async () => {
    if (!uploadedUrl || !termsAccepted) return;
    try {
      await generateMutation.mutateAsync(uploadedUrl);
      toast.success('Model generated successfully!');
      refreshBalance();
      setPreviewUrl(null);
      setUploadedUrl(null);
      setTermsAccepted(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Generation failed');
    }
  };

  return (
    <div className="space-y-5 pt-1">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Upload a clear, well-lit reference photo. Our AI generates a professional studio portrait matching the person's appearance.
      </p>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      {!previewUrl ? (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center gap-3 hover:border-primary/40 hover:bg-muted/20 transition-all duration-150"
        >
          <div className="rounded-full bg-muted p-3">
            <Camera className="h-6 w-6 text-muted-foreground" />
          </div>
          <span className="text-sm text-muted-foreground">Click to upload reference photo</span>
          <span className="text-[10px] text-muted-foreground/60">JPG, PNG · Clear face visible</span>
        </button>
      ) : (
        <div className="relative w-36 h-48 rounded-xl overflow-hidden mx-auto border border-border shadow-sm">
          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
          <button
            type="button"
            className="absolute top-1.5 right-1.5 bg-background/80 backdrop-blur rounded-full p-1 hover:bg-destructive hover:text-destructive-foreground transition-colors"
            onClick={() => { setPreviewUrl(null); setUploadedUrl(null); setTermsAccepted(false); }}
          >
            <Trash2 className="h-3.5 w-3.5" />
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

      {/* Credit info */}
      <div className="flex items-center justify-between text-xs px-0.5">
        <span className="text-muted-foreground">Cost: <strong className="text-foreground">20 credits</strong></span>
        <span className={cn("font-medium", balance >= 20 ? "text-foreground" : "text-destructive")}>
          Balance: {balance} credits
        </span>
      </div>

      <Button
        className="w-full gap-2"
        disabled={!uploadedUrl || !termsAccepted || isUploading || generateMutation.isPending || balance < 20}
        onClick={handleGenerate}
      >
        {generateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        Generate Model (20 credits)
      </Button>

      {balance < 20 && uploadedUrl && (
        <p className="text-xs text-destructive text-center">Not enough credits. You need at least 20.</p>
      )}
    </div>
  );
}

/* ── Generator tab ── */
function GeneratorTab({ onSuccess }: { onSuccess: () => void }) {
  const [gender, setGender] = useState('Female');
  const [age, setAge] = useState([28]);
  const [ethnicity, setEthnicity] = useState('Caucasian');
  const [morphology, setMorphology] = useState('average');
  const [eyeColor, setEyeColor] = useState('');
  const [hairStyle, setHairStyle] = useState('');
  const [hairColor, setHairColor] = useState('');
  const [distinctive, setDistinctive] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  const { balance, refreshBalance } = useCredits();

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-user-model', {
        body: {
          mode: 'generator',
          description: { gender, age: age[0], ethnicity, morphology, eyeColor, hairStyle, hairColor, distinctive },
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success('Model generated successfully!');
      refreshBalance();
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-5 pt-1">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Describe the model you want to create. Our AI generates a professional studio portrait.
      </p>

      {/* Essentials */}
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
      </div>

      {/* Details collapsible */}
      <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
        <CollapsibleTrigger asChild>
          <button type="button" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full">
            <ChevronDown className={cn('h-4 w-4 transition-transform duration-150', detailsOpen && 'rotate-180')} />
            Details (optional)
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Morphology</Label>
              <Select value={morphology} onValueChange={setMorphology}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['slim', 'athletic', 'average', 'plus-size'].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
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
              <Label className="text-xs">Hair Style</Label>
              <Select value={hairStyle} onValueChange={setHairStyle}>
                <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                <SelectContent>
                  {['Short straight', 'Short curly', 'Medium wavy', 'Long straight', 'Long curly', 'Buzz cut', 'Bald', 'Braids', 'Ponytail', 'Bob'].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
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
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Distinctive Trait (optional)</Label>
            <Select value={distinctive} onValueChange={setDistinctive}>
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                {['Freckles', 'Dimples', 'Sharp jawline', 'High cheekbones', 'Full lips', 'Tattoos', 'Glasses', 'Beard', 'Mustache'].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Credit info */}
      <div className="flex items-center justify-between text-xs px-0.5">
        <span className="text-muted-foreground">Cost: <strong className="text-foreground">20 credits</strong></span>
        <span className={cn("font-medium", balance >= 20 ? "text-foreground" : "text-destructive")}>
          Balance: {balance} credits
        </span>
      </div>

      <Button className="w-full gap-2" disabled={generating || balance < 20} onClick={handleGenerate}>
        {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
        Generate Model (20 credits)
      </Button>

      {balance < 20 && (
        <p className="text-xs text-destructive text-center">Not enough credits. You need at least 20.</p>
      )}
    </div>
  );
}

/* ── Model card ── */
function ModelCard({ model, onDelete }: { model: any; onDelete: (id: string) => void }) {
  return (
    <Card className="overflow-hidden group border-border/60 hover:border-border transition-colors duration-150">
      <div className="aspect-[3/4] relative bg-muted">
        <img src={model.image_url} alt={model.name} className="w-full h-full object-cover" />
        <button
          type="button"
          onClick={() => onDelete(model.id)}
          className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-150 hover:bg-destructive hover:text-destructive-foreground"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
        <Badge className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm text-[10px] font-semibold">My Model</Badge>
      </div>
      <div className="p-3 space-y-1.5">
        <p className="font-semibold text-sm truncate">{model.name}</p>
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

  return (
    <div className="space-y-6">
      <PageHeader title="My Brand Models" subtitle="Create and manage your custom AI models for consistent brand imagery">
        <div />
      </PageHeader>

      {!isPaid ? (
        <UpgradeHero />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 mt-2">
          {/* Creation panel */}
          <Card className="p-6 h-fit border-border/60">
            <h3 className="font-semibold mb-1 flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" /> Create New Model
            </h3>
            <p className="text-xs text-muted-foreground mb-5">20 credits per model generation</p>

            <Tabs defaultValue="reference" className="w-full">
              <TabsList className="w-full mb-1">
                <TabsTrigger value="reference" className="flex-1 gap-1.5 text-xs">
                  <Camera className="h-3.5 w-3.5" /> From Reference
                </TabsTrigger>
                <TabsTrigger value="generator" className="flex-1 gap-1.5 text-xs">
                  <Wand2 className="h-3.5 w-3.5" /> Generator
                </TabsTrigger>
              </TabsList>
              <TabsContent value="reference">
                <ReferenceTab onSuccess={() => refetch()} />
              </TabsContent>
              <TabsContent value="generator">
                <GeneratorTab onSuccess={() => refetch()} />
              </TabsContent>
            </Tabs>
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
                  <ModelCard key={m.id} model={m} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
