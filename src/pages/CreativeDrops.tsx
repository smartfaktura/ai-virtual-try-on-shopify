import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, Zap, CalendarDays } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/app/PageHeader';
import { EmptyStateCard } from '@/components/app/EmptyStateCard';
import { CreativeDropWizard } from '@/components/app/CreativeDropWizard';
import { DropCard } from '@/components/app/DropCard';
import { DropDetailModal } from '@/components/app/DropDetailModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
}

export default function CreativeDrops() {
  const { user } = useAuth();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedDrop, setSelectedDrop] = useState<CreativeDrop | null>(null);

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
        .select('*')
        .order('run_date', { ascending: false });
      if (error) throw error;
      return data as unknown as CreativeDrop[];
    },
    enabled: !!user,
  });

  return (
    <PageHeader
      title="Creative Drops"
      subtitle="Automate recurring visual creation. Set up schedules and receive fresh assets on autopilot."
    >
      <Tabs defaultValue="schedules" className="space-y-6">
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
            <Button onClick={() => setWizardOpen(true)}>
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
              action={{ content: 'Create Schedule', onAction: () => setWizardOpen(true) }}
              icon={<Calendar className="w-10 h-10 text-muted-foreground" />}
            />
          ) : (
            <div className="space-y-3">
              {schedules.map(schedule => (
                <DropCard key={schedule.id} type="schedule" schedule={schedule} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="drops" className="space-y-4">
          {dropsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : drops.length === 0 ? (
            <EmptyStateCard
              heading="No drops yet"
              description="Once your schedules run, completed drops will appear here with all generated visuals."
              icon={<Zap className="w-10 h-10 text-muted-foreground" />}
            />
          ) : (
            <div className="space-y-3">
              {drops.map(drop => (
                <DropCard key={drop.id} type="drop" drop={drop} onViewDrop={() => setSelectedDrop(drop)} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <CalendarView schedules={schedules} drops={drops} />
        </TabsContent>
      </Tabs>

      <CreativeDropWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />

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
    </PageHeader>
  );
}

// Simple calendar view
function CalendarView({ schedules, drops }: { schedules: CreativeSchedule[]; drops: CreativeDrop[] }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Map drops to day numbers
  const dropDays = new Map<number, CreativeDrop[]>();
  drops.forEach(d => {
    const date = new Date(d.run_date);
    if (date.getFullYear() === year && date.getMonth() === month) {
      const day = date.getDate();
      if (!dropDays.has(day)) dropDays.set(day, []);
      dropDays.get(day)!.push(d);
    }
  });

  // Map scheduled next runs
  const scheduledDays = new Set<number>();
  schedules.forEach(s => {
    if (s.next_run_at) {
      const date = new Date(s.next_run_at);
      if (date.getFullYear() === year && date.getMonth() === month) {
        scheduledDays.add(date.getDate());
      }
    }
  });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <h3 className="text-sm font-medium mb-3">{monthName}</h3>
      <div className="grid grid-cols-7 gap-1 text-center">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-xs text-muted-foreground py-1 font-medium">{d}</div>
        ))}
        {cells.map((day, i) => (
          <div
            key={i}
            className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm ${
              day === now.getDate() ? 'bg-primary/10 font-semibold' : ''
            } ${day ? 'hover:bg-muted cursor-default' : ''}`}
          >
            {day && (
              <>
                <span>{day}</span>
                <div className="flex gap-0.5 mt-0.5">
                  {dropDays.has(day) && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                  {scheduledDays.has(day) && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          Completed drop
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          Scheduled
        </div>
      </div>
    </div>
  );
}
