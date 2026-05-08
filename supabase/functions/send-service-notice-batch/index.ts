import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${serviceRoleKey}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;

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
      const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: "service_notice", to: email, data: {} }),
      });
      const body = await res.json();
      results.push({ email, ok: res.ok, detail: JSON.stringify(body) });
      // Small delay between sends
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      results.push({ email, ok: false, detail: String(err) });
    }
  }

  return new Response(JSON.stringify({ results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
