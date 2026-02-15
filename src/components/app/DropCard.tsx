import { useState } from 'react';
import { Calendar, Clock, Pause, Play, Zap, CheckCircle, AlertCircle, Loader2, Download, MoreVertical, Trash2, Pencil, Copy, RocketIcon, ArrowRight, Coins, Image, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
    const isOneTime = schedule.frequency === 'one-time';
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
          isPaused && 'opacity-50'
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
                      schedule.active
                        ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {schedule.active ? 'Active' : 'Paused'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {getFrequencyLabel(schedule.frequency)} · {schedule.images_per_drop} images per drop · ~{schedule.estimated_credits} credits
                </p>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg text-xs gap-1.5"
                  onClick={() => toggleMutation.mutate({ id: schedule.id, active: !schedule.active })}
                >
                  {schedule.active ? (
                    <><Pause className="w-3 h-3" /> <span className="hidden sm:inline">Pause</span></>
                  ) : (
                    <><Play className="w-3 h-3" /> <span className="hidden sm:inline">Resume</span></>
                  )}
                </Button>
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
                    <DropdownMenuItem onClick={() => runNowMutation.mutate(schedule)}>
                      <RocketIcon className="w-3.5 h-3.5 mr-2" /> Run Now
                    </DropdownMenuItem>
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

            {/* Info grid: Products, Workflows, Next Generation */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Products */}
              <div className="rounded-xl bg-muted/40 p-3 space-y-2">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium flex items-center gap-1.5">
                  <Package className="w-3 h-3" /> Products
                </p>
                {scheduleProducts.length > 0 ? (
                  <div className="flex items-center gap-1.5">
                    {scheduleProducts.slice(0, 4).map(p => (
                      <div key={p.id} className="w-8 h-8 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border/50">
                        <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {productCount > 4 && (
                      <span className="text-[11px] text-muted-foreground ml-0.5">+{productCount - 4}</span>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">{productCount} product{productCount !== 1 ? 's' : ''}</p>
                )}
              </div>

              {/* Workflows */}
              <div className="rounded-xl bg-muted/40 p-3 space-y-2">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium flex items-center gap-1.5">
                  <Zap className="w-3 h-3" /> Workflows
                </p>
                <div className="flex flex-wrap gap-1">
                  {workflowNames && workflowNames.length > 0 ? (
                    workflowNames.slice(0, 3).map(name => (
                      <Badge key={name} variant="secondary" className="text-[10px] rounded-full px-2 py-0">
                        {name.replace(' Set', '')}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">{schedule.workflow_ids.length} workflow{schedule.workflow_ids.length !== 1 ? 's' : ''}</p>
                  )}
                  {workflowNames && workflowNames.length > 3 && (
                    <Badge variant="secondary" className="text-[10px] rounded-full px-2 py-0">
                      +{workflowNames.length - 3}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Next Generation */}
              <div className="rounded-xl bg-muted/40 p-3 space-y-2">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium flex items-center gap-1.5">
                  <Clock className="w-3 h-3" /> {isOneTime ? 'Generation' : 'Next Drop'}
                </p>
                {isOneTime ? (
                  <p className="text-xs font-medium text-foreground">One-time run</p>
                ) : schedule.next_run_at ? (
                  <div>
                    <p className="text-xs font-medium text-foreground">
                      {new Date(schedule.next_run_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(schedule.next_run_at), { addSuffix: true })}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">{isPaused ? 'Paused' : 'Not scheduled'}</p>
                )}
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
    <Card className={cn('rounded-2xl', drop.status === 'ready' && 'cursor-pointer hover:border-primary/30 transition-colors')} onClick={drop.status === 'ready' ? onViewDrop : undefined}>
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
