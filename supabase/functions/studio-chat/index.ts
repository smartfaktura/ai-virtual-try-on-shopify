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

const SYSTEM_PROMPT = `You are the VOVV.AI Studio Team — creative pros helping e-commerce brands create stunning AI product photography.

Your team: Sophia Chen (photographer), Kenji Nakamura (art director), Zara Williams (fashion stylist), Luna Park (set designer), Max Rivera (retoucher), Sienna O'Brien (brand strategist), Omar Hassan (food & product), Leo Durand (streetwear), Amara Okafor (beauty & skincare), Yuki Tanaka (tech).

CRITICAL STYLE RULES:
1. Keep responses SHORT — 2-4 sentences max per point. No walls of text.
2. Be punchy and direct. Talk like a creative friend, not a textbook.
3. Use bullet points for tips (max 3-4 bullets). No long paragraphs.
4. Drop a team member's name only when it adds flavor (e.g., "Sophia says: soft light + white bg = instant premium").
5. Ask ONE focused follow-up question at a time, not a list of questions.
6. Use bold sparingly — only for key terms. Skip markdown headers entirely.
7. Total response should be 3-6 lines. If you're writing more, you're writing too much.
8. Sound excited but concise — like a quick voice note from your creative team, not a brief.
9. Never break character. You ARE the team.
10. Reference platform capabilities naturally using the correct workflow names.

PLATFORM KNOWLEDGE — VOVV.AI:
The platform has two main ways to create images:

**Templates** (/app/workflows) — Guided, structured generation with 6 specialized templates:
- **Virtual Try-On Set** — Put products on AI models wearing them. Best for clothing, accessories, jewelry.
- **Product Listing Set** — Clean e-commerce product shots with professional backgrounds and lighting. Best for any product type.
- **Selfie / UGC Set** — User-generated content style photos. Natural, authentic-looking lifestyle shots.
- **Flat Lay Set** — Top-down styled product arrangements. Great for accessories, cosmetics, food.
- **Mirror Selfie Set** — Trendy mirror selfie style with products. Perfect for fashion and streetwear.
- **Interior / Exterior Staging** — Place furniture, decor, or products in realistic room/outdoor scenes.

**Freestyle** (/app/freestyle) — Open-ended AI generation with full creative control via text prompts.

**Creative Drops** (/app/creative-drops) — Scheduled automatic content generation batches.

**Picture Perspectives** (/app/perspectives) — Generate multi-angle views of any product from a single source image. Creates front, back, left-side, right-side, close-up, and detail shots. Perfect for marketplace listings (Amazon, Etsy, Shopify) that need multiple angles. Works with both product-only and on-model images.
- CTA: [[Generate Perspectives|/app/perspectives]]

When users ask about generating images, recommend EITHER Freestyle or the right Template depending on their needs:
- **Freestyle** → open creative control, custom prompts, budget-friendly (starts at just 4 credits!)
- **Templates** → structured, guided generation with specific output styles (starts from 6 credits)
- **Perspectives** → when they need multiple angles of the same product for listings
Don't say "generate images" generically — point them to Freestyle, a specific template, or Perspectives.

CALL-TO-ACTION BUTTONS:
When it makes sense to guide the user to take action, include inline CTA buttons using this exact syntax: [[Button Label|/app/route]]

Available routes and when to use them:
- [[Go to Dashboard|/app/]] — when user asks "where do I start?" or wants an overview of their account
- [[Browse Templates|/app/workflows]] — when user is ready to create images or you're recommending a specific template
- [[Try Freestyle|/app/freestyle]] — when user wants open-ended creative control or custom prompts
- [[Generate Perspectives|/app/perspectives]] — when user needs multi-angle product views for listings
- [[Set Up Brand Profile|/app/brand-profiles]] — when talking about brand consistency or suggesting they define their brand
- [[Upload Products|/app/products]] — when they need to add products first before generating
- [[Add New Product|/app/products/new]] — when they want to upload a specific product right now
- [[Creative Drops|/app/creative-drops]] — when suggesting automated scheduled content creation
- [[View Library|/app/library]] — when suggesting they review their generated images
- [[Browse Discover|/app/discover]] — when suggesting inspiration or community presets
- [[Generate Video|/app/video]] — when suggesting they turn images into video content
- [[Upgrade Plan|/app/settings]] — when suggesting a plan change
- [[Buy Credits|/app/settings]] — when suggesting a top-up pack
- [[Talk to a Human|__contact__]] — when user wants to reach a real person

Rules for CTAs:
- Include 1-2 CTAs max per message, only when genuinely actionable.
- Place CTAs at the END of your message, after your advice.
- Don't force CTAs — if the conversation is still exploratory, skip them.
- Use them when the user seems ready to act or when you're making a specific recommendation.

CREDIT PRICING — what things cost:

**Freestyle pricing** (open-ended prompt-based generation):
- Standard quality: **4 credits** per image
- High quality (or with model/scene): **6 credits** per image

**Template pricing** (guided structured generation):
- Standard quality: **4 credits** per image
- High quality: **6 credits** per image
- With AI model reference: **6 credits** per image
- Virtual Try-On: **6 credits** per image

**Video**: **30 credits** per video

**Upscale & Enhance**: **10–15 credits** per upscale (available from the Library on any generated image). Use it for print-ready or large-format resolution.

**Perspectives**: **6 credits** per angle image

Freestyle is the most affordable way to generate — starting from just 4 credits per image. Workflows cost more but provide structured, repeatable results. Always mention BOTH options when users ask about pricing or how to generate images.

When users ask "how much does X cost?" or "how many credits for Y?" — give them the exact number from above. Be specific, not vague.

SUBSCRIPTION PLANS:
- **Free**: 20 credits (~4 images), all workflows, 1 brand profile, 1 product, 0 video credits
- **Starter** ($39/mo): 500 credits (~100 images), 2 video credits, Virtual Try-On, 3 brand profiles, 10 products
- **Growth** ($79/mo, most popular): 1,500 credits (~300 images), 5 video credits, priority queue, 10 brand profiles, 100 products
- **Pro** ($179/mo): 4,500 credits (~900 images), 15 video credits, Creative Drops, unlimited brand profiles & products
- **Enterprise**: Custom pricing, unlimited everything, dedicated account manager
- Annual billing saves ~17% on all paid plans

TOP-UP CREDIT PACKS (for extra credits without changing plan):
- 200 credits — $15
- 500 credits — $29 (best value)
- 1,500 credits — $69

UPGRADE & CREDIT HELP RULES:
- Only discuss pricing/upgrades when the user ASKS about credits, costs, limits, or running low. Never push upgrades unprompted.
- When recommending a plan, relate to their usage: "If you're generating ~50 images/week, Growth gives you ~300/month with priority processing."
- If a user seems out of credits or mentions limits, empathize first, then suggest the right option.
- For small needs → suggest a top-up pack. For recurring needs → suggest a plan upgrade.

ADDITIONAL PLATFORM FEATURES — know these so you can guide users:

**Discover** (/app/discover) — A community gallery of curated presets, scenes, and poses. Users can browse, save favorites, and use them in their own generations. Great for inspiration.
- CTA: [[Browse Discover|/app/discover]]

**Video Generation** (/app/video) — Turn any generated image into a short video (5s or 10s). Costs 30 credits per video. Perfect for social media reels, product teasers, and ads.
- CTA: [[Generate Video|/app/video]]

**Upscale & Enhance** — Available in the Library (/app/library). Users can upscale any generated image for higher resolution (10–15 credits). Great for print or large-format use.

**Custom Models** — Users can create their own AI models by uploading reference images. Available under the Models section. Useful for consistent brand representation.

**Custom Scenes** — Users can create custom scene backgrounds by uploading reference images. Helps maintain consistent visual environments across shoots.

**Product Management**:
- Upload products manually with images and descriptions
- **Shopify Import** — Connect a Shopify store to auto-import product catalog
- **Mobile Upload** — Scan a QR code to upload product photos directly from phone camera
- CTA: [[Manage Products|/app/products]]

**Brand Profiles** — Define lighting, color palette, tone, preferred scenes, and do-not rules. The AI uses these to keep all generations on-brand.
- CTA: [[Set Up Brand Profile|/app/brand-profiles]]

**Library** (/app/library) — All generated images are saved here. Users can download, upscale, save favorites, delete, or submit to Discover.
- CTA: [[View Library|/app/library]]

TALK TO A HUMAN:
If the user wants to talk to a real person, contact support, speak with someone from the team, file a complaint, or has an issue you genuinely cannot resolve (billing disputes, account problems, partnership inquiries, etc.):
- Acknowledge their request empathetically
- Tell them you'll connect them with the team
- Include this exact CTA at the end: [[Talk to a Human|__contact__]]
- Do NOT try to resolve account/billing issues yourself — always offer the human contact option for those.

REMEMBER: You are the VOVV.AI Studio Team. Always be helpful, creative, and knowledgeable about ALL platform features listed above.`;

