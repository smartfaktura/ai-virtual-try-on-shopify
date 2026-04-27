import { useState, useCallback } from 'react';
import { toast } from '@/lib/brandedToast';
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/contexts/CreditContext';
import { enqueueWithRetry, isEnqueueError, sendWake, getAuthToken, paceDelay } from '@/lib/enqueueGeneration';
import { gtmFirstGenerationStarted } from '@/lib/gtm';

export type UpscaleResolution = '2k' | '4k';

export interface UpscaleItem {
  imageUrl: string;
  sourceType: 'freestyle' | 'generation';
  sourceId: string;
}

const CREDIT_COST: Record<UpscaleResolution, number> = {
  '2k': 10,
  '4k': 15,
};

const MAX_BATCH = 10;

export function useUpscaleImages() {
  const { user } = useAuth();
  const { balance, refreshBalance } = useCredits();
  const [isUpscaling, setIsUpscaling] = useState(false);

  const getCreditCost = useCallback((count: number, resolution: UpscaleResolution) => {
    return count * CREDIT_COST[resolution];
  }, []);

  const upscaleImages = useCallback(async (
    items: UpscaleItem[],
    resolution: UpscaleResolution,
  ): Promise<string[]> => {
    if (!user) {
      toast.error('Please sign in to upscale images');
      return [];
    }

    if (items.length === 0) {
      toast.error('No images selected');
      return [];
    }

    if (items.length > MAX_BATCH) {
      toast.error(`Maximum ${MAX_BATCH} images per batch`);
      return [];
    }

    const totalCost = getCreditCost(items.length, resolution);
    if (balance < totalCost) {
      toast.error(`Insufficient credits. Need ${totalCost}, have ${balance}.`);
      return [];
    }

    setIsUpscaling(true);
    const jobIds: string[] = [];

    try {
      const token = await getAuthToken();
      if (!token) {
        toast.error('Please sign in first');
        return [];
      }

      // Enqueue each image as a separate upscale job with pacing + retry
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        await paceDelay(i);

        const result = await enqueueWithRetry(
          {
            jobType: 'upscale',
            payload: {
              imageUrl: item.imageUrl,
              sourceType: item.sourceType,
              sourceId: item.sourceId,
              resolution,
            },
            imageCount: 1,
            quality: 'standard',
            resolution,
            skipWake: true,
          },
          token,
        );

        if (isEnqueueError(result)) {
          if (result.type === 'insufficient_credits') toast.error(result.message);
          else if (result.type === 'rate_limit') toast.error('Rate limited. Please wait.');
          else toast.error(result.message || 'Failed to enqueue upscale');
          break;
        }

        jobIds.push(result.jobId);

        if (jobIds.length === 1 && user?.id && result?.jobId) {
          if (import.meta.env.DEV) {
            console.debug('[GTM:firstgen-started] upscale', { jobId: result.jobId });
          }
          gtmFirstGenerationStarted({
            userId: user.id,
            productId: null,
            generationId: result.jobId,
            visualType: 'upscale',
          });
        }
      }

      if (jobIds.length > 0) {
        sendWake(token);
        const resLabel = resolution === '4k' ? '4K' : '2K';
        toast.success(`Upscaling ${jobIds.length} image${jobIds.length > 1 ? 's' : ''} to ${resLabel}…`);
        refreshBalance();
      }

      return jobIds;
    } catch (err) {
      console.error('[upscale] Error:', err);
      toast.error('Failed to start upscale');
      return [];
    } finally {
      setIsUpscaling(false);
    }
  }, [user, balance, getCreditCost, refreshBalance]);

  return {
    upscaleImages,
    isUpscaling,
    getCreditCost,
    maxBatch: MAX_BATCH,
  };
}
