import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, Zap, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PageHeader } from '@/components/app/PageHeader';
import { EmptyStateCard } from '@/components/app/EmptyStateCard';
import { CreativeDropWizard, type CreativeDropWizardInitialData } from '@/components/app/CreativeDropWizard';
import { DropCard } from '@/components/app/DropCard';
import { DropDetailModal } from '@/components/app/DropDetailModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export interface CreativeSchedule {
  id: string;
  user_id: string;
  brand_profile_id: string | null;
  name: string;
  frequency: string;
  products_scope: string;
  selected_product_ids: string[];
  workflow_ids: string[];
  active: boolean;
  next_run_at: string | null;
  created_at: string;
  updated_at: string;
  theme: string;
  theme_notes: string;
  images_per_drop: number;
  model_ids: string[];
  estimated_credits: number;
  include_freestyle?: boolean;
  freestyle_prompts?: string[];
  scene_config?: Record<string, { aspect_ratio: string }>;
}

export interface CreativeDrop {
  id: string;
  schedule_id: string | null;
  user_id: string;
  run_date: string;
  status: string;
  generation_job_ids: string[];
  summary: Record<string, unknown>;
  created_at: string;
  credits_charged: number;
  total_images: number;
  images: unknown[];
  schedule_name?: string;
}

const DROP_STATUSES = ['all', 'scheduled', 'generating', 'ready', 'failed'] as const;

