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

export interface PerspectiveJobInfo {
  jobId: string;
  variationLabel: string;
  productTitle: string;
  ratio: string;
}

export interface GenerateResult {
  jobs: PerspectiveJobInfo[];
  batchId: string;
}

/**
 * Detect perspective category from the variation label.
 */
type PerspectiveCategory = 'macro' | 'angle' | 'context';

function detectCategory(label: string): PerspectiveCategory {
  const l = label.toLowerCase();
  if (l.includes('close') || l.includes('macro')) return 'macro';
  if (l.includes('wide') || l.includes('environment')) return 'context';
  return 'angle'; // back, left, right, etc.
}

/**
 * Per-perspective photography DNA — lens, DoF, lighting, and special direction.
 */
function getPhotographyDNA(category: PerspectiveCategory, label: string): string {
  switch (category) {
    case 'macro':
      return `PHOTOGRAPHY DNA — MACRO/CLOSE-UP:
- Lens: 100mm macro lens at f/4–f/5.6, focus-stacked for edge-to-edge sharpness across the product surface.
- Lighting: Raking light at 15–30° to the surface to reveal material grain, texture weave, stitching thread, embossing depth, and micro-scratches. Secondary fill light opposite at 50% intensity.
- Framing: Extreme tight crop — product fills 85–95% of the frame. Show a single defining detail region (zipper pull, logo deboss, fabric weave, clasp mechanism).
- Depth: Visible micro-texture — individual thread counts on fabric, leather pore structure, metal brushing direction, paint flake edges.
- DO NOT smooth textures. Preserve every imperfection visible in the source.`;

    case 'context':
      return `PHOTOGRAPHY DNA — WIDE/ENVIRONMENT:
- Lens: 35mm at f/5.6, natural perspective with slight wide-angle depth.
- Product-to-frame ratio: Product occupies 30–40% of the frame. It is the hero element but shown in spatial context.
- Styling: Complementary lifestyle props and surfaces that match the product's category — a leather bag on a marble console, a sneaker on concrete steps, a watch on a wooden desk. Props support, never compete.
- Lighting: Natural or mixed — soft directional window light with ambient fill. Slight depth-of-field fall-off on background elements.
- Mood: Editorial lifestyle. The image should feel like a curated brand lookbook shot, not a catalog cutout.
- DO NOT center the product rigidly. Use rule-of-thirds or golden-ratio placement.`;

    default: { // 'angle' — back, left, right, etc.
      const isBack = label.toLowerCase().includes('back');
      const sideNote = label.toLowerCase().includes('left')
        ? 'Camera positioned at exact 90° to the product\'s left face. The left side panel fills the frame.'
        : label.toLowerCase().includes('right')
          ? 'Camera positioned at exact 90° to the product\'s right face. The right side panel fills the frame.'
          : '';

      return `PHOTOGRAPHY DNA — PRODUCT ANGLE:
- Lens: 85mm at f/8, deep depth-of-field ensuring the entire product is tack-sharp from nearest edge to farthest.
- Camera height: Positioned at the product's vertical midpoint — not looking down, not looking up. Straight-on at the product center of mass.
- Framing: Product fills 70–80% of the frame with consistent margins on all sides. Match the exact same scale as a front-facing hero shot.
${isBack ? '- Back-specific: Show all rear construction details — back panel seams, interior lining edge, care labels if visible, rear pocket construction, heel counter on shoes. If the product has a label or tag on the back, it must be legible.' : ''}
${sideNote ? `- Side-specific: ${sideNote}` : ''}
- Lighting: Same key-light direction and intensity as a front-facing shot. Consistent shadow fall direction across all angles (light from upper-left at 45°).
- DO NOT rotate or tilt the product — only the camera moves around the product.`;
    }
  }
}

/**
 * Per-perspective environment rules.
 */
