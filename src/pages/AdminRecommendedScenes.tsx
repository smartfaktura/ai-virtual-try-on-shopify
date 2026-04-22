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
}

export default function AdminRecommendedScenes() {
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: scenes = [], isLoading: scenesLoading } = useQuery({
    queryKey: ['admin-all-scenes-light'],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_image_scenes' as any)
        .select('id, scene_id, title, sub_category, category_collection, preview_image_url, subject, shot_style')
        .eq('is_active', true)
        .order('category_collection', { ascending: true })
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as SceneRow[];
    },
  });

  const { data: recommended = [], isLoading: recLoading } = useQuery({
    queryKey: ['admin-recommended-scenes'],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recommended_scenes' as any)
        .select('id, scene_id, sort_order')
        .order('sort_order', { ascending: true });
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

  const filteredScenes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return scenes;
    return scenes.filter(s =>
      s.title.toLowerCase().includes(q) ||
      (s.sub_category ?? '').toLowerCase().includes(q) ||
      (s.category_collection ?? '').toLowerCase().includes(q)
    );
  }, [scenes, search]);

  const addMutation = useMutation({
    mutationFn: async (scene_id: string) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error('Not authenticated');
      const nextSort = (recommended[recommended.length - 1]?.sort_order ?? -1) + 1;
      const { error } = await supabase.from('recommended_scenes' as any).insert({
        scene_id,
        sort_order: nextSort,
        created_by: u.user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-recommended-scenes'] });
      qc.invalidateQueries({ queryKey: ['recommended-scenes'] });
      toast.success('Added to recommended');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const removeMutation = useMutation({
    mutationFn: async (scene_id: string) => {
      const { error } = await supabase.from('recommended_scenes' as any).delete().eq('scene_id', scene_id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-recommended-scenes'] });
      qc.invalidateQueries({ queryKey: ['recommended-scenes'] });
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-recommended-scenes'] });
      qc.invalidateQueries({ queryKey: ['recommended-scenes'] });
    },
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

  return (
    <div className="container max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/app/admin/product-image-scenes">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">Recommended Scenes</h1>
          <p className="text-sm text-muted-foreground">
            Curate the "Recommended for you" rail in the Freestyle scene catalog. Personalisation also auto-fills from each user's onboarding categories.
          </p>
        </div>
      </div>

      {/* Featured set */}
      <section className="border border-border/40 rounded-xl bg-card">
        <header className="px-4 py-3 border-b border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold">Featured ({recommendedScenes.length})</h2>
          </div>
          <p className="text-xs text-muted-foreground">Top of the rail. Reorder with arrows.</p>
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
              No featured scenes yet. Add some from the list below.
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
                  <div className="p-2">
                    <p className="text-[11px] font-medium text-foreground truncate">{scene.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{scene.category_collection}</p>
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
        <header className="px-4 py-3 border-b border-border/40 flex items-center gap-3 flex-wrap">
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
          <Badge variant="secondary" className="text-[11px]">{filteredScenes.length} scenes</Badge>
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
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{scene.category_collection}</p>
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
