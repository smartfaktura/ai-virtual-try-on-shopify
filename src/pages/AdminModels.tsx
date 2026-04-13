import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import {
  ArrowUp, ArrowDown, ArrowUpToLine, Trash2, Save, Loader2, Plus,
  Search, Pencil, Check, X, Eye, EyeOff, BarChart3, Camera,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useAllCustomModels, useUpdateCustomModel, useDeleteCustomModel } from '@/hooks/useCustomModels';
import { useModelSortOrder, useSaveModelSortOrder } from '@/hooks/useModelSortOrder';
import { AddModelModal } from '@/components/app/AddModelModal';
import type { CustomModel } from '@/hooks/useCustomModels';
import { mockModels } from '@/data/mockData';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/brandedToast';

const GENDER_OPTIONS = ['female', 'male', 'non-binary'];
const BODY_TYPE_OPTIONS = ['slim', 'average', 'athletic', 'curvy', 'plus-size'];
const AGE_RANGE_OPTIONS = ['young-adult', 'adult', 'mature'];

const STORAGE_MARKER = '/storage/v1/object/';
const RENDER_MARKER = '/storage/v1/render/image/';

function buildOptimizedUrl(url: string): string | null {
  if (!url || !url.includes(STORAGE_MARKER) || url.includes(RENDER_MARKER)) return null;
  const transformed = url.replace(STORAGE_MARKER, RENDER_MARKER);
  const sep = transformed.includes('?') ? '&' : '?';
  return `${transformed}${sep}width=1536&quality=80`;
}

interface UnifiedModel {
  id: string;
  name: string;
  gender: string;
  bodyType: string;
  ethnicity: string;
  ageRange: string;
  imageUrl: string;
  isCustom: boolean;
  isActive: boolean;
  customModel?: CustomModel;
}

function buildUnifiedList(customModels: CustomModel[], sortMap: Map<string, number>): UnifiedModel[] {
  const mockUnified: UnifiedModel[] = mockModels.map(m => ({
    id: m.modelId,
    name: m.name,
    gender: m.gender,
    bodyType: m.bodyType,
    ethnicity: m.ethnicity || '',
    ageRange: m.ageRange || '',
    imageUrl: m.previewUrl,
    isCustom: false,
    isActive: true,
  }));

  const customUnified: UnifiedModel[] = customModels.map(m => ({
    id: `custom-${m.id}`,
    name: m.name,
    gender: m.gender,
    bodyType: m.body_type,
    ethnicity: m.ethnicity,
    ageRange: m.age_range,
    imageUrl: m.optimized_image_url || m.image_url,
    isCustom: true,
    isActive: m.is_active,
    customModel: m,
  }));

  const all = [...mockUnified, ...customUnified];

  if (sortMap.size > 0) {
    all.sort((a, b) => {
      const sa = sortMap.get(a.id) ?? 9999;
      const sb = sortMap.get(b.id) ?? 9999;
      return sa - sb;
    });
  }

  return all;
}

function useModelUsageStats() {
  return useQuery({
    queryKey: ['admin-model-usage-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_model_usage_stats' as any);
      if (error) throw error;
      return (data as Record<string, number>) ?? {};
    },
    staleTime: 5 * 60 * 1000,
  });
}

