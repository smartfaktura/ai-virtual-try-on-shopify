

# Fix: Get 12 Image Posts After Video Filtering

## Problem
The RapidAPI Instagram endpoint returns ~12-15 posts per page. After filtering out videos, only 8 image posts remain -- fewer than the desired 12.

## Solution
Use pagination (`maxId`) to fetch a second page of posts if the first page doesn't yield 12 images after video filtering. The RapidAPI response includes a cursor/end_cursor we can use for the next page.

## Changes

### `supabase/functions/fetch-instagram-feed/index.ts`
1. Extract the pagination cursor from the first API response (`postsData.result.page_info.end_cursor` or similar)
2. After filtering videos from page 1, if we have fewer than 12 image posts, make a second API call with `maxId` set to the cursor
3. Merge results from both pages, filter videos, then slice to 12

Logic sketch:
```
let allPosts = [];
let maxId = "";
for (let page = 0; page < 2; page++) {
  const response = await fetch(API, { body: { username, maxId } });
  const data = await response.json();
  const pagePosts = extractPosts(data);
  allPosts.push(...pagePosts);
  // Filter videos as we go
  const imageOnly = allPosts.filter(notVideo);
  if (imageOnly.length >= 12) break;
  // Get next page cursor
  maxId = data.result?.page_info?.end_cursor || "";
  if (!maxId) break;
}
posts = allPosts.filter(notVideo);
```

## Files
- `supabase/functions/fetch-instagram-feed/index.ts` -- add pagination loop (max 2 pages) to ensure 12 image posts

