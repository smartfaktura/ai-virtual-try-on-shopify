import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function getUserIdFromJwt(authHeader: string | null): string | null {
  if (!authHeader) return null;
  try {
    const token = authHeader.replace("Bearer ", "");
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub || null;
  } catch {
    return null;
  }
}

/** Fetch the full brand profile object from the DB so generate-workflow can use it */
async function resolveBrandProfile(
  supabase: ReturnType<typeof createClient>,
  brandProfileId: string | null
): Promise<Record<string, unknown> | null> {
  if (!brandProfileId) return null;
  const { data } = await supabase
    .from("brand_profiles")
    .select("tone, color_temperature, color_palette, brand_keywords, do_not_rules, target_audience, lighting_style, background_style, composition_bias, preferred_scenes, photography_reference")
    .eq("id", brandProfileId)
    .single();
  return data || null;
}

/** Fetch all product rows needed for payloads */
async function resolveProducts(
  supabase: ReturnType<typeof createClient>,
  productIds: string[]
): Promise<Map<string, Record<string, unknown>>> {
  if (productIds.length === 0) return new Map();
  const { data } = await supabase
    .from("user_products")
    .select("id, title, product_type, description, dimensions, image_url")
    .in("id", productIds);
  const map = new Map<string, Record<string, unknown>>();
  for (const row of data || []) {
    map.set(row.id as string, row);
  }
  return map;
}

