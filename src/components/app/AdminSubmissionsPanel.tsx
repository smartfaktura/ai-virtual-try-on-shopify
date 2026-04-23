import { useState } from 'react';
import { Check, X, Loader2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/brandedToast';
import { useQueryClient } from '@tanstack/react-query';
import {
  useAdminSubmissions,
  useApproveSubmission,
  useRejectSubmission,
  type DiscoverSubmission,
} from '@/hooks/useDiscoverSubmissions';

const STATUS_TABS = ['pending', 'approved', 'rejected'] as const;

export function AdminSubmissionsPanel() {
  const { submissions, isLoading } = useAdminSubmissions();
  const approveMutation = useApproveSubmission();
  const rejectMutation = useRejectSubmission();
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [classifying, setClassifying] = useState(false);
  const queryClient = useQueryClient();

  const handleAutoClassify = async () => {
    if (classifying) return;
    setClassifying(true);
    try {
      const { data: dry, error: dryErr } = await supabase.functions.invoke('backfill-discover-subcategories', { body: { dryRun: true } });
      if (dryErr) throw dryErr;
      const msg = `Will classify ${dry.classified} / ${dry.total} Explore items by scanning their existing prompt + tags. Continue?`;
      if (!confirm(msg)) return;
      const { data: real, error: realErr } = await supabase.functions.invoke('backfill-discover-subcategories', { body: { dryRun: false } });
      if (realErr) throw realErr;
      toast.success(`Classified ${real.committed} items`);
      queryClient.invalidateQueries({ queryKey: ['discover-presets'] });
    } catch (e: any) {
      toast.error(e?.message ?? 'Backfill failed');
    } finally {
      setClassifying(false);
    }
  };

  const filtered = submissions.filter(s => s.status === activeTab);
  const pendingCount = submissions.filter(s => s.status === 'pending').length;

  const handleReject = (id: string) => {
    rejectMutation.mutate(
      { id, note: rejectNote || undefined },
      {
        onSuccess: () => {
          setRejectingId(null);
          setRejectNote('');
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Title + admin actions */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-foreground">Community Submissions</h3>
          {pendingCount > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
              {pendingCount} pending
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleAutoClassify}
          disabled={classifying}
          title="Auto-tags untagged Explore items by scanning their existing prompt + tags. Admin-only maintenance tool — safe to re-run (only touches items with no sub-family yet)."
          className="px-3 py-1 rounded-full border border-border/60 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-border transition-colors disabled:opacity-50"
        >
          {classifying ? 'Classifying…' : 'Auto-classify sub-family'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5">
        {STATUS_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 rounded-full text-xs font-medium transition-all capitalize',
              activeTab === tab
                ? 'bg-foreground text-background'
                : 'bg-muted/40 text-muted-foreground hover:bg-muted/70',
            )}
          >
            {tab}
            {tab === 'pending' && pendingCount > 0 && (
              <span className="ml-1 opacity-70">· {pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground/60 py-8 text-center">No {activeTab} submissions</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(sub => (
            <SubmissionCard
              key={sub.id}
              submission={sub}
              onApprove={() => approveMutation.mutate(sub)}
              isApproving={approveMutation.isPending}
              onStartReject={() => setRejectingId(sub.id)}
              isRejectOpen={rejectingId === sub.id}
              rejectNote={rejectNote}
              onRejectNoteChange={setRejectNote}
              onConfirmReject={() => handleReject(sub.id)}
              onCancelReject={() => { setRejectingId(null); setRejectNote(''); }}
              isRejecting={rejectMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SubmissionCard({
  submission,
  onApprove,
  isApproving,
  onStartReject,
  isRejectOpen,
  rejectNote,
  onRejectNoteChange,
  onConfirmReject,
  onCancelReject,
  isRejecting,
}: {
  submission: DiscoverSubmission;
  onApprove: () => void;
  isApproving: boolean;
  onStartReject: () => void;
  isRejectOpen: boolean;
  rejectNote: string;
  onRejectNoteChange: (v: string) => void;
  onConfirmReject: () => void;
  onCancelReject: () => void;
  isRejecting: boolean;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
      <img
        src={getOptimizedUrl(submission.image_url, { quality: 60 })}
        alt={submission.title}
        className="w-full aspect-[3/4] object-cover"
      />
      <div className="p-4 space-y-3">
        <div>
          <h4 className="text-sm font-medium text-foreground truncate">{submission.title}</h4>
          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mt-0.5">
            {submission.category} · {submission.aspect_ratio}
          </p>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">{submission.prompt}</p>

        {submission.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {submission.tags.map(tag => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-muted/40 text-muted-foreground/70">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {submission.status === 'pending' && (
          <>
            {isRejectOpen ? (
              <div className="space-y-2">
                <textarea
                  value={rejectNote}
                  onChange={e => onRejectNoteChange(e.target.value)}
                  placeholder="Rejection reason (optional)..."
                  className="w-full text-xs rounded-lg border border-border/50 bg-muted/20 p-2 resize-none h-16 focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <div className="flex gap-2">
                  <Button size="sm" variant="destructive" onClick={onConfirmReject} disabled={isRejecting} className="flex-1 text-xs">
                    {isRejecting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Reject'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={onCancelReject} className="text-xs">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" onClick={onApprove} disabled={isApproving} className="flex-1 text-xs">
                  <Check className="w-3.5 h-3.5 mr-1" />
                  {isApproving ? 'Approving...' : 'Approve'}
                </Button>
                <Button size="sm" variant="outline" onClick={onStartReject} className="flex-1 text-xs">
                  <X className="w-3.5 h-3.5 mr-1" /> Reject
                </Button>
              </div>
            )}
          </>
        )}

        {submission.status === 'rejected' && submission.admin_note && (
          <p className="text-[10px] text-destructive/80 italic">Note: {submission.admin_note}</p>
        )}
      </div>
    </div>
  );
}
