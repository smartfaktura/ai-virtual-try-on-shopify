import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, Zap } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/app/PageHeader';
import { EmptyStateCard } from '@/components/app/EmptyStateCard';
import { ScheduleForm } from '@/components/app/ScheduleForm';
import { DropCard } from '@/components/app/DropCard';
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
}

export default function CreativeDrops() {
  const { user } = useAuth();
  const [scheduleFormOpen, setScheduleFormOpen] = useState(false);

  const { data: schedules = [], isLoading: schedulesLoading } = useQuery({
    queryKey: ['creative-schedules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('creative_schedules')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as CreativeSchedule[];
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
      return data as CreativeDrop[];
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
        </TabsList>

        <TabsContent value="schedules" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setScheduleFormOpen(true)}>
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
              action={{ content: 'Create Schedule', onAction: () => setScheduleFormOpen(true) }}
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
                <DropCard key={drop.id} type="drop" drop={drop} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ScheduleForm open={scheduleFormOpen} onClose={() => setScheduleFormOpen(false)} />
    </PageHeader>
  );
}
