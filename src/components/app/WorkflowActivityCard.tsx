import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowRight, AlertCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
interface ActiveJob {
  id: string;
  status: string;
  created_at: string;
  started_at: string | null;
  workflow_name: string | null;
  workflow_id: string | null;
  error_message: string | null;
}



interface FailedJob {
  id: string;
  workflow_id: string | null;
  workflow_name: string | null;
  created_at: string;
  error_message: string | null;
}

interface WorkflowActivityCardProps {
  jobs: ActiveJob[];
  failedJobs?: FailedJob[];
}

function elapsedLabel(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ${seconds % 60}s`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export function WorkflowActivityCard({ jobs, failedJobs = [] }: WorkflowActivityCardProps) {
  const navigate = useNavigate();
  const [, tick] = useState(0);

  useEffect(() => {
    if (jobs.length === 0) return;
    const id = setInterval(() => tick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [jobs.length]);

  const hasContent = jobs.length > 0 || failedJobs.length > 0;
  if (!hasContent) return null;

  return (
    <div className="space-y-3">
      <p className="section-label">Activity</p>

      {/* Active / processing jobs */}
      {jobs.map((job) => {
        const isProcessing = job.status === 'processing';
        const elapsed = elapsedLabel(job.started_at || job.created_at);

        return (
          <Card key={job.id} className="border-primary/20 bg-primary/[0.03]">
            <CardContent className="flex items-center gap-4 py-4 px-5">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 shrink-0">
                {isProcessing ? (
                  <Loader2 className="w-4.5 h-4.5 text-primary animate-spin" />
                ) : (
                  <AlertCircle className="w-4.5 h-4.5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {job.workflow_name ?? 'Workflow generation'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isProcessing ? <>Generating… {elapsed}</> : <>Queued · waiting {elapsed}</>}
                </p>
              </div>
              <Badge variant="secondary" className="shrink-0 text-[10px] uppercase tracking-wider font-semibold">
                {isProcessing ? 'Processing' : 'Queued'}
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                className="shrink-0 gap-1.5"
                onClick={() => navigate(`/app/generate${job.workflow_id ? `?workflow=${job.workflow_id}` : ''}`)}
              >
                View
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </CardContent>
          </Card>
        );
      })}



      {/* Failed jobs (red) */}
      {failedJobs.map((job) => (
        <Card key={job.id} className="border-destructive/20 bg-destructive/[0.04]">
          <CardContent className="flex items-center gap-4 py-4 px-5">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-destructive/10 shrink-0">
              <XCircle className="w-4.5 h-4.5 text-destructive" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {job.workflow_name ?? 'Workflow generation'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                Failed {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                {job.error_message ? ` · ${job.error_message.slice(0, 60)}` : ''}
              </p>
            </div>
            <Badge variant="destructive" className="shrink-0 text-[10px] uppercase tracking-wider font-semibold">
              Failed
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              className="shrink-0 gap-1.5"
              onClick={() => navigate(`/app/generate${job.workflow_id ? `?workflow=${job.workflow_id}` : ''}`)}
            >
              Retry
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
