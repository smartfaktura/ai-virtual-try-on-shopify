import { useState, useCallback } from 'react';
import { useVideoProject } from '@/hooks/useVideoProject';
import type { BulkProgressItem, BulkItemStatus } from '@/components/app/video/BulkProgressBanner';
import { toast } from '@/lib/brandedToast';

interface BulkImage {
  id: string;
  url: string;
  preview: string;
}

interface BulkAnimateParams {
  category: string;
  sceneType: string;
  motionGoalId: string;
  cameraMotion: string;
  subjectMotion: string;
  realismLevel: string;
  loopStyle: string;
  motionIntensity: 'low' | 'medium' | 'high';
  preserveScene: boolean;
  preserveProductDetails: boolean;
  preserveIdentity: boolean;
  preserveOutfit: boolean;
  aspectRatio: '1:1' | '16:9' | '9:16';
  duration: '5' | '10';
  audioMode: 'silent' | 'ambient';
  userPrompt?: string;
}

export function useBulkVideoProject() {
  const videoProject = useVideoProject();
  const [bulkItems, setBulkItems] = useState<BulkProgressItem[]>([]);
  const [isBulkRunning, setIsBulkRunning] = useState(false);
  const [isBulkComplete, setIsBulkComplete] = useState(false);

  const updateItem = (id: string, status: BulkItemStatus) => {
    setBulkItems(prev => prev.map(item => item.id === id ? { ...item, status } : item));
  };

  const runBulkAnimatePipeline = useCallback(async (
    images: BulkImage[],
    params: BulkAnimateParams,
    perImageParams?: Map<string, Record<string, any>>,
  ) => {
    if (images.length === 0) return;

    setIsBulkRunning(true);
    setIsBulkComplete(false);
    setBulkItems(images.map(img => ({ id: img.id, preview: img.preview, status: 'pending' as BulkItemStatus })));

    let completed = 0;
    let failed = 0;

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      updateItem(img.id, 'queued');

      try {
        // Reset pipeline state for each image
        if (i > 0) {
          videoProject.resetPipeline();
          // Small pacing delay between enqueues
          await new Promise(r => setTimeout(r, 300));
        }

        updateItem(img.id, 'generating');

        // Run pipeline — this enqueues a job, doesn't wait for completion
        await videoProject.runAnimatePipeline({
          imageUrl: img.url,
          ...params,
          userPrompt: params.userPrompt || undefined,
        });

        // Mark as queued (the actual generation happens async in the queue)
        updateItem(img.id, 'complete');
        completed++;
      } catch (err) {
        console.error(`[useBulkVideoProject] Failed for image ${img.id}:`, err);
        updateItem(img.id, 'failed');
        failed++;
      }
    }

    setIsBulkRunning(false);
    setIsBulkComplete(true);

    if (failed === 0) {
      toast.success(`All ${completed} videos queued successfully!`);
    } else {
      toast.info(`${completed} videos queued, ${failed} failed`);
    }
  }, [videoProject]);

  const resetBulk = useCallback(() => {
    setBulkItems([]);
    setIsBulkRunning(false);
    setIsBulkComplete(false);
    videoProject.resetPipeline();
  }, [videoProject]);

  return {
    ...videoProject,
    bulkItems,
    isBulkRunning,
    isBulkComplete,
    runBulkAnimatePipeline,
    resetBulk,
  };
}
