// Force redeploy: image optimization v1 (2026-03-16)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Optimize Supabase Storage images for AI input (model & scene only) ────
function optimizeImageForAI(url: string): string {
  const STORAGE_MARKER = '/storage/v1/object/';
  const RENDER_MARKER = '/storage/v1/render/image/';
  if (!url || !url.includes(STORAGE_MARKER) || url.includes(RENDER_MARKER)) return url || '';
  const transformed = url.replace(STORAGE_MARKER, RENDER_MARKER);
  const sep = transformed.includes('?') ? '&' : '?';
  return `${transformed}${sep}quality=85`;
}

// Color Feel mapping (matches brandPromptBuilder.ts)
const COLOR_FEEL_DESCRIPTIONS: Record<string, string> = {
  'warm-earthy': 'warm earth tones, natural warmth, amber and terracotta accents',
  'cool-crisp': 'cool tones, clean whites, blue and silver undertones',
  'neutral-natural': 'true-to-life colors, balanced exposure, no heavy grading',
  'rich-saturated': 'deep saturated colors, bold and vivid palette, high color impact',
  'muted-soft': 'desaturated pastels, soft muted tones, dreamy and gentle palette',
  'vibrant-bold': 'high energy colors, bright and punchy, strong contrast',
};

const TONE_DESCRIPTIONS: Record<string, string> = {
  luxury: 'premium, sophisticated, elegant with refined details',
  clean: 'minimalist, uncluttered, modern and professional',
  bold: 'striking, high-contrast, attention-grabbing',
  minimal: 'extremely simple, lots of negative space, zen-like',
  playful: 'vibrant, energetic, fun with dynamic composition',
};

interface BrandProfileContext {
  tone: string;
  colorFeel: string;
  doNotRules: string[];
  brandKeywords?: string[];
  colorPalette?: string[];
  targetAudience?: string;
}

interface FreestyleRequest {
  prompt: string;
  userPrompt?: string;
  sourceImage?: string;
  productImage?: string;
  modelImage?: string;
  sceneImage?: string;
  aspectRatio: string;
  imageCount: number;
  quality: "standard" | "high";
  polishPrompt: boolean;
  modelContext?: string;
  stylePresets?: string[];
  brandProfile?: BrandProfileContext;
  negatives?: string[];
  cameraStyle?: "pro" | "natural";
  framing?: string;
  user_id?: string;
  modelId?: string;
  sceneId?: string;
  productId?: string;
  productDimensions?: string;
  imageRole?: "edit" | "product" | "model" | "scene";
  editIntent?: string[];
}

// ── Editing intent detection — skip heavy polish for simple edits ─────────
const EDITING_KEYWORDS = [
  'extract', 'remove', 'isolate', 'cut out', 'erase', 'clean up',
  'change background', 'replace background', 'swap background',
  'replace', 'recolor', 'crop', 'make transparent', 'delete text',
  'remove text', 'fix', 'enhance', 'sharpen', 'upscale', 'brighten',
  'darken', 'desaturate', 'blur background', 'add shadow', 'remove shadow',
  'straighten', 'rotate', 'flip', 'mirror', 'resize',
];

function detectEditingIntent(prompt: string): boolean {
  const lower = prompt.toLowerCase();
  return EDITING_KEYWORDS.some((kw) => lower.includes(kw));
}

// ── Selfie / UGC intent detection ─────────────────────────────────────────
const SELFIE_KEYWORDS = [
  'selfie', 'self-portrait', 'self portrait', 'front-facing', 'front facing',
  'ugc', 'phone camera', 'mirror shot', 'mirror selfie', 'phone selfie',
  'casual selfie', 'social media selfie', 'influencer selfie', 'vlog',
  'arm-length', 'arm length', 'front camera', 'facecam',
];

function detectSelfieIntent(prompt: string): boolean {
  const lower = prompt.toLowerCase();
  return SELFIE_KEYWORDS.some((kw) => lower.includes(kw));
}

// ── Full-body intent detection ────────────────────────────────────────────
const FULL_BODY_KEYWORDS = [
  'full body', 'full height', 'head to toe', 'full figure',
  'full length', 'entire body', 'whole body', 'from head',
];

function detectFullBodyIntent(prompt: string): boolean {
  const lower = prompt.toLowerCase();
  return FULL_BODY_KEYWORDS.some((kw) => lower.includes(kw));
}

// ── Expert prompt detection — skip photography DNA for detailed technical prompts ──
function isExpertPrompt(prompt: string): boolean {
  const lower = prompt.toLowerCase();
  const signals = [
    /\d+mm/, /f\/\d/, /iso\s*\d/i, /aperture/, /focal length/,
    /shutter speed/, /depth of field/, /bokeh/, /lens\b/,
    /color balance/, /color temperature/, /kelvin/,
    /key light/, /rim light/, /fill light/, /backlight/,
    /softbox/, /strobe/, /reflector/, /diffuser/,
  ];
  const matchCount = signals.filter(r => r.test(lower)).length;
  return prompt.length > 300 && matchCount >= 2;
}

// ── Photography DNA (Pro camera style — for people/fashion shots) ─────────
function buildPhotographyDNA(): string {
  return `Shot on 85mm f/2.8 lens, fashion editorial quality. Professional studio lighting with sculpted shadows. Razor-sharp focus, micro-contrast. Natural skin texture, visible material textures and fine stitching. Subtle film grain, elegant highlight roll-off.`;
}

// ── Generic DNA (for scene/architecture/product-only shots without people) ─
function buildGenericDNA(): string {
  return `Ultra high resolution, photorealistic, razor-sharp details, natural lighting, professional photography. Visible material textures, realistic surfaces. Subtle film grain, elegant highlight roll-off.`;
}

// ── Negative prompt (always appended when polish is on) ───────────────────
// LEGACY — kept as fallback for Phase 1
function buildNegativePrompt(cameraStyle?: 'pro' | 'natural', hasPeople = true): string {
  const anatomyRule = hasPeople
    ? '- Correct anatomy: exactly 2 arms, 2 hands with 5 fingers each, natural joint articulation, no extra or missing limbs'
    : '- No people, no human figures, no body parts';
  const blurRule = cameraStyle === 'natural'
    ? '- No bokeh, no shallow depth of field — everything sharp foreground to background'
    : '- No blurry or out-of-focus areas unless intentionally bokeh';

  return `
AVOID:
${anatomyRule}
${blurRule}
- No AI skin smoothing or plastic textures
- No collage layouts, split-screen, or black borders`;
}

