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
  Eye, EyeOff, Pencil, Save, X, Layers, Info, Upload, Camera, Filter, ExternalLink,
} from 'lucide-react';
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
  { value: 'food-beverage', label: 'Food & Beverage' },
  { value: 'supplements-wellness', label: 'Supplements & Wellness' },
  { value: 'other', label: 'Other / Custom' },
];
const TRIGGER_BLOCKS = [
  'background', 'visualDirection', 'sceneEnvironment', 'personDetails',
  'actionDetails', 'detailFocus', 'angleSelection', 'packagingDetails',
  'productSize', 'branding', 'layout',
];

const CAT_LABEL_MAP: Record<string, string> = {};
CATEGORIES.forEach(c => { CAT_LABEL_MAP[c.value] = c.label; });

const TOKEN_GROUPS: { label: string; tokens: { name: string; desc: string }[] }[] = [
  {
    label: '🎨 System (Directives)',
    tokens: [
      { name: 'productName', desc: 'Product title' },
      { name: 'productType', desc: 'Product type / category slug' },
      { name: 'materialTexture', desc: 'Resolved material + finish description' },
      { name: 'background', desc: 'Full background directive' },
      { name: 'lightingDirective', desc: 'Lighting sentence' },
      { name: 'shadowDirective', desc: 'Shadow sentence' },
      { name: 'moodDirective', desc: 'Styling direction' },
      { name: 'surfaceDirective', desc: 'Surface type sentence' },
      { name: 'environmentDirective', desc: 'Environment sentence' },
      { name: 'consistencyDirective', desc: 'Cross-shot consistency' },
      { name: 'cameraDirective', desc: 'Camera/lens specification' },
      { name: 'personDirective', desc: 'Full person description' },
      { name: 'outfitDirective', desc: 'Outfit lock directive' },
      { name: 'handStyle', desc: 'Hand description' },
      { name: 'nailDirective', desc: 'Nail style' },
      { name: 'actionDirective', desc: 'Action type + intensity' },
      { name: 'focusArea', desc: 'What to focus on' },
      { name: 'cropDirective', desc: 'Crop intensity' },
      { name: 'brandingDirective', desc: 'Branding visibility' },
      { name: 'packagingDirective', desc: 'Packaging details' },
      { name: 'accentDirective', desc: 'Accent color directive' },
      { name: 'stylingDirective', desc: 'Styling direction' },
      { name: 'productProminenceDirective', desc: 'Product prominence' },
      { name: 'sceneIntensityDirective', desc: 'Scene mood/intensity' },
      { name: 'compositionDirective', desc: 'Composition framing' },
      { name: 'negativeSpaceDirective', desc: 'Negative space' },
      { name: 'categoryPackshotDirective', desc: 'Category-specific packshot' },
      { name: 'bodyFramingDirective', desc: 'Body framing for on-model' },
      { name: 'modelDirective', desc: 'Model reference directive' },
    ],
  },
  {
    label: '🔍 Global Visual',
    tokens: [
      { name: 'productCategory', desc: 'Detected category (e.g. fragrance)' },
      { name: 'productSubcategory', desc: 'Sub-category (e.g. eau de parfum)' },
      { name: 'productForm', desc: 'Physical form (bottle, tube, garment)' },
      { name: 'productSilhouette', desc: 'Outline shape description' },
      { name: 'productMainHex', desc: 'Dominant color hex (#RRGGBB)' },
      { name: 'productSecondaryHex', desc: 'Secondary color hex' },
      { name: 'productAccentHex', desc: 'Accent/highlight color hex' },
      { name: 'backgroundBaseHex', desc: 'Suggested background color hex' },
      { name: 'backgroundSecondaryHex', desc: 'Suggested secondary bg hex' },
      { name: 'shadowToneHex', desc: 'Ideal shadow tone hex' },
      { name: 'productFinishType', desc: 'Surface finish (matte, glossy, satin)' },
      { name: 'materialPrimary', desc: 'Main material (leather, glass)' },
      { name: 'materialSecondary', desc: 'Secondary material' },
      { name: 'textureType', desc: 'Surface texture description' },
      { name: 'transparencyType', desc: 'none / translucent / transparent / frosted' },
      { name: 'metalTone', desc: 'Metal tone (gold, silver, rose-gold)' },
      { name: 'heroFeature', desc: 'Most photogenic feature' },
      { name: 'detailFocusAreas', desc: 'Areas worth macro shots' },
      { name: 'scaleType', desc: 'Size scale (palm-sized, handheld, etc.)' },
      { name: 'wearabilityMode', desc: 'How product is used (held, worn, etc.)' },
      { name: 'bodyPlacementSuggested', desc: 'Where on body product goes' },
    ],
  },
  {
    label: '🌿 Global Semantic',
    tokens: [
      { name: 'ingredientFamilyPrimary', desc: 'Primary ingredient family' },
      { name: 'ingredientFamilySecondary', desc: 'Secondary ingredient family' },
      { name: 'fruitsRelated', desc: 'Related fruits for styling props' },
      { name: 'flowersRelated', desc: 'Related flowers for styling' },
      { name: 'botanicalsRelated', desc: 'Related botanicals/herbs' },
      { name: 'woodsRelated', desc: 'Related wood types' },
      { name: 'spicesRelated', desc: 'Related spices' },
      { name: 'greensRelated', desc: 'Related greenery/leaves' },
      { name: 'materialsRelated', desc: 'Related styling materials' },
      { name: 'regionRelated', desc: 'Geographic/cultural association' },
      { name: 'landscapeRelated', desc: 'Landscape association' },
    ],
  },
  {
    label: '👗 Fashion & Apparel',
    tokens: [
      { name: 'garmentType', desc: 'Type of garment' },
      { name: 'fitType', desc: 'Fit (slim, relaxed, oversized)' },
      { name: 'fabricType', desc: 'Fabric type' },
      { name: 'fabricWeight', desc: 'Fabric weight' },
      { name: 'drapeBehavior', desc: 'How fabric drapes' },
    ],
  },
  {
    label: '✨ Beauty & Skincare',
    tokens: [
      { name: 'packagingType', desc: 'Packaging type (pump, jar, tube)' },
      { name: 'formulaType', desc: 'Formula type (serum, cream)' },
      { name: 'formulaTexture', desc: 'Texture (gel, milky, oil)' },
      { name: 'applicationMode', desc: 'How applied (fingers, dropper)' },
      { name: 'skinAreaSuggested', desc: 'Target skin area' },
    ],
  },
  {
    label: '🌸 Fragrances',
    tokens: [
      { name: 'fragranceFamily', desc: 'Scent family (floral, woody, oriental)' },
      { name: 'bottleType', desc: 'Bottle shape/type' },
      { name: 'capStyle', desc: 'Cap/topper style' },
      { name: 'liquidColorHex', desc: 'Liquid color hex' },
      { name: 'glassTintType', desc: 'Glass tint (clear, smoked, amber)' },
      { name: 'noteObjectsPrimary', desc: 'Primary note objects (rose, oud)' },
      { name: 'noteObjectsSecondary', desc: 'Secondary note objects' },
      { name: 'scentWorld', desc: 'Scent atmosphere description' },
    ],
  },
  {
    label: '💎 Jewelry',
    tokens: [
      { name: 'jewelryType', desc: 'Type (ring, necklace, bracelet)' },
      { name: 'gemType', desc: 'Gemstone type' },
      { name: 'gemColorHex', desc: 'Gem color hex' },
      { name: 'metalPrimary', desc: 'Primary metal' },
      { name: 'metalFinish', desc: 'Metal finish (polished, brushed)' },
      { name: 'wearPlacement', desc: 'Where worn' },
      { name: 'sparkleLevel', desc: 'Sparkle intensity' },
    ],
  },
  {
    label: '👜 Accessories',
    tokens: [
      { name: 'accessoryType', desc: 'Type (bag, wallet, belt)' },
      { name: 'carryMode', desc: 'How carried (shoulder, hand, crossbody)' },
      { name: 'strapType', desc: 'Strap type' },
      { name: 'hardwareType', desc: 'Hardware type (zipper, clasp)' },
      { name: 'hardwareFinish', desc: 'Hardware finish' },
      { name: 'structureType', desc: 'Structure (structured, soft)' },
      { name: 'signatureDetail', desc: 'Signature design detail' },
    ],
  },
  {
    label: '🏠 Home & Decor',
    tokens: [
      { name: 'decorType', desc: 'Type (candle, vase, frame)' },
      { name: 'placementType', desc: 'Placement (table, shelf, wall)' },
      { name: 'objectScale', desc: 'Scale (miniature, tabletop)' },
      { name: 'baseMaterial', desc: 'Base material' },
      { name: 'surfaceFinish', desc: 'Surface finish' },
      { name: 'roomContextSuggested', desc: 'Suggested room context' },
      { name: 'stylingCompanions', desc: 'Companion objects for styling' },
    ],
  },
  {
    label: '🍽️ Food & Beverage',
    tokens: [
      { name: 'foodType', desc: 'Type of food/beverage' },
      { name: 'servingMode', desc: 'Serving mode (plated, bottled)' },
      { name: 'ingredientObjectsPrimary', desc: 'Primary ingredient props' },
      { name: 'ingredientObjectsSecondary', desc: 'Secondary ingredient props' },
      { name: 'textureCue', desc: 'Visual texture cue' },
      { name: 'temperatureCue', desc: 'Hot, cold, room temp' },
      { name: 'consumptionContext', desc: 'Consumption setting' },
    ],
  },
  {
    label: '📱 Electronics',
    tokens: [
      { name: 'deviceType', desc: 'Device type' },
      { name: 'interfaceType', desc: 'Interface type' },
      { name: 'screenPresence', desc: 'Screen visibility' },
      { name: 'screenStateSuggested', desc: 'Suggested screen state' },
      { name: 'finishMaterialPrimary', desc: 'Primary finish material' },
      { name: 'industrialStyle', desc: 'Industrial design style' },
      { name: 'portDetail', desc: 'Port details' },
      { name: 'buttonDetail', desc: 'Button details' },
    ],
  },
  {
    label: '⚽ Sports & Fitness',
    tokens: [
      { name: 'sportType', desc: 'Sport type' },
      { name: 'gearType', desc: 'Gear type' },
      { name: 'performanceMaterial', desc: 'Performance material' },
      { name: 'gripTexture', desc: 'Grip texture' },
      { name: 'motionCue', desc: 'Motion cue for dynamic shots' },
      { name: 'usageContext', desc: 'Usage context' },
      { name: 'surfaceContext', desc: 'Surface context' },
    ],
  },
  {
    label: '💊 Health & Supplements',
    tokens: [
      { name: 'supplementType', desc: 'Supplement type' },
      { name: 'dosageForm', desc: 'Dosage form (capsule, powder)' },
      { name: 'mixingMode', desc: 'Mixing mode' },
      { name: 'wellnessIngredientObjects', desc: 'Wellness ingredient props' },
      { name: 'containerType', desc: 'Container type' },
      { name: 'clinicalCleanlinessLevel', desc: 'Clinical cleanliness level' },
      { name: 'routineContext', desc: 'Routine context' },
    ],
  },
];

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
  };
}

