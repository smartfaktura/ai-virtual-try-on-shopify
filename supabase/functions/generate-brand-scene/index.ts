import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_PROMPT_CHARS = 8000;
const BUCKET = "scratch-uploads";
const GENERATION_COST = 20;

// SSRF guard — only allow URLs on the project's Supabase storage host.
// Rejects internal hosts (169.254.x, localhost) and arbitrary 3rd-party domains.
function isAllowedImageUrl(raw: string | undefined, supabaseUrl: string): boolean {
  if (!raw) return false;
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return false;
    const projectHost = new URL(supabaseUrl).host;
    const hostOk = u.host === projectHost || u.host.endsWith(".supabase.co");
    const pathOk = u.pathname.includes("/storage/v1/object/public/");
    return hostOk && pathOk;
  } catch {
    return false;
  }
}

// ── Detect actual image format from magic bytes ──
function detectImageFormat(bytes: Uint8Array): { ext: string; contentType: string } {
  if (bytes[0] === 0xFF && bytes[1] === 0xD8) return { ext: "jpg", contentType: "image/jpeg" };
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[8] === 0x57 && bytes[9] === 0x45) return { ext: "webp", contentType: "image/webp" };
  return { ext: "png", contentType: "image/png" };
}

// ── Fetch a URL and return base64 + mimeType for Gemini inlineData ──
async function urlToInlineData(url: string): Promise<{ mimeType: string; data: string }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch reference image");
  const buf = new Uint8Array(await res.arrayBuffer());
  const fmt = detectImageFormat(buf);
  let b64 = "";
  const CHUNK = 8192;
  for (let i = 0; i < buf.length; i += CHUNK) {
    b64 += String.fromCharCode(...buf.subarray(i, i + CHUNK));
  }
  return { mimeType: fmt.contentType, data: btoa(b64) };
}

// ── Generate image via native Gemini generateContent ──
async function generateSingleImage(
  prompt: string,
  referenceInlineData: { mimeType: string; data: string } | undefined,
  modelInlineData: { mimeType: string; data: string } | undefined,
  productInlineData: { mimeType: string; data: string } | undefined,
  apiKey: string,
  model: string,
): Promise<string> {
  const parts: any[] = [];
  // Model reference first → Gemini treats it as the primary identity anchor.
  if (modelInlineData) parts.push({ inlineData: modelInlineData });
  if (referenceInlineData) parts.push({ inlineData: referenceInlineData });
  // Stock product placeholder shows scale/placement; saved prompt swaps it later.
  if (productInlineData) parts.push({ inlineData: productInlineData });
  parts.push({ text: prompt });

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
      }),
    },
  );

  if (!res.ok) {
    const status = res.status;
    const errText = await res.text().catch(() => "");
    console.error("Gemini image gen error:", status, errText);
    if (status === 429) throw new Error("RATE_LIMIT");
    if (status === 402) throw new Error("AI_CREDITS_EXHAUSTED");
    throw new Error(`Gemini failed (${status})`);
  }

  const data = await res.json();
  const parts2 = data.candidates?.[0]?.content?.parts || [];
  const imagePart = parts2.find((p: any) => p.inlineData?.data);
  if (!imagePart) throw new Error("No image was generated");

  const mime = imagePart.inlineData.mimeType || "image/png";
  return `data:${mime};base64,${imagePart.inlineData.data}`;
}

