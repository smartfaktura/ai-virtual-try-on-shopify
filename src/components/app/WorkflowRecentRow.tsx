import { useRef, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ImageIcon, Eye } from 'lucide-react';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { toSignedUrls } from '@/lib/signedUrl';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { formatDistanceToNow } from 'date-fns';
import { LibraryDetailModal } from '@/components/app/LibraryDetailModal';
import type { LibraryItem } from '@/components/app/LibraryImageCard';

interface RecentJob {
  id: string;
  workflow_id: string | null;
  workflow_name: string | null;
  created_at: string;
  results: unknown;
  requested_count: number;
}

interface WorkflowRecentRowProps {
  jobs: RecentJob[];
  isLoading?: boolean;
}

function allImageUrls(results: unknown): string[] {
  if (!Array.isArray(results) || results.length === 0) return [];
  return results.map((r) => {
    if (typeof r === 'string') return r;
    if (r && typeof r === 'object' && 'url' in r) return (r as { url: string }).url;
    return null;
  }).filter(Boolean) as string[];
}

function firstImageUrl(results: unknown): string | null {
  const urls = allImageUrls(results);
  return urls[0] ?? null;
}

const SWIPE_THRESHOLD = 8;

const MAX_MINI_THUMBS = 3;

function ThumbnailCard({ job, signedUrl, allSignedUrls, onSelect }: { job: RecentJob; signedUrl: string | null | undefined; allSignedUrls: string[]; onSelect: (job: RecentJob, startIndex?: number) => void }) {
  const [errored, setErrored] = useState(false);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  const optimizedUrl = signedUrl ? getOptimizedUrl(signedUrl, { quality: 60 }) : null;
  const isLoading = signedUrl === undefined;
  const hasMultiple = allSignedUrls.length > 1;

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleClick = (e: React.MouseEvent) => {
    if (pointerStart.current) {
      const dx = Math.abs(e.clientX - pointerStart.current.x);
      const dy = Math.abs(e.clientY - pointerStart.current.y);
      if (dx > SWIPE_THRESHOLD || dy > SWIPE_THRESHOLD) {
        e.preventDefault();
        return;
      }
    }
    onSelect(job, 0);
  };

  return (
    <div className="group/thumb flex flex-col gap-1.5 shrink-0 w-[130px] sm:w-[140px] text-left touch-pan-x">
      <button
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        className="w-full text-left"
      >
        <div className="relative aspect-square rounded-lg overflow-hidden bg-muted border border-border transition-shadow group-hover/thumb:shadow-md">
          {errored || (!isLoading && !optimizedUrl) ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1">
              <ImageIcon className="w-5 h-5 text-muted-foreground/40" />
              {errored && <span className="text-[9px] text-muted-foreground/50">Failed</span>}
            </div>
          ) : optimizedUrl ? (
            <ShimmerImage
              src={optimizedUrl}
              alt=""
              aspectRatio="1/1"
              className="w-full h-full object-cover"
              onError={() => setErrored(true)}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-muted/40 via-muted/70 to-muted/40 bg-[length:200%_100%] animate-shimmer" />
          )}

          {/* Desktop hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/30 transition-colors duration-200 hidden md:flex items-center justify-center">
            <div className="flex items-center gap-1.5 opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-200">
              <Eye className="w-4 h-4 text-white" />
              <span className="text-xs font-medium text-white">View</span>
            </div>
          </div>

          {/* Mobile permanent eye badge */}
          <div className="absolute bottom-1.5 left-1.5 bg-background/70 backdrop-blur rounded-full p-1 md:hidden">
            <Eye className="w-3 h-3 text-foreground/60" />
          </div>

          {/* Count badge only for single-image jobs */}
          {!hasMultiple && (
            <span className="absolute bottom-1.5 right-1.5 bg-background/80 backdrop-blur text-[10px] font-semibold px-1.5 py-0.5 rounded">
              {(() => { const count = Array.isArray(job.results) ? (job.results as unknown[]).length : job.requested_count; return `${count} ${count === 1 ? 'img' : 'imgs'}`; })()}
            </span>
          )}
        </div>
      </button>

      {/* Mini-thumbnail strip for multi-image jobs */}
      {hasMultiple && (
        <div className="flex gap-1 px-0.5">
          {allSignedUrls.slice(0, MAX_MINI_THUMBS).map((url, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(job, i);
              }}
              className="w-6 h-6 rounded-sm border border-border overflow-hidden hover:ring-1 hover:ring-primary transition-all shrink-0"
            >
              <img
                src={getOptimizedUrl(url, { quality: 40 })}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
          {allSignedUrls.length > MAX_MINI_THUMBS && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(job, MAX_MINI_THUMBS);
              }}
              className="w-6 h-6 rounded-sm border border-border bg-muted flex items-center justify-center shrink-0 hover:bg-accent transition-colors"
            >
              <span className="text-[9px] font-semibold text-muted-foreground">+{allSignedUrls.length - MAX_MINI_THUMBS}</span>
            </button>
          )}
        </div>
      )}

      <div className="space-y-0.5 px-0.5">
        <p className="text-xs font-medium truncate">{job.workflow_name ?? 'Visual Type'}</p>
        <p className="text-[10px] text-muted-foreground">
          {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}

