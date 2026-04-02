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
const POLLING_HARD_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

/** Append per-combo styling props to the assembled prompt */
function appendPropsToPrompt(
  prompt: string,
  comboKey: string,
  propAssignments?: CatalogSessionConfig['propAssignments'],
): string {
  if (!propAssignments) return prompt;
  const props = propAssignments[comboKey];
  if (!props || !Array.isArray(props) || props.length === 0) return prompt;
  const items = props.map((p: any) => p.title || p).join(', ');
  return `${prompt}\nAdditionally, include these styling accessories visible in the scene: ${items}.`;
}

export type { CatalogBatchStateV2 as CatalogBatchState };

export function useCatalogGenerate() {
  const { user } = useAuth();
  const [batchState, setBatchState] = useState<CatalogBatchStateV2 | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollingStartRef = useRef<number>(0);
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
    pollingStartRef.current = Date.now();

    const poll = async () => {
      // Hard timeout: force-complete after 10 minutes
      if (Date.now() - pollingStartRef.current > POLLING_HARD_TIMEOUT_MS) {
        console.warn('[catalog] Polling hard timeout reached (10m), force-completing batch');
        const updated = jobsRef.current.map(j =>
          ['queued', 'processing'].includes(j.status)
            ? { ...j, status: 'failed' as const, error: 'Timed out after 10 minutes' }
            : j
        );
        jobsRef.current = updated;
        const aggregatedImages = updated.flatMap(j => j.images);
        setBatchState({
          jobs: updated, totalJobs: updated.length,
          completedJobs: updated.filter(j => j.status === 'completed').length,
          failedJobs: updated.filter(j => j.status === 'failed').length,
          allDone: true, aggregatedImages, anchorStatus: {}, phase: 'complete',
        });
        stopPolling();
        setIsGenerating(false);
        if (aggregatedImages.length > 0) {
          toast.warning(`Completed with ${aggregatedImages.length} image(s) — some jobs timed out`);
        } else {
          toast.error('Generation timed out');
        }
        return;
      }

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

      const anchorJobs = updated.filter(j => j.isAnchor);
      const anchorsAllDone = anchorJobs.every(j => ['completed', 'failed', 'cancelled'].includes(j.status));
      const phase = allDone ? 'complete' as const : !anchorsAllDone ? 'anchors' as const : 'derivatives' as const;

      const anchorStatus: Record<string, 'pending' | 'generating' | 'completed' | 'failed'> = {};
      for (const aj of anchorJobs) {
        anchorStatus[aj.productId] = aj.status === 'completed' ? 'completed' : aj.status === 'failed' ? 'failed' : aj.status === 'processing' ? 'generating' : 'pending';
      }

      setBatchState({
        jobs: updated, totalJobs: updated.length, completedJobs, failedJobs,
        allDone, aggregatedImages, anchorStatus, phase,
      });

      if (allDone) {
        stopPolling();
        setIsGenerating(false);
      }
    };

    poll();
    pollingRef.current = setInterval(poll, 3000);
  }, [stopPolling]);

  // ── Safe base64 conversion ──
  const safeConvertBase64 = async (url: string, label: string): Promise<string | null> => {
    try {
      return await convertImageToBase64(url);
    } catch (err) {
      console.error(`[catalog] Failed to convert ${label} image to base64:`, err);
      toast.warning(`Could not process image for "${label}" — skipping`);
      return null;
    }
  };

  // ── Enqueue a single job ──
  const enqueueJob = async (
    token: string,
    productImageB64: string,
    productTitle: string,
    productId: string,
    productOriginalUrl: string,
    shotId: CatalogShotId,
    shotLabel: string,
    renderPath: RenderPath,
    prompt: string,
    modelImageB64: string | null,
    modelProfile: string,
    anchorImageUrl: string | null,
    batchId: string,
    enqueueCount: number,
  ): Promise<CatalogJobExtended | 'insufficient_credits' | null> => {
    await paceDelay(enqueueCount);

    const result = await enqueueWithRetry(
      {
        jobType: 'catalog',
        payload: {
          catalog_mode: true,
          render_path: renderPath,
          shot_id: shotId,
          prompt_final: prompt,
          product: { title: productTitle, imageUrl: productImageB64 },
          product_id: productId,
          product_name: productTitle,
          product_image_url: productOriginalUrl,
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
        toast.error('Insufficient credits — stopping batch');
        return 'insufficient_credits';
      }
      console.error(`[catalog] Enqueue error for ${productTitle}/${shotId}:`, result.message);
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

  // ── Main generation pipeline (multi-model) ──
  const startGeneration = useCallback(async (config: CatalogSessionConfig): Promise<boolean> => {
    if (!user) { toast.error('Sign in to generate'); return false; }

    const token = await getAuthToken();
    if (!token) { toast.error('Authentication required'); return false; }

    setIsGenerating(true);
    const batchId = crypto.randomUUID();
    const allJobs: CatalogJobExtended[] = [];
    let enqueueCount = 0;
    let creditsFailed = false;

    const modelsToUse = config.models.length > 0
      ? config.models
      : [{ id: '__product_only__', profile: 'no model', audience: 'adult_woman' as const, imageUrl: null }];

    for (const model of modelsToUse) {
      if (creditsFailed) break;

      const isProductOnly = model.id === '__product_only__';

      const session = buildSessionLock(
        config.fashionStyle,
        isProductOnly ? null : model.id,
        model.profile,
        model.audience,
        config.backgroundId,
      );

      let modelB64: string | null = null;
      if (model.imageUrl) {
        modelB64 = await safeConvertBase64(model.imageUrl, model.profile || 'model');
        if (!modelB64 && !isProductOnly) {
          // Model image failed but we need it for on-model shots — skip this model
          console.warn(`[catalog] Skipping model "${model.profile}" — image conversion failed`);
          continue;
        }
      }

      for (const product of config.products) {
        if (creditsFailed) break;

        const lookLock = buildProductLookLock(product, session, product.detectedCategory);
        const productB64 = await safeConvertBase64(product.imageUrl, product.title);
        if (!productB64) continue; // Skip product if image fails

        const heroBlock = getHeroProductBlock(product.title, product.detectedCategory);

        const anchorShotId = lookLock.anchorShotId;
        const effectiveAnchorId = config.selectedShots.includes(anchorShotId) ? anchorShotId : config.selectedShots[0];
        const effectiveAnchorDef = getShotDefinition(effectiveAnchorId);

        if (!effectiveAnchorDef) continue;

        const rawAnchorPrompt = assemblePrompt({
          productTitle: heroBlock,
          productCategory: product.detectedCategory,
          modelProfile: session.modelProfile,
          supportWardrobePrompt: lookLock.supportWardrobePrompt,
          backgroundPrompt: session.backgroundPrompt,
          lightingPrompt: session.lightingPrompt,
          shotDef: effectiveAnchorDef,
          renderPath: 'anchor_generate',
          backgroundHex: session.backgroundHex,
        });
        const anchorComboKey = `${product.id}__${isProductOnly ? '__none__' : model.id}__${effectiveAnchorId}`;
        const anchorPrompt = appendPropsToPrompt(rawAnchorPrompt, anchorComboKey, config.propAssignments);

        const anchorResult = await enqueueJob(
          token, productB64, product.title, product.id, product.imageUrl,
          effectiveAnchorId, effectiveAnchorDef.label, 'anchor_generate',
          anchorPrompt, modelB64, session.modelProfile, null, batchId, enqueueCount++,
        );

        if (anchorResult === 'insufficient_credits') { creditsFailed = true; break; }
        if (anchorResult) allJobs.push(anchorResult);

        // Remaining shots
        const remainingShots = config.selectedShots.filter(s => s !== effectiveAnchorId);
        for (const shotId of remainingShots) {
          if (creditsFailed) break;

          const shotDef = getShotDefinition(shotId);
          if (!shotDef) continue;

          const renderPath = classifyRenderPath(effectiveAnchorId, shotId, product.detectedCategory);
          const rawPrompt = assemblePrompt({
            productTitle: heroBlock,
            productCategory: product.detectedCategory,
            modelProfile: session.modelProfile,
            supportWardrobePrompt: lookLock.supportWardrobePrompt,
            backgroundPrompt: session.backgroundPrompt,
            lightingPrompt: session.lightingPrompt,
            shotDef,
            renderPath,
          });
          const comboKey = `${product.id}__${isProductOnly ? '__none__' : model.id}__${shotId}`;
          const prompt = appendPropsToPrompt(rawPrompt, comboKey, config.propAssignments);

          // Don't send model reference for product-only shots
          const isProductOnlyShot = shotDef.group === 'product-only';
          const jobResult = await enqueueJob(
            token, productB64, product.title, product.id, product.imageUrl,
            shotId, shotDef.label, renderPath, prompt,
            isProductOnlyShot ? null : modelB64, session.modelProfile, null, batchId, enqueueCount++,
          );

          if (jobResult === 'insufficient_credits') { creditsFailed = true; break; }
          if (jobResult) allJobs.push(jobResult);
        }
      }
    }

    if (allJobs.length > 0) sendWake(token);

    if (allJobs.length === 0) {
      toast.error(creditsFailed ? 'Insufficient credits to start generation' : 'Could not queue any jobs');
      setIsGenerating(false);
      return false;
    }

    if (creditsFailed && allJobs.length > 0) {
      toast.warning(`Queued ${allJobs.length} job(s) before running out of credits`);
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
    return true;
  }, [user, pollJobs]);

  const resetBatch = useCallback(() => {
    stopPolling();
    setBatchState(null);
    jobsRef.current = [];
    setIsGenerating(false);
  }, [stopPolling]);

  return { startGeneration, batchState, isGenerating, resetBatch };
}