export default function AdminModels() {
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { models: customModels, isLoading: modelsLoading } = useAllCustomModels();
  const { sortMap, isLoading: sortLoading } = useModelSortOrder();
  const saveSortOrder = useSaveModelSortOrder();
  const updateModel = useUpdateCustomModel();
  const deleteModel = useDeleteCustomModel();
  const { data: usageStats } = useModelUsageStats();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingFields, setEditingFields] = useState<Partial<CustomModel>>({});
  const [localOrder, setLocalOrder] = useState<UnifiedModel[] | null>(null);
  const [addModelOpen, setAddModelOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [jumpInputId, setJumpInputId] = useState<string | null>(null);
  const [jumpValue, setJumpValue] = useState('');

  // Image replace state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageTargetModel, setImageTargetModel] = useState<UnifiedModel | null>(null);
  const [uploadingImageId, setUploadingImageId] = useState<string | null>(null);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<UnifiedModel | null>(null);

  const unifiedModels = useMemo(
    () => buildUnifiedList(customModels, sortMap),
    [customModels, sortMap]
  );

  useEffect(() => {
    setLocalOrder(null);
  }, [unifiedModels]);

  const orderedModels = localOrder ?? unifiedModels;

  const filteredModels = useMemo(() => {
    if (!searchQuery) return orderedModels;
    const q = searchQuery.toLowerCase();
    return orderedModels.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.gender.toLowerCase().includes(q) ||
      m.ethnicity.toLowerCase().includes(q)
    );
  }, [orderedModels, searchQuery]);

  const hasUnsavedOrder = localOrder !== null;

  const moveModel = useCallback((index: number, direction: 'up' | 'down') => {
    const list = [...(localOrder ?? unifiedModels)];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= list.length) return;
    [list[index], list[newIndex]] = [list[newIndex], list[index]];
    setLocalOrder(list);
  }, [localOrder, unifiedModels]);

  const jumpToPosition = useCallback((modelId: string, targetPos: number) => {
    const list = [...(localOrder ?? unifiedModels)];
    const currentIndex = list.findIndex(m => m.id === modelId);
    if (currentIndex === -1) return;
    const clampedTarget = Math.max(1, Math.min(list.length, targetPos)) - 1;
    if (clampedTarget === currentIndex) return;
    const [item] = list.splice(currentIndex, 1);
    list.splice(clampedTarget, 0, item);
    setLocalOrder(list);
    setJumpInputId(null);
    setJumpValue('');
  }, [localOrder, unifiedModels]);

  const handleSaveOrder = useCallback(async () => {
    if (!localOrder) return;
    setIsSaving(true);
    try {
      const entries = localOrder.map((m, i) => ({ model_id: m.id, sort_order: i }));
      await saveSortOrder.mutateAsync(entries);
      setLocalOrder(null);
      toast.success('Model order saved');
    } catch (e: any) {
      toast.error('Failed to save order', { description: e.message });
    } finally {
      setIsSaving(false);
    }
  }, [localOrder, saveSortOrder]);

  const startEdit = (model: UnifiedModel) => {
    if (!model.isCustom || !model.customModel) return;
    setEditingId(model.id);
    setEditingFields({
      name: model.customModel.name,
      gender: model.customModel.gender,
      body_type: model.customModel.body_type,
      ethnicity: model.customModel.ethnicity,
      age_range: model.customModel.age_range,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingFields({});
  };

  const saveEdit = async (model: UnifiedModel) => {
    if (!model.customModel) return;
    try {
      await updateModel.mutateAsync({ id: model.customModel.id, ...editingFields });
      toast.success('Model updated');
      setEditingId(null);
      setEditingFields({});
    } catch (e: any) {
      toast.error('Failed to update', { description: e.message });
    }
  };

  const handleToggleActive = async (model: UnifiedModel) => {
    if (!model.customModel) return;
    try {
      await updateModel.mutateAsync({ id: model.customModel.id, is_active: !model.customModel.is_active });
      toast.success(model.isActive ? 'Model hidden' : 'Model visible');
    } catch (e: any) {
      toast.error('Failed to toggle', { description: e.message });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget?.customModel) return;
    try {
      await deleteModel.mutateAsync(deleteTarget.customModel.id);
      toast.success('Model deleted');
    } catch (e: any) {
      toast.error('Failed to delete', { description: e.message });
    } finally {
      setDeleteTarget(null);
    }
  };

  // Image replacement
  const handleImageClick = (model: UnifiedModel) => {
    if (!model.isCustom || !model.customModel) return;
    setImageTargetModel(model);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !imageTargetModel?.customModel) {
      setImageTargetModel(null);
      return;
    }

    const modelId = imageTargetModel.customModel.id;
    setUploadingImageId(imageTargetModel.id);

    try {
      const timestamp = Date.now();
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `models/${modelId}-${timestamp}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('scratch-uploads')
        .upload(path, file, { cacheControl: '3600', upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('scratch-uploads')
        .getPublicUrl(path);

      const newUrl = urlData.publicUrl;
      const optimized = buildOptimizedUrl(newUrl);

      await updateModel.mutateAsync({
        id: modelId,
        image_url: newUrl,
        optimized_image_url: optimized,
      } as any);

      toast.success('Model image updated');
    } catch (err: any) {
      toast.error('Failed to replace image', { description: err.message });
    } finally {
      setUploadingImageId(null);
      setImageTargetModel(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getUsageCount = (model: UnifiedModel): number => {
    if (!usageStats) return 0;
    const byId = (usageStats[model.id] as number) ?? 0;
    const byName = (usageStats[model.name] as number) ?? 0;
    return model.id === model.name ? byId : byId + byName;
  };

  if (adminLoading || modelsLoading || sortLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/app" replace />;

  const totalMock = mockModels.length;
  const totalCustom = customModels.length;

  return (
    <TooltipProvider>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Hidden file input for image replacement */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Model Manager</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {totalMock} built-in + {totalCustom} custom model{totalCustom !== 1 ? 's' : ''} — reorder to control display order everywhere
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasUnsavedOrder && (
              <Button onClick={handleSaveOrder} disabled={isSaving} size="sm">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                Save Order
              </Button>
            )}
            <Button onClick={() => setAddModelOpen(true)} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add Model
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search models..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Model grid */}
        <div className="grid gap-3">
          {filteredModels.map((model) => {
            const isEditing = editingId === model.id;
            const globalIndex = orderedModels.indexOf(model);
            const position = globalIndex + 1;
            const usage = getUsageCount(model);
            const isJumping = jumpInputId === model.id;
            const isUploadingImage = uploadingImageId === model.id;

            return (
              <div
                key={model.id}
                className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${
                  model.isActive ? 'bg-card border-border' : 'bg-muted/30 border-border/50 opacity-60'
                }`}
              >
                {/* Position + reorder */}
                <div className="flex items-center gap-1 flex-shrink-0 w-20">
                  {isJumping ? (
                    <Input
                      autoFocus
                      type="number"
                      min={1}
                      max={orderedModels.length}
                      value={jumpValue}
                      onChange={(e) => setJumpValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const v = parseInt(jumpValue, 10);
                          if (!isNaN(v)) jumpToPosition(model.id, v);
                        }
                        if (e.key === 'Escape') { setJumpInputId(null); setJumpValue(''); }
                      }}
                      onBlur={() => { setJumpInputId(null); setJumpValue(''); }}
                      className="h-7 w-14 text-xs text-center px-1"
                      placeholder={String(position)}
                    />
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => { setJumpInputId(model.id); setJumpValue(String(position)); }}
                          className="text-xs font-mono font-semibold text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded px-1.5 py-0.5 min-w-[28px] text-center transition-colors"
                        >
                          #{position}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Click to jump to position</TooltipContent>
                    </Tooltip>
                  )}
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveModel(globalIndex, 'up')}
                      disabled={globalIndex === 0}
                      className="p-0.5 rounded hover:bg-muted disabled:opacity-20 transition-colors"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => moveModel(globalIndex, 'down')}
                      disabled={globalIndex === orderedModels.length - 1}
                      className="p-0.5 rounded hover:bg-muted disabled:opacity-20 transition-colors"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Preview image — clickable for custom models */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleImageClick(model)}
                      disabled={!model.isCustom}
                      className={`relative w-14 h-18 rounded-lg overflow-hidden flex-shrink-0 bg-muted group ${
                        model.isCustom ? 'cursor-pointer ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring' : 'cursor-default'
                      }`}
                    >
                      <img
                        src={getOptimizedUrl(model.imageUrl, { quality: 60 })}
                        alt={model.name}
                        className="w-full h-full object-cover"
                      />
                      {model.isCustom && !isUploadingImage && (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                          <Camera className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                      {isUploadingImage && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Loader2 className="w-4 h-4 text-white animate-spin" />
                        </div>
                      )}
                    </button>
                  </TooltipTrigger>
                  {model.isCustom && <TooltipContent>Click to replace image</TooltipContent>}
                </Tooltip>

                {/* Fields */}
                <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
                  {isEditing && model.isCustom ? (
                    <>
                      <Input
                        value={editingFields.name ?? ''}
                        onChange={(e) => setEditingFields(f => ({ ...f, name: e.target.value }))}
                        placeholder="Name"
                        className="text-sm"
                      />
                      <Select
                        value={editingFields.gender ?? ''}
                        onValueChange={(v) => setEditingFields(f => ({ ...f, gender: v }))}
                      >
                        <SelectTrigger className="text-sm"><SelectValue placeholder="Gender" /></SelectTrigger>
                        <SelectContent>
                          {GENDER_OPTIONS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select
                        value={editingFields.body_type ?? ''}
                        onValueChange={(v) => setEditingFields(f => ({ ...f, body_type: v }))}
                      >
                        <SelectTrigger className="text-sm"><SelectValue placeholder="Body type" /></SelectTrigger>
                        <SelectContent>
                          {BODY_TYPE_OPTIONS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Input
                        value={editingFields.ethnicity ?? ''}
                        onChange={(e) => setEditingFields(f => ({ ...f, ethnicity: e.target.value }))}
                        placeholder="Ethnicity"
                        className="text-sm"
                      />
                      <Select
                        value={editingFields.age_range ?? ''}
                        onValueChange={(v) => setEditingFields(f => ({ ...f, age_range: v }))}
                      >
                        <SelectTrigger className="text-sm"><SelectValue placeholder="Age" /></SelectTrigger>
                        <SelectContent>
                          {AGE_RANGE_OPTIONS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{model.name}</span>
                        {!model.isCustom && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">built-in</Badge>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs w-fit">{model.gender || '—'}</Badge>
                      <Badge variant="outline" className="text-xs w-fit">{model.bodyType || '—'}</Badge>
                      <span className="text-xs text-muted-foreground truncate">{model.ethnicity || '—'}</span>
                      <Badge variant="outline" className="text-xs w-fit">{model.ageRange || '—'}</Badge>
                    </>
                  )}
                </div>

                {/* Usage stats */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0 min-w-[60px]">
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>{usage}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{usage} generation{usage !== 1 ? 's' : ''} using this model</TooltipContent>
                </Tooltip>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {model.isCustom ? (
                    isEditing ? (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button onClick={() => saveEdit(model)} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors">
                              <Check className="w-4 h-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Save</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button onClick={cancelEdit} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Cancel</TooltipContent>
                        </Tooltip>
                      </>
                    ) : (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button onClick={() => startEdit(model)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                              <Pencil className="w-4 h-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Edit</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button onClick={() => handleToggleActive(model)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                              {model.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>{model.isActive ? 'Hide' : 'Show'}</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button onClick={() => setDeleteTarget(model)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                      </>
                    )
                  ) : (
                    <span className="text-[10px] text-muted-foreground/50 px-2">read-only</span>
                  )}
                </div>
              </div>
            );
          })}

          {filteredModels.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery ? 'No models match your search' : 'No models found'}
            </div>
          )}
        </div>

        <AddModelModal open={addModelOpen} onClose={() => setAddModelOpen(false)} />

        {/* Delete confirmation dialog */}
        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete model permanently?</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-3">
                  <p>
                    This will permanently remove <strong>{deleteTarget?.name}</strong>. This action cannot be undone.
                  </p>
                  {deleteTarget && (
                    <div className="flex justify-center">
                      <div className="w-20 h-24 rounded-lg overflow-hidden bg-muted border border-border">
                        <img
                          src={getOptimizedUrl(deleteTarget.imageUrl, { quality: 50 })}
                          alt={deleteTarget.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
