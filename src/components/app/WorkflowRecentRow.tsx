import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { toSignedUrls } from '@/lib/signedUrl';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { formatDistanceToNow } from 'date-fns';

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
}

function firstImageUrl(results: unknown): string | null {
  if (!Array.isArray(results) || results.length === 0) return null;
  const first = results[0];
  if (typeof first === 'string') return first;
  if (first && typeof first === 'object' && 'url' in first) return (first as { url: string }).url;
  return null;
}

function ThumbnailCard({ job, signedUrl }: { job: RecentJob; signedUrl: string | null | undefined }) {
  const navigate = useNavigate();
  const [errored, setErrored] = useState(false);

  const optimizedUrl = signedUrl ? getOptimizedUrl(signedUrl, { quality: 60 }) : null;
  // undefined = still loading, null = no image
  const isLoading = signedUrl === undefined;

  return (
    <button
      onClick={() => navigate('/app/library')}
      className="group/thumb flex flex-col gap-2 shrink-0 w-[140px] text-left"
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
          /* Still fetching signed URL — show shimmer */
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

export function WorkflowRecentRow({ jobs }: WorkflowRecentRowProps) {
  const navigate = useNavigate();
  const [signedUrlMap, setSignedUrlMap] = useState<Record<string, string>>({});
  const [urlsReady, setUrlsReady] = useState(false);

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

  if (jobs.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="section-label">Recent Creations</p>
        <Button variant="ghost" size="sm" className="text-xs gap-1 h-7" onClick={() => navigate('/app/library')}>
          View All
          <ArrowRight className="w-3 h-3" />
        </Button>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
        {jobs.map((job) => (
          <ThumbnailCard
            key={job.id}
            job={job}
            signedUrl={urlsReady ? (signedUrlMap[job.id] ?? null) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
