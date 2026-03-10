

## Audit Result: Domain References

**All clear.** Every source file, edge function, static asset, and configuration file uses `vovv.ai` correctly. Here is the summary:

| Area | Status | Notes |
|------|--------|-------|
| `src/lib/constants.ts` | `https://vovv.ai` | Single source of truth |
| All page components (~20) | Uses `SITE_URL` constant | Canonicals, JSON-LD correct |
| `SEOHead.tsx` | Imports from constants | OG, Twitter, canonical all correct |
| `index.html` | `https://vovv.ai/` | Canonical link correct |
| `public/sitemap.xml` | All `<loc>` use `vovv.ai` | Correct |
| `public/robots.txt` | Sitemap URL uses `vovv.ai` | Correct |
| Edge functions (6) | Fallback origins use `vovv.ai` | Correct |
| Email templates | Brand name "VOVV.AI" (not a URL issue) | Correct |

### One harmless legacy reference

The file `supabase/migrations/20260310144746_...sql` contains `vovvai.lovable.app` as a default column value for `shopify_oauth_nonces.app_origin`. Migration files are historical records and cannot be edited. However, the edge functions that actually insert into this table (`shopify-oauth/index.ts`) already use the request origin header or fall back to `https://vovv.ai`, so this default is never used in practice. **No action needed.**

### SEO checklist confirmed

- Canonical URLs point to `vovv.ai` on every public page
- Open Graph and Twitter Card meta tags use `vovv.ai`
- JSON-LD structured data uses `vovv.ai`
- Sitemap and robots.txt reference `vovv.ai`
- No `lovable.app` references remain in any runtime code

**No changes required.** Your SEO configuration is fully aligned with the `vovv.ai` domain.

