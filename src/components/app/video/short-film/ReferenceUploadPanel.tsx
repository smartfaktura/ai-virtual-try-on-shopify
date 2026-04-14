import { useState, useCallback, useMemo } from 'react';
import { Upload, X, Image as ImageIcon, Users, MapPin, Palette, Library, Loader2, Package, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useCustomModels } from '@/hooks/useCustomModels';
import { useUserModels } from '@/hooks/useUserModels';
import { useModelSortOrder } from '@/hooks/useModelSortOrder';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { mockModels } from '@/data/mockData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { ModelSelectorCard } from '@/components/app/ModelSelectorCard';
import { Skeleton } from '@/components/ui/skeleton';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import type { ModelProfile } from '@/types';

export interface ReferenceAsset {
  id: string;
  url: string;
  role: 'product' | 'scene' | 'model' | 'style' | 'logo';
  name?: string;
}

interface ReferenceUploadPanelProps {
  references: ReferenceAsset[];
  onChange: (refs: ReferenceAsset[]) => void;
}

const SECTIONS = [
  { role: 'product' as const, label: 'Product References', icon: Package, description: 'Upload hero product images for consistent appearance.', libraryType: 'product' as const },
  { role: 'scene' as const, label: 'Scene References', icon: MapPin, description: 'Add environment or location references.', libraryType: 'scene' as const },
  { role: 'model' as const, label: 'Model / Character', icon: Users, description: 'Optional — add character reference images.', libraryType: 'model' as const },
  { role: 'style' as const, label: 'Style / Mood', icon: Palette, description: 'Upload visual tone or mood references.', libraryType: 'style' as const },
  { role: 'logo' as const, label: 'Logo / End Frame', icon: ImageIcon, description: 'Optional — logo for the closing shot.', libraryType: null },
];

const PAGE_SIZE = 24;

