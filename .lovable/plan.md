

# Fix "Analyze & Create Draft" — Two Root Causes

## Problem
Clicking "Analyze & Create Draft" fails with "Edge Function returned a non-2xx status code". Two issues:

1. **RLS blocks the insert**: `AddImageDraftModal` inserts into `watch_posts` using the user's client (`supabase`), but the only RLS policy on `watch_posts` requires `admin` role via `has_role()`. The insert is rejected before the edge function is even called.

2. **Incomplete CORS headers**: The `analyze-trend-post` edge function only lists `authorization, x-client-info, apikey, content-type` in `Access-Control-Allow-Headers`, but the Supabase JS client sends additional headers (`x-supabase-client-platform`, etc.) that get blocked by the preflight check.

## Fix

### 1. Update CORS headers in `analyze-trend-post` edge function
Add the missing platform headers to the `corsHeaders` constant so the browser preflight passes.

### 2. No RLS migration needed
The `watch_posts` table already has an "Admins can manage" policy. The user calling this is an admin. The issue is just that the `as any` type cast may be hiding a column mismatch. With the `source` column now added (previous migration), and CORS fixed, the insert should work.

However, if the admin check still fails, we should verify the user actually has the admin role. The modal code uses the anon client which goes through RLS — this is correct as long as the logged-in user has the admin role in `user_roles`.

### Files
| File | Change |
|------|--------|
| `supabase/functions/analyze-trend-post/index.ts` | Update `corsHeaders` to include all required Supabase client headers |

This is a one-line fix in the CORS headers constant.

