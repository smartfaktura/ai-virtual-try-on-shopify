import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Scene-specific prompts for background-only preview generation
const scenePreviewPrompts: Record<string, string> = {
  "Hero White": "Clean white photography studio background, soft even diffused lighting, minimal shadows, professional e-commerce product photography backdrop, empty surface ready for product placement, ultra high resolution, photorealistic",
  "Marble Surface": "Elegant white and gray marble surface with subtle natural veining, soft directional light from left, gentle shadows, premium luxury product photography backdrop, empty surface, ultra high resolution, photorealistic",
  "Natural Texture": "Warm natural linen fabric texture on rustic light wood surface, soft warm side lighting, organic aesthetic, artisan product photography backdrop, empty surface, ultra high resolution, photorealistic",
  "Gradient Backdrop": "Smooth soft gradient background transitioning from white to pale blush pink, clean modern minimalist aesthetic, even soft lighting, airy product photography backdrop, ultra high resolution, photorealistic",
  "Lifestyle Context": "Beautiful modern kitchen countertop with soft natural window light, blurred background with plants and ceramics, lifestyle product photography setting, shallow depth of field, empty counter space in foreground, ultra high resolution, photorealistic",
  "Detail Close-up": "Extreme close-up macro photography background with soft bokeh, neutral tones, shallow depth of field, studio lighting with soft highlights, product detail photography backdrop, ultra high resolution, photorealistic",
  "Scale & Context": "Styled flat-lay arrangement surface with small complementary props (a ruler, a coin, dried flowers) on light neutral background, product scale reference photography, soft overhead lighting, ultra high resolution, photorealistic",
  "Dark & Moody": "Dark charcoal slate surface with dramatic side lighting, deep shadows, single warm rim light from right, luxury moody product photography backdrop, premium dark aesthetic, ultra high resolution, photorealistic",
  "Floating Levitation": "Product suspended mid-air defying gravity with soft diffused shadow on clean surface below, clean white gradient background, zero gravity editorial magic, premium surreal photography backdrop, ultra high resolution, photorealistic",
  "Mirror Reflection": "Perfectly reflective mirror surface creating crisp symmetrical reflection, dark gradient background for dramatic contrast, elegant high-end photography backdrop, sharp directional lighting, ultra high resolution, photorealistic",
  "Monochrome Color Block": "Bold single saturated coral color backdrop, flat even matte color background, Glossier-style pop art aesthetic, clean graphic high contrast product photography backdrop, ultra high resolution, photorealistic",
  "Geometric Pedestal": "Abstract geometric shapes cylinders arches and cubes in neutral cream and stone tones, architectural modern composition, soft directional shadows, museum display aesthetic, ultra high resolution, photorealistic",
  "Smoke & Mist": "Soft atmospheric fog and mist swirling on dark moody background, soft rim lighting through haze, mysterious premium cinematic atmosphere, product photography backdrop, ultra high resolution, photorealistic",
  "Hand-in-Shot": "Clean well-groomed hand presenting against neutral clean background, natural skin tones, soft directional lighting, lifestyle authenticity product photography, ultra high resolution, photorealistic",
  "Still Life Composition": "Artful arrangement of dried flowers natural stones draped fabric small ceramics on neutral surface, painterly editorial still life photography, warm side lighting, ultra high resolution, photorealistic",
  "Content Pour-out": "Product contents artfully spilling powder liquid cream texture across surface, macro-style detail, clean background, dramatic close-up lighting revealing texture, ultra high resolution, photorealistic",
  "Beach & Sand": "Natural sand surface with soft ocean light, warm coastal tones, gentle golden sunlight, small shells and driftwood, aspirational travel vacation context, ultra high resolution, photorealistic",
  "Gift & Unboxing": "Premium packaging tissue paper ribbon and quality box arranged as if being unwrapped, celebratory gift-giving atmosphere, soft warm lighting, unboxing experience product photography, ultra high resolution, photorealistic",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { workflow_id } = await req.json();
    if (!workflow_id) throw new Error("workflow_id is required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch workflow
    const { data: workflow, error: wfError } = await supabase
      .from("workflows")
      .select("*")
      .eq("id", workflow_id)
      .single();
    if (wfError || !workflow) throw new Error("Workflow not found");

    const config = workflow.generation_config as any;
    if (!config?.variation_strategy?.variations) throw new Error("No variations found in generation_config");

    const variations = config.variation_strategy.variations;
    const updatedVariations = [...variations];

    console.log(`Generating ${variations.length} scene previews for workflow ${workflow_id}`);

    for (let i = 0; i < variations.length; i++) {
      const v = variations[i];
      if (v.preview_url) {
        console.log(`Skipping ${v.label} (already has preview)`);
        continue;
      }
      const prompt = scenePreviewPrompts[v.label] || `Professional product photography background: ${v.instruction}, empty surface, no product, ultra high resolution, photorealistic`;

      console.log(`Generating preview ${i + 1}/${variations.length}: ${v.label}`);

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          modalities: ["image", "text"],
        }),
      });

      if (!response.ok) {
        console.error(`Failed to generate preview for ${v.label}: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      if (!imageUrl) {
        console.error(`No image returned for ${v.label}`);
        continue;
      }

      // Extract base64 data and upload to storage
      const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, "");
      const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

      const storagePath = `${workflow_id}/scene-${i}.png`;
      const { error: uploadError } = await supabase.storage
        .from("workflow-previews")
        .upload(storagePath, imageBytes, {
          contentType: "image/png",
          upsert: true,
        });

      if (uploadError) {
        console.error(`Upload failed for ${v.label}:`, uploadError);
        continue;
      }

      const { data: publicUrl } = supabase.storage
        .from("workflow-previews")
        .getPublicUrl(storagePath);

      updatedVariations[i] = {
        ...v,
        preview_url: publicUrl.publicUrl + "?t=" + Date.now(),
      };

      // Save progress after each image to avoid losing work on timeout
      const progressConfig = {
        ...config,
        variation_strategy: {
          ...config.variation_strategy,
          variations: updatedVariations,
        },
      };
      await supabase
        .from("workflows")
        .update({ generation_config: progressConfig })
        .eq("id", workflow_id);

      console.log(`✓ Preview generated and saved for ${v.label}`);
    }

    // Update the generation_config with preview URLs
    const updatedConfig = {
      ...config,
      variation_strategy: {
        ...config.variation_strategy,
        variations: updatedVariations,
      },
    };

    const { error: updateError } = await supabase
      .from("workflows")
      .update({ generation_config: updatedConfig })
      .eq("id", workflow_id);

    if (updateError) throw new Error(`Failed to update workflow: ${updateError.message}`);

    return new Response(JSON.stringify({ success: true, variations: updatedVariations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-scene-previews error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
