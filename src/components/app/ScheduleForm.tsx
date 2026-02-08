import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Workflow } from '@/pages/Workflows';
import type { BrandProfile } from '@/pages/BrandProfiles';

interface ScheduleFormProps {
  open: boolean;
  onClose: () => void;
}

export function ScheduleForm({ open, onClose }: ScheduleFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [productsScope, setProductsScope] = useState('all');
  const [selectedWorkflowIds, setSelectedWorkflowIds] = useState<string[]>([]);
  const [brandProfileId, setBrandProfileId] = useState<string>('');

  const { data: workflows = [] } = useQuery({
    queryKey: ['workflows'],
    queryFn: async () => {
      const { data, error } = await supabase.from('workflows').select('*').order('name');
      if (error) throw error;
      return data as unknown as Workflow[];
    },
    enabled: open,
  });

  const { data: brandProfiles = [] } = useQuery({
    queryKey: ['brand-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('brand_profiles').select('*').order('name');
      if (error) throw error;
      return data as BrandProfile[];
    },
    enabled: open,
  });

  useEffect(() => {
    if (open) {
      setName('');
      setFrequency('monthly');
      setProductsScope('all');
      setSelectedWorkflowIds([]);
      setBrandProfileId('');
    }
  }, [open]);

  const toggleWorkflow = (id: string) => {
    setSelectedWorkflowIds(prev =>
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    );
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const nextRun = new Date();
      if (frequency === 'monthly') nextRun.setMonth(nextRun.getMonth() + 1);
      else nextRun.setDate(nextRun.getDate() + 14);

      const { error } = await supabase.from('creative_schedules').insert({
        user_id: user.id,
        name,
        frequency,
        products_scope: productsScope,
        selected_product_ids: [],
        workflow_ids: selectedWorkflowIds,
        brand_profile_id: brandProfileId || null,
        active: true,
        next_run_at: nextRun.toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creative-schedules'] });
      toast.success('Schedule created');
      onClose();
    },
    onError: () => toast.error('Failed to create schedule'),
  });

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Creative Drop Schedule</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label>Schedule Name</Label>
            <Input
              placeholder="e.g. Monthly Ad Refresh"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          {/* Frequency */}
          <div className="space-y-1.5">
            <Label>Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="biweekly">Biweekly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Brand Profile */}
          <div className="space-y-1.5">
            <Label>Brand Profile</Label>
            <Select value={brandProfileId} onValueChange={setBrandProfileId}>
              <SelectTrigger>
                <SelectValue placeholder="Select brand profile..." />
              </SelectTrigger>
              <SelectContent>
                {brandProfiles.map(bp => (
                  <SelectItem key={bp.id} value={bp.id}>{bp.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Products Scope */}
          <div className="space-y-1.5">
            <Label>Products</Label>
            <Select value={productsScope} onValueChange={setProductsScope}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All products</SelectItem>
                <SelectItem value="selected">Selected products</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Workflows */}
          <div className="space-y-2">
            <Label>Workflows</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {workflows.map(wf => (
                <label key={wf.id} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={selectedWorkflowIds.includes(wf.id)}
                    onCheckedChange={() => toggleWorkflow(wf.id)}
                  />
                  <span className="text-sm">{wf.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{wf.default_image_count} imgs</span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={!name.trim() || selectedWorkflowIds.length === 0 || saveMutation.isPending}
            >
              {saveMutation.isPending ? 'Creating...' : 'Create Schedule'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
