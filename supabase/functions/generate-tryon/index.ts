import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Detect actual image format from magic bytes ──────────────────────────
function detectImageFormat(bytes: Uint8Array): { ext: string; contentType: string } {
  if (bytes[0] === 0xFF && bytes[1] === 0xD8) return { ext: 'jpg', contentType: 'image/jpeg' };
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[8] === 0x57 && bytes[9] === 0x45) return { ext: 'webp', contentType: 'image/webp' };
  return { ext: 'png', contentType: 'image/png' };
}

// ── Optimize Supabase Storage images for AI input (model & scene only) ────
function optimizeImageForAI(url: string): string {
  const STORAGE_MARKER = '/storage/v1/object/';
  const RENDER_MARKER = '/storage/v1/render/image/';
  if (!url || !url.includes(STORAGE_MARKER) || url.includes(RENDER_MARKER)) return url || '';
  const transformed = url.replace(STORAGE_MARKER, RENDER_MARKER);
  const sep = transformed.includes('?') ? '&' : '?';
  return `${transformed}${sep}quality=85`;
}

interface TryOnRequest {
  product: {
    title: string;
    description: string;
    productType: string;
    imageUrl: string;
  };
  model: {
    name: string;
    gender: string;
    ethnicity: string;
    bodyType: string;
    ageRange: string;
    imageUrl: string;
  };
  pose: {
    name: string;
    description: string;
    category: string;
    imageUrl?: string;  // Scene reference image for environment matching
  };
  aspectRatio: "1:1" | "4:5" | "9:16" | "16:9";
  imageCount: number;
  framing?: string;
}

// --- Aspect ratio instruction ---
function buildAspectRatioInstruction(ratio: string): string {
  const map: Record<string, string> = {
    "9:16": "IMAGE FORMAT: Portrait orientation (9:16 aspect ratio). The image MUST be significantly taller than it is wide, formatted for Instagram/TikTok Stories. Compose vertically.",
    "4:5": "IMAGE FORMAT: Portrait orientation (4:5 aspect ratio). The image must be slightly taller than wide, formatted for Instagram feed posts.",
    "1:1": "IMAGE FORMAT: Square format (1:1 aspect ratio). Equal width and height.",
    "16:9": "IMAGE FORMAT: Landscape orientation (16:9 aspect ratio). The image must be wider than tall, cinematic widescreen format. Compose horizontally.",
  };
  return map[ratio] || map["1:1"];
}

// --- Faceless framing detection ---
const FACELESS_FRAMINGS = new Set(["hand_wrist", "neck_shoulders", "side_profile", "lower_body", "back_view"]);

function isFacelessFraming(framing: string | undefined): boolean {
  return !!framing && FACELESS_FRAMINGS.has(framing);
}

// --- Jewelry guard ---
const JEWELRY_KEYWORDS = ["ring", "bracelet", "bangle", "watch", "wristband", "anklet", "earring", "ear cuff", "necklace", "pendant", "chain"];
const SINGLE_ITEM_KEYWORDS = ["ring", "bracelet", "bangle", "watch", "wristband"];

function buildJewelryGuard(product: TryOnRequest["product"]): string {
  const text = `${product.title} ${product.description} ${product.productType}`.toLowerCase();
  const isSingleItem = SINGLE_ITEM_KEYWORDS.some(k => text.includes(k));
  if (!isSingleItem) return "";

  if (text.includes("ring")) {
    return "\n   - IMPORTANT: The ring must appear on ONE hand only, exactly matching [PRODUCT IMAGE]. Do NOT place rings on both hands. Show only ONE ring.";
  }
  if (text.includes("watch") || text.includes("bracelet") || text.includes("bangle") || text.includes("wristband")) {
    return "\n   - IMPORTANT: The product must appear on ONE wrist only, exactly matching [PRODUCT IMAGE]. Do NOT duplicate on both wrists.";
  }
  return "";
}

