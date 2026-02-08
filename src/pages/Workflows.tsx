import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/app/PageHeader';
import { WorkflowCard } from '@/components/app/WorkflowCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Workflow } from '@/types/workflow';

// Re-export for backward compat
export type { Workflow } from '@/types/workflow';

export default function Workflows() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hoveredWorkflow, setHoveredWorkflow] = useState<string | null>(null);

  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return (data as unknown as Workflow[]);
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="aspect-[3/4] rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {workflows.map(workflow => (
              <WorkflowCard
                key={workflow.id}
                workflow={workflow}
                onSelect={() => handleCreateVisualSet(workflow)}
                isGenerating={false}
                autoPlay={workflow.name === 'Virtual Try-On Set' && hoveredWorkflow !== null ? hoveredWorkflow === workflow.name : workflow.name === 'Virtual Try-On Set'}
                onHoverChange={(hovered) => setHoveredWorkflow(hovered ? workflow.name : null)}
              />
            ))}
          </div>
        )}
    </PageHeader>
  );
}
