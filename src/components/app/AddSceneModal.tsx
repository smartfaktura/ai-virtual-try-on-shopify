import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAddCustomScene } from '@/hooks/useCustomScenes';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  'studio', 'lifestyle', 'editorial', 'streetwear', 'clean-studio',
  'surface', 'flat-lay', 'kitchen', 'living-space', 'bathroom', 'botanical',
];

interface AddSceneModalProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
}

export function AddSceneModal({ open, onClose, imageUrl }: AddSceneModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('lifestyle');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const addScene = useAddCustomScene();

  useEffect(() => {
    if (open && imageUrl) {
      analyzeImage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, imageUrl]);

  const analyzeImage = async () => {
    setIsAnalyzing(true);
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-scene-from-image`, {
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
      setDescription(data.description || '');
      if (CATEGORIES.includes(data.category)) setCategory(data.category);
    } catch {
      toast.error('AI analysis failed — fill in manually');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    try {
      await addScene.mutateAsync({ name, description, category, image_url: imageUrl });
      toast.success('Scene added for all users');
      onClose();
    } catch {
      toast.error('Failed to save scene');
    }
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[300] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-lg bg-background rounded-2xl shadow-2xl border border-border/30 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border/20">
          <h3 className="text-lg font-semibold">Add as Scene</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Preview */}
          <div className="flex gap-4">
            <img src={imageUrl} alt="Scene preview" className="w-28 h-28 rounded-xl object-cover border border-border/30" />
            <div className="flex-1 space-y-3">
              {isAnalyzing ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <Sparkles className="w-4 h-4 text-primary/60" />
                  AI analyzing scene…
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1 block">Name</label>
                    <Input value={name} onChange={e => setName(e.target.value)} placeholder="Scene name" className="h-9 text-sm" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1 block">Description</label>
                    <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description" className="h-9 text-sm" />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Category */}
          {!isAnalyzing && (
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2 block">Category</label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={cn(
                      'px-3 py-1 rounded-full text-[11px] font-medium transition-colors',
                      category === cat
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 p-5 border-t border-border/20">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSave} disabled={isAnalyzing || addScene.isPending} className="flex-1">
            {addScene.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Add Scene
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
