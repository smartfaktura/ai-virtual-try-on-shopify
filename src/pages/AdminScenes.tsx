import { useState, useMemo, useEffect, useCallback } from 'react';
import { Navigate, Link } from 'react-router-dom';
import {
  ArrowUp, ArrowDown, ChevronsUp, Trash2, Save, Loader2, Plus,
  Search, Copy, Eye, EyeOff, ChevronDown, ChevronRight, Pencil, Check, X, Info,
  ImageIcon, RotateCcw,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useHiddenScenes } from '@/hooks/useHiddenScenes';
import { useCustomScenes } from '@/hooks/useCustomScenes';
import { useSceneSortOrder, useSaveSceneSortOrder } from '@/hooks/useSceneSortOrder';
import { useSceneCategories, useAddSceneCategory, useDeleteSceneCategory, useUpdateSceneCategory, useUpsertCategoryLabel, slugify } from '@/hooks/useSceneCategories';
import { mockTryOnPoses, poseCategoryLabels } from '@/data/mockData';
import type { TryOnPose, PoseCategory } from '@/types';
import { toast } from '@/lib/brandedToast';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { useDeleteCustomScene, useUpdateCustomScene } from '@/hooks/useCustomScenes';

const ON_MODEL_CATEGORIES = ['studio', 'lifestyle', 'editorial', 'streetwear'];

interface WorkflowInfo {
  name: string;
  slug: string;
  uses_tryon: boolean;
  generation_config: any;
}

function getWorkflowsForScene(category: string, workflows: WorkflowInfo[]): WorkflowInfo[] {
  const isOnModel = ON_MODEL_CATEGORIES.includes(category);
  return workflows.filter(wf => {
    if (isOnModel && wf.uses_tryon) return true;
    if (!isOnModel && wf.slug === 'product-listing-set') return true;
    // Check if workflow has show_scene_picker or show_pose_picker in ui_config
    const uiConfig = wf.generation_config?.ui_config;
    if (uiConfig?.show_scene_picker || uiConfig?.show_pose_picker) return true;
    return false;
  });
}

function getCategoryWorkflowHint(category: string): string {
  return ON_MODEL_CATEGORIES.includes(category) ? '→ Try-On' : '→ Product';
}

