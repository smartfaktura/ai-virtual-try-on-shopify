import { useState, useRef, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Eye, Clock, Sparkles, Wand2, ImageIcon } from 'lucide-react';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { toSignedUrls } from '@/lib/signedUrl';
import { LibraryDetailModal } from '@/components/app/LibraryDetailModal';
import { EmptyStateCard } from '@/components/app/EmptyStateCard';
import { PageHeader } from '@/components/app/PageHeader';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import type { LibraryItem } from '@/components/app/LibraryImageCard';

/* ── helpers ── */

function extractImageUrls(results: unknown): string[] {
  if (!Array.isArray(results)) return [];
  return results
    .map((r) => (typeof r === 'string' ? r : r?.url || r?.image_url))
    .filter(Boolean) as string[];
}

/* ── types ── */

interface HistoryJob {
  id: string;
  source: 'generation' | 'freestyle';
  label: string;
  createdAt: string;
  imageUrls: string[];       // raw urls
  signedUrls?: string[];     // populated after signing
  libraryItems: LibraryItem[];
}

const PAGE_SIZE = 40;

/* ── data hook ── */

function useHistoryJobs(source: 'all' | 'generation' | 'freestyle') {
  const { user } = useAuth();
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ['history-jobs-v2', user?.id, source],
    queryFn: async () => {
      const jobs: HistoryJob[] = [];
      const fetchJobs = source !== 'freestyle';
      const fetchFreestyle = source !== 'generation';
      const promises: Promise<void>[] = [];

      if (fetchJobs) {
        promises.push(
          (async () => {
            const { data } = await supabase
              .from('generation_jobs')
              .select('id, results, created_at, workflow_slug, scene_name, model_name, product_name, prompt_final, ratio, quality, status')
              .order('created_at', { ascending: false })
              .limit(200);
            if (!data) return;
            for (const job of data) {
              const images = extractImageUrls(job.results);
              if (images.length === 0) continue;
              const isTryOn = images.some(u => u.includes('tryon-images'));
              const label = isTryOn ? 'Virtual Try-On' : (job.workflow_slug || 'Product Shot');

              const libraryItems: LibraryItem[] = images.map((url, i) => ({
                id: `${job.id}-${i}`,
                imageUrl: url,
                source: 'generation' as const,
                label,
                prompt: job.prompt_final || undefined,
                date: new Date(job.created_at).toLocaleDateString(),
                createdAt: job.created_at,
                aspectRatio: job.ratio,
                quality: job.quality,
                sceneName: job.scene_name || undefined,
                modelName: job.model_name || undefined,
                productName: job.product_name || undefined,
                workflowSlug: job.workflow_slug || undefined,
              }));

              jobs.push({ id: job.id, source: 'generation', label, createdAt: job.created_at, imageUrls: images, libraryItems });
            }
          })()
        );
      }

      if (fetchFreestyle) {
        promises.push(
          (async () => {
            const { data } = await supabase
              .from('freestyle_generations')
              .select('id, image_url, prompt, quality, aspect_ratio, created_at, provider_used')
              .order('created_at', { ascending: false })
              .limit(200);
            if (!data) return;
            for (const f of data) {
              const isUpscaled = f.quality?.startsWith('upscaled_');
              const label = isUpscaled ? 'Enhanced' : 'Freestyle';
              jobs.push({
                id: f.id,
                source: 'freestyle',
                label,
                createdAt: f.created_at,
                imageUrls: [f.image_url],
                libraryItems: [{
                  id: f.id,
                  imageUrl: f.image_url,
                  source: 'freestyle' as const,
                  label,
                  prompt: f.prompt,
                  date: new Date(f.created_at).toLocaleDateString(),
                  createdAt: f.created_at,
                  aspectRatio: f.aspect_ratio,
                  quality: f.quality,
                  providerUsed: (f as any).provider_used || null,
                }],
              });
            }
          })()
        );
      }

      await Promise.all(promises);
      jobs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

      // Batch-sign all URLs
      const allUrls: string[] = [];
      const indexMap: { jobIdx: number; start: number; count: number }[] = [];
      jobs.forEach((job, jobIdx) => {
        indexMap.push({ jobIdx, start: allUrls.length, count: job.imageUrls.length });
        allUrls.push(...job.imageUrls);
      });

      if (allUrls.length > 0) {
        const signed = await toSignedUrls(allUrls);
        indexMap.forEach(({ jobIdx, start, count }) => {
          const signedSlice = signed.slice(start, start + count);
          jobs[jobIdx].signedUrls = signedSlice;
          signedSlice.forEach((url, i) => {
            if (jobs[jobIdx].libraryItems[i]) {
              jobs[jobIdx].libraryItems[i].imageUrl = url;
            }
          });
        });
      }

      return jobs;
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });

  const jobs = query.data ?? [];
  const visibleJobs = jobs.slice(0, page * PAGE_SIZE);
  const hasMore = visibleJobs.length < jobs.length;

  return { jobs: visibleJobs, allCount: jobs.length, isLoading: query.isLoading, hasMore, loadMore: () => setPage(p => p + 1) };
}

/* ── card component ── */

const MAX_MINI = 3;
const SWIPE_THRESHOLD = 8;

