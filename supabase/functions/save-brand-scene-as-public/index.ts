import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function s(v: unknown): string {
  return typeof v === "string" ? v : "";
}
function sArr(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x) => typeof x === "string" && x.trim()).map((x) => String(x));
  if (typeof v === "string" && v.trim()) return [v];
  return [];
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

    // Admin check
    const { data: isAdmin } = await supabaseAdmin.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin only" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const answers = body.answers ?? {};
    const name = s(body.name).trim();
    const previewUrl = s(body.previewImageUrl).trim();

    if (name.length < 2) {
      return new Response(JSON.stringify({ error: "Name is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!previewUrl) {
      return new Response(JSON.stringify({ error: "Preview image is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const base = answers.base ?? {};

    const row = {
      name,
      category: s(answers.module),
      subcategory: s(answers.sub_family),
      aesthetic_family: s(base.aesthetic_era),
      scene_type: s(base.scene_type),
      short_description: s(base.notes).slice(0, 280),
      scene_goal: s(base.output_use_case),
      palette: sArr(base.palette),
      lighting: s(base.lighting),
      background: s(base.setting) || s(base.location),
      composition: s(base.composition) || s(base.composition_custom),
      crop: s(base.framing),
      camera_feel: s(base.lens) || s(base.lens_custom),
      props: sArr(base.extras?.props),
      mood: s(base.mood),
      styling_tone: s(base.brand_voice),
      premium_cues: sArr(base.finish ? [base.finish] : []),
      avoid_terms: sArr(base.avoid ? [base.avoid] : []),
      tags: sArr([base.weather, base.season, base.time_of_day, base.realism].filter(Boolean)),
      status: "draft",
      source_type: "brand_scene_wizard",
      preview_image_url: previewUrl,
    };

    const { data, error } = await supabaseAdmin
      .from("scene_recipes")
      .insert(row)
      .select("id, name, status")
      .single();

    if (error) {
      console.error("scene_recipes insert failed:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ recipe: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("save-brand-scene-as-public error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
