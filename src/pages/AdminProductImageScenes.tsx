import { useState, useMemo, useRef } from 'react';
import { useProductImageScenes, type DbScene } from '@/hooks/useProductImageScenes';
import ImportFromScenesModal from '@/components/app/ImportFromScenesModal';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  Search, Plus, ChevronDown, ChevronRight, ArrowUp, ArrowDown,
  Eye, EyeOff, Pencil, Save, X, Check, Layers, Info, Upload, Camera, Filter, ExternalLink, Trash2, Copy, Import, Palette, Shirt,
} from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Link } from 'react-router-dom';

const SCENE_TYPES = ['macro', 'packshot', 'portrait', 'lifestyle', 'editorial', 'flatlay'];
const CATEGORIES = [
  { value: 'fragrance', label: 'Fragrance' },
  { value: 'beauty-skincare', label: 'Beauty & Skincare' },
  { value: 'makeup-lipsticks', label: 'Makeup & Lipsticks' },
  { value: 'bags-accessories', label: 'Bags & Accessories' },
  { value: 'hats-small', label: 'Hats & Small Accessories' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'garments', label: 'Clothing & Apparel' },
  { value: 'home-decor', label: 'Home Decor' },
  { value: 'tech-devices', label: 'Tech / Devices' },
  { value: 'food', label: 'Food & Snacks' },
  { value: 'beverages', label: 'Beverages' },
  { value: 'supplements-wellness', label: 'Supplements & Wellness' },
  { value: 'other', label: 'Other / Custom' },
];
import { ALL_TRIGGER_KEYS } from '@/components/app/product-images/detailBlockConfig';
const TRIGGER_BLOCKS = ALL_TRIGGER_KEYS;

const CAT_LABEL_MAP: Record<string, string> = {};
CATEGORIES.forEach(c => { CAT_LABEL_MAP[c.value] = c.label; });



function emptyScene(): Partial<DbScene> & { scene_id: string } {
  return {
    scene_id: '',
    title: '',
    description: '',
    prompt_template: '',
    trigger_blocks: ['background'],
    category_collection: null,
    scene_type: 'packshot',
    preview_image_url: null,
    is_active: true,
    sort_order: 999,
    sub_category: null,
    category_sort_order: 0,
    requires_extra_reference: false,
    sub_category_sort_order: 0,
    use_scene_reference: false,
  };
}

/** Group scenes by sub_category within a flat array, sorted by sub_category_sort_order (empty label last) */
function groupBySubCategory(scenes: DbScene[]): { label: string; scenes: DbScene[]; sortOrder: number }[] {
  const map = new Map<string, DbScene[]>();
  for (const s of scenes) {
    const key = s.sub_category || '';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  }
  return Array.from(map.entries())
    .map(([label, sc]) => {
      const groupOrder = Math.min(...sc.map(s => s.sub_category_sort_order ?? 0));
      return { label: label || 'Uncategorized', scenes: sc, sortOrder: groupOrder, _isEmpty: !label };
    })
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(({ label, scenes: sc, sortOrder }) => ({ label, scenes: sc, sortOrder }));
}

/** Build inline sub-category summary string: "Essential Shots (6), Hero Scenes (4)" */
function subCategorySummary(scenes: DbScene[]): string {
  const map = new Map<string, number>();
  for (const s of scenes) {
    const key = s.sub_category || 'Uncategorized';
    map.set(key, (map.get(key) || 0) + 1);
  }
  return Array.from(map.entries()).map(([label, count]) => `${label} (${count})`).join(', ');
}

