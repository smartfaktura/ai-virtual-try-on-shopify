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

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader! } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
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
