import { useEffect, useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { toSignedUrls } from '@/lib/signedUrl';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { formatDistanceToNow } from 'date-fns';
import { WorkflowPreviewModal } from '@/components/app/WorkflowPreviewModal';

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

function firstImageUrl(results: unknown): string | null {
  if (!Array.isArray(results) || results.length === 0) return null;
  const first = results[0];
  if (typeof first === 'string') return first;
  if (first && typeof first === 'object' && 'url' in first) return (first as { url: string }).url;
  return null;
}

function ThumbnailCard({ job, signedUrl, onSelect }: { job: RecentJob; signedUrl: string | null | undefined; onSelect: (job: RecentJob) => void }) {
  const [errored, setErrored] = useState(false);

  const optimizedUrl = signedUrl ? getOptimizedUrl(signedUrl, { quality: 60 }) : null;
  const isLoading = signedUrl === undefined;

  return (
    <button
      onClick={() => onSelect(job)}
      className="group/thumb flex flex-col gap-2 shrink-0 w-[130px] sm:w-[140px] snap-start text-left"
    >
      <div className="relative aspect-square rounded-lg overflow-hidden bg-muted border border-border transition-shadow group-hover/thumb:shadow-md snap-start">
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
        <span className="absolute bottom-1.5 right-1.5 bg-background/80 backdrop-blur text-[10px] font-semibold px-1.5 py-0.5 rounded">
          {job.requested_count} imgs
        </span>
      </div>
      <div className="space-y-0.5 px-0.5">
        <p className="text-xs font-medium truncate">{job.workflow_name ?? 'Workflow'}</p>
        <p className="text-[10px] text-muted-foreground">
          {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
        </p>
      </div>
    </button>
  );
}

export function WorkflowRecentRow({ jobs, isLoading = false }: WorkflowRecentRowProps) {
  const [signedUrlMap, setSignedUrlMap] = useState<Record<string, string>>({});
  const [urlsReady, setUrlsReady] = useState(false);
  const [selectedJob, setSelectedJob] = useState<RecentJob | null>(null);

  useEffect(() => {
    if (jobs.length === 0) { setUrlsReady(true); return; }

    const rawUrls: string[] = [];
    const indexMap: { jobId: string; idx: number }[] = [];

    jobs.forEach((job) => {
      const url = firstImageUrl(job.results);
      if (url) {
        indexMap.push({ jobId: job.id, idx: rawUrls.length });
        rawUrls.push(url);
      }
    });

    if (rawUrls.length === 0) { setUrlsReady(true); return; }

    toSignedUrls(rawUrls).then((signed) => {
      const map: Record<string, string> = {};
      indexMap.forEach(({ jobId, idx }) => { map[jobId] = signed[idx]; });
      setSignedUrlMap(map);
      setUrlsReady(true);
    });
  }, [jobs]);

  if (!isLoading && jobs.length === 0) return null;

  return (
    <div className="relative">
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory scrollbar-none">
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
                onSelect={setSelectedJob}
              />
            ))}
      </div>
      {/* Edge fade gradients */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-background to-transparent" />

      <WorkflowPreviewModal
        open={selectedJob !== null}
        onOpenChange={(open) => { if (!open) setSelectedJob(null); }}
        job={selectedJob}
      />
    </div>
  );
}