export default function AdminProductImageScenes() {
  const { isAdmin } = useIsAdmin();
  const { rawScenes, isLoading, updateScene, upsertScene, deleteScene } = useProductImageScenes();
  const [search, setSearch] = useState('');
  const [showHidden, setShowHidden] = useState(false);
  const [previewCategory, setPreviewCategory] = useState<string>('__all__');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<DbScene>>({});
  const [addingNew, setAddingNew] = useState(false);
  const [newDraft, setNewDraft] = useState(emptyScene());
  const [importTarget, setImportTarget] = useState<{ category: string; label: string; sortOrder: number } | null>(null);

  // Derive sub-categories grouped by category_collection
  const subCategoriesByCategory = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const s of rawScenes) {
      if (s.sub_category && s.category_collection) {
        if (!map.has(s.category_collection)) map.set(s.category_collection, new Set());
        map.get(s.category_collection)!.add(s.sub_category);
      }
    }
    return new Map(Array.from(map.entries()).map(([k, v]) => [k, Array.from(v).sort()]));
  }, [rawScenes]);

  const handleAddNewForCategory = (categoryKey: string, categorySortOrder: number) => {
    const draft = emptyScene();
    draft.category_collection = categoryKey;
    draft.category_sort_order = categorySortOrder;
    setNewDraft(draft);
    setAddingNew(true);
    // Expand that section
    setExpandedSections(prev => new Set(prev).add(categoryKey));
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  // showTokenRef state removed — tokens now on dedicated page

  const filtered = useMemo(() => {
    let scenes = rawScenes;
    if (!showHidden) scenes = scenes.filter(s => s.is_active);
    if (search) {
      const q = search.toLowerCase();
      scenes = scenes.filter(s =>
        s.scene_id.toLowerCase().includes(q) ||
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
      );
    }
    if (previewCategory !== '__all__') {
      scenes = scenes.filter(s => s.category_collection === previewCategory);
    }
    return scenes;
  }, [rawScenes, showHidden, search, previewCategory]);

  // Group by category, sorted by most recently edited
  const groupedEntries = useMemo(() => {
    const map = new Map<string, DbScene[]>();
    for (const s of filtered) {
      const key = s.category_collection || 'other';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }

    return Array.from(map.entries())
      .map(([key, scenes]) => {
        const sortedScenes = [...scenes].sort(
          (a, b) =>
            new Date(b.updated_at ?? b.created_at).getTime() -
            new Date(a.updated_at ?? a.created_at).getTime()
        );
        return {
          key,
          scenes: sortedScenes,
          latestUpdatedAt: Math.max(
            ...sortedScenes.map(s => new Date(s.updated_at ?? s.created_at).getTime())
          ),
          categorySortOrder: Math.min(
            ...sortedScenes.map(s => s.category_sort_order ?? 0)
          ),
        };
      })
      .sort((a, b) =>
        b.latestUpdatedAt - a.latestUpdatedAt ||
        a.categorySortOrder - b.categorySortOrder
      );
  }, [filtered]);

  // Keep a Map reference for move/reorder helpers
  const grouped = useMemo(() => {
    const map = new Map<string, DbScene[]>();
    for (const entry of groupedEntries) {
      map.set(entry.key, entry.scenes);
    }
    return map;
  }, [groupedEntries]);

  const toggleSection = (id: string) => {
    const next = new Set(expandedSections);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedSections(next);
  };

  const startEdit = (scene: DbScene) => {
    setEditingId(scene.id);
    setEditDraft({ ...scene });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft({});
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      await updateScene.mutateAsync({ id: editingId, updates: editDraft });
      toast.success('Scene updated');
      cancelEdit();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const saveNew = async () => {
    if (!newDraft.scene_id || !newDraft.title) {
      toast.error('Scene ID and Title are required');
      return;
    }
    try {
      await upsertScene.mutateAsync(newDraft as any);
      toast.success('Scene created');
      setAddingNew(false);
      setNewDraft(emptyScene());
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDuplicate = async (scene: DbScene) => {
    const existingIds = new Set(rawScenes.map(s => s.scene_id));
    let newId = `${scene.scene_id}-copy`;
    let counter = 2;
    while (existingIds.has(newId)) {
      newId = `${scene.scene_id}-copy-${counter}`;
      counter++;
    }
    try {
      await upsertScene.mutateAsync({
        scene_id: newId,
        title: `${scene.title} (copy)`,
        description: scene.description,
        prompt_template: scene.prompt_template,
        trigger_blocks: scene.trigger_blocks,
        category_collection: scene.category_collection,
        scene_type: scene.scene_type,
        preview_image_url: scene.preview_image_url,
        is_active: scene.is_active,
        sort_order: scene.sort_order + 1,
        sub_category: scene.sub_category,
        category_sort_order: scene.category_sort_order,
        requires_extra_reference: scene.requires_extra_reference,
        sub_category_sort_order: scene.sub_category_sort_order,
        use_scene_reference: scene.use_scene_reference ?? false,
      });
      toast.success(`Duplicated as ${newId}`);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleToggleActive = async (scene: DbScene) => {
    try {
      await updateScene.mutateAsync({ id: scene.id, updates: { is_active: !scene.is_active } });
      toast.success(scene.is_active ? 'Scene hidden' : 'Scene visible');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleMove = async (scene: DbScene, direction: 'up' | 'down') => {
    const key = scene.category_collection || 'other';
    const group = grouped.get(key) || [];
    const idx = group.findIndex(s => s.id === scene.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= group.length) return;
    
    const a = group[idx];
    const b = group[swapIdx];
    try {
      await Promise.all([
        updateScene.mutateAsync({ id: a.id, updates: { sort_order: b.sort_order } }),
        updateScene.mutateAsync({ id: b.id, updates: { sort_order: a.sort_order } }),
      ]);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleMoveSubCategory = async (categoryKey: string, subLabel: string, direction: 'up' | 'down') => {
    const catScenes = grouped.get(categoryKey) || [];
    const subGroups = groupBySubCategory(catScenes);
    const idx = subGroups.findIndex(g => g.label === subLabel);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= subGroups.length) return;

    const a = subGroups[idx];
    const b = subGroups[swapIdx];
    const newOrderA = b.sortOrder;
    const newOrderB = a.sortOrder;
    // If both have the same sortOrder, force different values
    const finalA = newOrderA === newOrderB ? (direction === 'up' ? newOrderB - 1 : newOrderB + 1) : newOrderA;
    const finalB = newOrderA === newOrderB ? newOrderB : newOrderB;

    // Bulk update all scenes in both sub-categories
    const scenesA = a.scenes.map(s => s.id);
    const scenesB = b.scenes.map(s => s.id);
    try {
      await Promise.all([
        supabase.from('product_image_scenes' as any).update({ sub_category_sort_order: finalA } as any).in('id', scenesA),
        supabase.from('product_image_scenes' as any).update({ sub_category_sort_order: finalB } as any).in('id', scenesB),
      ]);
      // Invalidate queries
      await updateScene.mutateAsync({ id: scenesA[0], updates: { sub_category_sort_order: finalA } });
      toast.success('Sub-category order updated');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  if (!isAdmin) {
    return <div className="p-8 text-center text-muted-foreground">Admin access required</div>;
  }

  const catLabel = (key: string) => CATEGORIES.find(c => c.value === key)?.label || key;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Product Visual Scenes</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage all scene definitions for the Product Visuals flow.</p>
        </div>
        <Button onClick={() => setAddingNew(true)} size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" /> Add Scene
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search scenes..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <Select value={previewCategory} onValueChange={setPreviewCategory}>
            <SelectTrigger className="w-[180px] h-9 text-xs">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All categories</SelectItem>
              {CATEGORIES.map(c => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={showHidden} onCheckedChange={setShowHidden} id="show-hidden" />
          <Label htmlFor="show-hidden" className="text-xs">Show hidden</Label>
        </div>
        <Link to="/app/admin/prompt-tokens" target="_blank" className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline">
          <Info className="w-3.5 h-3.5" /> Token Reference <ExternalLink className="w-3 h-3" />
        </Link>
        <Badge variant="secondary" className="text-xs">{filtered.length} scenes</Badge>
      </div>
      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
        <Info className="w-3 h-3" /> Sub-categories can be reordered with the arrows inside each category section. New sub-categories are created by typing a name in any scene's "Sub-Category" field.
      </p>
      {/* Add new form */}
      {addingNew && (
        <Card className="border-primary/30">
          <CardContent className="py-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">New Scene {newDraft.category_collection && <span className="text-muted-foreground font-normal text-sm">in {catLabel(newDraft.category_collection)}</span>}</h3>
              <Button variant="ghost" size="icon" onClick={() => setAddingNew(false)}><X className="w-4 h-4" /></Button>
            </div>
            <SceneForm draft={newDraft} onChange={setNewDraft as any} allSubCategories={subCategoriesByCategory.get(newDraft.category_collection || '') || []} />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setAddingNew(false)}>Cancel</Button>
              <Button onClick={saveNew} disabled={upsertScene.isPending} className="gap-1.5">
                <Save className="w-4 h-4" /> Create
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grouped sections */}
      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground">Loading scenes...</div>
      ) : (
        <div className="space-y-3">
          {groupedEntries.map(({ key, scenes, categorySortOrder }) => {
            const subGroups = groupBySubCategory(scenes);
            const hasMultipleSubGroups = subGroups.length > 1 || (subGroups.length === 1 && subGroups[0].label !== 'Uncategorized');
            const summary = subCategorySummary(scenes);

            return (
              <Collapsible key={key} open={expandedSections.has(key)} onOpenChange={() => toggleSection(key)}>
                <div className="flex items-center gap-1.5">
                  <CollapsibleTrigger className="flex-1">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Layers className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-semibold">{catLabel(key)}</span>
                        <Badge variant="secondary" className="text-[10px]">{scenes.length}</Badge>
                        {summary && (
                          <span className="text-[10px] text-muted-foreground">{summary}</span>
                        )}
                      </div>
                      {expandedSections.has(key) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </CollapsibleTrigger>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 text-xs shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImportTarget({ category: key, label: catLabel(key), sortOrder: categorySortOrder });
                    }}
                  >
                    <Import className="w-3.5 h-3.5" /> Import
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 text-xs shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddNewForCategory(key, categorySortOrder);
                    }}
                  >
                    <Plus className="w-3.5 h-3.5" /> New
                  </Button>
                </div>
                <CollapsibleContent>
                  <div className="pl-2 pt-2 space-y-3">
                    {hasMultipleSubGroups ? (
                      subGroups.map((sg, sgIdx) => (
                        <div key={sg.label}>
                          <div className="flex items-center gap-2 mb-1.5 pl-1">
                            <div className="h-px flex-1 max-w-[60px] bg-border" />
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{sg.label}</span>
                            <Badge variant="outline" className="text-[9px]">{sg.scenes.length}</Badge>
                            <div className="flex items-center gap-0.5">
                              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => handleMoveSubCategory(key, sg.label, 'up')} disabled={sgIdx === 0 || sg.label === 'Uncategorized'}>
                                <ArrowUp className="w-3 h-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => handleMoveSubCategory(key, sg.label, 'down')} disabled={sgIdx === subGroups.length - 1 || sg.label === 'Uncategorized'}>
                                <ArrowDown className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="h-px flex-1 bg-border" />
                          </div>
                          <div className="space-y-1.5">
                            {sg.scenes.map((scene, idx) => (
                              <SceneRow
                                key={scene.id}
                                scene={scene}
                                idx={idx}
                                total={sg.scenes.length}
                                editingId={editingId}
                                editDraft={editDraft}
                                onStartEdit={startEdit}
                                onCancelEdit={cancelEdit}
                                onSaveEdit={saveEdit}
                                onToggleActive={handleToggleActive}
                                onMove={handleMove}
                                onDelete={(id) => deleteScene.mutateAsync(id).then(() => toast.success('Scene deleted'))}
                                onDuplicate={handleDuplicate}
                                setEditDraft={setEditDraft}
                                updatePending={updateScene.isPending}
                                allSubCategories={subCategoriesByCategory.get(scene.category_collection || '') || []}
                              />
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="space-y-1.5">
                        {scenes.map((scene, idx) => (
                          <SceneRow
                            key={scene.id}
                            scene={scene}
                            idx={idx}
                            total={scenes.length}
                            editingId={editingId}
                            editDraft={editDraft}
                            onStartEdit={startEdit}
                            onCancelEdit={cancelEdit}
                            onSaveEdit={saveEdit}
                            onToggleActive={handleToggleActive}
                            onMove={handleMove}
                            onDelete={(id) => deleteScene.mutateAsync(id).then(() => toast.success('Scene deleted'))}
                            onDuplicate={handleDuplicate}
                            setEditDraft={setEditDraft}
                            updatePending={updateScene.isPending}
                            allSubCategories={subCategoriesByCategory.get(scene.category_collection || '') || []}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      )}

      {importTarget && (
        <ImportFromScenesModal
          open={!!importTarget}
          onOpenChange={(open) => { if (!open) setImportTarget(null); }}
          targetCategory={importTarget.category}
          targetCategoryLabel={importTarget.label}
          categorySortOrder={importTarget.sortOrder}
          existingSubCategories={subCategoriesByCategory.get(importTarget.category) || []}
          existingSceneIds={rawScenes.map(s => s.scene_id)}
        />
      )}
    </div>
  );
}

/* ── Scene row component ── */
function SceneRow({ scene, idx, total, editingId, editDraft, onStartEdit, onCancelEdit, onSaveEdit, onToggleActive, onMove, onDelete, onDuplicate, setEditDraft, updatePending, allSubCategories }: {
  scene: DbScene;
  idx: number;
  total: number;
  editingId: string | null;
  editDraft: Partial<DbScene>;
  onStartEdit: (s: DbScene) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onToggleActive: (s: DbScene) => void;
  onMove: (s: DbScene, dir: 'up' | 'down') => void;
  onDelete: (id: string) => void;
  onDuplicate: (s: DbScene) => void;
  setEditDraft: (d: Partial<DbScene>) => void;
  updatePending: boolean;
  allSubCategories: string[];
}) {
  return (
    <div>
      <div className={`flex items-start gap-3 p-2.5 rounded-lg border transition-colors ${
        !scene.is_active ? 'opacity-50 border-dashed' : 'border-border'
      } ${editingId === scene.id ? 'border-primary/40 bg-primary/[0.02]' : 'hover:bg-muted/20'}`}>
        {/* Thumbnail */}
        <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex items-center justify-center flex-shrink-0 border border-border/40 mt-0.5">
          {scene.preview_image_url ? (
            <img src={scene.preview_image_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <Camera className="w-4 h-4 text-muted-foreground/40" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium truncate">{scene.title}</span>
            <Badge variant="outline" className="text-[10px]">{scene.scene_type}</Badge>
            {scene.sub_category && (
              <Badge variant="secondary" className="text-[10px]">{scene.sub_category}</Badge>
            )}
            <code className="text-[10px] text-muted-foreground font-mono">{scene.scene_id}</code>
            {!scene.is_active && <Badge variant="destructive" className="text-[10px]">Hidden</Badge>}
            {(scene as any).requires_extra_reference && <Badge variant="outline" className="text-[10px] gap-0.5"><Camera className="w-2.5 h-2.5" />Extra ref</Badge>}
            {(scene as any).use_scene_reference && <Badge variant="outline" className="text-[10px] gap-0.5 border-primary/40 text-primary">🖼 Scene ref</Badge>}
          </div>
          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
            Triggers: {scene.trigger_blocks.join(', ')}
            {scene.category_sort_order > 0 && ` · Cat order: ${scene.category_sort_order}`}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onMove(scene, 'up')} disabled={idx === 0}>
            <ArrowUp className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onMove(scene, 'down')} disabled={idx === total - 1}>
            <ArrowDown className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => editingId === scene.id ? onCancelEdit() : onStartEdit(scene)}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDuplicate(scene)} title="Duplicate scene">
            <Copy className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onToggleActive(scene)}>
            {scene.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete scene permanently?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove <strong>{scene.title}</strong> ({scene.scene_id}). This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => onDelete(scene.id)}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Inline edit form */}
      {editingId === scene.id && (
        <Card className="mt-1.5 border-primary/20">
          <CardContent className="py-4 space-y-4">
            <SceneForm draft={editDraft} onChange={setEditDraft as any} allSubCategories={allSubCategories} />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={onCancelEdit}>Cancel</Button>
              <Button onClick={onSaveEdit} disabled={updatePending} className="gap-1.5">
                <Save className="w-4 h-4" /> Save
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ── Reusable scene edit form ── */
function SceneForm({ draft, onChange, allSubCategories = [] }: { draft: Partial<DbScene>; onChange: (d: Partial<DbScene>) => void; allSubCategories?: string[] }) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [creatingSubCat, setCreatingSubCat] = useState(false);
  const set = (field: string, value: any) => onChange({ ...draft, [field]: value });

  const handleImageUpload = async (file: File) => {
    if (!user) return;
    setUploading(true);
    try {
      const ts = Date.now();
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const sceneSlug = draft.scene_id || 'new';
      const path = `${user.id}/scene-previews/${sceneSlug}-${ts}.${ext}`;
      const { data, error } = await supabase.storage.from('product-uploads').upload(path, file, { cacheControl: '3600', upsert: false });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('product-uploads').getPublicUrl(data.path);
      set('preview_image_url', urlData.publicUrl);
      toast.success('Preview image uploaded');
    } catch (e: any) {
      toast.error(e.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Scene ID (unique slug)</Label>
          <Input value={draft.scene_id || ''} onChange={e => set('scene_id', e.target.value)} placeholder="e.g. fragrance_hero_surface" className="font-mono text-xs" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Title</Label>
          <Input value={draft.title || ''} onChange={e => set('title', e.target.value)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Description</Label>
        <Input value={draft.description || ''} onChange={e => set('description', e.target.value)} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Scene Type</Label>
          <Select value={draft.scene_type || 'packshot'} onValueChange={v => set('scene_type', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {SCENE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Category</Label>
          <Select
            value={draft.category_collection || 'other'}
            onValueChange={v => set('category_collection', v)}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Sort Order</Label>
          <Input type="number" value={draft.sort_order ?? 0} onChange={e => set('sort_order', parseInt(e.target.value) || 0)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Sub-Category (grouping label)</Label>
          {creatingSubCat ? (
            <div className="flex gap-1.5">
              <Input
                autoFocus
                value={draft.sub_category || ''}
                onChange={e => set('sub_category', e.target.value || null)}
                placeholder="Type new sub-category name..."
                className="text-xs"
              />
              <Button variant="ghost" size="sm" className="h-9 px-2 shrink-0" disabled={!draft.sub_category?.trim()} onClick={() => setCreatingSubCat(false)}>
                <Check className="w-3.5 h-3.5 text-green-600" />
              </Button>
              <Button variant="ghost" size="sm" className="h-9 px-2 shrink-0" onClick={() => { set('sub_category', null); setCreatingSubCat(false); }}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          ) : (
            <Select
              value={draft.sub_category || '__none__'}
              onValueChange={v => {
                if (v === '__create_new__') {
                  set('sub_category', '');
                  setCreatingSubCat(true);
                } else if (v === '__none__') {
                  set('sub_category', null);
                } else {
                  set('sub_category', v);
                }
              }}
            >
              <SelectTrigger className="text-xs"><SelectValue placeholder="Select sub-category..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">None</SelectItem>
                {[...allSubCategories, ...(draft.sub_category && !allSubCategories.includes(draft.sub_category) ? [draft.sub_category] : [])].map(sc => (
                  <SelectItem key={sc} value={sc}>{sc}</SelectItem>
                ))}
                <SelectItem value="__create_new__">＋ Create new...</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Category Sort Order (section position)</Label>
          <Input type="number" value={draft.category_sort_order ?? 0} onChange={e => set('category_sort_order', parseInt(e.target.value) || 0)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Trigger Blocks</Label>
        <div className="flex flex-wrap gap-2">
          {TRIGGER_BLOCKS.map(block => {
            const checked = (draft.trigger_blocks || []).includes(block);
            return (
              <label key={block} className="flex items-center gap-1.5 text-xs cursor-pointer">
                <Checkbox
                  checked={checked}
                  onCheckedChange={(v) => {
                    const current = draft.trigger_blocks || [];
                    set('trigger_blocks', v ? [...current, block] : current.filter(b => b !== block));
                  }}
                />
                {block}
              </label>
            );
          })}
        </div>
      </div>

      {/* Curator's Picks — only visible when aestheticColor trigger is active */}
      {(draft.trigger_blocks || []).includes('aestheticColor') && (
        <div className="space-y-2 p-3 bg-muted/30 rounded-lg border border-border/40">
          <Label className="text-xs font-semibold flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5" />
            Curator's Picks (Suggested Colors)
          </Label>
          <p className="text-[11px] text-muted-foreground">Recommended colors shown to users above generic presets for this scene.</p>
          {((draft as any).suggested_colors || []).map((pick: {hex: string; label: string}, idx: number) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-6 h-6 rounded border border-border flex-shrink-0" style={{ backgroundColor: pick.hex }} />
              <Input
                value={pick.hex}
                onChange={e => {
                  const arr = [...((draft as any).suggested_colors || [])];
                  arr[idx] = { ...arr[idx], hex: e.target.value };
                  set('suggested_colors' as any, arr);
                }}
                className="w-24 text-xs font-mono h-8"
                placeholder="#5F8A8B"
              />
              <Input
                value={pick.label}
                onChange={e => {
                  const arr = [...((draft as any).suggested_colors || [])];
                  arr[idx] = { ...arr[idx], label: e.target.value };
                  set('suggested_colors' as any, arr);
                }}
                className="flex-1 text-xs h-8"
                placeholder="Color name"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  const arr = [...((draft as any).suggested_colors || [])];
                  arr.splice(idx, 1);
                  set('suggested_colors' as any, arr.length ? arr : null);
                }}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs gap-1.5"
            onClick={() => {
              const arr = [...((draft as any).suggested_colors || [])];
              arr.push({ hex: '#888888', label: '' });
              set('suggested_colors' as any, arr);
            }}
          >
            <Plus className="w-3.5 h-3.5" /> Add color
          </Button>
        </div>
      )}

      {/* Scene Outfit Direction — universal override, always visible */}
      {(
        <div className="space-y-2 p-3 bg-muted/30 rounded-lg border border-border/40">
          <Label className="text-xs font-semibold flex items-center gap-1.5">
            <Shirt className="w-3.5 h-3.5" />
            Scene Outfit Direction
          </Label>
          <p className="text-[11px] text-muted-foreground">
            Override the standard outfit lock for this scene. Supports dynamic tokens: <code className="bg-muted px-1 rounded text-[10px]">{'{{aestheticColor}}'}</code>, <code className="bg-muted px-1 rounded text-[10px]">{'{{productName}}'}</code>. Leave empty to use the default outfit system.
          </p>
          <Textarea
            value={(draft as any).outfit_hint || ''}
            onChange={e => set('outfit_hint' as any, e.target.value || null)}
            className="font-mono text-xs min-h-[80px]"
            placeholder="e.g. coordinated sportswear in {{aestheticColor}} tones, clean minimal styling, no distracting graphics"
          />
        </div>
      )}

      <div className="space-y-1.5">
        <Label className="text-xs">Prompt Template</Label>
        <Textarea
          value={draft.prompt_template || ''}
          onChange={e => set('prompt_template', e.target.value)}
          className="font-mono text-xs min-h-[120px]"
          placeholder="Use {{tokens}} for dynamic content..."
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Preview Image</Label>
        <div
          className="flex items-start gap-4"
          onPaste={e => {
            const item = Array.from(e.clipboardData.items).find(i => i.type.startsWith('image/'));
            if (item) {
              e.preventDefault();
              const file = item.getAsFile();
              if (file) handleImageUpload(file);
            }
          }}
        >
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted border border-border/40 flex items-center justify-center flex-shrink-0 relative group cursor-pointer"
            tabIndex={0}
            title="Click here and paste (⌘V) to upload a screenshot"
          >
            {draft.preview_image_url ? (
              <img src={draft.preview_image_url} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <Camera className="w-6 h-6 text-muted-foreground/30" />
            )}
            <div className="absolute inset-0 bg-background/60 opacity-0 group-focus:opacity-100 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-[9px] font-medium text-muted-foreground">⌘V paste</span>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-3.5 h-3.5" />
                {uploading ? 'Uploading…' : 'Upload'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) handleImageUpload(f);
                  e.target.value = '';
                }}
              />
              {draft.preview_image_url && (
                <Button type="button" variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => set('preview_image_url', null)}>
                  Remove
                </Button>
              )}
            </div>
            <Input
              value={draft.preview_image_url || ''}
              onChange={e => set('preview_image_url', e.target.value || null)}
              placeholder="Or paste URL..."
              className="text-xs h-8"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Switch checked={draft.is_active ?? true} onCheckedChange={v => set('is_active', v)} id="active-toggle" />
        <Label htmlFor="active-toggle" className="text-xs">Active</Label>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <Checkbox
          checked={draft.requires_extra_reference ?? false}
          onCheckedChange={(v) => set('requires_extra_reference', !!v)}
          id="extra-ref-toggle"
        />
        <div>
          <Label htmlFor="extra-ref-toggle" className="text-xs font-medium cursor-pointer">Requires extra reference image</Label>
          <p className="text-[10px] text-muted-foreground mt-0.5">When selected, users will be asked to upload an additional product photo (e.g. back/side view) for this scene</p>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <Checkbox
          checked={(draft as any).use_scene_reference ?? false}
          onCheckedChange={(v) => set('use_scene_reference' as any, !!v)}
          id="scene-ref-toggle"
        />
        <div>
          <Label htmlFor="scene-ref-toggle" className="text-xs font-medium cursor-pointer">Use preview as generation reference</Label>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            The scene's preview image will be sent as a visual composition guide during generation — the AI will replicate the framing, lighting, and environment while swapping the product.
            {!draft.preview_image_url && <span className="text-destructive font-medium ml-1">⚠ Upload a preview image first</span>}
          </p>
        </div>
      </div>
    </div>
  );
}
