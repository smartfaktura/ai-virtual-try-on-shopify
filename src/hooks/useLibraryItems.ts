import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { LibraryItem } from '@/components/app/LibraryImageCard';

export type LibraryTab = 'all' | 'generations' | 'freestyle';
export type LibrarySortBy = 'newest' | 'oldest';

export function useLibraryItems(tab: LibraryTab, sortBy: LibrarySortBy, searchQuery: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['library', tab, sortBy, searchQuery, user?.id],
    queryFn: async (): Promise<LibraryItem[]> => {
      const items: LibraryItem[] = [];

      // Fetch generation jobs
      if (tab === 'all' || tab === 'generations') {
        const { data: jobs, error: jobsError } = await supabase
          .from('generation_jobs')
          .select('id, results, created_at, status, ratio, quality, prompt_final, workflows(name), user_products(title)')
          .order('created_at', { ascending: sortBy === 'oldest' })
          .limit(100);

        if (jobsError) throw jobsError;

        for (const job of jobs ?? []) {
          const results = job.results as any;
          if (Array.isArray(results)) {
            for (let i = 0; i < results.length; i++) {
              const r = results[i];
              const url = typeof r === 'string' ? r : r?.url || r?.image_url;
              if (!url) continue;

              const label = (job.workflows as any)?.name || (job.user_products as any)?.title || 'Generated';
              if (searchQuery && !label.toLowerCase().includes(searchQuery.toLowerCase()) &&
                  !(job.prompt_final || '').toLowerCase().includes(searchQuery.toLowerCase())) continue;

              items.push({
                id: `${job.id}-${i}`,
                imageUrl: url,
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
      }

      // Fetch freestyle generations
      if (tab === 'all' || tab === 'freestyle') {
        const { data: freestyle, error: freestyleError } = await supabase
          .from('freestyle_generations')
          .select('id, image_url, prompt, aspect_ratio, quality, created_at')
          .order('created_at', { ascending: sortBy === 'oldest' })
          .limit(100);

        if (freestyleError) throw freestyleError;

        for (const f of freestyle ?? []) {
          if (searchQuery && !f.prompt.toLowerCase().includes(searchQuery.toLowerCase())) continue;

          items.push({
            id: f.id,
            imageUrl: f.image_url,
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
      }

      // Sort merged results
      items.sort((a, b) => {
        const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return sortBy === 'oldest' ? -diff : diff;
      });

      return items;
    },
    enabled: !!user,
  });
}
