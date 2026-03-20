import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Service-role only
    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
    if (authHeader !== `Bearer ${serviceRoleKey}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { creative_drop_id } = await req.json();
    if (!creative_drop_id) {
      return new Response(JSON.stringify({ error: "Missing creative_drop_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // 1. Check if the drop exists and is still generating
    const { data: drop } = await supabase
      .from("creative_drops")
      .select("id, status, generation_job_ids")
      .eq("id", creative_drop_id)
      .single();

    if (!drop || drop.status !== "generating") {
      return new Response(JSON.stringify({ skipped: true, reason: "Drop not in generating state" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Check if any queue jobs are still pending
    const { data: pendingJobs } = await supabase
      .from("generation_queue")
      .select("id")
      .filter("payload->>creative_drop_id", "eq", creative_drop_id)
      .in("status", ["queued", "processing"]);

    if (pendingJobs && pendingJobs.length > 0) {
      return new Response(JSON.stringify({ skipped: true, reason: "Jobs still pending", remaining: pendingJobs.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. All jobs are terminal — collect images from generation_jobs
    const { data: completedJobs } = await supabase
      .from("generation_jobs")
      .select("results, workflow_id, product_id")
      .eq("creative_drop_id", creative_drop_id)
      .eq("status", "completed");

    // Collect unique workflow_ids and product_ids for name resolution
    const workflowIds = new Set<string>();
    const productIds = new Set<string>();
    for (const job of completedJobs || []) {
      if (job.workflow_id) workflowIds.add(job.workflow_id);
      if (job.product_id) productIds.add(job.product_id);
    }

    // Batch-resolve names
    const workflowNames: Record<string, string> = {};
    const productTitles: Record<string, string> = {};

    if (workflowIds.size > 0) {
      const { data: wfs } = await supabase
        .from("workflows")
        .select("id, name")
        .in("id", Array.from(workflowIds));
      for (const wf of wfs || []) workflowNames[wf.id] = wf.name;
    }

    if (productIds.size > 0) {
      const { data: prods } = await supabase
        .from("user_products")
        .select("id, title")
        .in("id", Array.from(productIds));
      for (const p of prods || []) productTitles[p.id] = p.title;
    }

    const allImages: { url: string; workflow_name?: string; product_title?: string }[] = [];
    for (const job of completedJobs || []) {
      const results = job.results;
      if (Array.isArray(results)) {
        for (const img of results) {
          const url = typeof img === "string" ? img
            : (typeof img === "object" && img !== null && "url" in img)
              ? (img as Record<string, string>).url
              : null;
          if (url) {
            allImages.push({
              url,
              workflow_name: job.workflow_id ? workflowNames[job.workflow_id] : undefined,
              product_title: job.product_id ? productTitles[job.product_id] : undefined,
            });
          }
        }
      }
    }

    // 4. Update creative_drops
    const newStatus = allImages.length > 0 ? "ready" : "failed";
    await supabase
      .from("creative_drops")
      .update({
        status: newStatus,
        images: allImages,
        total_images: allImages.length,
      })
      .eq("id", creative_drop_id);

    console.log(`[complete-creative-drop] Drop ${creative_drop_id} → ${newStatus} (${allImages.length} images)`);

    return new Response(
      JSON.stringify({ status: newStatus, total_images: allImages.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[complete-creative-drop] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
