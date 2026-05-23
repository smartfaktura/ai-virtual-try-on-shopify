## Goal
Log a responsibility acceptance record (with user info, IP, timestamp, user agent) whenever a user confirms they have rights to use a reference image — in both the **Brand Scenes wizard** and the **Brand Models reference upload** flow. No extra infrastructure required.

## Database
Create one new table `reference_responsibility_acceptances`:
- `id` (uuid, PK)
- `user_id` (uuid, default `auth.uid()`)
- `user_email` (text)
- `ip_address` (inet, default `inet_client_addr()` — captured server-side, no client input)
- `user_agent` (text, from `navigator.userAgent`)
- `context` (text, CHECK: `'brand_scene_wizard'` | `'brand_model_reference'`)
- `accepted_at` (timestamptz, default `now()`)
- `created_at` (timestamptz, default `now()`)
- Index on `(user_id, accepted_at desc)`

**RLS (immutable audit log):**
- INSERT: `auth.uid() = user_id`
- SELECT: own row OR `has_role(auth.uid(), 'admin')`
- No UPDATE / DELETE policies

## Frontend wiring
Two minimal hooks, identical pattern, no UI/copy changes:

**Brand Scenes wizard (`BrandSceneWizard.tsx`)** — in the responsibility modal's confirm handler, before flipping `responsibilityAccepted = true`:
```ts
const { error } = await supabase.from('reference_responsibility_acceptances')
  .insert({ user_id, user_email, user_agent: navigator.userAgent, context: 'brand_scene_wizard' });
if (error) { toast.error(...); return; }
```

**Brand Models reference upload (`BrandModels.tsx`)** — same hook on the upload confirm step with `context: 'brand_model_reference'`.

On failure → toast + block continuation. On success → existing flow continues.

## Resources
No edge functions, no third-party services, no storage. Just one tiny table (a few hundred bytes per row) plus ~5 lines added to each modal.

## Out of scope
Admin viewer UI for browsing acceptance logs (can be added later if needed; admins can already query via backend).
