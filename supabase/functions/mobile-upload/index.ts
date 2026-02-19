import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const url = new URL(req.url);
  const action = url.searchParams.get("action") || "";

  try {
    // ──────────────────────────────────────────
    // CREATE SESSION (authenticated, from desktop)
    // ──────────────────────────────────────────
    if (req.method === "POST" && action === "create-session") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });

      const token = authHeader.replace("Bearer ", "");
      const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
      if (claimsError || !claimsData?.claims) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const userId = claimsData.claims.sub as string;

      // Generate a secure random session token
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      const sessionToken = Array.from(array)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      // 15-minute expiry
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      // Insert session using the user's auth context (RLS enforced)
      const { data: session, error: insertError } = await supabase
        .from("mobile_upload_sessions")
        .insert({
          user_id: userId,
          session_token: sessionToken,
          status: "pending",
          expires_at: expiresAt,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Session insert error:", insertError);
        return new Response(JSON.stringify({ error: "Failed to create session" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({
          session_token: sessionToken,
          expires_at: expiresAt,
          session_id: session.id,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ──────────────────────────────────────────
    // UPLOAD (public, from mobile – validated via session token)
    // ──────────────────────────────────────────
    if (req.method === "POST" && action === "upload") {
      const formData = await req.formData();
      const sessionToken = formData.get("session_token") as string;
      const file = formData.get("file") as File;

      if (!sessionToken || !file) {
        return new Response(
          JSON.stringify({ error: "session_token and file are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Use admin client to look up session (bypasses RLS since mobile user isn't logged in)
      const adminClient = createClient(supabaseUrl, serviceRoleKey);

      const { data: session, error: sessionError } = await adminClient
        .from("mobile_upload_sessions")
        .select("*")
        .eq("session_token", sessionToken)
        .eq("status", "pending")
        .single();

      if (sessionError || !session) {
        return new Response(JSON.stringify({ error: "Invalid or expired session" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check expiry
      if (new Date(session.expires_at) < new Date()) {
        await adminClient
          .from("mobile_upload_sessions")
          .update({ status: "expired" })
          .eq("id", session.id);

        return new Response(JSON.stringify({ error: "Session has expired" }), {
          status: 410,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Upload to user's secure folder
      const userId = session.user_id;
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const ext = file.name?.split(".").pop()?.toLowerCase() || "jpg";
      const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg";
      const filePath = `${userId}/${timestamp}-${randomId}.${safeExt}`;

      const { data: uploadData, error: uploadError } = await adminClient.storage
        .from("product-uploads")
        .upload(filePath, file, {
          contentType: file.type || "image/jpeg",
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Mobile upload error:", uploadError);
        return new Response(JSON.stringify({ error: "Failed to upload image" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Generate signed URL (private bucket)
      const { data: signedUrlData } = await adminClient.storage
        .from("product-uploads")
        .createSignedUrl(uploadData.path, 60 * 60 * 24 * 365);

      const imageUrl = signedUrlData?.signedUrl || "";

      // Update session with the image URL
      await adminClient
        .from("mobile_upload_sessions")
        .update({ status: "uploaded", image_url: imageUrl })
        .eq("id", session.id);

      return new Response(
        JSON.stringify({ success: true, image_url: imageUrl }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ──────────────────────────────────────────
    // STATUS CHECK (authenticated, from desktop)
    // ──────────────────────────────────────────
    if (req.method === "GET" && action === "status") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });

      const token = authHeader.replace("Bearer ", "");
      const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
      if (claimsError || !claimsData?.claims) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const sessionToken = url.searchParams.get("token");
      if (!sessionToken) {
        return new Response(JSON.stringify({ error: "token param required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Query the specific token first (RLS ensures they only see their own sessions)
      const { data: session, error: sessionError } = await supabase
        .from("mobile_upload_sessions")
        .select("status, image_url, expires_at")
        .eq("session_token", sessionToken)
        .single();

      if (sessionError || !session) {
        return new Response(JSON.stringify({ error: "Session not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // If the specific token is still pending, check if ANY other session
      // for this user was recently uploaded (handles session mismatch on remount)
      if (session.status === "pending") {
        const userId = claimsData.claims.sub as string;
        const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
        const adminClient = createClient(supabaseUrl, serviceRoleKey);

        const { data: uploaded } = await adminClient
          .from("mobile_upload_sessions")
          .select("image_url")
          .eq("user_id", userId)
          .eq("status", "uploaded")
          .gte("created_at", fifteenMinAgo)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (uploaded?.image_url) {
          return new Response(
            JSON.stringify({ status: "uploaded", image_url: uploaded.image_url, expires_at: session.expires_at }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      return new Response(JSON.stringify(session), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ──────────────────────────────────────────
    // VALIDATE SESSION (public, from mobile page)
    // ──────────────────────────────────────────
    if (req.method === "GET" && action === "validate") {
      const sessionToken = url.searchParams.get("token");
      if (!sessionToken) {
        return new Response(JSON.stringify({ error: "token param required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const adminClient = createClient(supabaseUrl, serviceRoleKey);
      const { data: session, error: sessionError } = await adminClient
        .from("mobile_upload_sessions")
        .select("status, expires_at")
        .eq("session_token", sessionToken)
        .eq("status", "pending")
        .single();

      if (sessionError || !session) {
        return new Response(JSON.stringify({ valid: false, error: "Invalid session" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const expired = new Date(session.expires_at) < new Date();
      return new Response(
        JSON.stringify({ valid: !expired, expired }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Mobile upload error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
