import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    const RESEND_AUDIENCE_ID = Deno.env.get("RESEND_AUDIENCE_ID");
    if (!RESEND_AUDIENCE_ID) throw new Error("RESEND_AUDIENCE_ID not configured");

    // Require service role (admin-only operation)
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (token !== serviceRoleKey) {
      // Fall back to checking if caller is admin
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Check admin role
      const { data: roleData } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      if (!roleData) {
        return new Response(JSON.stringify({ error: "Admin only" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Fetch all opted-in profiles using service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: profiles, error: dbError } = await adminClient
      .from("profiles")
      .select("email, first_name")
      .eq("marketing_emails_opted_in", true);

    if (dbError) throw dbError;

    let added = 0;
    let failed = 0;

    for (const profile of profiles ?? []) {
      const res = await fetch(
        `https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: profile.email,
            first_name: profile.first_name || undefined,
            unsubscribed: false,
          }),
        }
      );
      if (res.ok) {
        added++;
      } else {
        failed++;
        console.error(`Failed for ${profile.email}:`, res.status, await res.text());
      }
    }

    return new Response(
      JSON.stringify({ success: true, total: profiles?.length ?? 0, added, failed }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("backfill-resend-audience error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