// ── Context-aware prompt polish ───────────────────────────────────────────
function polishUserPrompt(
  rawPrompt: string,
  context: { hasSource: boolean; hasProduct: boolean; hasModel: boolean; hasScene: boolean },
  brandProfile?: BrandProfileContext,
  userNegatives?: string[],
  modelContext?: string,
  cameraStyle?: "pro" | "natural",
  framing?: string,
  productDimensions?: string
): string {
  // ── Editing intent bypass: simple single-image edits skip all heavy layers ──
  const refCount = [context.hasSource, context.hasProduct, context.hasModel, context.hasScene].filter(Boolean).length;
  const isEditingRequest = detectEditingIntent(rawPrompt);
  if (isEditingRequest && refCount <= 1 && !context.hasModel && !context.hasScene) {
    const editLayers: string[] = [
      rawPrompt,
      "High resolution, clean result, no AI artifacts, no collage layouts.",
    ];
    if (userNegatives && userNegatives.length > 0) {
      editLayers.push(`Avoid: ${userNegatives.join(", ")}`);
    }
    if (brandProfile?.doNotRules?.length) {
      editLayers.push(`Also avoid: ${brandProfile.doNotRules.join(", ")}`);
    }
    return editLayers.join("\n");
  }

  const layers: string[] = [];
  const isSelfie = detectSelfieIntent(rawPrompt);
  const expert = isExpertPrompt(rawPrompt);

  // ── Condensed mode for multi-reference (2+ images) — mirrors Try-On architecture ──
  // refCount already declared above (line 169)
  if (refCount >= 2 && !isSelfie) {
    const parts: string[] = [
      `Professional photography: ${rawPrompt}`,
      "",
      "REQUIREMENTS:",
    ];

    let stepNum = 1;

    if (context.hasProduct) {
      const dimNote = productDimensions ? ` Product dimensions: ${productDimensions} — render at realistic scale relative to the model.` : "";
      parts.push(`${stepNum}. PRODUCT: Identify the product from [PRODUCT REFERENCE] — its shape, material, color, texture, and brand details. Generate a photograph of this exact product with professional lighting and fresh composition.${context.hasModel ? " Use ONLY the product from this image — IGNORE any person or mannequin shown." : ""}${dimNote}`);
      stepNum++;
      if (context.hasSource) {
        parts.push(`${stepNum}. REFERENCE: [REFERENCE IMAGE] is for setting/mood/style inspiration only. The final image must prominently feature the exact product from [PRODUCT REFERENCE] as the hero subject.`);
        stepNum++;
      }
    } else if (context.hasSource) {
      parts.push(`${stepNum}. PRODUCT: Identify the product from [PRODUCT REFERENCE] — its shape, material, color, texture, and brand details. Generate a photograph of this exact product with professional lighting and fresh composition.${context.hasModel ? " Use ONLY the product from this image — IGNORE any person or mannequin shown." : ""}${productDimensions ? ` Product dimensions: ${productDimensions} — render at realistic scale relative to the model.` : ""}`);
      stepNum++;
    }
    if (context.hasModel) {
      const identityDetails = modelContext ? ` (${modelContext})` : "";
      const noFaceFramings = ['hand_wrist', 'lower_body', 'back_view', 'side_profile'];
      if (framing && noFaceFramings.includes(framing)) {
        parts.push(`${stepNum}. MODEL: Match the skin tone, body type, and physical characteristics of the person in [MODEL REFERENCE]${identityDetails}. Face is not visible in this framing. Ignore any person in the product image.`);
      } else {
        parts.push(`${stepNum}. MODEL: The person must match the individual in [MODEL REFERENCE] — same face, features, skin tone, hair, and body${identityDetails}. This is a specific person, not a generic model. Ignore any person in the product image.`);
      }
      stepNum++;
    }
    // Gender enforcement for condensed path
    if (modelContext) {
      const lowerCtx = modelContext.toLowerCase();
      if (lowerCtx.startsWith('male')) {
        parts.push("GENDER RULE: A male model has been selected. ALL people in this image MUST be male. Do NOT generate any female figures, women, or feminine-presenting people — even if the scene reference image contains women.");
      } else if (lowerCtx.startsWith('female')) {
        parts.push("GENDER RULE: A female model has been selected. ALL people in this image MUST be female. Do NOT generate any male figures, men, or masculine-presenting people — even if the scene reference image contains men.");
      }
    }
    if (context.hasScene) {
      parts.push(`${stepNum}. SCENE: Use [SCENE REFERENCE] for environment, lighting, and atmosphere only. If the scene contains any products or commercial items, ignore them — the only product must be from [PRODUCT REFERENCE].`);
      stepNum++;
    }

    parts.push("");
    parts.push("Quality: Photorealistic, natural skin texture, no AI artifacts, ultra high resolution.");

    // Brand style (condensed)
    if (brandProfile?.tone) {
      const toneDesc = TONE_DESCRIPTIONS[brandProfile.tone] || brandProfile.tone;
      const colorDesc = brandProfile.colorFeel ? (COLOR_FEEL_DESCRIPTIONS[brandProfile.colorFeel] || brandProfile.colorFeel) : "";
      parts.push(`Brand: ${toneDesc}${colorDesc ? `. Color: ${colorDesc}` : ""}`);
    }

    if (cameraStyle === "natural") {
      parts.push("Shot on iPhone — deep depth of field, true-to-life colors, no retouching.");
    }

    // Framing override (condensed path)
    const effectiveFramingCondensed = framing || (detectFullBodyIntent(rawPrompt) ? 'full_body' : null);
    if (effectiveFramingCondensed) {
      const framingPrompts: Record<string, string> = {
        full_body: `FRAMING: Full body shot, head to toe. Show the complete outfit and full figure.${context.hasModel ? ' Match body of [MODEL REFERENCE].' : ''}`,
        upper_body: `FRAMING: Upper body shot, waist up.${context.hasModel ? ' Match appearance of [MODEL REFERENCE].' : ''}`,
        close_up: `FRAMING: Close-up portrait from shoulders upward.${context.hasModel ? ' Match appearance of [MODEL REFERENCE].' : ''}`,
        hand_wrist: `FRAMING: Hand and wrist only. Product naturally worn. No face.${context.hasModel ? ' Match skin tone of [MODEL REFERENCE].' : ''}`,
        neck_shoulders: `FRAMING: Collarbone area, jewelry display framing.${context.hasModel ? ' Match skin tone of [MODEL REFERENCE].' : ''}`,
        lower_body: `FRAMING: Lower body, hips to feet.${context.hasModel ? ' Match body of [MODEL REFERENCE].' : ''}`,
        back_view: `FRAMING: Back view, subject facing away.${context.hasModel ? ' Match body of [MODEL REFERENCE].' : ''}`,
        side_profile: `FRAMING: Side profile, ear and jawline area.${context.hasModel ? ' Match appearance of [MODEL REFERENCE].' : ''}`,
      };
      if (framingPrompts[effectiveFramingCondensed]) {
        parts.push(framingPrompts[effectiveFramingCondensed]);
      }
    }

    // Negatives
    const allNeg: string[] = [];
    if (brandProfile?.doNotRules?.length) allNeg.push(...brandProfile.doNotRules);
    if (userNegatives?.length) allNeg.push(...userNegatives);
    parts.push(buildNegativePrompt(cameraStyle));
    if (allNeg.length > 0) {
      const deduped = [...new Set(allNeg.map(n => n.toLowerCase()))];
      parts.push(`Also avoid: ${deduped.join(", ")}`);
    }

    return parts.join("\n");
  }

  if (isSelfie) {
    layers.push(`Authentic selfie-style photo: ${rawPrompt}`);
    layers.push(
      cameraStyle === 'natural'
        ? "Shot on iPhone front camera. Sharp focus on face, natural ambient lighting, true-to-life colors. No Portrait Mode blur."
        : "Shot on smartphone front camera. Sharp focus on face, natural ambient lighting, flattering soft light."
    );
    layers.push(
      `SELFIE COMPOSITION: Shot from the phone's front camera POV. Subject looking directly into the lens. Slight wide-angle distortion. One hand holding phone (phone itself never visible). ${cameraStyle === 'natural' ? 'Deep depth of field — background sharp, no bokeh.' : 'Soft natural bokeh in background.'} Authentic, candid expression.`
    );
    layers.push(
      "SELFIE FRAMING: Full head and hair visible with natural headroom. Frame from mid-chest up. Face in upper-third of composition."
    );
  } else {
    if (expert) {
      // Expert prompt: user already specified camera/lighting — don't override with generic DNA
      layers.push(rawPrompt);
    } else {
      layers.push(`Professional photography: ${rawPrompt}`);
      // If user typed a prompt, default to people-mode — anatomy constraints are harmless
      // for non-people subjects, but "No people" negatives destroy people-describing prompts.
      // Only suppress people when there's truly no prompt text and no assets.
      const wantsPeople = context.hasModel || context.hasProduct || !!rawPrompt.trim();
      layers.push(wantsPeople ? buildPhotographyDNA() : buildGenericDNA());
    }
  }

  // Brand profile layer
  if (brandProfile) {
    const brandParts: string[] = [];
    if (brandProfile.tone) {
      const toneDesc = TONE_DESCRIPTIONS[brandProfile.tone] || brandProfile.tone;
      brandParts.push(`Visual tone: ${toneDesc}`);
    }
    if (brandProfile.colorFeel) {
      const colorDesc = COLOR_FEEL_DESCRIPTIONS[brandProfile.colorFeel] || brandProfile.colorFeel;
      brandParts.push(`Color direction: ${colorDesc}`);
    }
    if (brandProfile.brandKeywords && brandProfile.brandKeywords.length > 0) {
      brandParts.push(`Brand DNA keywords: ${brandProfile.brandKeywords.join(", ")}`);
    }
    if (brandProfile.colorPalette && brandProfile.colorPalette.length > 0) {
      brandParts.push(`Brand accent colors: ${brandProfile.colorPalette.join(", ")}`);
    }
    if (brandProfile.targetAudience) {
      brandParts.push(`Target audience: ${brandProfile.targetAudience}`);
    }
    if (brandParts.length > 0) {
      layers.push(`BRAND STYLE GUIDE:\n${brandParts.join(". ")}.`);
    }
  }

  // LEGACY — Product / source image layer
  const hasProductImage = context.hasProduct || context.hasSource;
  if (hasProductImage) {
    const dimLayer = productDimensions ? ` Product dimensions: ${productDimensions} — render at realistic scale.` : "";
    layers.push(
      `PRODUCT IDENTITY: Identify the product from [PRODUCT REFERENCE] — its shape, material, color, texture, and brand details. Generate a photograph of this exact product with professional lighting and fresh composition.${dimLayer}`
    );
    if (context.hasSource && context.hasProduct) {
      layers.push(
        "REFERENCE INSPIRATION: Use [REFERENCE IMAGE] for setting/mood/style inspiration. Place the product from [PRODUCT REFERENCE] in a similar setting."
      );
    }
    if (isSelfie) {
      layers.push(
        "PRODUCT INTERACTION (SELFIE): The person should hold or display the product in a natural, casual way — as if showing it to a friend on a video call. Product held near the face or chest, relaxed grip, naturally integrated into the selfie frame. NOT floating, stiff, or posed like a catalog shot."
      );
    }
    // Product-only framing (no model involved) — suppressed when explicit framing is set
    if (!context.hasModel && !framing) {
      layers.push(
        "FRAMING: Use a creative product photography angle — overhead, 45-degree, low-angle, or dramatic perspective. Professional composition with intentional negative space. Do NOT simply center the product straight-on like the reference."
      );
    }
  }

  // LEGACY — Model / portrait layer — identity matching
  if (context.hasModel) {
    const identityDetails = modelContext ? ` (${modelContext})` : "";
    const noFaceFramings = ['hand_wrist', 'lower_body', 'back_view', 'side_profile'];
    if (framing && noFaceFramings.includes(framing)) {
      layers.push(
        `MODEL IDENTITY: Match the skin tone, body type, and physical characteristics of the person in [MODEL REFERENCE]${identityDetails}. Face is not visible in this framing. Ignore any person in the product image.`
      );
    } else {
      layers.push(
        `MODEL IDENTITY: The person must match the individual in [MODEL REFERENCE]${identityDetails} — same face, features, skin tone, hair, and body. This is a specific person, not a generic model. Ignore any person in the product image.`
      );
    }
    // Gender enforcement for layered path
    if (modelContext) {
      const lowerCtx = modelContext.toLowerCase();
      if (lowerCtx.startsWith('male')) {
        layers.push("GENDER: All people must be male. Do not generate female figures.");
      } else if (lowerCtx.startsWith('female')) {
        layers.push("GENDER: All people must be female. Do not generate male figures.");
      }
    }
    if (isSelfie) {
      layers.push(
        cameraStyle === 'natural'
          ? "PORTRAIT QUALITY: Natural skin texture with realistic pores. Even ambient lighting, true-to-life skin tones, no color grading."
          : "PORTRAIT QUALITY: Natural skin texture with realistic pores. Soft flattering natural light. Relaxed genuine expression."
      );
    } else {
      layers.push(
        "PORTRAIT QUALITY: Sharp eye detail, natural skin texture with visible pores. Realistic hair texture. Accurate body proportions, natural pose. No heavy retouching or plastic look."
      );
      // Framing for standard portrait/model shots (only if no explicit framing override and not expert prompt)
      if (!framing && !expert) {
        if (detectFullBodyIntent(rawPrompt)) {
          layers.push(
            `FRAMING: Full body shot, head to toe. Show the complete figure from head to feet with natural spacing. The entire body must be visible — do NOT crop at knees, waist, or shins.${context.hasModel ? ' The body must match the exact skin tone, age, and body characteristics of the person in [MODEL IMAGE].' : ''}`
          );
        } else {
          layers.push(
            "FRAMING: Ensure the subject's full head, hair, and upper body are fully visible within the frame. Leave natural headroom above the head — do NOT crop the top of the head. Position the subject using the rule of thirds. The face and eyes should be in the upper third of the composition."
          );
        }
      }
    }
  }

  // Scene / environment layer
  if (context.hasScene) {
    layers.push(
      "ENVIRONMENT: Place the subject in the environment shown in [SCENE REFERENCE]. Match the location, architecture, surfaces, lighting direction, and atmosphere. If the scene contains any products or commercial items, ignore them — the only product must be from [PRODUCT REFERENCE]."
    );
  }

  // Camera rendering style layer
  if (cameraStyle === "natural") {
    layers.push(
      `CAMERA STYLE: Shot on iPhone. Deep depth of field, everything sharp. True-to-life colors, no grading. Natural ambient light, no studio lighting. Ultra-sharp detail across the entire frame.${isSelfie ? ' Front camera standard mode — no Portrait Mode, no bokeh.' : ''}`
    );
  }

  // Explicit framing override
  if (framing) {
    const framingPrompts: Record<string, string> = {
      full_body: `FRAMING: Full body shot, head to toe.${context.hasModel ? ' Match body of [MODEL REFERENCE].' : ''}`,
      upper_body: `FRAMING: Upper body, waist up.${context.hasModel ? ' Match appearance of [MODEL REFERENCE].' : ''}`,
      close_up: `FRAMING: Close-up portrait from shoulders up.${context.hasModel ? ' Match appearance of [MODEL REFERENCE].' : ''}`,
      hand_wrist: `FRAMING: Hand and wrist only. No face.${context.hasModel ? ' Match skin tone of [MODEL REFERENCE].' : ''}`,
      neck_shoulders: `FRAMING: Collarbone area, jewelry display.${context.hasModel ? ' Match skin tone of [MODEL REFERENCE].' : ''}`,
      lower_body: `FRAMING: Lower body, hips to feet.${context.hasModel ? ' Match body of [MODEL REFERENCE].' : ''}`,
      back_view: `FRAMING: Back view, facing away.${context.hasModel ? ' Match body of [MODEL REFERENCE].' : ''}`,
      side_profile: `FRAMING: Side profile, ear and jawline.${context.hasModel ? ' Match appearance of [MODEL REFERENCE].' : ''}`,
    };
    if (framingPrompts[framing]) {
      layers.push(framingPrompts[framing]);
    }
  }

  // Build combined negatives list
  const allNegatives: string[] = [];
  if (brandProfile?.doNotRules && brandProfile.doNotRules.length > 0) {
    allNegatives.push(...brandProfile.doNotRules);
  }
  if (userNegatives && userNegatives.length > 0) {
    allNegatives.push(...userNegatives);
  }

  // Build final negative prompt
  // Same safe default: if user typed a prompt, don't inject "No people" negatives
  const wantsPeople = context.hasModel || context.hasProduct || !!rawPrompt.trim();
  let negativeBlock = buildNegativePrompt(cameraStyle, wantsPeople);
  if (allNegatives.length > 0) {
    const dedupedNegatives = [...new Set(allNegatives.map(n => n.toLowerCase()))];
    negativeBlock += `\n- No ${dedupedNegatives.join("\n- No ")}`;
  }

  layers.push(negativeBlock);

  return layers.join("\n\n");
}

