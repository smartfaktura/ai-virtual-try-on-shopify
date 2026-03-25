import { useState, useEffect, useCallback } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Upload, Loader2, Sparkles, User, Package, ArrowLeft, Plus, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useAddCustomScene } from '@/hooks/useCustomScenes';
import { useFileUpload } from '@/hooks/useFileUpload';
import { supabase } from '@/integrations/supabase/client';
import { poseCategoryLabels } from '@/data/mockData';
import { cn } from '@/lib/utils';

type SceneType = 'on-model' | 'product';

const CATEGORIES_BY_TYPE: Record<SceneType, string[]> = {
  'on-model': ['studio', 'lifestyle', 'editorial', 'streetwear'],
  product: ['clean-studio', 'surface', 'flat-lay', 'product-editorial'],
};

export default function AdminSceneUpload() {
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();
  const addScene = useAddCustomScene();
  const { upload, isUploading } = useFileUpload();

  const [imageUrl, setImageUrl] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [promptHint, setPromptHint] = useState('');
  const [promptOnly, setPromptOnly] = useState(false);
  const [sceneType, setSceneType] = useState<SceneType>('on-model');
  const [category, setCategory] = useState('studio');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [saved, setSaved] = useState(false);

  // Reset category when scene type changes
  useEffect(() => {
    const cats = CATEGORIES_BY_TYPE[sceneType];
    if (!cats.includes(category)) {
      setCategory(cats[0]);
    }
  }, [sceneType, category]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) await handleFile(file);
  }, []);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await handleFile(file);
  }, []);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    const url = await upload(file);
    if (url) {
      setImageUrl(url);
      setSaved(false);
      analyzeImage(url);
    }
  };

  const analyzeImage = async (url: string) => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-scene-from-image', {
        body: { imageUrl: url },
      });
      if (error) throw error;
      setName(data.name || '');
      setDescription(data.description || '');
      if (data.promptHint || data.prompt_hint) {
        setPromptHint(data.promptHint || data.prompt_hint || '');
      }
      const allCats = [...CATEGORIES_BY_TYPE['on-model'], ...CATEGORIES_BY_TYPE.product];
      if (allCats.includes(data.category)) {
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
    if (!imageUrl) { toast.error('Upload an image first'); return; }
    try {
      await addScene.mutateAsync({
        name,
        description,
        category,
        image_url: imageUrl,
        prompt_hint: promptHint,
        prompt_only: promptOnly,
      });
      toast.success('Scene added successfully');
      setSaved(true);
    } catch {
      toast.error('Failed to save scene');
    }
  };

  const handleAddAnother = () => {
    setImageUrl('');
    setName('');
    setDescription('');
    setPromptHint('');
    setPromptOnly(false);
    setSceneType('on-model');
    setCategory('studio');
    setSaved(false);
  };

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/app" replace />;

  const visibleCategories = CATEGORIES_BY_TYPE[sceneType];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/app/admin/scenes">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-lg font-semibold">Add New Scene</h1>
          <p className="text-xs text-muted-foreground">Upload an image and configure how it behaves during generation</p>
        </div>
      </div>

      {/* Upload Area */}
      {!imageUrl ? (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          className="relative border-2 border-dashed border-border/60 rounded-2xl p-12 text-center hover:border-primary/40 transition-colors cursor-pointer"
          onClick={() => document.getElementById('scene-file-input')?.click()}
        >
          <input
            id="scene-file-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileInput}
          />
          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Uploading…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center">
                <Upload className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Drop an image here or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP — high quality recommended</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {/* Preview + AI status */}
          <div className="flex gap-5">
            <div className="relative w-36 h-36 rounded-xl overflow-hidden border border-border/30 flex-shrink-0">
              <img src={imageUrl} alt="Scene preview" className="w-full h-full object-cover" />
              {isAnalyzing && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <Sparkles className="w-4 h-4 text-primary/60" />
                    Analyzing…
                  </div>
                </div>
              )}
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1 block">Name</label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Urban Alley" className="h-9 text-sm" disabled={isAnalyzing} />
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1 block">Description <span className="text-muted-foreground/40">(shown to users)</span></label>
                <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description for UI" className="h-9 text-sm" disabled={isAnalyzing} />
              </div>
            </div>
          </div>

          {/* Prompt Hint */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1 block">
              Prompt Hint <span className="text-muted-foreground/40">(sent to AI alongside image reference)</span>
            </label>
            <Textarea
              value={promptHint}
              onChange={e => setPromptHint(e.target.value)}
              placeholder="Detailed instructions for AI — lighting, mood, environment details…"
              className="min-h-[80px] text-sm"
              disabled={isAnalyzing}
            />
            <p className="text-[10px] text-muted-foreground/50 mt-1">
              This text guides the AI's interpretation of the scene. Falls back to Description if empty.
            </p>
          </div>

          {/* Prompt Only Toggle */}
          <div className="flex items-start gap-3 p-3 rounded-xl border border-border/30 bg-muted/20">
            <Switch
              checked={promptOnly}
              onCheckedChange={setPromptOnly}
              disabled={isAnalyzing}
            />
            <div>
              <p className="text-sm font-medium">Prompt Only Mode</p>
              <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
                Don't send image to AI — use only the prompt text for generation.
                Use for solid colors or abstract backgrounds (like White Studio).
                The image will still be shown in the UI as a visual preview.
              </p>
            </div>
          </div>

          {/* Scene Type Toggle */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2 block">Scene Type</label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { key: 'on-model' as SceneType, label: 'On-Model', icon: User, desc: 'Fashion & people' },
                { key: 'product' as SceneType, label: 'Product', icon: Package, desc: 'Product photography' },
              ]).map(({ key, label, icon: Icon, desc }) => (
                <button
                  key={key}
                  onClick={() => setSceneType(key)}
                  disabled={isAnalyzing}
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

          {/* Category Chips */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2 block">Category</label>
            <div className="flex flex-wrap gap-1.5">
              {visibleCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  disabled={isAnalyzing}
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

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {saved ? (
              <>
                <Button onClick={handleAddAnother} className="flex-1 gap-2">
                  <Plus className="w-4 h-4" />
                  Add Another
                </Button>
                <Link to="/app/admin/scenes" className="flex-1">
                  <Button variant="outline" className="w-full">Back to Scene Manager</Button>
                </Link>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleAddAnother} className="flex-1">Reset</Button>
                <Button onClick={handleSave} disabled={isAnalyzing || addScene.isPending || !imageUrl} className="flex-1">
                  {addScene.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ImageIcon className="w-4 h-4 mr-2" />}
                  Save Scene
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