// --- Framing instructions (with conditional identity) ---
function buildFramingInstruction(framing: string | undefined): string {
  if (!framing) return "";
  const instructions: Record<string, string> = {
    full_body: "5. FRAMING: Full body shot, head to toe. Show the complete outfit.\n\n",
    upper_body: "5. FRAMING: Upper body shot, waist up. Show face and upper body clearly.\n\n",
    close_up: "5. FRAMING — CLOSE-UP / PRODUCT DETAIL:\n   - Lens: 85mm at f/2.8, shallow depth-of-field with razor-sharp focus on the product zone.\n   - Framing: Tight crop from mid-chest upward. The product/garment must fill at least 60% of the visible frame area.\n   - Show fabric texture, stitching, material drape, pattern detail at close range.\n   - Camera distance: Much closer than a standard portrait — the viewer should feel they can reach out and touch the product.\n   - DO NOT produce a standard portrait/headshot. The crop must be noticeably tighter than 'upper body'.\n   - Background should be heavily blurred (bokeh) to isolate the product area.\n\n",
    hand_wrist: "5. FRAMING: Show only the hand and wrist area. Product naturally worn on wrist/hand. Do NOT include the face. Focus on the hand, wrist, and forearm only.\n\n",
    neck_shoulders: "5. FRAMING: Close-up of the collarbone, neck, and upper chest area. Product visible on/near neck. Do NOT include the full face — show jawline at most.\n\n",
    lower_body: "5. FRAMING: Lower body from hips to feet. Focus on legs and footwear. The face is NOT visible in this shot.\n\n",
    back_view: "5. FRAMING: Back view, subject facing away from camera. The face is NOT visible.\n\n",
    side_profile: "5. FRAMING: Side profile focusing on the ear and jawline area. Ideal for earrings and ear cuffs. Show one side of the face only.\n\n",
  };
  return instructions[framing] || "";
}

// --- Identity block (conditional on framing) ---
function buildIdentityBlock(req: TryOnRequest): string {
  const ageDescMap: Record<string, string> = {
    "young-adult": "early 20s",
    adult: "late 20s to mid 30s",
    mature: "40s to 50s",
  };
  const ageDesc = ageDescMap[req.model.ageRange] || "adult";

  if (isFacelessFraming(req.framing)) {
    // Faceless: match skin tone and body only, no face requirements
    return `1. BODY REFERENCE from [MODEL IMAGE]:
   - Match the exact skin tone, body proportions, and ${req.model.bodyType} build
   - This is a ${req.model.gender} ${req.model.ethnicity} model in their ${ageDesc}
   - The face is NOT visible in this framing — do NOT attempt to show or reconstruct the face
   - Focus on matching skin color, body shape, and natural proportions only`;
  }

  // Face-visible: full identity preservation
  return `1. The person MUST look exactly like the model in [MODEL IMAGE]:
   - Keep the EXACT same face, facial features, skin tone, and hair
   - Maintain their body type and proportions (${req.model.bodyType} build)
   - This is ${req.model.name}, a ${req.model.gender} ${req.model.ethnicity} model in their ${ageDesc}`;
}

interface DropContext {
  theme?: string;
  themeNotes?: string;
  brandProfile?: Record<string, unknown>;
}

function buildDropDirectionBlocks(ctx: DropContext): string {
  const blocks: string[] = [];

  if (ctx.theme && ctx.theme !== "custom") {
    const themeDescriptions: Record<string, string> = {
      spring: "fresh spring aesthetic — bright natural light, pastel tones, blooming florals, airy and light atmosphere",
      summer: "vibrant summer aesthetic — warm bright sunlight, bold colors, outdoor energy, golden-hour warmth",
      autumn: "warm autumn aesthetic — golden/amber tones, rich earthy colors, soft warm lighting, cozy layered atmosphere",
      winter: "crisp winter aesthetic — cool blue-white tones, clean minimal backdrop, soft diffused light, elegant and refined mood",
      holiday: "festive holiday aesthetic — warm inviting lighting, rich jewel tones, celebratory atmosphere, luxurious feel",
      "back-to-school": "back-to-school aesthetic — casual confident energy, campus/urban backdrop feel, natural daylight",
      "new-year": "new year aesthetic — fresh and aspirational mood, clean modern backdrop, bright optimistic lighting",
      valentines: "Valentine's aesthetic — soft romantic tones, warm pinks and reds, intimate soft lighting",
    };
    const desc = themeDescriptions[ctx.theme] || `${ctx.theme} seasonal aesthetic`;
    blocks.push(`SEASONAL DIRECTION: ${desc}. Let this mood influence lighting, color grading, and background atmosphere.`);
  }

  if (ctx.themeNotes) {
    blocks.push(`SEASONAL DIRECTION: ${ctx.themeNotes}. You MUST incorporate this seasonal mood, color palette, and atmosphere into the scene, lighting, and overall feel.`);
  }

  if (ctx.brandProfile) {
    const bp = ctx.brandProfile;
    const parts: string[] = [];
    if (bp.tone) parts.push(`Tone: ${bp.tone}`);
    if (bp.lighting_style) parts.push(`Lighting: ${bp.lighting_style}`);
    if (bp.color_temperature) parts.push(`Color temperature: ${bp.color_temperature}`);
    if (bp.background_style) parts.push(`Background style: ${bp.background_style}`);
    if (bp.composition_bias) parts.push(`Composition: ${bp.composition_bias}`);
    if (parts.length > 0) {
      blocks.push(`BRAND GUIDELINES:\n   ${parts.join("\n   ")}`);
    }
  }

  return blocks.length > 0 ? "\n" + blocks.join("\n\n") + "\n" : "";
}

