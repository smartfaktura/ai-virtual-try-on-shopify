import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ChevronRight, ChevronLeft, Import, AlertTriangle, Sparkles, Loader2 } from 'lucide-react';
import { useCustomScenes, type CustomScene } from '@/hooks/useCustomScenes';
import { useProductImageScenes } from '@/hooks/useProductImageScenes';
import { ALL_TRIGGER_KEYS } from '@/components/app/product-images/detailBlockConfig';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SCENE_TYPES = ['macro', 'packshot', 'portrait', 'lifestyle', 'editorial', 'flatlay', 'stilllife', 'campaign'];

interface ImportConfig {
  scene_id: string;
  title: string;
  description: string;
  prompt_template: string;
  preview_image_url: string | null;
  scene_type: string;
  sub_category: string | null;
  sub_category_sort_order: number;
  trigger_blocks: string[];
  sort_order: number;
  requires_extra_reference: boolean;
  is_active: boolean;
  outfit_hint: string;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function deduplicateId(base: string, existing: string[], taken: Set<string>): string {
  let candidate = base;
  let i = 2;
  while (existing.includes(candidate) || taken.has(candidate)) {
    candidate = `${base}-${i}`;
    i++;
  }
  return candidate;
}

function mapSceneType(category: string): string {
  const map: Record<string, string> = {
    lifestyle: 'lifestyle',
    editorial: 'editorial',
    packshot: 'packshot',
    portrait: 'portrait',
    flatlay: 'flatlay',
    macro: 'macro',
  };
  return map[category] || 'lifestyle';
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetCategory: string;
  targetCategoryLabel: string;
  categorySortOrder: number;
  existingSubCategories: string[];
  existingSceneIds: string[];
}

export default function ImportFromScenesModal({
  open, onOpenChange, targetCategory, targetCategoryLabel,
  categorySortOrder, existingSubCategories, existingSceneIds,
}: Props) {
  const { scenes: customScenes, isLoading: loadingScenes } = useCustomScenes();
  const { upsertScene } = useProductImageScenes();
  const [step, setStep] = useState<1 | 2>(1);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [configs, setConfigs] = useState<Map<string, ImportConfig>>(new Map());
  const [newSubCatInputs, setNewSubCatInputs] = useState<Map<string, string>>(new Map());
  const [importing, setImporting] = useState(false);
  const [bulkSubCategory, setBulkSubCategory] = useState('__none__');
  const [bulkNewSubCat, setBulkNewSubCat] = useState('');
  const [analyzing, setAnalyzing] = useState<Set<string>>(new Set());

  const allSubCategories = useMemo(() => {
    const fromConfigs = Array.from(configs.values())
      .map(c => c.sub_category)
      .filter((v): v is string => !!v);
    return [...new Set([...existingSubCategories, ...fromConfigs])];
  }, [existingSubCategories, configs]);

  const activeScenes = useMemo(() =>
    customScenes.filter(s => s.is_active), [customScenes]);

  const filteredScenes = useMemo(() => {
    if (!search) return activeScenes;
    const q = search.toLowerCase();
    return activeScenes.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    );
  }, [activeScenes, search]);

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const goToStep2 = () => {
    const newConfigs = new Map<string, ImportConfig>();
    const takenIds = new Set<string>();
    for (const id of selected) {
      const scene = customScenes.find(s => s.id === id);
      if (!scene) continue;
      const baseId = slugify(scene.name);
      const sceneId = deduplicateId(baseId, existingSceneIds, takenIds);
      takenIds.add(sceneId);
      newConfigs.set(id, {
        scene_id: sceneId,
        title: scene.name,
        description: scene.description,
        prompt_template: scene.prompt_hint || scene.description,
        preview_image_url: scene.preview_image_url || scene.image_url,
        scene_type: mapSceneType(scene.category),
        sub_category: null,
        sub_category_sort_order: 0,
        trigger_blocks: [],
        sort_order: 999,
        requires_extra_reference: false,
        is_active: true,
        outfit_hint: '',
      });
    }
    setConfigs(newConfigs);
    setStep(2);
  };

  const updateConfig = (id: string, updates: Partial<ImportConfig>) => {
    setConfigs(prev => {
      const next = new Map(prev);
      const current = next.get(id);
      if (current) next.set(id, { ...current, ...updates });
      return next;
    });
  };

  const handleSubCategoryChange = (sceneId: string, value: string) => {
    if (value === '__none__') {
      updateConfig(sceneId, { sub_category: null });
    } else if (value === '__new__') {
      setNewSubCatInputs(prev => new Map(prev).set(sceneId, ''));
    } else {
      updateConfig(sceneId, { sub_category: value });
      setNewSubCatInputs(prev => { const n = new Map(prev); n.delete(sceneId); return n; });
    }
  };

