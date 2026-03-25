import { useState, useMemo, useCallback, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
  ArrowUp, ArrowDown, Trash2, Save, Loader2, Plus,
  Search, Pencil, Check, X, Eye, EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useAllCustomModels, useUpdateCustomModel, useDeleteCustomModel } from '@/hooks/useCustomModels';
import { useModelSortOrder, useSaveModelSortOrder } from '@/hooks/useModelSortOrder';
import { AddModelModal } from '@/components/app/AddModelModal';
import type { CustomModel } from '@/hooks/useCustomModels';
import { mockModels } from '@/data/mockData';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { toast } from 'sonner';

const GENDER_OPTIONS = ['female', 'male', 'non-binary'];
const BODY_TYPE_OPTIONS = ['slim', 'average', 'athletic', 'curvy', 'plus-size'];
const AGE_RANGE_OPTIONS = ['young-adult', 'adult', 'mature'];

interface UnifiedModel {
  id: string;           // modelId for mock, uuid for custom
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

export default function AdminModels() {
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { models: customModels, isLoading: modelsLoading } = useAllCustomModels();
  const { sortMap, isLoading: sortLoading } = useModelSortOrder();
  const saveSortOrder = useSaveModelSortOrder();
  const updateModel = useUpdateCustomModel();
  const deleteModel = useDeleteCustomModel();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingFields, setEditingFields] = useState<Partial<CustomModel>>({});
  const [localOrder, setLocalOrder] = useState<UnifiedModel[] | null>(null);
  const [addModelOpen, setAddModelOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const unifiedModels = useMemo(
    () => buildUnifiedList(customModels, sortMap),
    [customModels, sortMap]
  );

  // Reset local order when source data changes
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

  const handleDelete = async (model: UnifiedModel) => {
    if (!model.customModel) return;
    if (!confirm(`Delete "${model.name}" permanently?`)) return;
    try {
      await deleteModel.mutateAsync(model.customModel.id);
      toast.success('Model deleted');
    } catch (e: any) {
      toast.error('Failed to delete', { description: e.message });
    }
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
          {filteredModels.map((model, _) => {
            const isEditing = editingId === model.id;
            const globalIndex = (localOrder ?? unifiedModels).indexOf(model);

            return (
              <div
                key={model.id}
                className={`flex items-center gap-4 rounded-xl border p-3 transition-colors ${
                  model.isActive ? 'bg-card border-border' : 'bg-muted/30 border-border/50 opacity-60'
                }`}
              >
                {/* Reorder buttons */}
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveModel(globalIndex, 'up')}
                    disabled={globalIndex === 0}
                    className="p-1 rounded hover:bg-muted disabled:opacity-20 transition-colors"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveModel(globalIndex, 'down')}
                    disabled={globalIndex === (localOrder ?? unifiedModels).length - 1}
                    className="p-1 rounded hover:bg-muted disabled:opacity-20 transition-colors"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Preview image */}
                <div className="w-16 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                  <img
                    src={getOptimizedUrl(model.imageUrl, { quality: 60 })}
                    alt={model.name}
                    className="w-full h-full object-cover"
                  />
                </div>

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
                            <button onClick={() => handleDelete(model)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
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
      </div>
    </TooltipProvider>
  );
}
