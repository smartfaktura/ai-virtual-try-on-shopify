import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Eye, Clock, Sparkles, Wand2, CreditCard, Images } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { getLandingAssetUrl } from '@/lib/landingAssets';
import { toSignedUrls } from '@/lib/signedUrl';
import { LibraryDetailModal } from '@/components/app/LibraryDetailModal';
import { EmptyStateCard } from '@/components/app/EmptyStateCard';
import { PageHeader } from '@/components/app/PageHeader';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import type { LibraryItem } from '@/components/app/LibraryImageCard';

const teamAvatar = (file: string) => getOptimizedUrl(getLandingAssetUrl(`team/${file}`), { quality: 50 });

const WORKFLOW_AVATARS = [
  { file: 'avatar-sophia.jpg', name: 'Sophia' },
  { file: 'avatar-max.jpg', name: 'Max' },
  { file: 'avatar-sienna.jpg', name: 'Sienna' },
];

const FREESTYLE_AVATARS = [
  { file: 'avatar-yuki.jpg', name: 'Yuki' },
  { file: 'avatar-luna.jpg', name: 'Luna' },
  { file: 'avatar-amara.jpg', name: 'Amara' },
  { file: 'avatar-kenji.jpg', name: 'Kenji' },
];

function pickAvatar(id: string, pool: typeof WORKFLOW_AVATARS) {
  const hash = id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return pool[hash % pool.length];
}

interface HistoryJob {
  id: string;
  source: 'generation' | 'freestyle';
  label: string;
  subtitle?: string;
  imageCount: number;
  creditsUsed: number;
  status: string;
  rawDate: string;
  relativeTime: string;
  thumbnailUrls: string[];
  avatarSrc: string;
  avatarName: string;
  // For opening detail modal
  libraryItems: LibraryItem[];
}

const PAGE_SIZE = 30;