export default function CreativeDrops() {
  const { user } = useAuth();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardInitialData, setWizardInitialData] = useState<CreativeDropWizardInitialData | undefined>(undefined);
  const [editingScheduleId, setEditingScheduleId] = useState<string | undefined>(undefined);
  const [selectedDrop, setSelectedDrop] = useState<CreativeDrop | null>(null);
  const [activeTab, setActiveTab] = useState('schedules');
  const [dropStatusFilter, setDropStatusFilter] = useState<string>('all');
  const [dropSortAsc, setDropSortAsc] = useState(false);

  const { data: schedules = [], isLoading: schedulesLoading } = useQuery({
    queryKey: ['creative-schedules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('creative_schedules')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as CreativeSchedule[];
    },
    enabled: !!user,
  });

  const { data: drops = [], isLoading: dropsLoading } = useQuery({
    queryKey: ['creative-drops'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('creative_drops')
        .select('*, creative_schedules(name)')
        .order('run_date', { ascending: false });
      if (error) throw error;
      return (data || []).map((d: any) => ({
        ...d,
        schedule_name: d.creative_schedules?.name || null,
      })) as CreativeDrop[];
    },
    enabled: !!user,
  });

  const { data: workflows = [] } = useQuery({
    queryKey: ['workflows'],
    queryFn: async () => {
      const { data, error } = await supabase.from('workflows').select('id, name').order('sort_order');
      if (error) throw error;
      return data as { id: string; name: string }[];
    },
  });

  const workflowNameMap = new Map(workflows.map(w => [w.id, w.name]));

  // Stats
  const activeCount = schedules.filter(s => s.active).length;
  const totalDrops = drops.length;
  const totalImages = drops.reduce((sum, d) => sum + d.total_images, 0);
  const totalCredits = drops.reduce((sum, d) => sum + d.credits_charged, 0);
  const generatingCount = drops.filter(d => d.status === 'generating').length;
  const nextRun = schedules
    .filter(s => s.active && s.next_run_at)
    .sort((a, b) => new Date(a.next_run_at!).getTime() - new Date(b.next_run_at!).getTime())[0];

  const hasStats = schedules.length > 0 || drops.length > 0;
  const filteredDrops = drops
    .filter(d => dropStatusFilter === 'all' || d.status === dropStatusFilter)
    .sort((a, b) => {
      const dateA = new Date(a.run_date).getTime();
      const dateB = new Date(b.run_date).getTime();
      return dropSortAsc ? dateA - dateB : dateB - dateA;
    });

  // Schedule name lookup for drops
  const scheduleNameMap = new Map(schedules.map(s => [s.id, s.name]));

  const extractWfFormats = (schedule: CreativeSchedule) => {
    const sceneConfig = (schedule.scene_config || {}) as Record<string, { aspect_ratio: string }>;
    const wfFormats: Record<string, string> = {};
    for (const [k, v] of Object.entries(sceneConfig)) {
      wfFormats[k] = v.aspect_ratio || '1:1';
    }
    return wfFormats;
  };

  const handleDuplicate = (schedule: CreativeSchedule) => {
    setEditingScheduleId(undefined);
    setWizardInitialData({
      name: `${schedule.name} (Copy)`,
      theme: schedule.theme,
      themeNotes: schedule.theme_notes,
      brandProfileId: schedule.brand_profile_id || '',
      selectedProductIds: schedule.selected_product_ids || [],
      selectedWorkflowIds: schedule.workflow_ids || [],
      selectedModelIds: schedule.model_ids || [],
      workflowFormats: extractWfFormats(schedule),
      deliveryMode: schedule.frequency === 'one-time' ? 'now' : 'scheduled',
      frequency: schedule.frequency === 'one-time' ? 'monthly' : schedule.frequency,
      imagesPerDrop: schedule.images_per_drop,
      includeFreestyle: schedule.include_freestyle || false,
      freestylePrompts: schedule.freestyle_prompts || [],
    });
    setWizardOpen(true);
  };

  const handleEdit = (schedule: CreativeSchedule) => {
    setEditingScheduleId(schedule.id);
    setWizardInitialData({
      name: schedule.name,
      theme: schedule.theme,
      themeNotes: schedule.theme_notes,
      brandProfileId: schedule.brand_profile_id || '',
      selectedProductIds: schedule.selected_product_ids || [],
      selectedWorkflowIds: schedule.workflow_ids || [],
      selectedModelIds: schedule.model_ids || [],
      workflowFormats: extractWfFormats(schedule),
      deliveryMode: schedule.frequency === 'one-time' ? 'now' : 'scheduled',
      frequency: schedule.frequency === 'one-time' ? 'monthly' : schedule.frequency,
      imagesPerDrop: schedule.images_per_drop,
      includeFreestyle: schedule.include_freestyle || false,
      freestylePrompts: schedule.freestyle_prompts || [],
    });
    setWizardOpen(true);
  };

  const openWizard = () => {
    setWizardInitialData(undefined);
    setEditingScheduleId(undefined);
    setWizardOpen(true);
  };

  const closeWizard = () => {
    setWizardOpen(false);
    setWizardInitialData(undefined);
    setEditingScheduleId(undefined);
  };

  return (
    <PageHeader
      title="Creative Drops"
      subtitle={wizardOpen ? undefined : "Automate recurring visual creation. Set up schedules and receive fresh assets on autopilot."}
      backAction={wizardOpen ? { content: 'Back to Schedules', onAction: closeWizard } : undefined}
    >
      {wizardOpen ? (
        <CreativeDropWizard onClose={closeWizard} initialData={wizardInitialData} editingScheduleId={editingScheduleId} />
      ) : (
        <>
          {/* Stats Summary */}
          {hasStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
              <div className="rounded-xl bg-card border p-3">
                <p className="text-2xl font-semibold">{activeCount}</p>
                <p className="text-xs text-muted-foreground">Active Schedules</p>
              </div>
              <div className="rounded-xl bg-card border p-3">
                <p className="text-2xl font-semibold">{totalDrops}</p>
                <p className="text-xs text-muted-foreground">Total Drops</p>
              </div>
              <div className="rounded-xl bg-card border p-3">
                <p className="text-2xl font-semibold">{totalImages}</p>
                <p className="text-xs text-muted-foreground">Images Generated</p>
              </div>
              <div className="rounded-xl bg-card border p-3">
                <p className="text-2xl font-semibold">{totalCredits}</p>
                <p className="text-xs text-muted-foreground">Credits Used</p>
              </div>
              {(generatingCount > 0 || nextRun) && (
                <div className="rounded-xl bg-card border p-3">
                  {generatingCount > 0 ? (
                    <>
                      <p className="text-2xl font-semibold text-amber-500">{generatingCount}</p>
                      <p className="text-xs text-muted-foreground">Generating Now</p>
                    </>
                  ) : nextRun?.next_run_at ? (
                    <>
                      <p className="text-sm font-semibold">{new Date(nextRun.next_run_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      <p className="text-xs text-muted-foreground">Next Run</p>
                    </>
                  ) : null}
                </div>
              )}
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="schedules">
                <Clock className="w-4 h-4 mr-1.5" />
                Schedules
              </TabsTrigger>
              <TabsTrigger value="drops">
                <Zap className="w-4 h-4 mr-1.5" />
                Drops
              </TabsTrigger>
              <TabsTrigger value="calendar">
                <CalendarDays className="w-4 h-4 mr-1.5" />
                Calendar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="schedules" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={openWizard}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Create Schedule
                </Button>
              </div>

              {schedulesLoading ? (
                <div className="space-y-3">
                  {[1, 2].map(i => (
                    <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
                  ))}
                </div>
              ) : schedules.length === 0 ? (
                <EmptyStateCard
                  heading="No schedules yet"
                  description="Set up your first Creative Drop schedule to automate visual generation for your products."
                  action={{ content: 'Create Schedule', onAction: openWizard }}
                  icon={<Calendar className="w-10 h-10 text-muted-foreground" />}
                />
              ) : (
                <div className="space-y-3">
                  {schedules.map(schedule => (
                    <DropCard key={schedule.id} type="schedule" schedule={schedule} onDuplicate={handleDuplicate} onEdit={handleEdit} workflowNames={schedule.workflow_ids.map(id => workflowNameMap.get(id)).filter(Boolean) as string[]} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="drops" className="space-y-4">
              {/* Filter & Sort bar */}
              {drops.length > 0 && (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex gap-1.5 overflow-x-auto">
                    {DROP_STATUSES.map(s => (
                      <Button
                        key={s}
                        variant={dropStatusFilter === s ? 'default' : 'outline'}
                        size="sm"
                        className="text-xs capitalize rounded-full h-7"
                        onClick={() => setDropStatusFilter(s)}
                      >
                        {s}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => setDropSortAsc(prev => !prev)}
                  >
                    {dropSortAsc ? 'Oldest first' : 'Newest first'}
                  </Button>
                </div>
              )}

              {dropsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
                  ))}
                </div>
              ) : filteredDrops.length === 0 && drops.length === 0 ? (
                <EmptyStateCard
                  heading="No drops yet"
                  description="Create your first schedule to start generating creative assets automatically."
                  action={{
                    content: 'Create your first schedule',
                    onAction: () => {
                      setActiveTab('schedules');
                      setTimeout(() => openWizard(), 100);
                    },
                  }}
                  icon={<Zap className="w-10 h-10 text-muted-foreground" />}
                />
              ) : filteredDrops.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No drops matching "{dropStatusFilter}" status
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredDrops.map(drop => (
                    <DropCard
                      key={drop.id}
                      type="drop"
                      drop={drop}
                      onViewDrop={() => setSelectedDrop(drop)}
                      scheduleName={drop.schedule_name || (drop.schedule_id ? scheduleNameMap.get(drop.schedule_id) : undefined) || undefined}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="calendar" className="space-y-4">
              <CalendarView
                schedules={schedules}
                drops={drops}
                onDayClick={(day, type) => {
                  if (type === 'drop') {
                    setActiveTab('drops');
                  }
                }}
              />
            </TabsContent>
          </Tabs>

          {selectedDrop && (
            <DropDetailModal
              open={!!selectedDrop}
              onClose={() => setSelectedDrop(null)}
              drop={{
                ...selectedDrop,
                images: (selectedDrop.images || []) as { url: string; workflow_name?: string; scene_name?: string; product_title?: string }[],
              }}
            />
          )}
        </>
      )}
    </PageHeader>
  );
}

// Calendar view with interactive days
function CalendarView({
  schedules,
  drops,
  onDayClick,
}: {
  schedules: CreativeSchedule[];
  drops: CreativeDrop[];
  onDayClick?: (day: number, type: 'drop' | 'scheduled') => void;
}) {
  const now = new Date();
  const [monthOffset, setMonthOffset] = useState(0);
  const viewDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const dropDays = new Map<number, CreativeDrop[]>();
  drops.forEach(d => {
    const date = new Date(d.run_date);
    if (date.getFullYear() === year && date.getMonth() === month) {
      const day = date.getDate();
      if (!dropDays.has(day)) dropDays.set(day, []);
      dropDays.get(day)!.push(d);
    }
  });

  const scheduledDayMap = new Map<number, CreativeSchedule[]>();
  schedules.forEach(s => {
    if (s.next_run_at) {
      const date = new Date(s.next_run_at);
      if (date.getFullYear() === year && date.getMonth() === month) {
        const day = date.getDate();
        if (!scheduledDayMap.has(day)) scheduledDayMap.set(day, []);
        scheduledDayMap.get(day)!.push(s);
      }
    }
  });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isToday = (day: number) => day === now.getDate() && month === now.getMonth() && year === now.getFullYear();

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMonthOffset(o => o - 1)}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h3 className="text-sm font-medium">{monthName}</h3>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMonthOffset(o => o + 1)}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-xs text-muted-foreground py-1 font-medium">{d}</div>
        ))}
        {cells.map((day, i) => {
          const hasDrop = day ? dropDays.has(day) : false;
          const hasScheduled = day ? scheduledDayMap.has(day) : false;
          const isInteractive = hasDrop || hasScheduled;
          const schedulesForDay = day ? scheduledDayMap.get(day) || [] : [];

          const dayContent = (
            <div
              key={i}
              className={cn(
                'aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-colors',
                day && isToday(day) && 'bg-primary/10 font-semibold',
                day && isInteractive && 'cursor-pointer hover:bg-muted',
                day && !isInteractive && 'cursor-default',
              )}
              onClick={() => {
                if (!day) return;
                if (hasDrop) onDayClick?.(day, 'drop');
                else if (hasScheduled) onDayClick?.(day, 'scheduled');
              }}
            >
              {day && (
                <>
                  <span>{day}</span>
                  <div className="flex gap-0.5 mt-0.5">
                    {hasDrop && <div className="w-1.5 h-1.5 rounded-full bg-status-success" />}
                    {hasScheduled && <div className="w-1.5 h-1.5 rounded-full bg-status-info" />}
                  </div>
                </>
              )}
            </div>
          );

          // Wrap scheduled days with a popover
          if (day && hasScheduled && schedulesForDay.length > 0) {
            return (
              <Popover key={i}>
                <PopoverTrigger asChild>{dayContent}</PopoverTrigger>
                <PopoverContent className="w-56 p-3" side="top">
                  <p className="text-xs font-medium mb-2">Scheduled for {monthName.split(' ')[0]} {day}</p>
                  {schedulesForDay.map(s => (
                    <div key={s.id} className="text-xs text-muted-foreground py-0.5">• {s.name}</div>
                  ))}
                </PopoverContent>
              </Popover>
            );
          }

          return dayContent;
        })}
      </div>
      <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-status-success" />
          Completed drop
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-status-info" />
          Scheduled
        </div>
      </div>
    </div>
  );
}
