import { useState, useMemo, useRef } from 'react';
import { useProductImageScenes, type DbScene } from '@/hooks/useProductImageScenes';
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
  Eye, EyeOff, Pencil, Save, X, Layers, Info, Upload, Camera,
} from 'lucide-react';

const SCENE_TYPES = ['macro', 'packshot', 'portrait', 'lifestyle', 'editorial', 'flatlay'];
const CATEGORIES = [
  { value: '__global__', label: 'Global (Universal)' },
  { value: 'fragrance', label: 'Fragrance' },
  { value: 'beauty-skincare', label: 'Beauty & Skincare' },
  { value: 'makeup-lipsticks', label: 'Makeup & Lipsticks' },
  { value: 'bags-accessories', label: 'Bags & Accessories' },
  { value: 'hats-small', label: 'Hats & Small Accessories' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'garments', label: 'Clothing & Apparel' },
  { value: 'home-decor', label: 'Home Decor' },
  { value: 'tech-devices', label: 'Tech / Devices' },
  { value: 'food-beverage', label: 'Food & Beverage' },
  { value: 'supplements-wellness', label: 'Supplements & Wellness' },
  { value: 'other', label: 'Other / Custom' },
];
const TRIGGER_BLOCKS = [
  'background', 'visualDirection', 'sceneEnvironment', 'personDetails',
  'actionDetails', 'detailFocus', 'angleSelection', 'packagingDetails',
  'productSize', 'branding', 'layout',
];
const EXCLUDE_CATS = [
  'fragrance', 'beauty-skincare', 'makeup-lipsticks', 'bags-accessories',
  'hats-small', 'shoes', 'garments', 'home-decor', 'tech-devices',
  'food-beverage', 'supplements-wellness',
];

const PROMPT_TOKENS = [
  '{{productName}}', '{{productType}}', '{{materialTexture}}', '{{background}}',
  '{{lightingDirective}}', '{{shadowDirective}}', '{{moodDirective}}',
  '{{surfaceDirective}}', '{{environmentDirective}}', '{{consistencyDirective}}',
  '{{cameraDirective}}', '{{personDirective}}', '{{outfitDirective}}',
  '{{handStyle}}', '{{nailDirective}}', '{{actionDirective}}',
  '{{focusArea}}', '{{cropDirective}}', '{{brandingDirective}}',
  '{{packagingDirective}}', '{{accentDirective}}', '{{stylingDirective}}',
  '{{productProminenceDirective}}', '{{sceneIntensityDirective}}',
  '{{compositionDirective}}', '{{negativeSpaceDirective}}',
  '{{categoryPackshotDirective}}', '{{bodyFramingDirective}}',
  '{{modelDirective}}',
];

function emptyScene(): Partial<DbScene> & { scene_id: string } {
  return {
    scene_id: '',
    title: '',
    description: '',
    prompt_template: '',
    trigger_blocks: ['background'],
    is_global: false,
    category_collection: null,
    scene_type: 'packshot',
    exclude_categories: [],
    preview_image_url: null,
    is_active: true,
    sort_order: 999,
  };
}

