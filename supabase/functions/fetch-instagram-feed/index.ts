import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const isVideo = (p: any) => p.is_video || p.video_versions?.length > 0 || p.__typename === 'GraphVideo';

function extractPosts(postsData: any): any[] {
  if (postsData?.result?.edges) return postsData.result.edges.map((e: any) => e.node || e);
  if (Array.isArray(postsData)) return postsData;
  if (postsData?.data?.edges) return postsData.data.edges.map((e: any) => e.node || e);
  if (postsData?.data?.items) return postsData.data.items;
  if (postsData?.items) return postsData.items;
  if (postsData?.data && Array.isArray(postsData.data)) return postsData.data;
  return [];
}

function extractCursor(postsData: any): string {
  return postsData?.result?.page_info?.end_cursor
    || postsData?.data?.page_info?.end_cursor
    || postsData?.paging?.cursors?.after
    || "";
}

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

    await supabaseAdmin
      .from("watch_accounts")
      .update({ sync_status: "pending" })
      .eq("id", account_id);

    try {
      // Paginate up to 3 pages to collect 12 image posts after filtering videos
      let allPosts: any[] = [];
      let maxId = "";
      const MAX_PAGES = 3;

      for (let page = 0; page < MAX_PAGES; page++) {
        const postsResponse = await fetch(
          "https://instagram120.p.rapidapi.com/api/instagram/posts",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-rapidapi-host": "instagram120.p.rapidapi.com",
              "x-rapidapi-key": rapidApiKey,
            },
            body: JSON.stringify({ username, maxId }),
          }
        );

        if (!postsResponse.ok) {
          throw new Error(`RapidAPI returned ${postsResponse.status}`);
        }

        const postsData = await postsResponse.json();
        const pagePosts = extractPosts(postsData);

        if (pagePosts.length === 0) break;

        allPosts.push(...pagePosts);

        // Check if we have enough image posts
        const imageOnly = allPosts.filter((p: any) => !isVideo(p));
        if (imageOnly.length >= 12) break;

        // Get cursor for next page
        maxId = extractCursor(postsData);
        if (!maxId) break;
      }

      // Filter out videos and take 12
      let posts = allPosts.filter((p: any) => !isVideo(p));

      // Delete old posts for this account
      await supabaseAdmin
        .from("watch_posts")
        .delete()
        .eq("watch_account_id", account_id);

      // Map and insert new posts (max 12)
      const postRows = posts.slice(0, 12).map((p: any) => {
        const shortcode = p.code || p.shortcode || p.shortCode || "";
        const imageUrl = p.image_versions2?.candidates?.[0]?.url 
          || p.display_url || p.thumbnail_src || p.url || p.imageUrl || p.media_url || null;
        const caption = p.caption?.text 
          || p.edge_media_to_caption?.edges?.[0]?.node?.text || p.caption || "";
        const permalink = p.permalink || (shortcode ? `https://www.instagram.com/p/${shortcode}/` : null);
        const timestamp = p.taken_at || p.taken_at_timestamp || p.timestamp;
        const postedAt = timestamp
          ? new Date(typeof timestamp === "number" && timestamp < 1e12 ? timestamp * 1000 : timestamp).toISOString()
          : null;
        const likes = p.like_count ?? p.edge_media_preview_like?.count ?? p.likesCount ?? p.likes ?? 0;
        const comments = p.comment_count ?? p.edge_media_to_comment?.count ?? p.commentsCount ?? p.comments ?? 0;
        const mediaType = "image";

        return {
          watch_account_id: account_id,
          instagram_post_id: p.id || shortcode || null,
          media_type: mediaType,
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

      // Try to get profile image
      let profileImg: string | null = null;
      if (allPosts[0]?.owner?.profile_pic_url) {
        profileImg = allPosts[0].owner.profile_pic_url;
      } else if (allPosts[0]?.user?.profile_pic_url) {
        profileImg = allPosts[0].user.profile_pic_url;
      }

      if (!profileImg) {
        try {
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
            profileImg = profileData?.result?.profile_pic_url_hd
              || profileData?.result?.profile_pic_url
              || profileData?.data?.profile_pic_url_hd
              || profileData?.data?.profile_pic_url
              || null;
          }
        } catch {
          // Profile fetch is optional
        }
      }

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
