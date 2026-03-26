// Force redeploy: cleanup v2 — single client, shared helpers, width-capped AI images (2026-03-19)
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
  const framingPrompts: Record<string, string> = {
    full_body: `FRAMING: Full body shot, head to toe. Show complete figure.${hasModel ? ' Match body of [MODEL REFERENCE].' : ''}`,
    upper_body: `FRAMING: Upper body, waist up.${hasModel ? ' Match appearance of [MODEL REFERENCE].' : ''}`,
    close_up: `FRAMING: Close-up portrait from shoulders up.${hasModel ? ' Match appearance of [MODEL REFERENCE].' : ''}`,
    hand_wrist: `FRAMING: Hand and wrist only. No face.${hasModel ? ' Match skin tone of [MODEL REFERENCE].' : ''}`,
    neck_shoulders: `FRAMING: Collarbone area, jewelry display.${hasModel ? ' Match skin tone of [MODEL REFERENCE].' : ''}`,
    lower_body: `FRAMING: Lower body, hips to feet.${hasModel ? ' Match body of [MODEL REFERENCE].' : ''}`,
    back_view: `FRAMING: Back view, facing away.${hasModel ? ' Match body of [MODEL REFERENCE].' : ''}`,
    side_profile: `FRAMING: Side profile, ear and jawline.${hasModel ? ' Match appearance of [MODEL REFERENCE].' : ''}`,
  };
  return framingPrompts[framing] || null;
}

// ── Unified prompt builder — positive framing, single path ───────────────
function polishUserPrompt(
  rawPrompt: string,
  context: { hasSource: boolean; hasProduct: boolean; hasModel: boolean; hasScene: boolean },
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
    editLayers.push("Edit the provided image. Preserve composition unless specified.");

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
    refs.push(`${refNum}. PRODUCT: Match the exact product from [PRODUCT REFERENCE] — shape, material, color, texture, brand details, and any text/logos.${context.hasModel ? " Ignore any person/mannequin in this image." : ""}${dimNote}`);
    refNum++;
    if (context.hasSource && !['product', 'model', 'scene'].includes(imageRole || '')) {
      refs.push(`${refNum}. REFERENCE: Use [REFERENCE IMAGE] for setting/mood inspiration. The product from [PRODUCT REFERENCE] is the hero subject.`);
      refNum++;
    }
  } else if (context.hasSource && imageRole !== 'model' && imageRole !== 'scene') {
    refs.push(`${refNum}. PRODUCT: Match the exact item from [${imageRole === 'product' ? 'PRODUCT IMAGE' : 'REFERENCE IMAGE'}] — shape, material, color, texture, brand details, and any text/logos.${context.hasModel ? " Ignore any person/mannequin." : ""}`);
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
    // Gender enforcement
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
      refs.push(`${refNum}. SCENE: Place the person naturally INTO the environment shown in [SCENE REFERENCE]. Match the scene's lighting direction, color temperature, and ambient shadows on the person's body and face. The person must appear physically present in this space — correct perspective, scale relative to surroundings, feet/body grounded on surfaces, consistent shadow direction. Ignore any products or people already in the scene image.`);
    } else {
      refs.push(`${refNum}. SCENE: Use [SCENE REFERENCE] for environment, lighting, atmosphere. Ignore any products in the scene image.`);
    }
    refNum++;
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
    "Sharp micro-detail on textures, stitching, product text, and logos.",
    "Visible material grain. Single cohesive photograph, edge-to-edge.",
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
    // Default framing for model shots without explicit selection
    parts.push("FRAMING: Full head, hair, and upper body visible. Natural headroom. Face in upper third of composition.");
  } else if (context.hasProduct && !context.hasModel && !isSelfie) {
    // Product-only: creative angle
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
type GenerateResult = string | { blocked: true; reason: string } | null;

// ── Provider registry — change model IDs here for version upgrades ───────
const PROVIDERS = {
  "nanobanana-flash": { gateway: "lovable" as const, model: "google/gemini-3.1-flash-image-preview" },
  "nanobanana-pro":   { gateway: "lovable" as const, model: "google/gemini-3-pro-image-preview" },
  "seedream-4.5":     { gateway: "ark" as const, model: "seedream-4-5-251128", apiKeyEnv: "BYTEPLUS_ARK_API_KEY" },
  // Future: "seedream-5.0": { gateway: "ark", model: "seedream-5-0-260128", apiKeyEnv: "BYTEPLUS_ARK_API_KEY" },
} as const;

// ── Seedream ARK image generation ────────────────────────────────────────
// Seedream API natively supports "2K" size for all aspect ratios
function seedreamSizeForRatio(_aspectRatio: string): string {
  return "2K";
}

async function generateImageSeedream(
  prompt: string,
  imageUrls: string[],
  model: string,
  apiKey: string,
  aspectRatio = "1:1",
  maxRetries = 2,
): Promise<GenerateResult> {
  const ARK_BASE = "https://ark.ap-southeast.bytepluses.com/api/v3/images/generations";
  const size = seedreamSizeForRatio(aspectRatio);
  console.log(`[seedream] Using size=${size} for aspectRatio=${aspectRatio}`);

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const body: Record<string, unknown> = {
        model,
        prompt,
        size,
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
        signal: AbortSignal.timeout(150_000),
      });

      if (!response.ok) {
        if (response.status === 429) {
          console.warn(`[seedream] 429 (attempt ${attempt + 1}/${maxRetries + 1}) — backing off`);
          if (attempt < maxRetries) {
            await new Promise((r) => setTimeout(r, 2000));
            continue;
          }
          throw { status: 429, message: "Rate limit exceeded on Seedream." };
        }
        const errorText = await response.text();
        console.error(`[seedream] Error (attempt ${attempt + 1}):`, response.status, errorText);
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 500));
          continue;
        }
        return null;
      }

      const data = await response.json();
      const imageUrl = data?.data?.[0]?.url;
      if (!imageUrl) {
        console.error("[seedream] No image URL in response:", JSON.stringify(data).slice(0, 500));
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 500));
          continue;
        }
        return null;
      }
      return imageUrl; // Returns a hosted URL (not base64)
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "status" in error) throw error;
      const isTimeout = error instanceof DOMException && error.name === "TimeoutError";
      console.error(`[seedream] Attempt ${attempt + 1} failed${isTimeout ? " (timeout)" : ""}:`, error);
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }
      return null;
    }
  }
  return null;
}

