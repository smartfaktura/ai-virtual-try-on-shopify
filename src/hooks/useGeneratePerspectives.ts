import { useState, useCallback } from 'react';
import { toast } from '@/lib/brandedToast';
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
  newBalance: number | null;
}

// ---------------------------------------------------------------------------
// Scene classification
// ---------------------------------------------------------------------------

type SceneMode = 'product-only' | 'on-model';

async function classifyScene(imageBase64: string, token: string): Promise<SceneMode> {
  try {
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const res = await fetch(`${SUPABASE_URL}/functions/v1/classify-scene`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ imageBase64 }),
    });
    if (!res.ok) return 'product-only';
    const data = await res.json();
    return data.hasPeople ? 'on-model' : 'product-only';
  } catch {
    return 'product-only';
  }
}

// ---------------------------------------------------------------------------
// Perspective category detection
// ---------------------------------------------------------------------------

type PerspectiveCategory = 'macro' | 'angle' | 'context' | 'top_down';

function detectCategory(label: string): PerspectiveCategory {
  const l = label.toLowerCase();
  if (l.includes('super macro') || l.includes('texture')) return 'macro';
  if (l.includes('close') || l.includes('macro')) return 'macro';
  if (l.includes('top-down') || l.includes('top down') || l.includes('flat lay') || l.includes('overhead') || l.includes('bird')) return 'top_down';
  if (l.includes('wide') || l.includes('environment')) return 'context';
  return 'angle';
}

// ---------------------------------------------------------------------------
// Photography DNA — scene-mode aware
// ---------------------------------------------------------------------------

function getPhotographyDNA(category: PerspectiveCategory, label: string, mode: SceneMode): string {
  if (mode === 'on-model') {
    return getOnModelPhotographyDNA(category, label);
  }
  return getProductOnlyPhotographyDNA(category, label);
}

function getOnModelPhotographyDNA(category: PerspectiveCategory, label: string): string {
  switch (category) {
    case 'macro':
      return `PHOTOGRAPHY DNA — MACRO/CLOSE-UP (ON-MODEL):
- Lens: 100mm macro at f/4–f/5.6, focus-stacked on the product area.
- Framing: Extreme tight crop on the product detail zone. The person's body may be partially visible (hand, torso, shoulder, wrist) providing natural context for the product.
- Show fabric weave on skin, clasp against wrist, stitching detail on a worn garment, texture of material as it drapes over the body.
- The human skin/body visible in frame must match the source image exactly — same skin tone, same body area.
- Lighting: Raking light at 15–30° to reveal material texture. Skin should look natural, not over-smoothed.`;

    case 'top_down':
      return `PHOTOGRAPHY DNA — TOP-DOWN / FLAT LAY (ON-MODEL):
- Lens: 50mm at f/8, camera mounted directly overhead at exact 90° perpendicular to the ground plane.
- The model is lying down or the camera is positioned directly above looking straight down at the model and product.
- Framing: Full product and relevant body area visible from above. Show the top silhouette and how the product sits on/against the body.
- Lighting: Soft even overhead light with minimal shadows — dual strip softboxes flanking the camera from above.
- The model's body, skin tone, and styling must match the source image exactly.
- DO NOT tilt the camera — maintain perfectly perpendicular overhead angle.`;

    case 'context':
      return `PHOTOGRAPHY DNA — WIDE/ENVIRONMENT (ON-MODEL):
- Lens: 35mm at f/5.6, natural perspective.
- Person-to-frame ratio: The model and product together occupy 40–60% of the frame, shown in a lifestyle environment.
- The model's full or three-quarter body is visible. Same pose intent as source, adapted for the wider framing.
- Styling: Complementary lifestyle environment that matches the product category and brand tone.
- Lighting: Natural or mixed — soft directional window light with ambient fill.
- Mood: Editorial lifestyle lookbook. The model is the hero, the environment supports the story.
- DO NOT center rigidly. Use rule-of-thirds or golden-ratio placement.`;

    default: {
      const isBack = label.toLowerCase().includes('back');
      const l = label.toLowerCase();
      const sideNote = l.includes('left')
        ? l.includes('45')
          ? 'Camera positioned at 45° to the model\'s front-left. Both the front face and left side of the body/garment are visible, creating a three-quarter view with natural depth.'
          : 'Camera positioned at exact 90° to the model\'s left side. Left profile of face and body visible.'
        : l.includes('right')
          ? l.includes('45')
            ? 'Camera positioned at 45° to the model\'s front-right. Both the front face and right side of the body/garment are visible, creating a three-quarter view with natural depth.'
            : 'Camera positioned at exact 90° to the model\'s right side. Right profile of face and body visible.'
          : '';

      return `PHOTOGRAPHY DNA — ON-MODEL ANGLE:
- Lens: 85mm at f/8, deep depth-of-field ensuring both the model and product are tack-sharp.
- Camera height: At the model's torso midpoint — straight-on, not looking down or up.${l.includes('45') ? ' Slightly elevated (15–20° above horizontal) for the classic hero angle.' : ''}
- Framing: Model fills 70–80% of the frame. Same body coverage as the source (full body, upper body, etc.).
- The model rotates naturally to present the requested angle — the camera moves around the model.
${isBack ? '- Back-specific: Model\'s back is facing camera. Show rear construction of garment, back panel, any visible labels, the way fabric falls across the back and shoulders. The model\'s head may be slightly turned or facing away.' : ''}
${sideNote ? `- Side-specific: ${sideNote}` : ''}
- Pose: Same pose INTENT as source — if standing with weight on one hip, maintain that. If arms are at sides, keep them. Adapt naturally for the new angle but preserve the energy and stance.
- Lighting: Same key-light direction as source. Consistent shadow fall across all angles.
- DO NOT change the model's body position dramatically — only rotate the camera viewpoint.`;
    }
  }
}

