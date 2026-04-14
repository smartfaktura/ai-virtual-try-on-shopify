import { useState, useCallback, useMemo } from 'react';
import { Upload, X, Image as ImageIcon, Users, MapPin, Palette, Library, Loader2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useCustomModels } from '@/hooks/useCustomModels';
import { useUserModels } from '@/hooks/useUserModels';
import { useModelSortOrder } from '@/hooks/useModelSortOrder';
import { useProductImageScenes } from '@/hooks/useProductImageScenes';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { mockModels } from '@/data/mockData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { Skeleton } from '@/components/ui/skeleton';
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
  { role: 'style' as const, label: 'Style / Mood', icon: Palette, description: 'Upload visual tone or mood references.', libraryType: null },
  { role: 'logo' as const, label: 'Logo / End Frame', icon: ImageIcon, description: 'Optional — logo for the closing shot.', libraryType: null },
];

export function ReferenceUploadPanel({ references, onChange }: ReferenceUploadPanelProps) {
  const [dragRole, setDragRole] = useState<string | null>(null);
  const [uploadingRole, setUploadingRole] = useState<string | null>(null);
  const [modelPickerOpen, setModelPickerOpen] = useState(false);
  const [scenePickerOpen, setScenePickerOpen] = useState(false);
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const { upload, isUploading } = useFileUpload();
  const { user } = useAuth();

  // --- Model sources (merged like Product Images) ---
  const { asProfiles: customModelProfiles, isLoading: customModelsLoading } = useCustomModels();
  const { asProfiles: userModelProfiles, isLoading: userModelsLoading } = useUserModels();
  const {
    sortModels, applyOverrides, applyNameOverrides, filterHidden,
    isLoading: sortLoading,
  } = useModelSortOrder();

  const allModels = useMemo(() => {
    const merged: ModelProfile[] = [...mockModels, ...customModelProfiles, ...userModelProfiles];
    return sortModels(filterHidden(applyNameOverrides(applyOverrides(merged))));
  }, [mockModels, customModelProfiles, userModelProfiles, sortModels, filterHidden, applyNameOverrides, applyOverrides]);

  const modelsLoading = customModelsLoading || userModelsLoading || sortLoading;

  // --- Scenes ---
  const { allScenes, isLoading: scenesLoading } = useProductImageScenes();
  const validScenes = useMemo(
    () => allScenes.filter(s => s.previewUrl && s.previewUrl.startsWith('http')),
    [allScenes]
  );

  // --- User products ---
  const { data: userProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['user-products-ref-picker', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_products')
        .select('id, title, image_url')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as { id: string; title: string; image_url: string }[];
    },
    enabled: !!user,
  });

  const handleFileUpload = useCallback(
    async (role: ReferenceAsset['role'], files: FileList | null) => {
      if (!files || files.length === 0) return;
      setUploadingRole(role);

      const newRefs: ReferenceAsset[] = [];
      for (const file of Array.from(files)) {
        const url = await upload(file);
        if (url) {
          newRefs.push({
            id: crypto.randomUUID(),
            url,
            role,
            name: file.name,
          });
        }
      }

      if (newRefs.length > 0) {
        onChange([...references, ...newRefs]);
      }
      setUploadingRole(null);
    },
    [references, onChange, upload]
  );

  const pickModel = useCallback(
    (model: ModelProfile) => {
      const ref: ReferenceAsset = {
        id: crypto.randomUUID(),
        url: model.previewUrl,
        role: 'model',
        name: model.name,
      };
      onChange([...references, ref]);
      setModelPickerOpen(false);
    },
    [references, onChange]
  );

  const pickScene = useCallback(
    (scene: { id: string; title: string; previewUrl?: string }) => {
      if (!scene.previewUrl) return;
      const ref: ReferenceAsset = {
        id: crypto.randomUUID(),
        url: scene.previewUrl,
        role: 'scene',
        name: scene.title,
      };
      onChange([...references, ref]);
      setScenePickerOpen(false);
    },
    [references, onChange]
  );

  const pickProduct = useCallback(
    (product: { id: string; title: string; image_url: string }) => {
      const ref: ReferenceAsset = {
        id: crypto.randomUUID(),
        url: product.image_url,
        role: 'product',
        name: product.title,
      };
      onChange([...references, ref]);
      setProductPickerOpen(false);
    },
    [references, onChange]
  );

  const removeRef = useCallback(
    (id: string) => {
      onChange(references.filter((r) => r.id !== id));
    },
    [references, onChange]
  );

  const openLibrary = (type: 'model' | 'scene' | 'product') => {
    if (type === 'model') setModelPickerOpen(true);
    else if (type === 'scene') setScenePickerOpen(true);
    else if (type === 'product') setProductPickerOpen(true);
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
                      <img
                        src={ref.url}
                        alt={ref.name || section.label}
                        className="h-16 w-16 rounded-lg object-cover border border-border"
                      />
                      <button
                        onClick={() => removeRef(ref.id)}
                        className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity focus-visible:ring-2 focus-visible:ring-ring focus-visible:opacity-100"
                        aria-label={`Remove ${ref.name || 'reference'}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {ref.name && (
                        <p className="text-[9px] text-muted-foreground text-center truncate w-16 mt-0.5">{ref.name}</p>
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

      {/* Model Library Picker Dialog */}
      <Dialog open={modelPickerOpen} onOpenChange={setModelPickerOpen}>
        <DialogContent className="max-w-md max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Pick from Model Library</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto py-2">
            {modelsLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
              ))
            ) : allModels.length === 0 ? (
              <p className="col-span-full text-sm text-muted-foreground text-center py-8">
                No models available yet.
              </p>
            ) : (
              allModels.map((m) => (
                <button
                  key={m.modelId}
                  onClick={() => pickModel(m)}
                  className="rounded-lg border border-border hover:border-primary/50 overflow-hidden transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <ShimmerImage
                    src={m.previewUrl}
                    alt={m.name}
                    className="w-full aspect-[3/4] object-cover"
                    aspectRatio="3/4"
                  />
                  <p className="text-[10px] font-medium text-foreground p-1.5 truncate">{m.name}</p>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Scene Library Picker Dialog */}
      <Dialog open={scenePickerOpen} onOpenChange={setScenePickerOpen}>
        <DialogContent className="max-w-lg max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Pick from Scene Library</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto py-2">
            {scenesLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))
            ) : validScenes.length === 0 ? (
              <p className="col-span-full text-sm text-muted-foreground text-center py-8">
                No scene previews available.
              </p>
            ) : (
              validScenes.map((s) => (
                <button
                  key={s.id}
                  onClick={() => pickScene(s)}
                  className="rounded-lg border border-border hover:border-primary/50 overflow-hidden transition-all text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <ShimmerImage
                    src={s.previewUrl}
                    alt={s.title}
                    className="w-full aspect-square object-cover"
                    aspectRatio="1/1"
                  />
                  <div className="p-1.5">
                    <p className="text-[10px] font-medium text-foreground truncate">{s.title}</p>
                    <p className="text-[9px] text-muted-foreground truncate">{s.description}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Library Picker Dialog */}
      <Dialog open={productPickerOpen} onOpenChange={setProductPickerOpen}>
        <DialogContent className="max-w-md max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Pick from Products</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto py-2">
            {productsLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))
            ) : !userProducts || userProducts.length === 0 ? (
              <p className="col-span-full text-sm text-muted-foreground text-center py-8">
                No products yet. Add products in your product library first.
              </p>
            ) : (
              userProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => pickProduct(p)}
                  className="rounded-lg border border-border hover:border-primary/50 overflow-hidden transition-all text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <ShimmerImage
                    src={p.image_url}
                    alt={p.title}
                    className="w-full aspect-square object-cover"
                    aspectRatio="1/1"
                  />
                  <p className="text-[10px] font-medium text-foreground p-1.5 truncate">{p.title}</p>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
