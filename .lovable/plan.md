

## Fix Upscale Function + Improve Button Design

### Two Issues Found

**1. Edge function crash** -- The `upscale-image` function fails with `getClaims is not a function`. This method doesn't exist in the version of the Supabase client being used. Fix: replace with `getUser()` which is the standard approach used across all other edge functions.

**2. Button looks flat and text-heavy** -- The current "Upscale to PRO HD -- 4 cr" button is a plain outlined chip with small text. It should look more premium and be shorter/cleaner.

### Changes

#### 1. Fix Edge Function Auth (crash fix)
**File: `supabase/functions/upscale-image/index.ts`**

Replace the broken `getClaims` call with `getUser()`:

```typescript
// Before (broken):
const token = authHeader.replace("Bearer ", "");
const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
const userId = claimsData.claims.sub as string;

// After (working):
const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
if (userError || !user) { return 401; }
const userId = user.id;
```

#### 2. Redesign Upscale Button
**File: `src/components/app/LibraryDetailModal.tsx`**

Make the button more premium-looking and concise:
- Use a gradient background (primary tones) instead of flat outline
- Shorten text to just **"PRO HD"** with a small "4 cr" badge
- Make it full-width like the Download button for better hierarchy
- Add a subtle shimmer/glow effect

### Files to Edit
| File | Change |
|------|--------|
| `supabase/functions/upscale-image/index.ts` | Fix auth: replace `getClaims` with `getUser()` |
| `src/components/app/LibraryDetailModal.tsx` | Redesign upscale button to be more premium and concise |