export function WorkflowRecentRow({ jobs, isLoading = false }: WorkflowRecentRowProps) {
  const [selectedItems, setSelectedItems] = useState<LibraryItem[] | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const jobIds = useMemo(() => jobs.map(j => j.id).sort().join(','), [jobs]);

  // Sign ALL result URLs for each job (not just the first)
  const { data: signedAllMap = {}, isFetched: urlsReady } = useQuery({
    queryKey: ['workflow-recent-all-thumbnails', jobIds],
    queryFn: async () => {
      const rawUrls: string[] = [];
      const indexMap: { jobId: string; startIdx: number; count: number }[] = [];

      jobs.forEach((job) => {
        const urls = allImageUrls(job.results);
        if (urls.length > 0) {
          indexMap.push({ jobId: job.id, startIdx: rawUrls.length, count: urls.length });
          rawUrls.push(...urls);
        }
      });

      if (rawUrls.length === 0) return {} as Record<string, string[]>;

      const signed = await toSignedUrls(rawUrls);
      const map: Record<string, string[]> = {};
      indexMap.forEach(({ jobId, startIdx, count }) => {
        map[jobId] = signed.slice(startIdx, startIdx + count);
      });
      return map;
    },
    enabled: jobs.length > 0,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  // Derive first-image map for thumbnails
  const signedUrlMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const [jobId, urls] of Object.entries(signedAllMap)) {
      if (urls.length > 0) m[jobId] = urls[0];
    }
    return m;
  }, [signedAllMap]);



  if (!isLoading && jobs.length === 0) return null;

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none"
      >
        {isLoading && jobs.length === 0
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2 shrink-0 w-[140px]">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                  <div className="w-full h-full bg-gradient-to-r from-muted/40 via-muted/70 to-muted/40 bg-[length:200%_100%] animate-shimmer" />
                </div>
                <div className="space-y-1 px-0.5">
                  <div className="h-3 w-20 rounded bg-muted animate-pulse" />
                  <div className="h-2.5 w-14 rounded bg-muted/60 animate-pulse" />
                </div>
              </div>
            ))
          : jobs.map((job) => (
              <ThumbnailCard
                key={job.id}
                job={job}
                signedUrl={urlsReady ? (signedUrlMap[job.id] ?? null) : undefined}
                allSignedUrls={signedAllMap[job.id] ?? []}
                onSelect={(j, startIndex = 0) => {
                  const signedUrls = signedAllMap[j.id] ?? [];
                  const rawUrls = allImageUrls(j.results);
                  const urls = signedUrls.length > 0 ? signedUrls : rawUrls;
                  if (urls.length === 0) return;
                  const items: LibraryItem[] = urls.map((url, idx) => ({
                    id: `${j.id}-${idx}`,
                    imageUrl: url,
                    source: 'generation' as const,
                    label: j.workflow_name ?? 'Workflow',
                    date: new Date(j.created_at).toLocaleDateString(),
                    createdAt: j.created_at,
                  }));
                  setSelectedItems(items);
                  setSelectedIndex(startIndex);
                }}
              />
            ))}
      </div>


      <LibraryDetailModal
        item={selectedItems?.[selectedIndex] ?? null}
        open={!!selectedItems}
        onClose={() => setSelectedItems(null)}
        items={selectedItems ?? undefined}
        initialIndex={selectedIndex}
      />
    </div>
  );
}
