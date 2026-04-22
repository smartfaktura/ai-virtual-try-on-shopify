import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { Navigate, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, Star, X, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from '@/lib/brandedToast';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { cn } from '@/lib/utils';
import { PRODUCT_CATEGORIES } from '@/lib/categoryConstants';
import {
  CATEGORY_FAMILY_MAP,
  FAMILY_ORDER,
  getSubFamilyLabel,
  interleaveByFamily,
} from '@/lib/sceneTaxonomy';

type ViewMode = 'interleaved' | 'grouped';
const VIEW_MODE_KEY = 'admin-rec-scenes:view-mode';
const CHUNK_SIZE_KEY = 'admin-rec-scenes:chunk-size';
const FEATURED_PREVIEW_KEY = 'admin-rec-scenes:featured-preview';

interface SceneRow {
  id: string;
  scene_id: string;
  title: string;
  sub_category: string | null;
  category_collection: string | null;
  preview_image_url: string | null;
  subject: string | null;
  shot_style: string | null;
}

interface RecommendedRow {
  id: string;
  scene_id: string;
  sort_order: number;
  category: string | null;
}

const GLOBAL = 'global';
const CATEGORY_TABS: { key: string; label: string }[] = [
  { key: GLOBAL, label: 'Global' },
  ...PRODUCT_CATEGORIES.filter(c => c.id !== 'any').map(c => ({ key: c.id, label: c.label })),
];

const RECOMMENDED_CAP = 12;
const PAGE_SIZE = 1000;
const HARD_CAP = 5000;

export default function AdminRecommendedScenes() {
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>(GLOBAL);
  const [familyFilter, setFamilyFilter] = useState<string | null>(null);
  const [collectionFilter, setCollectionFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window === 'undefined') return 'interleaved';
    return (localStorage.getItem(VIEW_MODE_KEY) as ViewMode) || 'interleaved';
  });
  const [chunkSize, setChunkSize] = useState<number>(() => {
    if (typeof window === 'undefined') return 2;
    const v = parseInt(localStorage.getItem(CHUNK_SIZE_KEY) || '2', 10);
    return Number.isFinite(v) && v >= 1 && v <= 4 ? v : 2;
  });
  const [featuredPreview, setFeaturedPreview] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(FEATURED_PREVIEW_KEY) === '1';
  });

  const updateViewMode = (m: ViewMode) => {
    setViewMode(m);
    try { localStorage.setItem(VIEW_MODE_KEY, m); } catch {}
  };
  const updateChunkSize = (n: number) => {
    const clamped = Math.min(4, Math.max(1, n));
    setChunkSize(clamped);
    try { localStorage.setItem(CHUNK_SIZE_KEY, String(clamped)); } catch {}
  };
  const updateFeaturedPreview = (v: boolean) => {
    setFeaturedPreview(v);
    try { localStorage.setItem(FEATURED_PREVIEW_KEY, v ? '1' : '0'); } catch {}
  };

  const dbCategory = activeCategory === GLOBAL ? null : activeCategory;

  // Paged fetch — bypass PostgREST 1k cap.
  const { data: scenes = [], isLoading: scenesLoading } = useQuery({
    queryKey: ['admin-all-scenes-light-paged'],
    enabled: isAdmin,
    queryFn: async () => {
      const all: SceneRow[] = [];
      let from = 0;
      while (from < HARD_CAP) {
        const to = from + PAGE_SIZE - 1;
        const { data, error } = await supabase
          .from('product_image_scenes' as any)
          .select('id, scene_id, title, sub_category, category_collection, preview_image_url, subject, shot_style')
          .eq('is_active', true)
          .order('category_collection', { ascending: true })
          .order('sort_order', { ascending: true })
          .range(from, to);
        if (error) throw error;
        const rows = (data ?? []) as unknown as SceneRow[];
        all.push(...rows);
        if (rows.length < PAGE_SIZE) break;
        from += PAGE_SIZE;
      }
      return all;
    },
  });

  const { data: recommended = [], isLoading: recLoading } = useQuery({
    queryKey: ['admin-recommended-scenes', dbCategory],
    enabled: isAdmin,
    queryFn: async () => {
      let q: any = supabase
        .from('recommended_scenes' as any)
        .select('id, scene_id, sort_order, category');
      q = dbCategory === null ? q.is('category', null) : q.eq('category', dbCategory);
      const { data, error } = await q.order('sort_order', { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as RecommendedRow[];
    },
  });

  const recommendedMap = useMemo(() => {
    const m = new Map<string, RecommendedRow>();
    for (const r of recommended) m.set(r.scene_id, r);
    return m;
  }, [recommended]);

  const sceneById = useMemo(() => {
    const m = new Map<string, SceneRow>();
    for (const s of scenes) m.set(s.scene_id, s);
    return m;
  }, [scenes]);

  const recommendedScenes = useMemo(() => {
    return recommended
      .map(r => ({ rec: r, scene: sceneById.get(r.scene_id) }))
      .filter(x => !!x.scene) as { rec: RecommendedRow; scene: SceneRow }[];
  }, [recommended, sceneById]);

  // ---- Family + sub-family filter derivation ----
  const familyCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of scenes) {
      const fam = s.category_collection ? CATEGORY_FAMILY_MAP[s.category_collection] : null;
      if (!fam) continue;
      counts[fam] = (counts[fam] ?? 0) + 1;
    }
    return counts;
  }, [scenes]);

  const families = useMemo(() => {
    return FAMILY_ORDER.filter(f => (familyCounts[f] ?? 0) > 0);
  }, [familyCounts]);

  const subCollections = useMemo(() => {
    if (!familyFilter) return [];
    const map = new Map<string, number>();
    for (const s of scenes) {
      if (!s.category_collection) continue;
      if (CATEGORY_FAMILY_MAP[s.category_collection] !== familyFilter) continue;
      map.set(s.category_collection, (map.get(s.category_collection) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([slug, count]) => ({ slug, count }));
  }, [scenes, familyFilter]);

  const filteredScenes = useMemo(() => {
    const q = search.trim().toLowerCase();
    return scenes.filter(s => {
      if (familyFilter) {
        const fam = s.category_collection ? CATEGORY_FAMILY_MAP[s.category_collection] : null;
        if (fam !== familyFilter) return false;
      }
      if (collectionFilter && s.category_collection !== collectionFilter) return false;
      if (q) {
        const hay =
          s.title.toLowerCase() +
          ' ' + (s.sub_category ?? '').toLowerCase() +
          ' ' + (s.category_collection ?? '').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [scenes, search, familyFilter, collectionFilter]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-recommended-scenes'] });
    qc.invalidateQueries({ queryKey: ['scene-recommended'] });
  };

  const addMutation = useMutation({
    mutationFn: async (scene_id: string) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error('Not authenticated');
      const nextSort = (recommended[recommended.length - 1]?.sort_order ?? -1) + 1;
      const { error } = await supabase.from('recommended_scenes' as any).insert({
        scene_id,
        sort_order: nextSort,
        created_by: u.user.id,
        category: dbCategory,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success('Added to recommended');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const removeMutation = useMutation({
    mutationFn: async (scene_id: string) => {
      let q: any = supabase.from('recommended_scenes' as any).delete().eq('scene_id', scene_id);
      q = dbCategory === null ? q.is('category', null) : q.eq('category', dbCategory);
      const { error } = await q;
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success('Removed');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const reorderMutation = useMutation({
    mutationFn: async (updates: { id: string; sort_order: number }[]) => {
      for (const u of updates) {
        const { error } = await supabase
          .from('recommended_scenes' as any)
          .update({ sort_order: u.sort_order })
          .eq('id', u.id);
        if (error) throw error;
      }
    },
    onSuccess: invalidate,
    onError: (e: any) => toast.error(e.message),
  });

  const move = (index: number, direction: -1 | 1) => {
    const next = index + direction;
    if (next < 0 || next >= recommendedScenes.length) return;
    const a = recommendedScenes[index].rec;
    const b = recommendedScenes[next].rec;
    reorderMutation.mutate([
      { id: a.id, sort_order: b.sort_order },
      { id: b.id, sort_order: a.sort_order },
    ]);
  };

  if (adminLoading) return null;
  if (!isAdmin) return <Navigate to="/app" replace />;

  const overCap = recommendedScenes.length > RECOMMENDED_CAP;
  const activeLabel = CATEGORY_TABS.find(t => t.key === activeCategory)?.label ?? 'Global';

  return (
    <div className="container max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/app/admin/product-image-scenes">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">Recommended Scenes</h1>
          <p className="text-sm text-muted-foreground">
            Curate the "Recommended for you" rail per onboarding category. Aim for {RECOMMENDED_CAP} scenes per list. Users get a merged list from all categories they picked at signup, with Global as the fallback.
          </p>
        </div>
      </div>

      {/* Category selector */}
      <div className="flex flex-wrap gap-2">
        {CATEGORY_TABS.map(tab => {
          const isActive = tab.key === activeCategory;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveCategory(tab.key)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-foreground border-border hover:border-border/80'
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Featured set */}
      <section className="border border-border/40 rounded-xl bg-card">
        <header className="px-4 py-3 border-b border-border/40 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold">
              {activeLabel} · Featured ({recommendedScenes.length}/{RECOMMENDED_CAP})
            </h2>
            {overCap && (
              <Badge variant="destructive" className="text-[10px]">Over cap</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Use ↑ / ↓ on a card to reorder. Position 1 appears first in the user's rail.
          </p>
        </header>
        <div className="p-4">
          {recLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/5] rounded-lg" />
              ))}
            </div>
          ) : recommendedScenes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No featured scenes for {activeLabel} yet. Add some from the list below.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {recommendedScenes.map(({ rec, scene }, i) => (
                <div key={rec.id} className="relative group rounded-lg overflow-hidden border border-border bg-card">
                  {scene.preview_image_url ? (
                    <ShimmerImage
                      src={getOptimizedUrl(scene.preview_image_url, { quality: 60 })}
                      alt={scene.title}
                      className="w-full aspect-[4/5] object-cover"
                      wrapperClassName="h-auto"
                      aspectRatio="4/5"
                    />
                  ) : (
                    <div className="w-full aspect-[4/5] bg-muted" />
                  )}
                  {/* Position badge */}
                  <div className="absolute top-1.5 left-1.5 min-w-6 h-6 px-1.5 rounded-full bg-foreground text-background text-[11px] font-semibold flex items-center justify-center shadow">
                    {i + 1}
                  </div>
                  <div className="p-2">
                    <p className="text-[11px] font-medium text-foreground truncate">{scene.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {scene.sub_category || scene.category_collection || '—'}
                    </p>
                  </div>
                  <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      className="w-6 h-6 rounded-full bg-background/95 border border-border flex items-center justify-center disabled:opacity-30"
                      aria-label="Move up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, 1)}
                      disabled={i === recommendedScenes.length - 1}
                      className="w-6 h-6 rounded-full bg-background/95 border border-border flex items-center justify-center disabled:opacity-30"
                      aria-label="Move down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeMutation.mutate(scene.scene_id)}
                      className="w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                      aria-label="Remove"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* All scenes */}
      <section className="border border-border/40 rounded-xl bg-card">
        <header className="px-4 py-3 border-b border-border/40 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-sm font-semibold">All scenes</h2>
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by title or category…"
                className="pl-9 h-9"
              />
            </div>
            <Badge variant="secondary" className="text-[11px]">
              {filteredScenes.length.toLocaleString()} / {scenes.length.toLocaleString()} scenes
            </Badge>
          </div>

          {/* Family pills */}
          <div className="flex flex-wrap gap-1.5">
            <FilterPill
              label={`All (${scenes.length})`}
              active={familyFilter === null}
              onClick={() => { setFamilyFilter(null); setCollectionFilter(null); }}
            />
            {families.map(fam => (
              <FilterPill
                key={fam}
                label={`${fam} (${familyCounts[fam] ?? 0})`}
                active={familyFilter === fam}
                onClick={() => {
                  setFamilyFilter(fam);
                  setCollectionFilter(null);
                }}
              />
            ))}
          </div>

          {/* Sub-family pills */}
          {familyFilter && subCollections.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pl-1 border-l-2 border-primary/30">
              <FilterPill
                label="All sub-families"
                active={collectionFilter === null}
                onClick={() => setCollectionFilter(null)}
                size="sm"
              />
              {subCollections.map(({ slug, count }) => (
                <FilterPill
                  key={slug}
                  label={`${getSubFamilyLabel(slug)} (${count})`}
                  active={collectionFilter === slug}
                  onClick={() => setCollectionFilter(slug)}
                  size="sm"
                />
              ))}
            </div>
          )}

          <p className="text-[11px] text-muted-foreground">
            Browsing order: grouped by Product Family (does not affect what users see). Click a card to add or remove from Featured.
          </p>
        </header>
        <div className="p-4">
          {scenesLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/5] rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {filteredScenes.map(scene => {
                const isFeatured = recommendedMap.has(scene.scene_id);
                return (
                  <button
                    type="button"
                    key={scene.id}
                    onClick={() =>
                      isFeatured
                        ? removeMutation.mutate(scene.scene_id)
                        : addMutation.mutate(scene.scene_id)
                    }
                    className={cn(
                      'relative rounded-lg overflow-hidden border-2 bg-card text-left transition-all duration-200',
                      isFeatured
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-transparent hover:border-border/60'
                    )}
                  >
                    {scene.preview_image_url ? (
                      <ShimmerImage
                        src={getOptimizedUrl(scene.preview_image_url, { quality: 60 })}
                        alt={scene.title}
                        className="w-full aspect-[4/5] object-cover"
                        wrapperClassName="h-auto"
                        aspectRatio="4/5"
                      />
                    ) : (
                      <div className="w-full aspect-[4/5] bg-muted" />
                    )}
                    {isFeatured && (
                      <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow">
                        <Star className="w-3 h-3 text-primary-foreground fill-current" />
                      </div>
                    )}
                    <div className="p-2">
                      <p className="text-[11px] font-medium text-foreground line-clamp-1">{scene.title}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">
                        {scene.sub_category || scene.category_collection || '—'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function FilterPill({
  label, active, onClick, size = 'md',
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  size?: 'sm' | 'md';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full font-medium border transition-colors',
        size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs',
        active
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-background text-muted-foreground border-border/60 hover:bg-muted'
      )}
    >
      {label}
    </button>
  );
}
