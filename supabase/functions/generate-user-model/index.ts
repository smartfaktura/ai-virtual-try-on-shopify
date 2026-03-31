import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Detect actual image format from magic bytes ──────────────────────────
function detectImageFormat(bytes: Uint8Array): { ext: string; contentType: string } {
  if (bytes[0] === 0xFF && bytes[1] === 0xD8) return { ext: 'jpg', contentType: 'image/jpeg' };
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[8] === 0x57 && bytes[9] === 0x45) return { ext: 'webp', contentType: 'image/webp' };
  return { ext: 'png', contentType: 'image/png' };
}

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

async function generateSingleImage(
  prompt: string,
  referenceContent: any[] | undefined,
  apiKey: string
): Promise<string> {
  const messageContent: any[] = [{ type: "text", text: prompt }];
  if (referenceContent) messageContent.push(...referenceContent);

  const res = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gemini-3-pro-image-preview",
      messages: [{ role: "user", content: messageContent }],
      modalities: ["image", "text"],
    }),
  });

  if (!res.ok) {
    const status = res.status;
    if (status === 429) throw new Error("RATE_LIMIT");
    if (status === 402) throw new Error("AI_CREDITS_EXHAUSTED");
    throw new Error("Failed to generate model image");
  }

  const data = await res.json();
  const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!imageUrl) throw new Error("No image was generated");
  return imageUrl;
}

async function uploadBase64Image(
  supabaseAdmin: any,
  userId: string,
  base64Url: string
): Promise<string> {
  const base64Data = base64Url.replace(/^data:image\/\w+;base64,/, "");
  const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
  const fileName = `${userId}/model-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.png`;

  const { error } = await supabaseAdmin.storage
    .from("scratch-uploads")
    .upload(fileName, imageBytes, { contentType: "image/png", upsert: false });

  if (error) throw new Error("Failed to upload generated image");

  const { data: publicUrlData } = supabaseAdmin.storage
    .from("scratch-uploads")
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
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

    const body = await req.json();

    // ─── Action: publish-public (admin selects a variation and publishes) ───
    if (body.action === "publish-public") {
      const { data: adminCheck } = await supabaseAdmin.rpc("has_role", { _user_id: user.id, _role: "admin" });
      if (!adminCheck) {
        return new Response(JSON.stringify({ error: "Admin access required" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const { selectedUrl, metadata, name } = body;
      if (!selectedUrl || !metadata) throw new Error("selectedUrl and metadata are required");

      const { data, error: insertError } = await supabaseAdmin
        .from("custom_models")
        .insert({
          created_by: user.id,
          name: name || metadata.name || "Public Model",
          gender: metadata.gender || "female",
          body_type: metadata.body_type || "average",
          ethnicity: metadata.ethnicity || "",
          age_range: metadata.age_range || "adult",
          image_url: selectedUrl,
        })
        .select()
        .single();

      if (insertError) throw new Error("Failed to save public model");

      return new Response(JSON.stringify({ model: data, target: "public" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── Standard generation flow ───
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("plan, credits_balance")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const makePublic = body.makePublic === true;

    if (!makePublic && !["growth", "pro", "enterprise"].includes(profile.plan)) {
      return new Response(JSON.stringify({ error: "This feature requires a Growth or Pro plan", code: "PLAN_REQUIRED" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (!makePublic && profile.credits_balance < 20) {
      return new Response(JSON.stringify({ error: "Insufficient credits. You need 20 credits to generate a model.", code: "INSUFFICIENT_CREDITS" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const mode = body.mode || "generator";

    if (makePublic) {
      const { data: adminCheck } = await supabaseAdmin.rpc("has_role", { _user_id: user.id, _role: "admin" });
      if (!adminCheck) {
        return new Response(JSON.stringify({ error: "Admin access required" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    let metadata: any;
    let generatePrompt: string;
    let sourceImageUrl: string;
    let referenceContent: any[] | undefined;

    if (mode === "reference") {
      const imageUrl = body.imageUrl;
      if (!imageUrl) throw new Error("imageUrl is required");

      console.log("Analyzing reference image...");
      const analyzeRes = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gemini-2.5-flash",
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

      if (!analyzeRes.ok) throw new Error("Failed to analyze reference image");

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
      const d = body.description;
      if (!d) throw new Error("description is required for combined mode");
      metadata = extractMetadata(d);
      generatePrompt = buildPromptFromDescription(d);
      const imageUrl = body.imageUrl;
      if (imageUrl) {
        generatePrompt += " Generate a model that closely resembles the reference image provided. Match the facial structure, skin tone, and overall appearance while applying the described attributes.";
        sourceImageUrl = imageUrl;
        referenceContent = [{ type: "image_url", image_url: { url: imageUrl } }];
      } else {
        sourceImageUrl = "generator";
      }
    } else {
      const d = body.description;
      if (!d) throw new Error("description is required for generator mode");
      metadata = extractMetadata(d);
      generatePrompt = buildPromptFromDescription(d);
      sourceImageUrl = "generator";
    }

    // ─── Admin public: generate 3 variations, return URLs without inserting ───
    if (makePublic) {
      console.log("Generating 3 public model variations in parallel...");
      const variationCount = 3;
      const results = await Promise.allSettled(
        Array.from({ length: variationCount }, () =>
          generateSingleImage(generatePrompt, referenceContent, LOVABLE_API_KEY)
            .then((base64Url) => uploadBase64Image(supabaseAdmin, user.id, base64Url))
        )
      );

      const variations = results
        .filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled")
        .map((r) => r.value);

      if (variations.length === 0) {
        throw new Error("All 3 generation attempts failed. Please try again.");
      }

      return new Response(JSON.stringify({
        variations,
        metadata,
        name: body.name || metadata.name,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── Regular user: generate 1, deduct credits, insert ───
    console.log("Generating model portrait...");
    const generatedImageUrl = await generateSingleImage(generatePrompt, referenceContent, LOVABLE_API_KEY);

    const { data: bal, error: deductError } = await supabaseAdmin.rpc("deduct_credits", {
      p_user_id: user.id,
      p_amount: 20,
    });
    if (deductError) throw new Error("Failed to deduct credits");
    const newBalance = bal;

    const finalImageUrl = await uploadBase64Image(supabaseAdmin, user.id, generatedImageUrl);

    const modelName = body.name || metadata.name || "My Model";
    const { data, error: insertError } = await supabaseAdmin
      .from("user_models")
      .insert({
        user_id: user.id,
        name: modelName,
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

    if (insertError) throw new Error("Failed to save model");

    return new Response(JSON.stringify({ model: data, new_balance: newBalance, target: "private" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-user-model error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    const status = msg === "RATE_LIMIT" ? 429 : msg === "AI_CREDITS_EXHAUSTED" ? 402 : 500;
    const userMsg = msg === "RATE_LIMIT" ? "Rate limit exceeded, please try again in a moment."
      : msg === "AI_CREDITS_EXHAUSTED" ? "AI credits exhausted. Please try again later."
      : msg;
    return new Response(
      JSON.stringify({ error: userMsg }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
