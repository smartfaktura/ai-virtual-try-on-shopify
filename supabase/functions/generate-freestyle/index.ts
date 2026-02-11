import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
  sourceImage?: string;
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
  user_id?: string; // Injected by process-queue for queue-internal calls
  modelId?: string;
  sceneId?: string;
  productId?: string;
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

// ── Photography DNA (Pro camera style) ────────────────────────────────────
function buildPhotographyDNA(): string {
  return `Shot on 85mm f/1.4 lens, fashion editorial quality. Professional studio lighting with sculpted shadows. Natural skin texture, ultra high resolution. Subtle film grain, elegant highlight roll-off.`;
}

// ── Negative prompt (always appended when polish is on) ───────────────────
function buildNegativePrompt(cameraStyle?: 'pro' | 'natural'): string {
  const blurRule = cameraStyle === 'natural'
    ? 'No blurry or out-of-focus areas. No bokeh. No shallow depth of field. Everything must be sharp from foreground to background.'
    : 'No blurry or out-of-focus areas unless intentionally bokeh';

  return `
CRITICAL — DO NOT include any of the following:
- No text, watermarks, logos, labels, or signatures anywhere in the image
- No distorted or extra fingers, hands, or limbs
- ${blurRule}
- No AI-looking skin smoothing or plastic textures
- No collage layouts or split-screen compositions
- No compositing artifacts, no mismatched lighting between elements, no pasted-in look, no cut-out edges`;
}