/** Group scenes by sub_category within a flat array */
function groupBySubCategory(scenes: DbScene[]): { label: string; scenes: DbScene[] }[] {
  const map = new Map<string, DbScene[]>();
  for (const s of scenes) {
    const key = s.sub_category || '';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  }
  return Array.from(map.entries()).map(([label, sc]) => ({
    label: label || 'Uncategorized',
    scenes: sc,
  }));
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

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<string, DbScene[]>();
    for (const s of filtered) {
      const key = s.category_collection || 'other';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
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
      await upsertScene.mutateAsync(newDraft as any);
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
          {Array.from(grouped.entries()).map(([key, scenes]) => {
            const subGroups = groupBySubCategory(scenes);
            const hasMultipleSubGroups = subGroups.length > 1 || (subGroups.length === 1 && subGroups[0].label !== 'Uncategorized');
            const summary = subCategorySummary(scenes);

            return (
              <Collapsible key={key} open={expandedSections.has(key)} onOpenChange={() => toggleSection(key)}>
                <CollapsibleTrigger className="w-full">
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
                <CollapsibleContent>
                  <div className="pl-2 pt-2 space-y-3">
                    {hasMultipleSubGroups ? (
                      subGroups.map(sg => (
                        <div key={sg.label}>
                          <div className="flex items-center gap-2 mb-1.5 pl-1">
                            <div className="h-px flex-1 max-w-[60px] bg-border" />
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{sg.label}</span>
                            <Badge variant="outline" className="text-[9px]">{sg.scenes.length}</Badge>
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
                                setEditDraft={setEditDraft}
                                updatePending={updateScene.isPending}
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
                            setEditDraft={setEditDraft}
                            updatePending={updateScene.isPending}
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
    </div>
  );
}

/* ── Scene row component ── */
function SceneRow({ scene, idx, total, editingId, editDraft, onStartEdit, onCancelEdit, onSaveEdit, onToggleActive, onMove, setEditDraft, updatePending }: {
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
  setEditDraft: (d: Partial<DbScene>) => void;
  updatePending: boolean;
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
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onToggleActive(scene)}>
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
          <Input value={draft.sub_category || ''} onChange={e => set('sub_category', e.target.value || null)} placeholder="e.g. Essential Shots, On-Model, Hero Scenes" />
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
