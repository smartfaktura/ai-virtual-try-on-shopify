import { useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { LibraryItem } from '@/components/app/LibraryImageCard';
import { toSignedUrls } from '@/lib/signedUrl';
import { mockModels, mockTryOnPoses } from '@/data/mockData';

export type LibrarySortBy = 'newest' | 'oldest';

const PAGE_SIZE = 20;
const JOB_FETCH_LIMIT = 60;
const FS_FETCH_LIMIT = PAGE_SIZE;

type Cursor = { jobCursor?: string; fsCursor?: string; jobsDone?: boolean; fsDone?: boolean };

export type LibrarySourceFilter = 'all' | 'freestyle' | 'workflow';

export function useLibraryItems(sortBy: LibrarySortBy, searchQuery: string, sourceFilter: LibrarySourceFilter = 'all') {
  const { user } = useAuth();
  const ascending = sortBy === 'oldest';

  return useInfiniteQuery({
    queryKey: ['library', sortBy, searchQuery, sourceFilter, user?.id],
    queryFn: async ({ pageParam }): Promise<{ items: LibraryItem[]; nextCursor: Cursor | null }> => {
      try {
        const cursor = pageParam as Cursor;
        const q = searchQuery.toLowerCase();

        // Build jobs query
        let jobsQuery = supabase
          .from('generation_jobs')
          .select('id, results, created_at, status, ratio, quality, prompt_final, scene_name, model_name, scene_image_url, model_image_url, workflow_slug, product_name, product_image_url, workflows(name), user_products(title)')
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
          .select('id, image_url, prompt, user_prompt, aspect_ratio, quality, created_at, workflow_label, model_id, scene_id, product_id, provider_used')
          .order('created_at', { ascending })
          .limit(FS_FETCH_LIMIT);

        if (cursor.fsCursor) {
          fsQuery = ascending
            ? fsQuery.gt('created_at', cursor.fsCursor)
            : fsQuery.lt('created_at', cursor.fsCursor);
        }

        const skipJobs = !!cursor.jobsDone || sourceFilter === 'freestyle';
        const skipFs = !!cursor.fsDone || sourceFilter === 'workflow';

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
                sceneName: job.scene_name || undefined,
                modelName: job.model_name || undefined,
                sceneImageUrl: job.scene_image_url || undefined,
                modelImageUrl: job.model_image_url || undefined,
                workflowSlug: job.workflow_slug || undefined,
                productName: (job as any).product_name || undefined,
                productImageUrl: (job as any).product_image_url || undefined,
              },
            });
          }
        }

        // Resolve custom model/scene IDs to names + image URLs
        const customModelIds = [...new Set(fsData.map(f => (f as any).model_id).filter((id: string | null) => id?.startsWith('custom-')).map((id: string) => id.replace('custom-', '')))];
        const customSceneIds = [...new Set(fsData.map(f => (f as any).scene_id).filter((id: string | null) => id?.startsWith('custom-')).map((id: string) => id.replace('custom-', '')))];

        const [customModelsRes, customScenesRes] = await Promise.all([
          customModelIds.length ? supabase.from('custom_models').select('id, name, image_url').in('id', customModelIds) : Promise.resolve({ data: [] as any[] }),
          customSceneIds.length ? supabase.rpc('get_public_custom_scenes').then(res => ({ ...res, data: (res.data as any[] ?? []).filter((s: any) => customSceneIds.includes(s.id)) })) : Promise.resolve({ data: [] as any[] }),
        ]);

        const customModelsMap = new Map((customModelsRes.data ?? []).map((m: any) => [m.id, m]));
        const customScenesMap = new Map((customScenesRes.data ?? []).map((s: any) => [s.id, s]));

        function resolveModel(modelId: string | null): { name?: string; imageUrl?: string } {
          if (!modelId) return {};
          if (modelId.startsWith('custom-')) {
            const cm = customModelsMap.get(modelId.replace('custom-', '')) as { name: string; image_url: string } | undefined;
            return cm ? { name: cm.name, imageUrl: cm.image_url } : {};
          }
          const mock = mockModels.find(m => m.modelId === modelId);
          return mock ? { name: mock.name, imageUrl: mock.previewUrl } : {};
        }

        function resolveScene(sceneId: string | null): { name?: string; imageUrl?: string } {
          if (!sceneId) return {};
          if (sceneId.startsWith('custom-')) {
            const cs = customScenesMap.get(sceneId.replace('custom-', '')) as { name: string; image_url: string } | undefined;
            return cs ? { name: cs.name, imageUrl: cs.image_url } : {};
          }
          const mock = mockTryOnPoses.find(p => p.poseId === sceneId);
          return mock ? { name: mock.name, imageUrl: mock.previewUrl } : {};
        }

        for (const f of fsData) {
          if (!f.image_url || f.image_url.startsWith('data:') || f.image_url === 'saved_to_storage') continue;
          const wfLabel = (f as any).workflow_label as string | null;
          const userPrompt = (f as any).user_prompt as string | null;

          const modelInfo = resolveModel((f as any).model_id);
          const sceneInfo = resolveScene((f as any).scene_id);

          const nameParts = [modelInfo.name, sceneInfo.name].filter(Boolean);
          const freestyleLabel = nameParts.length > 0
            ? nameParts.join(' · ')
            : (userPrompt ? userPrompt.slice(0, 40) + (userPrompt.length > 40 ? '…' : '') : 'Freestyle Creation');
          const displayLabel = wfLabel || freestyleLabel;

          if (q && !displayLabel.toLowerCase().includes(q) && !f.prompt.toLowerCase().includes(q)) continue;

          rawItems.push({
            url: f.image_url,
            sourceCreatedAt: f.created_at,
            source: 'fs',
            item: {
              id: f.id,
              source: wfLabel ? 'generation' : 'freestyle',
              label: displayLabel,
              prompt: userPrompt || undefined,
              date: new Date(f.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              createdAt: f.created_at,
              status: 'completed',
              aspectRatio: f.aspect_ratio,
              quality: f.quality,
              modelName: modelInfo.name,
              modelImageUrl: modelInfo.imageUrl,
              sceneName: sceneInfo.name,
              sceneImageUrl: sceneInfo.imageUrl,
              providerUsed: (f as any).provider_used || null,
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