export function ReferenceUploadPanel({ references, onChange }: ReferenceUploadPanelProps) {
  const [dragRole, setDragRole] = useState<string | null>(null);
  const [uploadingRole, setUploadingRole] = useState<string | null>(null);
  const [modelPickerOpen, setModelPickerOpen] = useState(false);
  const [scenePickerOpen, setScenePickerOpen] = useState(false);
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [stylePickerOpen, setStylePickerOpen] = useState(false);

  // Search state per picker
  const [modelSearch, setModelSearch] = useState('');
  const [sceneSearch, setSceneSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');

  // Visible count per picker (load-more)
  const [modelVisible, setModelVisible] = useState(PAGE_SIZE);
  const [sceneVisible, setSceneVisible] = useState(PAGE_SIZE);
  const [productVisible, setProductVisible] = useState(PAGE_SIZE);

  const { upload, isUploading } = useFileUpload();
  const { user } = useAuth();

  // --- Model sources (on-demand: only fetch when dialog opens) ---
  const { asProfiles: customModelProfiles, isLoading: customModelsLoading } = useCustomModels({ enabled: modelPickerOpen });
  const { asProfiles: userModelProfiles, isLoading: userModelsLoading } = useUserModels({ enabled: modelPickerOpen });
  const {
    sortModels, applyOverrides, applyNameOverrides, filterHidden,
    isLoading: sortLoading,
  } = useModelSortOrder();

  const allModels = useMemo(() => {
    if (!modelPickerOpen) return [];
    const merged: ModelProfile[] = [...mockModels, ...customModelProfiles, ...userModelProfiles];
    return sortModels(filterHidden(applyNameOverrides(applyOverrides(merged))));
  }, [modelPickerOpen, customModelProfiles, userModelProfiles, sortModels, filterHidden, applyNameOverrides, applyOverrides]);

  const modelsLoading = modelPickerOpen && (customModelsLoading || userModelsLoading || sortLoading);

  const filteredModels = useMemo(() => {
    if (!modelSearch.trim()) return allModels;
    const q = modelSearch.toLowerCase();
    return allModels.filter(m => m.name.toLowerCase().includes(q));
  }, [allModels, modelSearch]);

  // --- Style / Mood presets ---
  const STYLE_MOOD_PRESETS = useMemo(() => [
    { id: 'sm-1', title: 'Cinematic Noir', keywords: 'Deep blacks, high contrast, chiaroscuro lighting, film noir shadows, moody desaturated palette' },
    { id: 'sm-2', title: 'Golden Hour Warmth', keywords: 'Warm amber tones, long soft shadows, golden backlight, sun-kissed skin, dreamy lens flare' },
    { id: 'sm-3', title: 'Ethereal Soft Focus', keywords: 'Soft diffusion filter, pastel tones, dreamy bokeh, luminous highlights, gentle haze' },
    { id: 'sm-4', title: 'Bold & Saturated', keywords: 'Vivid punchy colors, high saturation, strong contrast, dynamic energy, editorial pop' },
    { id: 'sm-5', title: 'Monochrome Elegance', keywords: 'Black and white, fine grain, rich tonal range, timeless classic photography feel' },
    { id: 'sm-6', title: 'Neon Cyberpunk', keywords: 'Vibrant neon blues and magentas, dark environment, futuristic glow, reflective wet surfaces' },
    { id: 'sm-7', title: 'Vintage Film Stock', keywords: 'Warm muted tones, analog grain, faded highlights, 70s film aesthetic, nostalgic color shift' },
    { id: 'sm-8', title: 'Clean Luxury', keywords: 'Pristine whites, soft even lighting, premium minimalist feel, subtle warm undertones' },
    { id: 'sm-9', title: 'Dramatic Chiaroscuro', keywords: 'Rembrandt lighting, deep rich shadows, single key light, painterly contrast, fine art feel' },
    { id: 'sm-10', title: 'Natural Documentary', keywords: 'Available light, authentic grain, handheld intimacy, realistic color, raw unpolished beauty' },
  ], []);

  // --- Video-optimized scene presets (text-described, no images) ---
  const VIDEO_SCENE_PRESETS = useMemo(() => [
    { id: 'vs-1', title: 'Minimalist Studio', description: 'Clean white studio with soft directional shadows and subtle gradient backdrop.', mood: 'premium' },
    { id: 'vs-2', title: 'Golden Hour Terrace', description: 'Warm golden sunset light on an outdoor stone terrace with blurred cityscape.', mood: 'luxury' },
    { id: 'vs-3', title: 'Dark Moody Editorial', description: 'Deep black background with dramatic side lighting and soft reflections.', mood: 'editorial' },
    { id: 'vs-4', title: 'Natural Linen Surface', description: 'Neutral linen fabric surface with soft natural window light and gentle shadows.', mood: 'minimal' },
    { id: 'vs-5', title: 'Urban Concrete', description: 'Raw concrete surface and walls with industrial textures and cool diffused light.', mood: 'energetic' },
    { id: 'vs-6', title: 'Botanical Garden', description: 'Lush greenery with dappled sunlight filtering through tropical leaves.', mood: 'organic' },
    { id: 'vs-7', title: 'Marble & Gold', description: 'White marble surface with gold accents, soft studio lighting, premium feel.', mood: 'luxury' },
    { id: 'vs-8', title: 'Coastal Breeze', description: 'Sandy beach tones with ocean blues, soft morning light and gentle movement.', mood: 'lifestyle' },
    { id: 'vs-9', title: 'Neon Night', description: 'Dark environment with vibrant neon color accents and cinematic light flares.', mood: 'energetic' },
    { id: 'vs-10', title: 'Warm Interior', description: 'Cozy interior space with warm lamp light, wood textures and soft furnishings.', mood: 'emotional' },
    { id: 'vs-11', title: 'Misty Forest', description: 'Ethereal forest with morning mist, diffused cool light and organic textures.', mood: 'atmospheric' },
    { id: 'vs-12', title: 'Clean Gradient', description: 'Smooth color gradient backdrop transitioning from light to dark, studio lit.', mood: 'clean' },
  ], []);

  const filteredScenes = useMemo(() => {
    if (!sceneSearch.trim()) return VIDEO_SCENE_PRESETS;
    const q = sceneSearch.toLowerCase();
    return VIDEO_SCENE_PRESETS.filter(s => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
  }, [VIDEO_SCENE_PRESETS, sceneSearch]);

  // --- User products (on-demand, paginated) ---
  const { data: userProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['user-products-ref-picker', user?.id],
    queryFn: async () => {
      // Fetch all products in pages of 500 to avoid 1000-row cap
      let all: { id: string; title: string; image_url: string }[] = [];
      let from = 0;
      const batchSize = 500;
      while (true) {
        const { data, error } = await supabase
          .from('user_products')
          .select('id, title, image_url')
          .order('created_at', { ascending: false })
          .range(from, from + batchSize - 1);
        if (error) throw error;
        if (!data || data.length === 0) break;
        all = all.concat(data as { id: string; title: string; image_url: string }[]);
        if (data.length < batchSize) break;
        from += batchSize;
      }
      return all;
    },
    enabled: !!user && productPickerOpen,
    staleTime: 60_000,
  });

  const filteredProducts = useMemo(() => {
    if (!userProducts) return [];
    if (!productSearch.trim()) return userProducts;
    const q = productSearch.toLowerCase();
    return userProducts.filter(p => p.title.toLowerCase().includes(q));
  }, [userProducts, productSearch]);

  // Reset search + visible count when dialogs open/close
  const openModelPicker = useCallback(() => {
    setModelSearch('');
    setModelVisible(PAGE_SIZE);
    setModelPickerOpen(true);
  }, []);
  const openScenePicker = useCallback(() => {
    setSceneSearch('');
    setSceneVisible(PAGE_SIZE);
    setScenePickerOpen(true);
  }, []);
  const openProductPicker = useCallback(() => {
    setProductSearch('');
    setProductVisible(PAGE_SIZE);
    setProductPickerOpen(true);
  }, []);

  const handleFileUpload = useCallback(
    async (role: ReferenceAsset['role'], files: FileList | null) => {
      if (!files || files.length === 0) return;
      setUploadingRole(role);

      const newRefs: ReferenceAsset[] = [];
      for (const file of Array.from(files)) {
        const url = await upload(file);
        if (url) {
          newRefs.push({ id: crypto.randomUUID(), url, role, name: file.name });
        }
      }
      if (newRefs.length > 0) onChange([...references, ...newRefs]);
      setUploadingRole(null);
    },
    [references, onChange, upload]
  );

  const pickModel = useCallback(
    (model: ModelProfile) => {
      onChange([...references, { id: crypto.randomUUID(), url: model.previewUrl, role: 'model', name: model.name }]);
      setModelPickerOpen(false);
    },
    [references, onChange]
  );

  const pickScene = useCallback(
    (scene: { id: string; title: string; description?: string }) => {
      // Text-described scenes don't have image URLs — store description as name
      onChange([...references, { id: crypto.randomUUID(), url: '', role: 'scene', name: `${scene.title}: ${scene.description || ''}` }]);
      setScenePickerOpen(false);
    },
    [references, onChange]
  );

  const pickProduct = useCallback(
    (product: { id: string; title: string; image_url: string }) => {
      onChange([...references, { id: crypto.randomUUID(), url: product.image_url, role: 'product', name: product.title }]);
      setProductPickerOpen(false);
    },
    [references, onChange]
  );

  const removeRef = useCallback(
    (id: string) => onChange(references.filter((r) => r.id !== id)),
    [references, onChange]
  );

  const pickStyle = useCallback(
    (preset: { id: string; title: string; keywords: string }) => {
      onChange([...references, { id: crypto.randomUUID(), url: '', role: 'style', name: `${preset.title}: ${preset.keywords}` }]);
      setStylePickerOpen(false);
    },
    [references, onChange]
  );

  const openLibrary = (type: 'model' | 'scene' | 'product' | 'style') => {
    if (type === 'model') openModelPicker();
    else if (type === 'scene') openScenePicker();
    else if (type === 'product') openProductPicker();
    else if (type === 'style') setStylePickerOpen(true);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Add References</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Upload product shots, scene references, model photos, and style inspiration.
        </p>
      </div>

      <div className="space-y-3">
        {SECTIONS.map((section) => {
          const sectionRefs = references.filter((r) => r.role === section.role);
          const Icon = section.icon;
          const isSectionUploading = uploadingRole === section.role && isUploading;

          return (
            <div key={section.role} className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{section.label}</p>
                  <p className="text-xs text-muted-foreground">{section.description}</p>
                </div>
                {section.libraryType && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs shrink-0 focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => openLibrary(section.libraryType!)}
                  >
                    <Library className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Library</span>
                  </Button>
                )}
              </div>

              {sectionRefs.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {sectionRefs.map((ref) => (
                    <div key={ref.id} className="relative group">
                      {ref.url ? (
                        <img
                          src={getOptimizedUrl(ref.url, { quality: 70 })}
                          alt={ref.name || section.label}
                          className={`rounded-lg border border-border loading="lazy" ${
                            section.role === 'product'
                              ? 'h-16 w-16 object-contain bg-white'
                              : section.role === 'model'
                              ? 'w-12 aspect-[3/4] object-cover bg-muted/30'
                              : 'h-16 w-16 object-cover bg-muted/30'
                          }`}
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-lg bg-muted/30 border border-border flex items-center justify-center">
                          {ref.role === 'style' ? <Palette className="h-4 w-4 text-primary" /> : <MapPin className="h-4 w-4 text-muted-foreground" />}
                        </div>
                      )}
                      <button
                        onClick={() => removeRef(ref.id)}
                        className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity focus-visible:ring-2 focus-visible:ring-ring focus-visible:opacity-100"
                        aria-label={`Remove ${ref.name || 'reference'}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {ref.name && (
                        <p className={`text-[9px] text-muted-foreground text-center truncate mt-0.5 ${section.role === 'model' ? 'w-12' : 'w-16'}`}>{ref.name}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <label
                className={cn(
                  'flex items-center justify-center gap-2 rounded-lg border-2 border-dashed p-3 cursor-pointer transition-colors',
                  isSectionUploading && 'pointer-events-none opacity-60',
                  dragRole === section.role
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40 hover:bg-muted/30'
                )}
                onDragOver={(e) => { e.preventDefault(); setDragRole(section.role); }}
                onDragLeave={() => setDragRole(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragRole(null);
                  handleFileUpload(section.role, e.dataTransfer.files);
                }}
              >
                {isSectionUploading ? (
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-xs text-muted-foreground">
                  {isSectionUploading ? 'Uploading...' : (
                    <>Drop images or <span className="text-primary font-medium">browse</span></>
                  )}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(e) => handleFileUpload(section.role, e.target.files)}
                  disabled={isSectionUploading}
                />
              </label>
            </div>
          );
        })}
      </div>

      {/* Model Library Picker */}
      <PickerDialog
        open={modelPickerOpen}
        onOpenChange={setModelPickerOpen}
        title="Pick from Model Library"
        search={modelSearch}
        onSearch={setModelSearch}
        loading={modelsLoading}
        items={filteredModels}
        visibleCount={modelVisible}
        onLoadMore={() => setModelVisible(v => v + PAGE_SIZE)}
        renderItem={(m) => (
          <ModelSelectorCard
            key={m.modelId}
            model={m}
            isSelected={false}
            onSelect={() => pickModel(m)}
          />
        )}
        emptyText="No models available yet."
      />

      {/* Scene Presets Picker — text-described for video */}
      <Dialog open={scenePickerOpen} onOpenChange={setScenePickerOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] flex flex-col" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Choose Scene Environment</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search scenes..."
              value={sceneSearch}
              onChange={(e) => setSceneSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <div className="flex-1 overflow-y-auto min-h-0 -mx-6 px-6">
            {filteredScenes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">No scenes match your search.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
                {filteredScenes.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => pickScene(s)}
                    className="rounded-lg border border-border hover:border-primary/50 p-3 text-left transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <p className="text-sm font-medium text-foreground">{s.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
                    <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{s.mood}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Style / Mood Picker */}
      <Dialog open={stylePickerOpen} onOpenChange={setStylePickerOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] flex flex-col" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Choose Style / Mood</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto min-h-0 -mx-6 px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
              {STYLE_MOOD_PRESETS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => pickStyle(s)}
                  className="rounded-lg border border-border hover:border-primary/50 p-3 text-left transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none space-y-1"
                >
                  <div className="flex items-center gap-2">
                    <Palette className="h-3.5 w-3.5 text-primary shrink-0" />
                    <p className="text-sm font-medium text-foreground">{s.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.keywords}</p>
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Library Picker */}
      <PickerDialog
        open={productPickerOpen}
        onOpenChange={setProductPickerOpen}
        title="Pick from Products"
        search={productSearch}
        onSearch={setProductSearch}
        loading={productsLoading && productPickerOpen}
        items={filteredProducts}
        visibleCount={productVisible}
        onLoadMore={() => setProductVisible(v => v + PAGE_SIZE)}
        renderItem={(p) => (
          <button
            key={p.id}
            onClick={() => pickProduct(p)}
            className="rounded-lg border border-border hover:border-primary/50 overflow-hidden transition-all text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <div className="aspect-square bg-white rounded-t-lg overflow-hidden">
              <ShimmerImage
                src={getOptimizedUrl(p.image_url, { quality: 70 })}
                alt={p.title}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-xs font-medium text-foreground p-2 truncate">{p.title}</p>
          </button>
        )}
        emptyText="No products yet. Add products in your product library first."
      />
    </div>
  );
}

/* ─── Generic picker dialog with search + load-more ─── */
interface PickerDialogProps<T> {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  search: string;
  onSearch: (v: string) => void;
  loading: boolean;
  items: T[];
  visibleCount: number;
  onLoadMore: () => void;
  renderItem: (item: T) => React.ReactNode;
  emptyText: string;
  maxWidth?: string;
}

function PickerDialog<T>({
  open, onOpenChange, title, search, onSearch,
  loading, items, visibleCount, onLoadMore,
  renderItem, emptyText, maxWidth = 'max-w-md',
}: PickerDialogProps<T>) {
  const visible = items.slice(0, visibleCount);
  const hasMore = items.length > visibleCount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(maxWidth, 'max-h-[85vh] flex flex-col')} aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto min-h-0 -mx-6 px-6">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">{emptyText}</p>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-2">
                {visible.map(renderItem)}
              </div>
              {hasMore && (
                <div className="flex justify-center py-3">
                  <button
                    onClick={onLoadMore}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Load more ({items.length - visibleCount} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
