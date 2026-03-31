// Force redeploy: v5 — fix Seedream 4:5 stretch by storing actual generated ratio (2026-03-26)
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
  return `${transformed}${sep}width=1536&quality=85`;
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
  promptOnly?: boolean;
  sceneCategory?: string;
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

// ── Shared framing instruction builder ────────────────────────────────────
function buildFramingInstruction(framing: string, hasModel: boolean): string | null {
  const modelRef = hasModel
    ? ' The body area shown must match the exact skin tone, age, and body characteristics of [MODEL REFERENCE].'
    : '';

  const framingPrompts: Record<string, string> = {
    full_body: `FRAMING — MANDATORY: Full body shot, head to toe. The frame MUST include the subject's feet touching the ground and full head with hair. Show the complete outfit and full figure. Do NOT crop at the knees or waist — the entire body from head to shoes must be visible.${modelRef}`,
    upper_body: `FRAMING — MANDATORY: Upper body shot, from the waist up. Focus on the torso and face area. Do NOT show full legs or feet.${modelRef}`,
    close_up: `FRAMING — MANDATORY CLOSE-UP / PRODUCT DETAIL: Lens 85mm at f/2.8, shallow depth-of-field with razor-sharp focus on the product zone. Tight crop from mid-chest upward — the product/garment must fill at least 60% of the visible frame area. Show fabric texture, stitching, material drape, and pattern detail at close range. Camera distance is much closer than a standard portrait. Background should be heavily blurred (bokeh) to isolate the product area.${modelRef}`,
    hand_wrist: `FRAMING — MANDATORY: Show only the hand and wrist area. The product should be naturally worn on the wrist or hand. Do NOT include the face.${modelRef}`,
    neck_shoulders: `FRAMING — MANDATORY: Jewelry display framing — collarbone and neckline area, cropped from just below the chin to mid-chest. Do NOT include the full face. Professional product photography composition.${modelRef}`,
    lower_body: `FRAMING — MANDATORY: Lower body shot from the hips to the feet. Focus on the legs and footwear area. Do NOT include the face or upper torso.${modelRef}`,
    back_view: `FRAMING — MANDATORY: Back view showing the product from behind. The subject should be facing away from the camera.${modelRef}`,
    side_profile: `FRAMING — MANDATORY: Side profile view focusing on the ear and jawline area. Show the side of the head from temple to jawline. The product should be clearly visible on or near the ear.${modelRef}`,
  };
  return framingPrompts[framing] || null;
}

