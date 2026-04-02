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
  isStrictIsolationShot,
} from '@/lib/catalogEngine';
import type {
  CatalogSessionConfig, CatalogJobExtended, CatalogBatchStateV2,
  CatalogShotId, RenderPath, ProductLookLock, CatalogSessionLock,
} from '@/types/catalog';

const CREDITS_PER_IMAGE = 4;
const POLLING_HARD_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
const REWAKE_THROTTLE_MS = 30_000; // 30 seconds between re-wakes
const SESSION_KEY = 'catalog_batch';
const ANCHOR_POLL_INTERVAL_MS = 3000;
const ANCHOR_POLL_TIMEOUT_MS = 5 * 60 * 1000; // 5 min max wait for anchors

/** Append per-combo styling props to the assembled prompt (skips strict-isolation shots) */
function appendPropsToPrompt(
  prompt: string,
  comboKey: string,
  shotId: CatalogShotId,
  propAssignments?: CatalogSessionConfig['propAssignments'],
): string {
  if (!propAssignments) return prompt;
  // Never inject props into strict isolation shots (ghost mannequin, back_flat, zoom_detail, etc.)
  if (isStrictIsolationShot(shotId)) return prompt;
  const props = propAssignments[comboKey];
  if (!props || !Array.isArray(props) || props.length === 0) return prompt;
  const items = props.map((p: any) => p.title || p).join(', ');
  return `${prompt}\nAdditionally, include these styling accessories visible in the scene: ${items}.`;
}

/** Persist minimal batch info to sessionStorage for crash recovery */
function persistBatch(jobs: CatalogJobExtended[]) {
  try {
    const meta = jobs.map(j => ({
      jobId: j.jobId,
      productId: j.productId,
      productName: j.productName,
      shotId: j.shotId,
      shotLabel: j.shotLabel,
      renderPath: j.renderPath,
      isAnchor: j.isAnchor,
    }));
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(meta));
  } catch { /* quota exceeded — non-critical */ }
}

function clearPersistedBatch() {
  try { sessionStorage.removeItem(SESSION_KEY); } catch { /* noop */ }
}

function loadPersistedBatch(): CatalogJobExtended[] | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const meta = JSON.parse(raw) as Array<{
      jobId: string; productId: string; productName: string;
      shotId: CatalogShotId; shotLabel: string; renderPath: RenderPath; isAnchor: boolean;
    }>;
    if (!Array.isArray(meta) || meta.length === 0) return null;
    return meta.map(m => ({
      ...m,
      status: 'queued' as const,
      images: [],
    }));
  } catch {
    clearPersistedBatch();
    return null;
  }
}

/** Poll specific job IDs until they reach a terminal state */
async function pollUntilDone(
  jobIds: string[],
  timeoutMs: number,
): Promise<Map<string, { status: string; images: string[]; error?: string }>> {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const start = Date.now();
  const results = new Map<string, { status: string; images: string[]; error?: string }>();

  while (Date.now() - start < timeoutMs) {
    let token = await getAuthToken() || SUPABASE_KEY;
    const idsFilter = jobIds.map(id => `"${id}"`).join(',');
    let res = await fetch(
      `${SUPABASE_URL}/rest/v1/generation_queue?id=in.(${idsFilter})&select=id,status,result,error_message`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` } }
    );

    if (res.status === 401) {
      const { data: sessionData } = await supabase.auth.getSession();
      token = sessionData?.session?.access_token || SUPABASE_KEY;
      res = await fetch(
        `${SUPABASE_URL}/rest/v1/generation_queue?id=in.(${idsFilter})&select=id,status,result,error_message`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` } }
      );
    }

    if (res.ok) {
      const rows = await res.json();
      for (const row of rows) {
        const images: string[] = [];
        if (row.status === 'completed' && row.result?.images) images.push(...row.result.images);
        results.set(row.id, { status: row.status, images, error: row.error_message || undefined });
      }

      const allTerminal = jobIds.every(id => {
        const r = results.get(id);
        return r && ['completed', 'failed', 'cancelled'].includes(r.status);
      });
      if (allTerminal) return results;
    }

    await new Promise(r => setTimeout(r, ANCHOR_POLL_INTERVAL_MS));
  }

  // Timeout — return whatever we have
  return results;
}

export type { CatalogBatchStateV2 as CatalogBatchState };

