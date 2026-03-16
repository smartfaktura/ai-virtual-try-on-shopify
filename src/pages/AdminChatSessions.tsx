import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/app/PageHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableHead, TableRow, TableCell, TableBody } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Trash2, ChevronLeft, ChevronRight, MessageCircle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const PAGE_SIZE = 20;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface ChatSession {
  id: string;
  user_id: string;
  messages: ChatMessage[];
  page_url: string | null;
  created_at: string;
  updated_at: string;
  email?: string;
}

export default function AdminChatSessions() {
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);

  // Fetch sessions with count
  const { data, isLoading } = useQuery({
    queryKey: ['admin-chat-sessions', page],
    queryFn: async () => {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data: sessions, error, count } = await supabase
        .from('chat_sessions')
        .select('*', { count: 'exact' })
        .order('updated_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      // Resolve emails
      const userIds = [...new Set((sessions || []).map(s => s.user_id))];
      let emailMap: Record<string, string> = {};

      if (userIds.length > 0) {
        const { data: emails } = await supabase.rpc('get_user_emails_for_admin', {
          p_user_ids: userIds,
        });
        if (emails) {
          emailMap = Object.fromEntries(emails.map((e: { user_id: string; email: string }) => [e.user_id, e.email]));
        }
      }

      const enriched: ChatSession[] = (sessions || []).map(s => ({
        ...s,
        messages: (Array.isArray(s.messages) ? s.messages : []) as unknown as ChatMessage[],
        email: emailMap[s.user_id] || s.user_id,
      }));

      return { sessions: enriched, total: count || 0 };
    },
    enabled: isAdmin,
    staleTime: 30_000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('chat_sessions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-chat-sessions'] });
      toast.success('Session deleted');
      setSelectedSession(null);
    },
  });

  // Client-side email filter
  const filtered = useMemo(() => {
    if (!data?.sessions) return [];
    if (!search.trim()) return data.sessions;
    const q = search.toLowerCase();
    return data.sessions.filter(s => s.email?.toLowerCase().includes(q));
  }, [data?.sessions, search]);

  const totalPages = Math.ceil((data?.total || 0) / PAGE_SIZE);

  if (adminLoading) return null;
  if (!isAdmin) {
    navigate('/app');
    return null;
  }

  const getLastUserMessage = (messages: ChatMessage[]) => {
    const userMsgs = messages.filter(m => m.role === 'user');
    const last = userMsgs[userMsgs.length - 1];
    return last?.content?.slice(0, 100) || '—';
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Chat Sessions" subtitle="View all user chat conversations" />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Filter by email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead className="hidden sm:table-cell">Last Message</TableHead>
              <TableHead className="hidden md:table-cell">Page</TableHead>
              <TableHead className="w-20">Msgs</TableHead>
              <TableHead className="hidden sm:table-cell">Updated</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}><div className="h-5 bg-muted animate-pulse rounded" /></TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                  No chat sessions found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(session => (
                <TableRow
                  key={session.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedSession(session)}
                >
                  <TableCell>
                    <span className="text-sm font-medium">{session.email}</span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-sm text-muted-foreground line-clamp-1 max-w-[200px]">
                      {getLastUserMessage(session.messages)}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {session.page_url && (
                      <span className="text-xs text-muted-foreground font-mono">
                        {session.page_url.replace('/app', '')}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageCircle className="w-3 h-3" />
                      {session.messages.length}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                    {formatDate(session.updated_at)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={e => {
                        e.stopPropagation();
                        deleteMutation.mutate(session.id);
                      }}
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
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages} ({data?.total} total)
          </span>
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

      {/* Message Detail Modal */}
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="truncate text-sm">{selectedSession?.email}</span>
              {selectedSession?.page_url && (
                <span className="text-xs text-muted-foreground font-mono ml-2 flex-shrink-0">
                  {selectedSession.page_url.replace('/app', '')}
                </span>
              )}
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              {selectedSession && formatDate(selectedSession.created_at)} · {selectedSession?.messages.length} messages
            </p>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-3 py-4 min-h-0">
            {selectedSession?.messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  'flex',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap',
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted text-foreground rounded-bl-md'
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2 border-t border-border">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => selectedSession && deleteMutation.mutate(selectedSession.id)}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete Session
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
