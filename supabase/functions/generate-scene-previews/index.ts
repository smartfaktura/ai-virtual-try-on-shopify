import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MASTER_SUFFIX = "luxury brand campaign style, clean modern composition, premium minimal aesthetic, soft natural but controlled studio lighting, diffused key light with subtle directional shadows, high dynamic range, realistic materials and textures, sharp product focus with shallow depth of field (85mm lens look), professional color grading, cinematic but natural tones, elegant negative space, perfectly balanced framing, hyper-detailed packaging texture, realistic reflections and soft highlights, global skincare / wellness / lifestyle advertising quality, photorealistic, 8k resolution, magazine editorial quality, refined, sophisticated, premium brand identity";

// Scene-specific prompts with showcase products for preview generation
const scenePreviewPrompts: Record<string, string> = {
  "Hero White": `Ultra high-end commercial product photography of a luxury designer leather handbag in rich cognac brown on a seamless pure white studio background, ${MASTER_SUFFIX}, NO studio lights visible in corners, NO lighting equipment visible, completely clean white backdrop`,
  "Soft Gray Infinity": `Ultra high-end commercial product photography of a premium hyaluronic acid serum in a frosted glass dropper bottle on a seamless soft gray infinity sweep background, ${MASTER_SUFFIX}, smooth continuous gray backdrop with no visible horizon line`,
  "Gradient Glow": `Ultra high-end commercial product photography of a rose gold moisturizer jar and matching toner bottle arranged together on a smooth gradient background transitioning from white to pale blush pink, ${MASTER_SUFFIX}, soft ethereal glow, beauty and skincare aesthetic`,
  "Shadow Play": `Ultra high-end commercial product photography of a designer crystal-faceted perfume bottle with dramatic hard directional shadows creating bold geometric shadow patterns on a light neutral surface, ${MASTER_SUFFIX}, strong contrast between light and shadow, architectural shadow play`,
  "Dark & Moody": `Ultra high-end commercial product photography of a premium black leather bifold wallet on a dark charcoal slate surface with dramatic side lighting and a single warm rim light from the right, ${MASTER_SUFFIX}, deep rich shadows, moody luxury aesthetic, dark premium background`,
  "White Marble": `Ultra high-end commercial product photography of a stainless steel automatic watch with a white dial on an elegant white and gray marble surface with subtle natural veining, ${MASTER_SUFFIX}, luxury timepiece on premium marble slab`,
  "Raw Concrete": `Ultra high-end commercial product photography of a pair of hex dumbbells and resistance bands arranged on a raw industrial concrete surface, ${MASTER_SUFFIX}, rugged textured concrete backdrop, fitness gear aesthetic, strong and industrial mood`,
  "Warm Wood Grain": `Ultra high-end commercial product photography of an artisan ceramic tea set with a bamboo tray on a warm natural oak wood grain surface, ${MASTER_SUFFIX}, organic warmth, eco-friendly aesthetic, natural tones`,
  "Linen & Fabric": `Ultra high-end commercial product photography of a facial oil bottle and cream jar duo arranged on soft draped natural linen fabric, ${MASTER_SUFFIX}, organic texture, soft and tactile skincare aesthetic`,
  "Terrazzo Stone": `Ultra high-end commercial product photography of colorful wooden stacking toy blocks arranged on a speckled terrazzo stone surface, ${MASTER_SUFFIX}, playful yet premium, kids product on sophisticated surface`,
  "Bathroom Shelf": `Ultra high-end commercial product photography of a facial cleanser bottle and toner on a styled white bathroom shelf with small plants and a folded towel in the background, ${MASTER_SUFFIX}, lifestyle bathroom context, beauty and skincare setting`,
  "Kitchen Counter": `Ultra high-end commercial product photography of premium stainless steel cookware with copper accents on a clean modern kitchen countertop with soft natural window light, ${MASTER_SUFFIX}, lifestyle kitchen context, culinary luxury`,
  "Vanity Table": `Ultra high-end commercial product photography of a velvet jewelry organizer displaying gold necklaces and rings on a beauty vanity table with a round mirror and soft warm lighting, ${MASTER_SUFFIX}, feminine luxury, jewelry display aesthetic`,
  "Office Desk": `Ultra high-end commercial product photography of a space gray premium laptop on a minimal modern workspace desk with a small plant and coffee cup, ${MASTER_SUFFIX}, clean professional office aesthetic, tech product lifestyle`,
  "Bedside Table": `Ultra high-end commercial product photography of a navy silk sleep mask on a cozy bedroom nightstand with a small lamp and book, ${MASTER_SUFFIX}, serene bedroom lifestyle context, sleep and wellness aesthetic`,
  "Botanical Garden": `Ultra high-end commercial product photography of a copper watering can and pruning shears arranged among lush green plants and ferns, ${MASTER_SUFFIX}, botanical garden setting, garden equipment surrounded by greenery`,
  "Water Splash": `Ultra high-end commercial product photography of an electric blue energy drink can surrounded by an explosive burst of crystal-clear water filling the entire frame, dramatic water splashes erupting from behind and around the product, large droplets and streams of water frozen in mid-air, water cascading across the surface, ${MASTER_SUFFIX}, high-speed editorial water photography, powerful dynamic energy, refreshing and immersive aquatic mood`,
  "Golden Hour": `Ultra high-end commercial product photography of white and neon orange running shoes on a textured surface with warm golden hour sunset lighting casting long soft shadows, ${MASTER_SUFFIX}, active lifestyle golden warm tones, outdoor athletic aesthetic`,
  "Neon Accent": `Ultra high-end commercial product photography of a matte black RGB gaming mouse on a dark reflective surface bathed in vivid neon cyan and magenta light rays streaming across the entire background, glowing neon streaks and light trails reflecting off the product surface and surrounding area, full neon atmosphere with color spill on every surface, ${MASTER_SUFFIX}, immersive neon-drenched dark scene, cyberpunk gaming tech editorial aesthetic`,
  "Flat Lay Overhead": `Ultra high-end commercial product photography of a complete skincare routine collection including cleanser serum moisturizer and eye cream bottles arranged in a top-down flat lay composition on a neutral surface with small dried flowers, ${MASTER_SUFFIX}, overhead perspective, editorial flat lay arrangement`,
  "Floating Levitation": `Ultra high-end commercial product photography of a designer perfume bottle suspended mid-air defying gravity with a soft diffused shadow on a clean surface below and a clean white gradient background, ${MASTER_SUFFIX}, zero gravity surreal editorial magic`,
  "Mirror Reflection": `Ultra high-end commercial product photography of a black wool baseball cap on a perfectly reflective mirror surface creating a crisp symmetrical reflection with a dark gradient background, ${MASTER_SUFFIX}, dramatic mirror reflection, high contrast elegance`,
  "Monochrome Color Block": `Ultra high-end commercial product photography of a premium shoe care kit including brush polish and cloth on a bold matte olive green monochrome backdrop, ${MASTER_SUFFIX}, single saturated olive tone background, graphic color block aesthetic`,
  "Geometric Pedestal": `Ultra high-end commercial product photography of a crystal perfume bottle displayed on abstract geometric shapes including cream stone cylinders and arches, ${MASTER_SUFFIX}, architectural modern museum display aesthetic, sculptural composition`,
  "Smoke & Mist": `Ultra high-end commercial product photography of a charcoal hard-shell suitcase surrounded by soft atmospheric fog and mist swirling on a dark moody background with soft rim lighting through haze, ${MASTER_SUFFIX}, mysterious cinematic atmosphere, premium travel aesthetic`,
  "Hand-in-Shot": `Ultra high-end commercial product photography of a delicate gold chain bracelet being presented by a clean well-groomed hand against a neutral clean background, ${MASTER_SUFFIX}, natural skin tones, lifestyle authenticity, jewelry close-up`,
  "Still Life Composition": `Ultra high-end commercial product photography of a premium hardcover book arranged in an artful still life composition with dried flowers natural stones and draped fabric, ${MASTER_SUFFIX}, painterly editorial still life, warm side lighting, curated props`,
  "Content Pour-out": `Ultra high-end commercial product photography of a hydrating face cream jar with the rich cream visibly spilling and flowing out of the jar across the surface in a macro close-up, ${MASTER_SUFFIX}, texture detail, product contents artfully displayed`,
  "Beach & Sand": `Ultra high-end commercial product photography of woven jute espadrille sandals placed directly on natural golden beach sand with gentle ocean waves lapping nearby in the background, scattered seashells and small pieces of driftwood around the product, warm coastal golden hour sunlight casting soft long shadows, ${MASTER_SUFFIX}, immersive beach setting, aspirational summer vacation coastal editorial`,
  "Gift & Unboxing": `Ultra high-end commercial product photography of burgundy merino wool socks mid-unbox from a premium matte gift box with the lid partially lifted, delicate tissue paper spilling out, satin ribbon draped across the surface, visible wrapping details and gift tag, ${MASTER_SUFFIX}, celebratory premium gift-giving unboxing experience, warm cozy editorial aesthetic`,

  // Mirror Selfie Set scenes
  "Bedroom Full-Length": `Photorealistic mirror selfie of a young woman in a stylish outfit standing in front of a full-length floor mirror in a modern bedroom, holding smartphone at chest level capturing reflection, natural daylight through sheer curtains, warm wood floors, bed visible in background, iPhone quality, Instagram aesthetic, 4:5 portrait, ${MASTER_SUFFIX}`,
  "Bathroom Vanity": `Photorealistic mirror selfie of a young woman in front of a large bathroom vanity mirror, holding smartphone capturing reflection, warm overhead vanity lighting, marble countertop and subway tile walls visible, sleek modern bathroom, iPhone quality, Instagram aesthetic, 4:5 portrait, ${MASTER_SUFFIX}`,
  "Boutique Fitting Room": `Photorealistic mirror selfie of a young woman in a boutique fitting room, standing in front of a full-length mirror, holding smartphone at chest level, bright even flattering retail lighting, clean neutral walls, professional retail environment, iPhone quality, Instagram aesthetic, 4:5 portrait, ${MASTER_SUFFIX}`,
  "Elevator / Lobby": `Photorealistic mirror selfie of a young woman reflected in polished elevator doors in a modern building lobby, holding smartphone capturing reflection, moody ambient lighting with warm elevator ceiling lights, polished metal and marble surfaces, urban sophisticated aesthetic, iPhone quality, Instagram aesthetic, 4:5 portrait, ${MASTER_SUFFIX}`,
  "Gym Mirror": `Photorealistic mirror selfie of a young woman in athletic wear standing in front of a gym wall mirror, holding smartphone capturing reflection, bright overhead LED lights, gym equipment subtly visible in background, rubber flooring, energetic fitness atmosphere, iPhone quality, Instagram aesthetic, 4:5 portrait, ${MASTER_SUFFIX}`,
  "Hotel Room": `Photorealistic mirror selfie of a young woman in a luxury hotel room standing in front of a full-length mirror, holding smartphone capturing reflection, warm ambient lighting from bedside lamps, elegant decor with plush bedding visible, travel lifestyle aesthetic, iPhone quality, Instagram aesthetic, 4:5 portrait, ${MASTER_SUFFIX}`,
  "Walk-in Closet": `Photorealistic mirror selfie of a young woman inside a spacious walk-in closet standing in front of a mirror, holding smartphone capturing reflection, soft warm recessed lighting, organized clothing racks and shoes visible around mirror, aspirational wardrobe aesthetic, iPhone quality, Instagram aesthetic, 4:5 portrait, ${MASTER_SUFFIX}`,
  "Minimalist Hallway": `Photorealistic mirror selfie of a young woman standing in front of a tall standing mirror in a clean minimalist hallway, holding smartphone capturing reflection, natural light from nearby window, hardwood floors, white walls with minimal decor, Scandinavian aesthetic, iPhone quality, Instagram aesthetic, 4:5 portrait, ${MASTER_SUFFIX}`,
  "Coffee Shop Window": `Photorealistic mirror selfie of a young woman reflected in a coffee shop window from inside, holding smartphone capturing reflection, warm interior with exposed brick, coffee cup on table nearby, cozy urban cafe atmosphere, iPhone quality, Instagram aesthetic, 4:5 portrait, ${MASTER_SUFFIX}`,
  "Car Side Mirror": `Photorealistic mirror selfie of a young woman visible in a car side mirror or window reflection, holding smartphone capturing reflection, outdoor scenery behind, natural daylight, casual spontaneous vibe, urban on-the-go aesthetic, iPhone quality, Instagram aesthetic, 4:5 portrait, ${MASTER_SUFFIX}`,
  "Rooftop Terrace": `Photorealistic mirror selfie of a young woman reflected in a glass door on a rooftop terrace, holding smartphone capturing reflection, city skyline visible behind, golden hour lighting, potted plants and outdoor furniture nearby, aspirational urban lifestyle, iPhone quality, Instagram aesthetic, 4:5 portrait, ${MASTER_SUFFIX}`,
  "Pool / Resort": `Photorealistic mirror selfie of a young woman reflected in poolside glass at a tropical resort, holding smartphone capturing reflection, crystal blue pool water visible, palm trees and lush greenery, golden warm sunlight, vacation lifestyle aesthetic, iPhone quality, Instagram aesthetic, 4:5 portrait, ${MASTER_SUFFIX}`,
  "Art Gallery": `Photorealistic mirror selfie of a young woman standing in front of a large mirror in a contemporary art gallery, holding smartphone capturing reflection, clean white walls, professional gallery track lighting, polished floors, sophisticated cultural aesthetic, iPhone quality, Instagram aesthetic, 4:5 portrait, ${MASTER_SUFFIX}`,
  "Hair Salon": `Photorealistic mirror selfie of a young woman sitting at a salon mirror with styling station visible, holding smartphone capturing reflection, professional ring lights or vanity bulbs around mirror frame, hair products on counter, flattering beauty lighting, iPhone quality, Instagram aesthetic, 4:5 portrait, ${MASTER_SUFFIX}`,
  "Vintage Shop": `Photorealistic mirror selfie of a young woman standing in front of an ornate antique mirror in a vintage thrift shop, holding smartphone capturing reflection, eclectic decor with vintage clothing racks, warm Edison bulb lighting, nostalgic treasure-hunt atmosphere, iPhone quality, Instagram aesthetic, 4:5 portrait, ${MASTER_SUFFIX}`,
  "Studio Apartment": `Photorealistic mirror selfie of a young woman standing in front of a full-length mirror in a cozy studio apartment, holding smartphone capturing reflection, warm window light streaming in, plant on windowsill, books stacked nearby, intimate authentic living space aesthetic, iPhone quality, Instagram aesthetic, 4:5 portrait, ${MASTER_SUFFIX}`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { workflow_id, force_regenerate } = await req.json();
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

    let variations = config.variation_strategy.variations;

    // If force_regenerate, clear all preview_urls first so subsequent calls skip completed ones
    if (force_regenerate) {
      const needsClearing = variations.some((v: any) => v.preview_url);
      if (needsClearing) {
        variations = variations.map((v: any) => ({ ...v, preview_url: null }));
        const clearedConfig = {
          ...config,
          variation_strategy: { ...config.variation_strategy, variations },
        };
        await supabase.from("workflows").update({ generation_config: clearedConfig }).eq("id", workflow_id);
        console.log("Cleared all existing preview URLs for force regeneration");
      }
    }

    const updatedVariations = [...variations];

    console.log(`Generating ${variations.length} scene previews for workflow ${workflow_id} (force=${!!force_regenerate})`);

    for (let i = 0; i < variations.length; i++) {
      const v = variations[i];
      if (v.preview_url) {
        console.log(`Skipping ${v.label} (already has preview)`);
        continue;
      }
      const prompt = scenePreviewPrompts[v.label] || `Ultra high-end commercial product photography in a ${v.label} setting, ${v.instruction}, ${MASTER_SUFFIX}`;

      console.log(`Generating preview ${i + 1}/${variations.length}: ${v.label}`);

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-pro-image-preview",
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
