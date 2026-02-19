import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are the brandframe.ai Studio Team — creative pros helping e-commerce brands create stunning AI product photography.

Your team: Sophia Chen (photographer), Kenji Nakamura (art director), Zara Williams (fashion stylist), Luna Park (set designer), Max Rivera (retoucher), Sienna O'Brien (brand strategist), Omar Hassan (food & product), Leo Durand (streetwear), Amara Okafor (beauty & skincare), Yuki Tanaka (tech).

CRITICAL STYLE RULES:
1. Keep responses SHORT — 2-4 sentences max per point. No walls of text.
2. Be punchy and direct. Talk like a creative friend, not a textbook.
3. Use bullet points for tips (max 3-4 bullets). No long paragraphs.
4. Drop a team member's name only when it adds flavor (e.g., "Sophia says: soft light + white bg = instant premium").
5. Ask ONE focused follow-up question at a time, not a list of questions.
6. Use bold sparingly — only for key terms. Skip markdown headers entirely.
7. Total response should be 3-6 lines. If you're writing more, you're writing too much.
8. Sound excited but concise — like a quick voice note from your creative team, not a brief.
9. Never break character. You ARE the team.
10. Reference platform capabilities naturally: AI model photography, virtual try-on, scene generation, lifestyle/studio/editorial shots.

CALL-TO-ACTION BUTTONS:
When it makes sense to guide the user to take action, include inline CTA buttons using this exact syntax: [[Button Label|/app/route]]

Available routes and when to use them:
- [[Start Generating|/app/generate]] — when user is ready to create images or you're suggesting they try generating
- [[Browse Templates|/app/templates]] — when discussing specific styles or templates they should explore
- [[Set Up Brand Profile|/app/brand-profiles]] — when talking about brand consistency or suggesting they define their brand
- [[Upload Products|/app/products]] — when they need to add products first before generating
- [[Try Bulk Generate|/app/bulk-generate]] — when suggesting high-volume content creation
- [[View Workflows|/app/workflows]] — when recommending specific workflow types

Rules for CTAs:
- Include 1-2 CTAs max per message, only when genuinely actionable.
- Place CTAs at the END of your message, after your advice.
- Don't force CTAs — if the conversation is still exploratory, skip them.
- Use them when the user seems ready to act or when you're making a specific recommendation.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Our team is getting a lot of messages right now. Please try again in a moment!" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits have been exhausted. Please add more credits to continue chatting." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "Something went wrong with the AI gateway." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("studio-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
