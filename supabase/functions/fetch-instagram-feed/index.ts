import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const TARGET_POSTS = 12;
const MAX_PAGES = 4;

const isVideo = (p: any) =>
  p.is_video === true ||
  p.video_versions?.length > 0 ||
  p.__typename === "GraphVideo" ||
  p.media_type === 2 ||
  p.product_type === "clips";

function extractPosts(postsData: any): any[] {
  if (postsData?.result?.edges) return postsData.result.edges.map((e: any) => e.node || e);
  if (postsData?.result?.items) return postsData.result.items;
  if (postsData?.data?.edges) return postsData.data.edges.map((e: any) => e.node || e);
  if (postsData?.data?.items) return postsData.data.items;
  if (postsData?.items) return postsData.items;
  if (Array.isArray(postsData?.data)) return postsData.data;
  if (Array.isArray(postsData)) return postsData;
  return [];
}

function extractCursor(postsData: any): string {
  return (
    postsData?.result?.page_info?.end_cursor ||
    postsData?.result?.end_cursor ||
    postsData?.data?.page_info?.end_cursor ||
    postsData?.paging?.cursors?.after ||
    postsData?.next_max_id ||
    ""
  );
}

function getImageUrl(p: any): string | null {
  return (
    p.image_versions2?.candidates?.[0]?.url ||
    p.display_url ||
    p.thumbnail_src ||
    p.url ||
    p.imageUrl ||
    p.media_url ||
    null
  );
}

function getPostId(p: any): string {
  return p.id || p.pk || p.code || p.shortcode || p.shortCode || "";
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
    const {
      data: { user },
      error: authError,
    } = await createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!).auth.getUser(token);

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

    await supabaseAdmin.from("watch_accounts").update({ sync_status: "pending" }).eq("id", account_id);

    try {
      const seenIds = new Set<string>();
      const imagePosts: any[] = [];
      let videosSkipped = 0;
      let pagesFetched = 0;
      let exhaustedFeed = false;
      let maxId = "";
      let prevCursor = "";

      for (let page = 0; page < MAX_PAGES; page++) {
        pagesFetched++;
        const postsResponse = await fetch(
          "https://instagram120.p.rapidapi.com/api/instagram/posts",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-rapidapi-host": "instagram120.p.rapidapi.com",
              "x-rapidapi-key": rapidApiKey,
            },
            body: JSON.stringify(maxId ? { username, maxId } : { username }),
          }
        );

        if (!postsResponse.ok) {
          throw new Error(`RapidAPI returned ${postsResponse.status}`);
        }

        const postsData = await postsResponse.json();
        const pagePosts = extractPosts(postsData);

        if (pagePosts.length === 0) {
          exhaustedFeed = true;
          break;
        }

        for (const p of pagePosts) {
          const pid = getPostId(p);
          if (pid && seenIds.has(pid)) continue;
          if (pid) seenIds.add(pid);

          if (isVideo(p)) {
            videosSkipped++;
            continue;
          }

          const imageUrl = getImageUrl(p);
          if (!imageUrl) continue;

          imagePosts.push(p);
          if (imagePosts.length >= TARGET_POSTS) break;
        }

        if (imagePosts.length >= TARGET_POSTS) break;

        const cursor = extractCursor(postsData);
        if (!cursor || cursor === prevCursor) {
          exhaustedFeed = true;
          break;
        }
        prevCursor = cursor;
        maxId = cursor;
      }

      // Delete old posts for this account
      await supabaseAdmin.from("watch_posts").delete().eq("watch_account_id", account_id);

      // Map and insert
      const postRows = imagePosts.slice(0, TARGET_POSTS).map((p: any) => {
        const shortcode = p.code || p.shortcode || p.shortCode || "";
        const imageUrl = getImageUrl(p);
        const caption =
          p.caption?.text || p.edge_media_to_caption?.edges?.[0]?.node?.text || p.caption || "";
        const permalink =
          p.permalink || (shortcode ? `https://www.instagram.com/p/${shortcode}/` : null);
        const timestamp = p.taken_at || p.taken_at_timestamp || p.timestamp;
        const postedAt = timestamp
          ? new Date(
              typeof timestamp === "number" && timestamp < 1e12 ? timestamp * 1000 : timestamp
            ).toISOString()
          : null;
        const likes =
          p.like_count ?? p.edge_media_preview_like?.count ?? p.likesCount ?? p.likes ?? 0;
        const comments =
          p.comment_count ?? p.edge_media_to_comment?.count ?? p.commentsCount ?? p.comments ?? 0;

        return {
          watch_account_id: account_id,
          instagram_post_id: p.id || p.pk || shortcode || null,
          media_type: "image",
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
      if (imagePosts[0]?.owner?.profile_pic_url) {
        profileImg = imagePosts[0].owner.profile_pic_url;
      } else if (imagePosts[0]?.user?.profile_pic_url) {
        profileImg = imagePosts[0].user.profile_pic_url;
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
            profileImg =
              profileData?.result?.profile_pic_url_hd ||
              profileData?.result?.profile_pic_url ||
              profileData?.data?.profile_pic_url_hd ||
              profileData?.data?.profile_pic_url ||
              null;
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

      return new Response(
        JSON.stringify({
          success: true,
          posts_count: postRows.length,
          pages_fetched: pagesFetched,
          videos_skipped: videosSkipped,
          exhausted_feed: exhaustedFeed,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
