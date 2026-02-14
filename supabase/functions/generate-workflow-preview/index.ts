import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const workflowPrompts: Record<string, string> = {
  "Virtual Try-On Set":
    "Ultra high resolution editorial fashion photography. A female model wearing a stylish cream knit outfit standing in a soft-lit professional studio. Full body shot, 3:4 portrait orientation, shallow depth of field, warm neutral tones, clean background. Magazine-quality fashion editorial.",
  "Social Media Pack":
    "Ultra high resolution vibrant social media lifestyle photography collage concept. A curated grid of lifestyle moments — coffee in hand, golden hour portrait, styled product flat lay, urban street snap. Bright saturated colors, 3:4 portrait orientation, aspirational and trendy commercial photography.",
  "Product Listing Set":
    "Ultra high resolution professional product photography collage concept. A luxury skincare bottle shown in multiple scenes: clean white studio, elegant marble surface, natural linen texture, and dramatic dark moody lighting. Each scene shows the same product with perfectly matched lighting and shadows. No people, no hands. 3:4 portrait orientation, premium commercial product photography.",
  "Lifestyle Set":
    "Ultra high resolution lifestyle product photography. An elegant candle and home decor items arranged in a cozy living room setting with warm ambient lighting, linen textures, and soft bokeh. 3:4 portrait orientation, editorial interior photography.",
  "Website Hero Set":
    "Ultra high resolution cinematic 16:9 landscape website hero banner photograph. A model in an elegant blazer standing on the left third of the frame against a warm golden-hour architectural backdrop. The right half of the image is clean negative space with soft blurred background, designed for text overlay and CTA buttons. Professional website hero banner composition with dramatic lighting, shallow depth of field, and aspirational commercial editorial quality. Wide horizontal format.",
  "Ad Refresh Set":
    "Ultra high resolution dynamic advertising fashion photography. A model in a bold streetwear outfit against a vibrant urban backdrop with graffiti walls and neon accents. High contrast, energetic composition, 3:4 portrait orientation, commercial ad campaign style.",
  "Selfie / UGC Set":
    "Ultra high resolution casual user-generated content style photo. A young woman taking a mirror selfie in a warm coffee shop, holding a skincare product, natural phone-camera aesthetic with soft warm tones. 3:4 portrait orientation, authentic and relatable UGC style. No text, no watermarks, no overlays, no labels, no UI elements.",
  "Mirror Selfie Set":
    "Full height photograph of a beautiful blonde top model taking a mirror selfie with her smartphone visible in the reflection, standing in a cozy decorated bedroom with warm ambient lighting. She is wearing a white crop top. Natural casual pose, phone held at chest level, soft bokeh background. 3:4 portrait orientation, realistic smartphone camera aesthetic, no text, no watermarks, no overlays, no labels, no UI elements, no graphics, just the photograph.",
  "Flat Lay Set":
    "Ultra high resolution overhead flat lay product photography. A beautifully arranged collection of fashion accessories, cosmetics, and lifestyle items on a clean white marble surface with eucalyptus leaves and gold accents. 3:4 portrait orientation, styled editorial flat lay.",
  "Seasonal Campaign Set":
    "Ultra high resolution four-season product photography concept. A split composition showing the same elegant product across four seasonal settings — spring cherry blossoms, summer sunshine, autumn golden leaves, winter frost. 3:4 portrait orientation, cohesive campaign imagery.",
  "Before & After Set":
    "Ultra high resolution before and after skincare transformation photography. A clean split-screen composition showing skin texture improvement, soft studio lighting, clinical yet aspirational aesthetic. 3:4 portrait orientation, wellness brand imagery.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { workflow_id } = await req.json();
    if (!workflow_id) {
      return new Response(JSON.stringify({ error: "workflow_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch workflow
    const { data: workflow, error: wfErr } = await supabase
      .from("workflows")
      .select("name, description")
      .eq("id", workflow_id)
      .single();

    if (wfErr || !workflow) {
      return new Response(JSON.stringify({ error: "Workflow not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = workflowPrompts[workflow.name] ||
      `Ultra high resolution professional product photography representing "${workflow.name}". ${workflow.description}. 3:4 portrait orientation, commercial quality.`;

    console.log(`Generating preview for "${workflow.name}" with prompt: ${prompt.substring(0, 100)}...`);

    // Generate image via AI gateway
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);

      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      throw new Error(`AI generation failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const imageDataUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageDataUrl) {
      throw new Error("No image returned from AI gateway");
    }

    // Decode base64 image
    const base64Data = imageDataUrl.replace(/^data:image\/\w+;base64,/, "");
    const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    // Determine file extension from data URL
    const mimeMatch = imageDataUrl.match(/^data:image\/(\w+);/);
    const ext = mimeMatch ? mimeMatch[1] : "png";
    const fileName = `${workflow_id}_${Date.now()}.${ext}`;

    // Upload to storage bucket
    const { error: uploadErr } = await supabase.storage
      .from("workflow-previews")
      .upload(fileName, imageBytes, {
        contentType: `image/${ext}`,
        upsert: true,
      });

    if (uploadErr) {
      console.error("Upload error:", uploadErr);
      throw new Error(`Storage upload failed: ${uploadErr.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("workflow-previews")
      .getPublicUrl(fileName);

    const publicUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

    // Update workflow row with preview URL
    const { error: updateErr } = await supabase
      .from("workflows")
      .update({ preview_image_url: publicUrl })
      .eq("id", workflow_id);

    if (updateErr) {
      console.error("Update error:", updateErr);
      throw new Error(`Failed to update workflow: ${updateErr.message}`);
    }

    console.log(`Preview generated for "${workflow.name}": ${publicUrl}`);

    return new Response(
      JSON.stringify({ success: true, preview_image_url: publicUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-workflow-preview error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
