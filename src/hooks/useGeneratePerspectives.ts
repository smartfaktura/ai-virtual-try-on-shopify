import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { convertImageToBase64 } from '@/lib/imageUtils';

interface VariationInput {
  label: string;
  instruction: string;
  referenceImageUrl: string | null;
}

interface ProductInput {
  id: string;
  imageUrl: string;
  title: string;
}

interface GenerateParams {
  products: ProductInput[];
  variations: VariationInput[];
  ratios: string[];
  quality: 'standard' | 'high';
}

interface UseGeneratePerspectivesOptions {
  onComplete?: () => void;
}

/**
 * Build the full perspective prompt with strict product identity rules.
 * This replaces the generic polisher which conflicts with angle-specific directives.
 */
function buildPerspectivePrompt(
  variation: VariationInput,
  productTitle: string,
  hasReferenceImage: boolean,
): string {
  const layers: string[] = [];

  // System instructions — perspective-specific
  layers.push(
    `Generate a photorealistic product image from the specified angle/perspective. Maintain the exact product identity — shape, material, color, texture, logos, hardware, stitching — from the source product image. The ONLY change is the camera angle.`
  );

  // Perspective directive — the specific angle instruction
  layers.push(
    `PERSPECTIVE DIRECTIVE: ${variation.instruction}\n\nProduct: "${productTitle}". Capture from the "${variation.label}" perspective exactly as described above.`
  );

  // Strict product identity rules
  layers.push(
    `PRODUCT IDENTITY — STRICT: The product in this image must be the EXACT same product from [PRODUCT IMAGE]. Preserve every detail: shape, material, color, texture, logo placement, hardware, stitching, seams, proportions, and finish. Do NOT alter, simplify, stylize, or "reimagine" any design element. Do NOT add or remove any features. The ONLY change is the camera angle/perspective as described above.`
  );

  // Reference image handling — angle-aware, not scene inspiration
  if (hasReferenceImage) {
    layers.push(
      `ANGLE REFERENCE: [REFERENCE IMAGE] shows the same product from the requested angle. Use it to understand the product's appearance from this perspective — back construction, side profile shape, hidden details, etc. This is NOT scene or mood inspiration — it is a product identity reference for this specific angle. Match the product details visible in this reference while maintaining the exact same product identity from [PRODUCT IMAGE].`
    );
  }

  // Cross-angle environment consistency
  layers.push(
    `ENVIRONMENT CONSISTENCY: Place the product on a clean, neutral surface in a professional studio environment. Use soft, even lighting with minimal shadows. The lighting direction, color temperature, and background must be consistent as if all angles were shot in the same photography session. No dramatic shadows, no colored gels, no environmental props.`
  );

  // Photography quality directives (embedded directly, no generic polisher)
  layers.push(
    `PHOTOGRAPHY QUALITY: Ultra high resolution, photorealistic rendering. Shot on 85mm f/2.8 macro lens. Razor-sharp focus across the product surface. Visible material textures — fabric weave, leather grain, metal brushing, stitching thread. Micro-contrast on surfaces. Clean highlight roll-off. Professional product photography lighting.`
  );

  // Negatives — perspective-specific (no "reimagine" instructions)
  layers.push(
    `CRITICAL — DO NOT include any of the following:
- No people, no human figures, no hands, no body parts
- No blurry or out-of-focus areas
- No AI-looking smoothing or plastic textures on materials
- No collage layouts or split-screen compositions
- No compositing artifacts, no mismatched lighting, no pasted-in look
- No black borders, black bars, letterboxing, pillarboxing, or padding
- Do NOT change the product design, color, or any identifying features
- Do NOT add props, accessories, or items not present on the original product
- Do NOT alter proportions or scale of the product`
  );

  return layers.join('\n\n');
}

export function useGeneratePerspectives(options?: UseGeneratePerspectivesOptions) {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const generate = useCallback(async (params: GenerateParams) => {
    if (!user) {
      toast.error('Please sign in to generate');
      return;
    }

    const { products, variations, ratios, quality } = params;
    const totalJobs = products.length * variations.length * ratios.length;

    if (totalJobs === 0) {
      toast.error('Select at least one product, angle, and ratio');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const { data: session } = await supabase.auth.getSession();
    const token = session?.session?.access_token;

    if (!token) {
      toast.error('Authentication required');
      setIsGenerating(false);
      return;
    }

    const batchId = crypto.randomUUID();
    let enqueuedCount = 0;

    // Enqueue sequentially to avoid credit race conditions
    for (const product of products) {
      // Convert product image to base64 once per product
      let productBase64: string | null = null;
      try {
        productBase64 = await convertImageToBase64(product.imageUrl);
      } catch {
        toast.error(`Failed to load image for ${product.title}`);
        continue;
      }

      for (const variation of variations) {
        // Convert reference image if provided
        let referenceBase64: string | null = null;
        if (variation.referenceImageUrl) {
          try {
            referenceBase64 = await convertImageToBase64(variation.referenceImageUrl);
          } catch {
            // Non-critical — proceed without reference
            console.warn('Failed to load reference image:', variation.referenceImageUrl);
          }
        }

        for (const ratio of ratios) {
          // Build the full perspective-specific prompt (replaces generic polisher)
          const perspectivePrompt = buildPerspectivePrompt(
            variation,
            product.title,
            !!referenceBase64,
          );

          const payload: Record<string, unknown> = {
            prompt: perspectivePrompt,
            productImage: productBase64,
            aspectRatio: ratio,
            quality,
            polishPrompt: false, // Skip generic polisher — prompt is fully built
            imageCount: 1,
            batch_id: batchId,
            productId: product.id === 'direct' ? null : product.id,
            // Perspective-specific flags
            isPerspective: true,
            forceProModel: true,
            variation_instruction: variation.instruction,
            variation_label: variation.label,
          };

          // Pass reference as referenceAngleImage (not sourceImage)
          // so the edge function treats it as product identity, not scene inspiration
          if (referenceBase64) {
            payload.referenceAngleImage = referenceBase64;
          }

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
                quality,
              }),
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));

              if (response.status === 402) {
                toast.error(`Insufficient credits. ${enqueuedCount} of ${totalJobs} queued.`);
                break;
              }
              if (response.status === 429) {
                toast.error(errorData.message || `Rate limit reached. ${enqueuedCount} of ${totalJobs} queued.`);
                break;
              }

              toast.error(errorData.error || `Failed to enqueue job`);
              continue;
            }

            enqueuedCount++;
            setProgress(Math.round((enqueuedCount / totalJobs) * 100));
          } catch (err) {
            console.error('Enqueue error:', err);
            continue;
          }
        }
      }
    }

    if (enqueuedCount > 0) {
      toast.success(`${enqueuedCount} perspective${enqueuedCount > 1 ? 's' : ''} queued!`);
      options?.onComplete?.();
    } else {
      toast.error('No images were queued');
    }

    setIsGenerating(false);
    setProgress(0);
  }, [user, options]);

  return { generate, isGenerating, progress };
}
