import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { Navigate } from 'react-router-dom';
import { PageHeader } from '@/components/app/PageHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableHeader, TableHead, TableRow, TableCell, TableBody } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Trash2, ChevronLeft, ChevronRight, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/brandedToast';

const PAGE_SIZE = 20;

const STATUSES = ['all', 'new', 'reviewed', 'planned', 'done'] as const;
const TYPES = ['all', 'survey', 'bug', 'feature', 'general'] as const;
const ANSWERS = ['all', 'yes', 'almost', 'no'] as const;
const PLANS = ['all', 'free', 'starter', 'growth', 'pro'] as const;
const PRIORITIES = ['none', 'low', 'medium', 'high'] as const;

type StatusFilter = (typeof STATUSES)[number];
type TypeFilter = (typeof TYPES)[number];
type AnswerFilter = (typeof ANSWERS)[number];
type PlanFilter = (typeof PLANS)[number];

interface FeedbackRow {
  id: string;
  user_id: string;
  type: string;
  message: string;
  page_url: string | null;
  status: string;
  admin_notes: string | null;
  email: string | null;
  created_at: string;
  workflow: string | null;
  primary_answer: string | null;
  reasons: string[] | null;
  question_key: string | null;
  trigger_type: string | null;
  result_id: string | null;
  image_url: string | null;
  user_plan: string | null;
  priority: string | null;
  resolvedEmail?: string;
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30',
  reviewed: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
  planned: 'bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/30',
  done: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
};

const typeColors: Record<string, string> = {
  bug: 'bg-destructive/15 text-destructive border-destructive/30',
  feature: 'bg-primary/15 text-primary border-primary/30',
  general: 'bg-muted text-muted-foreground border-border',
  survey: 'bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/30',
};

const answerColors: Record<string, string> = {
  yes: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  almost: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  no: 'bg-destructive/15 text-destructive',
};

