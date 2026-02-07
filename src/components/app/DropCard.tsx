import { Calendar, Clock, Pause, Play, Zap, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { CreativeSchedule, CreativeDrop } from '@/pages/CreativeDrops';

interface ScheduleCardProps {
  type: 'schedule';
  schedule: CreativeSchedule;
  drop?: never;
}

interface DropCardProps {
  type: 'drop';
  drop: CreativeDrop;
  schedule?: never;
}

type Props = ScheduleCardProps | DropCardProps;

const statusConfig: Record<string, { icon: React.ElementType; color: string }> = {
  scheduled: { icon: Clock, color: 'bg-blue-100 text-blue-800' },
  generating: { icon: Loader2, color: 'bg-amber-100 text-amber-800' },
  ready: { icon: CheckCircle, color: 'bg-green-100 text-green-800' },
  failed: { icon: AlertCircle, color: 'bg-red-100 text-red-800' },
};

export function DropCard(props: Props) {
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from('creative_schedules')
        .update({ active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creative-schedules'] });
      toast.success('Schedule updated');
    },
  });

  if (props.type === 'schedule') {
    const { schedule } = props;
    return (
      <Card>
        <CardContent className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{schedule.name}</p>
              <p className="text-xs text-muted-foreground">
                {schedule.frequency} · {schedule.workflow_ids.length} workflow{schedule.workflow_ids.length !== 1 ? 's' : ''} ·{' '}
                {schedule.products_scope === 'all' ? 'All products' : `${schedule.selected_product_ids.length} products`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant={schedule.active ? 'default' : 'secondary'}>
              {schedule.active ? 'Active' : 'Paused'}
            </Badge>
            {schedule.next_run_at && (
              <span className="text-xs text-muted-foreground hidden sm:block">
                Next: {new Date(schedule.next_run_at).toLocaleDateString()}
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => toggleMutation.mutate({ id: schedule.id, active: !schedule.active })}
            >
              {schedule.active ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { drop } = props;
  const config = statusConfig[drop.status] || statusConfig.scheduled;
  const StatusIcon = config.icon;

  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium">
              Drop — {new Date(drop.run_date).toLocaleDateString()}
            </p>
            <p className="text-xs text-muted-foreground">
              {drop.generation_job_ids.length} job{drop.generation_job_ids.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Badge className={config.color} variant="secondary">
          <StatusIcon className={`w-3 h-3 mr-1 ${drop.status === 'generating' ? 'animate-spin' : ''}`} />
          {drop.status}
        </Badge>
      </CardContent>
    </Card>
  );
}