// Content-block detection helpers
function isContentBlocked(data: Record<string, unknown>): boolean {
  const choice = (data.choices as Array<Record<string, unknown>>)?.[0];
  if (!choice) return false;
  const finishReason = String(choice.finish_reason || "");
  if (/PROHIBIT|BLOCK|SAFETY|RECITATION/i.test(finishReason)) return true;
  const content = String((choice.message as Record<string, unknown>)?.content || "");
  if (/I cannot fulfill|I('m| am) unable to|violates .* policy|inappropriate|not able to generate/i.test(content)) return true;
  return false;
}

function extractBlockReason(data: Record<string, unknown>): string {
  const choice = (data.choices as Array<Record<string, unknown>>)?.[0];
  const content = String((choice?.message as Record<string, unknown>)?.content || "").trim();
  if (content.length > 10 && content.length < 300) return content;
  return "This prompt was flagged by our content safety system. Try rephrasing with different terms.";
}

type ContentItem = { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } };
type GenerateResult = string | { blocked: true; reason: string } | null;

// ── Helpers copied from generate-tryon ────────────────────────────────────

async function getAuthUserId(authHeader: string | null): Promise<string | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error } = await supabaseAuth.auth.getUser(token);
    if (error || !user) return null;
    return user.id;
  } catch (_e) {
    return null;
  }
}

