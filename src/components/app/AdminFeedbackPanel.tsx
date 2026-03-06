import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Bug, Lightbulb, MessageCircle, ChevronDown, StickyNote, Save, User } from 'lucide-react';

const STATUS_OPTIONS = ['new', 'reviewed', 'planned', 'done'] as const;
const TYPE_OPTIONS = ['bug', 'feature', 'general'] as const;
const TYPE_ICONS: Record<string, typeof Bug> = { bug: Bug, feature: Lightbulb, general: MessageCircle };
const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  reviewed: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  planned: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
  done: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
};

const REQUEST_TAGS: { pattern: string; label: string; className: string }[] = [
  { pattern: '[model-request]', label: 'Model', className: 'bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20' },
  { pattern: '[scene-request]', label: 'Scene', className: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20' },
  { pattern: '[workflow-request]', label: 'Workflow', className: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20' },
];

function getRequestBadge(message: string) {
  for (const tag of REQUEST_TAGS) {
    if (message.includes(tag.pattern)) {
      return <Badge variant="outline" className={`text-[10px] ${tag.className}`}>{tag.label} Request</Badge>;
    }
  }
  return null;
}

function cleanMessage(message: string) {
  let cleaned = message;
  for (const tag of REQUEST_TAGS) {
    cleaned = cleaned.replace(tag.pattern, '').trim();
  }
  return cleaned;
}

export function AdminFeedbackPanel() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [open, setOpen] = useState(true);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['admin-feedback', statusFilter, typeFilter],
    queryFn: async () => {
      let q = supabase.from('feedback' as any).select('*').order('created_at', { ascending: false }).limit(200);
      if (statusFilter !== 'all') q = q.eq('status', statusFilter);
      if (typeFilter !== 'all') q = q.eq('type', typeFilter);
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

  const updateNotes = useMutation({
    mutationFn: async ({ id, admin_notes }: { id: string; admin_notes: string }) => {
      const { error } = await supabase.from('feedback' as any).update({ admin_notes }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feedback'] });
      setEditingNoteId(null);
      toast.success('Notes saved');
    },
  });

  const statusCounts = items.reduce((acc: Record<string, number>, i: any) => {
    acc[i.status] = (acc[i.status] || 0) + 1;
    return acc;
  }, {});

  const typeCounts = items.reduce((acc: Record<string, number>, i: any) => {
    acc[i.type] = (acc[i.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card>
        <CardContent className="p-5 space-y-4">
          <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
            <div>
              <h2 className="text-base font-semibold">User Feedback & Requests</h2>
              <p className="text-sm text-muted-foreground">
                {items.length} item{items.length !== 1 ? 's' : ''} — bugs, feature requests, and content requests
              </p>
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-4">
            {/* Status filter */}
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Status</p>
              <div className="flex gap-2 flex-wrap">
                {['all', ...STATUS_OPTIONS].map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                      statusFilter === s
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-foreground border-border hover:border-primary/40'
                    }`}
                  >
                    {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                    {s === 'all' ? ` (${items.length})` : statusCounts[s] ? ` (${statusCounts[s]})` : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Type filter */}
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Type</p>
              <div className="flex gap-2 flex-wrap">
                {['all', ...TYPE_OPTIONS].map(t => {
                  const Icon = TYPE_ICONS[t];
                  return (
                    <button
                      key={t}
                      onClick={() => setTypeFilter(t)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                        typeFilter === t
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background text-foreground border-border hover:border-primary/40'
                      }`}
                    >
                      {Icon && <Icon className="w-3 h-3" />}
                      {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
                      {t === 'all' ? '' : typeCounts[t] ? ` (${typeCounts[t]})` : ''}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* List */}
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No feedback yet.</p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {items.map((item: any) => {
                  const Icon = TYPE_ICONS[item.type] || MessageCircle;
                  const requestBadge = getRequestBadge(item.message);
                  const isEditingNote = editingNoteId === item.id;

                  return (
                    <div key={item.id} className="rounded-lg border border-border bg-background p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-wrap">
                          <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                          <Badge variant="outline" className="text-[10px] shrink-0">{item.type}</Badge>
                          {requestBadge}
                          <span className="text-xs text-muted-foreground shrink-0">
                            {format(new Date(item.created_at), 'MMM d, yyyy HH:mm')}
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

                      <p className="text-sm text-foreground">{cleanMessage(item.message)}</p>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {item.user_id?.slice(0, 8)}…
                        </span>
                        {item.page_url && <span>Page: {item.page_url}</span>}
                      </div>

                      {/* Admin notes */}
                      {isEditingNote ? (
                        <div className="space-y-1.5 pt-1">
                          <Textarea
                            value={noteText}
                            onChange={e => setNoteText(e.target.value)}
                            placeholder="Internal admin notes…"
                            className="min-h-[48px] text-xs bg-muted/30"
                            maxLength={500}
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 text-[11px] px-2"
                              onClick={() => setEditingNoteId(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              className="h-6 text-[11px] px-3"
                              onClick={() => updateNotes.mutate({ id: item.id, admin_notes: noteText })}
                              disabled={updateNotes.isPending}
                            >
                              <Save className="w-3 h-3 mr-1" /> Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingNoteId(item.id); setNoteText(item.admin_notes || ''); }}
                          className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors pt-0.5"
                        >
                          <StickyNote className="w-3 h-3" />
                          {item.admin_notes ? item.admin_notes : 'Add note…'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CollapsibleContent>
        </CardContent>
      </Card>
    </Collapsible>
  );
}
