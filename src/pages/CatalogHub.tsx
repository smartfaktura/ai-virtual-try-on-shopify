import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/app/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ImageLightbox } from '@/components/app/ImageLightbox';
import { saveOrShareImage } from '@/lib/mobileImageSave';
import { Plus, Camera, Image, Clock, CheckCircle, AlertTriangle, ArrowRight, Sparkles, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface CatalogJob {
  id: string;
  results: unknown;
  created_at: string;
  product_name: string | null;
  status: string;
  scene_name: string | null;
  workflow_slug: string | null;
}

interface CatalogSession {
  key: string;
  jobs: CatalogJob[];
  images: string[];
  productNames: string[];
  totalImages: number;
  completedCount: number;
  failedCount: number;
  created_at: string;
  allDone: boolean;
}

function groupIntoSessions(jobs: CatalogJob[]): CatalogSession[] {
  if (jobs.length === 0) return [];

  const sorted = [...jobs].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const sessions: CatalogSession[] = [];
  const used = new Set<string>();

  for (let i = 0; i < sorted.length; i++) {
    if (used.has(sorted[i].id)) continue;
    const anchor = sorted[i];
    const anchorTime = new Date(anchor.created_at).getTime();
    const batch: CatalogJob[] = [anchor];
    used.add(anchor.id);

    for (let j = i + 1; j < sorted.length; j++) {
      if (used.has(sorted[j].id)) continue;
      const candidate = sorted[j];
      const candidateTime = new Date(candidate.created_at).getTime();
      if (Math.abs(candidateTime - anchorTime) <= 30_000) {
        batch.push(candidate);
        used.add(candidate.id);
      }
    }

    const images: string[] = [];
    for (const job of batch) {
      if (job.results && Array.isArray(job.results)) {
        for (const r of job.results) {
          if (typeof r === 'string') images.push(r);
          else if (r && typeof r === 'object' && 'url' in (r as Record<string, unknown>)) {
            images.push((r as Record<string, string>).url);
          }
        }
      }
    }

    const productNames = [...new Set(batch.map(j => j.product_name).filter(Boolean))] as string[];
    const completedCount = batch.filter(j => j.status === 'completed').length;
    const failedCount = batch.filter(j => j.status === 'failed').length;

    sessions.push({
      key: `session-${anchor.id}`,
      jobs: batch,
      images,
      productNames,
      totalImages: images.length,
      completedCount,
      failedCount,
      created_at: anchor.created_at,
      allDone: batch.every(j => j.status === 'completed' || j.status === 'failed'),
    });
  }

  return sessions;
}

export default function CatalogHub() {
  const { user } = useAuth();
  const [selectedSession, setSelectedSession] = useState<CatalogSession | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const navigate = useNavigate();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['catalog-sessions', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('generation_jobs')
        .select('id, results, created_at, product_name, status, scene_name, workflow_slug')
        .eq('workflow_slug', 'catalog-studio')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as CatalogJob[];
    },
  });

  const sessions = useMemo(() => groupIntoSessions(jobs ?? []), [jobs]);

  // Check for active session in sessionStorage
  const hasActiveSession = useMemo(() => {
    try {
      const raw = sessionStorage.getItem('catalog_batch');
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return parsed && !parsed.allDone;
    } catch {
      return false;
    }
  }, []);

  return (
    <div className="space-y-6 pb-16">
      <PageHeader title="Catalog Studio" subtitle="AI-powered product photoshoots">
        <Button onClick={() => navigate('/app/catalog/new')} className="gap-2 rounded-full">
          <Plus className="w-4 h-4" /> New Photoshoot
        </Button>
      </PageHeader>

      {/* Active generation banner */}
      {hasActiveSession && (
        <button
          onClick={() => navigate('/app/catalog/new')}
          className="w-full rounded-2xl border border-primary/20 bg-primary/[0.04] p-4 flex items-center gap-4 hover:bg-primary/[0.07] transition-colors group"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Camera className="w-5 h-5 text-primary" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary animate-pulse" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold">Generation in progress</p>
            <p className="text-xs text-muted-foreground">Click to view progress</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>
      )}

      {/* Sessions list */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl border border-border bg-card p-4 space-y-3">
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3].map(j => (
                  <Skeleton key={j} className="aspect-[3/4] rounded-lg" />
                ))}
              </div>
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      ) : sessions.length === 0 ? (
        /* Empty state */
        <div className="rounded-2xl border border-border bg-card p-12 text-center space-y-5">
          <div className="w-20 h-20 rounded-full bg-primary/[0.06] flex items-center justify-center mx-auto">
            <Sparkles className="w-10 h-10 text-primary/40" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight">No catalog shoots yet</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Create your first AI photoshoot — select products, choose models & backgrounds, and generate stunning catalog images in minutes.
            </p>
          </div>
          <Button onClick={() => navigate('/app/catalog/new')} size="lg" className="gap-2 rounded-full">
            <Camera className="w-4 h-4" /> Start First Photoshoot
          </Button>
          <p className="text-[10px] text-muted-foreground/40 tracking-[0.2em] uppercase font-light">VOVV.AI Studio</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Recent Shoots</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessions.map(session => (
              <SessionCard key={session.key} session={session} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SessionCard({ session }: { session: CatalogSession }) {
  const navigate = useNavigate();
  const thumbs = session.images.slice(0, 4);
  const hasImages = thumbs.length > 0;

  return (
    <button
      onClick={() => navigate('/app/library')}
      className={cn(
        'w-full rounded-2xl border border-border bg-card p-4 text-left transition-all duration-200',
        'hover:shadow-lg hover:shadow-primary/[0.04] hover:border-primary/20 hover:-translate-y-0.5',
        'group'
      )}
    >
      <div className="flex gap-4">
        {/* Thumbnail grid */}
        <div className="flex-shrink-0">
          {hasImages ? (
            <div className="grid grid-cols-2 gap-1.5 w-[100px]">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                  {thumbs[i] ? (
                    <ShimmerImage
                      src={thumbs[i]}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted/50" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="w-[100px] aspect-square rounded-xl bg-muted/50 flex items-center justify-center">
              <Camera className="w-8 h-8 text-muted-foreground/30" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-2.5">
          {/* Product pills */}
          <div className="flex flex-wrap gap-1.5">
            {session.productNames.slice(0, 3).map(name => (
              <Badge key={name} variant="secondary" className="text-[11px] font-medium truncate max-w-[140px]">
                {name}
              </Badge>
            ))}
            {session.productNames.length > 3 && (
              <Badge variant="outline" className="text-[11px]">+{session.productNames.length - 3}</Badge>
            )}
            {session.productNames.length === 0 && (
              <Badge variant="secondary" className="text-[11px] text-muted-foreground">Catalog</Badge>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {session.totalImages > 0 && (
              <span className="flex items-center gap-1">
                <Image className="w-3 h-3" /> {session.totalImages} image{session.totalImages !== 1 ? 's' : ''}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {format(new Date(session.created_at), 'MMM d, yyyy')}
            </span>
          </div>

          {/* Status badge */}
          <div>
            {session.allDone && session.failedCount === 0 && session.completedCount > 0 ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary">
                <CheckCircle className="w-3 h-3" /> Completed
              </span>
            ) : session.allDone && session.failedCount > 0 && session.completedCount > 0 ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-yellow-500">
                <AlertTriangle className="w-3 h-3" /> Partial ({session.completedCount}/{session.jobs.length})
              </span>
            ) : session.allDone && session.completedCount === 0 ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-destructive">
                <AlertTriangle className="w-3 h-3" /> Failed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                <Clock className="w-3 h-3" /> Processing
              </span>
            )}
          </div>
        </div>

        {/* Arrow */}
        <div className="flex-shrink-0 flex items-center">
          <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-foreground/60 transition-colors" />
        </div>
      </div>
    </button>
  );
}
