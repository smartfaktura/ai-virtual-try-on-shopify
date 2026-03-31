import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AssetSpec {
  path: string;
  prompt: string;
}

const ALL_ASSETS: AssetSpec[] = [
  // ── Pose images (6) ──
  {
    path: "poses/pose-lifestyle-gym.jpg",
    prompt:
      "Professional fashion photography of a fit young woman in stylish athletic wear doing a confident pose inside a modern gym with equipment softly blurred in background. Natural lighting from large windows, 85mm lens, shallow depth of field, editorial quality, ultra high resolution",
  },
  {
    path: "poses/pose-streetwear-shopping.jpg",
    prompt:
      "Fashion editorial photo of a stylish young woman carrying shopping bags walking through a trendy shopping district with boutique storefronts. Wearing contemporary streetwear, golden hour light, 50mm lens street photography style, ultra high resolution",
  },
  {
    path: "poses/pose-lifestyle-resort.jpg",
    prompt:
      "Luxury resort fashion photography of a beautiful woman in elegant resort wear standing by a turquoise infinity pool overlooking the ocean. Tropical setting, warm natural light, 70mm lens, magazine quality, ultra high resolution",
  },
  {
    path: "poses/pose-editorial-gallery.jpg",
    prompt:
      "High-fashion editorial photograph of a woman in a contemporary art gallery, standing confidently in front of large abstract paintings on white walls. Minimalist gallery setting, controlled directional lighting, 85mm lens, Vogue editorial style, ultra high resolution",
  },
  {
    path: "poses/pose-lifestyle-autumn.jpg",
    prompt:
      "Fashion lifestyle photograph of a woman in cozy autumn layers walking through a park with golden and red fallen leaves. Warm autumn afternoon light filtering through trees, 50mm lens, natural candid feel, ultra high resolution",
  },
  {
    path: "poses/pose-editorial-warehouse.jpg",
    prompt:
      "Edgy fashion editorial of a woman in a converted industrial warehouse loft with exposed brick walls and steel beams. Dramatic directional lighting from large industrial windows, moody atmosphere, 35mm lens, high fashion style, ultra high resolution",
  },
  // ── Scene environment images (13) ──
  {
    path: "scenes/scene-shadow-play.jpg",
    prompt:
      "Minimalist product photography surface with strong directional shadows from window blinds creating geometric striped shadow patterns on a clean white surface. No products visible, just the empty surface ready for product placement. Studio lighting, ultra high resolution",
  },
  {
    path: "scenes/scene-color-backdrop.jpg",
    prompt:
      "Solid vibrant coral-pink colored backdrop for product photography, smooth matte finish with very subtle gradient, clean and professional. Empty surface, no products. Studio lighting, ultra high resolution",
  },
  {
    path: "scenes/scene-linen-textile.jpg",
    prompt:
      "Close-up of natural beige linen fabric texture as a product photography background. Soft wrinkled linen surface with warm natural light, gentle folds creating depth. No products, just the fabric surface. Ultra high resolution",
  },
  {
    path: "scenes/scene-terrazzo.jpg",
    prompt:
      "Terrazzo surface with colorful stone chips in white cement as a product photography backdrop. Overhead view of the polished terrazzo texture in pastel tones. No products, empty surface. Natural light, ultra high resolution",
  },
  {
    path: "scenes/scene-brunch-table.jpg",
    prompt:
      "Aesthetic brunch table setting from above with empty center space for product placement. Surrounding elements include coffee cups, fresh pastries, flowers, ceramic plates on a marble table. Warm morning light, lifestyle photography, ultra high resolution",
  },
  {
    path: "scenes/scene-midcentury-console.jpg",
    prompt:
      "Mid-century modern wooden console table top with empty space for product placement. Walnut wood grain visible, minimalist styling with a small plant and book stack to the side. Warm ambient interior lighting, ultra high resolution",
  },
  {
    path: "scenes/scene-window-sill.jpg",
    prompt:
      "White painted window sill with soft natural daylight streaming in. Empty sill surface ready for product placement with sheer curtain slightly visible. Outside view is blurred green garden. Airy, bright, Scandinavian interior feel, ultra high resolution",
  },
  {
    path: "scenes/scene-spa-towels.jpg",
    prompt:
      "Luxurious spa setting with fluffy white rolled towels, bamboo elements, and smooth river stones. Empty center space on a wooden surface for product placement. Soft warm spa lighting, zen atmosphere, ultra high resolution",
  },
  {
    path: "scenes/scene-glass-shelf.jpg",
    prompt:
      "Modern glass shelf with chrome brackets against a clean white wall. Empty glass surface ready for product display. Soft studio lighting creating subtle reflections on the glass, minimalist retail display feel, ultra high resolution",
  },
  {
    path: "scenes/scene-tropical-leaves.jpg",
    prompt:
      "Tropical monstera and palm leaves arranged as a flat lay border around empty center space on a white surface. Fresh green botanical leaves with water droplets, overhead shot, natural daylight, ultra high resolution",
  },
  {
    path: "scenes/scene-dried-flowers.jpg",
    prompt:
      "Dried flower arrangement with pampas grass, dried roses, and eucalyptus branches on a cream linen surface. Soft muted tones, empty center space for product placement, overhead view, warm natural light, ultra high resolution",
  },
  {
    path: "scenes/scene-beach-sand.jpg",
    prompt:
      "Natural beach sand surface texture as a product photography backdrop. Fine golden sand with gentle ripple patterns, small seashells scattered at edges. Bright natural sunlight, overhead view, empty center for product, ultra high resolution",
  },
  {
    path: "scenes/scene-stone-path.jpg",
    prompt:
      "Natural stone pathway surface with smooth river stones in warm gray and beige tones. Top-down view of the textured stone surface with small green moss between stones. Natural outdoor daylight, ultra high resolution",
  },
  // ── New model portraits (050–054, kept) ──
  {
    path: "models/model-050-hannah.jpg",
    prompt:
      "Professional headshot portrait of a slim young American woman in her early 20s with long straight blonde hair, blue eyes, warm natural smile, light sun-kissed skin. Perfectly centered head-and-shoulders composition, symmetrical framing, 85mm lens aesthetic with sharp focus on the face, minimalist light gray background, natural skin texture, professional studio lighting, ultra high resolution",
  },
  {
    path: "models/model-051-jordan.jpg",
    prompt:
      "Professional headshot portrait of a young athletic African American man in his mid 20s with a short fade haircut, strong jawline, confident warm expression, dark brown skin. Perfectly centered head-and-shoulders composition, symmetrical framing, 85mm lens aesthetic with sharp focus on the face, minimalist light gray background, natural skin texture, professional studio lighting, ultra high resolution",
  },
  {
    path: "models/model-052-emma.jpg",
    prompt:
      "Professional headshot portrait of an average-build American woman in her late 20s with shoulder-length wavy brown hair, hazel eyes, friendly approachable smile, warm skin tone. Perfectly centered head-and-shoulders composition, symmetrical framing, 85mm lens aesthetic with sharp focus on the face, minimalist light gray background, natural skin texture, professional studio lighting, ultra high resolution",
  },
  {
    path: "models/model-054-natalie.jpg",
    prompt:
      "Professional headshot portrait of an athletic mixed-race American woman in her mid 20s with curly dark brown hair, light brown skin, green-brown eyes, radiant smile. Perfectly centered head-and-shoulders composition, symmetrical framing, 85mm lens aesthetic with sharp focus on the face, minimalist light gray background, natural skin texture, professional studio lighting, ultra high resolution",
  },
  // ── Regenerated previews ──
  {
    path: "models/model-female-mature-european.jpg",
    prompt:
      "Professional headshot portrait of an elegant slim European woman in her late 40s with shoulder-length blonde hair styled elegantly, blue-gray eyes, refined composed expression, high cheekbones, graceful aging with natural beauty. Perfectly centered head-and-shoulders composition, symmetrical framing, 85mm lens aesthetic with sharp focus on the face, minimalist light gray background, natural skin texture, professional studio lighting, ultra high resolution",
  },
  {
    path: "models/model-male-athletic-japanese.jpg",
    prompt:
      "Professional headshot portrait of an athletic Japanese man in his late 20s with short styled black hair, clean-shaven, defined jawline, warm confident expression, light olive skin. Perfectly centered head-and-shoulders composition, symmetrical framing, 85mm lens aesthetic with sharp focus on the face, minimalist light gray background, natural skin texture, professional studio lighting, ultra high resolution",
  },
  {
    path: "models/model-male-slim-indian.jpg",
    prompt:
      "Professional headshot portrait of a slim South Asian Indian man in his early 30s with short neatly groomed dark hair, warm brown skin, kind intelligent expression, light stubble. Perfectly centered head-and-shoulders composition, symmetrical framing, 85mm lens aesthetic with sharp focus on the face, minimalist light gray background, natural skin texture, professional studio lighting, ultra high resolution",
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("GEMINI_API_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;

    // Admin check
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { start_index = 0, batch_size = 2 } = await req.json();

    const batch = ALL_ASSETS.slice(start_index, start_index + batch_size);
    if (batch.length === 0) {
      return new Response(
        JSON.stringify({
          completed: true,
          total: ALL_ASSETS.length,
          message: "All assets already generated",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: { path: string; success: boolean; error?: string }[] = [];

    for (const asset of batch) {
      try {
        console.log(`[GENERATE-ASSET] Generating: ${asset.path}`);

        const aiResponse = await fetch(
          "https://ai.gateway.lovable.dev/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${lovableApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-3-pro-image-preview",
              messages: [
                {
                  role: "user",
                  content: asset.prompt,
                },
              ],
              modalities: ["image", "text"],
            }),
          }
        );

        if (!aiResponse.ok) {
          const errText = await aiResponse.text();
          console.error(`[GENERATE-ASSET] AI error for ${asset.path}:`, errText);
          results.push({ path: asset.path, success: false, error: `AI error: ${aiResponse.status}` });
          continue;
        }

        const aiData = await aiResponse.json();
        const imageUrl =
          aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

        if (!imageUrl || !imageUrl.startsWith("data:image")) {
          console.error(`[GENERATE-ASSET] No image in response for ${asset.path}`);
          results.push({ path: asset.path, success: false, error: "No image in AI response" });
          continue;
        }

        // Convert base64 to Uint8Array
        const base64Data = imageUrl.split(",")[1];
        const binaryStr = atob(base64Data);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }

        // Determine content type from data URL
        const mimeMatch = imageUrl.match(/data:(image\/[^;]+)/);
        const contentType = mimeMatch ? mimeMatch[1] : "image/jpeg";

        // Upload to landing-assets bucket
        const { error: uploadError } = await adminClient.storage
          .from("landing-assets")
          .upload(asset.path, bytes, {
            contentType,
            upsert: true,
          });

        if (uploadError) {
          console.error(`[GENERATE-ASSET] Upload error for ${asset.path}:`, uploadError);
          results.push({ path: asset.path, success: false, error: uploadError.message });
          continue;
        }

        console.log(`[GENERATE-ASSET] Successfully generated and uploaded: ${asset.path}`);
        results.push({ path: asset.path, success: true });
      } catch (err) {
        console.error(`[GENERATE-ASSET] Error processing ${asset.path}:`, err);
        results.push({
          path: asset.path,
          success: false,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    const nextIndex = start_index + batch_size;
    const completed = nextIndex >= ALL_ASSETS.length;

    return new Response(
      JSON.stringify({
        results,
        next_index: completed ? null : nextIndex,
        total: ALL_ASSETS.length,
        processed: Math.min(nextIndex, ALL_ASSETS.length),
        completed,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[GENERATE-ASSET] Fatal error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
