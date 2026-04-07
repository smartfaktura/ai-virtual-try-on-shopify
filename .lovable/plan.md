

# Switch Instagram Fetch to RapidAPI

## What changes
Replace the Apify-based `fetch-instagram-feed` edge function with the RapidAPI Instagram API shown in your screenshot.

## API Details (from screenshot)
- **Host**: `instagram120.p.rapidapi.com`
- **Endpoint**: `POST https://instagram120.p.rapidapi.com/api/instagram/posts`
- **Body**: `{ "username": "<username>", "maxId": "" }`
- **Headers**: `x-rapidapi-host`, `x-rapidapi-key`, `Content-Type: application/json`

## Steps

### 1. Add `RAPIDAPI_KEY` secret
Store your RapidAPI key (`6577888470mshf210377aa2936a7p1a7c6ajsn048ea6404fe3`) as a secret so the edge function can use it.

### 2. Update `supabase/functions/fetch-instagram-feed/index.ts`
- Replace the Apify fetch call with a POST to `https://instagram120.p.rapidapi.com/api/instagram/posts`
- Send `{ username, maxId: "" }` as body
- Add RapidAPI headers (`x-rapidapi-host`, `x-rapidapi-key`)
- Map the RapidAPI response fields to our `watch_posts` table columns (media_url, caption, permalink, posted_at, like_count, comment_count, etc.)
- Remove `APIFY_API_KEY` references, use `RAPIDAPI_KEY` instead

### 3. Test response mapping
Since RapidAPI response structure may differ from Apify, we'll need to map the response fields correctly. I'll also call the `profile` endpoint to fetch the account's profile image if the posts response doesn't include it.

## Technical Detail
The edge function keeps the same interface — accepts `{ username, account_id }`, updates `watch_accounts` sync status, deletes old posts, inserts new ones. Only the external API call changes.

