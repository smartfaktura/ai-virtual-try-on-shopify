import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarClock, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function UpcomingDropsCard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: nextSchedule, isLoading } = useQuery({
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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-5">
          <div className="h-16 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Upcoming Drops</h2>
          <Button variant="link" size="sm" onClick={() => navigate('/app/creative-drops')}>
            View all
          </Button>
        </div>

        {nextSchedule ? (
          <div className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 border border-border">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
              <CalendarClock className="w-5 h-5 text-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{nextSchedule.name}</p>
              <p className="text-xs text-muted-foreground">
                {nextSchedule.frequency} · Next run:{' '}
                {nextSchedule.next_run_at
                  ? new Date(nextSchedule.next_run_at).toLocaleDateString()
                  : 'Pending'}
              </p>
            </div>
            <Badge variant="secondary" className="flex-shrink-0">Active</Badge>
          </div>
        ) : (
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