function getProductOnlyPhotographyDNA(category: PerspectiveCategory, label: string): string {
  switch (category) {
    case 'macro':
      return `PHOTOGRAPHY DNA — MACRO/CLOSE-UP:
- Lens: 100mm macro lens at f/4–f/5.6, focus-stacked for edge-to-edge sharpness across the product surface.
- Lighting: Raking light at 15–30° to the surface to reveal material grain, texture weave, stitching thread, embossing depth, and micro-scratches. Secondary fill light opposite at 50% intensity.
- Framing: Extreme tight crop — product fills 85–95% of the frame. Show a single defining detail region (zipper pull, logo deboss, fabric weave, clasp mechanism).
- Depth: Visible micro-texture — individual thread counts on fabric, leather pore structure, metal brushing direction, paint flake edges.
- DO NOT smooth textures. Preserve every imperfection visible in the source.`;

    case 'top_down':
      return `PHOTOGRAPHY DNA — TOP-DOWN / FLAT LAY:
- Lens: 50mm at f/8, camera mounted directly overhead at exact 90° perpendicular to the surface.
- Framing: Product centered in frame, showing the full top silhouette. Reveal top-facing design elements — logos, closures, top panels, zippers, clasps.
- Lighting: Soft even overhead light with minimal shadows — dual strip softboxes flanking the camera from above. No harsh directional shadows that obscure top details.
- Surface: Same surface/background as the source image. The product rests naturally on its base.
- DO NOT tilt the camera — maintain perfectly perpendicular overhead angle.
- DO NOT add props unless the source image contained them.`;

    case 'context':
      return `PHOTOGRAPHY DNA — WIDE/ENVIRONMENT:
- Lens: 35mm at f/5.6, natural perspective with slight wide-angle depth.
- Product-to-frame ratio: Product occupies 30–40% of the frame. It is the hero element but shown in spatial context.
- Styling: Complementary lifestyle props and surfaces that match the product's category — a leather bag on a marble console, a sneaker on concrete steps, a watch on a wooden desk. Props support, never compete.
- Lighting: Natural or mixed — soft directional window light with ambient fill. Slight depth-of-field fall-off on background elements.
- Mood: Editorial lifestyle. The image should feel like a curated brand lookbook shot, not a catalog cutout.
- DO NOT center the product rigidly. Use rule-of-thirds or golden-ratio placement.`;

    default: {
      const isBack = label.toLowerCase().includes('back');
      const l = label.toLowerCase();
      const sideNote = l.includes('left')
        ? l.includes('45')
          ? 'Camera positioned at 45° to the product\'s front-left. Both the front face and left side panel are visible, creating a three-quarter view with natural depth and dimensionality.'
          : 'Camera positioned at exact 90° to the product\'s left face. The left side panel fills the frame.'
        : l.includes('right')
          ? l.includes('45')
            ? 'Camera positioned at 45° to the product\'s front-right. Both the front face and right side panel are visible, creating a three-quarter view with natural depth and dimensionality.'
            : 'Camera positioned at exact 90° to the product\'s right face. The right side panel fills the frame.'
          : '';

      return `PHOTOGRAPHY DNA — PRODUCT ANGLE:
- Lens: 85mm at f/8, deep depth-of-field ensuring the entire product is tack-sharp from nearest edge to farthest.
- Camera height: Positioned at the product's vertical midpoint — not looking down, not looking up. Straight-on at the product center of mass.${l.includes('45') ? ' Slightly elevated (15–20° above horizontal) for the classic e-commerce hero angle.' : ''}
- Framing: Product fills 70–80% of the frame with consistent margins on all sides. Match the exact same scale as a front-facing hero shot.
${isBack ? '- Back-specific: Show all rear construction details — back panel seams, interior lining edge, care labels if visible, rear pocket construction, heel counter on shoes. If the product has a label or tag on the back, it must be legible.' : ''}
${sideNote ? `- Side-specific: ${sideNote}` : ''}
- Lighting: Same key-light direction and intensity as a front-facing shot. Consistent shadow fall direction across all angles (light from upper-left at 45°).
- DO NOT rotate or tilt the product — only the camera moves around the product.`;
    }
  }
}

