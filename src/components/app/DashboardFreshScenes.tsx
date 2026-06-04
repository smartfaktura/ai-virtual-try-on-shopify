import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { getCollectionLabel } from '@/hooks/usePublicSceneLibrary';
import { cn } from '@/lib/utils';

interface FreshScene {
  scene_id: string;
  title: string;
  category_collection: string | null;
  preview_image_url: string | null;
  created_at: string;
  owner_user_id: string | null;
  is_brand_scene: boolean | null;
}

const COLUMNS =
  'scene_id,title,category_collection,sub_category,preview_image_url,created_at,owner_user_id,is_brand_scene';

async function fetchFresh(): Promise<FreshScene[]> {
  const { data, error } = await supabase
    .from('product_image_scenes' as any)
    .select(COLUMNS)
    .eq('is_active', true)
    .is('owner_user_id', null)
    .eq('is_brand_scene', false)
    .neq('category_collection', 'bundle')
    .not('preview_image_url', 'is', null)
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw error;
  return ((data as any[]) || []).filter(
    (s) => !s.owner_user_id && s.is_brand_scene !== true && s.category_collection,
  ) as FreshScene[];
}

export function DashboardFreshScenes() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-fresh-scenes'],
    queryFn: fetchFresh,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const groups = useMemo(() => {
    const map = new Map<string, FreshScene[]>();
    for (const s of data || []) {
      const key = s.category_collection!;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    const result = Array.from(map.entries())
      .filter(([, list]) => list.length >= 4)
      .map(([slug, list]) => ({
        slug,
        label: getCollectionLabel(slug),
        scenes: list.slice(0, 8),
        latest: list[0]?.created_at ?? '',
      }))
      .sort((a, b) => (a.latest < b.latest ? 1 : -1))
      .slice(0, 8);
    return result;
  }, [data]);

  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const active = useMemo(
    () => groups.find((g) => g.slug === activeSlug) ?? groups[0],
    [groups, activeSlug],
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded-md bg-muted animate-pulse" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 w-24 rounded-full bg-muted animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!active) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Fresh scenes
          </h2>
          <p className="text-base text-muted-foreground mt-1.5">
            Just-added looks across your favorite categories
          </p>
        </div>
        <Link
          to="/product-visual-library#catalog-grid"
          className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          View all
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
        {groups.map((g) => {
          const isActive = g.slug === active.slug;
          return (
            <button
              key={g.slug}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActiveSlug(g.slug)}
              className={cn(
                'shrink-0 inline-flex items-center gap-1.5 h-9 px-4 rounded-full border text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-foreground border-border hover:border-primary/40',
              )}
            >
              {g.label}
              <span
                className={cn(
                  'text-[11px] tabular-nums',
                  isActive ? 'text-primary-foreground/80' : 'text-muted-foreground',
                )}
              >
                {g.scenes.length}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
        {active.scenes.map((scene) => (
          <Link
            key={scene.scene_id}
            to={`/app/generate/product-images?sceneId=${encodeURIComponent(scene.scene_id)}&from=fresh`}
            className="group rounded-xl overflow-hidden border border-transparent hover:border-border/60 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 bg-card"
          >
            {scene.preview_image_url ? (
              <ShimmerImage
                src={getOptimizedUrl(scene.preview_image_url, { quality: 60 })}
                alt={scene.title}
                className="w-full aspect-[4/5] object-cover"
                wrapperClassName="h-auto"
                aspectRatio="4/5"
                loading="lazy"
              />
            ) : (
              <div className="w-full aspect-[4/5] bg-muted" />
            )}
            <div className="px-2 py-1.5">
              <p className="text-[12px] font-medium text-foreground leading-tight truncate">
                {scene.title}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