// ── Clean prompt for Seedream (strip Gemini-specific directives) ─────────
function cleanPromptForSeedream(prompt: string): string {
  // 1. Strip "Output aspect ratio: ..." block and everything after it
  const aspectIdx = prompt.indexOf("Output aspect ratio:");
  if (aspectIdx !== -1) {
    prompt = prompt.substring(0, aspectIdx).trimEnd();
  }

  // 2. Strip BATCH CONSISTENCY block
  prompt = prompt.replace(/BATCH CONSISTENCY:[\s\S]*/i, "").trimEnd();

  // 3. Strip "Variation N:" suffixes
  prompt = prompt.replace(/Variation\s+\d+:.*/gi, "").trimEnd();

  // 4. Replace image reference labels with natural language
  prompt = prompt
    .replace(/\[MODEL REFERENCE\]/g, "the model from the reference")
    .replace(/\[PRODUCT REFERENCE\]/g, "the product from the reference")
    .replace(/\[PRODUCT IMAGE\]/g, "the product from the reference")
    .replace(/\[SCENE REFERENCE\]/g, "the scene from the reference")
    .replace(/\[REFERENCE IMAGE\]/g, "the reference image");

  // 5. Collapse excessive whitespace
  prompt = prompt.replace(/\n{3,}/g, "\n\n").trim();

  return prompt;
}

