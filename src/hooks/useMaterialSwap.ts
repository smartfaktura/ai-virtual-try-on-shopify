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

function buildMaterialSwapPrompt(materialLabel: string): string {
  return [
    `SURGICAL MATERIAL EDIT — pixel-lock mode.`,
    `You are editing the provided image labelled [IMAGE TO EDIT]. Return the EXACT same image at the EXACT same canvas size, crop, camera, framing, and aspect ratio. The ONLY allowed change is the visible material of the upholstered / skinnable surfaces, which must now look like the material sampled from [MATERIAL REFERENCE] ("${materialLabel}").`,

    `ABSOLUTE PRESERVATION (do NOT modify these pixels):
- Product geometry, silhouette, proportions, dimensions, and pose — the chair/object must occupy the exact same pixel footprint as in [IMAGE TO EDIT]. Do not make it longer, wider, taller, or shorter.
- Wooden frame, legs, feet, arms, joinery, hardware, screws, casters — preserve their exact shape, position, wood grain, color, and finish.
- Cushion shape, edges, seams, stitching, piping, buttons, zippers, tags, labels, tiny logos, brand marks, and any small printed or stitched details — keep them in their exact original positions, even near legs or arm joints.
- Background, walls, floor, rug, windows, curtains, plants, props, lighting, shadows, reflections, color temperature, and overall scene.
- Camera angle, lens, perspective, framing, and crop. Do NOT zoom, pan, reframe, or re-render the scene.`,

    `ALLOWED EDIT (only these pixels may change):
- The visible covering of the upholstered cushions / soft skinnable surfaces only.
- Replace their material appearance with the material in [MATERIAL REFERENCE]: match color, sheen, weave/grain, pile height, and texture scale realistically to the product's real-world size.
- Preserve the original cushion shape, folds, compression, drape, seam lines, and shadow structure exactly — only the surface material changes.
- Lighting on the new material must follow the existing light direction, intensity, and shadow fall already present in [IMAGE TO EDIT].`,

    `READ [MATERIAL REFERENCE] CAREFULLY:
- Identify family: leather / bouclé / velvet / linen / wool / knit / suede / wood / metal / stone / lacquer.
- Read true color under neutral light; ignore the swatch's own background, lighting bias, hands, or props.
- Never import [MATERIAL REFERENCE]'s scene, background, edges, framing, or any object from that image.`,

    `HARD NEGATIVES — DO NOT:
- Do NOT regenerate, reimagine, recompose, or restyle the image.
- Do NOT change product dimensions, position, or any non-upholstered part (wood, metal, legs).
- Do NOT add, move, or remove tags, logos, labels, or small details near the legs or frame.
- Do NOT change the background, scene, camera, framing, crop, or lighting.
- Do NOT introduce text, watermarks, borders, letterboxing, or padding.`,
  ].join('\n\n');
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

    const { productImageUrl, productTitle, materials, ratios } = params;
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

        const prompt = buildMaterialSwapPrompt(material.label);

        // Surgical-edit slot mapping (matches generate-freestyle edit path):
        //   sourceImage          = product photo   → labeled [IMAGE TO EDIT] (locked canvas — preserve EVERYTHING)
        //   referenceAngleImage  = material swatch → labeled [MATERIAL REFERENCE] (texture sample only)
        const payload: Record<string, unknown> = {
          prompt,
          sourceImage: productAnchorBase64,
          imageRole: 'edit',
          editIntent: ['enhance'],
          referenceAngleImage: materialBase64,
          aspectRatio: ratio,
          quality: 'high',
          polishPrompt: false,
          imageCount: 1,
          batch_id: batchId,
          productId: null,
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
