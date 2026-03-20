import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VALID_INQUIRY_TYPES = ["general", "billing", "technical", "feature", "enterprise", "partnership"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Optional auth — extract user if token present, but don't require it
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ") && authHeader.length > 10) {
      try {
        const supabaseAuth = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
          global: { headers: { Authorization: authHeader } },
        });
        const token = authHeader.replace("Bearer ", "");
        const { data: { user } } = await supabaseAuth.auth.getUser(token);
        if (user) userId = user.id;
      } catch {
        // Token invalid — proceed as anonymous
      }
    }

    const { name, email, message, inquiryType } = await req.json();

    // Validate inputs
    if (!name || typeof name !== "string" || name.trim().length === 0 || name.length > 100) {
      return new Response(JSON.stringify({ error: "Invalid name" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!email || typeof email !== "string" || !email.includes("@") || email.length > 255) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!message || typeof message !== "string" || message.trim().length === 0 || message.length > 5000) {
      return new Response(JSON.stringify({ error: "Invalid message" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const safeInquiryType = VALID_INQUIRY_TYPES.includes(inquiryType) ? inquiryType : "general";
    const trimName = name.trim();
    const trimEmail = email.trim();
    const trimMessage = message.trim();

    // Use service role client to insert into contact_submissions
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { error: insertError } = await supabaseAdmin
      .from("contact_submissions")
      .insert({
        name: trimName,
        email: trimEmail,
        inquiry_type: safeInquiryType,
        message: trimMessage,
      });

    if (insertError) {
      console.error("[send-contact] DB insert error:", insertError);
      return new Response(JSON.stringify({ error: "Failed to save submission" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send email notification via send-email function
    const emailRes = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "contact_form",
        to: "hello@vovv.ai",
        data: {
          name: trimName,
          email: trimEmail,
          message: trimMessage,
          inquiryType: safeInquiryType,
          ...(userId ? { userId } : {}),
        },
      }),
    });

    const emailBody = await emailRes.json().catch(() => ({}));

    if (!emailRes.ok) {
      console.error("[send-contact] send-email error:", JSON.stringify(emailBody), "status:", emailRes.status);
      // DB insert succeeded, so still return success — email failure is non-fatal
      console.warn("[send-contact] Email send failed but submission saved to DB");
    } else {
      console.log(`[send-contact] ✓ Contact form from ${trimEmail}${userId ? ` (user: ${userId})` : ""}, email id: ${emailBody.id}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[send-contact] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
