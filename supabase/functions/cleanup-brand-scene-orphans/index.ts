// Scheduled cleanup — removes brand-scene variation images in scratch-uploads
// that are >24h old and not referenced as preview_image_url of any saved scene.
// Triggered by pg_cron once per day.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BUCKET = "scratch-uploads";
const MAX_AGE_HOURS = 24;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1) Collect every saved preview_image_url that lives in this bucket so we
    //    never delete a referenced file.
    const { data: scenes } = await admin
      .from("product_image_scenes")
      .select("preview_image_url")
      .eq("is_brand_scene", true);

    const referenced = new Set<string>();
    for (const row of scenes ?? []) {
      const url = (row as any).preview_image_url as string | null;
      if (!url) continue;
      const m = url.match(/\/scratch-uploads\/(.+)$/);
      if (m?.[1]) referenced.add(m[1]);
    }

    const cutoff = Date.now() - MAX_AGE_HOURS * 60 * 60 * 1000;
    let scanned = 0;
    let deleted = 0;

    // 2) Walk every user prefix.
    const { data: users } = await admin.storage.from(BUCKET).list("", { limit: 1000 });
    for (const userFolder of users ?? []) {
      if (!userFolder.name) continue;
      const brandScenesPath = `${userFolder.name}/brand-scenes`;
      const { data: runs } = await admin.storage.from(BUCKET).list(brandScenesPath, { limit: 1000 });
      if (!runs) continue;

      for (const run of runs) {
        if (!run.name) continue;
        const runPath = `${brandScenesPath}/${run.name}`;
        const { data: files } = await admin.storage.from(BUCKET).list(runPath, { limit: 100 });
        if (!files) continue;

        const toDelete: string[] = [];
        for (const f of files) {
          if (!f.name) continue;
          scanned += 1;
          const rel = `${runPath}/${f.name}`;
          if (referenced.has(rel)) continue;
          const createdAt = f.created_at ? new Date(f.created_at).getTime() : 0;
          if (createdAt > 0 && createdAt > cutoff) continue;
          toDelete.push(rel);
        }
        if (toDelete.length > 0) {
          const { error } = await admin.storage.from(BUCKET).remove(toDelete);
          if (error) {
            console.warn(`Remove failed for ${runPath}:`, error.message);
          } else {
            deleted += toDelete.length;
          }
        }
      }
    }

    console.log(`cleanup-brand-scene-orphans: scanned=${scanned} deleted=${deleted} referenced=${referenced.size}`);

    return new Response(JSON.stringify({ scanned, deleted, referenced: referenced.size }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("cleanup-brand-scene-orphans error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