// ---------------------------------------------------------------------------
// Environment rules — scene-mode aware
// ---------------------------------------------------------------------------

function getEnvironmentRules(category: PerspectiveCategory, mode: SceneMode): string {
  if (category === 'context') {
    return mode === 'on-model'
      ? `ENVIRONMENT — PRESERVE SOURCE CONTEXT (ON-MODEL): Maintain the same environmental style, mood, and setting from the source image. If the source shows a street, interior, studio, or outdoor scene, stay in that EXACT same type of environment with consistent materials, tones, and props. The model interacts naturally with the space. Maintain the same lighting direction and color temperature as the source. The model + product must remain the clear visual hero.`
      : `ENVIRONMENT — PRESERVE SOURCE CONTEXT: Maintain the same environmental style, mood, and setting from the source image. If the source has a specific background (street, studio, interior, outdoor), stay in that EXACT same type of environment with consistent materials, tones, and surface. Do NOT introduce a new or different background. Maintain the same lighting direction and color temperature as the source. The product must remain the clear visual hero.`;
  }
  return mode === 'on-model'
    ? `ENVIRONMENT — MATCH SOURCE EXACTLY (ON-MODEL): Match the EXACT background, surface, and environment from [PRODUCT IMAGE]. Same backdrop color/texture, same surface material, same lighting setup. Professional studio lighting — soft key light from upper-left at 45°, fill light opposite at 40% intensity, subtle rim light for edge separation. The lighting direction, color temperature (5500K daylight), and background must be identical to the source image. The model stands/poses on the same surface as in the source.`
    : `ENVIRONMENT — MATCH SOURCE EXACTLY: Match the EXACT background, surface, and environment from [PRODUCT IMAGE]. Same backdrop color/texture, same surface material, same lighting setup. Do NOT introduce a new background or studio setup. Professional studio lighting — soft key light from upper-left at 45°, fill light opposite at 40% intensity, subtle rim light for edge separation. The lighting direction, color temperature (5500K daylight), and background must be identical to the source image as if photographed in the same session.`;
}

// ---------------------------------------------------------------------------
// Negatives — scene-mode aware
// ---------------------------------------------------------------------------

