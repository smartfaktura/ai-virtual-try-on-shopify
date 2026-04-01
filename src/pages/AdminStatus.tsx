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
import { Activity, CheckCircle, XCircle, Ban, Clock, Zap, AlertTriangle, Timer, RefreshCw, Image, Users, CreditCard, Layers, Video, Package, Palette, Sparkles, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WorkflowBreakdown {
  name: string;
  total: number;
  completed: number;
}

interface PlatformStats {
  total_users: number;
  active_generators: number;
  total_images: number;
  total_freestyle: number;
  total_videos: number;
  total_products: number;
  total_credits_spent: number;
  total_brand_profiles: number;
  total_drops: number;
  jobs_by_type: Record<string, number>;
  workflows_breakdown: WorkflowBreakdown[];
}
type TimeRange = 'today' | 'yesterday' | 24 | 168 | 720;

function getRangeHours(range: TimeRange): number {
  if (range === 'today') {
    const now = new Date();
    return Math.max(1, now.getHours() + Math.round(now.getMinutes() / 60));
  }
  if (range === 'yesterday') {
    const now = new Date();
    return now.getHours() + 24 + Math.round(now.getMinutes() / 60);
  }
  return range;
}

interface CostBreakdownItem {
  job_type: string;
  jobs: number;
  credits: number;
  est_cost: number;
}

interface StatsData {
  total: number;
  completed: number;
  failed: number;
  cancelled: number;
  stuck: number;
  avg_seconds: number;
  max_seconds: number;
  credits_spent: number;
  total_est_cost: number;
  cost_breakdown: CostBreakdownItem[];
  recent_failures: {
    id: string;
    job_type: string;
    error_message: string | null;
    created_at: string;
    user_plan: string;
  }[];
}

const RANGE_LABELS: Record<TimeRange, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  24: '24 hours',
  168: '7 days',
  720: '30 days',
};

const RANGE_OPTIONS: TimeRange[] = ['today', 'yesterday', 24, 168, 720];

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
  const [range, setRange] = useState<TimeRange>('today');

  const { data, isLoading, isFetching, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['admin-status', range],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_generation_stats', {
        p_hours: getRangeHours(range),
      });
      if (error) throw error;
      return data as unknown as StatsData;
    },
    enabled: isAdmin,
    refetchInterval: 30_000,
  });

  const { data: platformStats, isLoading: platformLoading } = useQuery({
    queryKey: ['admin-platform-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_platform_stats');
      if (error) throw error;
      return data as unknown as PlatformStats;
    },
    enabled: isAdmin,
    staleTime: 5 * 60_000,
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

      {/* All-Time Platform Stats */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">All-Time Platform Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard title="Total Images" value={platformStats?.total_images ?? '—'} icon={Image} loading={platformLoading} />
          <MetricCard title="Total Users" value={platformStats?.total_users ?? '—'} icon={Users} loading={platformLoading} />
          <MetricCard title="Active Generators" value={platformStats?.active_generators ?? '—'} icon={Sparkles} loading={platformLoading} />
          <MetricCard title="Credits Spent" value={platformStats?.total_credits_spent ?? '—'} icon={CreditCard} loading={platformLoading} />
          <MetricCard title="Freestyle Jobs" value={platformStats?.jobs_by_type?.freestyle ?? '—'} icon={Palette} loading={platformLoading} />
          <MetricCard title="Workflow Jobs" value={platformStats?.jobs_by_type?.workflow ?? '—'} icon={Layers} loading={platformLoading} />
          <MetricCard title="Try-On Jobs" value={platformStats?.jobs_by_type?.tryon ?? '—'} icon={Users} loading={platformLoading} />
          <MetricCard title="Upscale Jobs" value={platformStats?.jobs_by_type?.upscale ?? '—'} icon={Zap} loading={platformLoading} />
          <MetricCard title="Products" value={platformStats?.total_products ?? '—'} icon={Package} loading={platformLoading} />
          <MetricCard title="Videos" value={platformStats?.total_videos ?? '—'} icon={Video} loading={platformLoading} />
          <MetricCard title="Brand Profiles" value={platformStats?.total_brand_profiles ?? '—'} icon={Palette} loading={platformLoading} />
          <MetricCard title="Content Calendar" value={platformStats?.total_drops ?? '—'} icon={Sparkles} loading={platformLoading} />
        </div>
      </div>

      {/* Workflow Usage Breakdown */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Workflow Usage</h3>
          <p className="text-xs text-muted-foreground mt-0.5">All-time breakdown by workflow type</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Workflow</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Completed</TableHead>
              <TableHead className="text-right">Success Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {platformLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><div className="h-4 w-32 bg-muted rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 w-12 bg-muted rounded animate-pulse ml-auto" /></TableCell>
                  <TableCell><div className="h-4 w-12 bg-muted rounded animate-pulse ml-auto" /></TableCell>
                  <TableCell><div className="h-4 w-16 bg-muted rounded animate-pulse ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : platformStats?.workflows_breakdown?.length ? (
              platformStats.workflows_breakdown.map((w) => (
                <TableRow key={w.name}>
                  <TableCell className="font-medium text-sm">{w.name}</TableCell>
                  <TableCell className="text-right text-sm tabular-nums">{w.total}</TableCell>
                  <TableCell className="text-right text-sm tabular-nums">{w.completed}</TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {w.total > 0 ? `${Math.round((w.completed / w.total) * 100)}%` : '—'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">No data</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Time range toggle + refresh */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
          {RANGE_OPTIONS.map((r) => (
            <button
              key={String(r)}
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
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {dataUpdatedAt > 0 && (
            <span className="text-xs text-muted-foreground">
              Updated {formatTimeAgo(new Date(dataUpdatedAt).toISOString())}
            </span>
          )}
        </div>
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

      {/* Generation Costs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Credits Used"
          value={data?.credits_spent ?? '—'}
          icon={CreditCard}
          loading={isLoading}
        />
        <MetricCard
          title="Est. API Cost"
          value={data ? `$${data.total_est_cost.toFixed(2)}` : '—'}
          icon={DollarSign}
          loading={isLoading}
        />
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Cost Breakdown</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Estimated API costs by job type in selected timeframe</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Type</TableHead>
              <TableHead className="text-right">Jobs</TableHead>
              <TableHead className="text-right">Credits</TableHead>
              <TableHead className="text-right">Est. Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><div className="h-4 w-20 bg-muted rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 w-12 bg-muted rounded animate-pulse ml-auto" /></TableCell>
                  <TableCell><div className="h-4 w-12 bg-muted rounded animate-pulse ml-auto" /></TableCell>
                  <TableCell><div className="h-4 w-16 bg-muted rounded animate-pulse ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : data?.cost_breakdown?.length ? (
              data.cost_breakdown.map((b) => (
                <TableRow key={b.job_type}>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs capitalize">
                      {b.job_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">{b.jobs}</TableCell>
                  <TableCell className="text-right text-sm tabular-nums">{b.credits}</TableCell>
                  <TableCell className="text-right text-sm tabular-nums font-medium">${b.est_cost.toFixed(2)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">No completed jobs in this range</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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