function buildPrompt(req: TryOnRequest, dropContext?: DropContext): string {
  const hasSceneImage = !!req.pose.imageUrl;

  const backgroundMap: Record<string, string> = {
    studio: "clean white or light gray professional studio backdrop",
    lifestyle: "natural outdoor or modern interior setting with soft ambient lighting",
    editorial: "dramatic minimalist backdrop with artistic lighting and geometric shadows",
    streetwear: "urban street environment with concrete, graffiti art, or industrial elements",
  };

  const aspectInstruction = buildAspectRatioInstruction(req.aspectRatio);
  const identityBlock = buildIdentityBlock(req);
  const jewelryGuard = buildJewelryGuard(req.product);
  const framingInstruction = buildFramingInstruction(req.framing);
  const dropBlocks = dropContext ? buildDropDirectionBlocks(dropContext) : "";

  // Build environment/background section based on whether scene image is provided
  const hasDropTheme = dropContext?.theme && dropContext.theme !== "custom";
  let environmentBlock: string;
  if (hasSceneImage && hasDropTheme) {
    // Creative drop with seasonal theme: use scene image for POSE only, override environment with theme
    environmentBlock = `   - Pose Reference: Use the POSE and BODY POSITIONING from [SCENE IMAGE] (stance, angle, framing, body direction).
   - Background & Environment: Do NOT replicate the background or environment from [SCENE IMAGE]. Instead, create the environment described in the SEASONAL DIRECTION below. Only use [SCENE IMAGE] for pose reference.
   - IMPORTANT: The person's IDENTITY (face, skin tone, hair, body type) MUST come exclusively from [MODEL IMAGE]. Do NOT copy the face or appearance of any person in [SCENE IMAGE].`;
  } else if (hasSceneImage) {
    environmentBlock = `   - Background & Environment: Replicate the environment, lighting, backdrop, composition, pose direction, and body positioning shown in [SCENE IMAGE]. Match the mood, color palette, spatial depth, camera angle, and the way the subject is posed (e.g. side profile, back turned, walking, leaning).
   - IMPORTANT: The person's IDENTITY (face, skin tone, hair, body type) MUST come exclusively from [MODEL IMAGE]. Do NOT copy the face or appearance of any person in [SCENE IMAGE] -- only copy their pose, stance, and the environment around them.`;
  } else {
    const background = backgroundMap[req.pose.category] || backgroundMap.studio;
    environmentBlock = `   - Background: ${background}`;
  }

  const imageReferences = hasSceneImage
    ? "the person from [MODEL IMAGE] wearing the clothing item from [PRODUCT IMAGE], posed and composed like [SCENE IMAGE] in that same environment"
    : "the person from [MODEL IMAGE] wearing the clothing item from [PRODUCT IMAGE]";

  return `Create a professional fashion photograph combining ${imageReferences}.

${aspectInstruction}

CRITICAL REQUIREMENTS:
${identityBlock}

2. The clothing MUST look exactly like the garment in [PRODUCT IMAGE]:
   - Preserve 100% accurate colors, patterns, logos, and textures
   - Show natural fabric draping on the model's body
   - Product: ${req.product.title}
   - Details: ${req.product.description || req.product.productType}${jewelryGuard}

3. Photography style:
   - Pose: ${req.pose.name} - ${req.pose.description}
${environmentBlock}
${dropBlocks}
   - Lighting: Professional studio lighting with soft key light and rim light for depth
   - Camera: Shot on Canon EOS R5, 85mm f/1.4 lens, fashion editorial quality

4. Quality requirements:
   - Photorealistic skin with natural texture
   - Perfect anatomy with natural hands
   - No AI artifacts or distortions
   - Ultra high resolution

${framingInstruction}Remember: The final image must show THE EXACT PERSON from [MODEL IMAGE] wearing THE EXACT GARMENT from [PRODUCT IMAGE].${hasSceneImage && !hasDropTheme ? " Match the pose, composition, and environment from [SCENE IMAGE], but the person's identity must come from [MODEL IMAGE] only." : hasSceneImage ? " Use the pose from [SCENE IMAGE], but the environment MUST follow the SEASONAL DIRECTION, not the scene image." : ""}`;
}

