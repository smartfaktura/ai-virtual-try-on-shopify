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

function cleanShopDomain(shop: string): string {
  let clean = shop.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  if (!clean.includes(".")) {
    clean = `${clean}.myshopify.com`;
  }
  return clean;
}

/** Small delay helper for rate limiting */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Fetch with basic Shopify rate-limit retry (checks 429 + Retry-After header) */
async function shopifyFetch(url: string, accessToken: string, retries = 2): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, {
      headers: { "X-Shopify-Access-Token": accessToken },
    });
    if (res.status === 429) {
      const retryAfter = Number(res.headers.get("Retry-After") || "2");
      console.warn(`Shopify 429 rate-limited, retrying after ${retryAfter}s`);
      await delay(retryAfter * 1000);
      continue;
    }
    return res;
  }
  // Final attempt without retry
  return fetch(url, { headers: { "X-Shopify-Access-Token": accessToken } });
}

async function listCollections(shop: string, accessToken: string) {
  const collections: { id: number; title: string; handle: string; type: string }[] = [];

  // Fetch custom collections
  let url: string | null =
    `https://${shop}/admin/api/2025-01/custom_collections.json?fields=id,title,handle&limit=250`;
  while (url) {
    const res = await shopifyFetch(url, accessToken);
    if (!res.ok) break;
    const data = await res.json();
    for (const c of data.custom_collections || []) {
      collections.push({ id: c.id, title: c.title, handle: c.handle, type: "custom" });
    }
    url = null;
    const link = res.headers.get("link");
    if (link) {
      const next = link.split(",").find((s: string) => s.includes('rel="next"'));
      if (next) {
        const match = next.match(/<([^>]+)>/);
        if (match) url = match[1];
      }
    }
  }

  // Fetch smart collections
  url = `https://${shop}/admin/api/2025-01/smart_collections.json?fields=id,title,handle&limit=250`;
  while (url) {
    const res = await shopifyFetch(url, accessToken);
    if (!res.ok) break;
    const data = await res.json();
    for (const c of data.smart_collections || []) {
      collections.push({ id: c.id, title: c.title, handle: c.handle, type: "smart" });
    }
    url = null;
    const link = res.headers.get("link");
    if (link) {
      const next = link.split(",").find((s: string) => s.includes('rel="next"'));
      if (next) {
        const match = next.match(/<([^>]+)>/);
        if (match) url = match[1];
      }
    }
  }

  return collections;
}

async function listProducts(shop: string, accessToken: string, collectionId?: number) {
  const products: { id: number; title: string; product_type: string; thumbnail: string; image_count: number; tags: string[] }[] = [];

  let url: string | null;

  if (collectionId) {
    url = `https://${shop}/admin/api/2025-01/collections/${collectionId}/products.json?fields=id,title,product_type,images,tags&limit=250`;
  } else {
    url = `https://${shop}/admin/api/2025-01/products.json?fields=id,title,product_type,images,tags&limit=250`;
  }

  while (url) {
    const res = await shopifyFetch(url, accessToken);
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
        image_count: p.images?.length || 0,
        tags: p.tags ? p.tags.split(", ").map((t: string) => t.trim()).filter(Boolean) : [],
      });
    }
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
  const MAX_IMAGES = 6;

  for (const productId of productIds) {
    try {
      // Small delay between products to respect Shopify rate limits
      if (results.length > 0) {
        await delay(500);
      }

      const res = await shopifyFetch(
        `https://${shop}/admin/api/2025-01/products/${productId}.json?fields=id,title,product_type,body_html,images,tags`,
        accessToken
      );
      if (!res.ok) {
        results.push({ id: productId, title: "", success: false, error: `API ${res.status}` });
        continue;
      }
      const { product } = (await res.json()) as { product: ShopifyProduct };
      const description = stripHtml(product.body_html);
      const images = (product.images || []).slice(0, MAX_IMAGES);

      // Check for duplicate product (same title + user)
      const { data: existing } = await supabaseAdmin
        .from("user_products")
        .select("id")
        .eq("user_id", userId)
        .eq("title", product.title)
        .limit(1)
        .maybeSingle();

      if (existing) {
        results.push({ id: productId, title: product.title, success: false, error: "Already imported" });
        continue;
      }

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
        } catch (imgErr) {
          console.error("Image download failed:", imgErr);
        }
      }

      // Require at least one successfully uploaded image — don't fall back to Shopify CDN
      if (uploadedImages.length === 0) {
        results.push({ id: productId, title: product.title, success: false, error: "Failed to upload images" });
        continue;
      }

      const mainImageUrl = uploadedImages[0].url;

      const tags = (product as any).tags
        ? (product as any).tags.split(", ").map((t: string) => t.trim()).filter(Boolean)
        : [];

      const { data: productData, error: insertErr } = await supabaseAdmin
        .from("user_products")
        .insert({
          user_id: userId,
          title: product.title,
          product_type: product.product_type || "",
          description: description.slice(0, 2000),
          image_url: mainImageUrl,
          tags,
        })
        .select("id")
        .single();

      if (insertErr) {
        results.push({ id: productId, title: product.title, success: false, error: insertErr.message });
        continue;
      }

      if (uploadedImages.length > 0) {
        const imageRows = uploadedImages.map((img) => ({
          product_id: productData.id,
          user_id: userId,
          image_url: img.url,
          storage_path: img.path,
          position: img.position,
        }));

        const { error: imgInsertErr } = await supabaseAdmin.from("product_images").insert(imageRows);
        if (imgInsertErr) {
          console.error("product_images insert error:", imgInsertErr);
          // Product was created but gallery images failed — report partial success
        }
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
  return results;
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
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = user.id;

    const body = await req.json();
    const { action, shop, product_ids, collection_id } = body;

    if (!shop) {
      return new Response(
        JSON.stringify({ error: "Missing shop domain" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Always look up access token from DB — never accept from body
    const { data: conn, error: connErr } = await supabaseAdmin
      .from("shopify_connections")
      .select("access_token")
      .eq("user_id", userId)
      .limit(1)
      .single();

    if (connErr || !conn) {
      return new Response(
        JSON.stringify({ error: "No Shopify connection found. Please connect your store first." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const access_token = conn.access_token;

    const cleanShop = cleanShopDomain(shop);

    if (action === "collections") {
      const collections = await listCollections(cleanShop, access_token);
      return new Response(JSON.stringify({ collections, total: collections.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "list") {
      const products = await listProducts(cleanShop, access_token, collection_id);
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
      JSON.stringify({ error: 'Invalid action. Use "collections", "list", or "import".' }),
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