async function uploadBase64ToStorage(
  base64Url: string,
  userId: string,
  supabaseUrl: string,
  serviceRoleKey: string
): Promise<string> {
  const base64Data = base64Url.includes(",")
    ? base64Url.split(",")[1]
    : base64Url;

  const binaryStr = atob(base64Data);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  const fileName = `${userId}/${crypto.randomUUID()}.png`;

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { error } = await supabase.storage
    .from("freestyle-images")
    .upload(fileName, bytes, {
      contentType: "image/png",
      upsert: false,
    });

  if (error) {
    console.error("Storage upload failed:", error);
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from("freestyle-images")
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

// ── AI image generation with structured content ───────────────────────────
async function generateImage(
  content: ContentItem[],
  apiKey: string,
  model: string,
  aspectRatio?: string,
  maxRetries = 2
): Promise<GenerateResult> {
  // Pro models need longer timeouts — they regularly take 90-120s with multiple images
  const isProModel = /gemini-3-pro|gemini-3\.1-pro/i.test(model);
  const timeoutMs = isProModel ? 150_000 : 90_000;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content }],
            modalities: ["image", "text"],
            max_tokens: 8192,
            ...(aspectRatio ? { image_config: { aspect_ratio: aspectRatio } } : {}),
          }),
          signal: AbortSignal.timeout(timeoutMs),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          console.warn(`AI Gateway 429 (attempt ${attempt + 1}/${maxRetries + 1}) — backing off`);
          if (attempt < maxRetries) {
            await new Promise((r) => setTimeout(r, 1500));
            continue;
          }
          throw { status: 429, message: "Rate limit exceeded. Please wait and try again." };
        }
        if (response.status === 402) {
          throw { status: 402, message: "Credits exhausted. Please add more credits." };
        }
        const errorText = await response.text();
        console.error(`AI Gateway error (attempt ${attempt + 1}):`, response.status, errorText);
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 500));
          continue;
        }
        throw new Error(`AI Gateway error: ${response.status}`);
      }

      const data = await response.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      if (!imageUrl) {
        if (isContentBlocked(data)) {
          const reason = extractBlockReason(data);
          console.warn("Content blocked by safety filter:", reason);
          return { blocked: true, reason };
        }

        console.error("No image in response:", JSON.stringify(data).slice(0, 500));
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 500));
          continue;
        }
        return null;
      }

      return imageUrl;
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "status" in error) {
        const statusErr = error as { status: number };
        // For 429, don't re-throw — let the per-image loop handle it as a soft error
        if (statusErr.status === 429) {
          throw error;
        }
        throw error;
      }
      const isTimeout = error instanceof DOMException && error.name === "TimeoutError";
      // For timeouts, only retry once — a slow model won't get faster on retry
      const effectiveMaxRetries = isTimeout ? Math.min(maxRetries, 1) : maxRetries;
      console.error(`Generation attempt ${attempt + 1} failed${isTimeout ? " (timeout)" : ""}:`, error);
      if (attempt < effectiveMaxRetries) {
        await new Promise((r) => setTimeout(r, isTimeout ? 1000 : 500));
        continue;
      }
      if (isTimeout) {
        throw new Error("Generation timed out — the AI model took longer than expected. This can happen with complex prompts or multiple reference images. Please try again.");
      }
      throw error;
    }
  }

  return null;
}

