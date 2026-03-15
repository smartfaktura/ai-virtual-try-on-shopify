import { useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { LibraryItem } from '@/components/app/LibraryImageCard';
import { toSignedUrls } from '@/lib/signedUrl';

export type LibrarySortBy = 'newest' | 'oldest';

const PAGE_SIZE = 20;
const JOB_FETCH_LIMIT = 60;
const FS_FETCH_LIMIT = PAGE_SIZE;

type Cursor = { jobCursor?: string; fsCursor?: string; jobsDone?: boolean; fsDone?: boolean };

export function useLibraryItems(sortBy: LibrarySortBy, searchQuery: string) {
  const { user } = useAuth();
  const ascending = sortBy === 'oldest';

  return useInfiniteQuery({
    queryKey: ['library', sortBy, searchQuery, user?.id],
    queryFn: async ({ pageParam }): Promise<{ items: LibraryItem[]; nextCursor: Cursor | null }> => {
      try {
        const cursor = pageParam as Cursor;
        const q = searchQuery.toLowerCase();

        // Build jobs query
        let jobsQuery = supabase
          .from('generation_jobs')
          .select('id, results, created_at, status, ratio, quality, prompt_final, workflows(name), user_products(title)')
          .order('created_at', { ascending })
          .limit(JOB_FETCH_LIMIT);

        if (cursor.jobCursor) {
          jobsQuery = ascending
            ? jobsQuery.gt('created_at', cursor.jobCursor)
            : jobsQuery.lt('created_at', cursor.jobCursor);
        }

        // Build freestyle query
        let fsQuery = supabase
          .from('freestyle_generations')
          .select('id, image_url, prompt, aspect_ratio, quality, created_at')
          .order('created_at', { ascending })
          .limit(FS_FETCH_LIMIT);

        if (cursor.fsCursor) {
          fsQuery = ascending
            ? fsQuery.gt('created_at', cursor.fsCursor)
            : fsQuery.lt('created_at', cursor.fsCursor);
        }

        const skipJobs = !!cursor.jobsDone;
        const skipFs = !!cursor.fsDone;

        const [jobsResult, freestyleResult] = await Promise.all([
          skipJobs ? Promise.resolve({ data: [], error: null }) : jobsQuery,
          skipFs ? Promise.resolve({ data: [], error: null }) : fsQuery,
        ]);

        if (jobsResult.error) throw jobsResult.error;
        if (freestyleResult.error) throw freestyleResult.error;

        const jobsData = jobsResult.data ?? [];
        const fsData = freestyleResult.data ?? [];

        // Track whether each source is exhausted
        const jobsExhausted = skipJobs || jobsData.length < JOB_FETCH_LIMIT;
        const fsExhausted = skipFs || fsData.length < FS_FETCH_LIMIT;

        // Collect raw items
        const rawItems: { item: Omit<LibraryItem, 'imageUrl'>; url: string; sourceCreatedAt: string; source: 'job' | 'fs' }[] = [];

        for (const job of jobsData) {
          const results = job.results as any;
          if (!Array.isArray(results)) continue;
          for (let i = 0; i < results.length; i++) {
            const r = results[i];
            const url = typeof r === 'string' ? r : r?.url || r?.image_url;
            if (!url || url.startsWith('data:')) continue;

            const workflowName = (job.workflows as any)?.name || '';
            const productTitle = (job.user_products as any)?.title || '';
            const label = workflowName || productTitle || 'Generated';
            const promptText = job.prompt_final || '';

            if (q && !label.toLowerCase().includes(q) &&
                !promptText.toLowerCase().includes(q) &&
                !productTitle.toLowerCase().includes(q)) continue;

            rawItems.push({
              url,
              sourceCreatedAt: job.created_at,
              source: 'job',
              item: {
                id: `${job.id}-${i}`,
                source: 'generation',
                label,
                prompt: job.prompt_final || undefined,
                date: new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                createdAt: job.created_at,
                status: job.status,
                aspectRatio: job.ratio,
                quality: job.quality,
              },
            });
          }
        }

        for (const f of fsData) {
          if (q && !f.prompt.toLowerCase().includes(q)) continue;

          rawItems.push({
            url: f.image_url,
            sourceCreatedAt: f.created_at,
            source: 'fs',
            item: {
              id: f.id,
              source: 'freestyle',
              label: 'Freestyle',
              prompt: f.prompt,
              date: new Date(f.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              createdAt: f.created_at,
              status: 'completed',
              aspectRatio: f.aspect_ratio,
              quality: f.quality,
            },
          });
        }

        // Sort merged results
        rawItems.sort((a, b) => {
          const diff = new Date(b.item.createdAt).getTime() - new Date(a.item.createdAt).getTime();
          return ascending ? -diff : diff;
        });

        // Trim to PAGE_SIZE
        const trimmed = rawItems.slice(0, PAGE_SIZE);

        // Sign all URLs in parallel
        const signedUrls = await toSignedUrls(trimmed.map(r => r.url));
        const items: LibraryItem[] = trimmed.map((r, i) => ({
          ...r.item,
          imageUrl: signedUrls[i],
        } as LibraryItem));

        // Compute next cursor from the LAST item of each source that made it into trimmed
        // We need the last created_at from each source in the raw fetched data (not trimmed)
        // to know where to continue fetching from
        let lastJobCreatedAt = cursor.jobCursor;
        let lastFsCreatedAt = cursor.fsCursor;

        // Use the last fetched row's created_at from each source as the cursor
        if (jobsData.length > 0) {
          lastJobCreatedAt = jobsData[jobsData.length - 1].created_at;
        }
        if (fsData.length > 0) {
          lastFsCreatedAt = fsData[fsData.length - 1].created_at;
        }

        // But we need to be smarter: only advance the cursor for a source
        // if all its items were consumed (appeared in trimmed).
        // If trimmed cut off items from a source, we should NOT advance that source's cursor
        // past what was actually used.
        
        // Find the "boundary" timestamp of the last trimmed item
        const lastTrimmedTime = trimmed.length > 0 ? trimmed[trimmed.length - 1].item.createdAt : null;
        
        // For each source, find the last item that was included in trimmed
        const lastUsedJob = [...trimmed].reverse().find(r => r.source === 'job');
        const lastUsedFs = [...trimmed].reverse().find(r => r.source === 'fs');

        // Use the last USED item as cursor (not last fetched) to avoid skipping
        const nextJobCursor = lastUsedJob?.sourceCreatedAt ?? lastJobCreatedAt;
        const nextFsCursor = lastUsedFs?.sourceCreatedAt ?? lastFsCreatedAt;

        const hasMore = !jobsExhausted || !fsExhausted || rawItems.length > PAGE_SIZE;

        const nextCursor: Cursor | null = hasMore
          ? {
              jobCursor: nextJobCursor,
              fsCursor: nextFsCursor,
              jobsDone: jobsExhausted && !rawItems.slice(PAGE_SIZE).some(r => r.source === 'job'),
              fsDone: fsExhausted && !rawItems.slice(PAGE_SIZE).some(r => r.source === 'fs'),
            }
          : null;

        return { items, nextCursor };
      } catch (err) {
        console.error('[Library] Query failed:', err);
        throw err;
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: {} as Cursor,
    enabled: !!user,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
}