const negativePrompt =
  "blurry, low quality, distorted, deformed hands, extra fingers, missing fingers, bad anatomy, unnatural pose, stiff pose, mannequin, cartoon, illustration, anime, 3d render, text, watermark, logo overlay, signature, flat lay, product only without model, floating clothes, wrinkled messy clothes, wrong colors, pattern distortion";

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
  } catch {
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

  const fmt = detectImageFormat(bytes);
  const fileName = `${userId}/${new Date().toISOString().slice(0,10)}_${crypto.randomUUID()}.${fmt.ext}`;

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { error } = await supabase.storage
    .from("tryon-images")
    .upload(fileName, bytes, {
      contentType: fmt.contentType,
      upsert: false,
    });

  if (error) {
    console.error("Storage upload failed:", error);
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from("tryon-images")
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

// ── Seedream ARK image generation (ported from generate-freestyle) ────────
function seedreamSizeForRatio(_aspectRatio: string): string {
  return "2K";
}

function seedreamAspectRatio(appRatio: string): string {
  const map: Record<string, string> = {
    "1:1": "1:1", "16:9": "16:9", "9:16": "9:16",
    "4:3": "4:3", "3:4": "3:4", "4:5": "4:5",
    "5:4": "5:4", "3:2": "3:2", "2:3": "2:3", "21:9": "21:9",
  };
  return map[appRatio] || "1:1";
}

const SEEDREAM_MODERATION_CODES = [1301, 1302, 1303, 1304, 1305, 1024];

async function generateImageSeedream(
  prompt: string,
  imageUrls: string[],
  model: string,
  apiKey: string,
  aspectRatio = "1:1",
): Promise<{ ok: boolean; imageUrl?: string; error?: string }> {
  const ARK_BASE = "https://ark.ap-southeast.bytepluses.com/api/v3/images/generations";
  const size = seedreamSizeForRatio(aspectRatio);
  const seedreamRatio = seedreamAspectRatio(aspectRatio);
  const timeoutMs = 90_000;

  try {
    const body: Record<string, unknown> = {
      model, prompt, size,
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
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!response.ok) {
      let errorText = "";
      try { errorText = await response.text(); } catch (_) { /* ignore */ }
      // Check for moderation in error body
      try {
        const errJson = JSON.parse(errorText);
        const errCode = errJson?.error?.code || errJson?.code;
        if (errCode && SEEDREAM_MODERATION_CODES.includes(Number(errCode))) {
          return { ok: false, error: `Content moderated: ${errJson?.error?.message || errJson?.message}` };
        }
      } catch (_) { /* not JSON */ }
      return { ok: false, error: `ARK API error ${response.status}: ${errorText.slice(0, 200)}` };
    }

    const data = await response.json();
    const respCode = data?.error?.code || data?.code;
    if (respCode && SEEDREAM_MODERATION_CODES.includes(Number(respCode))) {
      return { ok: false, error: `Content moderated: ${data?.error?.message || data?.message}` };
    }

    const imageUrl = data?.data?.[0]?.url;
    if (!imageUrl) {
      return { ok: false, error: "No URL in Seedream response" };
    }
    return { ok: true, imageUrl };
  } catch (error: unknown) {
    const isTimeout = error instanceof DOMException && error.name === "TimeoutError";
    return { ok: false, error: isTimeout ? "Seedream request timed out (90s)" : (error instanceof Error ? error.message : "Unknown error") };
  }
}

/** Fetch an image URL and convert to base64 data URL for storage upload */
async function fetchImageAsBase64(url: string): Promise<string> {
  const resp = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  const contentType = resp.headers.get("content-type") || "image/jpeg";
  const mime = contentType.split(";")[0].trim();
  const buf = new Uint8Array(await resp.arrayBuffer());
  let binary = "";
  for (let i = 0; i < buf.length; i++) binary += String.fromCharCode(buf[i]);
  return `data:${mime};base64,${btoa(binary)}`;
}

async function generateImage(
  prompt: string,
  productImageUrl: string,
  modelImageUrl: string,
  apiKey: string,
  aspectRatio: string,
  sceneImageUrl?: string
): Promise<string | null> {
  return generateImageWithModel(prompt, productImageUrl, modelImageUrl, apiKey, aspectRatio, "gemini-3-pro-image-preview", sceneImageUrl);
}

// ── Helper: Convert URL to native Gemini inlineData part ────────────
async function urlToInlineDataPart(url: string): Promise<Record<string, unknown>> {
  if (url.startsWith("data:")) {
    const match = url.match(/^data:(image\/\w+);base64,(.+)$/s);
    if (match) return { inlineData: { mimeType: match[1], data: match[2] } };
  }
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Failed to fetch image for inlineData: ${resp.status}`);
  const buf = await resp.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  const b64 = btoa(binary);
  const contentType = resp.headers.get("content-type") || "image/png";
  const mimeType = contentType.split(";")[0].trim();
  return { inlineData: { mimeType, data: b64 } };
}

function extractImageFromGeminiResponse(data: Record<string, unknown>): string | null {
  const candidates = data.candidates as Array<Record<string, unknown>> | undefined;
  if (!candidates?.length) return null;
  const parts = (candidates[0].content as Record<string, unknown>)?.parts as Array<Record<string, unknown>> | undefined;
  if (!parts) return null;
  for (const part of parts) {
    const inlineData = part.inlineData as { mimeType: string; data: string } | undefined;
    if (inlineData?.data) return `data:${inlineData.mimeType};base64,${inlineData.data}`;
  }
  return null;
}

async function generateImageWithModel(
  prompt: string,
  productImageUrl: string,
  modelImageUrl: string,
  apiKey: string,
  aspectRatio: string,
  aiModel: string,
  sceneImageUrl?: string
): Promise<string | null> {
  const maxRetries = 0;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Build content array with product and model images, plus optional scene image
      const contentParts: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
        {
          type: "text",
          text: `${prompt}\n\nNegative prompt (avoid these): ${negativePrompt}`,
        },
        { type: "text", text: "[PRODUCT IMAGE]:" },
        { type: "image_url", image_url: { url: productImageUrl } },
        { type: "text", text: "[MODEL IMAGE]:" },
        { type: "image_url", image_url: { url: optimizeImageForAI(modelImageUrl) } },
      ];

      // Add scene image as third reference if provided
      if (sceneImageUrl) {
        contentParts.push(
          { type: "text", text: "[SCENE IMAGE]:" },
          { type: "image_url", image_url: { url: optimizeImageForAI(sceneImageUrl) } }
        );
      }

      // Convert to native Gemini parts
      const nativeParts: Record<string, unknown>[] = [];
      for (const item of contentParts) {
        if (item.type === 'text') {
          nativeParts.push({ text: item.text });
        } else if (item.type === 'image_url') {
          const url = (item as any).image_url?.url as string;
          if (url) {
            const part = await urlToInlineDataPart(url);
            nativeParts.push(part);
          }
        }
      }

      const generationConfig: Record<string, unknown> = {
        responseModalities: ["IMAGE", "TEXT"],
        temperature: 1.0,
        imageConfig: {
          ...(aspectRatio ? { aspectRatio } : {}),
          imageSize: "2K",
        },
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${aiModel}:generateContent`,
        {
          method: "POST",
          headers: {
            "x-goog-api-key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ role: "user", parts: nativeParts }],
            generationConfig,
          }),
          signal: AbortSignal.timeout(100_000), // 100s primary timeout — gives Nano Banana Pro enough time
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          console.warn(`AI Gateway 429 (attempt ${attempt + 1}/${maxRetries + 1}) — backing off`);
          if (attempt < maxRetries) {
            const jitter = Math.random() * 3000;
            await new Promise((r) => setTimeout(r, 3000 * (attempt + 1) + jitter));
            continue;
          }
          throw { status: 429, message: "Rate limit exceeded. Please wait and try again." };
        }
        if (response.status === 402) throw { status: 402, message: "Payment required - please add credits" };
        const errorText = await response.text();
        console.error(`AI Gateway error (attempt ${attempt + 1}):`, response.status, errorText);
        if (attempt < maxRetries) { await new Promise((r) => setTimeout(r, 1000 * (attempt + 1))); continue; }
        console.error(`[generate-tryon] All retries exhausted for gateway error ${response.status}, returning null for fallback`);
        return null;
      }

      let data: Record<string, unknown>;
      try {
        data = await response.json();
      } catch (jsonErr) {
        console.error(`[generate-tryon] JSON parse failed (attempt ${attempt + 1}):`, jsonErr);
        if (attempt < maxRetries) { await new Promise((r) => setTimeout(r, 1000)); continue; }
        return null;
      }
      const imageUrl = extractImageFromGeminiResponse(data);

      if (!imageUrl) {
        console.error("No image in response:", JSON.stringify(data).slice(0, 500));
        if (attempt < maxRetries) { await new Promise((r) => setTimeout(r, 1000)); continue; }
        return null;
      }

      return imageUrl as string;
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "status" in error) throw error;
      const isTimeout = error instanceof DOMException && error.name === 'TimeoutError';
      console.error(`[generate-tryon] Attempt ${attempt + 1} failed${isTimeout ? ' (timeout)' : ''}:`, error);
      if (attempt < maxRetries) { await new Promise((r) => setTimeout(r, 1000 * (attempt + 1))); continue; }
      if (isTimeout) return null; // Return null on timeout to trigger fallback instead of throwing
      throw error;
    }
  }

  return null;
}

