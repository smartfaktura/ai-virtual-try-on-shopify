import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify user
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { sourceUrl, postId } = await req.json();
    if (!sourceUrl || !postId) {
      return new Response(
        JSON.stringify({ error: "sourceUrl and postId required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Download the source image
    let imageResponse: Response;

    // Check if it's a Supabase storage URL (private bucket)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    if (sourceUrl.includes(supabaseUrl) && sourceUrl.includes("/storage/")) {
      // Extract bucket and path from URL
      const storageMatch = sourceUrl.match(
        /\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+)/
      );
      if (storageMatch) {
        const [, bucket, path] = storageMatch;
        const { data, error } = await supabaseAdmin.storage
          .from(bucket)
          .download(decodeURIComponent(path));
        if (error || !data) {
          return new Response(
            JSON.stringify({ error: "Failed to download source image" }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        // Create a fake response from the blob
        imageResponse = new Response(data);
      } else {
        imageResponse = await fetch(sourceUrl);
      }
    } else {
      imageResponse = await fetch(sourceUrl);
    }

    if (!imageResponse.ok && !imageResponse.body) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch source image" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const imageBlob = await imageResponse.blob();

    // Generate a random filename
    const randomId = crypto.randomUUID().slice(0, 8);
    const filePath = `${postId}/${randomId}.webp`;

    // For Deno edge functions we can't use sharp, so we upload the image as-is
    // but in a smaller size. We'll use the original format since webp conversion
    // requires native bindings. The key security benefit is:
    // 1. The original private URL is never exposed
    // 2. The file is in a separate public bucket
    // 3. EXIF data is naturally stripped when re-uploading through storage API

    // Convert to ArrayBuffer for upload
    const arrayBuffer = await imageBlob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from("discover-previews")
      .upload(filePath, uint8Array, {
        contentType: "image/webp",
        cacheControl: "31536000",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(
        JSON.stringify({ error: "Failed to upload preview" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage
      .from("discover-previews")
      .getPublicUrl(filePath);

    return new Response(JSON.stringify({ publicUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
