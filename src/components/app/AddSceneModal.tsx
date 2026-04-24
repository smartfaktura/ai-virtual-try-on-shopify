import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, Sparkles, User, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/lib/brandedToast';
import { useAddCustomScene } from '@/hooks/useCustomScenes';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { poseCategoryLabels } from '@/data/mockData';
import { PRODUCT_CATEGORIES } from '@/lib/categoryConstants';
import { getOptimizedUrl } from '@/lib/imageOptimization';

type SceneType = 'on-model' | 'product';

const CATEGORIES_BY_TYPE: Record<SceneType, string[]> = {
  'on-model': ['studio', 'lifestyle', 'editorial', 'streetwear'],
  product: ['clean-studio', 'surface', 'flat-lay', 'product-editorial'],
};

interface AddSceneModalProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  sourcePrompt?: string;
}

export function AddSceneModal({ open, onClose, imageUrl, sourcePrompt }: AddSceneModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [promptHint, setPromptHint] = useState('');
  const [promptOnly, setPromptOnly] = useState(true);
  const [sceneType, setSceneType] = useState<SceneType>('on-model');
  const [category, setCategory] = useState('studio');
  const [discoverCategories, setDiscoverCategories] = useState<string[]>(['fashion']);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const addScene = useAddCustomScene();

  useEffect(() => {
    if (open && imageUrl) {
      if (sourcePrompt) setPromptHint(sourcePrompt);
      analyzeImage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, imageUrl]);

  // Reset category when scene type changes
  useEffect(() => {
    const cats = CATEGORIES_BY_TYPE[sceneType];
    if (!cats.includes(category)) {
      setCategory(cats[0]);
    }
  }, [sceneType, category]);

  const analyzeImage = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-scene-from-image', {
        body: { imageUrl },
      });
      if (error) throw error;
      setName(data.name || '');
      setDescription(data.description || '');
      setPromptHint(sourcePrompt || data.description || '');
      const allCats = [...CATEGORIES_BY_TYPE['on-model'], ...CATEGORIES_BY_TYPE.product];
      if (allCats.includes(data.category)) {
        // Auto-detect scene type from returned category
        if (CATEGORIES_BY_TYPE.product.includes(data.category)) {
          setSceneType('product');
        } else {
          setSceneType('on-model');
        }
        setCategory(data.category);
      }
    } catch {
      toast.error('AI analysis failed — fill in manually');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    // Auto-fill prompt hint from description or name if empty
    let finalPromptHint = promptHint.trim();
    if (!finalPromptHint && description.trim()) {
      finalPromptHint = description.trim();
    }
    if (!finalPromptHint) {
      finalPromptHint = `Place the product in a ${name.trim()} environment, styled as ${category} photography`;
    }
    if (promptOnly && !finalPromptHint) {
      toast.error('Prompt-only scenes require a prompt hint');
      return;
    }
    try {
      // Use the first selected discover category as the scene's primary category for Discover filtering
      const discoverCategory = discoverCategories.length > 0 ? discoverCategories[0] : category;
      await addScene.mutateAsync({ name, description, category: discoverCategory, image_url: imageUrl, prompt_hint: finalPromptHint, prompt_only: promptOnly, discover_categories: discoverCategories });
      toast.success('Scene added for all users');
      onClose();
    } catch {
      toast.error('Failed to save scene');
    }
  };

  if (!open) return null;

  const visibleCategories = CATEGORIES_BY_TYPE[sceneType];

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
          {/* Preview + fields */}
          <div className="flex gap-4">
            <img src={getOptimizedUrl(imageUrl, { quality: 70 })} alt="Scene preview" loading="lazy" className="w-28 h-28 rounded-xl object-cover border border-border/30" />
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
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1 block">Prompt Hint <span className="text-muted-foreground/40">(AI-facing)</span></label>
                    <Textarea value={promptHint} onChange={e => setPromptHint(e.target.value)} placeholder="Detailed AI instructions…" className="min-h-[60px] text-sm" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={promptOnly} onCheckedChange={setPromptOnly} />
                    <span className="text-[10px] text-muted-foreground">Prompt Only (no image reference)</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Scene Type Toggle */}
          {!isAnalyzing && (
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2 block">Freestyle Scene Type</label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { key: 'on-model' as SceneType, label: 'On-Model', icon: User, desc: 'Fashion & people' },
                  { key: 'product' as SceneType, label: 'Product', icon: Package, desc: 'Product photography' },
                ]).map(({ key, label, icon: Icon, desc }) => (
                  <button
                    key={key}
                    onClick={() => setSceneType(key)}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left',
                      sceneType === key
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                        : 'border-border/40 hover:border-border bg-muted/30'
                    )}
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center',
                      sceneType === key ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={cn('text-sm font-medium', sceneType === key ? 'text-foreground' : 'text-muted-foreground')}>{label}</p>
                      <p className="text-[10px] text-muted-foreground/60">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Freestyle Category */}
          {!isAnalyzing && (
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2 block">Freestyle Category</label>
              <div className="flex flex-wrap gap-1.5">
                {visibleCategories.map(cat => (
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
                    {poseCategoryLabels[cat] || cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Discover Category */}
          {!isAnalyzing && (
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2 block">Explore Category</label>
              <div className="flex flex-wrap gap-1.5">
              {PRODUCT_CATEGORIES.filter(cat => cat.id !== 'any').map(cat => {
                  const isSelected = discoverCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setDiscoverCategories(prev =>
                          isSelected
                            ? (prev.length > 1 ? prev.filter(c => c !== cat.id) : prev)
                            : [...prev, cat.id]
                        );
                      }}
                      className={cn(
                        'px-3 py-1 rounded-full text-[11px] font-medium transition-colors',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                      )}
                    >
                      {cat.label}
                    </button>
                  );
                })}
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
