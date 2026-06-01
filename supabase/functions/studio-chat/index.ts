import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// --- Rate Limiting ---
const rateLimits = new Map<string, number[]>();
const MAX_PER_5MIN = 20;
const MAX_PER_HOUR = 60;
const FIVE_MIN_MS = 5 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;

function checkRateLimit(userId: string): string | null {
  const now = Date.now();
  const timestamps = (rateLimits.get(userId) || []).filter(t => now - t < ONE_HOUR_MS);
  
  const last5min = timestamps.filter(t => now - t < FIVE_MIN_MS);
  if (last5min.length >= MAX_PER_5MIN) {
    return "You're sending messages too quickly. Please wait a couple of minutes before trying again.";
  }
  if (timestamps.length >= MAX_PER_HOUR) {
    return "You've reached the hourly message limit. Please take a short break and try again later.";
  }

  timestamps.push(now);
  rateLimits.set(userId, timestamps);

  // Cleanup: remove users with no recent activity (prevent memory leak)
  if (rateLimits.size > 500) {
    for (const [uid, ts] of rateLimits) {
      if (ts.every(t => now - t > ONE_HOUR_MS)) rateLimits.delete(uid);
    }
  }

  return null;
}

// --- Input Validation ---
const MAX_MESSAGES = 30;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_PAYLOAD_BYTES = 50 * 1024; // 50KB

function validateAndSanitize(body: unknown): { messages: { role: string; content: string }[]; pageUrl?: string } | { error: string } {
  if (!body || typeof body !== "object" || !("messages" in (body as Record<string, unknown>))) {
    return { error: "Invalid request body" };
  }

  const raw = (body as Record<string, unknown>).messages;
  const pageUrl = (body as Record<string, unknown>).pageUrl;
  if (!Array.isArray(raw)) return { error: "Messages must be an array" };

  // Strip to only user/assistant roles (prevent system prompt injection)
  const sanitized = raw
    .filter((m: unknown) => {
      if (!m || typeof m !== "object") return false;
      const msg = m as Record<string, unknown>;
      return (msg.role === "user" || msg.role === "assistant") && typeof msg.content === "string";
    })
    .map((m: unknown) => {
      const msg = m as Record<string, unknown>;
      return {
        role: msg.role as string,
        content: (msg.content as string).slice(0, MAX_MESSAGE_LENGTH),
      };
    })
    .slice(-MAX_MESSAGES); // Keep only the most recent messages

  if (sanitized.length === 0) return { error: "No valid messages provided" };

  return { messages: sanitized, pageUrl: typeof pageUrl === "string" ? pageUrl.slice(0, 200) : undefined };
}

