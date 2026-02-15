import { useState } from 'react';
import { Calendar, Clock, Pause, Play, Zap, CheckCircle, AlertCircle, Loader2, Download, MoreVertical, Trash2, Pencil, Copy, RocketIcon, ArrowRight, Coins } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
  onEdit?: (schedule: CreativeSchedule) => void;
  scheduleName?: never;
  workflowNames?: string[];
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

  // ── Schedule Card ──
  if (props.type === 'schedule') {
    const { schedule, onDuplicate, onEdit, workflowNames } = props;
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
                  <p className="text-sm font-medium truncate">{schedule.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {schedule.frequency} · {schedule.images_per_drop} images per drop · {schedule.selected_product_ids?.length || 0} product{(schedule.selected_product_ids?.length || 0) !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {workflowNames && workflowNames.length > 0
                      ? workflowNames.slice(0, 2).join(', ') + (workflowNames.length > 2 ? ` +${workflowNames.length - 2} more` : '')
                      : `${schedule.workflow_ids.length} workflow${schedule.workflow_ids.length !== 1 ? 's' : ''}`}
                  </p>
                  {schedule.next_run_at && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      Next: {new Date(schedule.next_run_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Credit cost chip */}
                <span className="hidden sm:flex items-center gap-1 text-xs border rounded-full px-2 py-0.5 text-muted-foreground">
                  <Coins className="w-3 h-3" />
                  ~{schedule.estimated_credits} cr
                </span>

                {/* Active/Paused dot indicator */}
                <span className="flex items-center gap-1.5 text-xs font-medium">
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    schedule.active ? "bg-green-500 animate-pulse" : "bg-muted-foreground/40"
                  )} />
                  {schedule.active ? 'Active' : 'Paused'}
                </span>


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
                    <DropdownMenuItem onClick={() => onEdit?.(schedule)}>
                      <Pencil className="w-3.5 h-3.5 mr-2" />
                      Edit
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

  // ── Drop Card ──
  const { drop, onViewDrop, scheduleName } = props;
  const config = statusConfig[drop.status] || statusConfig.scheduled;
  const StatusIcon = config.icon;
  const dropImages = (drop.images || []) as { url: string }[];

  const completedImages = dropImages.length;
  const targetImages = drop.total_images || 0;
  const progressPct = targetImages > 0 ? Math.round((completedImages / targetImages) * 100) : 0;

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
                {drop.status === 'generating'
                  ? `${completedImages} of ${targetImages} images`
                  : drop.total_images > 0
                    ? `${drop.total_images} images`
                    : `${drop.generation_job_ids.length} job${drop.generation_job_ids.length !== 1 ? 's' : ''}`}
                {drop.credits_charged > 0 && ` · ${drop.credits_charged} credits`}
              </p>
              {drop.status === 'generating' && (() => {
                const SECONDS_PER_IMAGE = 8;
                const elapsedMs = Date.now() - new Date(drop.created_at).getTime();
                const estimatedTotalMs = targetImages * SECONDS_PER_IMAGE * 1000;
                const remainingMs = Math.max(0, estimatedTotalMs - elapsedMs);
                const remainingMin = Math.ceil(remainingMs / 60000);
                return (
                  <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                    Started {formatDistanceToNow(new Date(drop.created_at), { addSuffix: true })}
                    {remainingMin > 0 ? ` · ~${remainingMin} min remaining` : ' · Finishing up…'}
                  </p>
                );
              })()}
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

        {/* Generation progress bar */}
        {drop.status === 'generating' && targetImages > 0 && (
          <div className="mt-3">
            <Progress value={progressPct} className="h-1.5" />
            <p className="text-[11px] text-muted-foreground mt-1">{progressPct}% complete</p>
          </div>
        )}

        {/* Thumbnail previews + View Drop CTA for ready drops */}
        {drop.status === 'ready' && dropImages.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center gap-1.5">
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
              <Button variant="ghost" size="sm" className="ml-auto text-xs text-primary h-7 gap-1" onClick={e => { e.stopPropagation(); onViewDrop?.(); }}>
                View Drop <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
