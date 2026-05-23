import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SAVE_COST = 20;

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
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    // Verify balance & deduct credits.
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("credits_balance")
      .eq("user_id", user.id)
      .single();

    if (!profile || profile.credits_balance < SAVE_COST) {
      return new Response(JSON.stringify({
        error: `You need ${SAVE_COST} credits to save a brand scene.`,
        code: "INSUFFICIENT_CREDITS",
      }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: newBalance, error: deductError } = await supabaseAdmin.rpc("deduct_credits", {
      p_user_id: user.id,
      p_amount: SAVE_COST,
    });
    if (deductError) {
      console.error("deduct_credits failed:", deductError);
      throw new Error("Failed to deduct credits");
    }

    const sceneId = `brand-${crypto.randomUUID()}`;
    const module: string = answers.module ?? "fashion";
    const sceneType: string = answers?.base?.scene_type ?? "packshot";
    const description = compiledPrompt.split(/[\.\n]/)[0]?.slice(0, 200) ?? "";

    const { data: row, error: insertError } = await supabaseAdmin
      .from("product_image_scenes")
      .insert({
        scene_id: sceneId,
        title: name.slice(0, 80),
        description,
        prompt_template: compiledPrompt,
        preview_image_url: pickedVariationUrl,
        scene_type: sceneType,
        category_collection: null,
        is_active: true,
        sort_order: 0,
        is_brand_scene: true,
        owner_user_id: user.id,
        brand_scene_module: module,
        brand_scene_schema_version: 1,
        brand_scene_answers: answers,
        trigger_blocks: [],
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert failed, refunding:", insertError);
      await supabaseAdmin.rpc("refund_credits", { p_user_id: user.id, p_amount: SAVE_COST });
      return new Response(JSON.stringify({ error: "Failed to save scene" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ scene: row, new_balance: newBalance }), {
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
