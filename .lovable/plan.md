## Is it used?

Searched the entire repo — **no frontend code calls `generate-workflow-preview`**. It's only referenced in `supabase/config.toml` and its own `index.ts`. It's an admin/one-off utility for regenerating workflow thumbnail previews. Not invoked by any user flow.

Because it's unused by the app but may still be useful to admins (and deleting it would lose the prompt library inside it), the safe fix is to **lock it behind admin auth**, not delete it.

## The vulnerability

`supabase/functions/generate-workflow-preview/index.ts` currently has **zero auth checks**. Anyone with the project URL can POST `{ workflow_id }` repeatedly and:
- Burn Gemini image-generation credits (each call = 1 AI image at 1K).
- Overwrite `workflows.preview_image_url` for any workflow ID.

`verify_jwt = false` in `supabase/config.toml`, and the function uses the service-role client unconditionally.

## Fix plan

### 1. Add in-code auth (admin only)

Edit `supabase/functions/generate-workflow-preview/index.ts`:

- Require `Authorization: Bearer <jwt>` header.
- Create a user-context client with the anon key and that header.
- Call `supabase.auth.getClaims(token)` → reject 401 if invalid.
- Call `has_role(user_id, 'admin')` via the user client → reject 403 if not admin.
- Only then proceed with the existing service-role client for Gemini generation, storage upload, and the `workflows` update.

This matches the pattern already used by other admin-protected functions in this project and the project's standard (per memory: "Edge functions verify JWT via auth.getClaims()").

### 2. Keep `verify_jwt = false` in config.toml

Leave `[functions.generate-workflow-preview] verify_jwt = false` as-is. We're doing the JWT check in code (consistent with the rest of this project's functions). Adding platform-level `verify_jwt = true` is unnecessary once the in-code check exists, and changing it has caused issues elsewhere.

### 3. Mark finding as fixed

After deploy, mark `workflow_preview_no_auth` as fixed in the security scanner with an explanation.

## Why this is safe

- No frontend calls the function, so adding auth **cannot break any user-facing flow**.
- Admins can still call it manually (with their own session token) if they ever need to regenerate a workflow preview.
- The expensive AI call and the DB overwrite both become unreachable to anonymous and non-admin users.
- No DB schema, no RLS, no cron, no other function is touched.

## Files changed

- `supabase/functions/generate-workflow-preview/index.ts` — add auth + admin role check at the top of the handler.

That's it. Approve and I'll implement.