import { useState } from 'react';
import { Calendar, Clock, Pause, Play, CheckCircle, AlertCircle, Loader2, MoreVertical, Trash2, Pencil, Copy, RocketIcon, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/brandedToast';
import { cn } from '@/lib/utils';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { formatDistanceToNow, format } from 'date-fns';
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
  scheduled: { icon: Clock, color: 'bg-muted text-muted-foreground' },
  generating: { icon: Loader2, color: 'bg-foreground/10 text-foreground' },
  ready: { icon: CheckCircle, color: 'bg-primary/10 text-primary' },
  failed: { icon: AlertCircle, color: 'bg-destructive/10 text-destructive' },
};

export function DropCard(props: Props) {
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteDropDialogOpen, setDeleteDropDialogOpen] = useState(false);

  const deleteDropMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('creative_drops').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creative-drops'] });
      toast.success('Drop deleted');
    },
    onError: () => toast.error('Failed to delete drop'),
  });

  // Fetch products for schedule cards (lightweight query, cached)
  const productIds = props.type === 'schedule' ? (props.schedule.selected_product_ids || []) : [];
  const { data: scheduleProducts = [] } = useQuery({
    queryKey: ['schedule-products', productIds.join(',')],
    queryFn: async () => {
      if (productIds.length === 0) return [];
      const { data, error } = await supabase
        .from('user_products')
        .select('id, title, image_url')
        .in('id', productIds.slice(0, 6));
      if (error) throw error;
      return data as { id: string; title: string; image_url: string }[];
    },
    enabled: props.type === 'schedule' && productIds.length > 0,
    staleTime: 60_000,
  });

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
      const res = await supabase.functions.invoke('trigger-creative-drop', {
        body: { schedule_id: schedule.id },
      });
      const errorMsg = res.data?.error || res.error?.message;
      if (errorMsg) throw new Error(errorMsg);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creative-drops'] });
      queryClient.invalidateQueries({ queryKey: ['creative-schedules'] });
      toast.success('Drop triggered — generating now!');
    },
    onError: (err: Error) => toast.error(`Failed to trigger drop: ${err.message}`),
  });

  // ── Schedule Card ──
  if (props.type === 'schedule') {
    const { schedule, onDuplicate, onEdit, workflowNames } = props;
    const isOneTime = schedule.frequency === 'one-time';
    const isCompleted = isOneTime && !schedule.active;
    const isPaused = !schedule.active && !isCompleted;
    const productCount = schedule.selected_product_ids?.length || 0;

    const getFrequencyLabel = (freq: string) => {
      switch (freq) {
        case 'one-time': return 'One-time';
        case 'weekly': return 'Weekly';
        case 'biweekly': return 'Every 2 weeks';
        case 'monthly': return 'Monthly';
        default: return freq;
      }
    };

    return (
      <>
        <Card className={cn(
          'rounded-2xl transition-all',
          (isPaused || isCompleted) && 'opacity-60'
        )}>
          <CardContent className="p-5 space-y-4">
            {/* Top row: name + status + actions */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base font-semibold truncate">{schedule.name}</h3>
                  <Badge
                    variant="secondary"
                    className={cn(
                      'text-[10px] rounded-full px-2 py-0.5 flex-shrink-0',
                      isCompleted
                        ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                        : schedule.active
                          ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                          : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {isCompleted ? <><CheckCircle className="w-3 h-3 mr-1 inline" />Completed</> : schedule.active ? 'Active' : 'Paused'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {getFrequencyLabel(schedule.frequency)} · {schedule.images_per_drop} images per drop · ~{schedule.estimated_credits} credits
                </p>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                {!isCompleted && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1.5"
                    onClick={() => toggleMutation.mutate({ id: schedule.id, active: !schedule.active })}
                  >
                    {schedule.active ? (
                      <><Pause className="w-3 h-3" /> <span className="hidden sm:inline">Pause</span></>
                    ) : (
                      <><Play className="w-3 h-3" /> <span className="hidden sm:inline">Resume</span></>
                    )}
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover">
                    <DropdownMenuItem onClick={() => onEdit?.(schedule)}>
                      <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDuplicate?.(schedule)}>
                      <Copy className="w-3.5 h-3.5 mr-2" /> Duplicate
                    </DropdownMenuItem>
                    {!isCompleted && (
                      <DropdownMenuItem onClick={() => runNowMutation.mutate(schedule)}>
                        <RocketIcon className="w-3.5 h-3.5 mr-2" /> Run Now
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Inline metadata row */}
            <div className="flex items-center gap-2.5 flex-wrap mt-1">
              {/* Product thumbnails */}
              {scheduleProducts.length > 0 ? (
                <div className="flex items-center gap-1">
                  {scheduleProducts.slice(0, 3).map(p => (
                    <div key={p.id} className="w-7 h-7 rounded-md overflow-hidden bg-muted flex-shrink-0 ring-1 ring-border/20">
                      <img src={getOptimizedUrl(p.image_url, { quality: 60 })} alt={p.title} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {productCount > 3 && (
                    <span className="text-[11px] text-muted-foreground">+{productCount - 3}</span>
                  )}
                </div>
              ) : productCount > 0 ? (
                <span className="text-xs text-muted-foreground">{productCount} product{productCount !== 1 ? 's' : ''}</span>
              ) : null}

              {(scheduleProducts.length > 0 || productCount > 0) && (workflowNames?.length || 0) > 0 && (
                <span className="text-muted-foreground/40 text-[10px]">·</span>
              )}

              {/* Workflow badges */}
              {workflowNames && workflowNames.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {workflowNames.slice(0, 3).map(name => (
                    <Badge key={name} variant="secondary" className="text-[10px] rounded-full px-2 py-0 font-normal">
                      {name.replace(' Set', '')}
                    </Badge>
                  ))}
                  {workflowNames.length > 3 && (
                    <Badge variant="secondary" className="text-[10px] rounded-full px-2 py-0 font-normal">
                      +{workflowNames.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {((workflowNames?.length || 0) > 0 || productCount > 0) && (
                <span className="text-muted-foreground/40 text-[10px]">·</span>
              )}

              {/* Next run */}
              <span className="text-xs text-muted-foreground">
                {isOneTime ? 'One-time' : schedule.next_run_at
                  ? `${format(new Date(schedule.next_run_at), 'MMM d')} (${formatDistanceToNow(new Date(schedule.next_run_at), { addSuffix: true })})`
                  : isPaused ? 'Paused' : 'Not scheduled'}
              </span>
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
  const rawImages = (drop.images || []) as (string | { url: string })[];
  const dropImages = rawImages.map(img =>
    typeof img === 'string' ? { url: img } : img
  ).filter(img => img.url);

  const completedImages = dropImages.length;
  const targetImages = drop.total_images || 0;
  const SECONDS_PER_IMAGE = 45;
  const progressPct = drop.status === 'generating'
    ? Math.min(95, Math.round((Date.now() - new Date(drop.created_at).getTime()) / (targetImages * SECONDS_PER_IMAGE * 1000) * 100)) || 5
    : targetImages > 0 ? Math.round((completedImages / targetImages) * 100) : 0;

  const isClickable = drop.status === 'ready' || drop.status === 'generating';

  return (
    <>
    <Card
      className={cn(
        'rounded-2xl transition-colors',
        isClickable && 'cursor-pointer hover:border-primary/30',
        drop.status === 'generating' && 'border-primary/40 shadow-[0_0_0_1px_hsl(var(--primary)/0.15)]'
      )}
      onClick={isClickable ? onViewDrop : undefined}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex gap-3">
          {/* Left: Thumbnails or status icon */}
          {drop.status === 'ready' && dropImages.length > 0 ? (
            <div className="flex-shrink-0 grid grid-cols-2 gap-0.5 w-[56px] h-[56px] sm:w-[68px] sm:h-[68px] rounded-xl overflow-hidden">
              {dropImages.slice(0, 4).map((img, i) => (
                <div key={i} className="bg-muted overflow-hidden">
                  <img src={getOptimizedUrl(img.url, { quality: 60 })} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
              {dropImages.length < 4 && Array.from({ length: 4 - Math.min(dropImages.length, 4) }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-muted" />
              ))}
            </div>
          ) : (
            <div className={cn(
              'w-[56px] h-[56px] sm:w-[68px] sm:h-[68px] rounded-xl flex items-center justify-center flex-shrink-0',
              drop.status === 'generating' ? 'bg-primary/5' : 'bg-accent'
            )}>
              <StatusIcon className={cn(
                'w-6 h-6',
                drop.status === 'generating' ? 'text-primary animate-spin' : 'text-muted-foreground',
                drop.status === 'failed' && 'text-destructive'
              )} />
            </div>
          )}

          {/* Center: Metadata */}
          <div className="flex-1 min-w-0 py-0.5">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium truncate">
                {scheduleName || `Drop — ${new Date(drop.run_date).toLocaleDateString()}`}
              </p>
              {drop.status === 'failed' && (
                <span className="text-[11px] text-destructive font-medium">Failed</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(drop.run_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              {drop.status !== 'generating' && drop.total_images > 0 && ` · ${drop.total_images} image${drop.total_images !== 1 ? 's' : ''}`}
              {drop.status !== 'generating' && drop.credits_charged > 0 && ` · ${drop.credits_charged} credits`}
            </p>
            {drop.status === 'generating' && (() => {
              const elapsedMs = Date.now() - new Date(drop.created_at).getTime();
              const estimatedTotalMs = targetImages * SECONDS_PER_IMAGE * 1000;
              const remainingMs = Math.max(0, estimatedTotalMs - elapsedMs);
              const remainingMin = Math.ceil(remainingMs / 60000);
              return (
                <div className="mt-1.5">
                  <Progress value={progressPct} className="h-1" />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Generating… {remainingMin > 0 ? `~${remainingMin} min remaining` : 'Finishing up…'}
                  </p>
                </div>
              );
            })()}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {drop.status === 'ready' && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-8 gap-1 text-muted-foreground hover:text-foreground"
                onClick={e => { e.stopPropagation(); onViewDrop?.(); }}
              >
                View <ArrowRight className="w-3 h-3" />
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={e => e.stopPropagation()}>
                  <MoreVertical className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={e => { e.stopPropagation(); setDeleteDropDialogOpen(true); }}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>

    <AlertDialog open={deleteDropDialogOpen} onOpenChange={setDeleteDropDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete drop</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this drop? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteDropMutation.mutate(drop.id)}
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
