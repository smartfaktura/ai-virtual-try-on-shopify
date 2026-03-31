import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const WORKFLOW_ID = "92290edb-b537-45f9-a729-746749883214";

const stylePrompts: Record<string, string> = {
  "Modern Minimalist":
    "Professional interior design photography of a modern minimalist living room. Clean geometric lines, neutral whites and grays, sleek functional furniture, intentional negative space, large windows with natural light, polished concrete floor, single statement art piece. Shot on medium format camera, architectural digest quality, 1:1 square crop.",
  "Scandinavian":
    "Professional interior design photography of a Scandinavian style living room. Light natural oak wood floors, white walls, cozy wool throws on a light gray sofa, hygge atmosphere, soft ambient lighting, muted pastel accents, simple pendant lamp, indoor green plant. Bright airy feeling, architectural digest quality, 1:1 square crop.",
  "Japandi":
    "Professional interior design photography of a Japandi style bedroom. Japanese-Scandinavian fusion, wabi-sabi imperfection, natural wood and stone materials, earth tones, low-profile platform bed, minimal clutter, paper lantern pendant, bamboo accents, indoor bonsai plant. Serene and meditative, architectural digest quality, 1:1 square crop.",
  "Mid-Century Modern":
    "Professional interior design photography of a mid-century modern living room. Iconic retro furniture with tapered legs and organic curves, warm walnut wood, mustard yellow accent chair, teal throw pillow, statement arc floor lamp, clean functional 1960s design, geometric rug. Warm inviting light, architectural digest quality, 1:1 square crop.",
  "Industrial":
    "Professional interior design photography of an industrial loft living space. Exposed red brick wall, raw metal and iron shelving, dark moody tones, Edison bulb pendant lights, reclaimed wood coffee table, leather chesterfield sofa, concrete floor, large factory windows. Dramatic lighting, architectural digest quality, 1:1 square crop.",
  "Bohemian":
    "Professional interior design photography of a bohemian style living room. Layered Moroccan textiles and kilim patterns, abundant indoor plants, warm earthy tones with pops of terracotta and teal, rattan peacock chair, macramé wall hanging, floor cushions, hanging planters, eclectic collected decor. Warm golden light, architectural digest quality, 1:1 square crop.",
  "Coastal / Hampton":
    "Professional interior design photography of a coastal Hampton style living room. Light blues, crisp whites, sandy neutrals, natural jute rug, rattan accent chair, airy breezy atmosphere, white slipcovered sofa, weathered driftwood decor, sheer linen curtains, ocean view through windows. Bright sunlit, architectural digest quality, 1:1 square crop.",
  "Traditional / Classic":
    "Professional interior design photography of a traditional classic study. Elegant mahogany furnishings with ornate details, rich emerald velvet armchair, warm wood paneling, symmetrical arrangement, brass table lamp with cream shade, crown molding, built-in bookshelves, persian rug. Warm sophisticated lighting, architectural digest quality, 1:1 square crop.",
  "Farmhouse / Rustic":
    "Professional interior design photography of a farmhouse rustic kitchen-dining area. Reclaimed wood farmhouse table, distressed white chairs, warm cream and sage palette, shiplap accent wall, mason jar centerpiece, woven baskets, vintage pendant lights, comfortable inviting atmosphere. Warm natural light, architectural digest quality, 1:1 square crop.",
  "Contemporary Luxury":
    "Professional interior design photography of a contemporary luxury living room. White marble accent wall, brass and gold accents, statement designer curved sofa in cream, sculptural gold chandelier, premium cashmere throw, polished surfaces, large-scale abstract art, sophisticated minimalism. Dramatic glamorous lighting, architectural digest quality, 1:1 square crop.",
  "Art Deco":
    "Professional interior design photography of an art deco style lounge. Bold geometric sunburst patterns, jewel tones of emerald green and sapphire blue, gold lacquered surfaces, deep velvet tufted sofa, mirrored side table, crystal chandelier, opulent and theatrical atmosphere. Rich dramatic lighting, architectural digest quality, 1:1 square crop.",
  "Mediterranean":
    "Professional interior design photography of a Mediterranean style living room. Warm terracotta walls, arched alcove, wrought iron candle holders, mosaic tile accent, olive-toned textiles, rustic wood ceiling beams, terra-cotta pottery with greenery, warm inviting textured walls. Golden hour warm light, architectural digest quality, 1:1 square crop.",
  "Mediterranean Villa":
    "Professional exterior architecture photography of a Mediterranean villa. Terracotta roof tiles, warm sandstone facade, wrought iron balcony railings, mature olive trees, lavender garden beds, terracotta pot planters along stone pathway, arched pergola with climbing bougainvillea. Golden hour sunset light, architectural digest quality, 1:1 square crop.",
  "Tropical Resort":
    "Professional exterior architecture photography of a tropical resort entrance. Lush tropical landscaping, tall palm trees, bird of paradise flowers, teak and rattan outdoor lounge furniture, infinity pool edge visible, thatched roof cabana, vibrant tropical cushions, warm golden evening light. Luxury resort quality, 1:1 square crop.",
  "Modern Architectural":
    "Professional exterior architecture photography of a modern architectural home. Clean geometric concrete facade, steel and glass elements, minimalist outdoor furniture on a terrace, architectural uplighting, neutral gray tones, manicured low-maintenance landscaping, glass railings, reflecting pool. Blue hour twilight, architectural digest quality, 1:1 square crop.",
  "English Cottage Garden":
    "Professional exterior photography of an English cottage garden. Charming stone cottage with climbing roses, overflowing herbaceous borders, winding gravel path, rustic wooden gate, foxgloves and delphiniums, weathered stone wall, lush green lawn, bird bath. Soft morning light, country living quality, 1:1 square crop.",
  "Desert Contemporary":
    "Professional exterior architecture photography of a desert contemporary home. Adobe and concrete walls, desert landscaping with agave and prickly pear cacti, natural stone boulders, warm sand tones, covered outdoor living area with fire pit, dramatic mountain backdrop. Golden desert sunset light, architectural digest quality, 1:1 square crop.",
  "Desert Southwest":
    "Professional exterior architecture photography of a desert southwest home. Adobe and concrete walls, desert landscaping with agave and prickly pear cacti, natural stone boulders, warm sand tones, covered outdoor living area with fire pit, dramatic mountain backdrop. Golden desert sunset light, architectural digest quality, 1:1 square crop.",
  "Japanese Zen":
    "Professional exterior photography of a Japanese zen garden. Raked gravel patterns, carefully placed natural stones, moss-covered ground, pruned pine trees, wooden engawa veranda, bamboo fence, stone lantern, koi pond with stepping stones, minimalist serene atmosphere. Soft diffused light, architectural digest quality, 1:1 square crop.",
  "Japanese Zen Garden":
    "Professional exterior photography of a Japanese zen garden. Raked gravel patterns, carefully placed natural stones, moss-covered ground, pruned pine trees, wooden engawa veranda, bamboo fence, stone lantern, koi pond with stepping stones, minimalist serene atmosphere. Soft diffused light, architectural digest quality, 1:1 square crop.",
  "Rustic Mountain":
    "Professional exterior architecture photography of a rustic mountain lodge. Natural log and stone construction, large timber beams, wraparound covered porch with Adirondack chairs, pine tree forest backdrop, stone chimney with smoke, warm amber window glow, mountain vista. Crisp golden hour mountain light, architectural digest quality, 1:1 square crop.",
  "Rustic Mountain Lodge":
    "Professional exterior architecture photography of a rustic mountain lodge. Natural log and stone construction, large timber beams, wraparound covered porch with Adirondack chairs, pine tree forest backdrop, stone chimney with smoke, warm amber window glow, mountain vista. Crisp golden hour mountain light, architectural digest quality, 1:1 square crop.",
  "Coastal Beach House":
    "Professional exterior architecture photography of a coastal beach house. Weathered cedar shingle siding, white trim, large ocean-facing deck with teak furniture, dune grass landscaping, sandy path to beach, nautical rope railings, blue sky with wispy clouds. Bright coastal sunlight, architectural digest quality, 1:1 square crop.",
  "Urban Rooftop":
    "Professional exterior photography of an urban rooftop terrace. Modern planters with ornamental grasses, sleek outdoor sectional sofa, string lights overhead, city skyline panorama, concrete and wood decking, fire table centerpiece, bar cart, potted olive tree. Warm evening twilight with city lights, architectural digest quality, 1:1 square crop.",
  "Contemporary Urban":
    "Professional exterior photography of an urban rooftop terrace. Modern planters with ornamental grasses, sleek outdoor sectional sofa, string lights overhead, city skyline panorama, concrete and wood decking, fire table centerpiece, bar cart, potted olive tree. Warm evening twilight with city lights, architectural digest quality, 1:1 square crop.",
  "Classic Colonial":
    "Professional exterior architecture photography of a classic colonial home. Symmetrical white clapboard facade, black shutters, red front door, columned portico, brick pathway, mature shade trees, manicured boxwood hedges, American flag, white picket fence section. Bright clear day, architectural digest quality, 1:1 square crop.",
  "French Country Estate":
    "Professional exterior architecture photography of a French country estate. Limestone facade with blue-gray shutters, symmetrical windows, manicured formal garden with boxwood parterre, gravel courtyard, climbing roses on stone walls, wrought iron gate, lavender borders, terracotta roof. Warm afternoon golden light, architectural digest quality, 1:1 square crop.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Require Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 2. Verify JWT
    const supabaseAuth = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } }
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const userId = claimsData.claims.sub;

    // 3. Check admin role
    const { data: roleData } = await supabase
      .from("user_roles").select("role")
      .eq("user_id", userId).eq("role", "admin").maybeSingle();
    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    // Parse body - process a single index or batch of 3
    let batchSize = 3;
    let startFrom = 0;
    try {
      const body = await req.json();
      if (typeof body.start_from === "number") startFrom = body.start_from;
      if (typeof body.batch_size === "number") batchSize = Math.min(body.batch_size, 5);
    } catch { /* no body is fine */ }

    // Fetch current workflow
    const { data: workflow, error: wfErr } = await supabase
      .from("workflows")
      .select("generation_config")
      .eq("id", WORKFLOW_ID)
      .single();

    if (wfErr || !workflow) throw new Error("Workflow not found");

    const config = workflow.generation_config as any;
    const variations = config.variation_strategy.variations as any[];
    const results: { label: string; status: string; url?: string }[] = [];

    const endIdx = Math.min(startFrom + batchSize, variations.length);

    for (let idx = startFrom; idx < endIdx; idx++) {
      const v = variations[idx];
      const prompt = stylePrompts[v.label];
      if (!prompt) {
        results.push({ label: v.label, status: "skipped_no_prompt" });
        continue;
      }

      if (v.preview_url) {
        results.push({ label: v.label, status: "already_has_preview", url: v.preview_url });
        continue;
      }

      console.log(`[${idx + 1}/${variations.length}] Generating: ${v.label}...`);

      const aiResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gemini-3-pro-image-preview",
          messages: [{ role: "user", content: prompt }],
          modalities: ["image", "text"],
        }),
      });

      if (!aiResponse.ok) {
        const errText = await aiResponse.text();
        console.error(`AI error for ${v.label}:`, aiResponse.status, errText);
        results.push({ label: v.label, status: `ai_error_${aiResponse.status}` });
        continue;
      }

      const aiData = await aiResponse.json();
      const imageDataUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      if (!imageDataUrl) {
        results.push({ label: v.label, status: "no_image_returned" });
        continue;
      }

      const base64Data = imageDataUrl.replace(/^data:image\/\w+;base64,/, "");
      const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
      const mimeMatch = imageDataUrl.match(/^data:image\/(\w+);/);
      const ext = mimeMatch ? mimeMatch[1] : "png";
      const slug = v.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
      const fileName = `styles/${slug}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("landing-assets")
        .upload(fileName, imageBytes, {
          contentType: `image/${ext}`,
          upsert: true,
        });

      if (uploadErr) {
        console.error(`Upload error for ${v.label}:`, uploadErr);
        results.push({ label: v.label, status: "upload_failed" });
        continue;
      }

      const { data: publicUrlData } = supabase.storage
        .from("landing-assets")
        .getPublicUrl(fileName);

      variations[idx].preview_url = publicUrlData.publicUrl;
      results.push({ label: v.label, status: "success", url: publicUrlData.publicUrl });
      console.log(`✅ ${v.label}: ${publicUrlData.publicUrl}`);
    }

    // Save updated config
    config.variation_strategy.variations = variations;
    await supabase
      .from("workflows")
      .update({ generation_config: config })
      .eq("id", WORKFLOW_ID);

    const remaining = variations.length - endIdx;

    return new Response(
      JSON.stringify({
        completed: results.filter((r) => r.status === "success" || r.status === "already_has_preview").length,
        processed_range: `${startFrom}-${endIdx - 1}`,
        remaining,
        next_start_from: remaining > 0 ? endIdx : null,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-style-previews error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