// ── Unified prompt builder — positive framing, single path ───────────────
function polishUserPrompt(
  rawPrompt: string,
  context: { hasSource: boolean; hasProduct: boolean; hasModel: boolean; hasScene: boolean; isOnModelScene?: boolean },
  brandProfile?: BrandProfileContext,
  _userNegatives?: string[],
  modelContext?: string,
  cameraStyle?: "pro" | "natural",
  framing?: string,
  productDimensions?: string,
  imageRole?: string,
  editIntent?: string[],
): string {
  // ── Image edit mode: lightweight edit-safe prompt ──
  if (imageRole === 'edit' && context.hasSource) {
    const editLayers: string[] = [];
    if (rawPrompt.trim()) editLayers.push(rawPrompt);
    editLayers.push("Edit the provided image surgically. Return the SAME image with ONLY the requested modification. Do NOT regenerate, reimagine, or recompose the image. Preserve all other details, composition, lighting, and colors exactly as they are.");

    const intentInstructions: Record<string, string> = {
      replace_product: "Replace the product in the image while preserving everything else.",
      change_background: "Keep the subject intact, change the background/environment.",
      change_model: "Replace the person while preserving composition and product placement.",
      enhance: "Improve image quality, lighting, and details without changing content.",
    };
    const effectiveIntents = editIntent && editIntent.length > 0 ? editIntent : ['enhance'];
    for (const intent of effectiveIntents) {
      if (intentInstructions[intent]) editLayers.push(intentInstructions[intent]);
    }
    editLayers.push("High resolution, clean result, single cohesive photograph.");
    return editLayers.join("\n");
  }

  // ── Simple editing bypass (extract, remove bg, recolor, etc.) ──
  const isEditingRequest = detectEditingIntent(rawPrompt);
  const refCount = [context.hasSource, context.hasProduct, context.hasModel, context.hasScene].filter(Boolean).length;
  if (isEditingRequest && refCount <= 1 && !context.hasModel && !context.hasScene) {
    return `${rawPrompt}\nHigh resolution, clean result, single cohesive photograph.`;
  }

  const isSelfie = detectSelfieIntent(rawPrompt);
  const parts: string[] = [];

  // ── 1. Core intent ──
  if (isSelfie) {
    parts.push(`Authentic selfie-style photo: ${rawPrompt}`);
    parts.push(
      cameraStyle === 'natural'
        ? "Shot on iPhone front camera. Sharp focus on face, natural ambient lighting, true-to-life colors. Deep DOF, no bokeh."
        : "Shot on smartphone front camera. Sharp focus on face, flattering soft light, subtle natural bokeh."
    );
    parts.push("SELFIE COMPOSITION: Front camera POV. Subject looking into lens. One hand holding phone (phone not visible). Full head and hair visible with headroom. Frame from mid-chest up.");
  } else {
    parts.push(`Professional photography: ${rawPrompt}`);
  }

  // ── 2. References (numbered, concise) ──
  const refs: string[] = [];
  let refNum = 1;

  if (context.hasProduct) {
    const dimNote = productDimensions ? ` Dimensions: ${productDimensions} — render at realistic scale.` : "";
    refs.push(`${refNum}. PRODUCT: Match the exact product from [PRODUCT REFERENCE] — shape, color, and overall appearance.${context.hasModel ? " Ignore any person/mannequin in this image." : ""}${dimNote}`);
    refNum++;
    if (context.hasSource && !['product', 'model', 'scene'].includes(imageRole || '')) {
      refs.push(`${refNum}. REFERENCE: Use [REFERENCE IMAGE] for setting/mood inspiration. The product from [PRODUCT REFERENCE] is the hero subject.`);
      refNum++;
    }
  } else if (context.hasSource && imageRole !== 'model' && imageRole !== 'scene') {
    refs.push(`${refNum}. PRODUCT: Match the exact item from [${imageRole === 'product' ? 'PRODUCT IMAGE' : 'REFERENCE IMAGE'}] — shape, color, and overall appearance.${context.hasModel ? " Ignore any person/mannequin." : ""}`);
    refNum++;
  }

  if (context.hasModel) {
    const identityDetails = modelContext ? ` (${modelContext})` : "";
    const noFaceFramings = ['hand_wrist', 'lower_body', 'back_view', 'side_profile'];
    if (framing && noFaceFramings.includes(framing)) {
      refs.push(`${refNum}. MODEL: Match skin tone, body type, and physical characteristics of [MODEL REFERENCE]${identityDetails}. Face not visible in this framing.`);
    } else {
      refs.push(`${refNum}. MODEL: The person must match [MODEL REFERENCE]${identityDetails} — same face, features, skin tone, hair, body. This is a specific individual.`);
    }
    refNum++;
    if (modelContext) {
      const lowerCtx = modelContext.toLowerCase();
      if (lowerCtx.startsWith('male')) {
        refs.push("GENDER: All people must be male.");
      } else if (lowerCtx.startsWith('female')) {
        refs.push("GENDER: All people must be female.");
      }
    }
  }

  if (context.hasScene) {
    if (context.hasModel) {
      refs.push(`${refNum}. SCENE: Place the person naturally INTO the environment shown in [SCENE REFERENCE]. Replicate the camera angle, framing, and composition of the scene image — if it shows a view through a window, shoot through that window; if it shows a low angle, use a low angle. Match the scene's lighting direction, color temperature, and ambient shadows on the person's body and face. The person must appear physically present in this space — correct perspective, scale relative to surroundings, feet/body grounded on surfaces, consistent shadow direction. Ignore any products or people already in the scene image.`);
    } else if (context.isOnModelScene && context.hasProduct) {
      // On-model scene category but no explicit model selected — inject person placement
      refs.push(`${refNum}. SCENE: Place a professional model naturally INTO the environment shown in [SCENE REFERENCE]. Replicate the camera angle, framing, and composition of the scene image — if it shows a view through a window, shoot through that window; if it shows a low angle, use a low angle. The model should wear the product as the hero piece with a complete, styled outfit. Match the scene's lighting direction, color temperature, and ambient shadows on the person's body and face. The person must appear physically present in this space — correct perspective, scale relative to surroundings, feet/body grounded on surfaces, consistent shadow direction. Ignore any products or people already in the scene image.`);
    } else {
      refs.push(`${refNum}. SCENE: Use [SCENE REFERENCE] for environment, lighting, atmosphere. Replicate the camera angle, framing, and composition of the scene image. Ignore any products in the scene image.`);
    }
    refNum++;
  }

  if (context.hasProduct && context.hasModel) {
    refs.push("OUTFIT COMPLETION: The product is the hero piece. The model must wear a COMPLETE outfit — never appear partially dressed or missing clothing. Choose complementary garments (bottoms, shoes, accessories) that match the scene context and style: e.g. tailored trousers for studio/urban, shorts or athletic wear for sport/outdoor/active scenes, swimwear for beach/pool settings. The outfit must look intentional and styled — never accidentally incomplete.");
  } else if (context.hasProduct && context.isOnModelScene && !context.hasModel) {
    // On-model scene without explicit model — still need outfit completion directive
    refs.push("OUTFIT COMPLETION: The product is the hero piece. The model must wear a COMPLETE outfit — never appear partially dressed or missing clothing. Choose complementary garments (bottoms, shoes, accessories) that match the scene context and style: e.g. tailored trousers for studio/urban, shorts or athletic wear for sport/outdoor/active scenes, swimwear for beach/pool settings. The outfit must look intentional and styled — never accidentally incomplete.");
  }

  if (refs.length > 0) {
    parts.push("");
    parts.push("REFERENCES:");
    parts.push(...refs);
  }

  // ── 3. Quality block (positive framing) ──
  parts.push("");
  const qualityLines: string[] = [
    "Photorealistic. Natural skin with visible pores and fine lines.",
    "Sharp detail on textures and surfaces.",
    "Single cohesive photograph, edge-to-edge.",
  ];

  if (!isSelfie) {
    if (cameraStyle === 'natural') {
      qualityLines.push("Shot on iPhone. Deep depth of field, everything sharp foreground to background. True-to-life colors, natural ambient light, no retouching.");
    } else {
      qualityLines.push("Shot on 85mm f/2.8. Sculpted studio lighting, subtle film grain, elegant highlight roll-off.");
    }
  }

  parts.push(`QUALITY: ${qualityLines.join(" ")}`);

  // ── 4. Framing ──
  const effectiveFraming = framing || (detectFullBodyIntent(rawPrompt) ? 'full_body' : null);
  if (effectiveFraming) {
    const instruction = buildFramingInstruction(effectiveFraming, context.hasModel);
    if (instruction) {
      parts.push(instruction);
    }
  } else if (context.hasModel && !isSelfie) {
    parts.push("FRAMING: Full head, hair, and upper body visible. Natural headroom. Face in upper third of composition.");
  } else if (context.hasProduct && !context.hasModel && !context.hasScene && !isSelfie) {
    parts.push("FRAMING: Creative product photography angle — overhead, 45-degree, or dramatic perspective. Professional composition with intentional negative space.");
  }

  // ── 5. Brand (compact) ──
  if (brandProfile?.tone) {
    const toneDesc = TONE_DESCRIPTIONS[brandProfile.tone] || brandProfile.tone;
    const colorDesc = brandProfile.colorFeel ? (COLOR_FEEL_DESCRIPTIONS[brandProfile.colorFeel] || brandProfile.colorFeel) : "";
    const brandKeywords = brandProfile.brandKeywords?.length ? `. Keywords: ${brandProfile.brandKeywords.join(", ")}` : "";
    parts.push(`BRAND: ${toneDesc}${colorDesc ? `. Color: ${colorDesc}` : ""}${brandKeywords}`);
  }

  return parts.join("\n");
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

// ── Normalized provider result type ──────────────────────────────────────
type FailureType =
  | "rate_limit"
  | "credits_exhausted"
  | "server_error"
  | "timeout"
  | "network_error"
  | "no_image_returned"
  | "unsafe_block"
  | "invalid_request"
  | "auth_error"
  | "unknown";

type ProviderResult = {
  ok: boolean;
  imageUrl?: string;
  blocked?: boolean;
  blockReason?: string;
  failureType?: FailureType;
  retryable?: boolean;
  statusCode?: number;
  provider: "nanobanana" | "seedream";
  model: string;
  durationMs: number;
  rawError?: string;
  actualAspectRatio?: string;
};

// ── Provider registry — change model IDs here for version upgrades ───────
const PROVIDERS = {
  "nanobanana-flash": { gateway: "lovable" as const, model: "google/gemini-3.1-flash-image-preview" },
  "nanobanana-pro":   { gateway: "lovable" as const, model: "google/gemini-3-pro-image-preview" },
  "seedream-4.5":     { gateway: "ark" as const, model: "seedream-4-5-251128", apiKeyEnv: "BYTEPLUS_ARK_API_KEY" },
} as const;

// ── Seedream ARK image generation ────────────────────────────────────────
function seedreamSizeForRatio(_aspectRatio: string): string {
  return "2K";
}

function seedreamAspectRatio(appRatio: string): string {
  const map: Record<string, string> = {
    "1:1": "1:1",
    "16:9": "16:9",
    "9:16": "9:16",
    "4:3": "4:3",
    "3:4": "3:4",
    "4:5": "4:5",
    "5:4": "5:4",
    "3:2": "3:2",
    "2:3": "2:3",
    "21:9": "21:9",
  };
  return map[appRatio] || "1:1";
}

// Seedream content moderation error codes
const SEEDREAM_MODERATION_CODES = [1301, 1302, 1303, 1304, 1305, 1024];

/** Single-attempt Seedream generation — returns normalized ProviderResult */
async function generateImageSeedream(
  prompt: string,
  imageUrls: string[],
  model: string,
  apiKey: string,
  aspectRatio = "1:1",
  timeoutOverrideMs?: number,
): Promise<ProviderResult> {
  const ARK_BASE = "https://ark.ap-southeast.bytepluses.com/api/v3/images/generations";
  const size = seedreamSizeForRatio(aspectRatio);
  const attemptStart = performance.now();
  const timeoutMs = timeoutOverrideMs || 90_000;

  try {
    const seedreamRatio = seedreamAspectRatio(aspectRatio);
    const body: Record<string, unknown> = {
      model,
      prompt,
      size,
      aspect_ratio: seedreamRatio,
      response_format: "url",
      watermark: false,
      sequential_image_generation: "disabled",
    };
    if (imageUrls.length === 1) {
      body.image = imageUrls[0];
    } else if (imageUrls.length > 1) {
      body.image = imageUrls;
    }

    const response = await fetch(ARK_BASE, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });

    const durationMs = Math.round(performance.now() - attemptStart);

    if (!response.ok) {
      // Try to parse error body for moderation codes
      let errorText = "";
      try { errorText = await response.text(); } catch (_) { /* ignore */ }

      if (response.status === 429) {
        return { ok: false, failureType: "rate_limit", retryable: true, statusCode: 429, provider: "seedream", model, durationMs, rawError: "Rate limit exceeded" };
      }
      if (response.status === 401 || response.status === 403) {
        return { ok: false, failureType: "auth_error", retryable: false, statusCode: response.status, provider: "seedream", model, durationMs, rawError: errorText.slice(0, 200) };
      }

      // Check for moderation in error body
      try {
        const errJson = JSON.parse(errorText);
        const errCode = errJson?.error?.code || errJson?.code;
        if (errCode && SEEDREAM_MODERATION_CODES.includes(Number(errCode))) {
          const reason = errJson?.error?.message || errJson?.message || "Content moderated by Seedream";
          return { ok: false, failureType: "unsafe_block", blocked: true, blockReason: reason, retryable: false, statusCode: response.status, provider: "seedream", model, durationMs };
        }
      } catch (_) { /* not JSON */ }

      return { ok: false, failureType: "server_error", retryable: true, statusCode: response.status, provider: "seedream", model, durationMs, rawError: errorText.slice(0, 200) };
    }

    const data = await response.json();

    // Check for moderation in successful response body
    const respCode = data?.error?.code || data?.code;
    if (respCode && SEEDREAM_MODERATION_CODES.includes(Number(respCode))) {
      const reason = data?.error?.message || data?.message || "Content moderated by Seedream";
      return { ok: false, failureType: "unsafe_block", blocked: true, blockReason: reason, retryable: false, statusCode: 200, provider: "seedream", model, durationMs };
    }

    const imageUrl = data?.data?.[0]?.url;
    if (!imageUrl) {
      return { ok: false, failureType: "no_image_returned", retryable: true, statusCode: 200, provider: "seedream", model, durationMs, rawError: "No URL in response" };
    }

    // Track actual aspect ratio if Seedream mapped to a different one
    const seedreamRatioActual = seedreamAspectRatio(aspectRatio);
    const ratioWasMapped = seedreamRatioActual !== aspectRatio;
    return { ok: true, imageUrl, provider: "seedream", model, durationMs, ...(ratioWasMapped ? { actualAspectRatio: seedreamRatioActual } : {}) };
  } catch (error: unknown) {
    const durationMs = Math.round(performance.now() - attemptStart);
    const isTimeout = error instanceof DOMException && error.name === "TimeoutError";
    if (isTimeout) {
      return { ok: false, failureType: "timeout", retryable: true, provider: "seedream", model, durationMs, rawError: `Request timed out (${timeoutMs / 1000}s)` };
    }
    return { ok: false, failureType: "network_error", retryable: true, provider: "seedream", model, durationMs, rawError: error instanceof Error ? error.message : "Unknown error" };
  }
}

