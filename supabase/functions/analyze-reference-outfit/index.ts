// Edge function: analyze a reference image and return a detailed outfit
// direction (people-only) suitable to feed into product visual generations.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const REFERENCE_BUCKET = "brand-scene-references";

const SYSTEM_PROMPT = `You are a senior fashion stylist & art director.
Analyze the supplied reference image and describe ONLY the OUTFIT(s) worn by people in it.
Be exhaustive, observational, neutral — no creative liberties, no people identification.
If no people are visible, set people_present=false and leave other fields empty.
Use plain industry vocabulary (silhouette, drape, weave, finish, hardware).
The output will be used as direction for generating new product photoshoot images.`;

const TOOL = {
  type: "function",
  function: {
    name: "report_outfit",
    description: "Return a structured, exhaustive outfit analysis.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        people_present: { type: "boolean" },
        outfit_description: {
          type: "string",
          description:
            "Long-form, highly-detailed paragraph (300-700 chars). Reads like a stylist's brief: silhouette, garments, fabric, color, fit, layering, accessories, footwear, overall era/vibe.",
        },
        breakdown: {
          type: "object",
          additionalProperties: false,
          properties: {
            silhouette: { type: "string" },
            top: { type: "string" },
            bottom: { type: "string" },
            outerwear: { type: "string" },
            footwear: { type: "string" },
            accessories: { type: "string" },
            palette: {
              type: "array",
              items: { type: "string" },
              description: "2-4 dominant colors with hex when possible",
            },
            fabric_notes: { type: "string" },
            styling_notes: { type: "string" },
            era_or_vibe: { type: "string" },
          },
        },
      },
      required: ["people_present", "outfit_description"],
    },
  },
} as const;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) {
      return json({ error: "LOVABLE_API_KEY not configured" }, 500);
    }

    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claims?.claims) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const imageUrl: string | undefined = body.imageUrl;
    const imagePath: string | undefined = body.imagePath;
    if (!imageUrl && !imagePath) {
      return json({ error: "imageUrl or imagePath required" }, 400);
    }

    let resolvedUrl = imageUrl;
    if (!resolvedUrl && imagePath) {
      const { data } = supabase.storage.from(REFERENCE_BUCKET).getPublicUrl(imagePath);
      resolvedUrl = data.publicUrl;
    }
    if (!resolvedUrl) return json({ error: "could not resolve image url" }, 400);

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              {
                type: "text",
                text:
                  "Analyze the outfit in this reference. Return via the report_outfit tool. If no people are visible, set people_present=false.",
              },
              { type: "image_url", image_url: { url: resolvedUrl } },
            ],
          },
        ],
        tools: [TOOL],
        tool_choice: { type: "function", function: { name: "report_outfit" } },
      }),
    });

    if (aiResp.status === 429) return json({ error: "Rate limited — try again shortly." }, 429);
    if (aiResp.status === 402) {
      return json({ error: "AI credits exhausted — add funds in workspace settings." }, 402);
    }
    if (!aiResp.ok) {
      const txt = await aiResp.text();
      console.error("AI gateway error", aiResp.status, txt);
      return json({ error: "Analysis failed" }, 500);
    }

    const data = await aiResp.json();
    const call = data?.choices?.[0]?.message?.tool_calls?.[0];
    if (!call?.function?.arguments) {
      return json({ error: "Empty analysis from model" }, 500);
    }
    let parsed: any;
    try {
      parsed = JSON.parse(call.function.arguments);
    } catch {
      return json({ error: "Bad JSON from model" }, 500);
    }

    return json({
      people_present: !!parsed.people_present,
      outfit_description: String(parsed.outfit_description ?? "").slice(0, 1200),
      breakdown: parsed.breakdown ?? null,
    });
  } catch (e) {
    console.error("analyze-reference-outfit error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