function useHistoryJobs(source: 'all' | 'generation' | 'freestyle') {
  const { user } = useAuth();
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ['history-jobs', user?.id, source],
    queryFn: async () => {
      const jobs: HistoryJob[] = [];
      const limit = 200;
      const fetchJobs = source !== 'freestyle';
      const fetchFreestyle = source !== 'generation';
      const promises: Promise<void>[] = [];
      const allImageUrls: string[] = [];
      const urlIndexMap: { jobIdx: number; imgIdx: number }[] = [];

      if (fetchJobs) {
        promises.push(
          (async () => {
            const { data, error } = await supabase
              .from('generation_jobs')
              .select('id, results, created_at, workflow_slug, scene_name, model_name, product_name, product_image_url, prompt_final, ratio, quality, credits_used, requested_count, status')
              .order('created_at', { ascending: false })
              .limit(limit);
            if (error || !data) return;

            for (const job of data) {
              const results = job.results as any;
              const images: string[] = [];
              if (Array.isArray(results)) {
                for (const r of results) {
                  const url = typeof r === 'string' ? r : r?.url || r?.image_url;
                  if (url) images.push(url);
                }
              }

              const isTryOn = images.some(u => u.includes('tryon-images'));
              const label = isTryOn ? 'Virtual Try-On' : (job.workflow_slug || 'Product Shot');
              const avatar = pickAvatar(job.id, WORKFLOW_AVATARS);

              const jobIdx = jobs.length;
              const thumbs = images.slice(0, 4);
              thumbs.forEach((url, imgIdx) => {
                allImageUrls.push(url);
                urlIndexMap.push({ jobIdx, imgIdx });
              });

              const libraryItems: LibraryItem[] = images.map((url, i) => ({
                id: `${job.id}-${i}`,
                imageUrl: url,
                source: 'generation' as const,
                label,
                prompt: job.prompt_final || undefined,
                date: new Date(job.created_at).toLocaleDateString(),
                createdAt: job.created_at,
                aspectRatio: job.ratio,
                quality: job.quality,
                sceneName: job.scene_name || undefined,
                modelName: job.model_name || undefined,
                productName: job.product_name || undefined,
                workflowSlug: job.workflow_slug || undefined,
              }));

              jobs.push({
                id: job.id,
                source: 'generation',
                label,
                subtitle: job.product_name || job.scene_name || undefined,
                imageCount: images.length,
                creditsUsed: job.credits_used || 0,
                status: job.status || 'completed',
                rawDate: job.created_at,
                relativeTime: formatDistanceToNow(new Date(job.created_at), { addSuffix: true }),
                thumbnailUrls: thumbs,
                avatarSrc: teamAvatar(avatar.file),
                avatarName: avatar.name,
                libraryItems,
              });
            }
          })()
        );
      }

      if (fetchFreestyle) {
        promises.push(
          (async () => {
            const { data, error } = await supabase
              .from('freestyle_generations')
              .select('id, image_url, prompt, quality, aspect_ratio, created_at, provider_used')
              .order('created_at', { ascending: false })
              .limit(limit);
            if (error || !data) return;

            for (const f of data) {
              const isUpscaled = f.quality?.startsWith('upscaled_');
              const resolution = f.quality?.includes('4k') ? '4K' : '2K';
              const avatar = pickAvatar(f.id, FREESTYLE_AVATARS);
              const jobIdx = jobs.length;

              allImageUrls.push(f.image_url);
              urlIndexMap.push({ jobIdx, imgIdx: 0 });

              jobs.push({
                id: f.id,
                source: 'freestyle',
                label: isUpscaled ? 'Enhanced' : 'Freestyle',
                subtitle: isUpscaled ? `${resolution} Upscale` : undefined,
                imageCount: 1,
                creditsUsed: isUpscaled ? 3 : 1,
                status: 'completed',
                rawDate: f.created_at,
                relativeTime: formatDistanceToNow(new Date(f.created_at), { addSuffix: true }),
                thumbnailUrls: [f.image_url],
                avatarSrc: teamAvatar(avatar.file),
                avatarName: avatar.name,
                libraryItems: [{
                  id: f.id,
                  imageUrl: f.image_url,
                  source: 'freestyle' as const,
                  label: isUpscaled ? 'Enhanced' : 'Freestyle',
                  prompt: f.prompt,
                  date: new Date(f.created_at).toLocaleDateString(),
                  createdAt: f.created_at,
                  aspectRatio: f.aspect_ratio,
                  quality: f.quality,
                  providerUsed: (f as any).provider_used || null,
                }],
              });
            }
          })()
        );
      }

      await Promise.all(promises);
      jobs.sort((a, b) => b.rawDate.localeCompare(a.rawDate));

      // Sign all thumbnail URLs
      if (allImageUrls.length > 0) {
        const signed = await toSignedUrls(allImageUrls);
        for (let i = 0; i < signed.length; i++) {
          const { jobIdx, imgIdx } = urlIndexMap[i];
          if (jobs[jobIdx]) {
            jobs[jobIdx].thumbnailUrls[imgIdx] = signed[i];
            // Also update corresponding library item
            if (jobs[jobIdx].libraryItems[imgIdx]) {
              jobs[jobIdx].libraryItems[imgIdx].imageUrl = signed[i];
            }
          }
        }
      }

      return jobs;
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });

  const jobs = query.data ?? [];
  const visibleJobs = jobs.slice(0, page * PAGE_SIZE);
  const hasMore = visibleJobs.length < jobs.length;

  return {
    jobs: visibleJobs,
    allCount: jobs.length,
    isLoading: query.isLoading,
    hasMore,
    loadMore: () => setPage(p => p + 1),
  };
}

function statusColor(status: string) {
  switch (status) {
    case 'completed': return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
    case 'generating': return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 animate-pulse';
    case 'failed': return 'bg-destructive/10 text-destructive';
    default: return 'bg-muted text-muted-foreground';
  }
}