/** Determine the actual number of variations a workflow can produce */
function getVariationCount(
  wf: Record<string, unknown>,
  sceneConfig: Record<string, unknown>
): number {
  const genConfig = wf.generation_config as Record<string, unknown> | null;
  const allVariations = (genConfig?.variation_strategy as Record<string, unknown>)?.variations as unknown[] || [];
  const selectedIndices = (sceneConfig.selected_variation_indices || []) as number[];

  // If user selected specific variations, use that count; otherwise use all available
  const variationCount = selectedIndices.length > 0 ? selectedIndices.length : allVariations.length;

  // Backend caps at 4 per call
  return Math.min(variationCount, 4);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userId = getUserIdFromJwt(req.headers.get("authorization"));
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { schedule_id } = await req.json();
    if (!schedule_id) {
      return new Response(
        JSON.stringify({ error: "Missing schedule_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // 1. Read the schedule — verify ownership
    const { data: schedule, error: scheduleError } = await supabase
      .from("creative_schedules")
      .select("*")
      .eq("id", schedule_id)
      .eq("user_id", userId)
      .single();

    if (scheduleError || !schedule) {
      return new Response(
        JSON.stringify({ error: "Schedule not found or access denied" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Determine products to generate for
    let productIds: string[] = schedule.selected_product_ids || [];
    if (schedule.products_scope === "all" || productIds.length === 0) {
      const { data: allProducts } = await supabase
        .from("user_products")
        .select("id")
        .eq("user_id", userId);
      productIds = (allProducts || []).map((p: { id: string }) => p.id);
    }

    if (productIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "No products found to generate for" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const workflowIds: string[] = schedule.workflow_ids || [];
    if (workflowIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "No workflows selected in schedule" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Fetch workflow configs, brand profile, and product data in parallel
    const [workflowResult, brandProfile, productMap] = await Promise.all([
      supabase.from("workflows").select("*").in("id", workflowIds),
      resolveBrandProfile(supabase, schedule.brand_profile_id),
      resolveProducts(supabase, productIds),
    ]);

    const workflows = workflowResult.data || [];
    const workflowMap = new Map(
      workflows.map((w: Record<string, unknown>) => [w.id as string, w])
    );

    const sceneConfig = (schedule.scene_config || {}) as Record<string, Record<string, unknown>>;

    // 4. Build job payloads with fully resolved data
    let totalCreditCost = 0;
    const jobPayloads: {
      jobType: string;
      payload: Record<string, unknown>;
      creditCost: number;
    }[] = [];

    for (const wfId of workflowIds) {
      const wf = workflowMap.get(wfId) as Record<string, unknown> | undefined;
      if (!wf) continue;

      const wfSceneConfig = sceneConfig[wfId] || {};
      const models = (wfSceneConfig.models || []) as Record<string, unknown>[];
      const hasModel = (wf.uses_tryon as boolean) || models.length > 0;
      const hasCustomScene = false; // Future: detect custom scenes
      const costPerImage = hasModel && hasCustomScene ? 15 : hasModel ? 12 : 4;

      const variationIndices = (wfSceneConfig.selected_variation_indices || []) as number[];
      const aspectRatio = (wfSceneConfig.aspect_ratio || "1:1") as string;
      const mappedSettings = (wfSceneConfig.mapped_settings || {}) as Record<string, string>;

      // Issue 5 fix: Use actual variation count, not imagesPerDrop
      const actualImageCount = getVariationCount(wf, wfSceneConfig);

      // For model-based workflows, generate per-model; otherwise just once per product
      const modelList = models.length > 0 ? models : [null];

      for (const productId of productIds) {
        // Issue 3 fix: Resolve full product data
        const productData = productMap.get(productId);
        if (!productData) {
          console.warn(`[trigger-creative-drop] Product ${productId} not found, skipping`);
          continue;
        }

        // Build the full product object expected by generate-workflow
        // Issue 4: Using public URL directly (product-uploads bucket is private,
        // but the image_url stored in user_products is already a public/signed URL from upload flow)
        const productObject = {
          title: productData.title,
          productType: productData.product_type,
          description: (productData.description as string) || "",
          dimensions: productData.dimensions || undefined,
          imageUrl: productData.image_url,
        };

        for (const model of modelList) {
          const creditCost = actualImageCount * costPerImage;

          const payload: Record<string, unknown> = {
            workflow_id: wfId,
            product: productObject, // Issue 3: Full product object
            imageCount: actualImageCount, // Issue 5: Actual variation count
            quality: "standard",
            aspectRatio,
            selected_variations: variationIndices.length > 0 ? variationIndices : undefined,
            brand_profile: brandProfile, // Issue 2: Full brand profile object
            // Issue 1: Theme injection
            theme: schedule.theme || undefined,
            theme_notes: schedule.theme_notes || undefined,
            ...mappedSettings,
          };

          if (model) {
            payload.model = {
              name: (model as Record<string, unknown>).name,
              imageUrl: (model as Record<string, unknown>).image_url,
            };
          }

          jobPayloads.push({
            jobType: (wf.uses_tryon as boolean) ? "tryon" : "workflow",
            payload,
            creditCost,
          });

          totalCreditCost += creditCost;
        }
      }
    }

    // 5. Check user has enough credits
    const { data: profile } = await supabase
      .from("profiles")
      .select("credits_balance")
      .eq("user_id", userId)
      .single();

    if (!profile || profile.credits_balance < totalCreditCost) {
      return new Response(
        JSON.stringify({
          error: "Insufficient credits",
          required: totalCreditCost,
          balance: profile?.credits_balance || 0,
        }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 6. Create the creative_drops record
    const { data: drop, error: dropError } = await supabase
      .from("creative_drops")
      .insert({
        user_id: userId,
        schedule_id: schedule.id,
        status: "generating",
        total_images: jobPayloads.reduce((sum, j) => sum + (j.payload.imageCount as number), 0),
        credits_charged: totalCreditCost,
        summary: {
          workflow_count: workflowIds.length,
          product_count: productIds.length,
          jobs_enqueued: jobPayloads.length,
          theme: schedule.theme || null,
        },
      })
      .select("id")
      .single();

    if (dropError || !drop) {
      console.error("[trigger-creative-drop] Failed to create drop record:", dropError);
      return new Response(
        JSON.stringify({ error: "Failed to create drop record" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 7. Enqueue generation jobs via the enqueue_generation RPC
    const jobIds: string[] = [];
    const errors: string[] = [];

    for (const job of jobPayloads) {
      const { data: enqueueResult, error: enqueueError } = await supabase.rpc(
        "enqueue_generation",
        {
          p_user_id: userId,
          p_job_type: job.jobType,
          p_payload: { ...job.payload, creative_drop_id: drop.id },
          p_credits_cost: job.creditCost,
        }
      );

      if (enqueueError) {
        console.error("[trigger-creative-drop] Enqueue error:", enqueueError);
        errors.push(`Failed to enqueue job: ${enqueueError.message}`);
        continue;
      }

      const result = enqueueResult as Record<string, unknown>;
      if (result.error) {
        errors.push(String(result.error));
        continue;
      }

      jobIds.push(result.job_id as string);
    }

    // 8. Update the drop with job IDs
    await supabase
      .from("creative_drops")
      .update({
        generation_job_ids: jobIds,
        status: jobIds.length > 0 ? "generating" : "failed",
        ...(errors.length > 0 && jobIds.length === 0
          ? { summary: { ...((drop as Record<string, unknown>).summary || {}), errors } }
          : {}),
      })
      .eq("id", drop.id);

    // 9. Update schedule next_run_at for recurring schedules
    if (schedule.frequency !== "one-time") {
      const now = new Date();
      let nextRun: Date;
      switch (schedule.frequency) {
        case "weekly":
          nextRun = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case "biweekly":
          nextRun = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
          break;
        case "monthly":
        default:
          nextRun = new Date(now);
          nextRun.setMonth(nextRun.getMonth() + 1);
          break;
      }
      await supabase
        .from("creative_schedules")
        .update({ next_run_at: nextRun.toISOString() })
        .eq("id", schedule.id);
    } else {
      // One-time: deactivate the schedule
      await supabase
        .from("creative_schedules")
        .update({ active: false, next_run_at: null })
        .eq("id", schedule.id);
    }

    // 10. Trigger queue processing
    fetch(`${supabaseUrl}/functions/v1/process-queue`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ trigger: "creative-drop" }),
    }).catch((e) => console.warn("[trigger-creative-drop] Queue trigger failed:", e));

    console.log(
      `[trigger-creative-drop] Drop ${drop.id} created with ${jobIds.length} jobs, ${errors.length} errors, cost=${totalCreditCost}`
    );

    return new Response(
      JSON.stringify({
        drop_id: drop.id,
        jobs_enqueued: jobIds.length,
        total_credits: totalCreditCost,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[trigger-creative-drop] Fatal error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