// ── Build labeled content array with interleaved text + images ────────────
function buildContentArray(
  prompt: string,
  sourceImage?: string,
  productImage?: string,
  modelImage?: string,
  sceneImage?: string,
  imageRole?: string,
): ContentItem[] {
  const content: ContentItem[] = [];

  // Main prompt text first
  content.push({ type: "text", text: prompt });

  // Product image (from selected product)
  if (productImage) {
    content.push({ type: "text", text: "[PRODUCT REFERENCE]" });
    content.push({ type: "image_url", image_url: { url: productImage } });
  }

  // Source/reference image (user-uploaded) — label based on imageRole
  if (sourceImage) {
    const label = imageRole === 'product' ? '[PRODUCT IMAGE]'
      : imageRole === 'model' ? '[MODEL REFERENCE]'
      : imageRole === 'scene' ? '[SCENE REFERENCE]'
      : '[REFERENCE IMAGE]';
    content.push({ type: "text", text: label });
    content.push({ type: "image_url", image_url: { url: sourceImage } });
  }

  if (modelImage) {
    content.push({ type: "text", text: "[MODEL REFERENCE]" });
    content.push({ type: "image_url", image_url: { url: optimizeImageForAI(modelImage) } });
  }

  if (sceneImage) {
    content.push({ type: "text", text: "[SCENE REFERENCE]" });
    content.push({ type: "image_url", image_url: { url: optimizeImageForAI(sceneImage) } });
  }

  return content;
}

