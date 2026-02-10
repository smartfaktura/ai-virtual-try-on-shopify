import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAddCustomModel } from '@/hooks/useCustomModels';
import { cn } from '@/lib/utils';

const GENDERS = ['female', 'male'];
const BODY_TYPES = ['slim', 'athletic', 'average', 'plus-size'];
const AGE_RANGES = ['young-adult', 'adult', 'mature'];

interface AddModelModalProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
}

export function AddModelModal({ open, onClose, imageUrl }: AddModelModalProps) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('female');
  const [bodyType, setBodyType] = useState('average');
  const [ethnicity, setEthnicity] = useState('');
  const [ageRange, setAgeRange] = useState('adult');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const addModel = useAddCustomModel();

  useEffect(() => {
    if (open && imageUrl) analyzeImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, imageUrl]);

  const analyzeImage = async () => {
    setIsAnalyzing(true);
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-model-from-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ imageUrl }),
      });
      if (!resp.ok) throw new Error('Analysis failed');
      const data = await resp.json();
      setName(data.name || '');
      if (GENDERS.includes(data.gender)) setGender(data.gender);
      if (BODY_TYPES.includes(data.body_type)) setBodyType(data.body_type);
      setEthnicity(data.ethnicity || '');
      if (AGE_RANGES.includes(data.age_range)) setAgeRange(data.age_range);
    } catch {
      toast.error('AI analysis failed — fill in manually');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    try {
      await addModel.mutateAsync({ name, gender, body_type: bodyType, ethnicity, age_range: ageRange, image_url: imageUrl });
      toast.success('Model added for all users');
      onClose();
    } catch {
      toast.error('Failed to save model');
    }
  };

  if (!open) return null;

  const chipRow = (label: string, options: string[], value: string, onChange: (v: string) => void) => (
    <div>
      <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1.5 block">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={cn(
              'px-3 py-1 rounded-full text-[11px] font-medium transition-colors capitalize',
              value === opt ? 'bg-primary text-primary-foreground' : 'bg-muted/60 text-muted-foreground hover:bg-muted'
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  return createPortal(
    <div className="fixed inset-0 z-[300] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-lg bg-background rounded-2xl shadow-2xl border border-border/30 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border/20">
          <h3 className="text-lg font-semibold">Add as Model</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex gap-4">
            <img src={imageUrl} alt="Model preview" className="w-28 h-36 rounded-xl object-cover border border-border/30" />
            <div className="flex-1 space-y-3">
              {isAnalyzing ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-6">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <Sparkles className="w-4 h-4 text-primary/60" />
                  AI analyzing model…
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1 block">Name</label>
                    <Input value={name} onChange={e => setName(e.target.value)} placeholder="Model name" className="h-9 text-sm" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1 block">Ethnicity</label>
                    <Input value={ethnicity} onChange={e => setEthnicity(e.target.value)} placeholder="e.g. Caucasian" className="h-9 text-sm" />
                  </div>
                </>
              )}
            </div>
          </div>

          {!isAnalyzing && (
            <div className="space-y-3">
              {chipRow('Gender', GENDERS, gender, setGender)}
              {chipRow('Body Type', BODY_TYPES, bodyType, setBodyType)}
              {chipRow('Age Range', AGE_RANGES, ageRange, setAgeRange)}
            </div>
          )}
        </div>

        <div className="flex gap-2 p-5 border-t border-border/20">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSave} disabled={isAnalyzing || addModel.isPending} className="flex-1">
            {addModel.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Add Model
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