// ── Seedream image role tracking ─────────────────────────────────────────
interface SeedreamRoleImage {
  url: string;
  role: "model" | "product" | "scene" | "other";
}

// ── Clean prompt for Seedream (strip Gemini-specific directives) ─────────
function cleanPromptForSeedream(prompt: string, roleImages?: SeedreamRoleImage[]): string {
  const aspectIdx = prompt.indexOf("Output aspect ratio:");
  if (aspectIdx !== -1) {
    const lineEnd = prompt.indexOf("\n", aspectIdx);
    const aspectLine = lineEnd !== -1 ? prompt.substring(aspectIdx, lineEnd) : prompt.substring(aspectIdx);
    prompt = prompt.substring(0, aspectIdx).trimEnd() + "\n\n" + aspectLine.trim();
  }

  prompt = prompt.replace(/BATCH CONSISTENCY:[\s\S]*/i, "").trimEnd();
  prompt = prompt.replace(/Variation\s+\d+:.*/gi, "").trimEnd();

  if (roleImages && roleImages.length > 0) {
    const roleIndex: Record<string, number> = {};
    roleImages.forEach((img, i) => {
      if (!roleIndex[img.role]) roleIndex[img.role] = i + 1;
    });

    const modelIdx = roleIndex["model"];
    const productIdx = roleIndex["product"];
    const sceneIdx = roleIndex["scene"];
    const otherIdx = roleIndex["other"];

    prompt = prompt
      .replace(/\[MODEL REFERENCE\]/g, modelIdx ? `the person from image ${modelIdx}` : "the model from the reference")
      .replace(/\[PRODUCT REFERENCE\]/g, productIdx ? `the product from image ${productIdx}` : "the product from the reference")
      .replace(/\[PRODUCT IMAGE\]/g, productIdx ? `the product from image ${productIdx}` : "the product from the reference")
      .replace(/\[SCENE REFERENCE\]/g, sceneIdx ? `the scene/background from image ${sceneIdx}` : "the scene from the reference")
      .replace(/\[REFERENCE IMAGE\]/g, otherIdx ? `image ${otherIdx}` : "the reference image");
  } else {
    prompt = prompt
      .replace(/\[MODEL REFERENCE\]/g, "the model from the reference")
      .replace(/\[PRODUCT REFERENCE\]/g, "the product from the reference")
      .replace(/\[PRODUCT IMAGE\]/g, "the product from the reference")
      .replace(/\[SCENE REFERENCE\]/g, "the scene from the reference")
      .replace(/\[REFERENCE IMAGE\]/g, "the reference image");
  }

  prompt = prompt.replace(/\n{3,}/g, "\n\n").trim();
  return prompt;
}

