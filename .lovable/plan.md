

## Fix: Product Import Failing on Protected Sites (Tiffany 403)

### Problem
Tiffany.es (and many other brand sites) blocks server-side requests with anti-bot protection, returning a **403 Forbidden**. The current `import-product` edge function uses a simple `fetch()` which can't bypass these protections.

### Solution: Add Firecrawl as a Fallback

Use the **Firecrawl connector** to handle sites that block direct fetching. The flow becomes:

1. Try direct `fetch()` first (free, works for most sites)
2. If it fails (403, 429, etc.), fall back to Firecrawl's scrape API which handles anti-bot measures
3. Feed the scraped HTML/markdown to the same AI extraction pipeline

### Steps

**Step 1 — Connect Firecrawl**
- Enable the Firecrawl connector so the `FIRECRAWL_API_KEY` environment variable is available to edge functions

**Step 2 — Update `supabase/functions/import-product/index.ts`**
- After the direct `fetch()` fails (non-200 status), check if `FIRECRAWL_API_KEY` is available
- If available, call `https://api.firecrawl.dev/v1/scrape` with the URL, requesting `html` and `markdown` formats
- Use the Firecrawl response content instead of the direct fetch HTML
- If Firecrawl is not configured, return the current error as-is (graceful degradation)

### Technical Detail

```text
Current flow:
  fetch(url) --> 403 --> return error

New flow:
  fetch(url) --> 403 --> check FIRECRAWL_API_KEY
    --> if available: call Firecrawl scrape API --> get HTML/markdown --> continue to AI extraction
    --> if not available: return error with hint "This site blocks automated access"
```

The change is ~20 lines added to the existing edge function, wrapping the fetch failure path with a Firecrawl fallback. No UI changes needed — the same StoreImportTab component will work seamlessly since the response format stays identical.

### Files Changed
- `supabase/functions/import-product/index.ts` — add Firecrawl fallback after direct fetch failure

### No other changes
- No database changes
- No UI changes
- The Firecrawl connector needs to be enabled first

