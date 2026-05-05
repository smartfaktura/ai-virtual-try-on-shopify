import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SOURCE_SCENE_IDS = [
  "apparel-interior-windowlight-editorial",
  "apparel-street-style-luxury-walk",
  "apparel-resort-seaside-editorial",
  "apparel-oldmoney-outdoor-portrait",
  "streetwear-editorial-front-portrait",
  "streetwear-editorial-side-profile",
  "brutalist-concrete",
  "urban-bench-flash-editorial",
  "low-angle-leather-walk",
  "window-salon-editorial",
  "face-detail-product-glimpse",
  "minimal-mirror-pose",
  "elevated-mirror-ugc-pose",
  "elevated-stair-editorial",
  "desert-tailored-walk",
  "apparel-home-lounge-ugc",
  "sunlit-tailored-chair-pose",
  "flash-glamour-portrait",
  "power-mirror-statement-selfie",
  "luxury-door-statement",
  "day-flash-shadow-portrait",
  "streetwear-editorial-seated-chair",
  "sun-field-grounded-pose",
  "apparel-street-steps-casual",
  "paris-curb-side-pose",
  "crossed-arms-studio",
  "hand-on-waist",
  "chin-slightly-lifted",
  "hands-behind-back",
  "closeup-detail-garments",
  "texture-detail-garments",
];

const TARGET_CATEGORIES = ["hats", "beanies", "scarves", "hoodies"];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, serviceKey);

    // Fetch source scenes
    const { data: sources, error: fetchErr } = await sb
      .from("product_image_scenes")
      .select("*")
      .eq("category_collection", "garments")
      .in("scene_id", SOURCE_SCENE_IDS);

    if (fetchErr) throw new Error(`Fetch error: ${fetchErr.message}`);
    if (!sources || sources.length === 0) throw new Error("No source scenes found");

    console.log(`Found ${sources.length} source scenes`);

    const newRows: any[] = [];

    for (const src of sources) {
      for (const cat of TARGET_CATEGORIES) {
        // Build new scene_id: append -category suffix
        const newSceneId = `${src.scene_id}-${cat}`;
        
        const row = {
          scene_id: newSceneId,
          title: src.title,
          description: src.description,
          prompt_template: src.prompt_template,
          trigger_blocks: src.trigger_blocks,
          category_collection: cat,
          scene_type: src.scene_type,
          is_active: true,
          sort_order: src.sort_order,
          sub_category: src.sub_category,
          category_sort_order: src.category_sort_order,
          requires_extra_reference: src.requires_extra_reference,
          sub_category_sort_order: src.sub_category_sort_order,
          suggested_colors: src.suggested_colors,
          outfit_hint: src.outfit_hint,
          use_scene_reference: src.use_scene_reference,
          preview_image_url: src.preview_image_url,
          subject: src.subject,
          shot_style: src.shot_style,
          setting: src.setting,
          mood: src.mood,
          filter_tags: src.filter_tags,
        };
        newRows.push(row);
      }
    }

    console.log(`Inserting ${newRows.length} new scenes`);

    // Upsert in batches of 50 (skip existing)
    const batchSize = 50;
    let inserted = 0;
    for (let i = 0; i < newRows.length; i += batchSize) {
      const batch = newRows.slice(i, i + batchSize);
      const { error: insertErr } = await sb
        .from("product_image_scenes")
        .upsert(batch, { onConflict: "scene_id", ignoreDuplicates: true });
      if (insertErr) throw new Error(`Insert error at batch ${i}: ${insertErr.message}`);
      inserted += batch.length;
    }

    return new Response(JSON.stringify({ 
      success: true, 
      sourceScenesFound: sources.length,
      totalInserted: inserted,
      categories: TARGET_CATEGORIES 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