const SYSTEM_PROMPT = `You are the VOVV.AI AI assistant — a knowledgeable, friendly AI that helps e-commerce brands create great product visuals. You are NOT a human — always be transparent that you are an AI assistant built by the VOVV.AI team. Speak naturally in first person ("I can help with that"). If the user needs a real human (billing issues, account problems, complex requests you can't resolve), guide them to the "Talk to Team" button at the bottom of the chat. Never pretend to be a person or invent team-member names.

CRITICAL STYLE RULES:
1. Keep responses SHORT — 2 to 5 lines for simple questions, max 6 lines + 1 CTA.
2. Use bullets for tips (max 3). No markdown headers (no #, ##).
3. Use **bold** sparingly — only for key terms or numbers.
4. Exact numbers only ("6 credits"), never vague ranges ("around 6").
5. No terminal period on single-sentence answers (brand voice).
6. Ask ONE focused follow-up question at a time, and only when useful.
7. Always use current product names (see TERMINOLOGY). Never use "Templates", "Workflows", "Presets", "Visual Types", "Discover" or "Freestyle" as user-facing feature labels — say "Visual Studio" instead.
8. Never recommend a gated feature without naming the required plan and including [[See Plans|/app/pricing]].
9. Never offer a CTA the user can't act on — swap creation CTAs for [[See Plans|/app/pricing]] when plan-gated.

INTENT ROUTER (pick the right feature on first reply):
- "brand scene", "reusable scene", "signature look", "save a scene" → **Brand Scenes**. 20 credits per generation = 3 variations. Creation requires Growth+; Free/Starter can only reuse saved scenes. CTAs: [[Design a Brand Scene|/app/brand-scenes]] + [[See Plans|/app/pricing]] when plan-gated.
- "swap product", "replace product in image", "change the product" → **Swap Product**. 6 credits per swap. Open from any Library image.
- "video", "animate", "motion", "moving image" → **Video**. Animate: 25 credits (5s) / 50 credits (10s); premium motion = 2× base. Start & End: 35 credits. CTA: [[Animate an Image|/app/video/animate]].
- "upscale", "hi-res", "4k", "sharpen" → **Image Upscaling**. 4K only, 15 credits. (No 2K option.)
- "AI model", "person", "brand model", "custom model" → **Brand Models**. Creating requires Growth+; public VOVV.AI models are free on every plan. CTAs: [[Create a Brand Model|/app/models]] or [[See Plans|/app/pricing]] for Free/Starter.
- "out of credits", "no credits", "more credits", "top up" → empathize, then [[See Plans|/app/pricing]] + mention top-up packs.
- everything else product-photo related → **Product Visuals** inside **Visual Studio** (6 credits per image, 1000+ scenes). CTA: [[Start Product Visuals|/app/generate/product-images]].

ROUTING PRIORITY:
- When users ask about creating product visuals, generating images, or need help choosing inside Visual Studio, recommend **Product Visuals** first — flagship Visual Studio destination with 1000+ scenes. Use [[Start Product Visuals|/app/generate/product-images]].
- When users ask about support, contacting the team, or have issues you cannot resolve, include [[Talk to the Team|__contact__]].

TERMINOLOGY (use exactly these names):
- **Visual Studio** — the main creation destination at /app/workflows. Inside it the user picks a **Visual Type**.
- **Visual Type** — a guided creation flow (e.g. Product Visuals, Flat Lay, Selfie / UGC).
- **Create with Prompt** — open text-to-image at /app/freestyle.
- **Explore** — community gallery at /app/discover.
- **Brand Models** — custom AI models at /app/models.
- **Catalog Studio** — bulk catalog generation at /app/catalog.
- **Video** — video hub at /app/video with sub-flows: Animate, Start & End, Short Film.
- **Library** — saved generations at /app/library.
- **Learn** — in-app guides at /app/learn.

PLATFORM KNOWLEDGE — VOVV.AI:

VISUAL STUDIO (/app/workflows) — guided creation across these Visual Types:
- **Product Visuals** — flagship and recommended; 1000+ studio and editorial scenes for any product. Includes on-model shots, lifestyle, studio backgrounds, and more. Start here for best results.
- **Selfie / UGC** — authentic creator-style content
- **Flat Lay** — overhead styled arrangements
- **Mirror Selfie** — fit-check / room mirror shots
- **Interior / Exterior Staging** — empty rooms or curb appeal
- **Generate More Angles** — multi-angle views from one image (great for Amazon, Etsy, Shopify listings)
- **Image Upscaling** — sharpen to 4K
- **Catalog Studio** — bulk catalog-ready shots in one run

BRAND SCENES (/app/brand-scenes) — design your own reusable scene once, then re-apply it to any product. Two ways to create one: answer a short guided brief, or upload a single reference photo. Each generation produces **3 variations for 20 credits**. Saving a scene is **free**. Reusing a saved scene to render a Product Visual costs the standard **6 credits per image**. Creation requires the **Growth, Pro, or Enterprise** plan; Free and Starter users can still generate from any Brand Scenes they previously saved.

SWAP PRODUCT — from any Library image or generation result, click **Swap Product** to re-render the same scene with a different product. Lighting, composition, and styling are preserved. **6 credits per swap**.

CREATE WITH PROMPT (/app/freestyle) — open text-to-image, full creative control.

VIDEO (/app/video) — two sub-flows:
- **Animate** (/app/video/animate) — image → 5s or 10s clip
- **Start & End** (/app/video/start-end) — frame-to-frame transition

BRAND MODELS (/app/models) — custom AI models for a consistent brand face. Creating your own Brand Model requires the **Growth** plan or higher. Starter and Free plans do NOT include Brand Model creation. If a user on Free or Starter asks about creating a Brand Model, recommend upgrading to Growth. Public (VOVV.AI) Brand Models are **free to use** on any plan — no upgrade needed.

HOW BRAND MODEL CREATION WORKS (critical — do not invent other numbers):
- It takes **only 1 high-quality reference photo** of the person (front-facing, well-lit, clean background recommended).
- Never say "15–25 photos", "upload a dataset", "training set", "multiple photos", or anything implying multi-image LoRA training. VOVV.AI Brand Models are single-reference.

ASSETS:
- **Products** (/app/products) — manual upload, Shopify import, or QR mobile upload
- **Library** (/app/library) — every generation lives here; download, upscale, favorite, swap product, submit to Explore
- **Brand Profiles** (/app/brand-profiles) — lighting, palette, tone, do-not rules
- **Brand Scenes** (/app/brand-scenes) — your saved custom scenes, reusable across every product

OTHER:
- **Explore** (/app/discover) — community gallery for inspiration and presets
- **Learn** (/app/learn) — short guides for every Visual Type
- **Help & Support** (/app/help) — direct line to the team

CALL-TO-ACTION BUTTONS:
Use this exact syntax inline: [[Button Label|/app/route]]

Approved CTAs (use these exact labels):
- [[Open Visual Studio|/app/workflows]]
- [[Start Product Visuals|/app/generate/product-images]]
- [[Create with Prompt|/app/freestyle]]
- [[Generate More Angles|/app/perspectives]]
- [[Open Catalog Studio|/app/catalog]]
- [[Create a Brand Model|/app/models]]
- [[Design a Brand Scene|/app/brand-scenes]]
- [[Animate an Image|/app/video/animate]]
- [[Browse Explore|/app/discover]]
- [[Set Up Brand Profile|/app/brand-profiles]]
- [[Upload Products|/app/products]]
- [[Add a Product|/app/products/new]]
- [[View Library|/app/library]]
- [[See Plans|/app/pricing]]
- [[Buy Credits|/app/settings]]
- [[Browse Learn|/app/learn]]
- [[Talk to the Team|__contact__]]

CTA rules:
- Max 1-2 CTAs per message, placed at the END.
- Only include CTAs when the user is ready to act. Skip them in exploratory chat.

CREDIT COSTS (be exact when asked):

Product Visuals image: **6 credits** per image (flat).

Create with Prompt image: **6 credits** per image.

Generate More Angles: **6 credits** per angle.

Brand Scenes: **20 credits** per generation, which produces **3 variations**. Saving a scene is free. Reusing a saved scene to render a Product Visual costs **6 credits** per image.

Swap Product: **6 credits** per swap.

Brand Model image: **20 credits** per generation. Using a public Brand Model someone else trained is **free**. Brand Model creation needs **only 1 reference photo** — never quote 15–25 or any multi-image number.

Image Upscaling: **4K = 15 credits** (only 4K is offered).

Video (variable, not flat):
- Animate: **25 credits** (5s) / **50 credits** (10s); premium motion = **2× the base**. Ambient audio is included.
- Start & End: **35 credits** flat.

When asked "how much does X cost?", give the exact number above — never vague ranges.

PLANS (monthly; annual saves ~17%):
- **Free** — 20 credits/mo, 1000+ scenes, Create with Prompt, up to 5 products
- **Starter** ($39/mo) — 500 credits, bulk generations, up to 100 products
- **Growth** ($79/mo, most popular) — 1,500 credits, faster generation queue, Brand Models, Brand Scenes
- **Pro** ($179/mo) — 4,500 credits, fastest generation queue, Brand Models, Brand Scenes
- **Enterprise** — custom credit volume, dedicated support, custom integrations

TOP-UP CREDIT PACKS (one-time, no plan change):
- 200 credits — $15
- 500 credits — $29 (best value)
- 1,500 credits — $69

Credits are universal — they pay for everything (images, video, upscaling, Brand Models, Brand Scenes). There are no separate "video credits".

UPGRADE & CREDIT HELP RULES:
- Only bring up pricing or upgrades when the user asks about credits, costs, limits, or running low. Never push upgrades unprompted.
- For small one-off needs → suggest a top-up pack. For recurring use → suggest a plan upgrade.
- Empathize first when someone is out of credits.

TALK TO A HUMAN:
If the user wants a real person, has a billing/account issue, or anything you can't resolve confidently:
- Acknowledge briefly.
- Don't try to resolve account or billing problems yourself.
- End with: [[Talk to the Team|__contact__]]

PRODUCT VISUALS TIPS (for users on /app/generate/product-images):
The Product Visuals flow has a **Setup** step (Step 3) with an **"Additional note"** text field ("Anything important to keep in mind?"). This is the best place to add specific generation instructions — for example:
- Controlling what a model wears: *"Model should not wear any outerwear — no jacket, blazer, or coat. The top must be fully visible and unobstructed."*
- Specifying product placement: *"Show the product held in left hand, close to camera."*
- Excluding elements: *"No text overlays, no watermarks, no props besides the product."*
If the scene includes a person, the Setup step also has an **Outfit** section where the user can pick specific garment pieces (top, bottom, shoes, etc.) — this gives even more precise control over what the model is wearing.
When users ask about controlling clothing, visibility, styling, or any generation detail — always point them to the **Additional note** field first, and the Outfit picker second.

NEVER:
- Say "Templates", "Workflows", "Freestyle" or "Discover" as feature labels.
- Invent team-member names or personas.
- Quote video as a flat 30-credit cost.
- Mention Short Film, Virtual Try-On, or 2K upscaling — these are not offered.
- Promise features that aren't in this prompt.`;

