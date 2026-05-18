import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toSignedUrl } from '@/lib/signedUrl';
import { toast } from '@/lib/brandedToast';
import { Loader2, ExternalLink } from 'lucide-react';

interface Props {
  jobIds: string[];
  onResolved: (jobId: string) => void;
  onOpenHub: () => void;
}

/**
 * Watches background talking-video jobs that the user started before pressing
 * "Generate another". Polls silently and toasts on completion/failure.
 */
export function BackgroundJobPill({ jobIds, onResolved, onOpenHub }: Props) {
  const [count, setCount] = useState(jobIds.length);

  useEffect(() => setCount(jobIds.length), [jobIds.length]);

  useEffect(() => {
    if (jobIds.length === 0) return;
    let cancelled = false;

    const poll = async () => {
      for (const jobId of jobIds) {
        try {
          const { data: queueRow } = await supabase
            .from('generation_queue')
            .select('status, error_message')
            .eq('id', jobId)
            .maybeSingle();
          if (cancelled || !queueRow) continue;

          if (queueRow.status === 'failed' || queueRow.status === 'cancelled') {
            toast.error(queueRow.error_message || 'Background talking video failed — credits refunded');
            onResolved(jobId);
            continue;
          }

          const { data: videoRow } = await supabase
            .from('generated_videos')
            .select('status, video_url, error_message')
            .eq('workflow_type', 'talking_video')
            .filter('metadata->>queue_job_id', 'eq', jobId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          if (cancelled || !videoRow) continue;

          if (videoRow.status === 'complete' && videoRow.video_url) {
            const signed = await toSignedUrl(videoRow.video_url);
            toast.success('A background talking video is ready in Video Hub', {
              action: { label: 'Open', onClick: onOpenHub },
            });
            void signed;
            onResolved(jobId);
          } else if (videoRow.status === 'failed') {
            toast.error(videoRow.error_message || 'Background talking video failed');
            onResolved(jobId);
          }
        } catch {
          /* swallow */
        }
      }
    };

    poll();
    const t = setInterval(poll, 8000);
    return () => { cancelled = true; clearInterval(t); };
  }, [jobIds, onResolved, onOpenHub]);

  if (count === 0) return null;

  return (
    <button
      type="button"
      onClick={onOpenHub}
      className="w-full flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground hover:border-primary/40 transition"
    >
      <span className="flex items-center gap-2">
        <Loader2 className="w-3 h-3 animate-spin" />
        {count} talking {count === 1 ? 'video' : 'videos'} generating in background
      </span>
      <span className="flex items-center gap-1 text-foreground">
        Open Video Hub <ExternalLink className="w-3 h-3" />
      </span>
    </button>
  );
}
