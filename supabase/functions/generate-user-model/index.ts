import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Check plan
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("plan, credits_balance")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (!["growth", "pro", "enterprise"].includes(profile.plan)) {
      return new Response(JSON.stringify({ error: "This feature requires a Growth or Pro plan", code: "PLAN_REQUIRED" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (profile.credits_balance < 20) {
      return new Response(JSON.stringify({ error: "Insufficient credits. You need 20 credits to generate a model.", code: "INSUFFICIENT_CREDITS" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { imageUrl } = await req.json();
    if (!imageUrl) throw new Error("imageUrl is required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Step 1: Analyze reference image for metadata
    console.log("Analyzing reference image...");
    const analyzeRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this image of a person for use as a virtual model reference in fashion photography. Return a JSON object with these fields:
- "name": A realistic first name for this model
- "gender": One of: male, female
- "body_type": One of: slim, athletic, average, plus-size
- "ethnicity": A brief description (e.g. "Caucasian", "East Asian", "Black", "South Asian", "Hispanic", "Middle Eastern", "Mixed")
- "age_range": One of: young-adult, adult, mature
- "appearance_description": A detailed 2-3 sentence description of the person's physical appearance including hair color/style, skin tone, facial features, and overall look. This will be used to generate a studio portrait.

Return ONLY the JSON object, no markdown or explanation.`,
            },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        }],
      }),
    });

    if (!analyzeRes.ok) {
      const errText = await analyzeRes.text();
      console.error("AI analyze error:", analyzeRes.status, errText);
      throw new Error("Failed to analyze reference image");
    }

    const analyzeData = await analyzeRes.json();
    const analyzeContent = analyzeData.choices?.[0]?.message?.content || "";
    const jsonMatch = analyzeContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse AI analysis");
    const metadata = JSON.parse(jsonMatch[0]);

    console.log("Metadata extracted:", JSON.stringify(metadata));

    // Step 2: Generate professional model portrait
    console.log("Generating model portrait...");
    const genderWord = metadata.gender === "male" ? "male" : "female";
    const generatePrompt = `Professional fashion model studio portrait photograph of a ${genderWord} model. ${metadata.appearance_description}. Clean white studio background, professional fashion photography lighting, sharp focus, high-end editorial quality, waist-up portrait, looking at camera with a natural confident expression. 8K quality.`;

    const generateRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: generatePrompt },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!generateRes.ok) {
      const errText = await generateRes.text();
      console.error("AI generate error:", generateRes.status, errText);
      // Refund won't happen yet since we haven't deducted
      throw new Error("Failed to generate model image");
    }

    const generateData = await generateRes.json();
    const generatedImageUrl = generateData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImageUrl) {
      throw new Error("No image was generated");
    }

    // Step 3: Deduct credits (do this after successful generation)
    const { data: newBalance, error: deductError } = await supabaseAdmin.rpc("deduct_credits", {
      p_user_id: user.id,
      p_amount: 20,
    });

    if (deductError) {
      console.error("Credit deduction failed:", deductError);
      throw new Error("Failed to deduct credits");
    }

    // Step 4: Upload generated image to storage
    const base64Data = generatedImageUrl.replace(/^data:image\/\w+;base64,/, "");
    const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
    const fileName = `${user.id}/model-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.png`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("scratch-uploads")
      .upload(fileName, imageBytes, { contentType: "image/png", upsert: false });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error("Failed to upload generated image");
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from("scratch-uploads")
      .getPublicUrl(fileName);

    const finalImageUrl = publicUrlData.publicUrl;

    // Step 5: Insert into user_models
    const { data: newModel, error: insertError } = await supabaseAdmin
      .from("user_models")
      .insert({
        user_id: user.id,
        name: metadata.name || "My Model",
        gender: metadata.gender || "female",
        body_type: metadata.body_type || "average",
        ethnicity: metadata.ethnicity || "",
        age_range: metadata.age_range || "adult",
        image_url: finalImageUrl,
        source_image_url: imageUrl,
        credits_used: 20,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error("Failed to save model");
    }

    return new Response(JSON.stringify({ model: newModel, new_balance: newBalance }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-user-model error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
