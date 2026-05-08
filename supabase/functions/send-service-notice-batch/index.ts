import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // One-time admin batch — verify caller is admin via has_role check
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  // Verify caller is admin
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  const anonClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: roleCheck } = await anonClient.rpc("has_role", {
    _user_id: (await anonClient.auth.getUser()).data?.user?.id,
    _role: "admin",
  });
  if (!roleCheck) {
    return new Response(JSON.stringify({ error: "Admin only" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const emails = [
    "stewartryananderson@gmail.com",
    "johns101609@gmail.com",
    "tyty.meadors@gmail.com",
    "b@x-art.com",
    "ievute040@gmail.com",
    "ileana.santana@aol.com",
    "mgdesigns@sbcglobal.net",
  ];

  const results: Array<{ email: string; ok: boolean; detail?: string }> = [];

  for (const email of emails) {
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: "service_notice", to: email, data: {} }),
      });
      const body = await res.json();
      results.push({ email, ok: res.ok, detail: JSON.stringify(body) });
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      results.push({ email, ok: false, detail: String(err) });
    }
  }

  return new Response(JSON.stringify({ results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
