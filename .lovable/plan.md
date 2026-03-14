

## Fix: Error codes lost during product import

### Root Cause
The edge function returns HTTP 500/422 for application-level errors (site_blocked, no_product_data, etc.). `supabase.functions.invoke()` treats non-2xx as `response.error`, discarding the JSON body with `error_code`. The frontend only sees a generic error message.

### Solution
Change the edge function to return **HTTP 200** for all application-level errors, with `error` and `error_code` in the JSON body. The frontend already handles this pattern at line 115 (`if (data.error)`). Reserve non-200 only for auth errors (401) and invalid input (400).

### Changes

**`supabase/functions/import-product/index.ts`**
- Change the `no_product_data` response (line 267) from status 422 → 200
- Change the `images_protected` response (line 332) from status 422 → 200  
- Change the catch block (line 355) from status 500 → 200 for known error codes (`site_blocked`, `extraction_failed`)
- Keep 401 for unauthorized, 400 for invalid URL (these are correctly handled)

**`src/components/app/StoreImportTab.tsx`**  
- Also add a fallback: when `response.error` exists, try to parse its context for `error_code` before throwing a generic error. This makes it resilient even if status codes change.

| File | Change |
|---|---|
| `supabase/functions/import-product/index.ts` | Return 200 for app-level errors so frontend receives error_code |
| `src/components/app/StoreImportTab.tsx` | Add fallback parsing of FunctionsHttpError context |

