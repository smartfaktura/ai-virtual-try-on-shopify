import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function s(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function slugify(v: string): string {
  return v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "scene";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await supabaseAdmin.auth.getClaims(token);
    const userId = claims?.claims?.sub as string | undefined;
    if (claimsErr || !userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdmin } = await supabaseAdmin.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin only" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const answers = body.answers ?? {};
    const name = s(body.name).trim();
    const previewUrl = s(body.previewImageUrl).trim();
    const categoryCollection = s(body.categoryCollection).trim();
    const subCategory = s(body.subCategory).trim();
    const compiledPrompt = s(body.compiledPrompt).trim();

    if (name.length < 2) {
      return new Response(JSON.stringify({ error: "Name is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!previewUrl) {
      return new Response(JSON.stringify({ error: "Preview image is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!categoryCollection || categoryCollection.length > 60) {
      return new Response(JSON.stringify({ error: "Category is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!subCategory || subCategory.length > 80) {
      return new Response(JSON.stringify({ error: "Sub-category is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!compiledPrompt) {
      return new Response(JSON.stringify({ error: "Compiled prompt is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const base = answers.base ?? {};
    const description = s(base.notes).slice(0, 280);
    const sceneType = s(base.scene_type) || "lifestyle";

    // Generate unique scene_id with one retry on collision.
    async function insertWithUniqueSceneId() {
      for (let attempt = 0; attempt < 2; attempt++) {
        const shortId = crypto.randomUUID().slice(0, 8);
        const sceneId = `brand-${slugify(name)}-${shortId}`;
        const row = {
          scene_id: sceneId,
          title: name,
          description,
          prompt_template: compiledPrompt,
          category_collection: categoryCollection,
          sub_category: subCategory,
          scene_type: sceneType,
          preview_image_url: previewUrl,
          is_active: true,
          sort_order: 999,
          sub_category_sort_order: 999,
          is_brand_scene: false,
          owner_user_id: null,
          brand_scene_answers: answers,
        };
        const { data, error } = await supabaseAdmin
          .from("product_image_scenes")
          .insert(row)
          .select("id, scene_id, title, category_collection, sub_category")
          .single();
        if (!error) return { data, error: null as any };
        // Retry only on unique-violation on scene_id
        if ((error as any)?.code !== "23505") return { data: null, error };
      }
      return { data: null, error: { message: "scene_id collision after retry" } as any };
    }

    const { data, error } = await insertWithUniqueSceneId();
    if (error) {
      console.error("product_image_scenes insert failed:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ scene: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("save-brand-scene-as-public error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
