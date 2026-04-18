import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { JobStatus } from '@/types';

/**
 * Canonical status badge — single source of truth for status pills.
 * Covers job, library, video, and trend states. See /app/admin/ui-audit.
 *
 * For neutral chips (BETA, Coming Soon, count), use <Badge> directly.
 * For destructive confirms, use <ConfirmDialog> + StatusBadge status="failed".
 */

export type LibraryStatus = 'draft' | 'brand_ready' | 'publish_ready';
export type VideoStatus = 'queued' | 'rendering' | 'ready' | 'failed';
export type TrendStatus = 'new' | 'analyzed' | 'published' | 'archived';

export type StatusValue = JobStatus | LibraryStatus | VideoStatus | TrendStatus;

interface StatusBadgeProps {
  status: StatusValue;
  /** Optional override label */
  label?: string;
}

type Tone = 'neutral' | 'progress' | 'success' | 'critical';

const toneClass: Record<Tone, string> = {
  neutral:  'bg-slate-100 text-slate-700 hover:bg-slate-100',
  progress: 'bg-amber-50 text-amber-900 hover:bg-amber-50',
  success:  'bg-slate-100 text-slate-800 hover:bg-slate-100',
  critical: '', // uses destructive variant
};

const config: Record<StatusValue, { variant: 'secondary' | 'destructive'; label: string; tone: Tone; pulse?: boolean }> = {
  // Job statuses
  queued:        { variant: 'secondary',   label: 'Queued',        tone: 'neutral'  },
  generating:    { variant: 'secondary',   label: 'Generating',    tone: 'progress', pulse: true },
  completed:     { variant: 'secondary',   label: 'Completed',     tone: 'success'  },
  failed:        { variant: 'destructive', label: 'Failed',        tone: 'critical' },

  // Library statuses
  draft:         { variant: 'secondary',   label: 'Draft',         tone: 'neutral'  },
  brand_ready:   { variant: 'secondary',   label: 'Brand Ready',   tone: 'progress' },
  publish_ready: { variant: 'secondary',   label: 'Ready to Publish', tone: 'success' },

  // Video statuses
  rendering:     { variant: 'secondary',   label: 'Rendering',     tone: 'progress', pulse: true },
  ready:         { variant: 'secondary',   label: 'Ready',         tone: 'success'  },

  // Trend statuses
  new:           { variant: 'secondary',   label: 'New',           tone: 'progress' },
  analyzed:      { variant: 'secondary',   label: 'Analyzed',      tone: 'neutral'  },
  published:     { variant: 'secondary',   label: 'Published',     tone: 'success'  },
  archived:      { variant: 'secondary',   label: 'Archived',      tone: 'neutral'  },
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const c = config[status];
  return (
    <Badge variant={c.variant} className={cn(toneClass[c.tone], c.pulse && 'animate-pulse')}>
      {label ?? c.label}
    </Badge>
  );
}
