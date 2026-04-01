import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/lib/brandedToast';
import { enqueueWithRetry, isEnqueueError, sendWake, getAuthToken, paceDelay } from '@/lib/enqueueGeneration';
import { convertImageToBase64 } from '@/lib/imageUtils';
import {
  detectProductCategory, buildSessionLock, buildProductLookLock,
  getAnchorShotId, getShotDefinition, classifyRenderPath,
  assemblePrompt, buildReferences, getHeroProductBlock,
  getBackground, getLightingPrompt, getFashionStyle,
  resolveSupportWardrobe, buildSupportWardrobePrompt,
} from '@/lib/catalogEngine';
import type {
  CatalogSessionConfig, CatalogJobExtended, CatalogBatchStateV2,
  CatalogShotId, RenderPath, ProductLookLock, CatalogSessionLock,
} from '@/types/catalog';

const CREDITS_PER_IMAGE = 4;

export type { CatalogBatchStateV2 as CatalogBatchState };

export function useCatalogGenerate() {
  const { user } = useAuth();
  const [batchState, setBatchState] = useState<CatalogBatchStateV2 | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const jobsRef = useRef<CatalogJobExtended[]>([]);

  useEffect(() => {
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
  }, []);

  // ── Polling ──
  const pollJobs = useCallback(() => {
    stopPolling();
    const jobs = jobsRef.current;
    if (jobs.length === 0) return;

    const poll = async () => {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      let token = await getAuthToken() || SUPABASE_KEY;

      const jobIds = jobs.map(j => j.jobId);
      const idsFilter = jobIds.map(id => `"${id}"`).join(',');
      let res = await fetch(
        `${SUPABASE_URL}/rest/v1/generation_queue?id=in.(${idsFilter})&select=id,status,result,error_message`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` } }
      );

      if (res.status === 401) {
        const { data: sessionData } = await supabase.auth.getSession();
        const freshToken = sessionData?.session?.access_token;
        if (freshToken) {
          token = freshToken;
          res = await fetch(
            `${SUPABASE_URL}/rest/v1/generation_queue?id=in.(${idsFilter})&select=id,status,result,error_message`,
            { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` } }
          );
        }
      }

      if (!res.ok) return;
      const rows = await res.json();
      if (!rows?.length) return;

      const rowMap = new Map(rows.map((r: any) => [r.id, r]));

      const updated = jobs.map(j => {
        const row = rowMap.get(j.jobId) as any;
        if (!row) return j;
        const images: string[] = [];
        if (row.status === 'completed' && row.result?.images) images.push(...row.result.images);
        return { ...j, status: row.status, images, error: row.error_message || undefined };
      });

      jobsRef.current = updated;

      const completedJobs = updated.filter(j => j.status === 'completed').length;
      const failedJobs = updated.filter(j => j.status === 'failed').length;
      const allDone = updated.every(j => ['completed', 'failed', 'cancelled'].includes(j.status));
      const aggregatedImages = updated.flatMap(j => j.images);

      // Determine phase
      const anchorJobs = updated.filter(j => j.isAnchor);
      const anchorsAllDone = anchorJobs.every(j => ['completed', 'failed', 'cancelled'].includes(j.status));
      const derivativeJobs = updated.filter(j => !j.isAnchor);
      const phase = allDone ? 'complete' as const : !anchorsAllDone ? 'anchors' as const : 'derivatives' as const;

      const anchorStatus: Record<string, 'pending' | 'generating' | 'completed' | 'failed'> = {};
      for (const aj of anchorJobs) {
        anchorStatus[aj.productId] = aj.status === 'completed' ? 'completed' : aj.status === 'failed' ? 'failed' : aj.status === 'processing' ? 'generating' : 'pending';
      }

      setBatchState({
        jobs: updated, totalJobs: updated.length, completedJobs, failedJobs,
        allDone, aggregatedImages, anchorStatus, phase,
      });

      if (allDone) stopPolling();
    };

    poll();
    pollingRef.current = setInterval(poll, 3000);
  }, [stopPolling]);

  // ── Enqueue a single job ──
  const enqueueJob = async (
    token: string,
    productImageB64: string,
    productTitle: string,
    productId: string,
    shotId: CatalogShotId,
    shotLabel: string,
    renderPath: RenderPath,
    prompt: string,
    modelImageB64: string | null,
    modelProfile: string,
    anchorImageUrl: string | null,
    batchId: string,
    enqueueCount: number,
  ): Promise<CatalogJobExtended | null> => {
    await paceDelay(enqueueCount);

    const result = await enqueueWithRetry(
      {
        jobType: 'tryon',
        payload: {
          catalog_mode: true,
          render_path: renderPath,
          shot_id: shotId,
          prompt_final: prompt,
          product: { title: productTitle, imageUrl: productImageB64 },
          ...(modelImageB64 && { model: { imageUrl: modelImageB64, name: modelProfile } }),
          ...(anchorImageUrl && { anchor_image_url: anchorImageUrl }),
          aspectRatio: '3:4',
          imageCount: 1,
          batch_id: batchId,
        },
        imageCount: 1,
        quality: 'standard',
        hasModel: !!modelImageB64,
        hasScene: false,
        skipWake: true,
      },
      token,
    );

    if (isEnqueueError(result)) {
      if (result.type === 'insufficient_credits') {
        toast.error('Insufficient credits');
      }
      return null;
    }

    return {
      jobId: result.jobId,
      status: 'queued',
      images: [],
      productId,
      productName: productTitle,
      shotId,
      shotLabel,
      renderPath,
      isAnchor: renderPath === 'anchor_generate',
    };
  };

  // ── Wait for a specific job to complete ──
  const waitForJobCompletion = async (jobId: string, timeoutMs = 120000): Promise<string | null> => {
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const start = Date.now();

    while (Date.now() - start < timeoutMs) {
      await new Promise(r => setTimeout(r, 3000));
      const token = await getAuthToken() || SUPABASE_KEY;
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/generation_queue?id=eq.${jobId}&select=status,result,error_message`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) continue;
      const rows = await res.json();
      if (!rows?.[0]) continue;
      const row = rows[0];
      if (row.status === 'completed' && row.result?.images?.[0]) return row.result.images[0];
      if (row.status === 'failed' || row.status === 'cancelled') return null;
    }
    return null;
  };

  // ── Main generation pipeline (multi-model) ──
  const startGeneration = useCallback(async (config: CatalogSessionConfig): Promise<boolean> => {
    if (!user) { toast.error('Sign in to generate'); return false; }

    const token = await getAuthToken();
    if (!token) { toast.error('Authentication required'); return false; }

    setIsGenerating(true);
    const batchId = crypto.randomUUID();
    const allJobs: CatalogJobExtended[] = [];
    let enqueueCount = 0;

    // Models to iterate: if empty, use a single null-model pass
    const modelsToUse = config.models.length > 0
      ? config.models
      : [{ id: '__product_only__', profile: 'no model', audience: 'adult_woman' as const, imageUrl: null }];

    for (const model of modelsToUse) {
      const isProductOnly = model.id === '__product_only__';

      const session = buildSessionLock(
        config.fashionStyle,
        isProductOnly ? null : model.id,
        model.profile,
        model.audience,
        config.backgroundId,
      );

      const modelB64 = model.imageUrl ? await convertImageToBase64(model.imageUrl) : null;

      for (const product of config.products) {
        const lookLock = buildProductLookLock(product, session, product.detectedCategory);
        const productB64 = await convertImageToBase64(product.imageUrl);
        const heroBlock = getHeroProductBlock(product.title, product.detectedCategory);

        // Anchor shot
        const anchorShotId = lookLock.anchorShotId;
        const effectiveAnchorId = config.selectedShots.includes(anchorShotId) ? anchorShotId : config.selectedShots[0];
        const effectiveAnchorDef = getShotDefinition(effectiveAnchorId);

        if (!effectiveAnchorDef) continue;

        const anchorPrompt = assemblePrompt({
          productTitle: heroBlock,
          productCategory: product.detectedCategory,
          modelProfile: session.modelProfile,
          supportWardrobePrompt: lookLock.supportWardrobePrompt,
          backgroundPrompt: session.backgroundPrompt,
          lightingPrompt: session.lightingPrompt,
          shotDef: effectiveAnchorDef,
          renderPath: 'anchor_generate',
        });

        const anchorJob = await enqueueJob(
          token, productB64, product.title, product.id,
          effectiveAnchorId, effectiveAnchorDef.label, 'anchor_generate',
          anchorPrompt, modelB64, session.modelProfile, null, batchId, enqueueCount++,
        );

        if (anchorJob) allJobs.push(anchorJob);

        // Remaining shots
        const remainingShots = config.selectedShots.filter(s => s !== effectiveAnchorId);
        for (const shotId of remainingShots) {
          const shotDef = getShotDefinition(shotId);
          if (!shotDef) continue;

          const renderPath = classifyRenderPath(effectiveAnchorId, shotId, product.detectedCategory);
          const prompt = assemblePrompt({
            productTitle: heroBlock,
            productCategory: product.detectedCategory,
            modelProfile: session.modelProfile,
            supportWardrobePrompt: lookLock.supportWardrobePrompt,
            backgroundPrompt: session.backgroundPrompt,
            lightingPrompt: session.lightingPrompt,
            shotDef,
            renderPath,
          });

          const job = await enqueueJob(
            token, productB64, product.title, product.id,
            shotId, shotDef.label, renderPath, prompt,
            modelB64, session.modelProfile, null, batchId, enqueueCount++,
          );

          if (job) allJobs.push(job);
        }
      }
    }

    if (allJobs.length > 0) sendWake(token);

    if (allJobs.length === 0) {
      toast.error('Could not queue any jobs');
      setIsGenerating(false);
      return false;
    }

    jobsRef.current = allJobs;
    const anchorStatus: Record<string, 'pending' | 'generating' | 'completed' | 'failed'> = {};
    for (const j of allJobs.filter(j => j.isAnchor)) anchorStatus[j.productId] = 'pending';

    setBatchState({
      jobs: allJobs, totalJobs: allJobs.length, completedJobs: 0, failedJobs: 0,
      allDone: false, aggregatedImages: [], anchorStatus, phase: 'anchors',
    });

    toast.info(`Queued ${allJobs.length} catalog image${allJobs.length > 1 ? 's' : ''}`);
    pollJobs();
    setIsGenerating(false);
    return true;
  }, [user, pollJobs]);

  const resetBatch = useCallback(() => {
    stopPolling();
    setBatchState(null);
    jobsRef.current = [];
  }, [stopPolling]);

  return { startGeneration, batchState, isGenerating, resetBatch };
}
