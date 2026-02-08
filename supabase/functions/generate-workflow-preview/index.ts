import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const workflowPrompts: Record<string, string> = {
  "Virtual Try-On Set":
    "Ultra high resolution bright editorial fashion photography. A beautiful female model wearing a stylish cream ribbed knit outfit standing in a luxurious soft-lit professional studio. Full body shot, 3:4 portrait orientation, shallow depth of field, warm golden-hour tones, clean creamy background. Ultra sharp details, bright natural lighting, premium magazine-quality fashion editorial. No text, no watermarks.",

  "Social Media Pack":
    "Ultra high resolution vibrant social media lifestyle photography. A curated aspirational scene — a beautiful woman in golden hour light holding a luxury skincare product, surrounded by soft bokeh and warm tones. Bright saturated colors, 3:4 portrait orientation, trendy commercial photography with natural sunshine. Ultra sharp, premium aesthetic. No text, no watermarks.",

  "Product Listing Set":
    "Ultra high resolution clean premium e-commerce product photography. A luxury glass skincare bottle on polished white marble surface with soft diffused natural studio lighting, minimal shadows, and gentle reflections. Crisp ultra-sharp details, 3:4 portrait orientation, bright airy minimalist commercial product shot. No text, no watermarks.",

  "Lifestyle Set":
    "Ultra high resolution lifestyle product photography. An elegant soy candle and artisan home decor items beautifully arranged in a bright Scandinavian living room setting with warm morning sunlight streaming through sheer curtains, linen textures, and natural botanicals. 3:4 portrait orientation, bright warm editorial interior photography. Ultra sharp. No text, no watermarks.",

  "Website Hero Set":
    "Ultra high resolution cinematic fashion editorial photograph. A stunning model in an elegant flowing silk dress walking through a lush sun-drenched botanical garden with dramatic golden-hour backlighting and lens flare. 3:4 portrait orientation, wide aspirational composition, bright vibrant hero banner imagery. Ultra sharp details, premium aesthetic. No text, no watermarks.",

  "Ad Refresh Set":
    "Ultra high resolution dynamic advertising fashion photography. An athletic model in a bold modern streetwear outfit confidently posing against a vibrant colorful urban backdrop with warm golden light. High contrast, energetic confident composition, 3:4 portrait orientation, bright commercial ad campaign style. Ultra sharp, premium aesthetic. No text, no watermarks.",

  "Selfie / UGC Set":
    "Ultra high resolution casual user-generated content style photo. A beautiful young woman taking a bright well-lit mirror selfie in a stylish warm-toned cafe, casually holding a luxury skincare product. Natural phone-camera aesthetic with soft warm golden tones and natural window light. 3:4 portrait orientation, authentic and aspirational UGC style. Ultra sharp. No text, no watermarks.",

  "Flat Lay Set":
    "Ultra high resolution overhead flat lay product photography. A beautifully styled arrangement of premium cosmetics, brushes, and skincare products on clean white marble with fresh eucalyptus sprigs and delicate gold accents. Bright natural top-down lighting, 3:4 portrait orientation, luxury editorial flat lay. Ultra sharp crisp details. No text, no watermarks.",

  "Seasonal Campaign Set":
    "Ultra high resolution seasonal product photography concept. A luxury skincare bottle elegantly surrounded by fresh spring cherry blossoms and soft pink petals with bright natural daylight and a clean pastel background. 3:4 portrait orientation, cohesive premium seasonal campaign imagery. Ultra sharp, bright aesthetic. No text, no watermarks.",

  "Before & After Set":
    "Ultra high resolution bright skincare transformation photography. A close-up of radiant glowing skin with soft professional studio lighting, clean clinical yet aspirational aesthetic with bright white background. Dewey fresh skin texture, 3:4 portrait orientation, premium wellness brand imagery. Ultra sharp, bright and natural. No text, no watermarks.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { workflow_id, regenerate } = await req.json();
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
      .select("name, description, preview_image_url")
      .eq("id", workflow_id)
      .single();

    if (wfErr || !workflow) {
      return new Response(JSON.stringify({ error: "Workflow not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Skip if already has preview and not regenerating
    if (workflow.preview_image_url && !regenerate) {
      return new Response(
        JSON.stringify({ success: true, preview_image_url: workflow.preview_image_url, skipped: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = workflowPrompts[workflow.name] ||
      `Ultra high resolution professional product photography representing "${workflow.name}". ${workflow.description}. 3:4 portrait orientation, bright natural lighting, ultra sharp, premium aesthetic. No text, no watermarks.`;

    console.log(`Generating preview for "${workflow.name}" with prompt: ${prompt.substring(0, 100)}...`);

    // Generate image via AI gateway — premium model
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
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
    const fileName = `${workflow_id}.${ext}`;

    // Upload to storage bucket (upsert to overwrite on regenerate)
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

    // Get public URL with cache-busting timestamp
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