// ── Context-aware prompt polish ───────────────────────────────────────────
function polishUserPrompt(
  rawPrompt: string,
  context: { hasSource: boolean; hasModel: boolean; hasScene: boolean },
  brandProfile?: BrandProfileContext,
  userNegatives?: string[],
  modelContext?: string,
  cameraStyle?: "pro" | "natural"
): string {
  const layers: string[] = [];
  const isSelfie = detectSelfieIntent(rawPrompt);

  // ── Condensed mode for multi-reference (2+ images) — mirrors Try-On architecture ──
  const refCount = [context.hasSource, context.hasModel, context.hasScene].filter(Boolean).length;
  if (refCount >= 2 && !isSelfie) {
    const parts: string[] = [
      `Professional photography: ${rawPrompt}`,
      "",
      "REQUIREMENTS:",
    ];

    if (context.hasSource) {
      parts.push(`1. PRODUCT: The item must match [PRODUCT IMAGE] in design, color, and material. Show it naturally in the scene with correct lighting and shadows.${context.hasModel ? " Use ONLY the product from this image — IGNORE any person or mannequin shown." : ""}`);
    }
    if (context.hasModel) {
      const identityDetails = modelContext ? ` (${modelContext})` : "";
      const num = context.hasSource ? 2 : 1;
      parts.push(`${num}. MODEL: The person must be the exact individual from [MODEL IMAGE] — same face, hair, skin tone, body${identityDetails}. Ignore any person in the product image.`);
    }
    if (context.hasScene) {
      const num = [context.hasSource, context.hasModel].filter(Boolean).length + 1;
      parts.push(`${num}. SCENE: Use [SCENE IMAGE] as the environment. Consistent lighting and perspective throughout.`);
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
    if (cameraStyle === 'natural') {
      layers.push(
        "Ultra high resolution, sharp focus on face, natural ambient lighting, true-to-life color accuracy. Shot on iPhone front camera in standard photo mode (NOT Portrait Mode). No depth-of-field blur applied."
      );
    } else {
      layers.push(
        "Ultra high resolution, sharp focus on face, natural ambient lighting, true-to-life color accuracy. Shot on a high-end smartphone front-facing camera."
      );
    }
    // Selfie composition + framing layer
    const selfieDepthInstruction = cameraStyle === 'natural'
      ? "Deep depth of field — background is sharp and in focus, NOT blurred. This is a standard front-camera selfie WITHOUT Portrait Mode enabled. No bokeh, no background blur, no shallow depth of field whatsoever."
      : "Soft natural smartphone-style bokeh in background.";
    layers.push(
      `SELFIE COMPOSITION: This image is shot FROM the smartphone's front-facing camera. The camera IS the phone — the viewer sees exactly what the iPhone front camera captures. The subject is looking DIRECTLY into the camera lens (direct eye contact with the viewer). Slight wide-angle distortion typical of a smartphone selfie lens. The subject's arm holding the phone may be partially visible at the bottom or side edge of the frame, but the phone itself is NEVER visible because it IS the camera. ABSOLUTELY NO phone, smartphone, or device should appear anywhere in the image. This is NOT a third-person photo of someone holding a phone — it is the phone's own POV. ${selfieDepthInstruction} Authentic, candid expression — relaxed and genuine. NEVER show both hands free — one hand is always occupied holding the phone (which is the camera).`
    );
    layers.push(
      "SELFIE FRAMING: Subject's full head and hair must be fully visible within the frame with natural headroom above. Frame from mid-chest or shoulders upward — do NOT crop below the chin or above the forehead. Center the face in the upper-third of the frame following the rule of thirds."
    );
  } else {
    layers.push(`Professional photography: ${rawPrompt}`);
    layers.push(buildPhotographyDNA());
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

  // Product / source image layer
  if (context.hasSource) {
    layers.push(
      "PRODUCT ACCURACY: The product must match the reference image in design, color, and material. Show it naturally with correct lighting and shadows — it should look photographed, not composited."
    );
    if (isSelfie) {
      layers.push(
        "PRODUCT INTERACTION (SELFIE): The person should hold or display the product in a natural, casual way — as if showing it to a friend on a video call. Product held near the face or chest, relaxed grip, naturally integrated into the selfie frame. NOT floating, stiff, or posed like a catalog shot."
      );
    }
    // Product-only framing (no model involved)
    if (!context.hasModel) {
      layers.push(
        "FRAMING: Center the product with balanced negative space on all sides. The product should occupy 50-70% of the frame with no cropping of edges."
      );
    }
  }

  // Model / portrait layer — strong identity matching
  if (context.hasModel) {
    const identityDetails = modelContext ? ` (${modelContext})` : "";
    layers.push(
      `MODEL IDENTITY: The generated person MUST be the EXACT same person shown in the MODEL REFERENCE IMAGE${identityDetails}. Replicate their exact face, facial features, skin tone, hair color, hair style, and body proportions with 100% fidelity. This is a specific real person — do NOT generate a different person who merely shares the same gender or ethnicity. The face must be recognizable as the same individual from the reference photo. If a product reference image also contains a person, IGNORE that person entirely. The generated person must match ONLY the [MODEL IMAGE] reference.`
    );
    if (isSelfie) {
      if (cameraStyle === 'natural') {
        layers.push(
          "PORTRAIT QUALITY (SELFIE): Natural, authentic skin texture with realistic pores and subtle imperfections. Even, ambient lighting on the face — no dramatic light shaping, no artificial warmth or glow. True-to-life skin tones with zero color grading. As captured by a smartphone front camera in auto mode."
        );
      } else {
        layers.push(
          "PORTRAIT QUALITY (SELFIE): Natural, authentic skin texture with realistic pores and subtle imperfections — NOT studio-retouched or airbrushed. Soft, flattering natural light on the face. Relaxed, genuine expression as if casually taking a selfie. Slight warmth and glow from ambient or window light."
        );
      }
    } else {
      layers.push(
        "PORTRAIT QUALITY: Natural skin pores and peach-fuzz visible without harshness. Crisp lashes, realistic hair texture with individual strands. Smooth luminous skin with clean highlight roll-off. Accurate body proportions, natural pose and expression. No heavy frequency-separation retouching, no plastic or airbrushed look."
      );
      // Framing for standard portrait/model shots
      layers.push(
        "FRAMING: Ensure the subject's full head, hair, and upper body are fully visible within the frame. Leave natural headroom above the head — do NOT crop the top of the head. Position the subject using the rule of thirds. The face and eyes should be in the upper third of the composition."
      );
    }
  }

  // Scene / environment layer
  if (context.hasScene) {
    layers.push(
      "ENVIRONMENT: The subject MUST be placed in the EXACT environment shown in the SCENE REFERENCE IMAGE. Reproduce the same location, background elements, props, foliage, architecture, and atmosphere. Match the lighting direction, color temperature, and time of day. The final image should look like it was photographed in that exact location. Do NOT substitute a different environment or background."
    );
  }

  // Camera rendering style layer (injected before negatives)
  if (cameraStyle === "natural") {
    layers.push(
`CAMERA RENDERING STYLE — NATURAL (iPhone):
Apply these rendering characteristics ONLY — do NOT change the subject, scene, environment, model, or composition in any way:
- LENS: Slight wide-angle perspective typical of smartphone main camera (26mm equivalent). Deep depth of field — foreground AND background stay sharp and in focus. No artificial bokeh, no shallow depth of field, no blurred backgrounds unless the scene naturally has extreme distance.
- COLOR SCIENCE: Apple iPhone-style computational photography color rendering. True-to-life, neutral color reproduction — no cinematic color grading, no orange-and-teal push, no lifted shadows, no crushed blacks. Colors should look exactly as the human eye would see them. Whites are pure neutral white, not warm-tinted.
- LIGHTING: Use whatever lighting exists in the scene naturally. No added studio strobes, softboxes, or artificial rim lights. If indoors, the light comes from windows and room lights. If outdoors, from the sun and sky. Slight HDR-like dynamic range (shadows are not pitch black, highlights are not blown out) — similar to iPhone Smart HDR processing.
- TEXTURE & DETAIL: Ultra-sharp across the entire frame. High pixel-level detail on skin, fabric, hair, and surfaces. No heavy skin smoothing or frequency separation retouching. Natural skin texture including pores and fine lines is visible. Detail level comparable to a 48MP smartphone sensor.
- OVERALL FEEL: The image should look like it was taken by someone with a latest-generation iPhone and posted directly — no Lightroom, no Photoshop, no professional retouching. Clean, sharp, true-to-life. The hallmark is "impressive but clearly a phone photo."
${isSelfie ? `- SELFIE OVERRIDE: This is shot with the standard front-facing camera mode (NOT Portrait Mode). The background MUST remain sharp and detailed — absolutely no depth-of-field blur, no bokeh effect whatsoever. Everything from foreground to background is in focus.` : ''}`
    );
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
  let negativeBlock = buildNegativePrompt(cameraStyle);
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

function getUserIdFromJwt(authHeader: string | null): string | null {
  if (!authHeader) return null;
  try {
    const token = authHeader.replace("Bearer ", "");
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub || null;
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
            ...(aspectRatio ? { image_config: { aspect_ratio: aspectRatio } } : {}),
          }),
          signal: AbortSignal.timeout(50_000), // 50s timeout per AI call
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
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
        throw error;
      }
      console.error(`Generation attempt ${attempt + 1} failed:`, error);
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 500));
        continue;
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
  modelImage?: string,
  sceneImage?: string,
): ContentItem[] {
  const content: ContentItem[] = [];

  // Main prompt text first
  content.push({ type: "text", text: prompt });

  // Images with concise labels (Try-On style — instructions are in the prompt)
  if (sourceImage) {
    content.push({ type: "text", text: "[PRODUCT IMAGE]" });
    content.push({ type: "image_url", image_url: { url: sourceImage } });
  }

  if (modelImage) {
    content.push({ type: "text", text: "[MODEL IMAGE]" });
    content.push({ type: "image_url", image_url: { url: modelImage } });
  }

  if (sceneImage) {
    content.push({ type: "text", text: "[SCENE IMAGE]" });
    content.push({ type: "image_url", image_url: { url: sceneImage } });
  }

  return content;
}

