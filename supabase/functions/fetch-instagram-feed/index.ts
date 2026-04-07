import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    // Verify admin
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY")!
    ).auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { username, account_id } = await req.json();
    if (!username || !account_id) {
      return new Response(JSON.stringify({ error: "username and account_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apifyKey = Deno.env.get("APIFY_API_KEY");
    if (!apifyKey) {
      return new Response(JSON.stringify({ error: "APIFY_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update sync status to pending
    await supabaseAdmin
      .from("watch_accounts")
      .update({ sync_status: "pending" })
      .eq("id", account_id);

    try {
      // Call Apify Instagram scraper
      const apifyResponse = await fetch(
        `https://api.apify.com/v2/acts/apify~instagram-post-scraper/run-sync-get-dataset-items?token=${apifyKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: [username],
            resultsLimit: 9,
          }),
        }
      );

      if (!apifyResponse.ok) {
        throw new Error(`Apify returned ${apifyResponse.status}`);
      }

      const posts = await apifyResponse.json();

      // Delete old posts for this account
      await supabaseAdmin
        .from("watch_posts")
        .delete()
        .eq("watch_account_id", account_id);

      // Insert new posts
      const postRows = (posts || []).slice(0, 9).map((p: any) => ({
        watch_account_id: account_id,
        instagram_post_id: p.id || p.shortCode || null,
        media_type: p.type || "image",
        media_url: p.displayUrl || p.url || p.imageUrl || null,
        thumbnail_url: p.displayUrl || p.url || p.imageUrl || null,
        caption: (p.caption || "").slice(0, 2000),
        permalink: p.url || (p.shortCode ? `https://www.instagram.com/p/${p.shortCode}/` : null),
        posted_at: p.timestamp ? new Date(p.timestamp).toISOString() : null,
        like_count: p.likesCount || p.likes || 0,
        comment_count: p.commentsCount || p.comments || 0,
        fetched_at: new Date().toISOString(),
      }));

      if (postRows.length > 0) {
        await supabaseAdmin.from("watch_posts").insert(postRows);
      }

      // Update account
      const profileImg = posts?.[0]?.ownerProfilePicUrl || null;
      await supabaseAdmin
        .from("watch_accounts")
        .update({
          sync_status: "synced",
          last_synced_at: new Date().toISOString(),
          source_mode: "official_api",
          ...(profileImg ? { profile_image_url: profileImg } : {}),
        })
        .eq("id", account_id);

      return new Response(JSON.stringify({ success: true, posts_count: postRows.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (fetchError) {
      await supabaseAdmin
        .from("watch_accounts")
        .update({ sync_status: "failed" })
        .eq("id", account_id);

      throw fetchError;
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
