## Remove Description from PRODUCT DETAILS prompt

**File:** `supabase/functions/generate-workflow/index.ts` (line ~606)

**Change:** Drop the `Description` line from the `PRODUCT DETAILS` block sent to Gemini.

```diff
- ${product.description ? `- Description: ${product.description}` : ""}${analysisBlock}
+ ${analysisBlock}
```

**Why:** Free-text descriptions (e.g. "comfortable for daily wear") get mis-interpreted by the renderer and can cause inconsistent outputs (like a person appearing in one shot but not another).

**Scope:**
- Product description stays on the product record and in the UI — only the prompt injection is removed
- Category / Material / Finish / Color family / Size class remain untouched
- Analyzer and size-class logic untouched (separate future task)

Then redeploy `generate-workflow`.