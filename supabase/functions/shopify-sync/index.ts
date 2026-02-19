import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ShopifyProduct {
  id: number;
  title: string;
  product_type: string;
  body_html: string;
  images: { id: number; src: string; position: number }[];
}

function stripHtml(html: string): string {
  return html?.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim() || "";
}

async function listProducts(shop: string, accessToken: string) {
  const products: { id: number; title: string; product_type: string; thumbnail: string }[] = [];
  let url: string | null =
    `https://${shop}/admin/api/2024-01/products.json?fields=id,title,product_type,images&limit=250`;

  while (url) {
    const res = await fetch(url, {
      headers: { "X-Shopify-Access-Token": accessToken },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Shopify API error ${res.status}: ${text}`);
    }
    const data = await res.json();
    for (const p of data.products) {
      products.push({
        id: p.id,
        title: p.title,
        product_type: p.product_type || "",
        thumbnail: p.images?.[0]?.src || "",
      });
    }
    // Parse Link header for pagination
    const link = res.headers.get("link");
    url = null;
    if (link) {
      const next = link.split(",").find((s: string) => s.includes('rel="next"'));
      if (next) {
        const match = next.match(/<([^>]+)>/);
        if (match) url = match[1];
      }
    }
  }
  return products;
}

async function importProducts(
  shop: string,
  accessToken: string,
  productIds: number[],
  userId: string,
  supabaseAdmin: any
) {
  const results: { id: number; title: string; success: boolean; error?: string }[] = [];
  const BATCH_SIZE = 10;
  const MAX_IMAGES = 6;

  for (let i = 0; i < productIds.length; i += BATCH_SIZE) {
    const batch = productIds.slice(i, i + BATCH_SIZE);

    for (const productId of batch) {
      try {
        // Fetch full product data
        const res = await fetch(
          `https://${shop}/admin/api/2024-01/products/${productId}.json?fields=id,title,product_type,body_html,images`,
          { headers: { "X-Shopify-Access-Token": accessToken } }
        );
        if (!res.ok) {
          const text = await res.text();
          results.push({ id: productId, title: "", success: false, error: `API ${res.status}` });
          continue;
        }
        const { product } = (await res.json()) as { product: ShopifyProduct };
        const description = stripHtml(product.body_html);
        const images = (product.images || []).slice(0, MAX_IMAGES);

        // Download & upload first image as main
        let mainImageUrl = "";
        const uploadedImages: { url: string; path: string; position: number }[] = [];

        for (let idx = 0; idx < images.length; idx++) {
          const img = images[idx];
          try {
            const imgRes = await fetch(img.src);
            if (!imgRes.ok) continue;
            const blob = await imgRes.blob();
            const ext = img.src.split("?")[0].split(".").pop() || "jpg";
            const storagePath = `${userId}/shopify-${product.id}-${idx}.${ext}`;

            const { error: uploadErr } = await supabaseAdmin.storage
              .from("product-uploads")
              .upload(storagePath, blob, {
                contentType: blob.type || "image/jpeg",
                upsert: true,
              });

            if (uploadErr) {
              console.error("Upload error:", uploadErr);
              continue;
            }

            const { data: publicData } = supabaseAdmin.storage
              .from("product-uploads")
              .getPublicUrl(storagePath);

            uploadedImages.push({
              url: publicData.publicUrl,
              path: storagePath,
              position: idx,
            });

            if (idx === 0) mainImageUrl = publicData.publicUrl;
          } catch (imgErr) {
            console.error("Image download failed:", imgErr);
          }
        }

        if (!mainImageUrl && images.length > 0) {
          mainImageUrl = images[0].src; // Fallback to original URL
        }

        if (!mainImageUrl) {
          results.push({ id: productId, title: product.title, success: false, error: "No images" });
          continue;
        }

        // Insert user_product
        const { data: productData, error: insertErr } = await supabaseAdmin
          .from("user_products")
          .insert({
            user_id: userId,
            title: product.title,
            product_type: product.product_type || "",
            description: description.slice(0, 2000),
            image_url: mainImageUrl,
          })
          .select("id")
          .single();

        if (insertErr) {
          results.push({ id: productId, title: product.title, success: false, error: insertErr.message });
          continue;
        }

        // Insert product_images
        if (uploadedImages.length > 0) {
          const imageRows = uploadedImages.map((img) => ({
            product_id: productData.id,
            user_id: userId,
            image_url: img.url,
            storage_path: img.path,
            position: img.position,
          }));

          await supabaseAdmin.from("product_images").insert(imageRows);
        }

        results.push({ id: productId, title: product.title, success: true });
      } catch (err) {
        results.push({
          id: productId,
          title: "",
          success: false,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }
  }
  return results;
}

Deno.serve(async (req) => {
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

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    const body = await req.json();
    const { action, shop, access_token, product_ids } = body;

    // Validate inputs
    if (!shop || !access_token) {
      return new Response(
        JSON.stringify({ error: "Missing shop domain or access token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize shop domain
    const cleanShop = shop.replace(/^https?:\/\//, "").replace(/\/+$/, "");

    if (action === "list") {
      const products = await listProducts(cleanShop, access_token);
      return new Response(JSON.stringify({ products, total: products.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "import") {
      if (!product_ids || !Array.isArray(product_ids) || product_ids.length === 0) {
        return new Response(
          JSON.stringify({ error: "No products selected" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const results = await importProducts(cleanShop, access_token, product_ids, userId, supabaseAdmin);
      const imported = results.filter((r) => r.success).length;
      const failed = results.filter((r) => !r.success).length;

      return new Response(
        JSON.stringify({ results, imported, failed, total: results.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use "list" or "import".' }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("shopify-sync error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
