

# Fix: Instagram Sync Returns 0 Posts + Bad Profile Image

## Root Cause
The edge function calls RapidAPI successfully (HTTP 200) but fails to extract any posts because we're guessing the response structure with multiple fallback patterns — and none match the actual response shape. The function then marks the account as "synced" with 0 posts. The profile image is also being set to a webpage URL (`https://www.instagram.com/dsanddurga/`) instead of an actual image URL.

## Fix

### Step 1: Add debug logging to the edge function
Add `console.log` statements to capture:
- The raw RapidAPI posts response (`postsData`) — top-level keys and structure
- The raw profile response
- Number of posts parsed

This will let us see exactly what shape the API returns so we can fix the parser.

### Step 2: Return the raw response shape in the error/success payload
Temporarily include `responseKeys` and `samplePost` in the response body so we can immediately see the structure without waiting for logs.

### Step 3: Deploy and test
Call the function, inspect the response to see the actual data shape, then update the parsing logic accordingly.

### Step 4: Fix profile image logic
The profile endpoint is also likely returning data in an unexpected shape, resulting in a webpage URL being stored. We'll fix this after seeing the actual response.

## Files Changed
- `supabase/functions/fetch-instagram-feed/index.ts` — add debug logging and return response shape info

This is a two-step fix: first deploy with logging to discover the actual API response format, then update the parser to match.

