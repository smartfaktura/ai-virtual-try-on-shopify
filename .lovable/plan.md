

# Admin "Make Public Model" Checkbox in Brand Models Generator

## What
Add an admin-only checkbox in the UnifiedGenerator on the Brand Models page. When an admin checks "Add as public model", the edge function will insert into `custom_models` (visible to all users) instead of `user_models` (private), and skip the credit deduction.

## Changes

### 1. Frontend — `src/pages/BrandModels.tsx`
- Import `useIsAdmin` hook
- Add a `makePublic` state (boolean, default false)
- Show a checkbox with admin shield icon: "Add as public model (visible to all users)" — only visible when `isAdmin` is true
- Pass `makePublic: true` in the edge function body when checked
- When `makePublic` is true, skip the credit balance check on `canGenerate`

### 2. Edge Function — `supabase/functions/generate-user-model/index.ts`
- Read `body.makePublic` flag
- When `makePublic` is true:
  - Verify the user has the `admin` role via `has_role` RPC or direct query on `user_roles`
  - Skip plan check and credit deduction
  - Insert into `custom_models` table instead of `user_models`
  - Return the created model with a `target: 'public'` flag
- When false: existing behavior (insert into `user_models`, deduct 20 credits)

### 3. Frontend success handling
- On success with `makePublic`, show toast: "Public model added for all users"
- Invalidate `custom-models` query key in addition to `user-models`

## Files Changed

| File | Change |
|------|--------|
| `src/pages/BrandModels.tsx` | Admin-only "Make public" checkbox, pass flag to edge function, adjusted canGenerate logic |
| `supabase/functions/generate-user-model/index.ts` | Handle `makePublic` flag: admin check, skip credits, insert into `custom_models` |
| `src/hooks/useUserModels.ts` | Add `makePublic` param to mutation, invalidate `custom-models` on success when public |

No database changes needed — `custom_models` table already exists with the right schema.

