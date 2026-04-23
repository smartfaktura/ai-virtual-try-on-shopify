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
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    const RESEND_AUDIENCE_ID = Deno.env.get("RESEND_AUDIENCE_ID");
    if (!RESEND_AUDIENCE_ID) throw new Error("RESEND_AUDIENCE_ID not configured");

    // Validate the email belongs to a real Supabase auth user (service-role lookup).
    // We do not require the caller's JWT because this endpoint is also invoked
    // immediately after sign-up, before the user has confirmed their email and
    // before a session token exists on the client.
    const { email: bodyEmail } = await req.clone().json().catch(() => ({ email: null }));
    if (!bodyEmail || typeof bodyEmail !== "string") {
      return new Response(JSON.stringify({ error: "Missing email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Confirm the email exists in profiles (created by the handle_new_user trigger).
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("user_id")
      .eq("email", bodyEmail)
      .maybeSingle();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: "Unknown user" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email, first_name, opted_in, properties } = await req.json();

    if (opted_in) {
      // Build contact payload with optional properties
      const contactPayload: Record<string, unknown> = {
        email,
        first_name: first_name || undefined,
        unsubscribed: false,
      };

      // Forward custom properties for Resend audience segmentation
      // (callers may include product_categories AND product_subcategories for granular targeting)
      if (properties && typeof properties === "object") {
        contactPayload.properties = properties;
      }

      const res = await fetch(
        `https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(contactPayload),
        }
      );
      if (!res.ok) {
        const errBody = await res.text();
        console.error("Resend add contact failed:", res.status, errBody);
      }
    } else {
      // Remove contact from audience
      const res = await fetch(
        `https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts/${email}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
        }
      );
      if (!res.ok) {
        const errBody = await res.text();
        console.error("Resend remove contact failed:", res.status, errBody);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("sync-resend-contact error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
