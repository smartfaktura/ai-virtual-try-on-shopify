import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const UPSCALE_COST = 4;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = user.id;

    const { imageUrl, sourceType, sourceId } = await req.json();

    if (!imageUrl || !sourceType || !sourceId) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Deduct credits
    const { error: creditError } = await supabaseAdmin.rpc("deduct_credits", {
      p_user_id: userId,
      p_amount: UPSCALE_COST,
    });

    if (creditError) {
      console.error("Credit deduction failed:", creditError);
      return new Response(
        JSON.stringify({ error: creditError.message?.includes("Insufficient") ? "Insufficient credits" : "Credit deduction failed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    try {
      // Fetch original image as base64
      const imgResponse = await fetch(imageUrl);
      if (!imgResponse.ok) throw new Error("Failed to fetch source image");
      const imgBuffer = await imgResponse.arrayBuffer();
      // Chunked base64 encoding to avoid stack overflow on large images
      const uint8 = new Uint8Array(imgBuffer);
      let binary = '';
      const chunkSize = 8192;
      for (let i = 0; i < uint8.length; i += chunkSize) {
        binary += String.fromCharCode.apply(null, Array.from(uint8.slice(i, i + chunkSize)));
      }
      const imgBase64 = btoa(binary);
      const mimeType = imgResponse.headers.get("content-type") || "image/png";

      // Call AI to upscale
      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-pro-image-preview",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "[SOURCE IMAGE]: Reproduce this exact image at the highest resolution possible. Preserve every detail, color, composition, lighting, and texture exactly. Ultra-sharp, no compression artifacts, maximum quality output. Do not change anything about the image — same framing, same content, same style. Just output at maximum resolution.",
                },
                {
                  type: "image_url",
                  image_url: { url: `data:${mimeType};base64,${imgBase64}` },
                },
              ],
            },
          ],
        }),
      });

      if (!aiResponse.ok) {
        const errText = await aiResponse.text();
        console.error("AI gateway error:", aiResponse.status, errText);
        throw new Error(`AI gateway error: ${aiResponse.status}`);
      }

      const aiResult = await aiResponse.json();

      // Extract image from response
      let newImageBase64: string | null = null;
      let newMimeType = "image/png";

      const content = aiResult.choices?.[0]?.message?.content;
      if (Array.isArray(content)) {
        for (const part of content) {
          if (part.type === "image_url" && part.image_url?.url) {
            const dataUrl = part.image_url.url as string;
            const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
            if (match) {
              newMimeType = match[1];
              newImageBase64 = match[2];
              break;
            }
          }
        }
      }

      if (!newImageBase64) {
        throw new Error("No image returned from AI");
      }

      // Decode base64 to bytes
      const binaryStr = atob(newImageBase64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      const ext = newMimeType.includes("png") ? "png" : "jpg";
      const storagePath = `upscaled/${userId}/${sourceId}-prohd.${ext}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from("freestyle-images")
        .upload(storagePath, bytes, {
          contentType: newMimeType,
          upsert: true,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error("Failed to upload upscaled image");
      }

      const { data: publicUrlData } = supabaseAdmin.storage
        .from("freestyle-images")
        .getPublicUrl(storagePath);

      const newImageUrl = publicUrlData.publicUrl;

      // Update source record
      if (sourceType === "freestyle") {
        const { error: updateError } = await supabaseAdmin
          .from("freestyle_generations")
          .update({ image_url: newImageUrl, quality: "upscaled" })
          .eq("id", sourceId)
          .eq("user_id", userId);

        if (updateError) {
          console.error("DB update error:", updateError);
          throw new Error("Failed to update record");
        }
      }

      return new Response(
        JSON.stringify({ success: true, imageUrl: newImageUrl }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (processError) {
      // Refund credits on failure
      console.error("Processing error, refunding credits:", processError);
      await supabaseAdmin.rpc("refund_credits", {
        p_user_id: userId,
        p_amount: UPSCALE_COST,
      });

      return new Response(
        JSON.stringify({ error: processError instanceof Error ? processError.message : "Upscale failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (e) {
    console.error("Unexpected error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