function getEnvironmentRules(category: PerspectiveCategory): string {
  if (category === 'context') {
    return `ENVIRONMENT — LIFESTYLE CONTEXT: Place the product in a curated, on-brand environment. The setting should feel intentional and editorial — a styled surface, a complementary interior, or an outdoor scene that elevates the product story. Use natural materials and neutral-warm tones. Maintain soft, directional lighting. The product must remain the clear visual hero despite the richer environment.`;
  }
  return `ENVIRONMENT — STUDIO CONSISTENCY: Clean, neutral surface (white, light gray, or off-white). Professional studio lighting — soft key light from upper-left at 45°, fill light opposite at 40% intensity, subtle rim light for edge separation. No colored gels, no dramatic shadows, no environmental props. The lighting direction, color temperature (5500K daylight), and background must be identical across all angle shots as if photographed in the same session.`;
}

/**
 * Build the full perspective prompt with strict product identity rules.
 * Angle-category-aware: different photography DNA per perspective type.
 */
function buildPerspectivePrompt(
  variation: VariationInput,
  productTitle: string,
  hasReferenceImage: boolean,
): string {
  const category = detectCategory(variation.label);
  const layers: string[] = [];

  // System instructions
  layers.push(
    `Generate a photorealistic product image from the specified angle/perspective. Maintain the exact product identity — shape, material, color, texture, logos, hardware, stitching — from the source product image. The ONLY change is the camera angle.`
  );

  // Perspective directive
  layers.push(
    `PERSPECTIVE DIRECTIVE: ${variation.instruction}\n\nProduct: "${productTitle}". Capture from the "${variation.label}" perspective exactly as described above.`
  );

  // Strict product identity
  layers.push(
    `PRODUCT IDENTITY — STRICT: The product in this image must be the EXACT same product from [PRODUCT IMAGE]. Preserve every detail: shape, material, color, texture, logo placement, hardware, stitching, seams, proportions, and finish. Do NOT alter, simplify, stylize, or "reimagine" any design element. Do NOT add or remove any features. The ONLY change is the camera angle/perspective as described above.`
  );

  // Reference image handling
  if (hasReferenceImage) {
    layers.push(
      category === 'context'
        ? `ANGLE REFERENCE: [REFERENCE IMAGE] shows the product in context or from a similar pulled-back perspective. Use it to understand the product's appearance and proportions at this distance. Match the product details visible while creating an elevated lifestyle environment.`
        : `ANGLE REFERENCE: [REFERENCE IMAGE] shows the same product from the requested angle. Use it to understand the product's appearance from this perspective — back construction, side profile shape, hidden details, etc. This is NOT scene or mood inspiration — it is a product identity reference for this specific angle. Match the product details visible in this reference while maintaining the exact same product identity from [PRODUCT IMAGE].`
    );
  }

  // Angle-specific photography DNA
  layers.push(getPhotographyDNA(category, variation.label));

  // Category-aware environment rules
  layers.push(getEnvironmentRules(category));

  // Negatives
  layers.push(
    `CRITICAL — DO NOT include any of the following:
- No people, no human figures, no hands, no body parts
- No blurry or out-of-focus areas${category === 'macro' ? ' (use focus stacking)' : ''}
- No AI-looking smoothing or plastic textures on materials
- No collage layouts or split-screen compositions
- No compositing artifacts, no mismatched lighting, no pasted-in look
- No black borders, black bars, letterboxing, pillarboxing, or padding
- Do NOT change the product design, color, or any identifying features
- Do NOT add props, accessories, or items not present on the original product${category === 'context' ? ' (complementary styling props are allowed for context shots only)' : ''}
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
            // Nullify synthetic IDs (library/scratch) that aren't real user_products UUIDs
            productId: ['direct', 'fs-', 'job-'].some(prefix => product.id.startsWith(prefix)) ? null : product.id,
            // Perspective-specific flags
            isPerspective: true,
            forceProModel: true,
            variation_instruction: variation.instruction,
            variation_label: variation.label,
            // Clean label for library display (not "Freestyle")
            workflow_label: `Product Perspectives — ${variation.label}`,
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
