import { useState } from 'react';
import { Calendar, Clock, Pause, Play, Zap, CheckCircle, AlertCircle, Loader2, Download, MoreVertical, Trash2, Pencil, Sun, Snowflake, Leaf, Flower2, Gift, ShoppingBag, Heart, GraduationCap, Sparkles, Copy, RocketIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import type { CreativeSchedule, CreativeDrop } from '@/pages/CreativeDrops';

interface ScheduleCardProps {
  type: 'schedule';
  schedule: CreativeSchedule;
  drop?: never;
  onViewDrop?: never;
  onDuplicate?: (schedule: CreativeSchedule) => void;
  scheduleName?: never;
}

interface DropCardProps {
  type: 'drop';
  drop: CreativeDrop;
  schedule?: never;
  onViewDrop?: () => void;
  onDuplicate?: never;
  scheduleName?: string;
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

const BRAND_THEME_STYLE = 'bg-primary/5 text-foreground border-primary/20';

export function DropCard(props: Props) {
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('creative_schedules').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creative-schedules'] });
      toast.success('Schedule deleted');
    },
    onError: () => toast.error('Failed to delete schedule'),
  });

  const runNowMutation = useMutation({
    mutationFn: async (schedule: CreativeSchedule) => {
      const { error } = await supabase.from('creative_drops').insert({
        user_id: schedule.user_id,
        schedule_id: schedule.id,
        run_date: new Date().toISOString(),
        status: 'scheduled',
        generation_job_ids: [],
        images: [],
        summary: {},
        credits_charged: schedule.estimated_credits,
        total_images: 0,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creative-drops'] });
      toast.success('Drop queued — will generate shortly');
    },
    onError: () => toast.error('Failed to queue drop'),
  });

  if (props.type === 'schedule') {
    const { schedule, onDuplicate } = props;
    const ThemeIcon = themeIcons[schedule.theme] || Sparkles;
    const isPaused = !schedule.active;

    return (
      <>
        <Card className={cn(isPaused && 'opacity-60 border-muted')}>
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{schedule.name}</p>
                    <Badge variant="outline" className={cn('text-[10px] border', BRAND_THEME_STYLE)}>
                      <ThemeIcon className="w-3 h-3 mr-0.5" />
                      {schedule.theme?.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {schedule.frequency} · {schedule.workflow_ids.length} workflow{schedule.workflow_ids.length !== 1 ? 's' : ''} ·{' '}
                    {schedule.images_per_drop} imgs · ~{schedule.estimated_credits} cr/drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {schedule.selected_product_ids?.length || 0} product{(schedule.selected_product_ids?.length || 0) !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant={schedule.active ? 'default' : 'secondary'}>
                  {schedule.active ? 'Active' : 'Paused'}
                </Badge>
                {schedule.next_run_at && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-xs text-muted-foreground hidden sm:block cursor-default">
                          {formatDistanceToNow(new Date(schedule.next_run_at), { addSuffix: true })}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {new Date(schedule.next_run_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => toggleMutation.mutate({ id: schedule.id, active: !schedule.active })}
                >
                  {schedule.active ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onDuplicate?.(schedule)}>
                      <Copy className="w-3.5 h-3.5 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => runNowMutation.mutate(schedule)}>
                      <RocketIcon className="w-3.5 h-3.5 mr-2" />
                      Run Now
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                      <Pencil className="w-3.5 h-3.5 mr-2" />
                      Edit (coming soon)
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete schedule</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{schedule.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteMutation.mutate(schedule.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  const { drop, onViewDrop, scheduleName } = props;
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
              {scheduleName && (
                <p className="text-[11px] text-muted-foreground/70 mt-0.5">From: {scheduleName}</p>
              )}
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