// ── Request handler ───────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    // Extract user ID — support queue-internal calls with user_id in payload
    const isQueueInternal = req.headers.get("x-queue-internal") === "true";
    const body: FreestyleRequest = await req.json();

    let userId: string | null;
    if (isQueueInternal && body.user_id) {
      userId = body.user_id;
    } else {
      userId = getUserIdFromJwt(req.headers.get("authorization"));
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Allow empty prompt if at least one image reference is provided
    if (!body.prompt?.trim() && !body.sourceImage && !body.modelImage && !body.sceneImage) {
      return new Response(
        JSON.stringify({ error: "Please provide a prompt or select at least one reference (product, model, or scene)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Queue-mode optimizations: cap to 1 image, reduce retries
    const maxRetries = isQueueInternal ? 1 : 2;
    const effectiveImageCount = isQueueInternal ? 1 : Math.min(body.imageCount || 1, 4);

    // Append model text context if provided
    let enrichedPrompt = body.prompt?.trim() || "Professional commercial photography of the provided subject";
    if (body.modelContext) {
      enrichedPrompt = `${enrichedPrompt}\n\nModel reference: ${body.modelContext}`;
    }

    // Append style presets if provided
    if (body.stylePresets && body.stylePresets.length > 0) {
      enrichedPrompt = `${enrichedPrompt}\n\nStyle direction: ${body.stylePresets.join(", ")}`;
    }

    // Apply polish if enabled
    const polishContext = {
      hasSource: !!body.sourceImage,
      hasModel: !!body.modelImage,
      hasScene: !!body.sceneImage,
    };

    let finalPrompt: string;
    if (body.polishPrompt) {
      finalPrompt = polishUserPrompt(enrichedPrompt, polishContext, body.brandProfile, body.negatives, body.modelContext, body.cameraStyle);
    } else {
      // Even without polish, apply brand context and negatives if provided
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
      // Apply natural camera style even without polish
      if (body.cameraStyle === "natural") {
        unpolished += `\n\nCAMERA RENDERING STYLE — NATURAL (iPhone): Shot on a latest-generation iPhone. Ultra-sharp details across the entire frame with deep depth of field (everything in focus, minimal bokeh). True-to-life, unedited color reproduction — no color grading, no warm/cool push. Natural ambient lighting only. The image should feel authentic and unprocessed.`;
      }
      finalPrompt = unpolished;
    }

    // Add aspect ratio instruction
    const aspectPrompt = `${finalPrompt}\n\nOutput aspect ratio: ${body.aspectRatio}`;

    // Select model: auto-upgrade to pro for 2+ references (flash can't handle complex merges)
    const refCount = [body.sourceImage, body.modelImage, body.sceneImage].filter(Boolean).length;
    // Queue-internal: always use fast model (must finish within 50s timeout)
    // Direct calls: allow pro model only for high quality with 0-1 refs
    const hasModelImage = !!body.modelImage;
    const aiModel = hasModelImage
      ? "google/gemini-3-pro-image-preview"
      : isQueueInternal
        ? "google/gemini-2.5-flash-image"
        : (body.quality === "high" && refCount < 2)
          ? "google/gemini-3-pro-image-preview"
          : "google/gemini-2.5-flash-image";

    console.log("Freestyle generation:", {
      promptLength: body.prompt.length,
      hasSourceImage: !!body.sourceImage,
      hasModelImage: !!body.modelImage,
      hasSceneImage: !!body.sceneImage,
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
      isQueueInternal,
    });

    const images: string[] = [];
    const errors: string[] = [];
    let contentBlocked = false;
    let blockReason = "";

    // Batch consistency instruction for multi-image requests
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

        // Build structured content array with labeled images
        const contentArray = buildContentArray(
          promptWithVariation,
          body.sourceImage,
          body.modelImage,
          body.sceneImage,
        );

        const result = await generateImage(contentArray, LOVABLE_API_KEY, aiModel, body.aspectRatio, maxRetries);

        if (result && typeof result === "object" && "blocked" in result) {
          contentBlocked = true;
          blockReason = result.reason;
          console.warn(`Image ${i + 1} blocked by content safety filter`);
          break;
        } else if (typeof result === "string") {
          // Upload to storage and return public URL (matches try-on pattern)
          const publicUrl = await uploadBase64ToStorage(result, userId, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
          images.push(publicUrl);
          console.log(`Generated and uploaded freestyle image ${i + 1}/${effectiveImageCount}`);

          // Save to freestyle_generations DB when called from queue
          if (isQueueInternal) {
            try {
              const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
                auth: { persistSession: false },
              });
              await supabase.from('freestyle_generations').insert({
                user_id: userId,
                image_url: publicUrl,
                prompt: body.prompt || '',
                aspect_ratio: body.aspectRatio || '1:1',
                quality: body.quality || 'standard',
                model_id: body.modelId || null,
                scene_id: body.sceneId || null,
                product_id: body.productId || null,
              });
              console.log(`Saved freestyle_generations record for image ${i + 1}`);
            } catch (dbErr) {
              console.error(`Failed to save freestyle_generations record:`, dbErr);
            }
          }
        } else {
          errors.push(`Image ${i + 1} failed to generate`);
        }
      } catch (error: unknown) {
        if (typeof error === "object" && error !== null && "status" in error) {
          const statusError = error as { status: number; message: string };
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

    // If content was blocked and no images were generated
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
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
