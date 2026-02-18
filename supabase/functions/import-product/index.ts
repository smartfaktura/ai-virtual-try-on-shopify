import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ProductData {
  title: string;
  image_urls?: string[];
  image_url?: string;
  product_type: string;
  description: string;
  dimensions?: string | null;
}

/** Try the Shopify JSON API for URLs that look like /products/{handle} */
async function tryShopifyJson(parsedUrl: URL): Promise<ProductData | null> {
  const match = parsedUrl.pathname.match(/\/products\/([^/?#]+)/);
  if (!match) return null;

  const handle = match[1];
  const jsonUrl = `${parsedUrl.origin}/products/${handle}.json`;
  console.log(`Trying Shopify JSON API: ${jsonUrl}`);

  try {
    const res = await fetch(jsonUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
    });

    if (!res.ok) return null;

    const json = await res.json();
    const product = json.product;
    if (!product?.title) return null;

    const imageUrls = (product.images || [])
      .slice(0, 6)
      .map((img: any) => img.src?.replace(/\?.*$/, "") || "")
      .filter(Boolean);

    if (imageUrls.length === 0) return null;

    const bodyText = (product.body_html || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 200);

    return {
      title: product.title,
      image_urls: imageUrls,
      product_type: product.product_type || "",
      description: bodyText,
      dimensions: null,
    };
  } catch (err) {
    console.log("Shopify JSON fallback failed:", err);
    return null;
  }
}

/** Scrape HTML + use AI to extract product data */
async function extractFromHtml(url: string, parsedUrl: URL): Promise<ProductData> {
  console.log(`Fetching product page: ${url}`);
  const pageResponse = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
    redirect: "follow",
  });

  if (!pageResponse.ok) {
    throw new Error(`Could not access the product page (HTTP ${pageResponse.status}). The site may be blocking automated requests.`);
  }

  const html = await pageResponse.text();
  const truncatedHtml = html.substring(0, 50000);

  const aiApiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!aiApiKey) {
    throw new Error("AI service not configured");
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
- "image_urls": an array of ALL product image URLs found on the page (array of strings, must be absolute URLs). Include the primary/hero image first, then any gallery/variant images. Maximum 6 images.
- "product_type": the product category/type like "T-Shirt", "Sneakers", "Serum", etc. (string)
- "description": a short product description if available (string, max 200 chars)
- "dimensions": the product's physical dimensions if found (string, e.g. "28 x 35 x 13 cm"), or null if not available

Look for:
1. Open Graph meta tags (og:title, og:image)
2. JSON-LD structured data (Product schema) — check for "image" array, and "width", "height", "depth" fields
3. Shopify/WooCommerce product gallery images
4. HTML title tag and main product images
5. Meta description
6. Any <img> tags within product gallery/carousel sections
7. Product specification/details tables for dimensions

If image URLs are relative, make them absolute using the page URL. Return ONLY the JSON object, no markdown.`,
        },
        {
          role: "user",
          content: `Extract product data from this page (URL: ${url}):\n\n${truncatedHtml}`,
        },
      ],
      temperature: 0.1,
      max_tokens: 1000,
    }),
  });

  if (!aiResponse.ok) {
    console.error("AI extraction failed:", await aiResponse.text());
    throw new Error("Could not extract product data. Try a different product URL or use manual upload.");
  }

  const aiResult = await aiResponse.json();
  const aiContent = aiResult.choices?.[0]?.message?.content || "";

  try {
    const cleanJson = aiContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleanJson);
  } catch {
    console.error("Failed to parse AI response:", aiContent);
    throw new Error("Could not extract product data from this page. The page may use dynamic rendering that prevents extraction.");
  }
}

Deno.serve(async (req) => {
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

    // Try Shopify JSON API first, fall back to HTML scraping
    let productData = await tryShopifyJson(parsedUrl);
    if (!productData) {
      productData = await extractFromHtml(url, parsedUrl);
    }

    const imageUrls: string[] = productData.image_urls || (productData.image_url ? [productData.image_url] : []);

    if (!productData.title || imageUrls.length === 0) {
      return new Response(
        JSON.stringify({ error: "Could not find product title or images on this page. Try a direct product page URL." }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const limitedUrls = imageUrls.slice(0, 6);

    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const uploadedImages: { image_url: string; storage_path: string; position: number }[] = [];

    for (let i = 0; i < limitedUrls.length; i++) {
      const imgUrl = limitedUrls[i];
      console.log(`Downloading image ${i + 1}/${limitedUrls.length}: ${imgUrl}`);

      try {
        const imageResponse = await fetch(imgUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            Accept: "image/*",
            Referer: url,
          },
          redirect: "follow",
        });

        if (!imageResponse.ok) {
          console.warn(`Failed to download image ${i + 1}: ${imageResponse.status}`);
          continue;
        }

        const imageBlob = await imageResponse.blob();
        const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
        const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";

        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 8);
        const filePath = `${userId}/${timestamp}-${randomId}.${ext}`;

        const { data: uploadData, error: uploadError } = await adminClient.storage
          .from("product-uploads")
          .upload(filePath, imageBlob, { contentType, cacheControl: "3600", upsert: false });

        if (uploadError) {
          console.warn(`Upload error for image ${i + 1}:`, uploadError);
          continue;
        }

        const { data: signedUrlData, error: signedUrlError } = await adminClient.storage
          .from("product-uploads")
          .createSignedUrl(uploadData.path, 60 * 60 * 24 * 365);

        if (signedUrlError) {
          console.warn(`Signed URL error for image ${i + 1}:`, signedUrlError);
          continue;
        }

        uploadedImages.push({
          image_url: signedUrlData.signedUrl,
          storage_path: uploadData.path,
          position: i,
        });
      } catch (err) {
        console.warn(`Error processing image ${i + 1}:`, err);
        continue;
      }
    }

    if (uploadedImages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Could not download any product images. The images may be protected or require authentication." }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        title: productData.title.substring(0, 200),
        image_url: uploadedImages[0].image_url,
        image_urls: uploadedImages.map(img => img.image_url),
        storage_paths: uploadedImages.map(img => img.storage_path),
        product_type: (productData.product_type || "").substring(0, 100),
        description: (productData.description || "").substring(0, 500),
        storage_path: uploadedImages[0].storage_path,
        dimensions: productData.dimensions || null,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Import error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
