import { useState, useCallback } from 'react';
import { toast } from '@/lib/brandedToast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { convertImageToBase64 } from '@/lib/imageUtils';
import { gtmFirstGenerationStarted } from '@/lib/gtm';

interface ProductInput {
  id: string;
  imageUrl: string;
  title: string;
}

interface SwapParams {
  sceneImageUrl: string;
  sceneTitle: string;
  products: ProductInput[];
  ratios: string[];
}

export interface SwapJobInfo {
  jobId: string;
  productId: string;
  productTitle: string;
  productImageUrl?: string;
  ratio: string;
}

export interface SwapResult {
  jobs: SwapJobInfo[];
  batchId: string;
  newBalance: number | null;
}

function buildSwapPrompt(productTitle: string): string {
  return [
    `Recreate the EXACT scene shown in [REFERENCE IMAGE] but with ONE change only: replace the hero product with the new product shown in the first image ("${productTitle}").`,

    `SCENE FIDELITY — STRICT (REFERENCE IMAGE):
- Identical camera angle, focal length, framing, and crop.
- Identical lighting setup, direction, intensity, color temperature, and shadow fall.
- Identical background, surface, environment, props, and styling.
- Identical composition, depth-of-field, perspective, and mood.
- Identical aspect ratio and visible area. Do NOT zoom, crop, reframe, or shift the camera.
- If a human model, hand, or body part is present in the reference, preserve them with the SAME identity (same skin tone, hair, clothing, pose) and only swap the product they interact with.`,

    `PRODUCT REPLACEMENT — STRICT (FIRST IMAGE):
- The new product is "${productTitle}", shown in the first reference image.
- Fully REMOVE the original product from the scene — no ghosting, no residual outline, no leftover color cast on surrounding surfaces.
- Insert the NEW product in the same physical position, scale, orientation, and contact points as the original.
- Preserve every detail of the new product: exact shape, proportions, materials, textures, colors, logos, hardware, stitching, labels, and finish. Do NOT simplify, stylize, or reinterpret.
- The new product must sit naturally in the scene with physically correct shadows, reflections, and contact with surfaces, consistent with the scene's existing lighting.`,

    `NEGATIVES — DO NOT:
- Do NOT change the background, environment, props, or surface.
- Do NOT change the camera angle, framing, or lighting.
- Do NOT keep any visible trace of the original product.
- Do NOT add or remove people, props, or accessories that are not in the reference.
- Do NOT introduce text, watermarks, borders, letterboxing, or padding.
- Do NOT alter the new product's design, color, or proportions.`,
  ].join('\n\n');
}

export function useProductSwap() {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const generate = useCallback(async (params: SwapParams): Promise<SwapResult | null> => {
    if (!user) {
      toast.error('Please sign in to generate');
      return null;
    }

    const { sceneImageUrl, sceneTitle, products, ratios } = params;
    const totalJobs = products.length * ratios.length;

    if (totalJobs === 0) {
      toast.error('Select a scene, at least one product, and a ratio');
      return null;
    }

    setIsGenerating(true);
    setProgress(0);

    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const { data: session } = await supabase.auth.getSession();
    const token = session?.session?.access_token;

    if (!token) {
      toast.error('Please sign in first');
      setIsGenerating(false);
      return null;
    }

    // Load the scene reference once (used for every job)
    let sceneBase64: string;
    try {
      sceneBase64 = await convertImageToBase64(sceneImageUrl);
    } catch {
      toast.error('Failed to load scene image');
      setIsGenerating(false);
      return null;
    }

    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
    const batchId = crypto.randomUUID();
    const jobs: SwapJobInfo[] = [];
    let enqueuedCount = 0;
    let lastNewBalance: number | null = null;
    let firstgenFired = false;
    let shouldStop = false;

    for (const product of products) {
      if (shouldStop) break;

      let productBase64: string;
      try {
        productBase64 = await convertImageToBase64(product.imageUrl);
      } catch {
        toast.error(`Failed to load image for ${product.title}`);
        continue;
      }

      for (const ratio of ratios) {
        if (shouldStop) break;

        const prompt = buildSwapPrompt(product.title);

        const payload: Record<string, unknown> = {
          prompt,
          productImage: productBase64,
          referenceAngleImage: sceneBase64,
          aspectRatio: ratio,
          quality: 'high',
          polishPrompt: false,
          imageCount: 1,
          batch_id: batchId,
          productId: product.id.startsWith('direct') ? null : product.id,
          isPerspective: true,
          forceProModel: true,
          workflow_label: `Product Swap — ${sceneTitle.slice(0, 40)}`,
          workflow_id: 'product-swap',
          workflow_name: 'Product Swap',
          product_name: product.title,
        };

        const MAX_RETRIES = 3;
        let enqueued = false;

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
          try {
            const response = await fetch(`${SUPABASE_URL}/functions/v1/enqueue-generation`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                jobType: 'freestyle',
                payload,
                imageCount: 1,
                quality: 'high',
              }),
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));

              if (response.status === 402) {
                toast.error(`Insufficient credits. ${enqueuedCount} of ${totalJobs} queued.`);
                shouldStop = true;
                break;
              }
              if (response.status === 429) {
                const isBurst = errorData.burst_limit !== undefined;
                const isConcurrent = errorData.max_concurrent !== undefined;
                if ((isBurst || isConcurrent) && attempt < MAX_RETRIES) {
                  await sleep(isConcurrent ? 15_000 : 10_000);
                  continue;
                }
                toast.error(errorData.error || `Rate limit reached. ${enqueuedCount} of ${totalJobs} queued.`);
                shouldStop = true;
                break;
              }

              toast.error(errorData.error || 'Failed to enqueue job');
              break;
            }

            const result = await response.json();
            if (result.newBalance !== undefined && result.newBalance !== null) {
              lastNewBalance = result.newBalance;
            }
            jobs.push({
              jobId: result.jobId,
              productId: product.id,
              productTitle: product.title,
              ratio,
            });
            enqueuedCount++;
            enqueued = true;
            setProgress(Math.round((enqueuedCount / totalJobs) * 100));

            if (!firstgenFired && user?.id && result?.jobId) {
              gtmFirstGenerationStarted({
                userId: user.id,
                productId: product.id ?? null,
                generationId: result.jobId,
                visualType: 'product-swap',
              });
              firstgenFired = true;
            }
            break;
          } catch (err) {
            console.error('Enqueue error:', err);
            break;
          }
        }

        if (shouldStop) break;
        if (enqueued && enqueuedCount < totalJobs) await sleep(500);
      }
    }

    setIsGenerating(false);
    setProgress(0);

    if (jobs.length === 0) {
      toast.error('No images were queued');
      return null;
    }

    return { jobs, batchId, newBalance: lastNewBalance };
  }, [user]);

  return { generate, isGenerating, progress };
}
