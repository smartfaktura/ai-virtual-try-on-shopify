import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Input } from '@/components/ui/input';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Heart, Search, X, Eye, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/lib/brandedToast';
import type { DiscoverItem } from '@/components/app/DiscoverCard';
import { cn } from '@/lib/utils';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { supabase } from '@/integrations/supabase/client';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { SharePopover } from '@/components/app/SharePopover';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SITE_URL } from '@/lib/constants';
import { getItemSlug } from '@/lib/slugUtils';
import { mockModels, mockTryOnPoses, poseCategoryLabels } from '@/data/mockData';
import { useCustomModels } from '@/hooks/useCustomModels';
import { useCustomScenes } from '@/hooks/useCustomScenes';
import { useSceneCategories } from '@/hooks/useSceneCategories';

import { getDiscoverSubtypes, getDiscoverFamilies, FAMILY_NAME_TO_ID } from '@/lib/discoverTaxonomy';

const DISCOVER_CATEGORY_OPTIONS = getDiscoverFamilies().map(f => ({
  id: f.id,
  label: f.label,
}));

interface DiscoverDetailModalProps {
  item: DiscoverItem | null;
  open: boolean;
  onClose: () => void;
  onUseItem: (item: DiscoverItem) => void;
  onSearchSimilar: (item: DiscoverItem) => void;
  relatedItems: DiscoverItem[];
  onSelectRelated: (item: DiscoverItem) => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
  viewCount?: number;
  isAdmin?: boolean;
  isFeatured?: boolean;
  onToggleFeatured?: () => void;
  onDelete?: () => void;
}

