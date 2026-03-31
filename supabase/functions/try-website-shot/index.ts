import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Blocked patterns
const BLOCKED_HOSTS = [
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "10.",
  "192.168.",
  "172.16.",
  "169.254.",
  "[::1]",
];

function isValidDomain(domain: string): boolean {
  if (!domain || domain.length > 253) return false;
  // Must have at least one dot (TLD)
  if (!domain.includes(".")) return false;
  // Block IPs
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(domain)) return false;
  // Block internal hosts
  for (const blocked of BLOCKED_HOSTS) {
    if (domain.startsWith(blocked) || domain === blocked) return false;
  }
  // Basic domain pattern
  return /^[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/.test(domain);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domain } = await req.json();

    if (!domain || typeof domain !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "Domain is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cleanDomain = domain.trim().toLowerCase().replace(/^www\./, "");

    if (!isValidDomain(cleanDomain)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid domain. Please enter a valid store URL like nike.com" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Init Supabase with service role (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Rate limit by IP
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { count } = await supabaseAdmin
      .from("try_shot_sessions")
      .select("id", { count: "exact", head: true })
      .eq("ip_address", ip)
      .gte("created_at", twentyFourHoursAgo);

    if ((count ?? 0) >= 3) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "You've reached the daily limit (3 tries). Sign up for unlimited generations at vovv.ai",
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 1: Scrape homepage
    console.log(`Scraping ${cleanDomain}...`);
    let html: string;
    try {
      const siteResponse = await fetch(`https://${cleanDomain}`, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml",
        },
        redirect: "follow",
      });

      if (!siteResponse.ok) {
        return new Response(
          JSON.stringify({ success: false, error: `Could not access ${cleanDomain}. Make sure it's a valid, public website.` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      html = await siteResponse.text();
      // Truncate to avoid huge payloads
      html = html.slice(0, 50000);
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: `Could not connect to ${cleanDomain}. Check the URL and try again.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Extract product images using AI
    console.log("Extracting product images with AI...");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const extractionPrompt = `You are analyzing HTML from ${cleanDomain} to find product images.

Find exactly 2 product images from this webpage HTML. Look for:
- <img> tags with product photos (not logos, icons, banners, or decorative images)
- Product images in <picture> or srcset attributes
- Background images with product photos
- Images inside product cards, carousels, or grids

Return a JSON array of exactly 2 items (or fewer if you can't find enough):
[
  {"name": "Product Name", "image_url": "https://full-url-to-image.jpg"},
  {"name": "Product Name", "image_url": "https://full-url-to-image.jpg"}
]

Rules:
- image_url MUST be a full absolute URL (prepend https://${cleanDomain} if relative)
- Pick the HIGHEST quality/resolution version available
- Name should be descriptive (from alt text, nearby text, or image filename)
- Only return the JSON array, nothing else

HTML:
${html}`;

    const extractResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: extractionPrompt }],
        }),
      }
    );

    if (!extractResponse.ok) {
      console.error("AI extraction failed:", extractResponse.status);
      throw new Error("AI extraction failed");
    }

    const extractData = await extractResponse.json();
    const extractedText = extractData.choices?.[0]?.message?.content || "[]";
    
    // Parse JSON from response (handle markdown code blocks)
    let products: { name: string; image_url: string }[] = [];
    try {
      const jsonMatch = extractedText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        products = JSON.parse(jsonMatch[0]);
      }
    } catch {
      console.error("Failed to parse extracted products:", extractedText);
      return new Response(
        JSON.stringify({ success: false, error: "Couldn't find products on this website. Try a different store." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!products.length) {
      return new Response(
        JSON.stringify({ success: false, error: "No product images found on this website. Try a store with visible product photos." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 3: Generate styled product shots
    console.log(`Generating shots for ${products.length} products...`);
    const results: { product_name: string; original_image: string; generated_image: string }[] = [];

    for (const product of products.slice(0, 2)) {
      try {
        const generatePrompt = `Create a premium, clean e-commerce product photo of this product. 
Style: Studio lighting, minimalist white/light grey background, professional product photography, 
soft shadows, high-end commercial look. The product should be the clear hero of the image.
Make it look like a professional product shot you'd see on a luxury retail website.`;

        const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
        if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

        const genResponse = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${GEMINI_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "gemini-2.5-flash-image",
              messages: [
                {
                  role: "user",
                  content: [
                    { type: "text", text: generatePrompt },
                    {
                      type: "image_url",
                      image_url: { url: product.image_url },
                    },
                  ],
                },
              ],
              modalities: ["image", "text"],
            }),
          }
        );

        if (!genResponse.ok) {
          console.error(`Generation failed for ${product.name}:`, genResponse.status);
          continue;
        }

        const genData = await genResponse.json();
        const generatedImageBase64 =
          genData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

        if (!generatedImageBase64) {
          console.error(`No image returned for ${product.name}`);
          continue;
        }

        // Upload to storage
        const base64Data = generatedImageBase64.replace(
          /^data:image\/\w+;base64,/,
          ""
        );
        const imageBytes = Uint8Array.from(atob(base64Data), (c) =>
          c.charCodeAt(0)
        );

        const fileName = `try-shots/${crypto.randomUUID()}.png`;
        const { error: uploadError } = await supabaseAdmin.storage
          .from("scratch-uploads")
          .upload(fileName, imageBytes, {
            contentType: "image/png",
            upsert: false,
          });

        if (uploadError) {
          console.error("Upload failed:", uploadError);
          continue;
        }

        const {
          data: { publicUrl },
        } = supabaseAdmin.storage.from("scratch-uploads").getPublicUrl(fileName);

        results.push({
          product_name: product.name,
          original_image: product.image_url,
          generated_image: publicUrl,
        });
      } catch (err) {
        console.error(`Error processing ${product.name}:`, err);
        continue;
      }
    }

    // Log session
    await supabaseAdmin.from("try_shot_sessions").insert({
      ip_address: ip,
      domain: cleanDomain,
      results: { products: results.map((r) => r.product_name) },
    });

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("try-website-shot error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Something went wrong. Please try again.",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