  const confirmNewSubCat = (sceneId: string) => {
    const val = newSubCatInputs.get(sceneId)?.trim();
    if (val) {
      updateConfig(sceneId, { sub_category: val });
    }
    setNewSubCatInputs(prev => { const n = new Map(prev); n.delete(sceneId); return n; });
  };

  const toggleTrigger = (sceneId: string, trigger: string) => {
    const config = configs.get(sceneId);
    if (!config) return;
    const has = config.trigger_blocks.includes(trigger);
    updateConfig(sceneId, {
      trigger_blocks: has
        ? config.trigger_blocks.filter(t => t !== trigger)
        : [...config.trigger_blocks, trigger],
    });
  };

  const duplicateIds = useMemo(() => {
    const dupes = new Set<string>();
    for (const [, config] of configs) {
      if (existingSceneIds.includes(config.scene_id)) dupes.add(config.scene_id);
    }
    return dupes;
  }, [configs, existingSceneIds]);

  const handleImport = async () => {
    if (duplicateIds.size > 0) {
      toast.warning('Some scene IDs already exist — they will be overwritten');
    }
    setImporting(true);
    let count = 0;
    try {
      for (const [, config] of configs) {
        await upsertScene.mutateAsync({
          scene_id: config.scene_id,
          title: config.title,
          description: config.description,
          prompt_template: config.prompt_template,
          preview_image_url: config.preview_image_url,
          scene_type: config.scene_type,
          category_collection: targetCategory,
          category_sort_order: categorySortOrder,
          sub_category: config.sub_category,
          sub_category_sort_order: config.sub_category_sort_order,
          trigger_blocks: config.trigger_blocks,
          sort_order: config.sort_order,
          requires_extra_reference: config.requires_extra_reference,
          is_active: config.is_active,
          outfit_hint: config.outfit_hint?.trim() ? config.outfit_hint.trim() : null,
        });
        count++;
      }
      toast.success(`Imported ${count} scene${count !== 1 ? 's' : ''} into ${targetCategoryLabel}`);
      handleClose();
    } catch (e: any) {
      toast.error(`Import failed: ${e.message}`);
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSearch('');
    setSelected(new Set());
    setConfigs(new Map());
    setNewSubCatInputs(new Map());
    setBulkSubCategory('__none__');
    setBulkNewSubCat('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Import className="w-5 h-5" />
            Import Scenes → {targetCategoryLabel}
            {step === 2 && <Badge variant="secondary" className="text-xs">Step 2: Configure</Badge>}
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search scenes..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            {loadingScenes ? (
              <p className="text-sm text-muted-foreground text-center py-6">Loading scenes...</p>
            ) : filteredScenes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No scenes found</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-[50vh] overflow-y-auto pr-1">
                {filteredScenes.map(scene => (
                  <label
                    key={scene.id}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                      selected.has(scene.id) ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/40'
                    }`}
                  >
                    <Checkbox
                      checked={selected.has(scene.id)}
                      onCheckedChange={() => toggleSelect(scene.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {(scene.preview_image_url || scene.image_url) && (
                          <img
                            src={getOptimizedUrl(scene.preview_image_url || scene.image_url, { quality: 60 })}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className="w-8 h-8 rounded object-cover shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{scene.name}</p>
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-[9px]">{scene.category}</Badge>
                            {scene.prompt_only && <Badge variant="secondary" className="text-[9px]">prompt-only</Badge>}
                          </div>
                        </div>
                      </div>
                      {scene.description && (
                        <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{scene.description}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
            {/* Bulk sub-category selector */}
            <div className="border rounded-lg p-3 bg-muted/30 flex items-end gap-3">
              <div className="flex-1">
                <Label className="text-xs font-medium">Sub-category for all scenes</Label>
                <Select
                  value={bulkSubCategory}
                  onValueChange={v => {
                    setBulkSubCategory(v);
                    if (v === '__none__' || v === '__new__') return;
                    setConfigs(prev => {
                      const next = new Map(prev);
                      for (const [id, config] of next) {
                        next.set(id, { ...config, sub_category: v });
                      }
                      return next;
                    });
                  }}
                >
                  <SelectTrigger className="h-8 text-xs mt-1"><SelectValue placeholder="Select to apply to all…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {allSubCategories.map(sc => (
                      <SelectItem key={sc} value={sc}>{sc}</SelectItem>
                    ))}
                    <SelectItem value="__new__">+ Create new...</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {bulkSubCategory === '__new__' && (
                <div className="flex gap-1 flex-1">
                  <Input
                    value={bulkNewSubCat}
                    onChange={e => setBulkNewSubCat(e.target.value)}
                    placeholder="New sub-category name…"
                    className="text-xs h-8"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && bulkNewSubCat.trim()) {
                        const val = bulkNewSubCat.trim();
                        setBulkSubCategory(val);
                        setBulkNewSubCat('');
                        setConfigs(prev => {
                          const next = new Map(prev);
                          for (const [id, config] of next) {
                            next.set(id, { ...config, sub_category: val });
                          }
                          return next;
                        });
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs px-2"
                    onClick={() => {
                      if (bulkNewSubCat.trim()) {
                        const val = bulkNewSubCat.trim();
                        setBulkSubCategory(val);
                        setBulkNewSubCat('');
                        setConfigs(prev => {
                          const next = new Map(prev);
                          for (const [id, config] of next) {
                            next.set(id, { ...config, sub_category: val });
                          }
                          return next;
                        });
                      }
                    }}
                  >
                    Apply
                  </Button>
                </div>
              )}
            </div>

            {Array.from(configs.entries()).map(([id, config]) => {
              const scene = customScenes.find(s => s.id === id);
              const isDuplicate = duplicateIds.has(config.scene_id);
              const isCreatingNew = newSubCatInputs.has(id);

              return (
                <div key={id} className="border rounded-lg p-3 space-y-3">
                  <div className="flex items-center gap-2">
                    {config.preview_image_url && (
                      <img
                        src={getOptimizedUrl(config.preview_image_url, { quality: 60 })}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="w-10 h-10 rounded object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{scene?.name}</p>
                      <p className="text-[11px] text-muted-foreground">from Admin Scenes</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Scene ID</Label>
                      <Input
                        value={config.scene_id}
                        onChange={e => updateConfig(id, { scene_id: e.target.value })}
                        className={`text-xs h-8 ${isDuplicate ? 'border-destructive' : ''}`}
                      />
                      {isDuplicate && (
                        <p className="text-[10px] text-destructive flex items-center gap-1 mt-0.5">
                          <AlertTriangle className="w-3 h-3" /> Already exists
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs">Title</Label>
                      <Input value={config.title} onChange={e => updateConfig(id, { title: e.target.value })} className="text-xs h-8" />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Prompt Template</Label>
                    <Textarea
                      value={config.prompt_template}
                      onChange={e => updateConfig(id, { prompt_template: e.target.value })}
                      className="text-xs min-h-[60px]"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">Scene Type</Label>
                      <Select value={config.scene_type} onValueChange={v => updateConfig(id, { scene_type: v })}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {SCENE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Sub-Category</Label>
                      {isCreatingNew ? (
                        <div className="flex gap-1">
                          <Input
                            value={newSubCatInputs.get(id) || ''}
                            onChange={e => setNewSubCatInputs(prev => new Map(prev).set(id, e.target.value))}
                            placeholder="New sub-category..."
                            className="text-xs h-8 flex-1"
                            autoFocus
                            onKeyDown={e => e.key === 'Enter' && confirmNewSubCat(id)}
                          />
                          <Button size="sm" variant="outline" className="h-8 text-xs px-2" onClick={() => confirmNewSubCat(id)}>OK</Button>
                        </div>
                      ) : (
                        <Select value={config.sub_category || '__none__'} onValueChange={v => handleSubCategoryChange(id, v)}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">None</SelectItem>
                            {existingSubCategories.map(sc => (
                              <SelectItem key={sc} value={sc}>{sc}</SelectItem>
                            ))}
                            <SelectItem value="__new__">+ Create new...</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs">Sort Order</Label>
                      <Input type="number" value={config.sort_order} onChange={e => updateConfig(id, { sort_order: parseInt(e.target.value) || 0 })} className="text-xs h-8" />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Trigger Blocks</Label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {ALL_TRIGGER_KEYS.map(trigger => (
                        <label key={trigger} className="flex items-center gap-1 cursor-pointer">
                          <Checkbox
                            checked={config.trigger_blocks.includes(trigger)}
                            onCheckedChange={() => toggleTrigger(id, trigger)}
                            className="h-3.5 w-3.5"
                          />
                          <span className="text-[10px]">{trigger}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={config.requires_extra_reference}
                        onCheckedChange={v => updateConfig(id, { requires_extra_reference: v })}
                        id={`ref-${id}`}
                      />
                      <Label htmlFor={`ref-${id}`} className="text-xs">Requires extra reference</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={config.is_active}
                        onCheckedChange={v => updateConfig(id, { is_active: v })}
                        id={`active-${id}`}
                      />
                      <Label htmlFor={`active-${id}`} className="text-xs">Active</Label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          {step === 2 && (
            <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="gap-1">
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            {step === 1 ? (
              <Button onClick={goToStep2} disabled={selected.size === 0} className="gap-1">
                Next <ChevronRight className="w-4 h-4" />
                {selected.size > 0 && <Badge variant="secondary" className="text-[10px] ml-1">{selected.size}</Badge>}
              </Button>
            ) : (
              <Button onClick={handleImport} disabled={importing} className="gap-1">
                <Import className="w-4 h-4" />
                {importing ? 'Importing...' : `Import ${configs.size} scene${configs.size !== 1 ? 's' : ''}`}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
