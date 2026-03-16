import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { PageHeader } from '@/components/app/PageHeader';
import { MetricCard } from '@/components/app/MetricCard';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Activity, CheckCircle, XCircle, Ban, Clock, Zap, AlertTriangle, Timer } from 'lucide-react';

type TimeRange = 24 | 168 | 720;

interface StatsData {
  total: number;
  completed: number;
  failed: number;
  cancelled: number;
  stuck: number;
  avg_seconds: number;
  max_seconds: number;
  recent_failures: {
    id: string;
    job_type: string;
    error_message: string | null;
    created_at: string;
    user_plan: string;
  }[];
}

const RANGE_LABELS: Record<TimeRange, string> = {
  24: '24 hours',
  168: '7 days',
  720: '30 days',
};

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AdminStatus() {
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();
  const [range, setRange] = useState<TimeRange>(24);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-status', range],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_generation_stats', {
        p_hours: range,
      });
      if (error) throw error;
      return data as unknown as StatsData;
    },
    enabled: isAdmin,
    refetchInterval: 30_000,
  });

  if (adminLoading) return null;
  if (!isAdmin) return <Navigate to="/app" replace />;

  const successRate = data && data.total > 0
    ? Math.round((data.completed / data.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Status"
        subtitle="Generation pipeline health & metrics"
      >
        {null}
      </PageHeader>

      {/* Time range toggle */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
        {([24, 168, 720] as TimeRange[]).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
              range === r
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {RANGE_LABELS[r]}
          </button>
        ))}
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Jobs"
          value={data?.total ?? '—'}
          icon={Activity}
          loading={isLoading}
        />
        <MetricCard
          title="Completed"
          value={data?.completed ?? '—'}
          icon={CheckCircle}
          loading={isLoading}
        />
        <MetricCard
          title="Failed"
          value={data?.failed ?? '—'}
          icon={XCircle}
          loading={isLoading}
        />
        <MetricCard
          title="Cancelled"
          value={data?.cancelled ?? '—'}
          icon={Ban}
          loading={isLoading}
        />
        <MetricCard
          title="Success Rate"
          value={data ? `${successRate}%` : '—'}
          icon={Zap}
          loading={isLoading}
          progress={data ? successRate : undefined}
          progressColor={successRate >= 90 ? 'bg-primary' : successRate >= 70 ? 'bg-yellow-500' : 'bg-destructive'}
        />
        <MetricCard
          title="Avg Gen Time"
          value={data ? formatDuration(data.avg_seconds) : '—'}
          icon={Timer}
          loading={isLoading}
        />
        <MetricCard
          title="Max Gen Time"
          value={data ? formatDuration(data.max_seconds) : '—'}
          icon={Clock}
          loading={isLoading}
        />
        <MetricCard
          title="Stuck Jobs"
          value={data?.stuck ?? '—'}
          icon={AlertTriangle}
          loading={isLoading}
        />
      </div>

      {/* Recent failures table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Recent Failures</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Last 20 failed jobs in the selected time range
          </p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Type</TableHead>
              <TableHead>Error</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead className="text-right">When</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><div className="h-4 w-20 bg-muted rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 w-40 bg-muted rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 w-12 bg-muted rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 w-16 bg-muted rounded animate-pulse ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : data?.recent_failures?.length ? (
              data.recent_failures.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {f.job_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                    {f.error_message || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {f.user_plan}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                    {formatTimeAgo(f.created_at)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No failures in this time range 🎉
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