function buildSeedreamRoleDirective(roleImages: SeedreamRoleImage[]): string {
  if (roleImages.length === 0) return "";

  const lines: string[] = ["", "IMAGE ROLES:"];
  let hasModel = false;
  let hasProduct = false;
  roleImages.forEach((img, i) => {
    const idx = i + 1;
    switch (img.role) {
      case "model":
        hasModel = true;
        lines.push(`- Image ${idx} is the MODEL: preserve exact face, hair color, skin tone, body type, and all physical features from this person.`);
        break;
      case "product":
        hasProduct = true;
        lines.push(`- Image ${idx} is the PRODUCT: CRITICAL — replicate this item EXACTLY as shown. Match precise shape, silhouette, color, and overall appearance. This is a specific real product that must be instantly recognizable.`);
        break;
      case "scene":
        lines.push(`- Image ${idx} is the BACKGROUND/SCENE: IMPORTANT — recreate this specific environment, setting, and atmosphere in the final image. Match the location type, lighting conditions, color palette, and spatial composition from this scene reference. Do not take person or product features from this image.`);
        break;
      default:
        lines.push(`- Image ${idx} is a REFERENCE: use for style/mood inspiration.`);
        break;
    }
  });

  if (hasModel && hasProduct) {
    lines.push("");
    lines.push("OUTFIT COMPLETION (MANDATORY): The product is the hero piece. The model must wear a COMPLETE outfit — never appear partially dressed or missing clothing. Choose complementary garments (bottoms, shoes, accessories) that match the scene context and style: e.g. tailored trousers for studio/urban, shorts or athletic wear for sport/outdoor/active scenes, swimwear for beach/pool settings. The outfit must look intentional and styled — never accidentally incomplete.");
  }

  return lines.join("\n");
}

function convertContentToSeedreamInput(content: ContentItem[]): { prompt: string; imageUrls: string[] } {
  const textParts: string[] = [];
  const roleImages: SeedreamRoleImage[] = [];
  let lastTextBeforeImage = "";

  for (const item of content) {
    if (item.type === "text") {
      textParts.push(item.text);
      lastTextBeforeImage = item.text;
    } else if (item.type === "image_url") {
      const url = item.image_url.url;
      let role: SeedreamRoleImage["role"] = "other";
      if (/\[MODEL REFERENCE\]|model|person|face|portrait/i.test(lastTextBeforeImage)) {
        role = "model";
      } else if (/\[PRODUCT REFERENCE\]|\[PRODUCT IMAGE\]|product/i.test(lastTextBeforeImage)) {
        role = "product";
      } else if (/\[SCENE REFERENCE\]|scene|background|environment/i.test(lastTextBeforeImage)) {
        role = "scene";
      }
      roleImages.push({ url, role });
    }
  }

  // Put scene FIRST so Seedream treats it as primary style/environment reference
  const orderedRoleImages = [
    ...roleImages.filter(i => i.role === "scene"),
    ...roleImages.filter(i => i.role === "product"),
    ...roleImages.filter(i => i.role === "model"),
    ...roleImages.filter(i => i.role === "other"),
  ];

  const rolesSummary = orderedRoleImages.map((r, i) => `${i + 1}:${r.role}`).join(", ");
  console.log(`[seedream] Image roles: [${rolesSummary}]`);

  const rawPrompt = textParts.join("\n");
  const cleanedPrompt = cleanPromptForSeedream(rawPrompt, orderedRoleImages);
  const roleDirective = buildSeedreamRoleDirective(orderedRoleImages);
  const finalPrompt = roleDirective ? `${cleanedPrompt}\n${roleDirective}` : cleanedPrompt;

  console.log(`[generate-freestyle] Seedream prompt cleaned: ${rawPrompt.length} → ${finalPrompt.length} chars`);
  return { prompt: finalPrompt, imageUrls: orderedRoleImages.map(r => r.url) };
}

