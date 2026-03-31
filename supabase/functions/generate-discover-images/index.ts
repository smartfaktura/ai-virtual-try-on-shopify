import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ImageSpec {
  title: string;
  category: string;
  tags: string[];
  prompt: string;
}

const IMAGES: ImageSpec[] = [
  {
    title: "Midnight Leather Jacket Editorial",
    category: "editorial",
    tags: ["leather", "menswear", "urban", "night"],
    prompt:
      "Hyperrealistic fashion editorial photograph of a confident 28-year-old male model with sharp jawline and short dark hair, wearing a perfectly fitted black leather biker jacket over a white crew-neck tee, standing in a moody rain-slicked urban alley at night. Neon reflections shimmer on wet cobblestones, cinematic blue-orange color grading, shot on Phase One IQ4 150MP, 85mm f/1.4, shallow depth of field, dramatic rim lighting from a distant streetlamp, ultra high resolution.",
  },
  {
    title: "Summer Linen Dress Collection",
    category: "lifestyle",
    tags: ["linen", "womenswear", "summer", "mediterranean"],
    prompt:
      "Hyperrealistic lifestyle fashion photograph of an elegant 25-year-old woman with sun-kissed skin and flowing brown hair, wearing an airy ivory linen midi dress with delicate shoulder ties, standing on a sun-drenched Mediterranean stone terrace overlooking turquoise sea. Bougainvillea climbing white-washed walls, warm golden hour sunlight, shot on Phase One IQ4 150MP, 85mm f/1.4, soft bokeh background, natural wind catching the fabric, luminous airy high-key aesthetic, ultra high resolution.",
  },
  {
    title: "Precision Timepiece Campaign",
    category: "commercial",
    tags: ["watch", "luxury", "menswear", "accessories"],
    prompt:
      "Hyperrealistic commercial product photograph of a handsome 35-year-old man's wrist resting on a polished Calacatta marble desk, showcasing a premium stainless-steel chronograph watch with dark blue dial. Warm directional tungsten lighting creating elegant shadow play, shallow depth of field isolating the watch face, crisp metallic reflections, shot on Phase One IQ4 150MP, 90mm macro f/2.8, luxury brand campaign aesthetic, ultra high resolution.",
  },
  {
    title: "Athleisure in Motion",
    category: "lifestyle",
    tags: ["athleisure", "womenswear", "fitness", "activewear"],
    prompt:
      "Hyperrealistic athletic lifestyle photograph of a fit 26-year-old woman with a high ponytail, wearing a matching sage-green sports bra and high-waisted leggings set, captured mid-stride in a modern minimalist gym with floor-to-ceiling windows flooding the space with bright natural daylight. Polished concrete floors, subtle motion blur on trailing foot, shot on Phase One IQ4 150MP, 70mm f/2.0, clean bright commercial aesthetic, energetic composition, ultra high resolution.",
  },
  {
    title: "Tailored Wool Overcoat",
    category: "editorial",
    tags: ["overcoat", "menswear", "winter", "tailoring"],
    prompt:
      "Hyperrealistic editorial photograph of a distinguished 32-year-old male model with light stubble, wearing a perfectly tailored camel wool overcoat over a charcoal turtleneck, walking across a foggy London bridge at dawn. Misty Thames river backdrop, soft diffused morning light, muted cool tones with warm coat as focal point, shot on Phase One IQ4 150MP, 85mm f/1.4, atmospheric depth, cinematic composition, ultra high resolution.",
  },
  {
    title: "Silk Evening Gown",
    category: "editorial",
    tags: ["gown", "womenswear", "evening", "luxury"],
    prompt:
      "Hyperrealistic high-fashion editorial photograph of a stunning 27-year-old woman with an elegant updo and minimal gold jewelry, wearing a floor-length burgundy silk charmeuse evening gown with a subtle cowl neckline, posed on a grand marble staircase beneath a crystal chandelier. Rich warm lighting, the silk fabric catching light with luminous sheen, shot on Phase One IQ4 150MP, 85mm f/1.4, Vogue editorial quality, dramatic elegance, ultra high resolution.",
  },
  {
    title: "Premium Sneaker Drop",
    category: "streetwear",
    tags: ["sneakers", "menswear", "streetwear", "footwear"],
    prompt:
      "Hyperrealistic streetwear photograph of a stylish 24-year-old man sitting on a concrete ledge at a skatepark during golden hour, wearing vintage-wash baggy jeans and pristine white-and-forest-green high-top leather sneakers as the hero product. Warm golden backlight creating a halo effect, concrete textures and graffiti softly blurred, shot on Phase One IQ4 150MP, 50mm f/1.8, low angle emphasizing the sneakers, vibrant street culture energy, ultra high resolution.",
  },
  {
    title: "Cashmere Knitwear Story",
    category: "lifestyle",
    tags: ["cashmere", "womenswear", "knitwear", "cozy"],
    prompt:
      "Hyperrealistic cozy lifestyle photograph of a beautiful 29-year-old woman with loose wavy auburn hair, wearing an oversized cream cashmere turtleneck sweater, sitting curled up in a rustic cabin interior beside a crackling stone fireplace. Warm amber firelight casting soft shadows, a ceramic mug nearby, wooden textures and sheepskin throw, shot on Phase One IQ4 150MP, 85mm f/1.4, intimate warmth, hygge atmosphere, ultra high resolution.",
  },
  {
    title: "Structured Handbag Campaign",
    category: "commercial",
    tags: ["handbag", "womenswear", "accessories", "luxury"],
    prompt:
      "Hyperrealistic luxury commercial photograph of an elegant 30-year-old woman's hand gracefully holding a structured cognac-brown leather top-handle handbag with gold hardware, set against a clean cream studio backdrop with soft directional shadow play. Minimalist composition, the leather grain and stitching in razor-sharp detail, warm neutral color palette, shot on Phase One IQ4 150MP, 90mm f/2.0, premium brand campaign quality, ultra high resolution.",
  },
  {
    title: "Denim Workwear Heritage",
    category: "commercial",
    tags: ["denim", "menswear", "workwear", "heritage"],
    prompt:
      "Hyperrealistic heritage workwear photograph of a rugged 33-year-old man with a short beard, wearing raw selvedge indigo denim jeans with visible chain-stitch hemming paired with a chambray work shirt, standing in an industrial woodworking workshop. Warm tungsten overhead lighting, sawdust particles catching light, vintage tools and timber in soft background, shot on Phase One IQ4 150MP, 85mm f/1.4, authentic artisanal mood, ultra high resolution.",
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    // Verify user
    const userClient = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } =
      await userClient.auth.getClaims(token);
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
    const batch = IMAGES.slice(start_index, start_index + batch_size);

    if (batch.length === 0) {
      return new Response(
        JSON.stringify({ completed: true, total: IMAGES.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get current max sort_order
    const { data: maxRow } = await adminClient
      .from("discover_presets")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    let nextSort = (maxRow?.sort_order ?? 0) + 1;

    const results: { title: string; success: boolean; error?: string }[] = [];

    for (const img of batch) {
      try {
        console.log(`[DISCOVER-IMG] Generating: ${img.title}`);

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
              messages: [{ role: "user", content: img.prompt }],
              modalities: ["image", "text"],
            }),
          }
        );

        if (!aiResponse.ok) {
          const errText = await aiResponse.text();
          console.error(`[DISCOVER-IMG] AI error:`, errText);
          results.push({
            title: img.title,
            success: false,
            error: `AI ${aiResponse.status}`,
          });
          continue;
        }

        const aiData = await aiResponse.json();
        const imageUrl =
          aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

        if (!imageUrl || !imageUrl.startsWith("data:image")) {
          results.push({
            title: img.title,
            success: false,
            error: "No image in response",
          });
          continue;
        }

        // Decode and upload
        const base64Data = imageUrl.split(",")[1];
        const binaryStr = atob(base64Data);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        const ext = "png";
        const contentType = "image/png";

        const storagePath = `discover/${Date.now()}-${img.title.toLowerCase().replace(/\s+/g, "-")}.${ext}`;

        const { error: uploadError } = await adminClient.storage
          .from("freestyle-images")
          .upload(storagePath, bytes, { contentType, upsert: true });

        if (uploadError) {
          results.push({
            title: img.title,
            success: false,
            error: uploadError.message,
          });
          continue;
        }

        const {
          data: { publicUrl },
        } = adminClient.storage
          .from("freestyle-images")
          .getPublicUrl(storagePath);

        // Insert into discover_presets
        const { error: insertError } = await adminClient
          .from("discover_presets")
          .insert({
            title: img.title,
            prompt: img.prompt,
            image_url: publicUrl,
            category: img.category,
            tags: img.tags,
            sort_order: nextSort++,
            is_featured: false,
            aspect_ratio: "3:4",
            quality: "high",
          });

        if (insertError) {
          results.push({
            title: img.title,
            success: false,
            error: insertError.message,
          });
          continue;
        }

        console.log(`[DISCOVER-IMG] ✓ ${img.title}`);
        results.push({ title: img.title, success: true });
      } catch (err) {
        results.push({
          title: img.title,
          success: false,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    const nextIndex = start_index + batch_size;
    const completed = nextIndex >= IMAGES.length;

    return new Response(
      JSON.stringify({
        results,
        next_index: completed ? null : nextIndex,
        total: IMAGES.length,
        processed: Math.min(nextIndex, IMAGES.length),
        completed,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[DISCOVER-IMG] Fatal:", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