function getNegatives(category: PerspectiveCategory, mode: SceneMode): string {
  const shared = `- No blurry or out-of-focus areas${category === 'macro' ? ' (use focus stacking)' : ''}
- No AI-looking smoothing or plastic textures on materials
- No collage layouts or split-screen compositions
- No compositing artifacts, no mismatched lighting, no pasted-in look
- No black borders, black bars, letterboxing, pillarboxing, or padding
- Do NOT change the product design, color, or any identifying features
- Do NOT alter proportions or scale of the product
- Do NOT change the background, environment, or surface from the source image`;

  if (mode === 'on-model') {
    return `CRITICAL — DO NOT include any of the following:
${shared}
- Do NOT change the model's face, body type, skin tone, hair style/color, or clothing fit
- Do NOT remove the person from the scene
- Do NOT add additional people who were not in the source
- Do NOT swap, age, or alter the model's appearance in any way
- Maintain the same styling, accessories, and overall aesthetic from the source`;
  }

  return `CRITICAL — DO NOT include any of the following:
- No people, no human figures, no hands, no body parts
${shared}
- Do NOT add props, accessories, or items not present on the original product${category === 'context' ? ' (complementary styling props are allowed for context shots only)' : ''}`;
}

// ---------------------------------------------------------------------------
// Full prompt builder — scene-mode aware
// ---------------------------------------------------------------------------

