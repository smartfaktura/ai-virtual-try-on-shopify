import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { getCollectionLabel } from '@/hooks/usePublicSceneLibrary';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return '';
  const diffSec = Math.round((then - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const abs = Math.abs(diffSec);
  if (abs < 60) return rtf.format(diffSec, 'second');
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), 'hour');
  if (abs < 2592000) return rtf.format(Math.round(diffSec / 86400), 'day');
  if (abs < 31536000) return rtf.format(Math.round(diffSec / 2592000), 'month');
  return rtf.format(Math.round(diffSec / 31536000), 'year');
}



export function DashboardFreshScenes() {
  const navigate = useNavigate();
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
    return Array.from(map.entries())
      .filter(([, list]) => list.length >= 4)
      .map(([slug, list]) => ({
        slug,
        label: getCollectionLabel(slug),
        scenes: list.slice(0, 8),
        latest: list[0]?.created_at ?? '',
      }))
      .sort((a, b) => (a.latest < b.latest ? 1 : -1))
      .slice(0, 6);
  }, [data]);

  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const active = useMemo(
    () => groups.find((g) => g.slug === activeSlug) ?? groups[0],
    [groups, activeSlug],
  );

  const [preview, setPreview] = useState<FreshScene | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded-md bg-muted animate-pulse" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 w-24 rounded-full bg-muted animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!active) return null;

  const useScene = (sceneId: string) => {
    setPreview(null);
    navigate(`/app/generate/product-images?sceneId=${encodeURIComponent(sceneId)}&from=fresh`);
  };

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
        <a
          href="https://vovv.ai/product-visual-library"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          View all
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="flex flex-wrap gap-2">
        {groups.map((g) => {
          const isActive = g.slug === active.slug;
          return (
            <button
              key={g.slug}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActiveSlug(g.slug)}
              className={cn(
                'inline-flex items-center h-9 px-4 rounded-full border text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-foreground border-border hover:border-primary/40',
              )}
            >
              {g.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {active.scenes.map((scene) => (
          <button
            key={scene.scene_id}
            type="button"
            onClick={() => setPreview(scene)}
            className="group relative rounded-xl overflow-hidden bg-card ring-1 ring-border/40 hover:ring-border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md text-left"
          >
            {scene.preview_image_url ? (
              <ShimmerImage
                src={getOptimizedUrl(scene.preview_image_url, { quality: 70 })}
                alt={scene.title}
                className="w-full aspect-[4/5] object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                wrapperClassName="h-auto"
                aspectRatio="4/5"
                loading="lazy"
              />
            ) : (
              <div className="w-full aspect-[4/5] bg-muted" />
            )}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3">
              <p className="text-[13px] sm:text-sm font-semibold text-white leading-tight line-clamp-2 drop-shadow-sm">
                {scene.title}
              </p>
            </div>
            <span className="pointer-events-none absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-background/90 backdrop-blur px-2 py-1 text-[11px] font-medium text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              Preview
            </span>
          </button>
        ))}
      </div>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden border-0 bg-background shadow-2xl max-h-[92dvh] sm:max-h-[90vh]">
          {preview && (
            <div className="grid md:grid-cols-[auto_minmax(0,1fr)] bg-background overflow-y-auto max-h-[92dvh] sm:max-h-[90vh]">
              <div className="relative bg-muted overflow-hidden aspect-[4/5] md:aspect-[4/5] md:h-[80vh] md:w-auto">
                <img
                  src={getOptimizedUrl(preview.preview_image_url || '', { quality: 85 })}
                  alt={preview.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-5 md:gap-6 p-5 md:p-10 bg-background">
                <div className="space-y-3">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-medium">
                    {getCollectionLabel(preview.category_collection || '')}
                  </p>
                  <DialogTitle className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
                    {preview.title}
                  </DialogTitle>
                  <DialogDescription className="text-[15px] leading-relaxed text-muted-foreground">
                    Use this look as the visual reference for your next product shoot
                  </DialogDescription>
                </div>

                <div className="hidden md:block border-t border-border/60" />

                <div className="hidden md:block space-y-3">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-medium">
                    What you get
                  </p>
                  <ul className="space-y-2 text-sm text-foreground/85 leading-relaxed">
                    <li className="flex gap-2"><span className="text-muted-foreground">•</span>On-brand scene composition</li>
                    <li className="flex gap-2"><span className="text-muted-foreground">•</span>Lighting and color preserved</li>
                    <li className="flex gap-2"><span className="text-muted-foreground">•</span>Your product seamlessly placed</li>
                    <li className="flex gap-2"><span className="text-muted-foreground">•</span>2K PNG output</li>
                  </ul>
                </div>

                <div className="hidden md:block border-t border-border/60" />

                <dl className="hidden md:grid grid-cols-[110px_1fr] gap-y-2.5 text-sm">
                  <dt className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-medium self-center">Collection</dt>
                  <dd className="text-foreground">{getCollectionLabel(preview.category_collection || '')}</dd>
                  {preview.created_at && (
                    <>
                      <dt className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-medium self-center">Added</dt>
                      <dd className="text-foreground">{formatRelative(preview.created_at)}</dd>
                    </>
                  )}
                </dl>

                <div className="flex flex-col gap-3 pt-1 md:mt-auto md:pt-2">
                  <Button
                    size="lg"
                    onClick={() => useScene(preview.scene_id)}
                    onMouseUp={(e) => e.currentTarget.blur()}
                    onTouchEnd={(e) => e.currentTarget.blur()}
                    className="w-full gap-2 focus:ring-0 focus:ring-offset-0 focus-visible:ring-2 focus-visible:ring-offset-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Use this scene
                  </Button>
                  <button
                    type="button"
                    onClick={() => setPreview(null)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
                  >
                    Close
                  </button>
                </div>
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
