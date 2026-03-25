import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function buildPromptFromDescription(d: any): string {
  const genderWord = d.gender || "Female";
  const ageVal = d.age || 28;

  const parts: string[] = [
    `Ultra-realistic professional fashion model studio portrait photograph, shot on Canon EOS R5 with 85mm f/1.4 lens.`,
    `${genderWord}, ${ageVal} years old, ${d.ethnicity || "Caucasian"} ethnicity, ${d.morphology || "average"} build.`,
  ];

  if (d.skinTone) parts.push(`${d.skinTone} skin tone.`);
  if (d.faceShape) parts.push(`${d.faceShape} face shape.`);
  if (d.eyeColor) parts.push(`${d.eyeColor} eyes.`);
  if (d.hairStyle && d.hairColor) {
    parts.push(`${d.hairColor} ${d.hairStyle.toLowerCase()} hair.`);
  } else if (d.hairStyle) {
    parts.push(`${d.hairStyle} hair.`);
  } else if (d.hairColor) {
    parts.push(`${d.hairColor} hair.`);
  }
  if (d.facialHair && d.facialHair !== "None") parts.push(`${d.facialHair} facial hair.`);
  if (d.expression) parts.push(`${d.expression} expression.`);
  if (d.distinctive) parts.push(`Distinctive feature: ${d.distinctive}.`);

  parts.push(
    "Light grey (#E8E8E8) seamless paper studio background.",
    "Soft diffused three-point Profoto lighting setup, subtle catch light in eyes,",
    "sharp focus on facial features at f/2.8, natural skin texture with visible pores,",
    "no retouching, no airbrushing, no AI artifacts, no uncanny valley.",
    "Editorial fashion photography, waist-up framing, subject centered,",
    "looking directly at camera. Color-accurate, neutral white balance. 8K resolution."
  );

  return parts.join(" ");
}

function extractMetadata(d: any) {
  const ageVal = d.age || 28;
  const ageLabel = ageVal < 13 ? "child" : ageVal < 18 ? "teenager" : ageVal < 30 ? "young-adult" : ageVal < 50 ? "adult" : "mature";
  return {
    name: `${d.gender || "Female"} Model`,
    gender: (d.gender || "female").toLowerCase(),
    body_type: d.morphology || "average",
    ethnicity: d.ethnicity || "",
    age_range: ageLabel,
  };
}

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

    const body = await req.json();
    const mode = body.mode || "generator";
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    let metadata: any;
    let generatePrompt: string;
    let sourceImageUrl: string;
    let referenceContent: any[] | undefined;

    if (mode === "reference") {
      // Legacy reference-only mode
      const imageUrl = body.imageUrl;
      if (!imageUrl) throw new Error("imageUrl is required");

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
      metadata = JSON.parse(jsonMatch[0]);

      const genderWord = metadata.gender === "male" ? "male" : "female";
      generatePrompt = `Ultra-realistic professional fashion model studio portrait photograph, shot on Canon EOS R5 with 85mm f/1.4 lens. ${genderWord} model. ${metadata.appearance_description}. Generate a model that closely resembles the reference image provided. Match the facial structure, skin tone, and overall appearance. Light grey (#E8E8E8) seamless paper studio background, soft diffused three-point Profoto lighting setup, subtle catch light in eyes, sharp focus on facial features at f/2.8, natural skin texture with visible pores, no retouching, no airbrushing, no AI artifacts, no uncanny valley. Editorial fashion photography, waist-up framing, subject centered, looking at camera with a natural confident expression. Color-accurate, neutral white balance. 8K resolution.`;
      sourceImageUrl = imageUrl;
      referenceContent = [{ type: "image_url", image_url: { url: imageUrl } }];

    } else if (mode === "combined") {
      // Combined mode: description + optional reference image
      const d = body.description;
      if (!d) throw new Error("description is required for combined mode");

      metadata = extractMetadata(d);
      generatePrompt = buildPromptFromDescription(d);

      // Append reference guidance if image provided
      const imageUrl = body.imageUrl;
      if (imageUrl) {
        generatePrompt += " Generate a model that closely resembles the reference image provided. Match the facial structure, skin tone, and overall appearance while applying the described attributes.";
        sourceImageUrl = imageUrl;
        referenceContent = [{ type: "image_url", image_url: { url: imageUrl } }];
      } else {
        sourceImageUrl = "generator";
      }

    } else {
      // Generator mode: build prompt from structured description
      const d = body.description;
      if (!d) throw new Error("description is required for generator mode");

      metadata = extractMetadata(d);
      generatePrompt = buildPromptFromDescription(d);
      sourceImageUrl = "generator";
    }

    // Generate portrait
    console.log("Generating model portrait...");
    const messageContent: any[] = [{ type: "text", text: generatePrompt }];
    if (referenceContent) messageContent.push(...referenceContent);

    const generateRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
        messages: [{ role: "user", content: messageContent }],
        modalities: ["image", "text"],
      }),
    });

    if (!generateRes.ok) {
      const errText = await generateRes.text();
      console.error("AI generate error:", generateRes.status, errText);
      if (generateRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again in a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (generateRes.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please try again later." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw new Error("Failed to generate model image");
    }

    const generateData = await generateRes.json();
    const generatedImageUrl = generateData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImageUrl) {
      throw new Error("No image was generated");
    }

    // Deduct credits
    const { data: newBalance, error: deductError } = await supabaseAdmin.rpc("deduct_credits", {
      p_user_id: user.id,
      p_amount: 20,
    });

    if (deductError) {
      console.error("Credit deduction failed:", deductError);
      throw new Error("Failed to deduct credits");
    }

    // Upload generated image to storage
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

    // Insert into user_models
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
        source_image_url: sourceImageUrl,
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