function HistoryJobList({ jobs, isLoading, hasMore, loadMore, allCount }: {
  jobs: HistoryJob[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  allCount: number;
}) {
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState<LibraryItem[] | null>(null);

  const openJob = useCallback((job: HistoryJob) => {
    if (job.libraryItems.length > 0) {
      setSelectedItems(job.libraryItems);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <EmptyStateCard
        heading="No creations yet"
        description="Start creating visuals and your completed jobs will appear here."
        action={{ content: 'Create Visuals', onAction: () => navigate('/app/workflows') }}
        icon={<Clock className="w-8 h-8 text-muted-foreground" />}
      />
    );
  }

  return (
    <>
      <div className="space-y-2">
        {jobs.map((job) => (
          <div
            key={job.id}
            onClick={() => openJob(job)}
            className="group flex items-center gap-4 p-3 rounded-xl border border-border bg-card hover:bg-accent/50 cursor-pointer transition-colors duration-150"
          >
            {/* Avatar */}
            <Avatar className="h-9 w-9 shrink-0 border border-border">
              <AvatarImage src={job.avatarSrc} alt={job.avatarName} />
              <AvatarFallback className="text-xs">{job.avatarName[0]}</AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-foreground truncate">{job.label}</span>
                <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${statusColor(job.status)}`}>
                  {job.status === 'completed' ? 'Completed' : job.status}
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                {job.subtitle && <span className="truncate max-w-[160px]">{job.subtitle}</span>}
                <span className="flex items-center gap-1">
                  <Images className="w-3 h-3" />
                  {job.imageCount} {job.imageCount === 1 ? 'image' : 'images'}
                </span>
                <span className="flex items-center gap-1">
                  <CreditCard className="w-3 h-3" />
                  {job.creditsUsed} cr
                </span>
                <span className="hidden sm:inline">{job.relativeTime}</span>
              </div>
            </div>

            {/* Thumbnail strip */}
            <div className="hidden md:flex items-center gap-1.5 shrink-0">
              {job.thumbnailUrls.slice(0, 3).map((url, i) => (
                <div key={i} className="w-12 h-12 rounded-lg overflow-hidden border border-border bg-muted">
                  <ShimmerImage
                    src={getOptimizedUrl(url, { quality: 40 })}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                    aspectRatio="1/1"
                    onError={(e: any) => { e.currentTarget.src = '/placeholder.svg'; }}
                  />
                </div>
              ))}
              {job.imageCount > 3 && (
                <div className="w-12 h-12 rounded-lg border border-border bg-muted flex items-center justify-center">
                  <span className="text-[10px] font-semibold text-muted-foreground">+{job.imageCount - 3}</span>
                </div>
              )}
            </div>

            {/* View action */}
            <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <Eye className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={loadMore} className="rounded-full px-8">
            Load More
          </Button>
        </div>
      )}

      <LibraryDetailModal
        item={selectedItems?.[0] ?? null}
        open={!!selectedItems}
        onClose={() => setSelectedItems(null)}
        items={selectedItems ?? undefined}
      />
    </>
  );
}

export default function History() {
  const [tab, setTab] = useState<'all' | 'generation' | 'freestyle'>('all');
  const { jobs, isLoading, hasMore, loadMore, allCount } = useHistoryJobs(tab);

  return (
    <PageHeader
      title="History"
      subtitle="Browse all your completed generation jobs in one place."
    >
      <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all" className="gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            All
            {!isLoading && allCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">{allCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="generation" className="gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="freestyle" className="gap-1.5">
            <Wand2 className="w-3.5 h-3.5" />
            Freestyle
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-0">
          <HistoryJobList
            jobs={jobs}
            isLoading={isLoading}
            hasMore={hasMore}
            loadMore={loadMore}
            allCount={allCount}
          />
        </TabsContent>
      </Tabs>
    </PageHeader>
  );
}