export default function AdminProductImageScenes() {
  const { isAdmin } = useIsAdmin();
  const { rawScenes, isLoading, updateScene, upsertScene, deleteScene } = useProductImageScenes();
  const [search, setSearch] = useState('');
  const [showHidden, setShowHidden] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['__global__']));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<DbScene>>({});
  const [addingNew, setAddingNew] = useState(false);
  const [newDraft, setNewDraft] = useState(emptyScene());
  const [showTokenRef, setShowTokenRef] = useState(false);

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
    return scenes;
  }, [rawScenes, showHidden, search]);

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<string, DbScene[]>();
    map.set('__global__', []);
    for (const s of filtered) {
      const key = s.is_global ? '__global__' : (s.category_collection || 'other');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    // Sort within each group
    for (const [, arr] of map) {
      arr.sort((a, b) => a.sort_order - b.sort_order);
    }
    return map;
  }, [filtered]);

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
      const payload = {
        ...newDraft,
        is_global: newDraft.category_collection === null || (newDraft as any)._isGlobal,
      };
      await upsertScene.mutateAsync(payload as any);
      toast.success('Scene created');
      setAddingNew(false);
      setNewDraft(emptyScene());
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
    const key = scene.is_global ? '__global__' : (scene.category_collection || 'other');
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

  if (!isAdmin) {
    return <div className="p-8 text-center text-muted-foreground">Admin access required</div>;
  }

  const catLabel = (key: string) => CATEGORIES.find(c => c.value === key)?.label || key;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Product Image Scenes</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage all scene definitions for the Product Images flow.</p>
        </div>
        <Button onClick={() => setAddingNew(true)} size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" /> Add Scene
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search scenes..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={showHidden} onCheckedChange={setShowHidden} id="show-hidden" />
          <Label htmlFor="show-hidden" className="text-xs">Show hidden</Label>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setShowTokenRef(!showTokenRef)} className="gap-1.5 text-xs">
          <Info className="w-3.5 h-3.5" /> Prompt tokens
        </Button>
        <Badge variant="secondary" className="text-xs">{filtered.length} scenes</Badge>
      </div>

      {/* Token reference */}
      {showTokenRef && (
        <Card>
          <CardContent className="py-3">
            <p className="text-xs font-medium mb-2">Available prompt tokens:</p>
            <div className="flex flex-wrap gap-1.5">
              {PROMPT_TOKENS.map(t => (
                <Badge key={t} variant="outline" className="text-[10px] font-mono">{t}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add new form */}
      {addingNew && (
        <Card className="border-primary/30">
          <CardContent className="py-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">New Scene</h3>
              <Button variant="ghost" size="icon" onClick={() => setAddingNew(false)}><X className="w-4 h-4" /></Button>
            </div>
            <SceneForm draft={newDraft} onChange={setNewDraft as any} />
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
          {Array.from(grouped.entries()).map(([key, scenes]) => (
            <Collapsible key={key} open={expandedSections.has(key)} onOpenChange={() => toggleSection(key)}>
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">{catLabel(key)}</span>
                    <Badge variant="secondary" className="text-[10px]">{scenes.length}</Badge>
                  </div>
                  {expandedSections.has(key) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-1.5 pl-2 pt-2">
                  {scenes.map((scene, idx) => (
                    <div key={scene.id}>
                      <div className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${
                        !scene.is_active ? 'opacity-50 border-dashed' : 'border-border'
                      } ${editingId === scene.id ? 'border-primary/40 bg-primary/[0.02]' : 'hover:bg-muted/20'}`}>
                        {/* Thumbnail */}
                        <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex items-center justify-center flex-shrink-0 border border-border/40">
                          {scene.preview_image_url ? (
                            <img src={scene.preview_image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Camera className="w-4 h-4 text-muted-foreground/40" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">{scene.title}</span>
                            <Badge variant="outline" className="text-[10px]">{scene.scene_type}</Badge>
                            <code className="text-[10px] text-muted-foreground font-mono">{scene.scene_id}</code>
                            {!scene.is_active && <Badge variant="destructive" className="text-[10px]">Hidden</Badge>}
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                            Triggers: {scene.trigger_blocks.join(', ')}
                            {scene.exclude_categories.length > 0 && ` · Excludes: ${scene.exclude_categories.join(', ')}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleMove(scene, 'up')} disabled={idx === 0}>
                            <ArrowUp className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleMove(scene, 'down')} disabled={idx === scenes.length - 1}>
                            <ArrowDown className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => editingId === scene.id ? cancelEdit() : startEdit(scene)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleToggleActive(scene)}>
                            {scene.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </Button>
                        </div>
                      </div>

                      {/* Inline edit form */}
                      {editingId === scene.id && (
                        <Card className="mt-1.5 border-primary/20">
                          <CardContent className="py-4 space-y-4">
                            <SceneForm draft={editDraft} onChange={setEditDraft as any} />
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" onClick={cancelEdit}>Cancel</Button>
                              <Button onClick={saveEdit} disabled={updateScene.isPending} className="gap-1.5">
                                <Save className="w-4 h-4" /> Save
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Reusable scene edit form ── */
function SceneForm({ draft, onChange }: { draft: Partial<DbScene>; onChange: (d: Partial<DbScene>) => void }) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
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

  const isGlobal = draft.is_global || draft.category_collection === null;

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
          <Label className="text-xs">Category Collection</Label>
          <Select
            value={isGlobal ? '__global__' : (draft.category_collection || 'other')}
            onValueChange={v => {
              if (v === '__global__') {
                onChange({ ...draft, is_global: true, category_collection: null });
              } else {
                onChange({ ...draft, is_global: false, category_collection: v });
              }
            }}
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

      {!isGlobal && (
        <div className="space-y-1.5">
          <Label className="text-xs">Exclude from Categories</Label>
          <div className="flex flex-wrap gap-2">
            {EXCLUDE_CATS.map(cat => {
              const checked = (draft.exclude_categories || []).includes(cat);
              return (
                <label key={cat} className="flex items-center gap-1.5 text-xs cursor-pointer">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(v) => {
                      const current = draft.exclude_categories || [];
                      set('exclude_categories', v ? [...current, cat] : current.filter(c => c !== cat));
                    }}
                  />
                  {cat}
                </label>
              );
            })}
          </div>
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
        <div className="flex items-start gap-4">
          {/* Thumbnail preview */}
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted border border-border/40 flex items-center justify-center flex-shrink-0">
            {draft.preview_image_url ? (
              <img src={draft.preview_image_url} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <Camera className="w-6 h-6 text-muted-foreground/30" />
            )}
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
    </div>
  );
}