function buildPerspectivePrompt(
  variation: VariationInput,
  productTitle: string,
  hasReferenceImage: boolean,
  mode: SceneMode,
): string {
  const category = detectCategory(variation.label);
  const layers: string[] = [];

  // System instruction — scene-mode aware
  if (mode === 'on-model') {
    layers.push(
      `Reproduce this exact scene from a new camera angle. The scene contains a human model wearing/holding/interacting with a product. Preserve BOTH the product identity AND the human subject — same person, same pose intent, same styling, same garment fit. Preserve the EXACT same background, surface, lighting setup, and environment from [PRODUCT IMAGE]. The ONLY change is the camera angle.`
    );
  } else {
    layers.push(
      `Generate a photorealistic product image from the specified angle/perspective. Maintain the exact product identity — shape, material, color, texture, logos, hardware, stitching — from the source product image. Preserve the EXACT same background, surface, lighting setup, and environment from [PRODUCT IMAGE]. The ONLY change is the camera angle.`
    );
  }

  // Perspective directive
  layers.push(
    `PERSPECTIVE DIRECTIVE: ${variation.instruction}\n\nProduct: "${productTitle}". Capture from the "${variation.label}" perspective exactly as described above.`
  );

  // Identity block — scene-mode aware
  if (mode === 'on-model') {
    layers.push(
      `SCENE IDENTITY — STRICT: Preserve the EXACT product from [SOURCE IMAGE] — shape, material, color, texture, logos, hardware, stitching, seams, proportions, and finish. ALSO preserve the human subject — same apparent age, ethnicity, skin tone, hair style/color, body type, and facial features. The garment/product must fit and drape identically on the model's body. Do NOT swap, age, or alter the model. Do NOT change the product design. The ONLY change is the camera angle/perspective.`
    );
  } else {
    layers.push(
      `PRODUCT IDENTITY — STRICT: The product in this image must be the EXACT same product from [PRODUCT IMAGE]. Preserve every detail: shape, material, color, texture, logo placement, hardware, stitching, seams, proportions, and finish. Do NOT alter, simplify, stylize, or "reimagine" any design element. Do NOT add or remove any features. The ONLY change is the camera angle/perspective as described above.`
    );
  }

  // Reference image handling
  if (hasReferenceImage) {
    if (mode === 'on-model') {
      layers.push(
        category === 'context'
          ? `ANGLE REFERENCE: [REFERENCE IMAGE] shows the model and product from a similar perspective. Use it to understand how the model and product appear at this distance and angle. Match both the product details and the model's appearance.`
          : `ANGLE REFERENCE: [REFERENCE IMAGE] shows the same model and product from the requested angle. Use it to understand how the garment drapes, how the model's body appears from this perspective, and any construction details visible from this angle. Match both identities.`
      );
    } else {
      layers.push(
        category === 'context'
          ? `ANGLE REFERENCE: [REFERENCE IMAGE] shows the product in context or from a similar pulled-back perspective. Use it to understand the product's appearance and proportions at this distance. Match the product details visible while creating an elevated lifestyle environment.`
          : `ANGLE REFERENCE: [REFERENCE IMAGE] shows the same product from the requested angle. Use it to understand the product's appearance from this perspective — back construction, side profile shape, hidden details, etc. This is NOT scene or mood inspiration — it is a product identity reference for this specific angle. Match the product details visible in this reference while maintaining the exact same product identity from [PRODUCT IMAGE].`
      );
    }
  }

  // Photography DNA — scene-mode aware
  layers.push(getPhotographyDNA(category, variation.label, mode));

  // Environment rules — scene-mode aware
  layers.push(getEnvironmentRules(category, mode));

  // Negatives — scene-mode aware
  layers.push(getNegatives(category, mode));

  return layers.join('\n\n');
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useGeneratePerspectives() {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const generate = useCallback(async (params: GenerateParams): Promise<GenerateResult | null> => {
    if (!user) {
      toast.error('Please sign in to generate');
      return null;
    }

    const { products, variations, ratios, quality } = params;
    const totalJobs = products.length * variations.length * ratios.length;

    if (totalJobs === 0) {
      toast.error('Select at least one product, angle, and ratio');
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

    // No pre-flight limit — the DB function enforces burst & concurrency limits.
    // The client retries on burst-limit 429s with backoff.

    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
    const batchId = crypto.randomUUID();
    let enqueuedCount = 0;
    const jobs: PerspectiveJobInfo[] = [];
    let lastNewBalance: number | null = null;

    let shouldStop = false;
    for (const product of products) {
      if (shouldStop) break;

      let productBase64: string | null = null;
      try {
        productBase64 = await convertImageToBase64(product.imageUrl);
      } catch {
        toast.error(`Failed to load image for ${product.title}`);
        continue;
      }

      // Classify scene once per product image
      const sceneMode = await classifyScene(productBase64, token);
      console.log(`[Perspectives] Scene classification for "${product.title}": ${sceneMode}`);

      for (const variation of variations) {
        if (shouldStop) break;

        let referenceBase64: string | null = null;
        if (variation.referenceImageUrl) {
          try {
            referenceBase64 = await convertImageToBase64(variation.referenceImageUrl);
          } catch {
            console.warn('Failed to load reference image:', variation.referenceImageUrl);
          }
        }

        for (const ratio of ratios) {
          const perspectivePrompt = buildPerspectivePrompt(
            variation,
            product.title,
            !!referenceBase64,
            sceneMode,
          );

          const payload: Record<string, unknown> = {
            prompt: perspectivePrompt,
            productImage: productBase64,
            aspectRatio: ratio,
            quality,
            polishPrompt: false,
            imageCount: 1,
            batch_id: batchId,
            productId: ['direct', 'fs-', 'job-'].some(prefix => product.id.startsWith(prefix)) ? null : product.id,
            isPerspective: true,
            forceProModel: true,
            variation_instruction: variation.instruction,
            variation_label: variation.label,
            workflow_label: `Picture Perspectives — ${variation.label}`,
            workflow_id: 'perspectives',
            workflow_name: 'Picture Perspectives',
            product_name: product.title,
          };

          if (referenceBase64) {
            payload.referenceAngleImage = referenceBase64;
          }

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
                  quality,
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
                    const waitMs = isConcurrent ? 15_000 : 10_000;
                    console.log(`[Perspectives] ${isConcurrent ? 'Concurrent' : 'Burst'} limit hit, waiting ${waitMs / 1000}s before retry ${attempt + 1}/${MAX_RETRIES}…`);
                    await sleep(waitMs);
                    continue;
                  }
                  toast.error(errorData.error || `Rate limit reached. ${enqueuedCount} of ${totalJobs} queued.`);
                  shouldStop = true;
                  break;
                }

                toast.error(errorData.error || `Failed to enqueue job`);
                break;
              }

              const result = await response.json();
              if (result.newBalance !== undefined && result.newBalance !== null) {
                lastNewBalance = result.newBalance;
              }
              jobs.push({
                jobId: result.jobId,
                variationLabel: variation.label,
                productTitle: product.title,
                ratio,
              });
              enqueuedCount++;
              enqueued = true;
              setProgress(Math.round((enqueuedCount / totalJobs) * 100));
              break;
            } catch (err) {
              console.error('Enqueue error:', err);
              break;
            }
          }



          if (shouldStop) break;

          // Stagger enqueue calls to avoid hitting concurrency limits
          if (enqueued && enqueuedCount < totalJobs) await sleep(500);
        }
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
