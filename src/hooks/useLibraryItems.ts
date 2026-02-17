import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { LibraryItem } from '@/components/app/LibraryImageCard';
import { toSignedUrl } from '@/lib/signedUrl';

export type LibrarySortBy = 'newest' | 'oldest';

export function useLibraryItems(sortBy: LibrarySortBy, searchQuery: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['library', sortBy, searchQuery, user?.id],
    queryFn: async (): Promise<LibraryItem[]> => {
      try {
      const items: LibraryItem[] = [];
      const q = searchQuery.toLowerCase();

      // Fetch both tables in parallel for speed
      const [jobsResult, freestyleResult] = await Promise.all([
        supabase
          .from('generation_jobs')
          .select('id, results, created_at, status, ratio, quality, prompt_final, workflows(name), user_products(title)')
          .order('created_at', { ascending: sortBy === 'oldest' })
          .limit(100),
        supabase
          .from('freestyle_generations')
          .select('id, image_url, prompt, aspect_ratio, quality, created_at')
          .order('created_at', { ascending: sortBy === 'oldest' })
          .limit(100),
      ]);

      if (jobsResult.error) throw jobsResult.error;
      if (freestyleResult.error) throw freestyleResult.error;

      // Process generation jobs
      for (const job of jobsResult.data ?? []) {
        const results = job.results as any;
        if (Array.isArray(results)) {
          for (let i = 0; i < results.length; i++) {
            const r = results[i];
            const url = typeof r === 'string' ? r : r?.url || r?.image_url;
            if (!url) continue;

            const workflowName = (job.workflows as any)?.name || '';
            const productTitle = (job.user_products as any)?.title || '';
            const label = workflowName || productTitle || 'Generated';
            const promptText = job.prompt_final || '';

            if (q && !label.toLowerCase().includes(q) &&
                !promptText.toLowerCase().includes(q) &&
                !productTitle.toLowerCase().includes(q)) continue;

            const signedUrl = await toSignedUrl(url);
            items.push({
              id: `${job.id}-${i}`,
              imageUrl: signedUrl,
              source: 'generation',
              label,
              prompt: job.prompt_final || undefined,
              date: new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              createdAt: job.created_at,
              status: job.status,
              aspectRatio: job.ratio,
              quality: job.quality,
            });
          }
        }
      }

      // Process freestyle generations
      for (const f of freestyleResult.data ?? []) {
        if (q && !f.prompt.toLowerCase().includes(q)) continue;

        const signedFreestyleUrl = await toSignedUrl(f.image_url);
        items.push({
          id: f.id,
          imageUrl: signedFreestyleUrl,
          source: 'freestyle',
          label: 'Freestyle',
          prompt: f.prompt,
          date: new Date(f.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          createdAt: f.created_at,
          status: 'completed',
          aspectRatio: f.aspect_ratio,
          quality: f.quality,
        });
      }

      // Sort merged results
      items.sort((a, b) => {
        const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return sortBy === 'oldest' ? -diff : diff;
      });

      return items;
      } catch (err) {
        console.error('[Library] Query failed:', err);
        throw err;
      }
    },
    enabled: !!user,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });
}
