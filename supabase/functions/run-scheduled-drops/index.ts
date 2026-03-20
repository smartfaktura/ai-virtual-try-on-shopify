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
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
    if (authHeader !== `Bearer ${serviceRoleKey}`) {
      // Also allow anon key calls from pg_cron via pg_net
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
      if (!anonKey || authHeader !== `Bearer ${anonKey}`) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // Find all due schedules
    const { data: dueSchedules, error: queryError } = await supabase
      .from("creative_schedules")
      .select("id, user_id")
      .eq("active", true)
      .lte("next_run_at", new Date().toISOString())
      .not("next_run_at", "is", null);

    if (queryError) {
      console.error("[run-scheduled-drops] Query error:", queryError);
      return new Response(JSON.stringify({ error: queryError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!dueSchedules || dueSchedules.length === 0) {
      return new Response(JSON.stringify({ triggered: 0, message: "No due schedules" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[run-scheduled-drops] Found ${dueSchedules.length} due schedule(s)`);

    const results: Array<{ schedule_id: string; status: string; error?: string }> = [];

    for (const schedule of dueSchedules) {
      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/trigger-creative-drop`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            "Content-Type": "application/json",
            "x-queue-internal": "true",
          },
          body: JSON.stringify({
            schedule_id: schedule.id,
            user_id: schedule.user_id,
          }),
        });

        const body = await response.text();
        if (response.ok) {
          results.push({ schedule_id: schedule.id, status: "triggered" });
          console.log(`[run-scheduled-drops] Triggered schedule ${schedule.id} for user ${schedule.user_id}`);
        } else {
          results.push({ schedule_id: schedule.id, status: "failed", error: body });
          console.error(`[run-scheduled-drops] Failed schedule ${schedule.id}: ${body}`);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        results.push({ schedule_id: schedule.id, status: "error", error: msg });
        console.error(`[run-scheduled-drops] Error triggering schedule ${schedule.id}:`, e);
      }
    }

    return new Response(
      JSON.stringify({ triggered: results.filter(r => r.status === "triggered").length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[run-scheduled-drops] Fatal error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
