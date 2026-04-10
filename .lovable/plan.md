

# Fix duplicate `data` variable in analyze-product-image

## Problem
The edge function fails to boot because `const data` is declared twice:
1. Line ~25: `const { data, error: claimsError } = await supabase.auth.getClaims(token);`
2. Line ~111: `const data = await response.json();`

## Fix
Rename the second `data` to `aiData` in `supabase/functions/analyze-product-image/index.ts`.

Change:
```typescript
const data = await response.json();
const content = data.choices?.[0]?.message?.content || "";
```
To:
```typescript
const aiData = await response.json();
const content = aiData.choices?.[0]?.message?.content || "";
```

Then redeploy the function.

## File Changed
| File | Change |
|------|--------|
| `supabase/functions/analyze-product-image/index.ts` | Rename second `data` to `aiData` |