// ── Convert content array to Seedream flat inputs ────────────────────────
function convertContentToSeedreamInput(content: ContentItem[]): { prompt: string; imageUrls: string[] } {
  const textParts: string[] = [];
  const imageUrls: string[] = [];
  for (const item of content) {
    if (item.type === "text") textParts.push(item.text);
    else if (item.type === "image_url") imageUrls.push(item.image_url.url);
  }
  const rawPrompt = textParts.join("\n");
  const cleanedPrompt = cleanPromptForSeedream(rawPrompt);
  console.log(`[generate-freestyle] Seedream prompt cleaned: ${rawPrompt.length} → ${cleanedPrompt.length} chars`);
  return { prompt: cleanedPrompt, imageUrls };
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
  const mimeType = blob.type || "image/png";
  const ext = mimeType.includes("jpeg") ? "jpg" : "png";
  const fileName = `${userId}/${crypto.randomUUID()}.${ext}`;
  const arrayBuf = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuf);

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const { error } = await supabase.storage
    .from("freestyle-images")
    .upload(fileName, bytes, { contentType: mimeType, upsert: false });
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

  const mimeMatch = base64Url.match(/^data:(image\/[^;]+);/);
  const mimeType = mimeMatch?.[1] || "image/png";
  const ext = mimeType === "image/jpeg" ? "jpg" : "png";
  const fileName = `${userId}/${crypto.randomUUID()}.${ext}`;

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { error } = await supabase.storage
    .from("freestyle-images")
    .upload(fileName, bytes, {
      contentType: mimeType,
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
  maxRetries = 2,
  quality: "standard" | "high" = "standard"
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
            image_config: {
              ...(aspectRatio ? { aspect_ratio: aspectRatio } : {}),
              image_size: quality === 'high' ? '2K' : '1K',
            },
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
) {

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

    // Single Supabase admin client for the entire request
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

    const polishContext = {
      hasSource: !!body.sourceImage,
      hasProduct: !!body.productImage || (!!body.sourceImage && body.imageRole === 'product'),
      hasModel: !!body.modelImage || (!!body.sourceImage && body.imageRole === 'model'),
      hasScene: !!body.sceneImage || (!!body.sourceImage && body.imageRole === 'scene'),
    };

    let finalPrompt: string;
    if (isPerspective) {
      // Perspective jobs: prompt is fully built by the hook — use as-is
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
      // Brand do-not rules as positive reframing
      const doNotRules = body.brandProfile?.doNotRules || [];
      if (doNotRules.length > 0) {
        unpolished += `\n\nBrand constraints: ${doNotRules.join(", ")}`;
      }
      if (body.cameraStyle === "natural") {
        unpolished += `\n\nCAMERA RENDERING STYLE — NATURAL (iPhone): Shot on a latest-generation iPhone. Ultra-sharp details across the entire frame with deep depth of field (everything in focus, minimal bokeh). True-to-life, unedited color reproduction — no color grading, no warm/cool push. Natural ambient lighting only. The image should feel authentic and unprocessed.`;
      }
      // Framing instructions for unpolished path
      if (body.framing) {
        const instruction = buildFramingInstruction(body.framing, !!body.modelImage);
        if (instruction) {
          unpolished += `\n\n${instruction}`;
        }
      }
      finalPrompt = unpolished;
    }

    const aspectPrompt = `${finalPrompt}\n\nOutput aspect ratio: ${body.aspectRatio}. CRITICAL: The image must fill the ENTIRE canvas edge-to-edge. Do NOT add any black borders, black bars, letterboxing, pillarboxing, padding, or margins around the image. The photograph must extend to all four edges with no empty space.`;

    const forceProModel = !!(body as Record<string, unknown>).forceProModel;
    const hasModelImage = !!body.modelImage || (!!body.sourceImage && body.imageRole === 'model');
    const providerOverride = ((body as Record<string, unknown>).providerOverride as string) || null;
    const aiModel = (forceProModel || isPerspective || hasModelImage)
      ? "google/gemini-3-pro-image-preview"
      : "google/gemini-3.1-flash-image-preview";
    const ARK_API_KEY = Deno.env.get("BYTEPLUS_ARK_API_KEY");
    const useSeedream = providerOverride === "seedream-4.5" && !!ARK_API_KEY;

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
      isQueueInternal,
      jobId: body.job_id || null,
      providerOverride,
      useSeedream,
      hasArkKey: !!ARK_API_KEY,
    });

    // Extend timeout_at for queue jobs — 5 min default is too tight for cold boot + 429 + fallback
    if (isQueueInternal && body.job_id) {
      try {
        await supabase.from('generation_queue')
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
          body.imageRole,
        );

        // Append referenceAngleImage as [REFERENCE IMAGE] for perspective jobs
        if (isPerspective && referenceAngleImage) {
          contentArray.push({ type: "text", text: "[REFERENCE IMAGE]" });
          contentArray.push({ type: "image_url", image_url: { url: referenceAngleImage } });
        }

        let result: GenerateResult;

        if (useSeedream) {
          // Seedream path
          const seedreamInput = convertContentToSeedreamInput(contentArray);
          console.log(`[generate-freestyle] Using Seedream 4.5 (provider override)`);
          result = await generateImageSeedream(seedreamInput.prompt, seedreamInput.imageUrls, PROVIDERS["seedream-4.5"].model, ARK_API_KEY!, body.aspectRatio, maxRetries);
          // Cross-provider fallback: Seedream failed → try Nano Banana
          if (result === null) {
            console.warn(`[generate-freestyle] Seedream returned null — falling back to Nano Banana (${aiModel})`);
            result = await generateImage(contentArray, LOVABLE_API_KEY, aiModel, body.aspectRatio, 0, body.quality || 'standard');
          }
        } else {
          // Nano Banana (Gemini) path
          result = await generateImage(contentArray, LOVABLE_API_KEY, aiModel, body.aspectRatio, maxRetries, body.quality || 'standard');
          // Inner fallback: Pro → Flash
          if (result === null && /gemini-3-pro|gemini-3\.1-pro/i.test(aiModel)) {
            console.warn(`Pro model returned null — falling back to gemini-3.1-flash-image-preview`);
            result = await generateImage(contentArray, LOVABLE_API_KEY, "google/gemini-3.1-flash-image-preview", body.aspectRatio, 0, body.quality || 'standard');
          }
          // Cross-provider fallback: Nano Banana failed → try Seedream (if key available)
          if (result === null && ARK_API_KEY && providerOverride !== "nanobanana") {
            console.warn(`[generate-freestyle] Nano Banana returned null — falling back to Seedream`);
            const seedreamInput = convertContentToSeedreamInput(contentArray);
            result = await generateImageSeedream(seedreamInput.prompt, seedreamInput.imageUrls, PROVIDERS["seedream-4.5"].model, ARK_API_KEY, body.aspectRatio, 0);
          }
        }

        if (result && typeof result === "object" && "blocked" in result) {
          contentBlocked = true;
          blockReason = result.reason;
          console.warn(`Image ${i + 1} blocked by content safety filter`);
          break;
        } else if (typeof result === "string") {
          // Seedream returns hosted URLs; Gemini returns base64 data URLs
          const publicUrl = result.startsWith("http")
            ? await downloadAndUploadToStorage(result, userId, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
            : await uploadBase64ToStorage(result, userId, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
          images.push(publicUrl);
          console.log(`[generate-freestyle] Generated and uploaded freestyle image ${i + 1}/${effectiveImageCount}`);

          // Heartbeat: update queue with partial progress so cleanup_stale_jobs can recover
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
                // Remove the already-uploaded storage file
                try {
                  const urlObj = new URL(publicUrl);
                  const pathParts = urlObj.pathname.split('/freestyle-images/');
                  if (pathParts[1]) {
                    const storagePath = decodeURIComponent(pathParts[1]);
                    await supabase.storage.from('freestyle-images').remove([storagePath]);
                  }
                } catch (_e) {}
                // Remove this URL from images array so completeQueueJob cleanup is accurate
                images.pop();
                break;
              }
            }
            try {
              await saveFreestyleGeneration(supabase, userId, publicUrl, body, i);

              // Early finalize: in queue mode (1 image), complete immediately after first success
              if (body.job_id && images.length > 0) {
                console.log(`[generate-freestyle] Early finalize: completing queue job ${body.job_id} with ${images.length} images`);
                await completeQueueJob(supabase, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, body.job_id, body.user_id!, body.credits_reserved!, images, effectiveImageCount, errors, body as unknown as Record<string, unknown>);
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

          // For 429, try cross-provider fallback before giving up
          if (statusError.status === 429) {
            console.warn(`429 on primary model — trying cross-provider fallback`);
            try {
              const fallbackPrompt = `${aspectPrompt}${batchConsistency}`;
              const contentArray = buildContentArray(
                fallbackPrompt,
                isPerspective ? undefined : body.sourceImage,
                body.productImage,
                body.modelImage,
                body.sceneImage,
                body.imageRole,
              );
              if (isPerspective && referenceAngleImage) {
                contentArray.push({ type: "text", text: "[REFERENCE IMAGE]" });
                contentArray.push({ type: "image_url", image_url: { url: referenceAngleImage } });
              }

              let fallbackResult: GenerateResult = null;
              if (useSeedream) {
                // Was using Seedream, fallback to Nano Banana
                const fallbackModel = aiModel.includes("flash")
                  ? "google/gemini-3-pro-image-preview"
                  : "google/gemini-3.1-flash-image-preview";
                fallbackResult = await generateImage(contentArray, LOVABLE_API_KEY, fallbackModel, body.aspectRatio, 0, body.quality || 'standard');
              } else if (ARK_API_KEY) {
                // Was using Nano Banana, fallback to Seedream
                const seedreamInput = convertContentToSeedreamInput(contentArray);
                fallbackResult = await generateImageSeedream(seedreamInput.prompt, seedreamInput.imageUrls, PROVIDERS["seedream-4.5"].model, ARK_API_KEY, body.aspectRatio, 0);
              } else {
                // No Seedream key, try the alternate Gemini model
                const fallbackModel = aiModel.includes("flash")
                  ? "google/gemini-3-pro-image-preview"
                  : "google/gemini-3.1-flash-image-preview";
                fallbackResult = await generateImage(contentArray, LOVABLE_API_KEY, fallbackModel, body.aspectRatio, 0, body.quality || 'standard');
              }

              if (typeof fallbackResult === "string") {
                const publicUrl = fallbackResult.startsWith("http")
                  ? await downloadAndUploadToStorage(fallbackResult, userId, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
                  : await uploadBase64ToStorage(fallbackResult, userId, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
                images.push(publicUrl);
                console.log(`[generate-freestyle] Cross-provider fallback succeeded for image ${i + 1}`);

                // Save to freestyle_generations so image appears in gallery
                try {
                  await saveFreestyleGeneration(supabase, userId, publicUrl, body, i);

                  // Early finalize in queue mode after fallback success
                  if (isQueueInternal && body.job_id && images.length > 0) {
                    console.log(`[generate-freestyle] Early finalize (fallback): completing queue job ${body.job_id}`);
                    await completeQueueJob(supabase, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, body.job_id, body.user_id!, body.credits_reserved!, images, effectiveImageCount, errors, body as unknown as Record<string, unknown>);
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
              console.error(`Cross-provider fallback also failed:`, fallbackErr);
            }
            errors.push(`Image ${i + 1}: Rate limited on all providers`);
            continue;
          }

          if (isQueueInternal && body.job_id) {
            await completeQueueJob(supabase, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, body.job_id, body.user_id!, body.credits_reserved!, [], effectiveImageCount, [statusError.message], body as unknown as Record<string, unknown>);
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
      await completeQueueJob(supabase, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, body.job_id, body.user_id!, body.credits_reserved!, images, effectiveImageCount, errors, body as unknown as Record<string, unknown>, contentBlocked, blockReason);
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
