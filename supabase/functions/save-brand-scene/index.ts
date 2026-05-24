import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Cast presets that include a human subject — drives `trigger_blocks` so the
// downstream Product Images model picker knows to surface a model selector.
const CAST_PRESETS_WITH_PEOPLE = new Set(["solo", "two", "group"]);

// Minimal outfit-slot directive lookup (mirrors src/features/brand-scenes/wizard/constants/outfit.ts).
// Kept here to avoid cross-runtime imports.
const OUTFIT_VIBE_DIRECTIVES: Record<string, string> = {
  quiet_luxury: "quiet-luxury aesthetic",
  streetwear: "modern streetwear",
  editorial: "editorial fashion styling",
  athleisure: "athleisure performance wear",
  workwear: "utility workwear",
  beachwear: "relaxed beachwear",
  minimal: "minimal modern basics",
  vintage: "vintage-inspired styling",
};
const OUTFIT_TOP_DIRECTIVES: Record<string, string> = {
  tshirt: "plain t-shirt", knit: "fine knit sweater", blazer: "tailored blazer",
  hoodie: "relaxed hoodie", shirt: "button-down shirt", tank: "fitted tank top",
};
const OUTFIT_BOTTOM_DIRECTIVES: Record<string, string> = {
  jeans: "well-cut denim jeans", trousers: "tailored trousers", shorts: "tailored shorts",
  skirt: "midi skirt", joggers: "tapered joggers",
};
const OUTFIT_FOOTWEAR_DIRECTIVES: Record<string, string> = {
  sneakers: "minimalist sneakers", boots: "leather boots", heels: "elegant heels",
  loafers: "leather loafers", sandals: "minimal sandals", barefoot: "barefoot",
};

function pickSlot(
  slot: { preset?: string; custom?: string } | undefined,
  lookup: Record<string, string>,
): string | null {
  if (!slot) return null;
  const custom = slot.custom?.trim();
  if (custom) return custom;
  if (slot.preset && lookup[slot.preset]) return lookup[slot.preset];
  return null;
}

function deriveOutfitHint(answers: any): string {
  const cast = answers?.cast;
  const outfit = cast?.outfit;
  if (outfit) {
    const parts = [
      pickSlot(outfit.vibe, OUTFIT_VIBE_DIRECTIVES),
      pickSlot(outfit.top, OUTFIT_TOP_DIRECTIVES),
      pickSlot(outfit.bottom, OUTFIT_BOTTOM_DIRECTIVES),
      pickSlot(outfit.footwear, OUTFIT_FOOTWEAR_DIRECTIVES),
    ].filter(Boolean);
    if (parts.length) return parts.join(", ");
  }
  const refOutfit = answers?.reference_outfit?.description?.trim();
  if (refOutfit) return refOutfit;
  const wardrobe = (cast?.wardrobe_custom ?? "").toString().trim();
  if (wardrobe) return wardrobe;
  return "";
}

function deriveTriggerBlocks(answers: any): string[] {
  const cast = answers?.cast;
  const preset = cast?.preset;
  const blocks: string[] = [];
  if (preset && CAST_PRESETS_WITH_PEOPLE.has(preset)) {
    blocks.push("personDetails");
  }
  if (deriveOutfitHint(answers)) {
    blocks.push("outfit");
  }
  return blocks;
}

// Save is free — credits are deducted at generation time.


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
    const pickedVariationUrl: string = body.pickedVariationUrl ?? "";
    const name: string = (body.name ?? "").toString().trim();
    const compiledPrompt: string = (body.compiledPrompt ?? "").toString();
    const answers = body.answers;

    if (!pickedVariationUrl || !name || !compiledPrompt || !answers || typeof answers !== "object") {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate the URL belongs to this user's storage prefix (anti-spoof).
    const expectedSegment = `/${user.id}/brand-scenes/`;
    if (!pickedVariationUrl.includes(expectedSegment)) {
      console.warn(`save-brand-scene: URL prefix mismatch for user ${user.id}: ${pickedVariationUrl}`);
      return new Response(JSON.stringify({ error: "Invalid image URL" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save is free — credits were deducted at generation time.

    const sceneId = `brand-${crypto.randomUUID()}`;
    const module: string = answers.module ?? "fashion";
    const sceneType: string = answers?.base?.scene_type ?? "packshot";
    const description = compiledPrompt.split(/[\.\n]/)[0]?.slice(0, 200) ?? "";
    // Schema invariant: category_collection MUST equal answers.sub_family so the
    // scene shows up in the matching category inside the Product Visuals + Freestyle pickers.
    const subFamily: string | null =
      typeof answers?.sub_family === "string" && answers.sub_family.trim()
        ? answers.sub_family.trim()
        : null;

    // Derive trigger_blocks + outfit_hint from the wizard answers so saved
    // brand scenes behave the same as admin-imported scenes inside Product
    // Images (model picker enabled when people are in scene, outfit hint
    // surfaced in the Scene-controlled Outfit System).
    const triggerBlocks = deriveTriggerBlocks(answers);
    const outfitHint = deriveOutfitHint(answers);

    const { data: row, error: insertError } = await supabaseAdmin
      .from("product_image_scenes")
      .insert({
        scene_id: sceneId,
        title: name.slice(0, 80),
        description,
        prompt_template: compiledPrompt,
        preview_image_url: pickedVariationUrl,
        scene_type: sceneType,
        category_collection: subFamily,
        sub_category: "Brand Scenes",
        sub_category_sort_order: -1000,
        is_active: true,
        sort_order: 0,
        is_brand_scene: true,
        owner_user_id: user.id,
        brand_scene_module: module,
        brand_scene_schema_version: 1,
        brand_scene_answers: answers,
        trigger_blocks: triggerBlocks,
        outfit_hint: outfitHint || null,
        requires_extra_reference: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert failed:", insertError);
      return new Response(JSON.stringify({ error: "Failed to save scene" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ scene: row }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("save-brand-scene error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
