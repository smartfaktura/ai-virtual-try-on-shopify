import { Calendar, Clock, Pause, Play, Zap, CheckCircle, AlertCircle, Loader2, Download, CreditCard, Sun, Snowflake, Leaf, Flower2, Gift, ShoppingBag, Heart, GraduationCap, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { CreativeSchedule, CreativeDrop } from '@/pages/CreativeDrops';

interface ScheduleCardProps {
  type: 'schedule';
  schedule: CreativeSchedule;
  drop?: never;
  onViewDrop?: never;
}

interface DropCardProps {
  type: 'drop';
  drop: CreativeDrop;
  schedule?: never;
  onViewDrop?: () => void;
}

type Props = ScheduleCardProps | DropCardProps;

const statusConfig: Record<string, { icon: React.ElementType; color: string }> = {
  scheduled: { icon: Clock, color: 'bg-blue-100 text-blue-800' },
  generating: { icon: Loader2, color: 'bg-amber-100 text-amber-800' },
  ready: { icon: CheckCircle, color: 'bg-green-100 text-green-800' },
  failed: { icon: AlertCircle, color: 'bg-red-100 text-red-800' },
};

const themeIcons: Record<string, React.ElementType> = {
  spring: Flower2, summer: Sun, autumn: Leaf, winter: Snowflake,
  holiday: Gift, black_friday: ShoppingBag, valentines: Heart,
  back_to_school: GraduationCap, custom: Sparkles,
};

const themeColors: Record<string, string> = {
  spring: 'bg-green-50 text-green-700 border-green-200',
  summer: 'bg-amber-50 text-amber-700 border-amber-200',
  autumn: 'bg-orange-50 text-orange-700 border-orange-200',
  winter: 'bg-blue-50 text-blue-700 border-blue-200',
  holiday: 'bg-red-50 text-red-700 border-red-200',
  black_friday: 'bg-muted text-foreground border-border',
  valentines: 'bg-pink-50 text-pink-700 border-pink-200',
  back_to_school: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  custom: 'bg-primary/5 text-primary border-primary/20',
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
    const ThemeIcon = themeIcons[schedule.theme] || Sparkles;
    const themeColor = themeColors[schedule.theme] || themeColors.custom;

    return (
      <Card>
        <CardContent className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">{schedule.name}</p>
                <Badge variant="outline" className={cn('text-[10px] border', themeColor)}>
                  <ThemeIcon className="w-3 h-3 mr-0.5" />
                  {schedule.theme?.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {schedule.frequency} · {schedule.workflow_ids.length} workflow{schedule.workflow_ids.length !== 1 ? 's' : ''} ·{' '}
                {schedule.images_per_drop} imgs · ~{schedule.estimated_credits} cr/drop
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

  const { drop, onViewDrop } = props;
  const config = statusConfig[drop.status] || statusConfig.scheduled;
  const StatusIcon = config.icon;
  const dropImages = (drop.images || []) as { url: string }[];

  return (
    <Card className={cn(drop.status === 'ready' && 'cursor-pointer hover:border-primary/30 transition-colors')} onClick={drop.status === 'ready' ? onViewDrop : undefined}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium">
                Drop — {new Date(drop.run_date).toLocaleDateString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {drop.total_images > 0 ? `${drop.total_images} images` : `${drop.generation_job_ids.length} job${drop.generation_job_ids.length !== 1 ? 's' : ''}`}
                {drop.credits_charged > 0 && ` · ${drop.credits_charged} credits`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge className={config.color} variant="secondary">
              <StatusIcon className={`w-3 h-3 mr-1 ${drop.status === 'generating' ? 'animate-spin' : ''}`} />
              {drop.status}
            </Badge>
            {drop.status === 'ready' && dropImages.length > 0 && (
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={e => { e.stopPropagation(); onViewDrop?.(); }}>
                <Download className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Thumbnail previews for ready drops */}
        {drop.status === 'ready' && dropImages.length > 0 && (
          <div className="flex gap-1.5 mt-3 overflow-hidden">
            {dropImages.slice(0, 4).map((img, i) => (
              <div key={i} className="w-14 h-14 rounded-md overflow-hidden bg-muted flex-shrink-0">
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
            {dropImages.length > 4 && (
              <div className="w-14 h-14 rounded-md bg-muted flex items-center justify-center flex-shrink-0 text-xs font-medium text-muted-foreground">
                +{dropImages.length - 4}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