export function DiscoverDetailModal({
  item,
  open,
  onClose,
  onUseItem,
  onSearchSimilar,
  relatedItems,
  onSelectRelated,
  isSaved,
  onToggleSave,
  viewCount,
  isAdmin,
  isFeatured,
  onToggleFeatured,
  onDelete,
}: DiscoverDetailModalProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const panelRef = useRef<HTMLDivElement>(null);

  const { asProfiles: customModelProfiles } = useCustomModels();
  const { asPoses: customSceneProfiles } = useCustomScenes();

  const allModelOptions = useMemo(() => {
    const items: { name: string; imageUrl: string }[] = mockModels.map(m => ({ name: m.name, imageUrl: m.previewUrl }));
    customModelProfiles?.forEach(cm => {
      if (!items.find(i => i.name === cm.name)) items.push({ name: cm.name, imageUrl: cm.previewUrl });
    });
    return items;
  }, [customModelProfiles]);

  const { data: productImageScenes } = useQuery({
    queryKey: ['product-image-scenes-picker'],
    queryFn: async () => {
      const { data } = await supabase
        .from('product_image_scenes')
        .select('id, scene_id, title, preview_image_url, category_collection')
        .eq('is_active', true);
      return data ?? [];
    },
    enabled: !!isAdmin && open,
    staleTime: 10 * 60 * 1000,
  });

  const allSceneOptions = useMemo(() => {
    const items: { name: string; imageUrl: string; category: string }[] = mockTryOnPoses.map(s => ({ name: s.name, imageUrl: s.previewUrl, category: s.category }));
    customSceneProfiles?.forEach(cs => {
      if (!items.find(i => i.name === cs.name)) items.push({ name: cs.name, imageUrl: cs.previewUrl, category: cs.category });
    });
    productImageScenes?.forEach((ps: any) => {
      if (!items.find(i => i.name === ps.title)) {
        items.push({
          name: ps.title,
          imageUrl: ps.preview_image_url || '',
          category: ps.category_collection ?? 'product-images',
        });
      }
    });
    return items;
  }, [customSceneProfiles, productImageScenes]);

  const [editModelName, setEditModelName] = useState('__none__');
  const [editSceneName, setEditSceneName] = useState('__none__');
  const [editCategories, setEditCategories] = useState<string[]>(['fashion']);
  const [editSubcategory, setEditSubcategory] = useState<string | null>(null);
  const [editWorkflowSlug, setEditWorkflowSlug] = useState('__freestyle__');
  const [editPrompt, setEditPrompt] = useState('');
  const [editProductName, setEditProductName] = useState('');
  const [editProductImageUrl, setEditProductImageUrl] = useState('');
  const [editProductSource, setEditProductSource] = useState<string>('__none__');
  const [savingMeta, setSavingMeta] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productPopoverOpen, setProductPopoverOpen] = useState(false);
  const [sceneDialogOpen, setSceneDialogOpen] = useState(false);
  const [sceneSearch, setSceneSearch] = useState('');
  const [editSceneDisplayName, setEditSceneDisplayName] = useState('');
  const [editSceneCategory, setEditSceneCategory] = useState('lifestyle');

  const { allCategoryLabels, allCategorySlugs } = useSceneCategories();

  const { data: workflows } = useQuery({
    queryKey: ['workflows-list'],
    queryFn: async () => {
      const { data } = await supabase.from('workflows').select('id, name, slug').order('sort_order');
      return data ?? [];
    },
  });

  const { data: myProducts } = useQuery({
    queryKey: ['my-products'],
    queryFn: async () => {
      const { data } = await supabase.from('user_products').select('id, title, image_url').order('created_at', { ascending: false });
      return data ?? [];
    },
    enabled: !!isAdmin,
  });

  const itemId = item?.type === 'preset' ? item.data.id : item?.type === 'scene' ? item.data.poseId : null;
  useEffect(() => {
    if (!itemId || !open) return;
    panelRef.current?.scrollTo({ top: 0 });
    const d = item?.data as any;
    setEditModelName(d?.model_name || '__none__');
    setEditSceneName(d?.scene_name || '__none__');
    setEditCategories(d?.discover_categories?.length ? [...d.discover_categories] : d?.category ? [d.category] : ['fashion']);
    setEditSubcategory(d?.subcategory ?? null);
    setEditWorkflowSlug(d?.workflow_slug || '__freestyle__');
    setEditPrompt(d?.prompt || '');
    setEditProductName(d?.product_name || '');
    setEditProductImageUrl(d?.product_image_url || '');
    setEditProductSource(d?.product_name ? '__custom__' : '__none__');
    setEditSceneDisplayName(d?.name || '');
    setEditSceneCategory(d?.category || 'lifestyle');
  }, [itemId, open]);

  // When the primary family changes, clear sub-family if it no longer belongs.
  useEffect(() => {
    if (!editSubcategory) return;
    const firstFam = editCategories[0];
    const subs = firstFam ? getDiscoverSubtypes(firstFam) : [];
    if (!subs.some(s => s.slug === editSubcategory)) {
      setEditSubcategory(null);
    }
  }, [editCategories, editSubcategory]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open || !item) return null;

  const isPreset = item.type === 'preset';
  const imageUrl = isPreset ? item.data.image_url : item.data.previewUrl;
  const title = isPreset ? item.data.title : item.data.name;
  const category = isPreset ? item.data.category : item.data.category;

  const workflowLabel = isPreset && item.data.workflow_name
    ? item.data.workflow_name.replace(/\bSet$/i, 'Workflow')
    : isPreset ? 'Freestyle' : 'Scene';

  return createPortal(
    <div
      className="fixed top-0 left-0 right-0 bottom-0 z-[200] animate-in fade-in duration-200"
      style={{ margin: 0, padding: 0 }}
    >
      {/* Backdrop */}
      <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/90" onClick={onClose} />

      {/* Split layout */}
      <div
        className="fixed top-0 left-0 right-0 bottom-0 z-10 flex flex-col md:flex-row"
      >
        {/* Left — Image showcase */}
        <div className="w-full md:w-[60%] h-[45vh] md:h-full flex items-center justify-center p-6 md:p-12" onClick={onClose}>
          <ShimmerImage
            src={imageUrl}
            alt={title}
            wrapperClassName="flex items-center justify-center"
            className="max-w-full max-h-[calc(45vh-2rem)] md:max-h-[calc(100vh-6rem)] object-contain rounded-lg shadow-2xl"
          />
        </div>

        {/* Right — Controls panel */}
        <div ref={panelRef} className="relative w-full md:w-[40%] h-[55vh] md:h-full overflow-y-auto bg-background/95 backdrop-blur-xl border-l border-border/20" onClick={(e) => e.stopPropagation()}>
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 z-20 text-foreground/70 hover:text-foreground transition-colors"
          >
            <X className="w-7 h-7" strokeWidth={2} />
          </button>

          <div className="flex flex-col gap-6 p-6 md:p-8 lg:p-10 pt-8 md:pt-10">

            {/* Title + views */}
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground leading-tight">{title}</h2>
              {typeof viewCount === 'number' && (
                <div className="flex items-center gap-1.5 text-muted-foreground/60 mt-1">
                  <Eye className="w-4 h-4" />
                  <span className="text-xs font-medium">{viewCount} views</span>
                </div>
              )}
            </div>

            {/* Created with section */}
            {(
              <div className="space-y-3">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/50">
                    Created with
                  </span>
                  <button
                    onClick={() => {
                      onClose();
                      if (isPreset && item.data.workflow_slug) {
                        navigate(`/app/generate/${item.data.workflow_slug}`);
                      } else {
                        navigate('/app/freestyle');
                      }
                    }}
                    className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70 hover:text-foreground/90 transition-colors cursor-pointer"
                  >
                    {workflowLabel}
                  </button>
                </div>
                <div className="flex flex-col gap-2.5">
                  {(item.data as any).scene_name && (
                    <div className="flex items-center gap-2.5">
                      {(item.data as any).scene_image_url && (
                        <img
                          src={getOptimizedUrl((item.data as any).scene_image_url, { quality: 60 })}
                          alt={(item.data as any).scene_name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <p className="text-xs font-medium text-foreground">{(item.data as any).scene_name}</p>
                        <p className="text-[10px] text-muted-foreground/60">Scene</p>
                      </div>
                    </div>
                  )}
                  {(item.data as any).model_name && (
                    <div className="flex items-center gap-2.5">
                      {(item.data as any).model_image_url && (
                        <img
                          src={getOptimizedUrl((item.data as any).model_image_url, { quality: 60 })}
                          alt={(item.data as any).model_name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <p className="text-xs font-medium text-foreground">{(item.data as any).model_name}</p>
                        <p className="text-[10px] text-muted-foreground/60">Model</p>
                      </div>
                    </div>
                  )}
                  {(item.data as any).product_name && (
                    <div className="flex items-center gap-2.5">
                      {(item.data as any).product_image_url && (
                        <img
                          src={getOptimizedUrl((item.data as any).product_image_url, { quality: 60 })}
                          alt={(item.data as any).product_name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <p className="text-xs font-medium text-foreground">{(item.data as any).product_name}</p>
                        <p className="text-[10px] text-muted-foreground/60">Product</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Admin metadata editor */}
            {isAdmin && (() => {
              const isScene = item.type === 'scene';
              const poseId = isScene ? (item.data as any).poseId : null;
              const isCustomScene = isScene && typeof poseId === 'string' && poseId.startsWith('custom-');
              const isBuiltInScene = isScene && !isCustomScene;

              return (
              <div className="space-y-3 p-3 border border-dashed border-border/50 rounded-xl">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/50">
                  Admin: Edit Metadata {isScene && <span className="text-primary/60">(Scene)</span>}
                </p>
                {/* Debug info */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] font-mono bg-muted/30 rounded-lg p-2">
                  <span className="text-muted-foreground/60">Type</span>
                  <span className="text-foreground/80">{isScene ? 'scene' : 'preset'}</span>
                  <span className="text-muted-foreground/60">ID</span>
                  <button
                    className="text-foreground/80 text-left hover:text-primary truncate transition-colors"
                    title="Click to copy"
                    onClick={() => {
                      const id = isScene ? poseId : (item.data as any).id;
                      navigator.clipboard.writeText(id || '');
                      toast.success('ID copied');
                    }}
                  >{isScene ? poseId : (item.data as any).id}</button>
                  <span className="text-muted-foreground/60">Slug</span>
                  <span className="text-foreground/80 truncate">{getItemSlug(item)}</span>
                  {isScene && (
                    <>
                      <span className="text-muted-foreground/60">Prompt Only</span>
                      <span className="text-foreground/80">{(item.data as any).promptOnly ? 'yes' : 'no'}</span>
                    </>
                  )}
                  <span className="text-muted-foreground/60">DB Category</span>
                  <span className="text-foreground/80">{isScene ? (item.data as any).category || '—' : (item.data as any).category || '—'}</span>
                  <span className="text-muted-foreground/60">DB Sub-family</span>
                  <span className="text-foreground/80">{(item.data as any).subcategory || '—'}</span>
                  <span className="text-muted-foreground/60">DB Workflow</span>
                  <span className="text-foreground/80">{(item.data as any).workflow_slug || '—'}</span>
                </div>
                {/* Scene-specific editable fields */}
                {isCustomScene && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <p className="text-[10px] font-medium text-muted-foreground/60 mb-1">Scene Display Name</p>
                      <Input
                        value={editSceneDisplayName}
                        onChange={(e) => setEditSceneDisplayName(e.target.value)}
                        placeholder="Scene name"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] font-medium text-muted-foreground/60 mb-1">Scene Category</p>
                      <Select value={editSceneCategory} onValueChange={setEditSceneCategory}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="z-[300] max-h-60">
                          {allCategorySlugs.map(slug => (
                            <SelectItem key={slug} value={slug} className="text-xs capitalize">
                              {allCategoryLabels[slug] || slug}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-[10px] font-medium text-muted-foreground/60">Explore Categories</p>
                  <div className="flex flex-wrap gap-1">
                    {DISCOVER_CATEGORY_OPTIONS.map(cat => {
                      const isSelected = editCategories.includes(cat.id);
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setEditCategories(prev =>
                              isSelected
                                ? prev.filter(c => c !== cat.id)
                                : [...prev, cat.id]
                            );
                          }}
                          className={cn(
                            'h-6 px-2 rounded-full text-[10px] font-medium border transition-colors',
                            isSelected
                              ? 'border-primary/40 bg-primary/10 text-primary'
                              : 'border-border/60 bg-muted/30 text-muted-foreground/60 hover:bg-muted/60 hover:text-foreground/70'
                          )}
                        >
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {(() => {
                  const firstFam = editCategories[0];
                  const subs = firstFam ? getDiscoverSubtypes(firstFam) : [];
                  if (subs.length < 2) return null;
                  const famLabel = DISCOVER_CATEGORY_OPTIONS.find(c => c.id === firstFam)?.label ?? firstFam;
                  return (
                    <div className="space-y-1">
                      <p className="text-[10px] font-medium text-muted-foreground/60">Sub-family ({famLabel})</p>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditSubcategory(null)}
                          className={cn(
                            'rounded-full px-3 py-1 text-[11px] font-medium border transition-colors',
                            editSubcategory === null
                              ? 'bg-foreground text-background border-foreground'
                              : 'border-border/60 bg-background text-muted-foreground/70 hover:text-foreground hover:border-border'
                          )}
                        >None</button>
                        {subs.map(s => {
                          const active = editSubcategory === s.slug;
                          return (
                            <button
                              key={s.slug}
                              type="button"
                              onClick={() => setEditSubcategory(active ? null : s.slug)}
                              className={cn(
                                'rounded-full px-3 py-1 text-[11px] font-medium border transition-colors',
                                active
                                  ? 'bg-foreground text-background border-foreground'
                                  : 'border-border/60 bg-background text-muted-foreground/70 hover:text-foreground hover:border-border'
                              )}
                            >{s.label}</button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <p className="text-[10px] font-medium text-muted-foreground/60">Workflow</p>
                    <Select value={editWorkflowSlug} onValueChange={setEditWorkflowSlug}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Workflow" />
                      </SelectTrigger>
                       <SelectContent className="z-[300] max-h-60">
                        <SelectItem value="__freestyle__" className="text-xs">Freestyle</SelectItem>
                        {(workflows ?? []).map(w => (
                          <SelectItem key={w.slug} value={w.slug} className="text-xs">{w.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-medium text-muted-foreground/60">Model Selection</p>
                    <Select value={editModelName} onValueChange={setEditModelName}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Model" />
                      </SelectTrigger>
                       <SelectContent className="z-[300] max-h-60">
                        <SelectItem value="__none__" className="text-xs">None</SelectItem>
                        {allModelOptions.map((m, idx) => (
                          <SelectItem key={`model-${idx}`} value={m.name} className="text-xs" textValue={m.name}>
                            <div className="flex items-center gap-2">
                              <img src={getOptimizedUrl(m.imageUrl, { quality: 40 })} alt="" className="w-5 h-5 rounded object-cover shrink-0" />
                              <span>{m.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-medium text-muted-foreground/60">Scene Selection</p>
                    <button
                      onClick={() => { setSceneDialogOpen(true); setSceneSearch(''); }}
                      className="flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-xs ring-offset-background hover:bg-accent/50 transition-colors"
                    >
                      {editSceneName === '__none__' ? (
                        <span className="text-muted-foreground">None</span>
                      ) : (
                        <div className="flex items-center gap-2 min-w-0">
                          {(() => { const sc = allSceneOptions.find(s => s.name === editSceneName); return sc ? <img src={getOptimizedUrl(sc.imageUrl, { quality: 40 })} alt="" className="w-5 h-5 rounded object-cover shrink-0" /> : null; })()}
                          <span className="truncate">{editSceneName}</span>
                        </div>
                      )}
                      <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    </button>
                    {sceneDialogOpen && (
                      <div className="fixed inset-0 z-[250] flex items-center justify-center p-4" onClick={() => setSceneDialogOpen(false)}>
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                        <div className="relative z-10 bg-background border border-border rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                          <div className="px-4 pt-4 pb-2 border-b border-border/40 space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold">Select Scene</p>
                              <button onClick={() => setSceneDialogOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="relative">
                              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                              <Input
                                value={sceneSearch}
                                onChange={(e) => setSceneSearch(e.target.value)}
                                placeholder="Search scenes..."
                                className="h-8 pl-8 text-xs"
                                autoFocus
                              />
                            </div>
                          </div>
                          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                            <button
                              onClick={() => { setEditSceneName('__none__'); setSceneDialogOpen(false); }}
                              className={cn('w-full text-left px-3 py-2 rounded-md text-xs transition-colors', editSceneName === '__none__' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground')}
                            >
                              None (no scene)
                            </button>
                            {(() => {
                              const q = sceneSearch.toLowerCase();
                              const filtered = q ? allSceneOptions.filter(s => s.name.toLowerCase().includes(q)) : allSceneOptions;
                              const grouped = new Map<string, typeof filtered>();
                              filtered.forEach(s => {
                                const arr = grouped.get(s.category) ?? [];
                                arr.push(s);
                                grouped.set(s.category, arr);
                              });
                              return Array.from(grouped.entries()).map(([cat, scenes]) => (
                                <div key={cat}>
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50 mb-2 px-1">
                                    {poseCategoryLabels[cat] ?? cat}
                                  </p>
                                  <div className="grid grid-cols-4 gap-2">
                                    {scenes.map(s => (
                                      <button
                                        key={s.name}
                                        onClick={() => { setEditSceneName(s.name); setSceneDialogOpen(false); }}
                                        className={cn(
                                          'rounded-lg overflow-hidden border-2 transition-all',
                                          editSceneName === s.name ? 'border-primary ring-2 ring-primary/30' : 'border-transparent hover:border-border'
                                        )}
                                      >
                                        <ShimmerImage
                                          src={getOptimizedUrl(s.imageUrl, { quality: 50 })}
                                          alt={s.name}
                                          className="w-full aspect-[4/5] object-cover"
                                          wrapperClassName="h-auto"
                                          aspectRatio="4/5"
                                          loading="lazy"
                                        />
                                        <div className="px-1.5 py-1 bg-background">
                                          <p className="text-[10px] font-medium text-foreground leading-tight truncate">{s.name}</p>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-medium text-muted-foreground/60">Prompt</p>
                  <Textarea
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder={isScene ? "Prompt hint / description" : "Prompt for Recreate this..."}
                    className="text-xs min-h-[60px]"
                    rows={3}
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-medium text-muted-foreground/60">Product</p>
                  <Popover open={productPopoverOpen} onOpenChange={(o) => { setProductPopoverOpen(o); if (!o) setProductSearch(''); }}>
                    <PopoverTrigger asChild>
                      <button className="flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-xs ring-offset-background hover:bg-accent/50 transition-colors">
                        {editProductSource === '__none__' ? (
                          <span className="text-muted-foreground">None</span>
                        ) : editProductSource === '__custom__' ? (
                          <span>Custom</span>
                        ) : (() => {
                          const found = myProducts?.find(p => p.id === editProductSource);
                          return found ? (
                            <div className="flex items-center gap-2 truncate">
                              <img src={getOptimizedUrl(found.image_url, { quality: 40 })} alt="" className="w-5 h-5 rounded object-cover shrink-0" />
                              <span className="truncate">{found.title}</span>
                            </div>
                          ) : <span className="text-muted-foreground">Select product</span>;
                        })()}
                        <Search className="h-3 w-3 shrink-0 opacity-50 ml-1" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="z-[300] w-[var(--radix-popover-trigger-width)] p-0" align="start" sideOffset={4}>
                      <div className="p-2 border-b border-border">
                        <Input
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          placeholder="Search products..."
                          className="h-7 text-xs"
                          autoFocus
                        />
                      </div>
                      <div className="max-h-52 overflow-y-auto p-1">
                        {!productSearch && (
                          <>
                            <button
                              className={cn("flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs cursor-default hover:bg-accent", editProductSource === '__none__' && "bg-accent")}
                              onClick={() => { setEditProductSource('__none__'); setEditProductName(''); setEditProductImageUrl(''); setProductPopoverOpen(false); }}
                            >None</button>
                            <button
                              className={cn("flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs cursor-default hover:bg-accent", editProductSource === '__custom__' && "bg-accent")}
                              onClick={() => { setEditProductSource('__custom__'); setProductPopoverOpen(false); }}
                            >Custom</button>
                          </>
                        )}
                        {(myProducts ?? [])
                          .filter(p => !productSearch || p.title?.toLowerCase().includes(productSearch.toLowerCase()))
                          .map(p => (
                            <button
                              key={p.id}
                              className={cn("flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs cursor-default hover:bg-accent", editProductSource === p.id && "bg-accent")}
                              onClick={() => {
                                setEditProductSource(p.id);
                                setEditProductName(p.title);
                                setEditProductImageUrl(p.image_url);
                                setProductPopoverOpen(false);
                              }}
                            >
                              <img src={getOptimizedUrl(p.image_url, { quality: 40 })} alt="" className="w-5 h-5 rounded object-cover shrink-0" />
                              <span className="truncate">{p.title}</span>
                            </button>
                          ))}
                        {productSearch && (myProducts ?? []).filter(p => p.title?.toLowerCase().includes(productSearch.toLowerCase())).length === 0 && (
                          <p className="text-xs text-muted-foreground text-center py-3">No products found</p>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                  {editProductSource === '__custom__' && (
                    <div className="grid grid-cols-2 gap-2 mt-1.5">
                      <Input
                        value={editProductName}
                        onChange={(e) => setEditProductName(e.target.value)}
                        placeholder="Product name"
                        className="h-8 text-xs"
                      />
                      <Input
                        value={editProductImageUrl}
                        onChange={(e) => setEditProductImageUrl(e.target.value)}
                        placeholder="Product image URL"
                        className="h-8 text-xs"
                      />
                    </div>
                  )}
                </div>
                {(() => {
                  const origCategory = isScene ? ((item.data as any).category || 'lifestyle') : ((item.data as any).category || 'fashion');
                  const origWorkflow = (item.data as any).workflow_slug || '__freestyle__';
                  const origModel = (item.data as any).model_name || '__none__';
                  const origScene = (item.data as any).scene_name || '__none__';
                  const origPrompt = isScene ? ((item.data as any).promptHint || (item.data as any).description || '') : ((item.data as any).prompt || '');
                  const origProduct = (item.data as any).product_name || '';
                  const origSceneDisplayName = (item.data as any).name || '';
                  const origSceneCategory = (item.data as any).category || 'lifestyle';
                  const origSubcategory = (item.data as any).subcategory ?? null;
                  const hasChanges = editCategories.join(',') !== origCategory || editWorkflowSlug !== origWorkflow || editModelName !== origModel || editSceneName !== origScene || editPrompt !== origPrompt || editProductName !== origProduct || editSubcategory !== origSubcategory || (isScene && (editSceneDisplayName !== origSceneDisplayName || editSceneCategory !== origSceneCategory));
                  return null; // rendered below
                })()}
                <Button
                  size="sm"
                  variant="outline"
                  disabled={savingMeta}
                  className={cn("w-full h-8 text-xs", (() => {
                    const origCategory = isScene ? ((item.data as any).category || 'lifestyle') : ((item.data as any).category || 'fashion');
                    const origWorkflow = (item.data as any).workflow_slug || '__freestyle__';
                    const origModel = (item.data as any).model_name || '__none__';
                    const origScene = (item.data as any).scene_name || '__none__';
                    const origPrompt = isScene ? ((item.data as any).promptHint || (item.data as any).description || '') : ((item.data as any).prompt || '');
                    const origProduct = (item.data as any).product_name || '';
                    const origSceneDisplayName = (item.data as any).name || '';
                    const origSceneCategory = (item.data as any).category || 'lifestyle';
                    const origSubcategory = (item.data as any).subcategory ?? null;
                    const hasChanges = editCategories.join(',') !== origCategory || editWorkflowSlug !== origWorkflow || editModelName !== origModel || editSceneName !== origScene || editPrompt !== origPrompt || editProductName !== origProduct || editSubcategory !== origSubcategory || (isScene && (editSceneDisplayName !== origSceneDisplayName || editSceneCategory !== origSceneCategory));
                    return hasChanges ? 'border-primary text-primary hover:bg-primary/10' : '';
                  })())}
                  onClick={async () => {
                    setSavingMeta(true);

                    const selectedModel = editModelName !== '__none__' ? allModelOptions.find(m => m.name === editModelName) : null;
                    const selectedScene = editSceneName !== '__none__' ? allSceneOptions.find(s => s.name === editSceneName) : null;
                    const selectedWorkflow = editWorkflowSlug !== '__freestyle__' ? (workflows ?? []).find(w => w.slug === editWorkflowSlug) : null;

                    let safeProductImageUrl: string | null = null;
                    if (editProductImageUrl.trim()) {
                      try {
                        const { data: previewData, error: previewErr } = await supabase.functions.invoke('generate-discover-preview', {
                          body: { sourceUrl: editProductImageUrl.trim(), postId: (item.data as any).id || (item.data as any).poseId },
                        });
                        if (!previewErr && previewData?.publicUrl) {
                          safeProductImageUrl = previewData.publicUrl;
                        } else {
                          safeProductImageUrl = editProductImageUrl.trim();
                        }
                      } catch {
                        safeProductImageUrl = editProductImageUrl.trim();
                      }
                    }

                    const presetData: Record<string, any> = {
                      category: editCategories[0] || 'fashion',
                      discover_categories: editCategories,
                      subcategory: editSubcategory,
                      model_image_url: selectedModel?.imageUrl ?? null,
                      scene_name: selectedScene?.name ?? null,
                      scene_image_url: selectedScene?.imageUrl ?? null,
                      workflow_slug: selectedWorkflow?.slug ?? null,
                      workflow_name: selectedWorkflow?.name ?? null,
                      prompt: editPrompt ?? '',
                      product_name: editProductName.trim() || null,
                      product_image_url: safeProductImageUrl,
                    };

                    if (isScene) {
                      // For scenes: upsert into discover_presets to "promote" them
                      const sceneTitle = (item.data as any).name || title;
                      const sceneImage = (item.data as any).previewUrl || imageUrl;

                      // Also update custom_scenes if it's a custom scene
                      if (isCustomScene) {
                        const realId = poseId!.replace('custom-', '');
                        await supabase
                          .from('custom_scenes')
                          .update({
                            category: editSceneCategory || editCategories[0] || 'fashion',
                            name: editSceneDisplayName.trim() || (item.data as any).name,
                            discover_categories: editCategories,
                            subcategory: editSubcategory,
                          } as any)
                          .eq('id', realId);
                      }

                      // Check if a discover_presets row already exists for this scene
                      const { data: existingPreset } = await supabase
                        .from('discover_presets')
                        .select('id')
                        .eq('title', sceneTitle)
                        .maybeSingle();

                      if (existingPreset) {
                        const { error } = await supabase
                          .from('discover_presets')
                          .update(presetData)
                          .eq('id', existingPreset.id);
                        setSavingMeta(false);
if (error) { toast.error('Failed to save', { position: 'top-left' }); return; }
                       } else {
                         const { error } = await supabase
                           .from('discover_presets')
                           .insert({
                             ...presetData,
                             title: sceneTitle,
                             slug: '',
                             image_url: sceneImage,
                           } as any);
                         setSavingMeta(false);
                         if (error) { toast.error('Failed to save: ' + error.message, { position: 'top-left' }); return; }
                       }

                       queryClient.invalidateQueries({ queryKey: ['discover-presets'] });
                       queryClient.invalidateQueries({ queryKey: ['custom-scenes'] });
                       queryClient.invalidateQueries({ queryKey: ['public-custom-scenes'] });
                       toast.success('Scene promoted to Discover preset', { position: 'top-left' });
                     } else {
                       const { error } = await supabase
                         .from('discover_presets')
                         .update(presetData)
                         .eq('id', (item.data as any).id);
                       setSavingMeta(false);
                       if (error) { toast.error('Failed to save', { position: 'top-left' }); return; }
                       queryClient.invalidateQueries({ queryKey: ['discover-presets'] });
                       toast.success('Metadata saved', { position: 'top-left' });
                    }
                  }}
                >
                  {savingMeta ? 'Saving…' : isScene ? 'Save & promote to preset' : 'Save metadata'}
                </Button>
              </div>
              );
            })()}

            {/* Primary CTA */}
            <Button
              onClick={() => {
                const d = item.data as any;
                const wSlug = d.workflow_slug;
                // Scene-type items always belong to product-images
                if (item.type === 'scene') {
                  onClose();
                  const params = new URLSearchParams();
                  const sceneTitle = d.name || d.scene_name;
                  if (sceneTitle) params.set('scene', sceneTitle);
                  const sceneImg = d.previewUrl || d.scene_image_url || d.image_url;
                  if (sceneImg) params.set('sceneImage', sceneImg);
                  // Pass origin category as a disambiguation hint for the resolver
                  if (d.category) params.set('sceneCategory', d.category);
                  params.set('fromDiscover', '1');
                  navigate(`/app/generate/product-images?${params.toString()}`);
                  return;
                }
                if (wSlug) {
                  onClose();
                  const params = new URLSearchParams();
                  if (d.model_name) params.set('model', d.model_name);
                  if (d.scene_name) params.set('scene', d.scene_name);
                  if (d.model_image_url) params.set('modelImage', d.model_image_url);
                  if (d.scene_image_url) params.set('sceneImage', d.scene_image_url);
                  if (!params.get('sceneImage') && d.image_url) {
                    params.set('sceneImage', d.image_url);
                  }
                  params.set('fromDiscover', '1');
                  navigate(`/app/generate/${wSlug}?${params.toString()}`);
                } else {
                  onClose();
                  const params = new URLSearchParams();
                  if (d.prompt) params.set('prompt', d.prompt);
                  if (d.aspect_ratio) params.set('ratio', d.aspect_ratio);
                  if (d.quality) params.set('quality', d.quality);
                  if (d.model_name) params.set('model', d.model_name);
                  if (d.scene_name) params.set('scene', d.scene_name);
                  if (d.model_image_url) params.set('modelImage', d.model_image_url);
                  if (d.scene_image_url) params.set('sceneImage', d.scene_image_url);
                  if (!params.get('sceneImage') && d.image_url) {
                    params.set('sceneImage', d.image_url);
                  }
                  params.set('fromDiscover', '1');
                  navigate(`/app/freestyle?${params.toString()}`);
                }
              }}
              size="pill"
              className="w-full font-medium shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-shadow duration-300"
            >
              Recreate this
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            {/* Secondary actions */}
            <div className="flex gap-2">
              {onToggleSave && (
                <Button
                  variant="outline"
                  size="pill"
                  onClick={onToggleSave}
                  className={cn(
                    'flex-1 font-medium gap-1.5',
                    isSaved ? 'text-destructive border-destructive/20' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Heart className={cn('w-4 h-4', isSaved && 'fill-current')} />
                  {isSaved ? 'Saved' : 'Save'}
                </Button>
              )}
              <Button
                variant="outline"
                size="pill"
                onClick={() => { onSearchSimilar(item); onClose(); }}
                className="flex-1 font-medium gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <Search className="w-4 h-4" /> Similar
              </Button>
              <SharePopover
                url={`${SITE_URL}/discover/${getItemSlug(item)}`}
                title={title}
                variant="action"
              />
              {isAdmin && onToggleFeatured && (
                <Button
                  variant="outline"
                  size="pill"
                  onClick={onToggleFeatured}
                  className={cn(
                    'flex-1 font-medium gap-1.5',
                    isFeatured ? 'text-amber-500 border-amber-500/20' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Star className={cn('w-4 h-4', isFeatured && 'fill-current')} />
                  {isFeatured ? 'Unfeature' : 'Feature'}
                </Button>
              )}
              {isAdmin && onDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full text-destructive border-destructive/20 bg-destructive/10 hover:bg-destructive/20 hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="z-[300]">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete from Discover?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently remove "{title}". This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            {/* More like this */}
            {relatedItems.length > 0 && (
              <div className="pt-5 border-t border-border/30">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/50 mb-3">
                  More like this
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {relatedItems.map((ri) => {
                    const riImage = ri.type === 'preset' ? ri.data.image_url : ri.data.previewUrl;
                    const riTitle = ri.type === 'preset' ? ri.data.title : ri.data.name;
                    const riKey = ri.type === 'preset' ? `p-${ri.data.id}` : `s-${ri.data.poseId}`;
                    return (
                      <button
                        key={riKey}
                        onClick={() => onSelectRelated(ri)}
                        className="aspect-[3/4] rounded-xl overflow-hidden bg-muted hover:ring-2 ring-primary/50 transition-all duration-200 hover:scale-[1.03] shadow-sm hover:shadow-md"
                      >
                        <ShimmerImage src={getOptimizedUrl(riImage, { quality: 60 })} alt={riTitle} className="w-full h-full object-cover" aspectRatio="3/4" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