export default function AdminFeedback() {
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [answerFilter, setAnswerFilter] = useState<AnswerFilter>('all');
  const [planFilter, setPlanFilter] = useState<PlanFilter>('all');
  const [selected, setSelected] = useState<FeedbackRow | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-feedback', page, statusFilter, typeFilter, answerFilter, planFilter],
    queryFn: async () => {
      let query = supabase
        .from('feedback')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') query = query.eq('status', statusFilter);
      if (typeFilter !== 'all') query = query.eq('type', typeFilter);
      if (answerFilter !== 'all') query = query.eq('primary_answer', answerFilter);
      if (planFilter !== 'all') query = query.eq('user_plan', planFilter);

      const from = page * PAGE_SIZE;
      query = query.range(from, from + PAGE_SIZE - 1);

      const { data: rows, error, count } = await query;
      if (error) throw error;

      const userIds = [...new Set((rows || []).map(r => r.user_id))];
      let emailMap: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: emails } = await supabase.rpc('get_user_emails_for_admin', { p_user_ids: userIds });
        if (emails) {
          emailMap = Object.fromEntries(emails.map((e: { user_id: string; email: string }) => [e.user_id, e.email]));
        }
      }

      const enriched: FeedbackRow[] = (rows || []).map(r => ({
        ...r,
        resolvedEmail: emailMap[r.user_id] || r.email || r.user_id,
      })) as FeedbackRow[];

      return { items: enriched, total: count || 0 };
    },
    enabled: isAdmin,
    staleTime: 30_000,
  });

  // Summary stats
  const { data: summaryData } = useQuery({
    queryKey: ['admin-feedback-summary'],
    queryFn: async () => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: weekRows } = await supabase
        .from('feedback')
        .select('primary_answer, reasons, status')
        .gte('created_at', weekAgo);

      const rows = weekRows || [];
      const total = rows.length;
      const answers = { yes: 0, almost: 0, no: 0 };
      const reasonCount: Record<string, number> = {};
      let unresolved = 0;

      for (const r of rows) {
        if (r.primary_answer && r.primary_answer in answers) {
          answers[r.primary_answer as keyof typeof answers]++;
        }
        if (r.status === 'new') unresolved++;
        const reasons = r.reasons as string[] | null;
        if (reasons) {
          for (const reason of reasons) {
            reasonCount[reason] = (reasonCount[reason] || 0) + 1;
          }
        }
      }

      const topReasons = Object.entries(reasonCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, count]) => ({ name, count }));

      return { total, answers, unresolved, topReasons };
    },
    enabled: isAdmin,
    staleTime: 60_000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('feedback').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feedback'] });
      toast.success('Status updated');
    },
  });

  const updateNotesMutation = useMutation({
    mutationFn: async ({ id, admin_notes }: { id: string; admin_notes: string }) => {
      const { error } = await supabase.from('feedback').update({ admin_notes }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feedback'] });
      toast.success('Notes saved');
    },
  });

  const updatePriorityMutation = useMutation({
    mutationFn: async ({ id, priority }: { id: string; priority: string }) => {
      const { error } = await supabase.from('feedback').update({ priority } as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feedback'] });
      toast.success('Priority updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('feedback').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feedback'] });
      toast.success('Feedback deleted');
      setSelected(null);
    },
  });

  const filtered = useMemo(() => {
    if (!data?.items) return [];
    if (!search.trim()) return data.items;
    const q = search.toLowerCase();
    return data.items.filter(r =>
      r.resolvedEmail?.toLowerCase().includes(q) || r.message.toLowerCase().includes(q) || r.workflow?.toLowerCase().includes(q)
    );
  }, [data?.items, search]);

  const totalPages = Math.ceil((data?.total || 0) / PAGE_SIZE);

  if (adminLoading) return null;
  if (!isAdmin) return <Navigate to="/app" replace />;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const openDetail = (item: FeedbackRow) => {
    setSelected(item);
    setAdminNotes(item.admin_notes || '');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="User Feedback" subtitle="Surveys, bugs, feature requests, and general feedback">{null}</PageHeader>

      {/* Summary bar */}
      {summaryData && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="border border-border rounded-xl p-3">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider">This week</p>
            <p className="text-xl font-semibold">{summaryData.total}</p>
          </div>
          <div className="border border-border rounded-xl p-3">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Answers</p>
            <div className="flex gap-2 mt-1">
              <span className="text-xs text-emerald-600">✓ {summaryData.answers.yes}</span>
              <span className="text-xs text-amber-600">~ {summaryData.answers.almost}</span>
              <span className="text-xs text-destructive">✗ {summaryData.answers.no}</span>
            </div>
          </div>
          <div className="border border-border rounded-xl p-3">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Unresolved</p>
            <p className="text-xl font-semibold">{summaryData.unresolved}</p>
          </div>
          <div className="border border-border rounded-xl p-3 col-span-2">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Top reasons</p>
            <div className="flex flex-wrap gap-1">
              {summaryData.topReasons.map(r => (
                <Badge key={r.name} variant="outline" className="text-[10px]">{r.name} ({r.count})</Badge>
              ))}
              {summaryData.topReasons.length === 0 && <span className="text-xs text-muted-foreground">None yet</span>}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-medium text-muted-foreground self-center mr-1">Status</span>
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(0); }}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize',
                statusFilter === s
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-background text-muted-foreground border-border hover:border-foreground/30'
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-medium text-muted-foreground self-center mr-1">Type</span>
          {TYPES.map(t => (
            <button
              key={t}
              onClick={() => { setTypeFilter(t); setPage(0); }}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize',
                typeFilter === t
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-background text-muted-foreground border-border hover:border-foreground/30'
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-medium text-muted-foreground self-center mr-1">Answer</span>
            {ANSWERS.map(a => (
              <button
                key={a}
                onClick={() => { setAnswerFilter(a); setPage(0); }}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize',
                  answerFilter === a
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-background text-muted-foreground border-border hover:border-foreground/30'
                )}
              >
                {a}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-medium text-muted-foreground self-center mr-1">Plan</span>
            {PLANS.map(p => (
              <button
                key={p}
                onClick={() => { setPlanFilter(p); setPage(0); }}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize',
                  planFilter === p
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-background text-muted-foreground border-border hover:border-foreground/30'
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by email, message, or workflow..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Table */}
      <div className="border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead className="w-20">Type</TableHead>
              <TableHead className="w-28">Workflow</TableHead>
              <TableHead className="w-20">Answer</TableHead>
              <TableHead className="hidden md:table-cell">Reasons / Message</TableHead>
              <TableHead className="w-20">Plan</TableHead>
              <TableHead className="w-12">Img</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="hidden sm:table-cell w-28">Date</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={10}><div className="h-5 bg-muted animate-pulse rounded" /></TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground py-12">
                  No feedback found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(item => (
                <TableRow key={item.id} className="cursor-pointer" onClick={() => openDetail(item)}>
                  <TableCell>
                    <span className="text-sm font-medium truncate block max-w-[140px]">{item.resolvedEmail}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('capitalize text-[10px]', typeColors[item.type] || typeColors.general)}>
                      {item.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.workflow && (
                      <span className="text-[11px] text-muted-foreground font-mono truncate block max-w-[100px]">{item.workflow}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.primary_answer && (
                      <Badge variant="outline" className={cn('text-[10px] capitalize', answerColors[item.primary_answer] || '')}>
                        {item.primary_answer}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1 max-w-[300px]">
                      {item.reasons && item.reasons.length > 0
                        ? item.reasons.slice(0, 3).map(r => (
                            <Badge key={r} variant="secondary" className="text-[9px] font-normal">{r}</Badge>
                          ))
                        : <span className="text-xs text-muted-foreground line-clamp-1">{item.message.slice(0, 100)}</span>
                      }
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.user_plan && (
                      <span className="text-[11px] text-muted-foreground capitalize">{item.user_plan}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.image_url && (
                      <div className="w-8 h-8 rounded overflow-hidden bg-muted">
                        <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell onClick={e => e.stopPropagation()}>
                    <Select
                      value={item.status}
                      onValueChange={status => updateStatusMutation.mutate({ id: item.id, status })}
                    >
                      <SelectTrigger className={cn('h-7 text-[11px] w-24 border', statusColors[item.status] || '')}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.filter(s => s !== 'all').map(s => (
                          <SelectItem key={s} value={s} className="capitalize text-xs">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                    {formatDate(item.created_at)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={e => { e.stopPropagation(); deleteMutation.mutate(item.id); }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Page {page + 1} of {totalPages} ({data?.total} total)</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 0}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Badge variant="outline" className={cn('capitalize text-[11px]', typeColors[selected?.type || 'general'])}>
                {selected?.type}
              </Badge>
              {selected?.primary_answer && (
                <Badge variant="outline" className={cn('capitalize text-[11px]', answerColors[selected.primary_answer] || '')}>
                  {selected.primary_answer}
                </Badge>
              )}
              <span className="truncate text-sm">{selected?.resolvedEmail}</span>
            </DialogTitle>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>{selected && formatDate(selected.created_at)}</span>
              {selected?.workflow && (
                <>
                  <span>·</span>
                  <span className="font-mono">{selected.workflow}</span>
                </>
              )}
              {selected?.user_plan && (
                <>
                  <span>·</span>
                  <span className="capitalize">{selected.user_plan}</span>
                </>
              )}
              {selected?.page_url && (
                <>
                  <span>·</span>
                  <a
                    href={selected.page_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    {selected.page_url.replace(/https?:\/\/[^/]+/, '').replace('/app', '') || '/'}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </>
              )}
            </div>
          </DialogHeader>

          {/* Image preview */}
          {selected?.image_url && (
            <div className="rounded-lg overflow-hidden border border-border bg-muted/30">
              <a href={selected.image_url} target="_blank" rel="noopener noreferrer">
                <img src={selected.image_url} alt="Generated result" className="w-full max-h-[200px] object-contain" />
              </a>
            </div>
          )}

          {/* Question shown */}
          {selected?.question_key && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Question:</span> {selected.question_key}
            </div>
          )}

          {/* Reason chips */}
          {selected?.reasons && selected.reasons.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selected.reasons.map(r => (
                <Badge key={r} variant="secondary" className="text-[11px]">{r}</Badge>
              ))}
            </div>
          )}

          {/* Message / note */}
          <div className="bg-muted/50 rounded-lg p-4 text-sm whitespace-pre-wrap max-h-[200px] overflow-y-auto">
            {selected?.message}
          </div>

          {/* Trigger type */}
          {selected?.trigger_type && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Trigger:</span> {selected.trigger_type}
            </div>
          )}

          {/* Admin controls */}
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center gap-3">
              <div>
                <label className="text-[11px] font-medium text-muted-foreground">Priority</label>
                <Select
                  value={selected?.priority || 'none'}
                  onValueChange={priority => {
                    if (selected) {
                      updatePriorityMutation.mutate({ id: selected.id, priority });
                      setSelected({ ...selected, priority });
                    }
                  }}
                >
                  <SelectTrigger className="h-8 text-xs w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map(p => (
                      <SelectItem key={p} value={p} className="capitalize text-xs">{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[11px] font-medium text-muted-foreground">Status</label>
                <Select
                  value={selected?.status || 'new'}
                  onValueChange={status => {
                    if (selected) {
                      updateStatusMutation.mutate({ id: selected.id, status });
                      setSelected({ ...selected, status });
                    }
                  }}
                >
                  <SelectTrigger className={cn('h-8 text-xs w-28 border', statusColors[selected?.status || 'new'] || '')}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.filter(s => s !== 'all').map(s => (
                      <SelectItem key={s} value={s} className="capitalize text-xs">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Admin Notes</label>
              <Textarea
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                placeholder="Add notes..."
                rows={3}
              />
              <div className="flex justify-between">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => selected && updateNotesMutation.mutate({ id: selected.id, admin_notes: adminNotes })}
                  disabled={updateNotesMutation.isPending}
                >
                  Save Notes
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => selected && deleteMutation.mutate(selected.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
