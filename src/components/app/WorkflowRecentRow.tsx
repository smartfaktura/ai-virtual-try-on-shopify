import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toSignedUrl } from '@/lib/signedUrl';
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

function ThumbnailCard({ job }: { job: RecentJob }) {
  const navigate = useNavigate();
  const rawUrl = firstImageUrl(job.results);
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!rawUrl) return;
    let cancelled = false;
    toSignedUrl(rawUrl).then((url) => {
      if (!cancelled) setImgSrc(url);
    });
    return () => { cancelled = true; };
  }, [rawUrl]);

  return (
    <button
      onClick={() => navigate('/app/library')}
      className="group/thumb flex flex-col gap-2 shrink-0 w-[140px] text-left"
    >
      <div className="relative aspect-square rounded-lg overflow-hidden bg-muted border border-border transition-shadow group-hover/thumb:shadow-md">
        {imgSrc ? (
          <img src={imgSrc} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-muted-foreground/40" />
          </div>
        )}
        {/* Count badge */}
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

  if (jobs.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="section-label">Recent Creations</p>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs gap-1 h-7"
          onClick={() => navigate('/app/library')}
        >
          View All
          <ArrowRight className="w-3 h-3" />
        </Button>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
        {jobs.map((job) => (
          <ThumbnailCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}