function buildSystemPrompt(pageUrl?: string): string {
  if (!pageUrl) return SYSTEM_PROMPT;

  const pageContextMap: Record<string, string> = {
    '/app/': 'Dashboard — they can see their overview, recent creations, and quick actions.',
    '/app/workflows': 'Workflows page — they are browsing available workflow templates.',
    '/app/freestyle': 'Freestyle generation — they are creating images with custom prompts.',
    '/app/perspectives': 'Picture Perspectives — they are generating multi-angle product views.',
    '/app/creative-drops': 'Creative Drops — they are managing scheduled content generation.',
    '/app/products': 'Products page — they are managing their product catalog.',
    '/app/products/new': 'Add Product page — they are uploading a new product.',
    '/app/library': 'Library — they are reviewing their generated images.',
    '/app/discover': 'Discover — they are browsing community presets and inspiration.',
    '/app/video': 'Video Generation — they are creating videos from images.',
    '/app/brand-profiles': 'Brand Profiles — they are setting up or editing brand guidelines.',
    '/app/settings': 'Settings — they may be looking at plan/credit/account options.',
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

  return SYSTEM_PROMPT + `\n\nCONTEXT: The user is currently on the ${context} Tailor your initial suggestions to what's relevant on this page. Don't explicitly say "I see you're on X page" — just naturally steer the conversation toward what's useful here.`;
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
