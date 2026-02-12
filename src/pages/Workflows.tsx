import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/app/PageHeader';
import { WorkflowCard } from '@/components/app/WorkflowCard';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Workflow } from '@/types/workflow';

export type { Workflow } from '@/types/workflow';

export default function Workflows() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data as unknown as Workflow[];
    },
    enabled: !!user,
  });

  const handleCreateVisualSet = (workflow: Workflow) => {
    navigate(`/app/generate?workflow=${workflow.id}`);
  };

  return (
    <PageHeader
      title="Workflows"
      subtitle="Choose an outcome-driven workflow to generate professional visual sets."
    >
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg border overflow-hidden">
              <div className="flex flex-col lg:flex-row">
                <Skeleton className="w-full lg:w-[45%] aspect-[4/3] lg:aspect-[3/4]" />
                <div className="flex-1 p-6 lg:p-10 space-y-4">
                  <Skeleton className="h-7 w-48" />
                  <Skeleton className="h-4 w-full max-w-md" />
                  <Skeleton className="h-4 w-full max-w-sm" />
                  <Skeleton className="h-11 w-36 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {workflows.map((workflow, index) => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              onSelect={() => handleCreateVisualSet(workflow)}
              reversed={index % 2 !== 0}
            />
          ))}
        </div>
      )}
    </PageHeader>
  );
}