export default function AdminScenes() {
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { hiddenIds, hiddenBuiltInScenes, hideScene, unhideScene } = useHiddenScenes();
  const { asPoses: customPoses, scenes: customScenesRaw } = useCustomScenes();
  const { sortMap, categoryMap } = useSceneSortOrder();
  const saveSortOrder = useSaveSceneSortOrder();
  const deleteSceneMutation = useDeleteCustomScene();
  const updateSceneMutation = useUpdateCustomScene();
  const { allCategoryLabels, allCategorySlugs, customCategories } = useSceneCategories();
  const addCategoryMutation = useAddSceneCategory();
  const updateCategoryMutation = useUpdateSceneCategory();
  const upsertCategoryLabel = useUpsertCategoryLabel();
  const deleteCategoryMutation = useDeleteSceneCategory();

  // Fetch workflows for workflow indicator badges
  const { data: workflows = [] } = useQuery({
    queryKey: ['workflows-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflows')
        .select('name, slug, uses_tryon, generation_config')
        .eq('is_system', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data as unknown as WorkflowInfo[]) ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingCatSlug, setEditingCatSlug] = useState<string | null>(null);
  const [editingCatLabel, setEditingCatLabel] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [showHidden, setShowHidden] = useState(false);
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editingNameValue, setEditingNameValue] = useState('');

  // Track prompt_hint and prompt_only edits for custom scenes
  const [promptEdits, setPromptEdits] = useState<Record<string, { prompt_hint?: string; prompt_only?: boolean }>>({});
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);

  // Stable deps
  const hiddenKey = JSON.stringify(hiddenIds);
  const sortKey = JSON.stringify([...sortMap.entries()]);
  const categoryOverrideKey = JSON.stringify([...categoryMap.entries()]);
  const customKey = JSON.stringify(customPoses.map(p => p.poseId));

  const allPoses = useMemo(() => {
    const visible = mockTryOnPoses.filter(p => !hiddenIds.includes(p.poseId));
    const combined = [...visible, ...customPoses];
    const withOverrides = combined.map(p => {
      const override = categoryMap.get(p.poseId);
      if (override) return { ...p, category: override as PoseCategory };
      return p;
    });
    return [...withOverrides].sort((a, b) => {
      const sa = sortMap.get(a.poseId) ?? 9999;
      const sb = sortMap.get(b.poseId) ?? 9999;
      if (sa !== sb) return sa - sb;
      return 0;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hiddenKey, sortKey, categoryOverrideKey, customKey]);

  const defaultCategoryOrder = allCategorySlugs as PoseCategory[];

  const [orderedPoses, setOrderedPoses] = useState<TryOnPose[]>([]);
  const [categoryOrder, setCategoryOrder] = useState<PoseCategory[]>(defaultCategoryOrder);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (allPoses.length > 0) {
      setOrderedPoses(allPoses);
      if (sortMap.size > 0) {
        const catMinOrder = new Map<string, number>();
        allPoses.forEach(p => {
          const order = sortMap.get(p.poseId) ?? 9999;
          const current = catMinOrder.get(p.category);
          if (current === undefined || order < current) {
            catMinOrder.set(p.category, order);
          }
        });
        const derived = [...catMinOrder.entries()]
          .sort((a, b) => a[1] - b[1])
          .map(([cat]) => cat as PoseCategory);
        const remaining = defaultCategoryOrder.filter(c => !derived.includes(c));
        setCategoryOrder([...derived, ...remaining]);
      }
      setDirty(false);
    }
  }, [allPoses]);

  if (adminLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );
  if (!isAdmin) return <Navigate to="/app" replace />;

  const isCustomScene = (poseId: string) => poseId.startsWith('custom-');
  const isPromptOnly = (pose: TryOnPose) => pose.promptOnly === true;

  const movePose = (poseId: string, direction: 'up' | 'down') => {
    setOrderedPoses(prev => {
      const pose = prev.find(p => p.poseId === poseId);
      if (!pose) return prev;
      const catPoses = prev.filter(p => p.category === pose.category);
      const idx = catPoses.findIndex(p => p.poseId === poseId);
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= catPoses.length) return prev;
      const swapPose = catPoses[swapIdx];
      const globalIdxA = prev.findIndex(p => p.poseId === poseId);
      const globalIdxB = prev.findIndex(p => p.poseId === swapPose.poseId);
      const result = [...prev];
      result[globalIdxA] = swapPose;
      result[globalIdxB] = pose;
      return result;
    });
    setDirty(true);
  };

  const movePoseToTop = (poseId: string) => {
    setOrderedPoses(prev => {
      const pose = prev.find(p => p.poseId === poseId);
      if (!pose) return prev;
      const withoutPose = prev.filter(p => p.poseId !== poseId);
      const firstCatIdx = withoutPose.findIndex(p => p.category === pose.category);
      const result = [...withoutPose];
      result.splice(firstCatIdx >= 0 ? firstCatIdx : 0, 0, pose);
      return result;
    });
    setDirty(true);
  };

  const changePoseCategory = (poseId: string, newCategory: PoseCategory) => {
    setOrderedPoses(prev =>
      prev.map(p => p.poseId === poseId ? { ...p, category: newCategory } : p)
    );
    setDirty(true);
  };

  const duplicateToCategory = (pose: TryOnPose, targetCategory: PoseCategory) => {
    const cloneId = `${pose.poseId}__dup_${targetCategory}`;
    // Check if already exists
    if (orderedPoses.some(p => p.poseId === cloneId)) {
      toast.error('Already duplicated to that category');
      return;
    }
    const clone: TryOnPose = { ...pose, poseId: cloneId, category: targetCategory };
    setOrderedPoses(prev => [...prev, clone]);
    setDirty(true);
    toast.success(`Duplicated "${pose.name}" → ${allCategoryLabels[targetCategory] || targetCategory}`);
  };

  const moveCategoryOrder = (cat: PoseCategory, direction: 'up' | 'down') => {
    setCategoryOrder(prev => {
      const idx = prev.indexOf(cat);
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= prev.length) return prev;
      const result = [...prev];
      [result[idx], result[swapIdx]] = [result[swapIdx], result[idx]];
      return result;
    });
    setDirty(true);
  };

  const handleDelete = async (pose: TryOnPose) => {
    // If it's a duplicate clone, just remove from local state
    if (pose.poseId.includes('__dup_')) {
      setOrderedPoses(prev => prev.filter(p => p.poseId !== pose.poseId));
      setDirty(true);
      toast.success(`Removed duplicate "${pose.name}"`);
      return;
    }
    const isCustom = isCustomScene(pose.poseId);
    if (isCustom) {
      const realId = pose.poseId.replace('custom-', '');
      deleteSceneMutation.mutate(realId, {
        onSuccess: () => toast.success(`Deleted "${pose.name}"`),
        onError: () => toast.error('Failed to delete scene'),
      });
    } else {
      hideScene.mutate(pose.poseId, {
        onSuccess: () => toast.success(`Hidden "${pose.name}"`),
        onError: () => toast.error('Failed to hide scene'),
      });
    }
  };

  const handleRestoreScene = (sceneId: string) => {
    unhideScene.mutate(sceneId, {
      onSuccess: () => toast.success('Scene restored'),
      onError: () => toast.error('Failed to restore scene'),
    });
  };

  const startEditName = (pose: TryOnPose) => {
    setEditingNameId(pose.poseId);
    setEditingNameValue(pose.name);
  };

  const commitEditName = () => {
    if (editingNameId && editingNameValue.trim()) {
      setOrderedPoses(prev =>
        prev.map(p => p.poseId === editingNameId ? { ...p, name: editingNameValue.trim() } : p)
      );
      setDirty(true);
    }
    setEditingNameId(null);
    setEditingNameValue('');
  };

  const cancelEditName = () => {
    setEditingNameId(null);
    setEditingNameValue('');
  };

  const handleSave = async () => {
    let globalOrder = 0;
    const entries: { scene_id: string; sort_order: number; category_override?: string | null }[] = [];
    for (const cat of categoryOrder) {
      const catPoses = orderedPoses.filter(p => p.category === cat);
      for (const pose of catPoses) {
        const originalPose = [...mockTryOnPoses, ...customPoses].find(p => p.poseId === pose.poseId);
        const originalCategory = originalPose?.category;
        const categoryOverride = originalCategory !== pose.category ? pose.category : null;
        entries.push({
          scene_id: pose.poseId,
          sort_order: globalOrder++,
          category_override: categoryOverride,
        });
      }
    }

    // Also persist any prompt_hint / prompt_only edits for custom scenes
    const promptUpdatePromises = Object.entries(promptEdits).map(([poseId, edits]) => {
      const realId = poseId.replace('custom-', '');
      return updateSceneMutation.mutateAsync({ id: realId, ...edits });
    });

    try {
      await Promise.all(promptUpdatePromises);
    } catch {
      toast.error('Failed to save scene prompt changes');
      return;
    }

    saveSortOrder.mutate(entries, {
      onSuccess: () => {
        toast.success('Sort order saved');
        setDirty(false);
        setPromptEdits({});
      },
      onError: () => toast.error('Failed to save sort order'),
    });
  };

  const updatePromptHint = (poseId: string, value: string) => {
    setPromptEdits(prev => ({
      ...prev,
      [poseId]: { ...prev[poseId], prompt_hint: value },
    }));
    setDirty(true);
  };

  const togglePromptOnly = (poseId: string, value: boolean) => {
    setPromptEdits(prev => ({
      ...prev,
      [poseId]: { ...prev[poseId], prompt_only: value },
    }));
    // Also update local orderedPoses so the UI reflects the change
    setOrderedPoses(prev =>
      prev.map(p => p.poseId === poseId ? { ...p, promptOnly: value } : p)
    );
    setDirty(true);
  };

  const activeCats = categoryOrder.filter(cat =>
    orderedPoses.some(p => p.category === cat)
  );

  // Filtered results
  const isSearching = searchQuery.trim().length > 0;
  const filteredPoses = isSearching
    ? orderedPoses.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : orderedPoses;

  return (
    <TooltipProvider>
      <div className="space-y-5">
        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold">Scene Manager</h1>
            <p className="text-xs text-muted-foreground">Reorder, categorize, duplicate, and manage scenes</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              onClick={handleSave}
              disabled={!dirty || saveSortOrder.isPending}
              size="sm"
              className="gap-1.5"
            >
              {saveSortOrder.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save
            </Button>
            <Link to="/app/admin/scene-upload">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Add Scene
              </Button>
            </Link>
          </div>
        </div>

        {/* ── SEARCH BAR ── */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search scenes by name…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {isSearching && (
          <p className="text-xs text-muted-foreground">{filteredPoses.length} result{filteredPoses.length !== 1 ? 's' : ''}</p>
        )}

        {/* ── CATEGORY ORDER (hidden during search) ── */}
        {!isSearching && (
          <div className="space-y-2">
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Category Order</h2>
            <div className="border border-border rounded-lg divide-y divide-border bg-card">
              {activeCats.map((cat, catIdx) => {
                const count = orderedPoses.filter(p => p.category === cat).length;
                const isCustomCat = customCategories.some(c => c.slug === cat);
                return (
                  <div key={cat} className="flex items-center gap-3 px-3 py-2">
                    <span className="text-muted-foreground text-xs select-none">≡</span>
                    {editingCatSlug === cat ? (
                      <div className="flex items-center gap-1.5 flex-1">
                        <Input
                          value={editingCatLabel}
                          onChange={e => setEditingCatLabel(e.target.value)}
                          className="h-7 text-sm flex-1"
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === 'Escape') { setEditingCatSlug(null); setEditingCatLabel(''); }
                            if (e.key === 'Enter' && editingCatLabel.trim()) {
                              const customCat = customCategories.find(c => c.slug === cat);
                              if (customCat) {
                                updateCategoryMutation.mutate({ id: customCat.id, label: editingCatLabel.trim() }, {
                                  onSuccess: () => { toast.success('Category renamed'); setEditingCatSlug(null); },
                                  onError: () => toast.error('Failed to rename'),
                                });
                              } else {
                                upsertCategoryLabel.mutate({ slug: cat, label: editingCatLabel.trim() }, {
                                  onSuccess: () => { toast.success('Category renamed'); setEditingCatSlug(null); },
                                  onError: () => toast.error('Failed to rename'),
                                });
                              }
                            }
                          }}
                        />
                        <Button
                          variant="ghost" size="icon" className="h-6 w-6 text-primary"
                          disabled={!editingCatLabel.trim()}
                          onClick={() => {
                            const customCat = customCategories.find(c => c.slug === cat);
                            if (customCat) {
                              updateCategoryMutation.mutate({ id: customCat.id, label: editingCatLabel.trim() }, {
                                onSuccess: () => { toast.success('Category renamed'); setEditingCatSlug(null); },
                                onError: () => toast.error('Failed to rename'),
                              });
                            } else {
                              upsertCategoryLabel.mutate({ slug: cat, label: editingCatLabel.trim() }, {
                                onSuccess: () => { toast.success('Category renamed'); setEditingCatSlug(null); },
                                onError: () => toast.error('Failed to rename'),
                              });
                            }
                          }}
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingCatSlug(null); setEditingCatLabel(''); }}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm font-medium flex-1 flex items-center gap-1.5">
                        {allCategoryLabels[cat] || cat} <span className="text-muted-foreground font-normal">({count})</span>
                        {isCustomCat && <Badge variant="secondary" className="text-[9px] h-4 px-1.5 bg-primary/10 text-primary border-0">Custom</Badge>}
                        <Button
                          variant="ghost" size="icon" className="h-5 w-5 ml-0.5"
                          onClick={() => { setEditingCatSlug(cat); setEditingCatLabel(allCategoryLabels[cat] || cat); }}
                          title="Edit category name"
                        >
                          <Pencil className="w-2.5 h-2.5" />
                        </Button>
                      </span>
                    )}
                    <Button variant="ghost" size="icon" className="h-6 w-6" disabled={catIdx === 0} onClick={() => moveCategoryOrder(cat, 'up')}>
                      <ArrowUp className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" disabled={catIdx === activeCats.length - 1} onClick={() => moveCategoryOrder(cat, 'down')}>
                      <ArrowDown className="w-3 h-3" />
                    </Button>
                    {isCustomCat && count === 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          const catRow = customCategories.find(c => c.slug === cat);
                          if (catRow) {
                            deleteCategoryMutation.mutate(catRow.id, {
                              onSuccess: () => toast.success(`Deleted category "${catRow.label}"`),
                              onError: () => toast.error('Failed to delete category'),
                            });
                          }
                        }}
                        title="Delete empty custom category"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add Category */}
            {showAddCategory ? (
              <div className="border border-border rounded-lg bg-card p-3 space-y-2">
                <Input
                  placeholder="Category name, e.g. Pet & Animal"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  className="h-8 text-sm"
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Escape') { setShowAddCategory(false); setNewCategoryName(''); }
                    if (e.key === 'Enter' && newCategoryName.trim()) {
                      addCategoryMutation.mutate(newCategoryName.trim(), {
                        onSuccess: () => {
                          toast.success(`Category "${newCategoryName.trim()}" created`);
                          setNewCategoryName('');
                          setShowAddCategory(false);
                        },
                        onError: (err: any) => toast.error(err?.message || 'Failed to create category'),
                      });
                    }
                  }}
                />
                {newCategoryName.trim() && (
                  <p className="text-[10px] text-muted-foreground">
                    Slug: <code className="bg-muted px-1 py-0.5 rounded text-[10px]">{slugify(newCategoryName)}</code>
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="h-7 text-xs gap-1"
                    disabled={!newCategoryName.trim() || addCategoryMutation.isPending}
                    onClick={() => {
                      addCategoryMutation.mutate(newCategoryName.trim(), {
                        onSuccess: () => {
                          toast.success(`Category "${newCategoryName.trim()}" created`);
                          setNewCategoryName('');
                          setShowAddCategory(false);
                        },
                        onError: (err: any) => toast.error(err?.message || 'Failed to create category'),
                      });
                    }}
                  >
                    {addCategoryMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    Create
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setShowAddCategory(false); setNewCategoryName(''); }}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => setShowAddCategory(true)}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Category
              </Button>
            )}
          </div>
        )}

        {/* ── SCENES ── */}
        {isSearching ? (
          /* Flat search results */
          <div className="space-y-2">
            <div className="border border-border rounded-lg divide-y divide-border bg-card">
              {filteredPoses.map((pose) => (
                <SceneRow
                  key={pose.poseId}
                  pose={pose}
                  idx={0}
                  totalInCategory={1}
                  isCustomScene={isCustomScene}
                  isPromptOnly={isPromptOnly}
                  editingNameId={editingNameId}
                  editingNameValue={editingNameValue}
                  setEditingNameValue={setEditingNameValue}
                  startEditName={startEditName}
                  commitEditName={commitEditName}
                  cancelEditName={cancelEditName}
                  movePose={movePose}
                  movePoseToTop={movePoseToTop}
                  changePoseCategory={changePoseCategory}
                  duplicateToCategory={duplicateToCategory}
                  handleDelete={handleDelete}
                   defaultCategoryOrder={defaultCategoryOrder}
                   categoryLabels={allCategoryLabels}
                   showReorderButtons={false}
                   promptEdits={promptEdits}
                   editingPromptId={editingPromptId}
                   setEditingPromptId={setEditingPromptId}
                   updatePromptHint={updatePromptHint}
                   togglePromptOnly={togglePromptOnly}
                   customScenesRaw={customScenesRaw}
                   workflows={workflows}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Category sections */
          activeCats.map((cat) => {
            const poses = orderedPoses.filter(p => p.category === cat);
            if (poses.length === 0) return null;
            return (
              <div key={cat} className="space-y-2">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {allCategoryLabels[cat] || cat} <span className="font-normal">({poses.length})</span>
                </h3>
                <div className="border border-border rounded-lg divide-y divide-border bg-card">
                  {poses.map((pose, idx) => (
                    <SceneRow
                      key={pose.poseId}
                      pose={pose}
                      idx={idx}
                      totalInCategory={poses.length}
                      isCustomScene={isCustomScene}
                      isPromptOnly={isPromptOnly}
                      editingNameId={editingNameId}
                      editingNameValue={editingNameValue}
                      setEditingNameValue={setEditingNameValue}
                      startEditName={startEditName}
                      commitEditName={commitEditName}
                      cancelEditName={cancelEditName}
                      movePose={movePose}
                      movePoseToTop={movePoseToTop}
                      changePoseCategory={changePoseCategory}
                      duplicateToCategory={duplicateToCategory}
                      handleDelete={handleDelete}
                       defaultCategoryOrder={defaultCategoryOrder}
                       categoryLabels={allCategoryLabels}
                       showReorderButtons={true}
                       promptEdits={promptEdits}
                       editingPromptId={editingPromptId}
                       setEditingPromptId={setEditingPromptId}
                       updatePromptHint={updatePromptHint}
                       togglePromptOnly={togglePromptOnly}
                       customScenesRaw={customScenesRaw}
                       workflows={workflows}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}

        {/* ── RESTORE HIDDEN SCENES ── */}
        {hiddenBuiltInScenes.length > 0 && (
          <Collapsible open={showHidden} onOpenChange={setShowHidden}>
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors py-2">
                {showHidden ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                <EyeOff className="w-3.5 h-3.5" />
                Hidden Scenes ({hiddenBuiltInScenes.length})
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="border border-border rounded-lg divide-y divide-border bg-card mt-1">
                {hiddenBuiltInScenes.map(scene => (
                  <div key={scene.poseId} className="flex items-center gap-3 px-3 py-2">
                    <div className="relative w-10 h-12 rounded bg-muted flex-shrink-0 overflow-hidden flex items-center justify-center">
                      <img src={getOptimizedUrl(scene.previewUrl, { quality: 60 })} alt={scene.name} className="w-full h-full object-cover opacity-50" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-muted-foreground">{scene.name}</p>
                      <p className="text-[10px] text-muted-foreground/60">{allCategoryLabels[scene.category] || scene.category}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 h-7 text-xs"
                      onClick={() => handleRestoreScene(scene.poseId)}
                    >
                      <Eye className="w-3 h-3" />
                      Restore
                    </Button>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </TooltipProvider>
  );
}

/* ── Scene Row Component ── */
interface SceneRowProps {
  pose: TryOnPose;
  idx: number;
  totalInCategory: number;
  isCustomScene: (id: string) => boolean;
  isPromptOnly: (pose: TryOnPose) => boolean;
  editingNameId: string | null;
  editingNameValue: string;
  setEditingNameValue: (v: string) => void;
  startEditName: (pose: TryOnPose) => void;
  commitEditName: () => void;
  cancelEditName: () => void;
  movePose: (id: string, dir: 'up' | 'down') => void;
  movePoseToTop: (id: string) => void;
  changePoseCategory: (id: string, cat: PoseCategory) => void;
  duplicateToCategory: (pose: TryOnPose, cat: PoseCategory) => void;
  handleDelete: (pose: TryOnPose) => void;
  defaultCategoryOrder: PoseCategory[];
  categoryLabels: Record<string, string>;
  showReorderButtons: boolean;
  promptEdits: Record<string, { prompt_hint?: string; prompt_only?: boolean }>;
  editingPromptId: string | null;
  setEditingPromptId: (id: string | null) => void;
  updatePromptHint: (poseId: string, value: string) => void;
  togglePromptOnly: (poseId: string, value: boolean) => void;
  customScenesRaw: import('@/hooks/useCustomScenes').CustomScene[];
  workflows: WorkflowInfo[];
}

function SceneRow({
  pose, idx, totalInCategory, isCustomScene, isPromptOnly,
  editingNameId, editingNameValue, setEditingNameValue,
  startEditName, commitEditName, cancelEditName,
  movePose, movePoseToTop, changePoseCategory, duplicateToCategory,
  handleDelete, defaultCategoryOrder, categoryLabels, showReorderButtons,
  promptEdits, editingPromptId, setEditingPromptId, updatePromptHint, togglePromptOnly, customScenesRaw, workflows,
}: SceneRowProps) {
  const isEditing = editingNameId === pose.poseId;
  const isDuplicate = pose.poseId.includes('__dup_');
  const isCustom = isCustomScene(pose.poseId);
  const [isUploadingPreview, setIsUploadingPreview] = useState(false);

  // Get the current prompt_hint value (edited or from DB)
  const rawScene = isCustom ? customScenesRaw.find(s => `custom-${s.id}` === pose.poseId) : null;
  const hasCustomPreview = !!(rawScene?.preview_image_url);
  const currentPromptHint = promptEdits[pose.poseId]?.prompt_hint ?? rawScene?.prompt_hint ?? pose.promptHint ?? '';
  const currentPromptOnly = promptEdits[pose.poseId]?.prompt_only ?? pose.promptOnly ?? false;
  const isEditingPrompt = editingPromptId === pose.poseId;
  const sceneWorkflows = useMemo(() => getWorkflowsForScene(pose.category, workflows), [pose.category, workflows]);

  const updateSceneMutation = useUpdateCustomScene();

  const handlePreviewUpload = async (file: File) => {
    if (!rawScene) return;
    setIsUploadingPreview(true);
    try {
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `scene-previews/${timestamp}-${randomId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('product-uploads')
        .upload(path, file, { cacheControl: '3600', upsert: false });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('product-uploads').getPublicUrl(path);

      await updateSceneMutation.mutateAsync({
        id: rawScene.id,
        preview_image_url: urlData.publicUrl,
      });
      toast.success('Preview image updated');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to upload preview');
    } finally {
      setIsUploadingPreview(false);
    }
  };

  const handleResetPreview = async () => {
    if (!rawScene) return;
    try {
      await updateSceneMutation.mutateAsync({
        id: rawScene.id,
        preview_image_url: null,
      });
      toast.success('Preview reset to original');
    } catch {
      toast.error('Failed to reset preview');
    }
  };

  return (
    <div className="flex items-center gap-2.5 px-3 py-2 group">
      {/* Thumbnail */}
      <div className="relative w-10 h-12 rounded bg-muted flex-shrink-0 overflow-hidden flex items-center justify-center">
        <img
          src={getOptimizedUrl(pose.previewUrl, { quality: 60 })}
          alt={pose.name}
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <span className="absolute text-[10px] font-medium text-muted-foreground pointer-events-none">{pose.name.charAt(0)}</span>
        {/* Preview upload overlay for custom scenes */}
        {isCustom && (
          <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            {isUploadingPreview ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <ImageIcon className="w-4 h-4 text-white" />
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handlePreviewUpload(f);
                e.target.value = '';
              }}
            />
          </label>
        )}
        {hasCustomPreview && (
          <Badge variant="secondary" className="absolute -top-1 -right-1 text-[7px] h-3 px-1 bg-primary text-primary-foreground border-0 leading-none">
            P
          </Badge>
        )}
      </div>

      {/* Name + metadata */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {isEditing ? (
            <div className="flex items-center gap-1">
              <Input
                value={editingNameValue}
                onChange={e => setEditingNameValue(e.target.value)}
                className="h-6 text-sm px-1.5 w-40"
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter') commitEditName();
                  if (e.key === 'Escape') cancelEditName();
                }}
              />
              <button onClick={commitEditName} className="text-primary hover:text-primary/80"><Check className="w-3.5 h-3.5" /></button>
              <button onClick={cancelEditName} className="text-muted-foreground hover:text-foreground"><X className="w-3.5 h-3.5" /></button>
            </div>
          ) : (
            <>
              <p className="text-sm font-medium truncate cursor-pointer" onDoubleClick={() => startEditName(pose)} title="Double-click to edit">
                {pose.name}
              </p>
              <button onClick={() => startEditName(pose)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
                <Pencil className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
        <div className="flex items-center gap-1 mt-0.5 flex-wrap">
          <Select value={pose.category} onValueChange={(val) => changePoseCategory(pose.poseId, val as PoseCategory)}>
            <SelectTrigger className="h-5 w-auto min-w-[100px] text-[10px] border-0 bg-muted/50 px-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel className="text-[9px] text-muted-foreground font-semibold">On-Model → Try-On Workflows</SelectLabel>
                {defaultCategoryOrder.filter(c => ON_MODEL_CATEGORIES.includes(c)).map(c => (
                  <SelectItem key={c} value={c} className="text-xs">
                    {categoryLabels[c] || c}
                  </SelectItem>
                ))}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel className="text-[9px] text-muted-foreground font-semibold">Product → Listing Workflows</SelectLabel>
                {defaultCategoryOrder.filter(c => !ON_MODEL_CATEGORIES.includes(c)).map(c => (
                  <SelectItem key={c} value={c} className="text-xs">
                    {categoryLabels[c] || c}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {isCustom && (
            <Badge variant="secondary" className="text-[9px] h-4 px-1.5 bg-primary/10 text-primary border-0">Custom</Badge>
          )}
          {isCustom ? (
            <div className="flex items-center gap-1">
              <Switch
                checked={currentPromptOnly}
                onCheckedChange={(val) => togglePromptOnly(pose.poseId, val)}
                className="h-4 w-7 data-[state=checked]:bg-amber-500"
              />
              <span className="text-[9px] text-muted-foreground">Prompt Only</span>
            </div>
          ) : (
            isPromptOnly(pose) && (
              <Badge variant="secondary" className="text-[9px] h-4 px-1.5 bg-amber-500/10 text-amber-600 border-0">Prompt Only</Badge>
            )
          )}
          {isDuplicate && (
            <Badge variant="secondary" className="text-[9px] h-4 px-1.5 bg-blue-500/10 text-blue-600 border-0">Duplicate</Badge>
          )}
          {/* Workflow indicator badges */}
          {sceneWorkflows.length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-0.5">
                  {sceneWorkflows.map(wf => (
                    <Badge key={wf.slug} variant="outline" className="text-[8px] h-3.5 px-1 font-normal text-muted-foreground border-border">
                      {wf.name}
                    </Badge>
                  ))}
                  <Info className="w-2.5 h-2.5 text-muted-foreground/50" />
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs">
                Scene appears in these workflows based on its category. Change category to move between workflows.
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        {/* Admin debug info */}
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <span
            className="text-[9px] font-mono text-muted-foreground/60 cursor-pointer hover:text-foreground truncate max-w-[120px]"
            onClick={() => { navigator.clipboard.writeText(pose.poseId); toast.success('ID copied'); }}
            title={`Click to copy: ${pose.poseId}`}
          >
            {pose.poseId.length > 20 ? pose.poseId.slice(0, 8) + '…' + pose.poseId.slice(-4) : pose.poseId}
          </span>
          {pose.previewUrl?.includes('/storage/v1/') ? (
            <span className="flex items-center gap-0.5 text-[9px] text-green-600/70">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />Storage
            </span>
          ) : (
            <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground/40">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 inline-block" />Local
            </span>
          )}
          {!isCustom && pose.promptHint && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-[9px] text-muted-foreground/50 italic truncate max-w-[200px] cursor-help">
                  "{pose.promptHint.slice(0, 60)}{pose.promptHint.length > 60 ? '…' : ''}"
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs whitespace-pre-wrap">{pose.promptHint}</TooltipContent>
            </Tooltip>
          )}
          {pose.optimizedImageUrl && (
            <Badge variant="secondary" className="text-[9px] h-4 px-1.5 bg-green-500/10 text-green-600 border-0">Optimized</Badge>
          )}
          {pose.created_at && (
            <span className="text-[9px] text-muted-foreground/40">
              {new Date(pose.created_at).toLocaleDateString()}
            </span>
          )}
        </div>
        {/* Inline prompt editor for custom scenes */}
        {isCustom && (
          <div className="mt-1.5">
            {isEditingPrompt ? (
              <div className="space-y-1">
                <Textarea
                  value={currentPromptHint}
                  onChange={e => updatePromptHint(pose.poseId, e.target.value)}
                  className="text-xs min-h-[60px] resize-y bg-muted/30 border-border/50"
                  placeholder="Enter prompt hint for this scene…"
                  rows={3}
                />
                <button
                  onClick={() => setEditingPromptId(null)}
                  className="text-[10px] text-primary hover:underline"
                >
                  Done editing
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingPromptId(pose.poseId)}
                className="text-left w-full group/prompt"
              >
                {currentPromptHint ? (
                  <p className="text-[10px] text-muted-foreground/70 italic line-clamp-2 group-hover/prompt:text-foreground transition-colors">
                    <span className="not-italic text-muted-foreground/40 mr-1">Prompt:</span>
                    {currentPromptHint}
                  </p>
                ) : (
                  <p className="text-[10px] text-destructive/60 group-hover/prompt:text-destructive transition-colors">
                    ⚠ No prompt hint — click to add
                  </p>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 flex-shrink-0">
        {/* Reset preview for custom scenes */}
        {isCustom && hasCustomPreview && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleResetPreview} title="Reset to original preview">
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-xs">Reset preview to original</TooltipContent>
          </Tooltip>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" title="Duplicate to category">
              <Copy className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-64 overflow-y-auto">
            {defaultCategoryOrder
              .filter(c => c !== pose.category)
              .map(c => (
                <DropdownMenuItem key={c} onClick={() => duplicateToCategory(pose, c)} className="text-xs">
                  {categoryLabels[c] || c}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {showReorderButtons && (
          <>
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={idx === 0} onClick={() => movePoseToTop(pose.poseId)} title="Move to top">
              <ChevronsUp className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={idx === 0} onClick={() => movePose(pose.poseId, 'up')}>
              <ArrowUp className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={idx === totalInCategory - 1} onClick={() => movePose(pose.poseId, 'down')}>
              <ArrowDown className="w-3.5 h-3.5" />
            </Button>
          </>
        )}
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(pose)}>
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
