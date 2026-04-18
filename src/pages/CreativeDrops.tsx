import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, Zap, CalendarDays, ChevronLeft, ChevronRight, Package, Layers, RefreshCw } from 'lucide-react';
import { getLandingAssetUrl } from '@/lib/landingAssets';
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
import { FeedbackBanner } from '@/components/app/FeedbackBanner';
import { toast } from '@/lib/brandedToast';

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
  scene_config?: Record<string, any>;
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



export default function CreativeDrops() {
  const { user } = useAuth();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardInitialData, setWizardInitialData] = useState<CreativeDropWizardInitialData | undefined>(undefined);
  const [editingScheduleId, setEditingScheduleId] = useState<string | undefined>(undefined);
  const [selectedDrop, setSelectedDrop] = useState<CreativeDrop | null>(null);
  const [activeTab, setActiveTab] = useState('drops');
  
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

  const lastGeneratingRef = useRef<number>(0);

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
    refetchInterval: (query) => {
      const data = query.state.data;
      const hasGenerating = data?.some((d: CreativeDrop) => d.status === 'generating');
      if (hasGenerating) {
        lastGeneratingRef.current = Date.now();
        return 5_000;
      }
      // Keep polling 30s after last generating drop disappears to catch completion
      if (lastGeneratingRef.current > 0 && Date.now() - lastGeneratingRef.current < 30_000) {
        return 5_000;
      }
      return false;
    },
  });

  // Track previous drop statuses and toast on completion
  const prevDropStatusesRef = useRef<Map<string, string>>(new Map());
  useEffect(() => {
    const prev = prevDropStatusesRef.current;
    if (prev.size > 0) {
      for (const drop of drops) {
        const oldStatus = prev.get(drop.id);
        if (oldStatus === 'generating' && drop.status === 'ready') {
          toast.success(`Drop "${drop.schedule_name || new Date(drop.run_date).toLocaleDateString()}" is ready! 🎉`);
        } else if (oldStatus === 'generating' && drop.status === 'failed') {
          toast.error(`Drop "${drop.schedule_name || new Date(drop.run_date).toLocaleDateString()}" failed`);
        }
      }
    }
    prevDropStatusesRef.current = new Map(drops.map(d => [d.id, d.status]));
  }, [drops]);

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
    .sort((a, b) => {
      const dateA = new Date(a.run_date).getTime();
      const dateB = new Date(b.run_date).getTime();
      return dropSortAsc ? dateA - dateB : dateB - dateA;
    });

  // Schedule name lookup for drops
  const scheduleNameMap = new Map(schedules.map(s => [s.id, s.name]));

  const extractWfFormats = (schedule: CreativeSchedule) => {
    const sceneConfig = (schedule.scene_config || {}) as Record<string, any>;
    const wfFormats: Record<string, string> = {};
    for (const [k, v] of Object.entries(sceneConfig)) {
      wfFormats[k] = v?.aspect_ratio || '1:1';
    }
    return wfFormats;
  };

  const extractPerWorkflowData = (schedule: CreativeSchedule) => {
    const sceneConfig = (schedule.scene_config || {}) as Record<string, any>;
    const sceneSelections: Record<string, string[]> = {};
    const modelSelections: Record<string, string[]> = {};
    const poseSelections: Record<string, string[]> = {};
    const customSettings: Record<string, Record<string, string>> = {};
    for (const [k, v] of Object.entries(sceneConfig)) {
      if (v?.selected_scenes) sceneSelections[k] = v.selected_scenes;
      if (v?.model_ids) modelSelections[k] = v.model_ids;
      if (v?.pose_ids) poseSelections[k] = v.pose_ids;
      if (v?.custom_settings) customSettings[k] = v.custom_settings;
    }
    return { sceneSelections, modelSelections, poseSelections, customSettings };
  };

  const handleDuplicate = (schedule: CreativeSchedule) => {
    const { sceneSelections, modelSelections, poseSelections, customSettings } = extractPerWorkflowData(schedule);
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
      workflowSceneSelections: sceneSelections,
      workflowModelSelections: modelSelections,
      workflowPoseSelections: poseSelections,
      workflowCustomSettings: customSettings,
    });
    setWizardOpen(true);
  };

  const handleEdit = (schedule: CreativeSchedule) => {
    const { sceneSelections, modelSelections, poseSelections, customSettings } = extractPerWorkflowData(schedule);
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
      workflowSceneSelections: sceneSelections,
      workflowModelSelections: modelSelections,
      workflowPoseSelections: poseSelections,
      workflowCustomSettings: customSettings,
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
      title={wizardOpen ? '' : 'Content Calendar'}
      subtitle={wizardOpen ? undefined : "Schedule recurring content and receive fresh assets on autopilot."}
      backAction={wizardOpen ? { content: 'Back', onAction: closeWizard } : undefined}
    >
      {wizardOpen ? (
        <CreativeDropWizard onClose={closeWizard} onLaunched={() => setActiveTab('drops')} initialData={wizardInitialData} editingScheduleId={editingScheduleId} />
      ) : (schedulesLoading || dropsLoading) ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="h-20 rounded-2xl bg-muted/50 animate-pulse" />
          <div className="h-10 w-64 rounded-xl bg-muted/50 animate-pulse" />
          <div className="space-y-3">
            <div className="h-24 rounded-2xl bg-muted/30 animate-pulse" />
            <div className="h-24 rounded-2xl bg-muted/30 animate-pulse" />
          </div>
        </div>
      ) : !hasStats ? (
        <CreativeDropsOnboarding onCreateSchedule={openWizard} />
      ) : (
        <>
          {/* Stats Summary */}
          {/* Stats Ribbon */}
          <div className="rounded-2xl bg-card shadow-sm overflow-hidden mb-8">
            <div className="flex overflow-x-auto scrollbar-hide divide-x divide-border">
              {[
                { value: activeCount, label: 'Scheduled' },
                { value: totalDrops, label: 'Total Drops' },
                { value: totalImages, label: 'Images Generated' },
                { value: totalCredits, label: 'Credits Used' },
                ...(generatingCount > 0 ? [{ value: generatingCount, label: 'Generating Now', generating: true }] :
                  nextRun?.next_run_at ? [{ value: new Date(nextRun.next_run_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), label: 'Next Run' }] : []),
              ].map((stat: any) => (
                <div key={stat.label} className="flex-1 min-w-[80px] sm:min-w-[110px] px-3 sm:px-5 py-3 sm:py-4 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <p className="text-lg sm:text-2xl font-semibold tracking-tight">{stat.value}</p>
                    {stat.generating && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <TabsList className="bg-muted/50 rounded-xl p-1 h-auto w-full sm:w-auto">
                <TabsTrigger value="drops" className="rounded-lg flex-1 sm:flex-none px-4 sm:px-5 py-2 text-sm data-[state=active]:shadow-sm">
                  Drops
                </TabsTrigger>
                <TabsTrigger value="schedules" className="rounded-lg flex-1 sm:flex-none px-4 sm:px-5 py-2 text-sm data-[state=active]:shadow-sm">
                  Scheduled
                </TabsTrigger>
                <TabsTrigger value="calendar" className="rounded-lg flex-1 sm:flex-none px-4 sm:px-5 py-2 text-sm data-[state=active]:shadow-sm">
                  Calendar
                </TabsTrigger>
              </TabsList>
              <Button onClick={openWizard} className="rounded-xl gap-2 w-full sm:w-auto">
                <Calendar className="w-4 h-4" />
                Create Drop
              </Button>
            </div>

            <TabsContent value="drops" className="space-y-4">
              {/* Count + Sort row */}
              {drops.length > 0 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{filteredDrops.length} drop{filteredDrops.length !== 1 ? 's' : ''}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 text-muted-foreground"
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
              ) : filteredDrops.length === 0 ? (
                <EmptyStateCard
                  heading="No drops yet"
                  description="Create your first drop to start generating creative assets automatically"
                  action={{
                    content: 'Create your first drop',
                    onAction: () => {
                      openWizard();
                    },
                  }}
                  icon={<Zap className="w-10 h-10 text-muted-foreground" />}
                />
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

            <TabsContent value="schedules" className="space-y-4">
              {schedulesLoading ? (
                <div className="space-y-3">
                  {[1, 2].map(i => (
                    <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
                  ))}
                </div>
              ) : schedules.length === 0 ? (
                <EmptyStateCard
                  heading="No scheduled drops yet"
                  description="Set up your first scheduled drop to automate visual generation for your products"
                  action={{ content: 'Create Drop', onAction: openWizard }}
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

          <div className="mt-6">
            <FeedbackBanner />
          </div>

          {selectedDrop && (
            <DropDetailModal
              open={!!selectedDrop}
              onClose={() => setSelectedDrop(null)}
              drop={{
                ...selectedDrop,
                images: (selectedDrop.images || []) as { url: string; workflow_name?: string; scene_name?: string; product_title?: string }[],
                generation_job_ids: selectedDrop.generation_job_ids || [],
                schedule_name: selectedDrop.schedule_name || (selectedDrop.schedule_id ? scheduleNameMap.get(selectedDrop.schedule_id) : undefined) || undefined,
              }}
            />
          )}
        </>
      )}
    </PageHeader>
  );
}

// Onboarding section for zero-state
const onboardingSteps = [
  { icon: Package, title: 'Select Products', desc: 'Pick the products that need fresh content.' },
  { icon: Layers, title: 'Design Your Mix', desc: 'Choose styles, models & scenes per workflow.' },
  { icon: RefreshCw, title: 'Schedule & Go', desc: 'Set the cadence. Visuals drop on autopilot.' },
];

const previewImages = [
  getLandingAssetUrl('showcase/fashion-blazer-golden.jpg'),
  getLandingAssetUrl('showcase/skincare-serum-marble.jpg'),
  getLandingAssetUrl('showcase/food-coffee-artisan.jpg'),
  getLandingAssetUrl('showcase/skincare-cream-botanical.jpg'),
  getLandingAssetUrl('showcase/fashion-dress-garden.jpg'),
];

function CreativeDropsOnboarding({ onCreateSchedule }: { onCreateSchedule: () => void }) {
  return (
    <div className="max-w-2xl mx-auto text-center space-y-8 py-8 sm:py-10 animate-in fade-in-0 duration-700">
      {/* Headline */}
      <div className="space-y-3">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
          Your Brand's Visual Engine
        </h2>
        <p className="text-muted-foreground text-base max-w-md mx-auto">
          Bundle your products, styles & schedules into one drop — fresh visuals land automatically.
        </p>
      </div>

      {/* Three steps — inline row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-center gap-6 sm:gap-0 sm:divide-x sm:divide-border">
        {onboardingSteps.map((step) => {
          const StepIcon = step.icon;
          return (
            <div key={step.title} className="flex items-start gap-3 sm:px-8 first:sm:pl-0 last:sm:pr-0">
              <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <StepIcon className="w-4 h-4 text-foreground/70" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">{step.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview images — avatar stack */}
      <div className="flex justify-center -space-x-2.5">
        {previewImages.map((img, i) => (
          <div
            key={i}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-background shadow-sm"
            style={{ zIndex: previewImages.length - i }}
          >
            <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }} />
          </div>
        ))}
      </div>

      {/* CTA */}
      <div>
        <Button
          size="lg"
          onClick={onCreateSchedule}
          className="rounded-full px-8 gap-2"
        >
          <Calendar className="w-4 h-4" />
          Create Your First Drop
        </Button>
        <p className="text-xs text-muted-foreground mt-2.5">
          Ready in 2 minutes · Pause or cancel anytime
        </p>
      </div>
    </div>
  );
}

// Calendar view — premium 2026 aesthetic
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

  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long' });
  const yearLabel = viewDate.getFullYear();

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

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  // Pad trailing cells to fill last row
  while (cells.length % 7 !== 0) cells.push(null);

  const isToday = (day: number) => day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
  const isCurrentMonth = monthOffset === 0;

  const dropsThisMonth = drops.filter(d => {
    const date = new Date(d.run_date);
    return date.getFullYear() === year && date.getMonth() === month;
  }).length;
  const scheduledThisMonth = schedules.filter(s => {
    if (!s.next_run_at) return false;
    const date = new Date(s.next_run_at);
    return date.getFullYear() === year && date.getMonth() === month;
  }).length;

  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="max-w-2xl mx-auto w-full">
      {/* Card wrapper */}
      <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-4 sm:p-6">
        {/* Month navigation header */}
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl hover:bg-muted/60"
            onClick={() => setMonthOffset(o => o - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex flex-col items-center gap-0.5">
            <div className="flex items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight">{monthLabel}</h3>
              <span className="text-xl sm:text-2xl font-light text-muted-foreground/60">{yearLabel}</span>
            </div>
            {/* Month summary + legend inline */}
            <div className="flex items-center gap-3 mt-1">
              {(dropsThisMonth > 0 || scheduledThisMonth > 0) && (
                <span className="text-[10px] sm:text-[11px] text-muted-foreground">
                  {[
                    dropsThisMonth > 0 ? `${dropsThisMonth} drop${dropsThisMonth !== 1 ? 's' : ''}` : null,
                    scheduledThisMonth > 0 ? `${scheduledThisMonth} scheduled` : null,
                  ].filter(Boolean).join(' · ')}
                </span>
              )}
              {!isCurrentMonth && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px] rounded-full px-2.5 text-muted-foreground hover:text-foreground"
                  onClick={() => setMonthOffset(0)}
                >
                  Today
                </Button>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl hover:bg-muted/60"
            onClick={() => setMonthOffset(o => o + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Legend pills */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/40 text-[10px] sm:text-[11px] font-medium text-muted-foreground">
            <div className="w-[6px] h-[6px] rounded-full bg-primary" />
            Ready
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/40 text-[10px] sm:text-[11px] font-medium text-muted-foreground">
            <div className="w-[6px] h-[6px] rounded-full bg-amber-500" />
            Generating
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/40 text-[10px] sm:text-[11px] font-medium text-muted-foreground">
            <div className="w-[6px] h-[6px] rounded-full bg-muted-foreground/50" />
            Scheduled
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border/40">
          {dayHeaders.map((d, i) => (
            <div key={`hdr-${i}`} className="py-2 sm:py-2.5 text-center text-[10px] sm:text-[11px] font-semibold tracking-widest uppercase text-muted-foreground/50">
              {d}
            </div>
          ))}
        </div>

        {/* Day grid with grid lines */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            const dayDrops = day ? dropDays.get(day) || [] : [];
            const daySchedules = day ? scheduledDayMap.get(day) || [] : [];
            const hasDrop = dayDrops.length > 0;
            const hasScheduled = daySchedules.length > 0;
            const isInteractive = hasDrop || hasScheduled;

            const hasReady = dayDrops.some(d => d.status === 'ready');
            const hasGenerating = dayDrops.some(d => d.status === 'generating');
            const hasFailed = dayDrops.some(d => d.status === 'failed');

            const isLastRow = i >= cells.length - 7;
            const isLastCol = (i + 1) % 7 === 0;

            const dayContent = (
              <div
                className={cn(
                  'relative flex flex-col items-start p-1.5 sm:p-2 min-h-[52px] sm:min-h-[72px] transition-colors duration-200',
                  !isLastCol && 'border-r border-border/20',
                  !isLastRow && 'border-b border-border/20',
                  day && isInteractive && 'cursor-pointer hover:bg-muted/40',
                  day && !isInteractive && 'hover:bg-muted/15',
                  !day && 'bg-muted/5',
                )}
                onClick={() => {
                  if (!day) return;
                  if (hasDrop) onDayClick?.(day, 'drop');
                  else if (hasScheduled) onDayClick?.(day, 'scheduled');
                }}
              >
                {day && (
                  <>
                    {/* Day number — Apple-style today circle */}
                    <span
                      className={cn(
                        'text-xs sm:text-sm leading-none',
                        isToday(day)
                          ? 'bg-primary text-primary-foreground w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-semibold'
                          : 'text-foreground/80 font-normal',
                      )}
                    >
                      {day}
                    </span>

                    {/* Status dots — bottom area */}
                    {isInteractive && (
                      <div className="flex items-center gap-[3px] mt-auto pt-1">
                        {hasReady && <div className="w-[5px] h-[5px] sm:w-[6px] sm:h-[6px] rounded-full bg-primary" />}
                        {hasGenerating && <div className="w-[5px] h-[5px] sm:w-[6px] sm:h-[6px] rounded-full bg-amber-500 animate-pulse" />}
                        {hasFailed && <div className="w-[5px] h-[5px] sm:w-[6px] sm:h-[6px] rounded-full bg-destructive" />}
                        {hasScheduled && <div className="w-[5px] h-[5px] sm:w-[6px] sm:h-[6px] rounded-full bg-muted-foreground/50" />}
                      </div>
                    )}
                  </>
                )}
              </div>
            );

            if (day && isInteractive) {
              return (
                <Popover key={i}>
                  <PopoverTrigger asChild>{dayContent}</PopoverTrigger>
                  <PopoverContent
                    className="w-64 sm:w-72 p-0 rounded-2xl shadow-lg border-border/50 backdrop-blur-xl overflow-hidden"
                    side="bottom"
                    align="center"
                  >
                    {/* Popover header */}
                    <div className="px-4 py-3 border-b border-border/30 bg-muted/20">
                      <p className="text-sm font-semibold">
                        {viewDate.toLocaleDateString('en-US', { month: 'long' })} {day}
                      </p>
                    </div>
                    <div className="p-3 space-y-1">
                      {dayDrops.map(d => (
                        <div key={d.id} className="flex items-center gap-2.5 text-xs py-1.5 px-1 rounded-lg hover:bg-muted/30 transition-colors">
                          <div className={cn(
                            'w-2 h-2 rounded-full flex-shrink-0',
                            d.status === 'ready' ? 'bg-primary' : d.status === 'generating' ? 'bg-amber-500' : 'bg-destructive'
                          )} />
                          <span className="truncate flex-1 font-medium">{d.schedule_name || 'Drop'}</span>
                          <span className={cn(
                            'px-1.5 py-0.5 rounded-full text-[10px] font-medium',
                            d.status === 'ready' ? 'bg-primary/10 text-primary' :
                            d.status === 'generating' ? 'bg-amber-500/10 text-amber-600' :
                            'bg-destructive/10 text-destructive'
                          )}>
                            {d.status === 'ready' ? `${d.total_images} img` : d.status}
                          </span>
                        </div>
                      ))}
                      {daySchedules.length > 0 && dayDrops.length > 0 && (
                        <div className="border-t border-border/30 my-1" />
                      )}
                      {daySchedules.map(s => (
                        <div key={s.id} className="flex items-center gap-2.5 text-xs py-1.5 px-1 rounded-lg hover:bg-muted/30 transition-colors">
                          <div className="w-2 h-2 rounded-full bg-muted-foreground/40 flex-shrink-0" />
                          <span className="truncate flex-1 font-medium">{s.name}</span>
                          <span className="px-1.5 py-0.5 rounded-full bg-muted/60 text-[10px] font-medium text-muted-foreground capitalize">
                            {s.frequency}
                          </span>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              );
            }

            return <React.Fragment key={i}>{dayContent}</React.Fragment>;
          })}
        </div>
      </div>
    </div>
  );
}
