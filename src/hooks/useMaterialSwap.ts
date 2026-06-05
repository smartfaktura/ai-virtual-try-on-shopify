import { useState, useCallback } from 'react';
import { toast } from '@/lib/brandedToast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { convertImageToBase64 } from '@/lib/imageUtils';
import { gtmFirstGenerationStarted } from '@/lib/gtm';

interface MaterialInput {
  id: string;
  imageUrl: string;
  label: string;
}

interface SwapParams {
  productImageUrl: string;
  productTitle: string;
  materials: MaterialInput[];
  ratios: string[];
  userNote?: string;
}

export interface MaterialSwapJobInfo {
  jobId: string;
  materialId: string;
  materialLabel: string;
  materialImageUrl?: string;
  ratio: string;
}

export interface MaterialSwapResult {
  jobs: MaterialSwapJobInfo[];
  batchId: string;
  newBalance: number | null;
}

function buildMaterialSwapPrompt(materialLabel: string, userNote?: string): string {
  const parts = [
    `Re-render the EXACT product shown in [REFERENCE IMAGE] but re-skinned with the material/upholstery/colour shown in the first image ("${materialLabel}").`,

    `SCENE & PRODUCT FIDELITY — STRICT (REFERENCE IMAGE):
- Preserve EVERY structural detail of the product in the reference: silhouette, geometry, proportions, scale, seams, stitching lines, piping, buttons, hardware, legs, feet, frame, and any non-upholstered parts (wood, metal, glass, plastic).
- Identical camera angle, focal length, framing, crop, and aspect ratio. Do NOT zoom, reframe, or shift the camera.
- Identical lighting setup, direction, intensity, colour temperature, and shadow fall.
- Identical background, surface, environment, props, and styling.
- If a person, hand, or body part is present, preserve them with the SAME identity, pose, skin tone, hair, and clothing.`,

    `MATERIAL APPLICATION — STRICT (FIRST IMAGE):
- Treat the first image as a material/fabric/colour swatch ONLY. Extract just the surface finish: colour, hue, weave pattern, texture grain, sheen, pile direction.
- Apply this material EXCLUSIVELY to the product's upholstered / soft / skinnable surfaces in the reference. Hard parts (wooden legs, metal frame, glass, etc.) keep their original finish unless the swatch clearly describes them.
- Preserve realistic weave scale relative to the product's real-world size — do NOT stretch a swatch 1:1 across a large surface.
- The new material must sit naturally with physically correct shadows, highlights, and contact response consistent with the scene's existing lighting.
- Do NOT import the swatch's own background, lighting, framing, or any props from the first image.`,

    `NEGATIVES — DO NOT:
- Do NOT change the product's shape, proportions, geometry, or pose.
- Do NOT change the scene, background, camera, framing, or lighting.
- Do NOT add, remove, or restyle any props, people, or accessories.
- Do NOT reinterpret the product as a different model or variant.
- Do NOT introduce text, watermarks, borders, letterboxing, or padding.`,
  ];

  if (userNote && userNote.trim()) {
    parts.push(`ADDITIONAL DIRECTION FROM USER:\n${userNote.trim()}`);
  }

  return parts.join('\n\n');
}

export function useMaterialSwap() {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const generate = useCallback(async (params: SwapParams): Promise<MaterialSwapResult | null> => {
    if (!user) {
      toast.error('Please sign in to generate');
      return null;
    }

    const { productImageUrl, productTitle, materials, ratios, userNote } = params;
    const totalJobs = materials.length * ratios.length;

    if (totalJobs === 0) {
      toast.error('Pick a product image, at least one material, and a ratio');
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

    // Load the product photo once — it's the geometry/scene anchor for every job.
    let productAnchorBase64: string;
    try {
      productAnchorBase64 = await convertImageToBase64(productImageUrl);
    } catch {
      toast.error('Failed to load product image');
      setIsGenerating(false);
      return null;
    }

    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
    const batchId = crypto.randomUUID();
    const jobs: MaterialSwapJobInfo[] = [];
    let enqueuedCount = 0;
    let lastNewBalance: number | null = null;
    let firstgenFired = false;
    let shouldStop = false;

    for (const material of materials) {
      if (shouldStop) break;

      let materialBase64: string;
      try {
        materialBase64 = await convertImageToBase64(material.imageUrl);
      } catch {
        toast.error(`Failed to load material "${material.label}"`);
        continue;
      }

      for (const ratio of ratios) {
        if (shouldStop) break;

        const prompt = buildMaterialSwapPrompt(material.label, userNote);

        // CRITICAL slot mapping:
        //   productImage         = material swatch (primary subject "preserve every detail")
        //   referenceAngleImage  = product photo  (composition / geometry anchor)
        // This is the deliberate inverse of Product Swap.
        const payload: Record<string, unknown> = {
          prompt,
          productImage: materialBase64,
          referenceAngleImage: productAnchorBase64,
          aspectRatio: ratio,
          quality: 'high',
          polishPrompt: false,
          imageCount: 1,
          batch_id: batchId,
          productId: null,
          isPerspective: true,
          forceProModel: true,
          workflow_label: `Material Swap — ${productTitle.slice(0, 40)}`,
          workflow_id: 'material-swap',
          workflow_name: 'Material Swap',
          product_name: material.label,
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
              materialId: material.id,
              materialLabel: material.label,
              materialImageUrl: material.imageUrl,
              ratio,
            });
            enqueuedCount++;
            enqueued = true;
            setProgress(Math.round((enqueuedCount / totalJobs) * 100));

            if (!firstgenFired && user?.id && result?.jobId) {
              gtmFirstGenerationStarted({
                userId: user.id,
                productId: null,
                generationId: result.jobId,
                visualType: 'material-swap',
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