/** Helper: update generation_queue and handle credits when called from the queue */
async function completeQueueJob(
  jobId: string,
  userId: string,
  creditsReserved: number,
  images: string[],
  requestedCount: number,
  errors: string[],
  payload: Record<string, unknown>,
  contentBlocked: boolean = false,
  blockReason: string | null = null,
) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  // Guard: if user already cancelled, skip completion to preserve refund
  const { data: currentJob } = await supabase
    .from("generation_queue")
    .select("status")
    .eq("id", jobId)
    .single();

  if (currentJob?.status === "cancelled") {
    console.log(`[generate-freestyle] Job ${jobId} was cancelled — skipping completion`);
    // Clean up any freestyle_generations rows saved during this cancelled run
    if (images.length > 0) {
      await supabase
        .from("freestyle_generations")
        .delete()
        .eq("user_id", userId)
        .in("image_url", images);
      console.log(`[generate-freestyle] Cleaned up ${images.length} freestyle_generations for cancelled job ${jobId}`);
    }
    return;
  }

  const generatedCount = images.length;

  if (generatedCount === 0) {
    // Content blocked: mark as completed with contentBlocked flag so UI shows the blocked card
    if (contentBlocked) {
      const result = { images: [], generatedCount: 0, requestedCount, contentBlocked: true, blockReason };
      const { error: cbErr } = await supabase.from("generation_queue").update({
        status: "completed",
        result,
        completed_at: new Date().toISOString(),
      }).eq("id", jobId);
      if (cbErr) {
        console.error(`[generate-freestyle] Queue update (content-blocked) failed for ${jobId}:`, cbErr.message);
        await supabase.from("generation_queue").update({ status: "completed", result, completed_at: new Date().toISOString() }).eq("id", jobId);
      }
    } else {
      const { error: failErr } = await supabase.from("generation_queue").update({
        status: "failed",
        error_message: errors.join("; ") || "Failed to generate any images",
        completed_at: new Date().toISOString(),
      }).eq("id", jobId);
      if (failErr) {
        console.error(`[generate-freestyle] Queue update (failed) failed for ${jobId}:`, failErr.message);
        await supabase.from("generation_queue").update({ status: "failed", error_message: errors.join("; ") || "Failed to generate any images", completed_at: new Date().toISOString() }).eq("id", jobId);
      }
    }
    await supabase.rpc("refund_credits", { p_user_id: userId, p_amount: creditsReserved });
    console.log(`[generate-freestyle] Refunded ${creditsReserved} credits for ${contentBlocked ? "blocked" : "failed"} job ${jobId}`);

    // Fire-and-forget: send generation failed email if user opted in
    if (!contentBlocked) {
      try {
        const { data: profile } = await supabase.from("profiles").select("email, display_name, settings").eq("user_id", userId).single();
        const settings = (profile?.settings as Record<string, unknown>) || {};
        if (profile?.email && settings.emailOnFailed !== false) {
          fetch(`${supabaseUrl}/functions/v1/send-email`, {
            method: "POST",
            headers: { Authorization: `Bearer ${serviceRoleKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ type: "generation_failed", to: profile.email, data: { jobType: "freestyle", errorMessage: errors.join("; "), displayName: profile.display_name, prompt: (payload.prompt as string) || undefined, modelName: (payload.modelContext as string) || undefined, sceneName: (payload.sceneId as string) || undefined } }),
          }).catch((e) => console.warn("[generate-freestyle] Failed email send failed:", e.message));
        }
      } catch (e) { console.warn("[generate-freestyle] Failed email lookup failed:", e); }
    }
    return;
  }

  const result = { images, generatedCount, requestedCount, errors: errors.length > 0 ? errors : undefined };

  const { error: completeErr } = await supabase.from("generation_queue").update({
    status: "completed",
    result,
    completed_at: new Date().toISOString(),
  }).eq("id", jobId);
  if (completeErr) {
    console.error(`[generate-freestyle] Queue update (completed) failed for ${jobId}:`, completeErr.message);
    const { error: retryErr } = await supabase.from("generation_queue").update({ status: "completed", result, completed_at: new Date().toISOString() }).eq("id", jobId);
    if (retryErr) console.error(`[generate-freestyle] Queue update retry also failed for ${jobId}:`, retryErr.message);
  }

  // Freestyle saves its own records in freestyle_generations (done inline),
  // but we still need a generation_jobs record for credit tracking
  // No generation_jobs insert for freestyle — it uses freestyle_generations table

  if (generatedCount < requestedCount) {
    const perImageCost = Math.floor(creditsReserved / requestedCount);
    const refundAmount = perImageCost * (requestedCount - generatedCount);
    if (refundAmount > 0) {
      await supabase.rpc("refund_credits", { p_user_id: userId, p_amount: refundAmount });
      console.log(`[generate-freestyle] Partial: refunded ${refundAmount} credits for job ${jobId}`);
    }
  }

  console.log(`[generate-freestyle] ✓ Queue job ${jobId} completed (${generatedCount} images)`);

  // Fire-and-forget: send generation complete email (only if user opted in)
  try {
    const { data: profile } = await supabase.from("profiles").select("email, display_name, settings").eq("user_id", userId).single();
    const settings = (profile?.settings as Record<string, unknown>) || {};
    if (profile?.email && settings.emailOnComplete === true) {
      fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: "POST",
        headers: { Authorization: `Bearer ${serviceRoleKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ type: "generation_complete", to: profile.email, data: { imageCount: generatedCount, jobType: "freestyle", displayName: profile.display_name } }),
      }).catch((e) => console.warn("[generate-freestyle] Email send failed:", e.message));
    }
  } catch (e) { console.warn("[generate-freestyle] Email lookup failed:", e); }
}

// ── Request handler ───────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const authHeader = req.headers.get("authorization");
  const isQueueInternal = req.headers.get("x-queue-internal") === "true"
    && authHeader === `Bearer ${serviceRoleKey}`;

  try {
    // SECURITY: Only allow internal queue calls — reject direct access
    if (!isQueueInternal) {
      return new Response(
        JSON.stringify({ error: "Direct access not allowed. Use the generation queue." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: "Storage not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: FreestyleRequest & { job_id?: string; credits_reserved?: number } = await req.json();

    const userId = body.user_id;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!body.prompt?.trim() && !body.sourceImage && !body.productImage && !body.modelImage && !body.sceneImage) {
      return new Response(
        JSON.stringify({ error: "Please provide a prompt or select at least one reference (product, model, or scene)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Safety guard: skip scene images that aren't publicly accessible https:// URLs
    if (body.sceneImage && !body.sceneImage.startsWith('https://')) {
      console.warn(`[FREESTYLE] Invalid scene URL skipped (not https): ${body.sceneImage}`);
      body.sceneImage = undefined;
    }


    // Queue-mode optimizations: cap to 1 image, reduce retries
    const maxRetries = isQueueInternal ? 1 : 2;
    const effectiveImageCount = isQueueInternal ? 1 : Math.min(body.imageCount || 1, 4);

    // ── Perspective mode: skip all generic prompt logic ──────────────────
    const isPerspective = !!(body as Record<string, unknown>).isPerspective;
    const referenceAngleImage = (body as Record<string, unknown>).referenceAngleImage as string | undefined;

    let enrichedPrompt = body.prompt?.trim() || "Professional commercial photography of the provided subject";
    if (body.modelContext) {
      enrichedPrompt = `${enrichedPrompt}\n\nModel reference: ${body.modelContext}`;
    }

    // White Studio override: prompt-only mode — no scene image to prevent bleeding
    if (body.sceneId === 'scene_038') {
      body.sceneImage = undefined;
      const whiteStudioDirective = "BACKGROUND REQUIREMENT: Pure solid white background (#ffffff). Seamless white infinity backdrop with bright even studio lighting. No environment, no room, no walls, no props. Only a subtle natural product shadow on the white surface. Isolated product on solid white, e-commerce hero shot style.";
      enrichedPrompt = `${enrichedPrompt}\n\n${whiteStudioDirective}`;
      console.log(`[FREESTYLE] White Studio (scene_038) — prompt-only mode, scene image cleared`);
    }

    if (body.stylePresets?.length) {
      if (body.cameraStyle === 'natural') {
        const conflicting = ['shallow depth of field', 'bokeh', 'film grain'];
        const filtered = body.stylePresets.filter((kw: string) =>
          !conflicting.some(c => kw.toLowerCase().includes(c))
        );
        if (filtered.length > 0) {
          enrichedPrompt = `${enrichedPrompt}\n\nStyle direction: ${filtered.join(", ")}`;
        }
      } else {
        enrichedPrompt = `${enrichedPrompt}\n\nStyle direction: ${body.stylePresets.join(", ")}`;
      }
    }

    const polishContext = {
      hasSource: !!body.sourceImage,
      hasProduct: !!body.productImage,
      hasModel: !!body.modelImage,
      hasScene: !!body.sceneImage,
    };

    let finalPrompt: string;
    if (isPerspective) {
      // Perspective jobs: prompt is fully built by the hook — use as-is
      finalPrompt = enrichedPrompt;
    } else if (body.polishPrompt) {
      finalPrompt = polishUserPrompt(enrichedPrompt, polishContext, body.brandProfile, body.negatives, body.modelContext, body.cameraStyle, body.framing, body.productDimensions);
    } else {
      let unpolished = enrichedPrompt;
      if (body.brandProfile) {
        const bp = body.brandProfile;
        const parts: string[] = [];
        if (bp.tone) parts.push(bp.tone);
        if (bp.colorFeel) {
          const colorDesc = COLOR_FEEL_DESCRIPTIONS[bp.colorFeel] || bp.colorFeel;
          parts.push(colorDesc);
        }
        if (parts.length > 0) unpolished += `\n\nBrand style: ${parts.join(", ")}`;
      }
      const allNeg: string[] = [
        ...(body.brandProfile?.doNotRules || []),
        ...(body.negatives || []),
      ];
      if (allNeg.length > 0) {
        const dedupedNeg = [...new Set(allNeg.map(n => n.toLowerCase()))];
        unpolished += `\n\nDo NOT include: ${dedupedNeg.join(", ")}`;
      }
      if (body.cameraStyle === "natural") {
        unpolished += `\n\nCAMERA RENDERING STYLE — NATURAL (iPhone): Shot on a latest-generation iPhone. Ultra-sharp details across the entire frame with deep depth of field (everything in focus, minimal bokeh). True-to-life, unedited color reproduction — no color grading, no warm/cool push. Natural ambient lighting only. The image should feel authentic and unprocessed.`;
      }
      // Framing instructions for unpolished path
      if (body.framing) {
        const hasModel = !!body.modelImage;
        const framingPrompts: Record<string, string> = {
          full_body: `FRAMING: Full body shot, head to toe.${hasModel ? ' Match body of [MODEL REFERENCE].' : ''}`,
          upper_body: `FRAMING: Upper body, waist up.${hasModel ? ' Match appearance of [MODEL REFERENCE].' : ''}`,
          close_up: `FRAMING: Close-up portrait from shoulders up.${hasModel ? ' Match appearance of [MODEL REFERENCE].' : ''}`,
          hand_wrist: `FRAMING: Hand and wrist only. No face.${hasModel ? ' Match skin tone of [MODEL REFERENCE].' : ''}`,
          neck_shoulders: `FRAMING: Collarbone area, jewelry display.${hasModel ? ' Match skin tone of [MODEL REFERENCE].' : ''}`,
          lower_body: `FRAMING: Lower body, hips to feet.${hasModel ? ' Match body of [MODEL REFERENCE].' : ''}`,
          back_view: `FRAMING: Back view, facing away.${hasModel ? ' Match body of [MODEL REFERENCE].' : ''}`,
          side_profile: `FRAMING: Side profile, ear and jawline.${hasModel ? ' Match appearance of [MODEL REFERENCE].' : ''}`,
        };
        if (framingPrompts[body.framing]) {
          unpolished += `\n\n${framingPrompts[body.framing]}`;
        }
      }
      finalPrompt = unpolished;
    }

    const aspectPrompt = `${finalPrompt}\n\nOutput aspect ratio: ${body.aspectRatio}. CRITICAL: The image must fill the ENTIRE canvas edge-to-edge. Do NOT add any black borders, black bars, letterboxing, pillarboxing, padding, or margins around the image. The photograph must extend to all four edges with no empty space.`;

    const forceProModel = !!(body as Record<string, unknown>).forceProModel;
    const refCount = [body.sourceImage, body.productImage, body.modelImage, body.sceneImage, referenceAngleImage].filter(Boolean).length;
    const hasModelImage = !!body.modelImage;
    const hasDualProductRef = !!body.productImage && !!body.sourceImage;
    const aiModel = (forceProModel || isPerspective || hasModelImage || hasDualProductRef)
      ? "google/gemini-3-pro-image-preview"
      : isQueueInternal
        ? "google/gemini-3.1-flash-image-preview"
        : (body.quality === "high" && refCount < 2)
          ? "google/gemini-3-pro-image-preview"
          : "google/gemini-3.1-flash-image-preview";

    console.log("Freestyle generation:", {
      promptLength: body.prompt.length,
      hasSourceImage: !!body.sourceImage,
      hasProductImage: !!body.productImage,
      hasModelImage: !!body.modelImage,
      hasSceneImage: !!body.sceneImage,
      hasReferenceAngleImage: !!referenceAngleImage,
      hasModelContext: !!body.modelContext,
      stylePresets: body.stylePresets,
      hasBrandProfile: !!body.brandProfile,
      brandTone: body.brandProfile?.tone,
      brandColorFeel: body.brandProfile?.colorFeel,
      negativesCount: body.negatives?.length || 0,
      cameraStyle: body.cameraStyle || 'pro',
      aspectRatio: body.aspectRatio,
      imageCount: effectiveImageCount,
      quality: body.quality,
      model: aiModel,
      polished: body.polishPrompt,
      isPerspective,
      isQueueInternal,
      jobId: body.job_id || null,
    });

    // Extend timeout_at for queue jobs — 5 min default is too tight for cold boot + 429 + fallback
    if (isQueueInternal && body.job_id) {
      try {
        const supabaseTimeout = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
        await supabaseTimeout.from('generation_queue')
          .update({ timeout_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() })
          .eq('id', body.job_id);
        console.log(`[generate-freestyle] Extended timeout_at to 10min for job ${body.job_id}`);
      } catch (e) {
        console.warn(`[generate-freestyle] Failed to extend timeout_at:`, e);
      }
    }

    const images: string[] = [];
    const errors: string[] = [];
    let contentBlocked = false;
    let blockReason = "";

    const batchConsistency = effectiveImageCount > 1
      ? "\n\nBATCH CONSISTENCY: Maintain the same color palette, lighting direction, overall mood, and visual style. Only vary composition, angle, and framing."
      : "";

    for (let i = 0; i < effectiveImageCount; i++) {
      try {
        const variationSuffix =
          i === 0
            ? batchConsistency
            : `${batchConsistency}\n\nVariation ${i + 1}: Create a different composition and angle while keeping the same subject, style, and lighting.`;

        const promptWithVariation = `${aspectPrompt}${variationSuffix}`;

        // For perspective jobs, inject referenceAngleImage as [REFERENCE IMAGE]
        // with angle-aware semantics (the prompt already handles the labeling)
        const effectiveSourceImage = isPerspective ? undefined : body.sourceImage;
        const contentArray = buildContentArray(
          promptWithVariation,
          effectiveSourceImage,
          body.productImage,
          body.modelImage,
          body.sceneImage,
        );

        // Append referenceAngleImage as [REFERENCE IMAGE] for perspective jobs
        if (isPerspective && referenceAngleImage) {
          contentArray.push({ type: "text", text: "[REFERENCE IMAGE]" });
          contentArray.push({ type: "image_url", image_url: { url: referenceAngleImage } });
        }

        let result = await generateImage(contentArray, LOVABLE_API_KEY, aiModel, body.aspectRatio, maxRetries);

        // Fallback: if Pro model returned null (no image), try Flash model once
        if (result === null && /gemini-3-pro|gemini-3\.1-pro/i.test(aiModel)) {
          console.warn(`Pro model returned null — falling back to gemini-3.1-flash-image-preview`);
          result = await generateImage(contentArray, LOVABLE_API_KEY, "google/gemini-3.1-flash-image-preview", body.aspectRatio, 0);
        }

        if (result && typeof result === "object" && "blocked" in result) {
          contentBlocked = true;
          blockReason = result.reason;
          console.warn(`Image ${i + 1} blocked by content safety filter`);
          break;
        } else if (typeof result === "string") {
          const publicUrl = await uploadBase64ToStorage(result, userId, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
          images.push(publicUrl);
          console.log(`[generate-freestyle] Generated and uploaded freestyle image ${i + 1}/${effectiveImageCount}`);

          // Heartbeat: update queue with partial progress so cleanup_stale_jobs can recover
          if (isQueueInternal && body.job_id) {
            try {
              const supabaseHb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
              await supabaseHb.from('generation_queue')
                .update({ result: { images, generatedCount: images.length, requestedCount: effectiveImageCount } })
                .eq('id', body.job_id);
              console.log(`[generate-freestyle] Heartbeat: saved ${images.length} images to queue result`);
            } catch (hbErr) {
              console.warn(`[generate-freestyle] Heartbeat update failed:`, hbErr);
            }
          }

          // Save to freestyle_generations DB when called from queue
          if (isQueueInternal) {
            // Check if job was cancelled before saving
            if (body.job_id) {
              const cancelCheck = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
              const { data: jobCheck } = await cancelCheck
                .from('generation_queue')
                .select('status')
                .eq('id', body.job_id)
                .single();
              if (jobCheck?.status === 'cancelled') {
                console.log(`[generate-freestyle] Job ${body.job_id} cancelled — skipping save, breaking loop`);
                // Remove the already-uploaded storage file
                try {
                  const urlObj = new URL(publicUrl);
                  const pathParts = urlObj.pathname.split('/freestyle-images/');
                  if (pathParts[1]) {
                    const storagePath = decodeURIComponent(pathParts[1]);
                    const storageClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
                    await storageClient.storage.from('freestyle-images').remove([storagePath]);
                  }
                } catch (_e) {}
                // Remove this URL from images array so completeQueueJob cleanup is accurate
                images.pop();
                break;
              }
            }
            try {
              const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
                auth: { persistSession: false },
              });
              const insertData: Record<string, unknown> = {
                user_id: userId,
                image_url: publicUrl,
                prompt: body.prompt || '',
                user_prompt: body.userPrompt || null,
                aspect_ratio: body.aspectRatio || '1:1',
                quality: body.quality || 'standard',
                model_id: body.modelId || null,
                scene_id: body.sceneId || null,
                product_id: body.productId || null,
              };
              if (body.workflow_label) {
                insertData.workflow_label = body.workflow_label;
              }
              const { error: insertErr } = await supabase.from('freestyle_generations').insert(insertData);
              if (insertErr) {
                console.error(`Failed to save freestyle_generations:`, insertErr.message);
              } else {
                console.log(`[generate-freestyle] Saved freestyle_generations record for image ${i + 1}`);
              }

              // Early finalize: in queue mode (1 image), complete immediately after first success
              if (body.job_id && images.length > 0) {
                console.log(`[generate-freestyle] Early finalize: completing queue job ${body.job_id} with ${images.length} images`);
                await completeQueueJob(body.job_id, body.user_id!, body.credits_reserved!, images, effectiveImageCount, errors, body as unknown as Record<string, unknown>);
                return new Response(
                  JSON.stringify({ images, generatedCount: images.length, requestedCount: effectiveImageCount }),
                  { headers: { ...corsHeaders, "Content-Type": "application/json" } }
                );
              }
            } catch (dbErr) {
              console.error(`[generate-freestyle] Failed to save freestyle_generations record:`, dbErr);
            }
          }
        } else {
          errors.push(`Image ${i + 1} failed to generate`);
        }
      } catch (error: unknown) {
        if (typeof error === "object" && error !== null && "status" in error) {
          const statusError = error as { status: number; message: string };

          // For 429, try the alternate model before giving up (rate limits are often per-model)
          if (statusError.status === 429) {
            const fallbackModel = aiModel.includes("flash")
              ? "google/gemini-3-pro-image-preview"
              : "google/gemini-3.1-flash-image-preview";
            console.warn(`429 on ${aiModel} — trying fallback model ${fallbackModel}`);
            try {
              const fallbackPrompt = `${aspectPrompt}${batchConsistency}`;
              const contentArray = buildContentArray(
                fallbackPrompt,
                isPerspective ? undefined : body.sourceImage,
                body.productImage,
                body.modelImage,
                body.sceneImage,
              );
              if (isPerspective && referenceAngleImage) {
                contentArray.push({ type: "text", text: "[REFERENCE IMAGE]" });
                contentArray.push({ type: "image_url", image_url: { url: referenceAngleImage } });
              }
              const fallbackResult = await generateImage(contentArray, LOVABLE_API_KEY, fallbackModel, body.aspectRatio, 0);
              if (typeof fallbackResult === "string") {
                const publicUrl = await uploadBase64ToStorage(fallbackResult, userId, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
                images.push(publicUrl);
            console.log(`[generate-freestyle] Fallback model succeeded for image ${i + 1}`);

                // Save to freestyle_generations so image appears in gallery
                try {
                  const supabaseFb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
                    auth: { persistSession: false },
                  });
                  const insertDataFb: Record<string, unknown> = {
                    user_id: userId,
                    image_url: publicUrl,
                    prompt: body.prompt || '',
                    user_prompt: body.userPrompt || null,
                    aspect_ratio: body.aspectRatio || '1:1',
                    quality: body.quality || 'standard',
                    model_id: body.modelId || null,
                    scene_id: body.sceneId || null,
                    product_id: body.productId || null,
                  };
                  if (body.workflow_label) {
                    insertDataFb.workflow_label = body.workflow_label;
                  }
                  const { error: insertErrFb } = await supabaseFb.from('freestyle_generations').insert(insertDataFb);
                  if (insertErrFb) {
                    console.error(`[generate-freestyle] Failed to save freestyle_generations (fallback):`, insertErrFb.message);
                  } else {
                    console.log(`[generate-freestyle] Saved freestyle_generations record for fallback image ${i + 1}`);
                  }

                  // Early finalize in queue mode after fallback success
                  if (isQueueInternal && body.job_id && images.length > 0) {
                    console.log(`[generate-freestyle] Early finalize (fallback): completing queue job ${body.job_id}`);
                    await completeQueueJob(body.job_id, body.user_id!, body.credits_reserved!, images, effectiveImageCount, errors, body as unknown as Record<string, unknown>);
                    return new Response(
                      JSON.stringify({ images, generatedCount: images.length, requestedCount: effectiveImageCount }),
                      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
                    );
                  }
                } catch (dbErrFb) {
                  console.error(`[generate-freestyle] Failed to save freestyle_generations record (fallback):`, dbErrFb);
                }

                continue;
              }
            } catch (fallbackErr) {
              console.error(`Fallback model also failed:`, fallbackErr);
            }
            // 429 with failed fallback — treat as soft error, continue with remaining images
            errors.push(`Image ${i + 1}: Rate limited on both models`);
            continue;
          }

          if (isQueueInternal && body.job_id) {
            await completeQueueJob(body.job_id, body.user_id!, body.credits_reserved!, [], effectiveImageCount, [statusError.message], body as unknown as Record<string, unknown>);
          }
          return new Response(
            JSON.stringify({ error: statusError.message }),
            { status: statusError.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        errors.push(`Image ${i + 1}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }

      if (i < effectiveImageCount - 1) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    // Queue self-completion
    if (isQueueInternal && body.job_id) {
      await completeQueueJob(body.job_id, body.user_id!, body.credits_reserved!, images, effectiveImageCount, errors, body as unknown as Record<string, unknown>, contentBlocked, blockReason);
    }

    if (contentBlocked && images.length === 0) {
      return new Response(
        JSON.stringify({
          images: [],
          generatedCount: 0,
          requestedCount: effectiveImageCount,
          contentBlocked: true,
          blockReason,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (images.length === 0) {
      return new Response(
        JSON.stringify({ error: "Failed to generate any images", details: errors }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        images,
        generatedCount: images.length,
        requestedCount: effectiveImageCount,
        partialSuccess: images.length < effectiveImageCount,
        contentBlocked: contentBlocked || undefined,
        blockReason: contentBlocked ? blockReason : undefined,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Freestyle edge function error:", error);
    try {
      const body = await req.clone().json().catch(() => ({}));
      if (isQueueInternal && body.job_id) {
        await completeQueueJob(body.job_id, body.user_id, body.credits_reserved, [], 1, [error instanceof Error ? error.message : "Unknown error"], body);
      }
    } catch (_e) { /* best effort */ }
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