async function completeQueueJob(
  jobId: string,
  userId: string,
  creditsReserved: number,
  images: string[],
  requestedCount: number,
  errors: string[],
  payload: Record<string, unknown>,
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
    console.log(`[generate-tryon] Job ${jobId} was cancelled — skipping completion`);
    return;
  }

  const generatedCount = images.length;

  if (generatedCount === 0) {
    await supabase.from("generation_queue").update({
      status: "failed",
      error_message: errors.join("; ") || "Failed to generate any images",
      completed_at: new Date().toISOString(),
    }).eq("id", jobId);
    await supabase.rpc("refund_credits", { p_user_id: userId, p_amount: creditsReserved });
    console.log(`[generate-tryon] Refunded ${creditsReserved} credits for failed job ${jobId}`);

    // Fire-and-forget: send generation failed email if user opted in
    try {
      const { data: profile } = await supabase.from("profiles").select("email, display_name, settings").eq("user_id", userId).single();
      const settings = (profile?.settings as Record<string, unknown>) || {};
      if (profile?.email && settings.emailOnFailed !== false) {
        fetch(`${supabaseUrl}/functions/v1/send-email`, {
          method: "POST",
          headers: { Authorization: `Bearer ${serviceRoleKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ type: "generation_failed", to: profile.email, data: { jobType: "tryon", errorMessage: errors.join("; "), displayName: profile.display_name, productName: ((payload as any).product?.title) || undefined, modelName: ((payload as any).model?.name) || undefined, sceneName: ((payload as any).pose?.name) || undefined } }),
        }).catch((e) => console.warn("[generate-tryon] Failed email send failed:", e.message));
      }
    } catch (e) { console.warn("[generate-tryon] Failed email lookup failed:", e); }
    // Fire-and-forget: check if creative drop is complete (even on failure)
    if (payload.creative_drop_id) {
      fetch(`${supabaseUrl}/functions/v1/complete-creative-drop`, {
        method: "POST",
        headers: { Authorization: `Bearer ${serviceRoleKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ creative_drop_id: payload.creative_drop_id }),
      }).catch((e) => console.warn("[generate-tryon] Drop completion check failed:", e.message));
    }
    return;
  }

  const result = { images, generatedCount, requestedCount, errors: errors.length > 0 ? errors : undefined };

  await supabase.from("generation_queue").update({
    status: "completed",
    result,
    completed_at: new Date().toISOString(),
  }).eq("id", jobId);

  await supabase.from("generation_jobs").insert({
    user_id: userId,
    results: images,
    status: "completed",
    completed_at: new Date().toISOString(),
    product_id: payload.product_id || null,
    workflow_id: payload.workflow_id || null,
    brand_profile_id: payload.brand_profile_id || null,
    ratio: payload.aspectRatio || "1:1",
    quality: payload.quality || "standard",
    requested_count: requestedCount,
    credits_used: creditsReserved,
    creative_drop_id: payload.creative_drop_id || null,
    prompt_final: payload.prompt || null,
    scene_name: payload.pose?.name || null,
    model_name: payload.model?.name || null,
    scene_image_url: payload.pose?.originalImageUrl || null,
    model_image_url: payload.model?.originalImageUrl || null,
    workflow_slug: payload.workflow_slug || null,
    product_name: payload.product_name || null,
    product_image_url: payload.product_image_url || null,
  });

  if (generatedCount < requestedCount) {
    const perImageCost = Math.floor(creditsReserved / requestedCount);
    const refundAmount = perImageCost * (requestedCount - generatedCount);
    if (refundAmount > 0) {
      await supabase.rpc("refund_credits", { p_user_id: userId, p_amount: refundAmount });
      console.log(`[generate-tryon] Partial: refunded ${refundAmount} credits for job ${jobId}`);
    }
  }

  console.log(`[generate-tryon] ✓ Queue job ${jobId} completed (${generatedCount} images)`);

  // Fire-and-forget: check if creative drop is complete
  if (payload.creative_drop_id) {
    fetch(`${supabaseUrl}/functions/v1/complete-creative-drop`, {
      method: "POST",
      headers: { Authorization: `Bearer ${serviceRoleKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ creative_drop_id: payload.creative_drop_id }),
    }).catch((e) => console.warn("[generate-tryon] Drop completion check failed:", e.message));
  }

  // Fire-and-forget: send generation complete email (only if user opted in)
  try {
    const { data: profile } = await supabase.from("profiles").select("email, display_name, settings").eq("user_id", userId).single();
    const settings = (profile?.settings as Record<string, unknown>) || {};
    if (profile?.email && settings.emailOnComplete === true) {
      fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: "POST",
        headers: { Authorization: `Bearer ${serviceRoleKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ type: "generation_complete", to: profile.email, data: { imageCount: generatedCount, jobType: "tryon", displayName: profile.display_name } }),
      }).catch((e) => console.warn("[generate-tryon] Email send failed:", e.message));
    }
  } catch (e) { console.warn("[generate-tryon] Email lookup failed:", e); }
}

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

    const LOVABLE_API_KEY = Deno.env.get("GEMINI_API_KEY");
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

    const body: TryOnRequest & {
      user_id?: string;
      job_id?: string;
      credits_reserved?: number;
      creative_drop_id?: string;
      theme?: string;
      theme_notes?: string;
      brand_profile?: Record<string, unknown>;
    } = await req.json();

    const userId = body.user_id;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Catalog mode bypass ──
    const isCatalogMode = !!(body as any).catalog_mode;
    let prompt: string;

    if (isCatalogMode) {
      const catalogBody = body as any;
      if (!catalogBody.prompt_final || !catalogBody.product?.imageUrl) {
        console.error("[generate-tryon] Catalog mode missing prompt_final or product image");
        return new Response(
          JSON.stringify({ error: "Catalog mode requires prompt_final and product image" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      prompt = catalogBody.prompt_final;
      // Normalize body so downstream code can access product/model images
      if (!body.model) body.model = catalogBody.model || { imageUrl: null, name: "catalog" };
      if (!body.pose) body.pose = { imageUrl: null, name: "catalog" } as any;
      console.log(`[generate-tryon] Catalog mode — render_path=${catalogBody.render_path}, shot=${catalogBody.shot_id}`);
      console.log("Generating catalog shot with prompt:", prompt.slice(0, 300) + "...");
    } else {
      if (!body.product || !body.model || !body.pose) {
        console.error("[generate-tryon] Missing required fields", {
          hasProduct: !!body.product,
          hasModel: !!body.model,
          hasPose: !!body.pose,
          creative_drop_id: body.creative_drop_id || null,
        });
        return new Response(
          JSON.stringify({ error: "Missing required fields: product, model, or pose" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Only inject theme/brand context for creative drop jobs
      const dropContext: DropContext | undefined = body.creative_drop_id ? {
        theme: body.theme,
        themeNotes: body.theme_notes,
        brandProfile: body.brand_profile,
      } : undefined;

      prompt = buildPrompt(body, dropContext);
      console.log("Generating with prompt:", prompt.slice(0, 300) + "...");
    }

    const imageCount = Math.min(body.imageCount || 4, 8);
    const images: string[] = [];
    const errors: string[] = [];

    const FUNCTION_START = Date.now();
    const MAX_WALL_CLOCK_MS = 270_000; // 270s — leave 30s buffer before platform kills at 300s

    for (let i = 0; i < imageCount; i++) {
      // Wall-clock safety: break early if approaching platform kill
      if (Date.now() - FUNCTION_START > MAX_WALL_CLOCK_MS - 5000) {
        console.warn(`[generate-tryon] Wall-clock limit approaching (${Math.round((Date.now() - FUNCTION_START) / 1000)}s), breaking after ${images.length}/${imageCount} images`);
        break;
      }

      try {
        const variationPrompt =
          i === 0
            ? prompt
            : `${prompt}\n\nVariation ${i + 1}: Slightly different angle and lighting while maintaining the same high quality.`;

        let base64Url: string | null = null;

        // ── Catalog mode: Seedream 5.0 Lite as PRIMARY model ──
        if (isCatalogMode) {
          const arkApiKey = Deno.env.get("BYTEPLUS_ARK_API_KEY");
          if (arkApiKey) {
            console.log(`[catalog] Trying Seedream 5.0 Lite as primary for image ${i + 1}`);
            const refImages = [body.product.imageUrl, body.model?.imageUrl, body.pose?.imageUrl].filter(Boolean) as string[];
            const seedreamResult = await generateImageSeedream(
              variationPrompt, refImages, "seedream-4-5-251128", arkApiKey, body.aspectRatio || "1:1"
            );
            if (seedreamResult.ok && seedreamResult.imageUrl) {
              base64Url = await fetchImageAsBase64(seedreamResult.imageUrl);
            } else {
              console.warn(`[catalog] Seedream 5.0 Lite failed:`, seedreamResult.error);
            }
          }
        }

        // ── Gemini Pro (primary for non-catalog, fallback tier 1 for catalog) ──
        if (base64Url === null) {
          base64Url = await generateImage(variationPrompt, body.product.imageUrl, body.model.imageUrl, LOVABLE_API_KEY, body.aspectRatio || "1:1", body.pose.imageUrl);
        }

        // Fallback tier 2: Seedream 4.5 (non-catalog) or skip (catalog already tried Seedream above)
        if (base64Url === null && !isCatalogMode) {
          const arkApiKey = Deno.env.get("BYTEPLUS_ARK_API_KEY");
          if (arkApiKey) {
            console.warn(`Pro model returned null — falling back to Seedream 4.5 via ARK API for image ${i + 1}`);
            const refImages = [body.product.imageUrl, body.model.imageUrl, body.pose?.imageUrl].filter(Boolean) as string[];
            const seedreamResult = await generateImageSeedream(
              variationPrompt, refImages, "seedream-4-5-251128", arkApiKey, body.aspectRatio || "1:1"
            );
            if (seedreamResult.ok && seedreamResult.imageUrl) {
              base64Url = await fetchImageAsBase64(seedreamResult.imageUrl);
            } else {
              console.warn(`Seedream fallback failed:`, seedreamResult.error);
            }
          }
        }

        // Fallback tier 3 (last resort): Gemini Flash
        if (base64Url === null) {
          console.warn(`All prior models failed — falling back to gemini-3.1-flash-image-preview for image ${i + 1}`);
          base64Url = await generateImageWithModel(variationPrompt, body.product.imageUrl, body.model.imageUrl, LOVABLE_API_KEY, body.aspectRatio || "1:1", "gemini-3.1-flash-image-preview", body.pose.imageUrl);
        }

        if (base64Url) {
          const publicUrl = await uploadBase64ToStorage(base64Url, userId, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
          images.push(publicUrl);
          console.log(`Generated and uploaded image ${i + 1}/${imageCount}`);

          // Write progress heartbeat so cleanup_stale_jobs knows we're alive
          if (isQueueInternal && body.job_id) {
            try {
              const progressSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
              await progressSupabase.from("generation_queue").update({
                result: {
                  generatedCount: images.length,
                  requestedCount: imageCount,
                  images: images,
                },
                timeout_at: new Date(Date.now() + 3 * 60 * 1000).toISOString(), // 3 min heartbeat
              }).eq("id", body.job_id);
            } catch (progressErr) {
              console.warn("[generate-tryon] Progress update failed:", progressErr);
            }
          }
        } else {
          errors.push(`Image ${i + 1} failed to generate`);
        }
      } catch (error: unknown) {
        if (typeof error === "object" && error !== null && "status" in error) {
          const statusError = error as { status: number; message: string };
          if (isQueueInternal && body.job_id) {
            await completeQueueJob(body.job_id, body.user_id!, body.credits_reserved!, [], imageCount, [statusError.message], body as unknown as Record<string, unknown>);
          }
          return new Response(
            JSON.stringify({ error: statusError.message }),
            { status: statusError.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        errors.push(`Image ${i + 1}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }

      if (i < imageCount - 1) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    if (isQueueInternal && body.job_id) {
      await completeQueueJob(body.job_id, body.user_id!, body.credits_reserved!, images, imageCount, errors, body as unknown as Record<string, unknown>);
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
        requestedCount: imageCount,
        partialSuccess: images.length < imageCount,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    try {
      const body = await req.clone().json().catch(() => ({}));
      if (isQueueInternal && body.job_id) {
        await completeQueueJob(body.job_id, body.user_id, body.credits_reserved, [], 1, [error instanceof Error ? error.message : "Unknown error"], body);
      }
    } catch { /* best effort */ }
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