function HistoryCard({ job, onSelect }: { job: HistoryJob; onSelect: (job: HistoryJob, idx: number) => void }) {
  const [errored, setErrored] = useState(false);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  const urls = job.signedUrls ?? job.imageUrls;
  const mainUrl = urls[0] ? getOptimizedUrl(urls[0], { quality: 60 }) : null;
  const hasMultiple = urls.length > 1;

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleClick = (e: React.MouseEvent) => {
    if (pointerStart.current) {
      const dx = Math.abs(e.clientX - pointerStart.current.x);
      const dy = Math.abs(e.clientY - pointerStart.current.y);
      if (dx > SWIPE_THRESHOLD || dy > SWIPE_THRESHOLD) { e.preventDefault(); return; }
    }
    onSelect(job, 0);
  };

  return (
    <div className="group/thumb flex flex-col gap-1.5">
      <button onPointerDown={handlePointerDown} onClick={handleClick} className="w-full text-left">
        <div className="relative aspect-square rounded-lg overflow-hidden bg-muted border border-border transition-shadow group-hover/thumb:shadow-md">
          {errored || !mainUrl ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1">
              <ImageIcon className="w-5 h-5 text-muted-foreground/40" />
            </div>
          ) : (
            <ShimmerImage src={mainUrl} alt="" aspectRatio="1/1" className="w-full h-full object-cover" onError={() => setErrored(true)} />
          )}

          {/* Desktop hover */}
          <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/30 transition-colors duration-200 hidden md:flex items-center justify-center">
            <div className="flex items-center gap-1.5 opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-200">
              <Eye className="w-4 h-4 text-white" />
              <span className="text-xs font-medium text-white">View</span>
            </div>
          </div>

          {/* Mobile eye badge */}
          <div className="absolute bottom-1.5 left-1.5 bg-background/70 backdrop-blur rounded-full p-1 md:hidden">
            <Eye className="w-3 h-3 text-foreground/60" />
          </div>

          {/* Count badge for single-image cards */}
          {!hasMultiple && (
            <span className="absolute bottom-1.5 right-1.5 bg-background/80 backdrop-blur text-[10px] font-semibold px-1.5 py-0.5 rounded">
              {urls.length} img
            </span>
          )}
        </div>
      </button>

      {/* Mini-thumbnail strip */}
      {hasMultiple && (
        <div className="flex gap-1 px-0.5">
          {urls.slice(0, MAX_MINI).map((url, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); onSelect(job, i); }}
              className="w-6 h-6 rounded-sm border border-border overflow-hidden hover:ring-1 hover:ring-primary transition-all shrink-0"
            >
              <img src={getOptimizedUrl(url, { quality: 40 })} alt="" className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
          {urls.length > MAX_MINI && (
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(job, MAX_MINI); }}
              className="w-6 h-6 rounded-sm border border-border bg-muted flex items-center justify-center shrink-0 hover:bg-accent transition-colors"
            >
              <span className="text-[9px] font-semibold text-muted-foreground">+{urls.length - MAX_MINI}</span>
            </button>
          )}
        </div>
      )}

      <div className="space-y-0.5 px-0.5">
        <p className="text-xs font-medium truncate">{job.label}</p>
        <p className="text-[10px] text-muted-foreground">
          {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}

/* ── grid ── */

function HistoryGrid({ jobs, isLoading, hasMore, loadMore }: {
  jobs: HistoryJob[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
}) {
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState<LibraryItem[] | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleSelect = useCallback((job: HistoryJob, idx: number) => {
    if (job.libraryItems.length === 0) return;
    setSelectedItems(job.libraryItems);
    setSelectedIndex(idx);
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="aspect-square rounded-lg bg-muted border border-border">
              <div className="w-full h-full bg-gradient-to-r from-muted/40 via-muted/70 to-muted/40 bg-[length:200%_100%] animate-shimmer rounded-lg" />
            </div>
            <div className="space-y-1 px-0.5">
              <div className="h-3 w-20 rounded bg-muted animate-pulse" />
              <div className="h-2.5 w-14 rounded bg-muted/60 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <EmptyStateCard
        heading="No creations yet"
        description="Start creating visuals and your completed jobs will appear here."
        action={{ content: 'Create Visuals', onAction: () => navigate('/app/workflows') }}
        icon={<Clock className="w-8 h-8 text-muted-foreground" />}
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {jobs.map((job) => (
          <HistoryCard key={job.id} job={job} onSelect={handleSelect} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-6">
          <Button variant="outline" onClick={loadMore} className="rounded-full px-8">Load More</Button>
        </div>
      )}

      <LibraryDetailModal
        item={selectedItems?.[selectedIndex] ?? null}
        open={!!selectedItems}
        onClose={() => setSelectedItems(null)}
        items={selectedItems ?? undefined}
        initialIndex={selectedIndex}
      />
    </>
  );
}

/* ── page ── */

export default function History() {
  const [tab, setTab] = useState<'all' | 'generation' | 'freestyle'>('all');
  const { jobs, isLoading, hasMore, loadMore, allCount } = useHistoryJobs(tab);

  return (
    <PageHeader title="History" subtitle="Browse all your completed generation jobs in one place.">
      <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all" className="gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            All
            {!isLoading && allCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">{allCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="generation" className="gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="freestyle" className="gap-1.5">
            <Wand2 className="w-3.5 h-3.5" />
            Freestyle
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-0">
          <HistoryGrid jobs={jobs} isLoading={isLoading} hasMore={hasMore} loadMore={loadMore} />
        </TabsContent>
      </Tabs>
    </PageHeader>
  );
}
