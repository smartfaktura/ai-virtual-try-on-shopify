import { useState, useCallback, useMemo } from 'react';
import { Upload, X, Image as ImageIcon, Users, MapPin, Palette, Library, Loader2, Package, Search, Trash2, Plus, Check } from 'lucide-react';
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

export type ProductSubRole = 'main' | 'back' | 'side' | 'packaging' | 'inside' | 'texture' | 'extra';

export interface ReferenceAsset {
  id: string;
  url: string;
  role: 'product' | 'scene' | 'model' | 'style' | 'logo';
  name?: string;
  subRole?: ProductSubRole;
  productId?: string;
}

interface ReferenceUploadPanelProps {
  references: ReferenceAsset[];
  onChange: (refs: ReferenceAsset[]) => void;
}

const ANGLE_SLOTS: { subRole: ProductSubRole; label: string; dbField?: string }[] = [
  { subRole: 'main', label: 'Main' },
  { subRole: 'back', label: 'Back', dbField: 'back_image_url' },
  { subRole: 'side', label: 'Side', dbField: 'side_image_url' },
  { subRole: 'packaging', label: 'Packaging', dbField: 'packaging_image_url' },
  { subRole: 'inside', label: 'Inside', dbField: 'inside_image_url' },
  { subRole: 'texture', label: 'Texture', dbField: 'texture_image_url' },
];

const NON_PRODUCT_SECTIONS = [
  { role: 'scene' as const, label: 'Scene References', icon: MapPin, description: 'Add environment or location references.', libraryType: 'scene' as const },
  { role: 'model' as const, label: 'Model / Character', icon: Users, description: 'Optional — add character reference images.', libraryType: 'model' as const },
  { role: 'style' as const, label: 'Style / Mood', icon: Palette, description: 'Upload visual tone or mood references.', libraryType: 'style' as const },
  { role: 'logo' as const, label: 'Logo / End Frame', icon: ImageIcon, description: 'Optional — logo for the closing shot.', libraryType: null },
];

const PAGE_SIZE = 24;

interface FullProduct {
  id: string;
  title: string;
  image_url: string;
  back_image_url?: string | null;
  side_image_url?: string | null;
  packaging_image_url?: string | null;
  inside_image_url?: string | null;
  texture_image_url?: string | null;
  extra_image_urls?: string[];
}

