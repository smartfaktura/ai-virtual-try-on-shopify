import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/contexts/CreditContext';

export type UpscaleResolution = '2k' | '4k';

export interface UpscaleItem {
  imageUrl: string;
  sourceType: 'freestyle' | 'generation';
  sourceId: string;
}

const CREDIT_COST: Record<UpscaleResolution, number> = {
  '2k': 4,
  '4k': 8,
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
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      if (!token) {
        toast.error('Authentication required');
        return [];
      }

      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

      // Enqueue each image as a separate upscale job
      for (const item of items) {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/enqueue-generation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
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
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          if (response.status === 402) {
            toast.error(errorData.error || 'Insufficient credits');
            break;
          }
          if (response.status === 429) {
            toast.error(errorData.message || errorData.error || 'Rate limited. Please wait.');
            break;
          }

          console.error('[upscale] Enqueue failed:', errorData);
          toast.error(errorData.error || 'Failed to enqueue upscale');
          break;
        }

        const result = await response.json();
        jobIds.push(result.jobId);
      }

      if (jobIds.length > 0) {
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
