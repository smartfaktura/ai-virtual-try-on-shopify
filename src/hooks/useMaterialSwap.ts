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
    `Re-render the EXACT product shown in [REFERENCE IMAGE] but re-skinned with the material shown in the first image ("${materialLabel}").`,

    `SCENE & PRODUCT FIDELITY — STRICT (REFERENCE IMAGE):
- Preserve EVERY structural detail of the product in the reference: silhouette, geometry, proportions, scale, seams, stitching lines, piping, buttons, hardware, legs, feet, frame, and any non-upholstered parts (wood, metal, glass, plastic).
- Identical camera angle, focal length, framing, crop, and aspect ratio. Do NOT zoom, reframe, or shift the camera.
- Identical lighting setup, direction, intensity, colour temperature, and shadow fall.
- Identical background, surface, environment, props, and styling.
- If a person, hand, or body part is present, preserve them with the SAME identity, pose, skin tone, hair, and clothing.`,

    `SWATCH ANALYSIS — READ THE FIRST IMAGE CAREFULLY BEFORE APPLYING:
- Identify the material family from visual cues: hard vs soft; woven vs knit vs pile vs leather vs wood vs metal vs stone vs glass vs lacquer.
- Read the texture grain in detail: smooth / ribbed / brushed / hammered / pebbled / veined; weave scale; pile height and direction; knit loops; slubs and knots.
- Read the sheen and softness: matte / satin / semi-gloss / glossy / metallic; soft and pliable vs rigid; absorbent vs reflective.
- Read the true colour under neutral light. Ignore the swatch's own lighting bias, shadows, background tint, and any props or hands.
- If the material is ambiguous, infer from texture: high pile = velvet or bouclé; flat tight weave = linen or wool; pebble grain = leather; visible knots/rings = wood; reflective + cool = metal; veined and opaque = stone.`,

    `TARGET SURFACES — MATCH PHYSICALITY:
- Soft materials (fabric, leather, velvet, bouclé, suede, wool, linen, knit) → apply ONLY to upholstered / soft / skinnable surfaces. Leave hard parts (legs, frame, base, hardware) untouched.
- Hard materials (wood, metal, stone, glass, lacquer, plastic) → apply ONLY to the corresponding hard parts (frame, legs, base, top, shell). Leave upholstered areas untouched.
- Never paint a soft material onto a hard structural element, or a hard material onto a cushion.`,

    `PHYSICAL REALISM:
- Preserve realistic weave / grain / vein scale relative to the product's real-world size. Never stretch a swatch 1:1 across a large surface; tile it at correct scale.
- Drape, fold, compression and tension must match the material's softness: soft fabrics sag into cushions; leather creases at seams; bouclé puffs evenly; wood and stone stay rigid; metal reflects sharply.
- Shadows, specular highlights, and contact response on the new material must follow the scene's existing light direction and intensity exactly.
- Do NOT import the swatch's own background, lighting, framing, props, or any object edges from the first image.`,

    `NEGATIVES — DO NOT:
- Do NOT change the product's shape, proportions, geometry, or pose.
- Do NOT change the scene, background, camera, framing, or lighting.
- Do NOT add, remove, or restyle any props, people, or accessories.
- Do NOT reinterpret the product as a different model or variant.
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