export function useCatalogGenerate() {
  const { user } = useAuth();
  const [batchState, setBatchState] = useState<CatalogBatchStateV2 | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollingStartRef = useRef<number>(0);
  const jobsRef = useRef<CatalogJobExtended[]>([]);
  const lastWakeRef = useRef<number>(0);
  /** Phase guard: prevents allDone from triggering during the anchor phase */
  const phaseRef = useRef<'idle' | 'anchors' | 'derivatives' | 'complete'>('idle');

  // ── Session recovery on mount ──
  useEffect(() => {
    const saved = loadPersistedBatch();
    if (saved && saved.length > 0 && jobsRef.current.length === 0) {
      console.log(`[catalog] Recovering ${saved.length} jobs from session`);
      jobsRef.current = saved;
      setIsGenerating(true);

      const anchorStatus: Record<string, 'pending' | 'generating' | 'completed' | 'failed'> = {};
      for (const j of saved.filter(j => j.isAnchor)) anchorStatus[j.productId] = 'pending';
      setBatchState({
        jobs: saved, totalJobs: saved.length, completedJobs: 0, failedJobs: 0,
        allDone: false, aggregatedImages: [], anchorStatus, phase: 'anchors',
      });
    }

    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  // ── Auto-start polling when isGenerating + jobs exist but no active poll ──
  useEffect(() => {
    if (isGenerating && jobsRef.current.length > 0 && !pollingRef.current) {
      pollJobs();
    }
  }, [isGenerating]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
  }, []);

  // ── Re-wake throttled ──
  const maybeRewake = useCallback(async (hasQueued: boolean) => {
    if (!hasQueued) return;
    if (Date.now() - lastWakeRef.current < REWAKE_THROTTLE_MS) return;
    lastWakeRef.current = Date.now();
    try {
      const token = await getAuthToken();
      if (token) {
        console.log('[catalog] Re-waking queue for remaining queued jobs');
        supabase.functions.invoke('retry-queue', {
          body: { wakeOnly: true },
        }).catch(() => { /* fire-and-forget */ });
      }
    } catch { /* non-critical */ }
  }, []);

  // ── Polling ──
  const pollJobs = useCallback(() => {
    stopPolling();
    const jobs = jobsRef.current;
    if (jobs.length === 0) return;
    pollingStartRef.current = Date.now();

    const poll = async () => {
      try {
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
          clearPersistedBatch();
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

        const jobs = jobsRef.current;
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
        const anyQueued = updated.some(j => j.status === 'queued');

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
          clearPersistedBatch();
        } else {
          // Re-wake the queue if there are still queued jobs (throttled to 30s)
          maybeRewake(anyQueued);
        }
      } catch (err) {
        // Never crash the polling interval — log and continue
        console.error('[catalog] Poll error (will retry):', err);
      }
    };

    poll();
    pollingRef.current = setInterval(poll, 3000);
  }, [stopPolling, maybeRewake]);

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
    productImageUrl: string,
    productTitle: string,
    productId: string,
    productOriginalUrl: string,
    shotId: CatalogShotId,
    shotLabel: string,
    renderPath: RenderPath,
    shotGroup: 'on-model' | 'product-only',
    prompt: string,
    modelImageUrl: string | null,
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
          shot_group: shotGroup,
          prompt_final: prompt,
          product: { title: productTitle, imageUrl: productImageUrl },
          product_id: productId,
          product_name: productTitle,
          product_image_url: productOriginalUrl,
          ...(modelImageUrl && { model: { imageUrl: modelImageUrl, identityImageUrl: modelImageUrl, name: modelProfile } }),
          ...(anchorImageUrl && { anchor_image_url: anchorImageUrl }),
          aspectRatio: '3:4',
          imageCount: 1,
          batch_id: batchId,
        },
        imageCount: 1,
        quality: 'standard',
        hasModel: !!modelImageUrl,
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

  // ── Main generation pipeline (two-phase: anchors first, then derivatives) ──
  const startGeneration = useCallback(async (config: CatalogSessionConfig): Promise<boolean> => {
    if (!user) { toast.error('Sign in to generate'); return false; }

    const token = await getAuthToken();
    if (!token) { toast.error('Authentication required'); return false; }

    setIsGenerating(true);
    const batchId = crypto.randomUUID();
    const anchorJobs: CatalogJobExtended[] = [];
    let enqueueCount = 0;
    let creditsFailed = false;

    const modelsToUse = config.models.length > 0
      ? config.models
      : [{ id: '__product_only__', profile: 'no model', audience: 'adult_woman' as const, imageUrl: null }];

    // Collect derivative job specs for phase 2
    interface DerivativeSpec {
      token: string;
      productImageUrl: string;
      productTitle: string;
      productId: string;
      productOriginalUrl: string;
      shotId: CatalogShotId;
      shotLabel: string;
      renderPath: RenderPath;
      shotGroup: 'on-model' | 'product-only';
      prompt: string;
      modelImageUrl: string | null;
      modelProfile: string;
      anchorJobId: string; // to look up anchor result
      batchId: string;
    }
    const derivativeSpecs: DerivativeSpec[] = [];

    // ── PHASE 1: Enqueue identity anchor jobs (one per product × model) ──
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

      // Pass model image URL directly — no base64 conversion
      const modelUrl: string | null = model.imageUrl || null;

      for (const product of config.products) {
        if (creditsFailed) break;

        const lookLock = buildProductLookLock(product, session, product.detectedCategory);
        const productB64 = await safeConvertBase64(product.imageUrl, product.title);
        if (!productB64) continue;

        const heroBlock = getHeroProductBlock(product.title, product.detectedCategory);

        // The anchor is always identity_anchor for on-model, front_flat for product-only
        const anchorShotId = lookLock.anchorShotId;
        const anchorDef = getShotDefinition(anchorShotId);
        if (!anchorDef) continue;

        const rawAnchorPrompt = assemblePrompt({
          productTitle: heroBlock,
          productCategory: product.detectedCategory,
          modelProfile: session.modelProfile,
          supportWardrobePrompt: lookLock.supportWardrobePrompt,
          backgroundPrompt: session.backgroundPrompt,
          lightingPrompt: session.lightingPrompt,
          shotDef: anchorDef,
          renderPath: 'anchor_generate',
          backgroundHex: session.backgroundHex,
        });
        const anchorComboKey = `${product.id}__${isProductOnly ? '__none__' : model.id}__${anchorShotId}`;
        const anchorPrompt = appendPropsToPrompt(rawAnchorPrompt, anchorComboKey, anchorShotId, config.propAssignments);

        const anchorResult = await enqueueJob(
          token, productB64, product.title, product.id, product.imageUrl,
          anchorShotId, anchorDef.label, 'anchor_generate',
          anchorDef.group,
          anchorPrompt, modelUrl, session.modelProfile, null, batchId, enqueueCount++,
        );

        if (anchorResult === 'insufficient_credits') { creditsFailed = true; break; }
        if (anchorResult) anchorJobs.push(anchorResult);

        // ALL user-selected shots are derivatives (identity_anchor is not user-selectable)
        for (const shotId of config.selectedShots) {
          const shotDef = getShotDefinition(shotId);
          if (!shotDef) continue;

          const renderPath = classifyRenderPath(anchorShotId, shotId, product.detectedCategory);
          const rawPrompt = assemblePrompt({
            productTitle: heroBlock,
            productCategory: product.detectedCategory,
            modelProfile: session.modelProfile,
            supportWardrobePrompt: lookLock.supportWardrobePrompt,
            backgroundPrompt: session.backgroundPrompt,
            lightingPrompt: session.lightingPrompt,
            shotDef,
            renderPath,
            backgroundHex: session.backgroundHex,
          });
          const comboKey = `${product.id}__${isProductOnly ? '__none__' : model.id}__${shotId}`;
          const prompt = appendPropsToPrompt(rawPrompt, comboKey, shotId, config.propAssignments);

          const isProductOnlyShot = shotDef.group === 'product-only';

          derivativeSpecs.push({
            token,
            productImageUrl: productB64,
            productTitle: product.title,
            productId: product.id,
            productOriginalUrl: product.imageUrl,
            shotId,
            shotLabel: shotDef.label,
            renderPath,
            shotGroup: shotDef.group,
            prompt,
            // Product-only shots: NO model reference, NO anchor reference (prevent face leak)
            modelImageUrl: isProductOnlyShot ? null : modelUrl,
            modelProfile: session.modelProfile,
            // Only on-model derivatives get the anchor reference
            anchorJobId: isProductOnlyShot ? '' : (anchorResult ? anchorResult.jobId : ''),
            batchId,
          });
        }
      }
    }

    if (anchorJobs.length === 0) {
      toast.error(creditsFailed ? 'Insufficient credits to start generation' : 'Could not queue any jobs');
      setIsGenerating(false);
      return false;
    }

    // Create placeholder jobs for derivatives so UI shows correct totals immediately
    const placeholderJobs: CatalogJobExtended[] = derivativeSpecs.map((spec, i) => ({
      jobId: `placeholder-${i}-${spec.shotId}-${spec.productId}`,
      status: 'queued' as const,
      images: [],
      productId: spec.productId,
      productName: spec.productTitle,
      shotId: spec.shotId,
      shotLabel: spec.shotLabel,
      renderPath: spec.renderPath,
      isAnchor: false,
    }));

    // Start with anchor jobs + placeholders visible
    const initialJobs = [...anchorJobs, ...placeholderJobs];
    jobsRef.current = anchorJobs; // Only track real jobs for polling
    persistBatch(anchorJobs);

    const anchorStatus: Record<string, 'pending' | 'generating' | 'completed' | 'failed'> = {};
    for (const j of anchorJobs) anchorStatus[j.productId] = 'pending';

    const totalExpected = anchorJobs.length + derivativeSpecs.length;
    setBatchState({
      jobs: initialJobs, totalJobs: totalExpected, completedJobs: 0, failedJobs: 0,
      allDone: false, aggregatedImages: [], anchorStatus, phase: 'anchors',
    });

    const userImageCount = derivativeSpecs.length;
    toast.info(`Generating ${userImageCount} catalog image${userImageCount > 1 ? 's' : ''}…`);
    sendWake(token);

    // If no derivatives, just poll anchors directly
    if (derivativeSpecs.length === 0) {
      pollJobs();
      return true;
    }

    // ── PHASE 2: Wait for anchors, then enqueue derivatives with anchor URLs ──
    // Start polling anchors for UI feedback
    pollJobs();

    (async () => {
      try {
        console.log(`[catalog] Phase 1: Waiting for ${anchorJobs.length} identity anchor(s) to complete…`);

        // Poll anchor jobs until done
        const anchorResults = await pollUntilDone(
          anchorJobs.map(j => j.jobId),
          ANCHOR_POLL_TIMEOUT_MS,
        );

        // Build a map: anchorJobId → first result image URL
        const anchorImageMap = new Map<string, string>();
        for (const [jobId, result] of anchorResults) {
          if (result.status === 'completed' && result.images.length > 0) {
            anchorImageMap.set(jobId, result.images[0]);
          }
        }

        // Update anchor jobs in our state
        const updatedAnchors = anchorJobs.map(j => {
          const r = anchorResults.get(j.jobId);
          if (!r) return j;
          return { ...j, status: r.status as any, images: r.images, error: r.error };
        });

        console.log(`[catalog] Phase 2: Enqueuing ${derivativeSpecs.length} derivative(s) with anchor references…`);

        // Enqueue derivative jobs WITH anchor image URLs
        const derivativeJobs: CatalogJobExtended[] = [];
        let derivEnqueueCount = anchorJobs.length;

        for (const spec of derivativeSpecs) {
          if (creditsFailed) break;

          // Look up anchor result for this derivative
          // Product-only shots: never pass anchor URL (it may contain a person)
          const isProductOnlyDerivative = spec.shotGroup === 'product-only';
          const anchorUrl = isProductOnlyDerivative ? null : (anchorImageMap.get(spec.anchorJobId) || null);

          const jobResult = await enqueueJob(
            spec.token, spec.productImageUrl, spec.productTitle, spec.productId,
            spec.productOriginalUrl, spec.shotId, spec.shotLabel, spec.renderPath,
            spec.shotGroup, spec.prompt, spec.modelImageUrl, spec.modelProfile,
            anchorUrl,
            spec.batchId, derivEnqueueCount++,
          );

          if (jobResult === 'insufficient_credits') { creditsFailed = true; break; }
          if (jobResult) derivativeJobs.push(jobResult);
        }

        if (derivativeJobs.length > 0) sendWake(token);

        // Merge all jobs (replace placeholders with real derivative jobs)
        const allJobs = [...updatedAnchors, ...derivativeJobs];
        jobsRef.current = allJobs;
        persistBatch(allJobs);

        const newAnchorStatus: Record<string, 'pending' | 'generating' | 'completed' | 'failed'> = {};
        for (const aj of updatedAnchors) {
          newAnchorStatus[aj.productId] = aj.status === 'completed' ? 'completed' : aj.status === 'failed' ? 'failed' : 'pending';
        }

        setBatchState({
          jobs: allJobs, totalJobs: allJobs.length,
          completedJobs: allJobs.filter(j => j.status === 'completed').length,
          failedJobs: allJobs.filter(j => j.status === 'failed').length,
          allDone: false,
          aggregatedImages: allJobs.flatMap(j => j.images),
          anchorStatus: newAnchorStatus,
          phase: 'derivatives',
        });

        // Restart polling with full job set (pollJobs stops and restarts cleanly)
        pollJobs();
      } catch (err) {
        console.error('[catalog] Phase 2 error:', err);
        // Fall back to polling whatever we have
        pollJobs();
      }
    })();

    return true;
  }, [user, pollJobs]);

  const resetBatch = useCallback(() => {
    stopPolling();
    setBatchState(null);
    jobsRef.current = [];
    setIsGenerating(false);
    clearPersistedBatch();
  }, [stopPolling]);

  return { startGeneration, batchState, isGenerating, resetBatch };
}