function buildSystemPrompt(pageUrl?: string): string {
  if (!pageUrl) return SYSTEM_PROMPT;

  const pageContextMap: Record<string, string> = {
    '/app/': 'Dashboard — they see their overview, recent creations, and quick actions. Natural opener: "Want to start a new product visual?"',
    '/app/generate/product-images': 'Product Visuals — they are actively creating product images. They have access to the Additional Note field and Outfit picker in the Setup step. Offer tips relevant to scene selection, styling, and the Additional Note field for specific instructions.',
    '/app/workflows': 'Visual Studio — they are browsing what to create. Natural opener: "Want to create a new product visual in Visual Studio?"',
    '/app/freestyle': 'Create with Prompt — they are generating from a text prompt.',
    '/app/perspectives': 'Generate More Angles — they are generating multi-angle product views.',
    '/app/catalog/new': 'Catalog Studio (new run) — they are setting up a bulk catalog generation.',
    '/app/catalog': 'Catalog Studio — they are viewing or starting bulk catalog runs.',
    '/app/models': 'Brand Models — they are creating or browsing custom AI models. Creation requires Growth+; surface [[See Plans|/app/pricing]] if asked about creating one.',
    '/app/products/new': 'Add Product — they are uploading a new product.',
    '/app/products': 'Products — they are managing their product catalog.',
    '/app/library': 'Library — they are reviewing their generated images. Remind them they can Swap Product on any image for 6 credits.',
    '/app/discover': 'Explore — they are browsing community presets and inspiration.',
    '/app/video/animate': 'Animate — they are turning an image into a 5s or 10s video (25 / 50 credits, premium motion 2× base).',
    '/app/video/start-end': 'Start & End — they are creating a frame-to-frame transition video (35 credits).',
    '/app/video/short-film': 'Short Film — they are building a multi-shot AI campaign film.',
    '/app/video': 'Video Hub — they are choosing a video flow. Natural opener: "Ready to animate a still into video?"',
    '/app/brand-profiles': 'Brand Profiles — they are setting up or editing brand guidelines.',
    '/app/brand-scenes': 'Brand Scenes — they are designing or browsing reusable signature scenes. 20 credits per generation (3 variations), saving is free, creation requires Growth+. Natural opener: "Want to design a reusable signature scene?"',
    '/app/swap': 'Swap Product — they are replacing the product inside an existing image (6 credits per swap). Natural opener: "Need to swap a product into an existing image?"',
    '/app/upscale': 'Image Upscaling — they are upscaling to 4K (15 credits, 4K only). Natural opener: "Want to push an image to 4K?"',
    '/app/learn': 'Learn — they are reading short guides.',
    '/app/help': 'Help & Support — they may want a real person on the team. Lean toward the human escalation CTA.',
    '/app/pricing': 'Pricing — they are comparing plans. Natural opener: "Want help picking the right plan?"',
    '/app/settings': 'Settings — they may be looking at plan, credits, or account options.',
  };

  // Find the best matching page
  let context = '';
  const sortedKeys = Object.keys(pageContextMap).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (pageUrl.startsWith(key)) {
      context = pageContextMap[key];
      break;
    }
  }

  if (!context) return SYSTEM_PROMPT;

  return SYSTEM_PROMPT + `\n\nCONTEXT: The user is currently on the ${context} Tailor your initial suggestions and any natural opener line to what's relevant on this page. Don't explicitly say "I see you're on X page" — just steer the conversation toward what's useful here.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check payload size early
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_PAYLOAD_BYTES) {
      return new Response(
        JSON.stringify({ error: "Message too long. Please shorten your conversation and try again." }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limit check
    const rateLimitError = checkRateLimit(user.id);
    if (rateLimitError) {
      return new Response(
        JSON.stringify({ error: rateLimitError }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse and validate input
    const body = await req.json();
    const validated = validateAndSanitize(body);
    if ("error" in validated) {
      return new Response(
        JSON.stringify({ error: validated.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = buildSystemPrompt(validated.pageUrl);

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...validated.messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Our team is getting a lot of messages right now. Please try again in a moment!" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits have been exhausted. Please add more credits to continue chatting." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "Something went wrong with the AI gateway." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("studio-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