// ── Download a hosted URL and upload to Supabase Storage ─────────────────
async function downloadAndUploadToStorage(
  hostedUrl: string,
  userId: string,
  supabaseUrl: string,
  serviceRoleKey: string,
): Promise<string> {
  const response = await fetch(hostedUrl);
  if (!response.ok) throw new Error(`Failed to download image: ${response.status}`);
  const blob = await response.blob();
  const fileName = `${userId}/${crypto.randomUUID()}.png`;
  const arrayBuf = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuf);

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const { error } = await supabase.storage
    .from("freestyle-images")
    .upload(fileName, bytes, { contentType: "image/png", upsert: false });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  const { data: urlData } = supabase.storage.from("freestyle-images").getPublicUrl(fileName);
  return urlData.publicUrl;
}

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

/** Single-attempt Nano Banana generation — returns normalized ProviderResult */
async function generateImage(
  content: ContentItem[],
  apiKey: string,
  model: string,
  aspectRatio?: string,
  quality: "standard" | "high" = "standard",
  timeoutOverrideMs?: number,
): Promise<ProviderResult> {
  const isProModel = /gemini-3-pro|gemini-3\.1-pro/i.test(model);
  const defaultTimeoutMs = isProModel ? 120_000 : 90_000;
  const timeoutMs = timeoutOverrideMs || defaultTimeoutMs;
  const attemptStart = performance.now();

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
          image_config: {
            ...(aspectRatio ? { aspect_ratio: aspectRatio } : {}),
            image_size: quality === 'high' ? '2K' : '1K',
          },
        }),
        signal: AbortSignal.timeout(timeoutMs),
      }
    );

    const durationMs = Math.round(performance.now() - attemptStart);

    if (!response.ok) {
      if (response.status === 429) {
        return { ok: false, failureType: "rate_limit", retryable: true, statusCode: 429, provider: "nanobanana", model, durationMs, rawError: "Rate limit exceeded" };
      }
      if (response.status === 402) {
        return { ok: false, failureType: "credits_exhausted", retryable: false, statusCode: 402, provider: "nanobanana", model, durationMs, rawError: "Credits exhausted" };
      }
      if (response.status === 401 || response.status === 403) {
        return { ok: false, failureType: "auth_error", retryable: false, statusCode: response.status, provider: "nanobanana", model, durationMs };
      }
      let errorText = "";
      try { errorText = await response.text(); } catch (_) { /* ignore */ }
      return { ok: false, failureType: "server_error", retryable: true, statusCode: response.status, provider: "nanobanana", model, durationMs, rawError: errorText.slice(0, 200) };
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      if (isContentBlocked(data)) {
        const reason = extractBlockReason(data);
        return { ok: false, failureType: "unsafe_block", blocked: true, blockReason: reason, retryable: false, statusCode: 200, provider: "nanobanana", model, durationMs };
      }
      return { ok: false, failureType: "no_image_returned", retryable: true, statusCode: 200, provider: "nanobanana", model, durationMs, rawError: "No image in response" };
    }

    return { ok: true, imageUrl, provider: "nanobanana", model, durationMs };
  } catch (error: unknown) {
    const durationMs = Math.round(performance.now() - attemptStart);
    const isTimeout = error instanceof DOMException && error.name === "TimeoutError";
    if (isTimeout) {
      return { ok: false, failureType: "timeout", retryable: true, provider: "nanobanana", model, durationMs, rawError: `Request timed out (${timeoutMs / 1000}s)` };
    }
    return { ok: false, failureType: "network_error", retryable: true, provider: "nanobanana", model, durationMs, rawError: error instanceof Error ? error.message : "Unknown error" };
  }
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

  content.push({ type: "text", text: prompt });

  if (productImage) {
    content.push({ type: "text", text: "[PRODUCT REFERENCE]" });
    content.push({ type: "image_url", image_url: { url: productImage } });
  }

  if (sourceImage) {
    const label = imageRole === 'edit' ? '[IMAGE TO EDIT]'
      : imageRole === 'product' ? '[PRODUCT IMAGE]'
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

// ── Centralized Freestyle Fallback Executor ──────────────────────────────
// 3-attempt chain: primary → other provider → final rescue on primary
// Wall-clock budget enforced: primary gets max 75s, fallbacks use remaining budget.
// No Pro→Flash auto-downgrade. Terminal failures stop immediately.

const PRIMARY_ATTEMPT_TIMEOUT_MS = 75_000;    // 75s max for first attempt (was 120s) — leaves 60s+ for fallback
const WALL_CLOCK_BUDGET_MS = 140_000;         // 140s total budget — 10s safety before platform kills at ~150s
const MIN_ATTEMPT_BUDGET_MS = 15_000;         // 15s minimum for a fallback attempt (was 25s)
const SAFETY_DEADLINE_MS = 135_000;           // 135s — graceful abort point before platform kill

interface FallbackOpts {
  primaryProvider: "nanobanana" | "seedream";
  primaryModel: string;
  contentArray: ContentItem[];
  aspectRatio: string;
  quality: "standard" | "high";
  lovableApiKey: string;
  arkApiKey?: string;
  canUseSeedream: boolean;  // false if edit mode or no ARK key
  imageIndex: number;       // for logging
  jobId?: string;           // for logging
}

async function runFreestyleWithFallback(opts: FallbackOpts): Promise<ProviderResult> {
  const { primaryProvider, primaryModel, contentArray, aspectRatio, quality, lovableApiKey, arkApiKey, canUseSeedream, imageIndex, jobId } = opts;
  const executorStart = performance.now();

  const logPrefix = `[FREESTYLE] ${jobId ? `job=${jobId} ` : ""}img=${imageIndex + 1}`;

  // Build the attempt chain: [primary, secondary, rescue]
  type AttemptDef = { provider: "nanobanana" | "seedream"; model: string };
  const chain: AttemptDef[] = [];

  // Attempt 1: primary
  chain.push({ provider: primaryProvider, model: primaryModel });

  // Attempt 2: cross-model fallback (always try the other provider if available)
  if (primaryProvider === "nanobanana" && canUseSeedream) {
    chain.push({ provider: "seedream", model: PROVIDERS["seedream-4.5"].model });
  } else if (primaryProvider === "seedream") {
    chain.push({ provider: "nanobanana", model: PROVIDERS["nanobanana-pro"].model });
  } else {
    // No seedream available — rescue on same provider
    chain.push({ provider: primaryProvider, model: primaryModel });
  }

  // Attempt 3: final rescue on original provider
  chain.push({ provider: primaryProvider, model: primaryProvider === "seedream" ? PROVIDERS["seedream-4.5"].model : primaryModel });

  // Deduplicate consecutive identical attempts
  const dedupedChain: AttemptDef[] = [chain[0]];
  for (let c = 1; c < chain.length; c++) {
    const prev = dedupedChain[dedupedChain.length - 1];
    if (chain[c].provider !== prev.provider || chain[c].model !== prev.model) {
      dedupedChain.push(chain[c]);
    }
  }

  console.log(`${logPrefix} fallback chain: ${dedupedChain.map(d => `${d.provider}/${d.model}`).join(" → ")} (budget=${WALL_CLOCK_BUDGET_MS / 1000}s)`);

  const summaryParts: string[] = [];
  let lastResult: ProviderResult | null = null;

  for (let attempt = 0; attempt < dedupedChain.length; attempt++) {
    const def = dedupedChain[attempt];
    const maxAttempts = dedupedChain.length;
    const elapsedMs = performance.now() - executorStart;
    const remainingMs = WALL_CLOCK_BUDGET_MS - elapsedMs;

    // Wall-clock budget guard: skip if not enough time for a meaningful attempt
    if (attempt > 0 && remainingMs < MIN_ATTEMPT_BUDGET_MS) {
      console.log(`${logPrefix} wall-clock budget exhausted: ${(elapsedMs / 1000).toFixed(1)}s elapsed, ${(remainingMs / 1000).toFixed(1)}s remaining (<${MIN_ATTEMPT_BUDGET_MS / 1000}s minimum) — skipping ${maxAttempts - attempt} remaining fallback(s)`);
      break;
    }

    // Compute per-attempt timeout: primary gets max 120s, fallbacks get remaining budget minus safety buffer
    let attemptTimeoutMs: number;
    if (attempt === 0) {
      attemptTimeoutMs = Math.min(PRIMARY_ATTEMPT_TIMEOUT_MS, remainingMs - MIN_ATTEMPT_BUDGET_MS);
    } else {
      // Fallback: use remaining budget minus 5s safety buffer
      attemptTimeoutMs = Math.min(remainingMs - 5_000, 90_000);
    }
    attemptTimeoutMs = Math.max(attemptTimeoutMs, 15_000); // absolute minimum 15s

    let result: ProviderResult;
    if (def.provider === "seedream" && arkApiKey) {
      const seedreamInput = convertContentToSeedreamInput(contentArray);
      result = await generateImageSeedream(seedreamInput.prompt, seedreamInput.imageUrls, def.model, arkApiKey, aspectRatio, attemptTimeoutMs);
    } else {
      result = await generateImage(contentArray, lovableApiKey, def.model, aspectRatio, quality, attemptTimeoutMs);
    }

    const durationSec = (result.durationMs / 1000).toFixed(1);
    const totalElapsedSec = ((performance.now() - executorStart) / 1000).toFixed(1);
    const outcome = result.ok ? "ok" : result.failureType || "unknown";
    console.log(`${logPrefix} attempt=${attempt + 1}/${maxAttempts} provider=${def.provider} model=${def.model} timeout=${(attemptTimeoutMs / 1000).toFixed(0)}s duration=${durationSec}s total_elapsed=${totalElapsedSec}s result=${outcome}${result.retryable ? " retryable=true" : ""}${result.blocked ? " blocked=true" : ""}`);

    summaryParts.push(`${def.provider}/${def.model}→${outcome}(${durationSec}s)`);
    lastResult = result;

    // Success — return immediately
    if (result.ok) {
      console.log(`${logPrefix} summary: ${summaryParts.join(" | ")} (total=${totalElapsedSec}s)`);
      return result;
    }

    // Terminal failure — stop the chain
    if (!result.retryable) {
      console.log(`${logPrefix} terminal failure: ${result.failureType} — stopping fallback chain`);
      console.log(`${logPrefix} summary: ${summaryParts.join(" | ")} (total=${totalElapsedSec}s)`);
      return result;
    }

    // Retryable — log fallback reason and continue
    if (attempt < dedupedChain.length - 1) {
      const next = dedupedChain[attempt + 1];
      console.log(`[FALLBACK] ${logPrefix} ${def.provider}→${next.provider} reason=${result.failureType} after ${durationSec}s`);
    }
  }

  // All attempts exhausted
  const totalElapsedSec = ((performance.now() - executorStart) / 1000).toFixed(1);
  console.log(`${logPrefix} all attempts exhausted: ${summaryParts.join(" | ")} (total=${totalElapsedSec}s)`);
  return lastResult!;
}

/** Save a freestyle_generations record + optionally early-finalize queue job */
async function saveFreestyleGeneration(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  publicUrl: string,
  body: FreestyleRequest & { job_id?: string; credits_reserved?: number; workflow_label?: string },
  imageIndex: number,
): Promise<void> {
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
  if ((body as any).providerUsed) {
    insertData.provider_used = (body as any).providerUsed;
  }
  const { error: insertErr } = await supabase.from('freestyle_generations').insert(insertData);
  if (insertErr) {
    console.error(`[generate-freestyle] Failed to save freestyle_generations:`, insertErr.message);
  } else {
    console.log(`[generate-freestyle] Saved freestyle_generations record for image ${imageIndex + 1}`);
  }
}

/** Helper: update generation_queue and handle credits when called from the queue */
async function completeQueueJob(
  supabase: ReturnType<typeof createClient>,
  supabaseUrl: string,
  serviceRoleKey: string,
  jobId: string,
  userId: string,
  creditsReserved: number,
  images: string[],
  requestedCount: number,
  errors: string[],
  payload: Record<string, unknown>,
  contentBlocked: boolean = false,
  blockReason: string | null = null,
  providerUsed?: string,
  durationMs?: number,
) {

  // Guard: if user already cancelled, skip completion to preserve refund
  const { data: currentJob } = await supabase
    .from("generation_queue")
    .select("status")
    .eq("id", jobId)
    .single();

  if (currentJob?.status === "cancelled") {
    console.log(`[generate-freestyle] Job ${jobId} was cancelled — skipping completion`);
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

  const result = { images, generatedCount, requestedCount, errors: errors.length > 0 ? errors : undefined, providerUsed: providerUsed || undefined, durationMs: durationMs || undefined };

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

  if (generatedCount < requestedCount) {
    const perImageCost = Math.floor(creditsReserved / requestedCount);
    const refundAmount = perImageCost * (requestedCount - generatedCount);
    if (refundAmount > 0) {
      await supabase.rpc("refund_credits", { p_user_id: userId, p_amount: refundAmount });
      console.log(`[generate-freestyle] Partial: refunded ${refundAmount} credits for job ${jobId}`);
    }
  }

  console.log(`[generate-freestyle] ✓ Queue job ${jobId} completed (${generatedCount} images)`);

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

  const requestStartTime = performance.now();

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

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

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

    // Custom prompt-only scenes: clear scene image, rely on prompt hint only
    if (body.promptOnly) {
      body.sceneImage = undefined;
      console.log(`[FREESTYLE] Prompt-only custom scene (${body.sceneId}) — scene image cleared`);
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

    const ON_MODEL_CATEGORIES = ['studio', 'lifestyle', 'editorial', 'streetwear', 'fitness', 'beauty'];
    const isOnModelScene = !!body.sceneCategory && ON_MODEL_CATEGORIES.includes(body.sceneCategory);

    const polishContext = {
      hasSource: !!body.sourceImage,
      hasProduct: !!body.productImage || (!!body.sourceImage && body.imageRole === 'product'),
      hasModel: !!body.modelImage || (!!body.sourceImage && body.imageRole === 'model'),
      hasScene: !!body.sceneImage || (!!body.sourceImage && body.imageRole === 'scene'),
      isOnModelScene,
    };

    let finalPrompt: string;
    if (isPerspective) {
      finalPrompt = enrichedPrompt;
    } else if (body.polishPrompt) {
      finalPrompt = polishUserPrompt(enrichedPrompt, polishContext, body.brandProfile, body.negatives, body.modelContext, body.cameraStyle, body.framing, body.productDimensions, body.imageRole, body.editIntent);
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
      const doNotRules = body.brandProfile?.doNotRules || [];
      if (doNotRules.length > 0) {
        unpolished += `\n\nBrand constraints: ${doNotRules.join(", ")}`;
      }
      if (body.cameraStyle === "natural") {
        unpolished += `\n\nCAMERA RENDERING STYLE — NATURAL (iPhone): Shot on a latest-generation iPhone. Ultra-sharp details across the entire frame with deep depth of field (everything in focus, minimal bokeh). True-to-life, unedited color reproduction — no color grading, no warm/cool push. Natural ambient lighting only. The image should feel authentic and unprocessed.`;
      }
      if (body.framing) {
        const instruction = buildFramingInstruction(body.framing, !!body.modelImage);
        if (instruction) {
          unpolished += `\n\n${instruction}`;
        }
      }
      finalPrompt = unpolished;
    }

    const isEditMode = body.imageRole === 'edit' && !!body.sourceImage;
    const aspectPrompt = isEditMode
      ? `${finalPrompt}\n\nIMPORTANT: Return the edited image at the SAME dimensions and aspect ratio as the input image. Do not crop, resize, or reframe. Preserve everything except the requested edit.`
      : `${finalPrompt}\n\nOutput aspect ratio: ${body.aspectRatio}. CRITICAL: The image must fill the ENTIRE canvas edge-to-edge. Do NOT add any black borders, black bars, letterboxing, pillarboxing, padding, or margins around the image. The photograph must extend to all four edges with no empty space.`;

    const forceProModel = !!(body as Record<string, unknown>).forceProModel;
    const hasModelImage = !!body.modelImage || (!!body.sourceImage && body.imageRole === 'model');
    // isEditMode already declared above
    const providerOverride = ((body as Record<string, unknown>).providerOverride as string) || null;
    const aiModel = (forceProModel || isPerspective || hasModelImage || body.quality === "high" || isEditMode)
      ? "google/gemini-3-pro-image-preview"
      : "google/gemini-3.1-flash-image-preview";
    const ARK_API_KEY = Deno.env.get("BYTEPLUS_ARK_API_KEY");
    const useSeedream = providerOverride === "seedream-4.5" && !!ARK_API_KEY && body.imageRole !== 'edit';
    if (body.imageRole === 'edit' && providerOverride === "seedream-4.5") {
      console.log("[generate-freestyle] Edit mode: forcing Nano Banana (Seedream cannot edit images)");
    }

    // Determine if Seedream can be used as fallback
    // Provider override is now "primary preference" — fallback can still use the other provider
    const canUseSeedream = !!ARK_API_KEY && body.imageRole !== 'edit';

    console.log("[generate-freestyle] ARK key present:", !!ARK_API_KEY);
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
      sceneCategory: body.sceneCategory || null,
      isOnModelScene,
      isQueueInternal,
      jobId: body.job_id || null,
      providerOverride,
      useSeedream,
      canUseSeedream,
      hasArkKey: !!ARK_API_KEY,
    });

    // Extend timeout_at for queue jobs — 3min so cleanup_stale_jobs catches
    // platform-killed functions quickly instead of waiting 10 min
    if (isQueueInternal && body.job_id) {
      try {
        await supabase.from('generation_queue')
          .update({ timeout_at: new Date(Date.now() + 3 * 60 * 1000).toISOString() })
          .eq('id', body.job_id);
        console.log(`[generate-freestyle] Extended timeout_at to 3min for job ${body.job_id}`);
      } catch (e) {
        console.warn(`[generate-freestyle] Failed to extend timeout_at:`, e);
      }
    }

    const images: string[] = [];
    const errors: string[] = [];
    let contentBlocked = false;
    let blockReason = "";
    let lastActualProvider = useSeedream ? "seedream-4.5" : aiModel;

    const batchConsistency = effectiveImageCount > 1
      ? "\n\nBATCH CONSISTENCY: Maintain the same color palette, lighting direction, overall mood, and visual style. Only vary composition, angle, and framing."
      : "";

    for (let i = 0; i < effectiveImageCount; i++) {
      // Layer 4: Safety deadline — abort gracefully before platform kills us
      const elapsedSinceStart = performance.now() - requestStartTime;
      if (elapsedSinceStart > SAFETY_DEADLINE_MS) {
        console.warn(`[generate-freestyle] SAFETY DEADLINE reached (${(elapsedSinceStart / 1000).toFixed(1)}s) before image ${i + 1} — aborting loop gracefully`);
        errors.push(`Safety deadline reached at ${(elapsedSinceStart / 1000).toFixed(0)}s — skipped image ${i + 1}`);
        break;
      }
      const variationSuffix =
        i === 0
          ? batchConsistency
          : `${batchConsistency}\n\nVariation ${i + 1}: Create a different composition and angle while keeping the same subject, style, and lighting.`;

      const promptWithVariation = `${aspectPrompt}${variationSuffix}`;

      const effectiveSourceImage = isPerspective ? undefined : body.sourceImage;
      const contentArray = buildContentArray(
        promptWithVariation,
        effectiveSourceImage,
        body.productImage,
        body.modelImage,
        body.sceneImage,
        body.imageRole,
      );

      if (isPerspective && referenceAngleImage) {
        contentArray.push({ type: "text", text: "[REFERENCE IMAGE]" });
        contentArray.push({ type: "image_url", image_url: { url: referenceAngleImage } });
      }

      // Determine primary provider/model for this image
      const primaryProvider: "nanobanana" | "seedream" = useSeedream ? "seedream" : "nanobanana";
      const primaryModel = useSeedream ? PROVIDERS["seedream-4.5"].model : aiModel;

      // Run centralized fallback executor
      const result = await runFreestyleWithFallback({
        primaryProvider,
        primaryModel,
        contentArray,
        aspectRatio: body.aspectRatio,
        quality: body.quality || "standard",
        lovableApiKey: LOVABLE_API_KEY,
        arkApiKey: ARK_API_KEY,
        canUseSeedream,
        imageIndex: i,
        jobId: body.job_id,
      });

      const actualProvider = `${result.provider}/${result.model}`;

      if (result.ok) {
        // Upload to storage
        const publicUrl = result.imageUrl!.startsWith("http")
          ? await downloadAndUploadToStorage(result.imageUrl!, userId, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
          : await uploadBase64ToStorage(result.imageUrl!, userId, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        images.push(publicUrl);
        lastActualProvider = actualProvider;
        console.log(`[generate-freestyle] Generated and uploaded freestyle image ${i + 1}/${effectiveImageCount}`);

        // Heartbeat: update queue with partial progress
        if (isQueueInternal && body.job_id) {
          try {
            await supabase.from('generation_queue')
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
            const { data: jobCheck } = await supabase
              .from('generation_queue')
              .select('status')
              .eq('id', body.job_id)
              .single();
            if (jobCheck?.status === 'cancelled') {
              console.log(`[generate-freestyle] Job ${body.job_id} cancelled — skipping save, breaking loop`);
              try {
                const urlObj = new URL(publicUrl);
                const pathParts = urlObj.pathname.split('/freestyle-images/');
                if (pathParts[1]) {
                  const storagePath = decodeURIComponent(pathParts[1]);
                  await supabase.storage.from('freestyle-images').remove([storagePath]);
                }
              } catch (_e) {}
              images.pop();
              break;
            }
          }
          try {
            (body as any).providerUsed = actualProvider;
            // If Seedream mapped to a different ratio (e.g. 4:5→3:4), store the actual ratio
            // so the frontend displays the image at its true proportions with object-cover
            if (result.actualAspectRatio) {
              body.aspectRatio = result.actualAspectRatio;
            }
            await saveFreestyleGeneration(supabase, userId, publicUrl, body, i);

            // Early finalize: in queue mode (1 image), complete immediately after first success
            if (body.job_id && images.length > 0) {
              console.log(`[generate-freestyle] Early finalize: completing queue job ${body.job_id} with ${images.length} images`);
              const elapsedMs = Math.round(performance.now() - requestStartTime);
              console.log(`[generate-freestyle] Job ${body.job_id} total elapsed: ${(elapsedMs / 1000).toFixed(1)}s provider=${actualProvider}`);
              await completeQueueJob(supabase, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, body.job_id, body.user_id!, body.credits_reserved!, images, effectiveImageCount, errors, body as unknown as Record<string, unknown>, false, null, actualProvider, elapsedMs);
              return new Response(
                JSON.stringify({ images, generatedCount: images.length, requestedCount: effectiveImageCount }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }
          } catch (dbErr) {
            console.error(`[generate-freestyle] Failed to save freestyle_generations record:`, dbErr);
          }
        }
      } else if (result.blocked) {
        contentBlocked = true;
        blockReason = result.blockReason || "Content blocked by safety filter";
        console.warn(`Image ${i + 1} blocked by content safety filter`);
        break;
      } else if (result.failureType === "credits_exhausted") {
        // Terminal — complete queue job and return 402
        if (isQueueInternal && body.job_id) {
          const elapsedMs = Math.round(performance.now() - requestStartTime);
          await completeQueueJob(supabase, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, body.job_id, body.user_id!, body.credits_reserved!, [], effectiveImageCount, ["Credits exhausted"], body as unknown as Record<string, unknown>, false, null, lastActualProvider, elapsedMs);
        }
        return new Response(
          JSON.stringify({ error: "Credits exhausted. Please add more credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        // All retries exhausted — record the error
        errors.push(`Image ${i + 1}: ${result.failureType || "unknown"} (${result.rawError || "no details"})`);
      }

      if (i < effectiveImageCount - 1) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    // Queue self-completion
    if (isQueueInternal && body.job_id) {
      const elapsedMs = Math.round(performance.now() - requestStartTime);
      console.log(`[generate-freestyle] Job ${body.job_id} total elapsed: ${(elapsedMs / 1000).toFixed(1)}s provider=${lastActualProvider}`);
      await completeQueueJob(supabase, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, body.job_id, body.user_id!, body.credits_reserved!, images, effectiveImageCount, errors, body as unknown as Record<string, unknown>, contentBlocked, blockReason, lastActualProvider, elapsedMs);
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
      const errorBody = await req.clone().json().catch(() => ({}));
      if (isQueueInternal && errorBody.job_id) {
        const supabaseErr = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
        await completeQueueJob(supabaseErr, Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, errorBody.job_id, errorBody.user_id, errorBody.credits_reserved, [], 1, [error instanceof Error ? error.message : "Unknown error"], errorBody);
      }
    } catch (_e) { /* best effort */ }
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
