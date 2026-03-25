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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Users, Upload, Sparkles, Crown, Loader2, Trash2, ChevronDown, Camera, Wand2,
  Check, Star, Palette, Baby, UserCheck, Globe,
} from 'lucide-react';

/* ── Plan gate upgrade prompt ── */
function UpgradeHero() {
  return (
    <div className="flex flex-col items-center text-center py-16 px-4 max-w-2xl mx-auto gap-8">
      <div className="rounded-full bg-primary/10 p-4">
        <Crown className="h-10 w-10 text-primary" />
      </div>
      <div className="space-y-3">
        <h2 className="text-2xl font-bold tracking-tight">Unlock Brand Models</h2>
        <p className="text-muted-foreground max-w-lg">
          Create unlimited custom AI models — any gender, age, ethnicity, or body type — that match your brand identity perfectly.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
        {[
          { icon: UserCheck, label: 'Brand Consistency', desc: 'Same model across all campaigns' },
          { icon: Globe, label: 'Any Ethnicity & Age', desc: 'Represent your diverse audience' },
          { icon: Baby, label: 'Kids Models', desc: 'Generate child models safely' },
          { icon: Palette, label: 'Custom Looks', desc: 'Fully describe or upload a reference' },
        ].map((b) => (
          <Card key={b.label} className="flex items-start gap-3 p-4 text-left">
            <b.icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">{b.label}</p>
              <p className="text-xs text-muted-foreground">{b.desc}</p>
            </div>
          </Card>
        ))}
      </div>
      <Button size="lg" className="gap-2" onClick={() => window.location.href = '/pricing'}>
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
            'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
            value === o
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/40',
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
    if (!uploadedUrl) return;
    try {
      await generateMutation.mutateAsync(uploadedUrl);
      toast.success('Model generated successfully!');
      refreshBalance();
      setPreviewUrl(null);
      setUploadedUrl(null);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Generation failed');
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Upload a clear, well-lit reference photo. Our AI will generate a professional studio portrait matching the person's appearance.
      </p>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {!previewUrl ? (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center gap-3 hover:border-primary/40 transition-colors"
        >
          <Camera className="h-8 w-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Click to upload reference photo</span>
        </button>
      ) : (
        <div className="relative w-40 h-52 rounded-lg overflow-hidden mx-auto border">
          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
          <button
            type="button"
            className="absolute top-1 right-1 bg-background/80 rounded-full p-1"
            onClick={() => { setPreviewUrl(null); setUploadedUrl(null); }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      <Button
        className="w-full gap-2"
        disabled={!uploadedUrl || isUploading || generateMutation.isPending || balance < 20}
        onClick={handleGenerate}
      >
        {generateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        Generate Model (20 credits)
      </Button>
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
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Describe the model you want to create. Our AI will generate a professional studio portrait.
      </p>

      {/* Essentials */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Gender</Label>
          <ChipSelect options={['Female', 'Male']} value={gender} onChange={setGender} />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Age — {age[0]}</Label>
          <Slider min={4} max={70} step={1} value={age} onValueChange={setAge} />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>4</span><span>18</span><span>35</span><span>50</span><span>70</span>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ethnicity</Label>
          <ChipSelect options={['Caucasian', 'Asian', 'African', 'Hispanic', 'Middle Eastern', 'South Asian', 'Mixed']} value={ethnicity} onChange={setEthnicity} />
        </div>
      </div>

      {/* Details collapsible */}
      <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
        <CollapsibleTrigger asChild>
          <button type="button" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full">
            <ChevronDown className={cn('h-4 w-4 transition-transform', detailsOpen && 'rotate-180')} />
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

      <Button className="w-full gap-2" disabled={generating || balance < 20} onClick={handleGenerate}>
        {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
        Generate Model (20 credits)
      </Button>
    </div>
  );
}

/* ── Model card ── */
function ModelCard({ model, onDelete }: { model: any; onDelete: (id: string) => void }) {
  return (
    <Card className="overflow-hidden group">
      <div className="aspect-[3/4] relative bg-muted">
        <img src={model.image_url} alt={model.name} className="w-full h-full object-cover" />
        <button
          type="button"
          onClick={() => onDelete(model.id)}
          className="absolute top-2 right-2 bg-background/80 backdrop-blur rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </button>
        <Badge className="absolute bottom-2 left-2 bg-background/80 backdrop-blur text-xs">My Model</Badge>
      </div>
      <div className="p-3 space-y-1">
        <p className="font-medium text-sm truncate">{model.name}</p>
        <div className="flex flex-wrap gap-1">
          {model.gender && <Badge variant="outline" className="text-[10px]">{model.gender}</Badge>}
          {model.ethnicity && <Badge variant="outline" className="text-[10px]">{model.ethnicity}</Badge>}
          {model.age_range && <Badge variant="outline" className="text-[10px]">{model.age_range}</Badge>}
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
      <PageHeader title="Brand Models" subtitle="Create and manage your custom AI models" />

      {!isPaid ? (
        <UpgradeHero />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">
          {/* Creation panel */}
          <Card className="p-5 h-fit">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Create New Model
            </h3>
            <Tabs defaultValue="reference" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="reference" className="flex-1 gap-1.5">
                  <Camera className="h-3.5 w-3.5" /> Reference
                </TabsTrigger>
                <TabsTrigger value="generator" className="flex-1 gap-1.5">
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
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" /> My Models
              {models.length > 0 && <Badge variant="secondary" className="text-xs">{models.length}</Badge>}
            </h3>
            {models.length === 0 ? (
              <Card className="p-10 flex flex-col items-center gap-3 text-center">
                <Users className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No models yet. Create your first one!</p>
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
