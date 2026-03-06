import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Bug, Lightbulb, MessageCircle } from 'lucide-react';

const STATUS_OPTIONS = ['new', 'reviewed', 'planned', 'done'] as const;
const TYPE_ICONS: Record<string, typeof Bug> = { bug: Bug, feature: Lightbulb, general: MessageCircle };
const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  reviewed: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  planned: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
  done: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
};

export function AdminFeedbackPanel() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>('all');

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['admin-feedback', filter],
    queryFn: async () => {
      let q = supabase.from('feedback' as any).select('*').order('created_at', { ascending: false }).limit(100);
      if (filter !== 'all') q = q.eq('status', filter);
      const { data, error } = await q;
      if (error) throw error;
      return data as any[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('feedback' as any).update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feedback'] });
      toast.success('Status updated');
    },
  });

  const counts = items.reduce((acc: Record<string, number>, i: any) => {
    acc[i.status] = (acc[i.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div>
          <h2 className="text-base font-semibold">User Feedback</h2>
          <p className="text-sm text-muted-foreground">Review feature requests, bug reports, and general feedback</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {['all', ...STATUS_OPTIONS].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                filter === s
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-foreground border-border hover:border-primary/40'
              }`}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              {s === 'all' ? ` (${items.length})` : counts[s] ? ` (${counts[s]})` : ''}
            </button>
          ))}
        </div>

        {/* List */}
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No feedback yet.</p>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {items.map((item: any) => {
              const Icon = TYPE_ICONS[item.type] || MessageCircle;
              return (
                <div key={item.id} className="rounded-lg border border-border bg-background p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                      <Badge variant="outline" className="text-[10px] shrink-0">{item.type}</Badge>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {format(new Date(item.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <Select
                      value={item.status}
                      onValueChange={status => updateStatus.mutate({ id: item.id, status })}
                    >
                      <SelectTrigger className="h-7 w-[100px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(s => (
                          <SelectItem key={s} value={s} className="text-xs">{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-sm text-foreground">{item.message}</p>
                  {item.page_url && (
                    <p className="text-xs text-muted-foreground">Page: {item.page_url}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