async function uploadBase64Image(
  supabaseAdmin: any,
  userId: string,
  runId: string,
  variant: number,
  base64Url: string,
): Promise<string> {
  const base64Data = base64Url.replace(/^data:image\/\w+;base64,/, "");
  const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
  const fmt = detectImageFormat(imageBytes);
  const fileName = `${userId}/brand-scenes/${runId}/v${variant}.${fmt.ext}`;

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(fileName, imageBytes, { contentType: fmt.contentType, upsert: false });

  if (error) {
    console.error("Storage upload failed:", error);
    throw new Error("Failed to upload generated image");
  }

  const { data: publicUrlData } = supabaseAdmin.storage
    .from(BUCKET)
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await supabaseAdmin.auth.getClaims(token);
    const userId = claims?.claims?.sub as string | undefined;
    if (claimsErr || !userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const user = { id: userId };

    const body = await req.json();
    const compiledPrompt: string = (body.compiledPrompt ?? "").toString();
    const referenceImageUrl: string | undefined = body.referenceImageUrl;
    const modelImageUrl: string | undefined = body.modelImageUrl;
    const productImageUrl: string | undefined = body.productImageUrl;
    const sceneName: string = (body.name ?? "").toString().trim();

    if (!compiledPrompt.trim()) {
      return new Response(JSON.stringify({ error: "compiledPrompt is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (sceneName.length < 2) {
      return new Response(JSON.stringify({ error: "Name this scene before generating", code: "NAME_REQUIRED" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (compiledPrompt.length > MAX_PROMPT_CHARS) {
      return new Response(JSON.stringify({ error: "Prompt too long" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_KEY) throw new Error("GEMINI_API_KEY not configured");

    // Verify balance and deduct credits BEFORE calling Gemini.
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("credits_balance")
      .eq("user_id", user.id)
      .single();

    if (!profile || profile.credits_balance < GENERATION_COST) {
      return new Response(JSON.stringify({
        error: `You need ${GENERATION_COST} credits to generate brand scene variations.`,
        code: "INSUFFICIENT_CREDITS",
      }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: newBalance, error: deductError } = await supabaseAdmin.rpc("deduct_credits", {
      p_user_id: user.id,
      p_amount: GENERATION_COST,
    });
    if (deductError) {
      console.error("deduct_credits failed:", deductError);
      throw new Error("Failed to deduct credits");
    }

    const refund = async () => {
      try {
        await supabaseAdmin.rpc("refund_credits", { p_user_id: user.id, p_amount: GENERATION_COST });
      } catch (err) {
        console.error("refund_credits failed:", err);
      }
    };

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;

    let referenceInlineData: { mimeType: string; data: string } | undefined;
    if (referenceImageUrl) {
      if (!isAllowedImageUrl(referenceImageUrl, SUPABASE_URL)) {
        console.warn("Rejected referenceImageUrl (SSRF guard):", referenceImageUrl);
      } else {
        try {
          referenceInlineData = await urlToInlineData(referenceImageUrl);
        } catch (e) {
          console.warn("Reference fetch failed, continuing without it:", e);
        }
      }
    }

    let modelInlineData: { mimeType: string; data: string } | undefined;
    if (modelImageUrl) {
      if (!isAllowedImageUrl(modelImageUrl, SUPABASE_URL)) {
        console.warn("Rejected modelImageUrl (SSRF guard):", modelImageUrl);
      } else {
        try {
          modelInlineData = await urlToInlineData(modelImageUrl);
        } catch (e) {
          console.warn("Model reference fetch failed, continuing without it:", e);
        }
      }
    }

    let productInlineData: { mimeType: string; data: string } | undefined;
    if (productImageUrl) {
      if (!isAllowedImageUrl(productImageUrl, SUPABASE_URL)) {
        console.warn("Rejected productImageUrl (SSRF guard):", productImageUrl);
      } else {
        try {
          productInlineData = await urlToInlineData(productImageUrl);
        } catch (e) {
          console.warn("Stock product fetch failed, continuing without it:", e);
        }
      }
    }

    // Preview-only directive about the stock product placeholder. The saved
    // prompt template never references this image — it uses [PRODUCT IMAGE]
    // tokens injected via injectReferenceTokens on save.
    const previewPreamble = productInlineData
      ? `[STOCK PRODUCT] is a representative placeholder showing how a hero product sits in this scene — preserve the position, scale, and silhouette role of a product in this composition. Do not invent labels, logos, or branding on it. End users will swap their own product in later.\n\n`
      : "";

    const runId = crypto.randomUUID();

    // Per-slot retry: try Gemini 3 Pro, fall back to Gemini 3.1 Flash.
    const generateOneWithRetry = async (slot: number): Promise<string> => {
      const variantPrompt = `${previewPreamble}${compiledPrompt}\n\nVARIATION ${slot + 1} of 3 — deliver a distinct interpretation while keeping every constraint above.`;
      const models = ["gemini-3-pro-image-preview", "gemini-3.1-flash-image-preview"];
      let lastErr: unknown = null;
      for (const model of models) {
        try {
          const b64 = await generateSingleImage(variantPrompt, referenceInlineData, modelInlineData, productInlineData, GEMINI_KEY, model);
          return await uploadBase64Image(supabaseAdmin, user.id, runId, slot, b64);
        } catch (e) {
          lastErr = e;
          const msg = e instanceof Error ? e.message : String(e);
          console.error(`Slot ${slot} model ${model} failed:`, msg);
          if (msg === "AI_CREDITS_EXHAUSTED" || msg === "RATE_LIMIT") throw e;
        }
      }
      throw lastErr instanceof Error ? lastErr : new Error("Generation failed");
    };

    console.log(`Generating 3 brand scene variations (runId=${runId})...`);
    const results = await Promise.allSettled([0, 1, 2].map((i) => generateOneWithRetry(i)));
    const variations = results
      .map((r, i) => ({ r, i }))
      .filter(({ r }) => r.status === "fulfilled")
      .map(({ r, i }) => ({ index: i, url: (r as PromiseFulfilledResult<string>).value }));
    const failedCount = 3 - variations.length;

    if (variations.length === 0) {
      // Refund — user got nothing.
      await refund();
      const firstFailure = results.find((r) => r.status === "rejected") as PromiseRejectedResult | undefined;
      const msg = firstFailure?.reason instanceof Error ? firstFailure.reason.message : "All generation attempts failed";
      if (msg === "RATE_LIMIT") {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (msg === "AI_CREDITS_EXHAUSTED") {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please try again later." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "All generation attempts failed. Please try again." }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Partial success — proportional refund so the user only pays for what they got.
    let finalBalance = newBalance as number | null | undefined;
    let refundedAmount = 0;
    if (failedCount > 0) {
      refundedAmount = Math.floor((GENERATION_COST * failedCount) / 3);
      if (refundedAmount > 0) {
        try {
          const { data: rb } = await supabaseAdmin.rpc("refund_credits", {
            p_user_id: user.id, p_amount: refundedAmount,
          });
          if (typeof rb === "number") finalBalance = rb;
        } catch (err) {
          console.error("Partial refund failed (non-fatal):", err);
        }
      }
    }

    return new Response(JSON.stringify({
      runId,
      variations,
      partial: failedCount > 0,
      failed_count: failedCount,
      credits_charged: GENERATION_COST - refundedAmount,
      credits_refunded: refundedAmount,
      new_balance: finalBalance,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-brand-scene error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
