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

    const rapidApiKey = Deno.env.get("RAPIDAPI_KEY");
    if (!rapidApiKey) {
      return new Response(JSON.stringify({ error: "RAPIDAPI_KEY not configured" }), {
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
      // Call RapidAPI Instagram scraper for posts
      const postsResponse = await fetch(
        "https://instagram120.p.rapidapi.com/api/instagram/posts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-rapidapi-host": "instagram120.p.rapidapi.com",
            "x-rapidapi-key": rapidApiKey,
          },
          body: JSON.stringify({ username, maxId: "" }),
        }
      );

      if (!postsResponse.ok) {
        throw new Error(`RapidAPI returned ${postsResponse.status}`);
      }

      const postsData = await postsResponse.json();

      // Debug: log the raw response structure
      console.log("[INSTAGRAM-FEED] Raw response keys:", JSON.stringify(Object.keys(postsData)));
      console.log("[INSTAGRAM-FEED] Raw response preview:", JSON.stringify(postsData).slice(0, 2000));

      // RapidAPI response structure: { result: { edges: [{ node: {...} }] } }
      let posts: any[] = [];
      if (postsData?.result?.edges) {
        posts = postsData.result.edges.map((e: any) => e.node || e);
      } else if (Array.isArray(postsData)) {
        posts = postsData;
      } else if (postsData?.data?.edges) {
        posts = postsData.data.edges.map((e: any) => e.node || e);
      } else if (postsData?.data?.items) {
        posts = postsData.data.items;
      } else if (postsData?.items) {
        posts = postsData.items;
      } else if (postsData?.data && Array.isArray(postsData.data)) {
        posts = postsData.data;
      }

      console.log("[INSTAGRAM-FEED] Parsed posts count:", posts.length);
      if (posts.length > 0) {
        console.log("[INSTAGRAM-FEED] Sample post keys:", JSON.stringify(Object.keys(posts[0])));
      }

      // Delete old posts for this account
      await supabaseAdmin
        .from("watch_posts")
        .delete()
        .eq("watch_account_id", account_id);

      // Map and insert new posts (max 9)
      const postRows = posts.slice(0, 9).map((p: any) => {
        // Handle various RapidAPI response field names
        const shortcode = p.shortcode || p.code || p.shortCode || "";
        const imageUrl = p.display_url || p.thumbnail_src || p.image_versions2?.candidates?.[0]?.url
          || p.displayUrl || p.url || p.imageUrl || p.media_url || null;
        const caption = p.edge_media_to_caption?.edges?.[0]?.node?.text
          || p.caption?.text || p.caption || "";
        const permalink = p.permalink || (shortcode ? `https://www.instagram.com/p/${shortcode}/` : null);
        const timestamp = p.taken_at_timestamp || p.taken_at || p.timestamp;
        const postedAt = timestamp
          ? new Date(typeof timestamp === "number" && timestamp < 1e12 ? timestamp * 1000 : timestamp).toISOString()
          : null;
        const likes = p.edge_media_preview_like?.count ?? p.like_count ?? p.likesCount ?? p.likes ?? 0;
        const comments = p.edge_media_to_comment?.count ?? p.comment_count ?? p.commentsCount ?? p.comments ?? 0;
        const mediaType = p.is_video ? "video" : (p.media_type || p.type || "image");

        return {
          watch_account_id: account_id,
          instagram_post_id: p.id || shortcode || null,
          media_type: typeof mediaType === "string" ? mediaType.toLowerCase() : "image",
          media_url: imageUrl,
          thumbnail_url: p.thumbnail_src || imageUrl,
          caption: (typeof caption === "string" ? caption : "").slice(0, 2000),
          permalink,
          posted_at: postedAt,
          like_count: typeof likes === "number" ? likes : 0,
          comment_count: typeof comments === "number" ? comments : 0,
          fetched_at: new Date().toISOString(),
        };
      });

      if (postRows.length > 0) {
        await supabaseAdmin.from("watch_posts").insert(postRows);
      }

      // Try to get profile image from the posts owner data or a separate call
      let profileImg: string | null = null;
      if (posts[0]?.owner?.profile_pic_url) {
        profileImg = posts[0].owner.profile_pic_url;
      } else if (posts[0]?.user?.profile_pic_url) {
        profileImg = posts[0].user.profile_pic_url;
      }

      // If no profile image from posts, try the profile endpoint
      if (!profileImg) {
        try {
          console.log("[INSTAGRAM-FEED] Fetching profile for:", username);
          const profileResponse = await fetch(
            "https://instagram120.p.rapidapi.com/api/instagram/profile",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-rapidapi-host": "instagram120.p.rapidapi.com",
                "x-rapidapi-key": rapidApiKey,
              },
              body: JSON.stringify({ username }),
            }
          );
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            console.log("[INSTAGRAM-FEED] Profile response keys:", JSON.stringify(Object.keys(profileData)));
            console.log("[INSTAGRAM-FEED] Profile response preview:", JSON.stringify(profileData).slice(0, 1000));
            profileImg = profileData?.data?.profile_pic_url_hd
              || profileData?.data?.profile_pic_url
              || profileData?.profile_pic_url_hd
              || profileData?.profile_pic_url
              || null;
          }
        } catch {
          // Profile fetch is optional, continue without it
        }
      }

      // Update account
      await supabaseAdmin
        .from("watch_accounts")
        .update({
          sync_status: "synced",
          last_synced_at: new Date().toISOString(),
          source_mode: "official_api",
          ...(profileImg ? { profile_image_url: profileImg } : {}),
        })
        .eq("id", account_id);

      return new Response(JSON.stringify({ 
        success: true, 
        posts_count: postRows.length,
        debug: {
          responseKeys: Object.keys(postsData),
          parsedPostsCount: posts.length,
          samplePostKeys: posts.length > 0 ? Object.keys(posts[0]) : [],
          profileImg,
        }
      }), {
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
