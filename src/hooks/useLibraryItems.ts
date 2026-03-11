import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { LibraryItem } from '@/components/app/LibraryImageCard';
import { toSignedUrls } from '@/lib/signedUrl';

export type LibrarySortBy = 'newest' | 'oldest';

const PAGE_SIZE = 20;

export function useLibraryItems(sortBy: LibrarySortBy, searchQuery: string) {
  const { user } = useAuth();

  return useInfiniteQuery({
    queryKey: ['library', sortBy, searchQuery, user?.id],
    queryFn: async ({ pageParam = 0 }): Promise<{ items: LibraryItem[]; hasMore: boolean }> => {
      try {
        const items: LibraryItem[] = [];
        const q = searchQuery.toLowerCase();
        const from = pageParam * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const [jobsResult, freestyleResult] = await Promise.all([
          supabase
            .from('generation_jobs')
            .select('id, results, created_at, status, ratio, quality, prompt_final, workflows(name), user_products(title)')
            .order('created_at', { ascending: sortBy === 'oldest' })
            .range(from, to),
          supabase
            .from('freestyle_generations')
            .select('id, image_url, prompt, aspect_ratio, quality, created_at')
            .order('created_at', { ascending: sortBy === 'oldest' })
            .range(from, to),
        ]);

        if (jobsResult.error) throw jobsResult.error;
        if (freestyleResult.error) throw freestyleResult.error;

        // Collect raw items (without signed URLs yet)
        const rawItems: { item: Omit<LibraryItem, 'imageUrl'>; url: string }[] = [];

        for (const job of jobsResult.data ?? []) {
          const results = job.results as any;
          if (Array.isArray(results)) {
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
        }

        for (const f of freestyleResult.data ?? []) {
          if (q && !f.prompt.toLowerCase().includes(q)) continue;

          rawItems.push({
            url: f.image_url,
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
          return sortBy === 'oldest' ? -diff : diff;
        });

        // Sign all URLs in parallel
        const signedUrls = await toSignedUrls(rawItems.map(r => r.url));

        for (let i = 0; i < rawItems.length; i++) {
          items.push({ ...rawItems[i].item, imageUrl: signedUrls[i] } as LibraryItem);
        }

        const totalFetched = (jobsResult.data?.length ?? 0) + (freestyleResult.data?.length ?? 0);
        return { items, hasMore: totalFetched >= PAGE_SIZE };
      } catch (err) {
        console.error('[Library] Query failed:', err);
        throw err;
      }
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length : undefined,
    initialPageParam: 0,
    enabled: !!user,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
}
