import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return new Response(JSON.stringify({ error: "URL is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch {
      return new Response(JSON.stringify({ error: "Invalid URL format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the product page HTML
    console.log(`Fetching product page: ${url}`);
    const pageResponse = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });

    if (!pageResponse.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch page (${pageResponse.status})` }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const html = await pageResponse.text();
    // Truncate HTML to first 15000 chars to fit in AI context
    const truncatedHtml = html.substring(0, 15000);

    // Use AI to extract product info
    const aiApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!aiApiKey) {
      return new Response(JSON.stringify({ error: "AI service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${aiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a product data extractor. Given HTML from an e-commerce product page, extract the product information. Return ONLY valid JSON with these fields:
- "title": the product name/title (string)
- "image_url": the primary product image URL (string, must be absolute URL)
- "product_type": the product category/type like "T-Shirt", "Sneakers", "Serum", etc. (string)
- "description": a short product description if available (string, max 200 chars)

Look for:
1. Open Graph meta tags (og:title, og:image)
2. JSON-LD structured data (Product schema)
3. HTML title tag and main product image
4. Meta description

If the image URL is relative, make it absolute using the page URL. Return ONLY the JSON object, no markdown.`,
          },
          {
            role: "user",
            content: `Extract product data from this page (URL: ${url}):\n\n${truncatedHtml}`,
          },
        ],
        temperature: 0.1,
        max_tokens: 500,
      }),
    });

    if (!aiResponse.ok) {
      console.error("AI extraction failed:", await aiResponse.text());
      return new Response(JSON.stringify({ error: "Failed to extract product data" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResult = await aiResponse.json();
    const aiContent = aiResult.choices?.[0]?.message?.content || "";

    // Parse AI response - strip markdown fences if present
    let productData: { title: string; image_url: string; product_type: string; description: string };
    try {
      const cleanJson = aiContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      productData = JSON.parse(cleanJson);
    } catch {
      console.error("Failed to parse AI response:", aiContent);
      return new Response(JSON.stringify({ error: "Could not extract product data from this page" }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate extracted data
    if (!productData.title || !productData.image_url) {
      return new Response(
        JSON.stringify({ error: "Could not find product title or image on this page" }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Download the product image
    console.log(`Downloading product image: ${productData.image_url}`);
    let imageResponse: Response;
    try {
      imageResponse = await fetch(productData.image_url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "image/*",
          Referer: url,
        },
        redirect: "follow",
      });
    } catch {
      return new Response(JSON.stringify({ error: "Could not download product image" }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!imageResponse.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to download image (${imageResponse.status})` }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const imageBlob = await imageResponse.blob();
    const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
    const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";

    // Upload to secure product-uploads bucket under user's folder
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const filePath = `${userId}/${timestamp}-${randomId}.${ext}`;

    // Use service role to upload since the user's token may not have direct storage access
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from("product-uploads")
      .upload(filePath, imageBlob, {
        contentType,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(JSON.stringify({ error: "Failed to store product image" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the public URL - since bucket is private, we generate a signed URL
    const { data: signedUrlData, error: signedUrlError } = await adminClient.storage
      .from("product-uploads")
      .createSignedUrl(uploadData.path, 60 * 60 * 24 * 365); // 1 year

    const imageUrl = signedUrlError ? productData.image_url : signedUrlData.signedUrl;

    return new Response(
      JSON.stringify({
        title: productData.title.substring(0, 200),
        image_url: imageUrl,
        product_type: (productData.product_type || "").substring(0, 100),
        description: (productData.description || "").substring(0, 500),
        storage_path: uploadData.path,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Import error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
