import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/app/PageHeader';
import { WorkflowCard } from '@/components/app/WorkflowCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Workflow {
  id: string;
  name: string;
  description: string;
  default_image_count: number;
  required_inputs: string[];
  recommended_ratios: string[];
  uses_tryon: boolean;
  template_ids: string[];
  is_system: boolean;
  created_at: string;
  sort_order: number;
  preview_image_url: string | null;
}

export default function Workflows() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());
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

  const workflowsMissingPreviews = workflows.filter(w => !w.preview_image_url);

  const handleGeneratePreviews = async () => {
    if (workflowsMissingPreviews.length === 0) {
      toast.info('All workflows already have preview images.');
      return;
    }

    const ids = new Set(workflowsMissingPreviews.map(w => w.id));
    setGeneratingIds(ids);
    toast.info(`Generating ${ids.size} preview image${ids.size > 1 ? 's' : ''}…`);

    let successCount = 0;
    let failCount = 0;

    // Generate one at a time to avoid rate limits
    for (const workflow of workflowsMissingPreviews) {
      try {
        const { data, error } = await supabase.functions.invoke('generate-workflow-preview', {
          body: { workflow_id: workflow.id },
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        successCount++;
        setGeneratingIds(prev => {
          const next = new Set(prev);
          next.delete(workflow.id);
          return next;
        });

        // Refresh after each success so the user sees images appear
        queryClient.invalidateQueries({ queryKey: ['workflows'] });
      } catch (err: any) {
        console.error(`Failed for ${workflow.name}:`, err);
        failCount++;
        setGeneratingIds(prev => {
          const next = new Set(prev);
          next.delete(workflow.id);
          return next;
        });
      }
    }

    setGeneratingIds(new Set());

    if (successCount > 0) toast.success(`Generated ${successCount} preview image${successCount > 1 ? 's' : ''}.`);
    if (failCount > 0) toast.error(`${failCount} image${failCount > 1 ? 's' : ''} failed to generate.`);
  };

  const isAnyGenerating = generatingIds.size > 0;

  return (
    <PageHeader
      title="Workflows"
      subtitle="Choose an outcome-driven workflow to generate professional visual sets."
    >
      <div className="space-y-6">
        {/* Admin action: generate missing previews */}
        {!isLoading && workflowsMissingPreviews.length > 0 && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={isAnyGenerating}
              onClick={handleGeneratePreviews}
            >
              {isAnyGenerating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              {isAnyGenerating
                ? `Generating (${generatingIds.size} left)…`
                : `Generate ${workflowsMissingPreviews.length} Preview${workflowsMissingPreviews.length > 1 ? 's' : ''}`}
            </Button>
          </div>
        )}

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
                isGenerating={generatingIds.has(workflow.id)}
                autoPlay={workflow.name === 'Virtual Try-On Set' && hoveredWorkflow !== null ? hoveredWorkflow === workflow.name : workflow.name === 'Virtual Try-On Set'}
                onHoverChange={(hovered) => setHoveredWorkflow(hovered ? workflow.name : null)}
              />
            ))}
          </div>
        )}
      </div>
    </PageHeader>
  );
}