export function ReferenceUploadPanel({ references, onChange }: ReferenceUploadPanelProps) {
  const [dragRole, setDragRole] = useState<string | null>(null);
  const [uploadingRole, setUploadingRole] = useState<string | null>(null);
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null); // productId:subRole
  const [modelPickerOpen, setModelPickerOpen] = useState(false);
  const [scenePickerOpen, setScenePickerOpen] = useState(false);
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [stylePickerOpen, setStylePickerOpen] = useState(false);

  const [modelSearch, setModelSearch] = useState('');
  const [sceneSearch, setSceneSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');

  const [modelVisible, setModelVisible] = useState(PAGE_SIZE);
  const [sceneVisible, setSceneVisible] = useState(PAGE_SIZE);
  const [productVisible, setProductVisible] = useState(PAGE_SIZE);

  const { upload, isUploading } = useFileUpload();
  const { user } = useAuth();

  // --- Model sources ---
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

  // --- Style presets (Kling 3.0 optimized) ---
  const STYLE_MOOD_PRESETS = useMemo(() => [
    { id: 'sm-1', title: 'Cinematic Noir', category: 'Cinematic', keywords: 'Deep blacks, chiaroscuro single key light, hard shadows on wet surfaces, film grain, desaturated palette' },
    { id: 'sm-2', title: 'Golden Hour Epic', category: 'Cinematic', keywords: 'Warm amber backlight, long soft shadows, golden rim highlights, anamorphic lens flare, shallow DOF' },
    { id: 'sm-3', title: 'Vintage Film Stock', category: 'Cinematic', keywords: 'Warm muted tones, analog 35mm grain, faded highlights, 70s Kodachrome color shift' },
    { id: 'sm-4', title: 'Monochrome Fine Art', category: 'Cinematic', keywords: 'Black and white, Rembrandt lighting, rich tonal range, skin pores visible, fine art feel' },
    { id: 'sm-5', title: 'Clean Luxury', category: 'Commercial', keywords: 'Pristine whites, soft even lighting, premium minimalist feel, subtle caustic reflections, macro detail' },
    { id: 'sm-6', title: 'Bold Editorial Pop', category: 'Commercial', keywords: 'Vivid punchy saturated colors, strong contrast, hard flash, dynamic energy, fashion editorial' },
    { id: 'sm-7', title: 'Soft Diffusion Glow', category: 'Commercial', keywords: 'Pastel tones, soft diffusion filter, dreamy bokeh, luminous highlights, gentle haze' },
    { id: 'sm-8', title: 'Neon Cyberpunk', category: 'Atmospheric', keywords: 'Vibrant neon blues and magentas, wet reflective surfaces, dark environment, volumetric haze' },
    { id: 'sm-9', title: 'Dramatic Chiaroscuro', category: 'Atmospheric', keywords: 'Single directional key light, deep rich shadows, painterly contrast, condensation on surfaces' },
    { id: 'sm-10', title: 'Ethereal Morning Mist', category: 'Atmospheric', keywords: 'Cool diffused light, visible breath in cold air, soft fog, desaturated greens' },
    { id: 'sm-11', title: 'Natural Documentary', category: 'Atmospheric', keywords: 'Available handheld light, authentic grain, realistic color, raw unpolished, skin texture visible' },
    { id: 'sm-12', title: 'Slow Motion Reveal', category: 'Motion', keywords: 'Time-stretched movement, fabric ripples, hair flowing, particles suspended, ultra-smooth 30fps' },
    { id: 'sm-13', title: 'Dynamic FPV Energy', category: 'Motion', keywords: 'Fast-paced drone perspective, motion blur on background, subject in sharp focus, high contrast' },
    { id: 'sm-14', title: 'Macro Texture Study', category: 'Motion', keywords: 'Extreme close-up, visible material fibers and pores, shallow DOF, studio ring light' },
    { id: 'sm-15', title: 'Liquid & Reflections', category: 'Motion', keywords: 'Refractive caustics, water droplets, chrome reflections, glass surfaces, wet textures' },
    { id: 'sm-16', title: 'Smoke & Atmosphere', category: 'Motion', keywords: 'Volumetric light rays through haze, floating particles, dramatic backlight, moody atmosphere' },
  ], []);

  // --- Scene presets (Kling 3.0 optimized) ---
  const VIDEO_SCENE_PRESETS = useMemo(() => [
    { id: 'vs-1', title: 'White Infinity Cove', category: 'Studio', description: 'Seamless white cyclorama, soft directional shadows, subtle gradient, clean product isolation', mood: 'premium' },
    { id: 'vs-2', title: 'Dark Editorial Studio', category: 'Studio', description: 'Deep matte black, dramatic single side light, soft reflections on floor, negative space', mood: 'editorial' },
    { id: 'vs-3', title: 'Marble & Gold Surface', category: 'Studio', description: 'White marble with gold veining, soft overhead studio light, refractive caustics on surface', mood: 'luxury' },
    { id: 'vs-4', title: 'Colored Gel Studio', category: 'Studio', description: 'Smooth color gradient backdrop, dual-color gel lighting, controlled shadows', mood: 'creative' },
    { id: 'vs-5', title: 'Golden Hour Terrace', category: 'Outdoor', description: 'Warm sunset light on stone terrace, blurred cityscape beyond, long shadows, warm atmospheric haze', mood: 'luxury' },
    { id: 'vs-6', title: 'Coastal Morning', category: 'Outdoor', description: 'Sandy beach tones, soft pre-dawn blue light, gentle ocean movement, sea mist, driftwood textures', mood: 'lifestyle' },
    { id: 'vs-7', title: 'Misty Forest Floor', category: 'Outdoor', description: 'Morning mist between moss-covered trees, dappled cool light filtering through canopy, organic debris', mood: 'atmospheric' },
    { id: 'vs-8', title: 'Rooftop at Dusk', category: 'Outdoor', description: 'Urban skyline, last light fading, warm string lights, concrete and metal textures, city glow', mood: 'energetic' },
    { id: 'vs-9', title: 'Modern Loft', category: 'Interior', description: 'Raw exposed brick, large industrial windows, natural side light, hardwood floors, warm ambient', mood: 'lifestyle' },
    { id: 'vs-10', title: 'Luxury Bathroom', category: 'Interior', description: 'Marble surfaces, soft warm vanity light, steam rising, chrome fixtures, water droplets', mood: 'luxury' },
    { id: 'vs-11', title: 'Cozy Warm Interior', category: 'Interior', description: 'Soft lamp light, wood textures, linen and wool fabrics, warm color temperature, intimate space', mood: 'emotional' },
    { id: 'vs-12', title: 'Minimalist Concrete', category: 'Interior', description: 'Raw concrete walls and floor, cool diffused light, industrial textures, brutalist geometry', mood: 'minimal' },
    { id: 'vs-13', title: 'Botanical Greenhouse', category: 'Creative', description: 'Lush tropical greenery, dappled sunlight through glass ceiling, humidity visible, organic textures', mood: 'organic' },
    { id: 'vs-14', title: 'Neon Rain Street', category: 'Creative', description: 'Wet asphalt reflecting neon signage, magenta and cyan light pools, urban night, visible raindrops', mood: 'energetic' },
    { id: 'vs-15', title: 'Surreal Gradient Void', category: 'Creative', description: 'Smooth infinite color gradient, no visible ground plane, floating subject, dreamy atmosphere', mood: 'creative' },
    { id: 'vs-16', title: 'Desert Golden Sands', category: 'Creative', description: 'Warm orange dunes, harsh directional sunlight, heat haze, textured sand ripples, vast scale', mood: 'atmospheric' },
  ], []);

  const filteredScenes = useMemo(() => {
    if (!sceneSearch.trim()) return VIDEO_SCENE_PRESETS;
    const q = sceneSearch.toLowerCase();
    return VIDEO_SCENE_PRESETS.filter(s => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
  }, [VIDEO_SCENE_PRESETS, sceneSearch]);

  // --- User products with ALL angle fields ---
  const { data: userProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['user-products-ref-picker-full', user?.id],
    queryFn: async () => {
      let all: FullProduct[] = [];
      let from = 0;
      const batchSize = 500;
      while (true) {
        const { data, error } = await supabase
          .from('user_products')
          .select('id, title, image_url, back_image_url, side_image_url, packaging_image_url, inside_image_url, texture_image_url, extra_image_urls')
          .order('created_at', { ascending: false })
          .range(from, from + batchSize - 1);
        if (error) throw error;
        if (!data || data.length === 0) break;
        all = all.concat(data as FullProduct[]);
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

  // --- Grouped product references ---
  const productGroups = useMemo(() => {
    const productRefs = references.filter(r => r.role === 'product' && r.productId);
    const groups = new Map<string, { name: string; refs: ReferenceAsset[] }>();
    productRefs.forEach(ref => {
      const pid = ref.productId!;
      if (!groups.has(pid)) groups.set(pid, { name: ref.name || 'Product', refs: [] });
      groups.get(pid)!.refs.push(ref);
    });
    return groups;
  }, [references]);

  const customProductRefs = useMemo(() => 
    references.filter(r => r.role === 'product' && !r.productId),
  [references]);

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
    async (role: ReferenceAsset['role'], files: FileList | null, opts?: { subRole?: ProductSubRole; productId?: string }) => {
      if (!files || files.length === 0) return;
      if (opts?.productId && opts?.subRole) {
        setUploadingSlot(`${opts.productId}:${opts.subRole}`);
      } else {
        setUploadingRole(role);
      }

      const newRefs: ReferenceAsset[] = [];
      for (const file of Array.from(files)) {
        const url = await upload(file);
        if (url) {
          newRefs.push({
            id: crypto.randomUUID(),
            url,
            role,
            name: file.name,
            subRole: opts?.subRole,
            productId: opts?.productId,
          });
        }
      }
      if (newRefs.length > 0) onChange([...references, ...newRefs]);
      setUploadingRole(null);
      setUploadingSlot(null);
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
      onChange([...references, { id: crypto.randomUUID(), url: '', role: 'scene', name: `${scene.title}: ${scene.description || ''}` }]);
      setScenePickerOpen(false);
    },
    [references, onChange]
  );

  // Toggle a scene preset inline (no dialog close)
  const toggleScenePreset = useCallback(
    (scene: { id: string; title: string; description?: string }) => {
      const presetName = `${scene.title}: ${scene.description || ''}`;
      const existing = references.find(r => r.role === 'scene' && r.name === presetName);
      if (existing) {
        onChange(references.filter(r => r.id !== existing.id));
      } else {
        onChange([...references, { id: crypto.randomUUID(), url: '', role: 'scene', name: presetName }]);
      }
    },
    [references, onChange]
  );

  const pickProduct = useCallback(
    (product: FullProduct) => {
      const newRefs: ReferenceAsset[] = [];
      const pid = product.id;
      const name = product.title;
      newRefs.push({ id: crypto.randomUUID(), url: product.image_url, role: 'product', name, subRole: 'main', productId: pid });
      if (product.back_image_url) newRefs.push({ id: crypto.randomUUID(), url: product.back_image_url, role: 'product', name, subRole: 'back', productId: pid });
      if (product.side_image_url) newRefs.push({ id: crypto.randomUUID(), url: product.side_image_url, role: 'product', name, subRole: 'side', productId: pid });
      if (product.packaging_image_url) newRefs.push({ id: crypto.randomUUID(), url: product.packaging_image_url, role: 'product', name, subRole: 'packaging', productId: pid });
      if (product.inside_image_url) newRefs.push({ id: crypto.randomUUID(), url: product.inside_image_url, role: 'product', name, subRole: 'inside', productId: pid });
      if (product.texture_image_url) newRefs.push({ id: crypto.randomUUID(), url: product.texture_image_url, role: 'product', name, subRole: 'texture', productId: pid });
      if (product.extra_image_urls && product.extra_image_urls.length > 0) {
        product.extra_image_urls.forEach((url) => {
          newRefs.push({ id: crypto.randomUUID(), url, role: 'product', name, subRole: 'extra', productId: pid });
        });
      }
      onChange([...references, ...newRefs]);
      setProductPickerOpen(false);
    },
    [references, onChange]
  );

  const removeRef = useCallback(
    (id: string) => onChange(references.filter((r) => r.id !== id)),
    [references, onChange]
  );

  const removeProductGroup = useCallback(
    (productId: string) => onChange(references.filter(r => !(r.role === 'product' && r.productId === productId))),
    [references, onChange]
  );

  const pickStyle = useCallback(
    (preset: { id: string; title: string; keywords: string }) => {
      onChange([...references, { id: crypto.randomUUID(), url: '', role: 'style', name: `${preset.title}: ${preset.keywords}` }]);
      setStylePickerOpen(false);
    },
    [references, onChange]
  );

  // Toggle a style preset inline (no dialog close)
  const toggleStylePreset = useCallback(
    (preset: { id: string; title: string; keywords: string }) => {
      const presetName = `${preset.title}: ${preset.keywords}`;
      const existing = references.find(r => r.role === 'style' && r.name === presetName);
      if (existing) {
        onChange(references.filter(r => r.id !== existing.id));
      } else {
        onChange([...references, { id: crypto.randomUUID(), url: '', role: 'style', name: presetName }]);
      }
    },
    [references, onChange]
  );

  // Helper to check if a preset is selected
  const isScenePresetSelected = useCallback(
    (scene: { title: string; description?: string }) => {
      const presetName = `${scene.title}: ${scene.description || ''}`;
      return references.some(r => r.role === 'scene' && r.name === presetName);
    },
    [references]
  );

  const isStylePresetSelected = useCallback(
    (preset: { title: string; keywords: string }) => {
      const presetName = `${preset.title}: ${preset.keywords}`;
      return references.some(r => r.role === 'style' && r.name === presetName);
    },
    [references]
  );

  const openLibrary = (type: 'model' | 'scene' | 'product' | 'style') => {
    if (type === 'model') openModelPicker();
    else if (type === 'scene') openScenePicker();
    else if (type === 'product') openProductPicker();
    else if (type === 'style') setStylePickerOpen(true);
  };

  // Count how many products are added
  const productCount = productGroups.size + (customProductRefs.length > 0 ? 1 : 0);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Add References</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Upload product shots, scene references, model photos, and style inspiration.
        </p>
      </div>

      <div className="space-y-3">
        {/* ─── PRODUCT REFERENCES — Per-product card layout ─── */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Product References</p>
              <p className="text-xs text-muted-foreground">
                {productCount === 0 
                  ? 'Add products with multiple angles for better results.' 
                  : `${productCount} product${productCount > 1 ? 's' : ''} added`}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs shrink-0"
              onClick={() => openLibrary('product')}
            >
              <Plus className="h-3.5 w-3.5" />
              Add Product
            </Button>
          </div>

          {/* Per-product cards */}
          {Array.from(productGroups.entries()).map(([pid, group], groupIdx) => (
            <div key={pid} className="rounded-lg border border-border bg-muted/20 p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-foreground">
                  Product {groupIdx + 1}: <span className="font-medium text-muted-foreground">{group.name}</span>
                </p>
                <button
                  onClick={() => removeProductGroup(pid)}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
                  aria-label="Remove product"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {ANGLE_SLOTS.map((slot) => {
                  const ref = group.refs.find(r => r.subRole === slot.subRole);
                  const slotKey = `${pid}:${slot.subRole}`;
                  const isSlotUploading = uploadingSlot === slotKey && isUploading;

                  return (
                    <div key={slot.subRole} className="space-y-1">
                      {ref ? (
                        <div className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border border-border bg-white">
                            <img
                              src={getOptimizedUrl(ref.url, { quality: 70 })}
                              alt={`${slot.label} view`}
                              className="w-full h-full object-contain"
                              loading="lazy"
                            />
                          </div>
                          <div className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-2.5 w-2.5 text-primary-foreground" />
                          </div>
                          <button
                            onClick={() => removeRef(ref.id)}
                            className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label={`Remove ${slot.label}`}
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      ) : (
                        <label className={cn(
                          "aspect-square rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors",
                          isSlotUploading ? "border-primary/40 bg-primary/5 pointer-events-none" : "border-border hover:border-primary/40 hover:bg-muted/30"
                        )}>
                          {isSlotUploading ? (
                            <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
                          ) : (
                            <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => handleFileUpload('product', e.target.files, { subRole: slot.subRole, productId: pid })}
                            disabled={isSlotUploading}
                          />
                        </label>
                      )}
                      <p className="text-[9px] text-muted-foreground text-center font-medium">{slot.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Extra images row */}
              {group.refs.filter(r => r.subRole === 'extra').length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <p className="text-[9px] text-muted-foreground w-full">Extra angles:</p>
                  {group.refs.filter(r => r.subRole === 'extra').map(ref => (
                    <div key={ref.id} className="relative group">
                      <div className="h-10 w-10 rounded border border-border overflow-hidden bg-white">
                        <img src={getOptimizedUrl(ref.url, { quality: 60 })} alt="Extra" className="w-full h-full object-contain" loading="lazy" />
                      </div>
                      <button
                        onClick={() => removeRef(ref.id)}
                        className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-2 w-2" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Custom (non-library) product uploads */}
          {customProductRefs.length > 0 && (
            <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
              <p className="text-xs font-semibold text-foreground">Custom Uploads</p>
              <div className="flex flex-wrap gap-2">
                {customProductRefs.map((ref) => (
                  <div key={ref.id} className="relative group">
                    <img
                      src={getOptimizedUrl(ref.url, { quality: 70 })}
                      alt={ref.name || 'Product'}
                      className="h-14 w-14 rounded-lg border border-border object-contain bg-white"
                      loading="lazy"
                    />
                    <button
                      onClick={() => removeRef(ref.id)}
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {ref.name && <p className="text-[9px] text-muted-foreground text-center truncate w-14 mt-0.5">{ref.name}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Drop zone for custom product uploads */}
          <label
            className={cn(
              'flex items-center justify-center gap-2 rounded-lg border-2 border-dashed p-3 cursor-pointer transition-colors',
              uploadingRole === 'product' && isUploading && 'pointer-events-none opacity-60',
              dragRole === 'product'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/40 hover:bg-muted/30'
            )}
            onDragOver={(e) => { e.preventDefault(); setDragRole('product'); }}
            onDragLeave={() => setDragRole(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDragRole(null);
              handleFileUpload('product', e.dataTransfer.files);
            }}
          >
            {uploadingRole === 'product' && isUploading ? (
              <Loader2 className="h-4 w-4 text-primary animate-spin" />
            ) : (
              <Upload className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-xs text-muted-foreground">
              {uploadingRole === 'product' && isUploading ? 'Uploading...' : (
                <>Drop images or <span className="text-primary font-medium">browse</span></>
              )}
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(e) => handleFileUpload('product', e.target.files)}
              disabled={uploadingRole === 'product' && isUploading}
            />
          </label>
        </div>

        {/* ─── NON-PRODUCT SECTIONS ─── */}
        {NON_PRODUCT_SECTIONS.map((section) => {
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
                          className={`rounded-lg border border-border ${
                            section.role === 'model'
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

      {/* Scene Presets Picker */}
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
        renderItem={(p) => {
          const alreadyAdded = productGroups.has(p.id);
          const angleCount = [p.back_image_url, p.side_image_url, p.packaging_image_url, p.inside_image_url, p.texture_image_url].filter(Boolean).length;
          const extraCount = p.extra_image_urls?.length || 0;
          return (
            <button
              key={p.id}
              onClick={() => !alreadyAdded && pickProduct(p)}
              disabled={alreadyAdded}
              className={cn(
                "rounded-lg border overflow-hidden transition-all text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                alreadyAdded
                  ? "border-primary/30 bg-primary/5 opacity-70 cursor-not-allowed"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className="aspect-square bg-white rounded-t-lg overflow-hidden relative">
                <ShimmerImage
                  src={getOptimizedUrl(p.image_url, { quality: 70 })}
                  alt={p.title}
                  className="w-full h-full object-cover"
                />
                {alreadyAdded && (
                  <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                    <Check className="h-6 w-6 text-primary" />
                  </div>
                )}
              </div>
              <div className="p-2">
                <p className="text-xs font-medium text-foreground truncate">{p.title}</p>
                {(angleCount > 0 || extraCount > 0) && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {angleCount + 1 + extraCount} image{angleCount + extraCount > 0 ? 's' : ''}
                  </p>
                )}
              </div>
            </button>
          );
        }}
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

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

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