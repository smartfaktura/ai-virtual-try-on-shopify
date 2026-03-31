import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/lib/brandedToast';
import { enqueueWithRetry, isEnqueueError, sendWake, getAuthToken, paceDelay } from '@/lib/enqueueGeneration';
import { convertImageToBase64 } from '@/lib/imageUtils';
import { mockTryOnPoses } from '@/data/mockData';
import type { Product, ModelProfile, TryOnPose } from '@/types';
import type { ShotOverride } from '@/components/app/catalog/CatalogShotStyler';

const CREDITS_PER_IMAGE = 6; // tryon cost

export interface CatalogJob {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  images: string[];
  error?: string;
  productName: string;
  modelName: string;
  poseName: string;
  bgName: string;
}

export interface CatalogBatchState {
  jobs: CatalogJob[];
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  allDone: boolean;
  aggregatedImages: string[];
}

interface UseCatalogGenerateReturn {
  startGeneration: (params: CatalogGenerateParams) => Promise<boolean>;
  batchState: CatalogBatchState | null;
  isGenerating: boolean;
  resetBatch: () => void;
  totalCreditsNeeded: number;
}

export interface CatalogGenerateParams {
  products: Product[];
  models: ModelProfile[];
  poseIds: string[];
  backgroundIds: string[];
  allPoses: TryOnPose[];
}

export function useCatalogGenerate(): UseCatalogGenerateReturn {
  const { user } = useAuth();
  const [batchState, setBatchState] = useState<CatalogBatchState | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const jobsRef = useRef<CatalogJob[]>([]);

  useEffect(() => {
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
  }, []);

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
        if (row.status === 'completed' && row.result?.images) {
          images.push(...row.result.images);
        }
        return { ...j, status: row.status, images, error: row.error_message || undefined };
      });

      jobsRef.current = updated;

      const completedJobs = updated.filter(j => j.status === 'completed').length;
      const failedJobs = updated.filter(j => j.status === 'failed').length;
      const allDone = updated.every(j => ['completed', 'failed', 'cancelled'].includes(j.status));
      const aggregatedImages = updated.flatMap(j => j.images);

      setBatchState({
        jobs: updated,
        totalJobs: updated.length,
        completedJobs,
        failedJobs,
        allDone,
        aggregatedImages,
      });

      if (allDone) stopPolling();
    };

    poll();
    pollingRef.current = setInterval(poll, 3000);
  }, [stopPolling]);

  const startGeneration = useCallback(async (params: CatalogGenerateParams): Promise<boolean> => {
    if (!user) { toast.error('Sign in to generate'); return false; }

    const { products, models, poseIds, backgroundIds, allPoses } = params;
    const poseMap = new Map(allPoses.map(p => [p.poseId, p]));

    const token = await getAuthToken();
    if (!token) { toast.error('Authentication required'); return false; }

    setIsGenerating(true);
    const batchId = crypto.randomUUID();
    const jobs: CatalogJob[] = [];
    let lastBalance: number | null = null;
    let enqueueCount = 0;

    for (const product of products) {
      const sourceImageUrl = product.images[0]?.url;
      if (!sourceImageUrl) continue;

      // Convert product image to base64 once per product
      const base64Product = await convertImageToBase64(sourceImageUrl);

      for (const model of models) {
        const base64Model = await convertImageToBase64(model.previewUrl);

        for (const poseId of poseIds) {
          const pose = poseMap.get(poseId);
          if (!pose) continue;

          for (const bgId of backgroundIds) {
            const bg = poseMap.get(bgId);
            if (!bg) continue;

            // Convert scene image
            const base64Scene = bg.previewUrl ? await convertImageToBase64(bg.previewUrl) : undefined;

            await paceDelay(enqueueCount);

            const result = await enqueueWithRetry(
              {
                jobType: 'tryon',
                payload: {
                  product: { title: product.title, description: product.description, productType: product.productType, imageUrl: base64Product },
                  model: { name: model.name, gender: model.gender, ethnicity: model.ethnicity, bodyType: model.bodyType, ageRange: model.ageRange, imageUrl: base64Model, originalImageUrl: model.previewUrl },
                  pose: { name: pose.name, description: pose.promptHint || pose.description, category: pose.category, imageUrl: base64Scene, originalImageUrl: pose.previewUrl },
                  background: { name: bg.name, description: bg.promptHint || bg.description, category: bg.category },
                  aspectRatio: '3:4',
                  imageCount: 1,
                  batch_id: batchId,
                  catalog_mode: true,
                },
                imageCount: 1,
                quality: 'standard',
                hasModel: true,
                hasScene: true,
                skipWake: true,
              },
              token,
            );

            if (!isEnqueueError(result)) {
              jobs.push({
                jobId: result.jobId,
                status: 'queued',
                images: [],
                productName: product.title,
                modelName: model.name,
                poseName: pose.name,
                bgName: bg.name,
              });
              lastBalance = result.newBalance;
            } else if (result.type === 'insufficient_credits') {
              toast.error(`Insufficient credits after ${jobs.length} jobs queued`);
              break;
            }
            enqueueCount++;
          }
        }
      }
    }

    if (jobs.length > 0) sendWake(token);

    if (jobs.length === 0) {
      toast.error('Could not queue any jobs');
      setIsGenerating(false);
      return false;
    }

    jobsRef.current = jobs;
    setBatchState({
      jobs,
      totalJobs: jobs.length,
      completedJobs: 0,
      failedJobs: 0,
      allDone: false,
      aggregatedImages: [],
    });

    toast.info(`Queued ${jobs.length} catalog generation${jobs.length > 1 ? 's' : ''}`);
    pollJobs();
    setIsGenerating(false);

    return true;
  }, [user, pollJobs]);

  const resetBatch = useCallback(() => {
    stopPolling();
    setBatchState(null);
    jobsRef.current = [];
  }, [stopPolling]);

  const totalCreditsNeeded = 0; // Calculated externally

  return { startGeneration, batchState, isGenerating, resetBatch, totalCreditsNeeded };
}
