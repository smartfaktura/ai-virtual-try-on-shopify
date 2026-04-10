

# Fix `analyze-product-image` Boot Crash

## Problem
The edge function fails to boot with: `Identifier 'data' has already been declared` at line 111.

- Line 20: `const { data, error: claimsError } = await supabase.auth.getClaims(token);`
- Line 93: `const data = await response.json();`

Both use `const data` in the same scope, which is a syntax error that prevents the function from even loading.

## Fix
Rename the second `data` variable on line 93 to `aiData` and update its reference on line 94.

| File | Change |
|------|--------|
| `supabase/functions/analyze-product-image/index.ts` | Line 93: `const data` → `const aiData`; Line 94: `data.choices` → `aiData.choices` |

Then redeploy the function.

