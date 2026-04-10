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

type RawItem = { item: Omit<LibraryItem, 'imageUrl'>; url: string; sourceCreatedAt: string; source: 'job' | 'fs' };

type Cursor = {
  jobCursor?: string;
  fsCursor?: string;
  jobsDone?: boolean;
  fsDone?: boolean;
  overflow?: RawItem[];
};

export type LibrarySourceFilter = 'all' | 'freestyle' | 'workflow';

// ── helpers ──

function resolveModelFromMaps(
  modelId: string | null,
  customModelsMap: Map<string, any>,
): { name?: string; imageUrl?: string } {
  if (!modelId) return {};
  if (modelId.startsWith('custom-')) {
    const cm = customModelsMap.get(modelId.replace('custom-', ''));
    return cm ? { name: cm.name, imageUrl: cm.image_url } : {};
  }
  const mock = mockModels.find(m => m.modelId === modelId);
  return mock ? { name: mock.name, imageUrl: mock.previewUrl } : {};
}

function resolveSceneFromMaps(
  sceneId: string | null,
  customScenesMap: Map<string, any>,
): { name?: string; imageUrl?: string } {
  if (!sceneId) return {};
  if (sceneId.startsWith('custom-')) {
    const cs = customScenesMap.get(sceneId.replace('custom-', ''));
    return cs ? { name: cs.name, imageUrl: cs.image_url } : {};
  }
  const mock = mockTryOnPoses.find(p => p.poseId === sceneId);
  return mock ? { name: mock.name, imageUrl: mock.previewUrl } : {};
}

function jobsToRawItems(jobsData: any[], q: string): RawItem[] {
  const items: RawItem[] = [];
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

      items.push({
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
  return items;
}

function freestyleToRawItems(
  fsData: any[],
  q: string,
  customModelsMap: Map<string, any>,
  customScenesMap: Map<string, any>,
): RawItem[] {
  const items: RawItem[] = [];
  for (const f of fsData) {
    if (!f.image_url || f.image_url.startsWith('data:') || f.image_url === 'saved_to_storage') continue;
    const wfLabel = (f as any).workflow_label as string | null;
    const userPrompt = (f as any).user_prompt as string | null;

    const modelInfo = resolveModelFromMaps((f as any).model_id, customModelsMap);
    const sceneInfo = resolveSceneFromMaps((f as any).scene_id, customScenesMap);

    const nameParts = [modelInfo.name, sceneInfo.name].filter(Boolean);
    const freestyleLabel = nameParts.length > 0
      ? nameParts.join(' · ')
      : (userPrompt ? userPrompt.slice(0, 40) + (userPrompt.length > 40 ? '…' : '') : 'Freestyle Creation');
    const displayLabel = wfLabel || freestyleLabel;

    if (q && !displayLabel.toLowerCase().includes(q) && !f.prompt.toLowerCase().includes(q)) continue;

    items.push({
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
  return items;
}

// ── main hook ──

export function useLibraryItems(sortBy: LibrarySortBy, searchQuery: string, sourceFilter: LibrarySourceFilter = 'all') {
  const { user } = useAuth();
  const ascending = sortBy === 'oldest';

  return useInfiniteQuery({
    queryKey: ['library', sortBy, searchQuery, sourceFilter, user?.id],
    queryFn: async ({ pageParam }): Promise<{ items: LibraryItem[]; nextCursor: Cursor | null }> => {
      try {
        const cursor = pageParam as Cursor;
        const q = searchQuery.toLowerCase();

        // Start with overflow items carried from the previous page
        const carryOver: RawItem[] = cursor.overflow ?? [];

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

        const jobsExhausted = skipJobs || jobsData.length < JOB_FETCH_LIMIT;
        const fsExhausted = skipFs || fsData.length < FS_FETCH_LIMIT;

        // Resolve custom model/scene IDs
        const customModelIds = [...new Set(fsData.map(f => (f as any).model_id).filter((id: string | null) => id?.startsWith('custom-')).map((id: string) => id.replace('custom-', '')))];
        const customSceneIds = [...new Set(fsData.map(f => (f as any).scene_id).filter((id: string | null) => id?.startsWith('custom-')).map((id: string) => id.replace('custom-', '')))];

        const [customModelsRes, customScenesRes] = await Promise.all([
          customModelIds.length ? supabase.from('custom_models').select('id, name, image_url').in('id', customModelIds) : Promise.resolve({ data: [] as any[] }),
          customSceneIds.length ? supabase.rpc('get_public_custom_scenes').then(res => ({ ...res, data: (res.data as any[] ?? []).filter((s: any) => customSceneIds.includes(s.id)) })) : Promise.resolve({ data: [] as any[] }),
        ]);

        const customModelsMap = new Map((customModelsRes.data ?? []).map((m: any) => [m.id, m]));
        const customScenesMap = new Map((customScenesRes.data ?? []).map((s: any) => [s.id, s]));

        // Convert fetched rows to raw items
        const newJobItems = jobsToRawItems(jobsData, q);
        const newFsItems = freestyleToRawItems(fsData, q, customModelsMap, customScenesMap);

        // Merge carry-over + newly fetched
        const allItems = [...carryOver, ...newJobItems, ...newFsItems];

        // Sort merged results
        allItems.sort((a, b) => {
          const diff = new Date(b.item.createdAt).getTime() - new Date(a.item.createdAt).getTime();
          return ascending ? -diff : diff;
        });

        // Split into page + overflow
        const pageItems = allItems.slice(0, PAGE_SIZE);
        const overflowItems = allItems.slice(PAGE_SIZE);

        // Sign all URLs in parallel
        const signedUrls = await toSignedUrls(pageItems.map(r => r.url));
        const items: LibraryItem[] = pageItems.map((r, i) => ({
          ...r.item,
          imageUrl: signedUrls[i],
        } as LibraryItem));

        // Advance cursors based on what was actually fetched from DB
        const nextJobCursor = jobsData.length > 0
          ? jobsData[jobsData.length - 1].created_at
          : cursor.jobCursor;
        const nextFsCursor = fsData.length > 0
          ? fsData[fsData.length - 1].created_at
          : cursor.fsCursor;

        // A source is done only when exhausted AND no overflow items remain from it
        const overflowHasJobs = overflowItems.some(r => r.source === 'job');
        const overflowHasFs = overflowItems.some(r => r.source === 'fs');

        const jobsDone = jobsExhausted && !overflowHasJobs;
        const fsDone = fsExhausted && !overflowHasFs;

        const hasMore = !jobsDone || !fsDone || overflowItems.length > 0;

        const nextCursor: Cursor | null = hasMore
          ? {
              jobCursor: nextJobCursor,
              fsCursor: nextFsCursor,
              jobsDone,
              fsDone,
              overflow: overflowItems,
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
