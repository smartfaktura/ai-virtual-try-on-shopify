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
import { Search, Trash2, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const PAGE_SIZE = 20;

const STATUSES = ['all', 'new', 'reviewed', 'planned', 'done'] as const;
const TYPES = ['all', 'bug', 'feature', 'general'] as const;

type StatusFilter = (typeof STATUSES)[number];
type TypeFilter = (typeof TYPES)[number];

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
};

export default function AdminFeedback() {
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [selected, setSelected] = useState<FeedbackRow | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-feedback', page, statusFilter, typeFilter],
    queryFn: async () => {
      let query = supabase
        .from('feedback')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') query = query.eq('status', statusFilter);
      if (typeFilter !== 'all') query = query.eq('type', typeFilter);

      const from = page * PAGE_SIZE;
      query = query.range(from, from + PAGE_SIZE - 1);

      const { data: rows, error, count } = await query;
      if (error) throw error;

      // Resolve emails
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
      }));

      return { items: enriched, total: count || 0 };
    },
    enabled: isAdmin,
    staleTime: 30_000,
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
      r.resolvedEmail?.toLowerCase().includes(q) || r.message.toLowerCase().includes(q)
    );
  }, [data?.items, search]);

  const totalPages = Math.ceil((data?.total || 0) / PAGE_SIZE);

  if (adminLoading) return null;
  if (!isAdmin) { navigate('/app'); return null; }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const openDetail = (item: FeedbackRow) => {
    setSelected(item);
    setAdminNotes(item.admin_notes || '');
  };

  const statusCounts = data?.items ? {
    all: data.total,
    new: data.items.filter(i => i.status === 'new').length,
    reviewed: data.items.filter(i => i.status === 'reviewed').length,
    planned: data.items.filter(i => i.status === 'planned').length,
    done: data.items.filter(i => i.status === 'done').length,
  } : {};

  return (
    <div className="space-y-6">
      <PageHeader title="User Feedback" subtitle="Bugs, feature requests, and general feedback">{null}</PageHeader>

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
              {s}{statusFilter === 'all' && s !== 'all' && statusCounts[s] ? ` (${statusCounts[s]})` : ''}
              {s === 'all' && data?.total ? ` (${data.total})` : ''}
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
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by email or message..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Table */}
      <div className="border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead className="w-24">Type</TableHead>
              <TableHead className="hidden sm:table-cell">Message</TableHead>
              <TableHead className="hidden md:table-cell w-28">Page</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="hidden sm:table-cell w-28">Date</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}><div className="h-5 bg-muted animate-pulse rounded" /></TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                  No feedback found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(item => (
                <TableRow key={item.id} className="cursor-pointer" onClick={() => openDetail(item)}>
                  <TableCell>
                    <span className="text-sm font-medium">{item.resolvedEmail}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('capitalize text-[11px]', typeColors[item.type] || typeColors.general)}>
                      {item.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-sm text-muted-foreground line-clamp-2">
                      {item.message.slice(0, 200)}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {item.page_url && (
                      <span className="text-xs text-muted-foreground font-mono">
                        {item.page_url.replace(/https?:\/\/[^/]+/, '').replace('/app', '') || '/'}
                      </span>
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Badge variant="outline" className={cn('capitalize text-[11px]', typeColors[selected?.type || 'general'])}>
                {selected?.type}
              </Badge>
              <span className="truncate text-sm">{selected?.resolvedEmail}</span>
            </DialogTitle>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{selected && formatDate(selected.created_at)}</span>
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

          <div className="bg-muted/50 rounded-lg p-4 text-sm whitespace-pre-wrap max-h-[200px] overflow-y-auto">
            {selected?.message}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Admin Notes</label>
            <Textarea
              value={adminNotes}
              onChange={e => setAdminNotes(e.target.value)}
              placeholder="Add notes..."
              rows={3}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => selected && updateNotesMutation.mutate({ id: selected.id, admin_notes: adminNotes })}
              disabled={updateNotesMutation.isPending}
            >
              Save Notes
            </Button>
          </div>

          <div className="flex justify-between pt-2 border-t border-border">
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
