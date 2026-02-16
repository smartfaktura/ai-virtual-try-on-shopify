import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarClock, ArrowRight, Download, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function UpcomingDropsCard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: nextSchedule, isLoading: scheduleLoading } = useQuery({
    queryKey: ['next-schedule'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('creative_schedules')
        .select('id, name, frequency, next_run_at, active')
        .eq('active', true)
        .order('next_run_at', { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: latestDrop, isLoading: dropLoading } = useQuery({
    queryKey: ['latest-drop'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('creative_drops')
        .select('id, status, total_images, credits_charged, download_url, created_at, run_date')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const isLoading = scheduleLoading || dropLoading;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-5">
          <div className="h-16 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const hasContent = nextSchedule || latestDrop;

  return (
    <Card>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Upcoming Drops</h2>
          <Button variant="link" size="sm" onClick={() => navigate('/app/creative-drops')}>
            View all
          </Button>
        </div>

        {/* Latest drop status */}
        {latestDrop && (
          <div className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 border border-border">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
              {latestDrop.status === 'generating' && (
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              )}
              {(latestDrop.status === 'ready' || latestDrop.status === 'completed') && (
                <CheckCircle2 className="w-5 h-5 text-primary" />
              )}
              {latestDrop.status === 'failed' && (
                <AlertCircle className="w-5 h-5 text-destructive" />
              )}
              {!['generating', 'ready', 'completed', 'failed'].includes(latestDrop.status) && (
                <CalendarClock className="w-5 h-5 text-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              {latestDrop.status === 'generating' && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                    </span>
                    <p className="text-sm font-medium">Generating {latestDrop.total_images} images…</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {latestDrop.credits_charged > 0 && `${latestDrop.credits_charged} credits · `}
                    Started {new Date(latestDrop.created_at).toLocaleDateString()}
                  </p>
                </>
              )}
              {(latestDrop.status === 'ready' || latestDrop.status === 'completed') && (
                <>
                  <p className="text-sm font-medium">
                    {latestDrop.total_images} images ready
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {latestDrop.credits_charged > 0 && `${latestDrop.credits_charged} credits used · `}
                    {new Date(latestDrop.run_date).toLocaleDateString()}
                  </p>
                </>
              )}
              {latestDrop.status === 'failed' && (
                <>
                  <p className="text-sm font-medium text-destructive">Drop failed</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(latestDrop.created_at).toLocaleDateString()} · Credits refunded
                  </p>
                </>
              )}
              {!['generating', 'ready', 'completed', 'failed'].includes(latestDrop.status) && (
                <>
                  <p className="text-sm font-medium truncate">Drop scheduled</p>
                  <p className="text-xs text-muted-foreground">
                    {latestDrop.total_images} images · {new Date(latestDrop.run_date).toLocaleDateString()}
                  </p>
                </>
              )}
            </div>
            {(latestDrop.status === 'ready' || latestDrop.status === 'completed') && latestDrop.download_url && (
              <Button size="sm" variant="outline" className="flex-shrink-0 gap-1" asChild>
                <a href={latestDrop.download_url} download>
                  <Download className="w-3.5 h-3.5" />
                  Download
                </a>
              </Button>
            )}
          </div>
        )}

        {/* Next schedule info */}
        {nextSchedule && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/50">
            <CalendarClock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{nextSchedule.name}</span>
              {' · '}{nextSchedule.frequency} · Next run:{' '}
              {nextSchedule.next_run_at
                ? new Date(nextSchedule.next_run_at).toLocaleDateString()
                : 'Pending'}
            </p>
            <Badge variant="secondary" className="flex-shrink-0 text-[10px]">Active</Badge>
          </div>
        )}

        {/* Empty state */}
        {!hasContent && (
          <div className="flex items-center gap-4 p-3 rounded-lg border border-dashed border-border">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <CalendarClock className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">No scheduled drops yet</p>
              <p className="text-xs text-muted-foreground">
                Automate fresh visuals every month.
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => navigate('/app/creative-drops')}>
              Set Up
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
