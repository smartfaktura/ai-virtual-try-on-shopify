

## Plan: Replace all hardcoded `vovvai.lovable.app` with `vovv.ai`

### Approach

1. **Create a shared constant** in `src/lib/constants.ts`:
   ```ts
   export const SITE_URL = 'https://vovv.ai';
   ```

2. **Update `src/components/SEOHead.tsx`** — import from constants instead of local `SITE_URL` and `DEFAULT_OG_IMAGE`.

3. **Update all page files** that pass hardcoded `canonical="https://vovvai.lovable.app/..."` — replace with template using the constant (e.g., `` canonical={`${SITE_URL}/pricing`} ``). Affected files (~21 in `src/`):
   - `Landing.tsx`, `Pricing.tsx`, `About.tsx`, `Blog.tsx`, `BlogPost.tsx`, `Contact.tsx`, `Careers.tsx`, `Press.tsx`, `Team.tsx`, `Status.tsx`, `Changelog.tsx`, `CookiePolicy.tsx`, `PrivacyPolicy.tsx`, `TermsOfService.tsx`, `HelpCenter.tsx`, `PublicDiscover.tsx`
   - Feature pages: `WorkflowsFeature.tsx`, `VirtualTryOnFeature.tsx`, `CreativeDropsFeature.tsx`, `BrandProfilesFeature.tsx`
   - Any JSON-LD data in `Pricing.tsx`, `Landing.tsx`, `BlogPost.tsx`, `About.tsx`

4. **Update `index.html`** — replace the canonical link and OG/Twitter URLs.

5. **Update `public/sitemap.xml`** — replace all `vovvai.lovable.app` with `vovv.ai`.

6. **Update `public/robots.txt`** — update the Sitemap URL.

7. **Update edge functions** (6 files) — replace fallback origins:
   - `supabase/functions/customer-portal/index.ts`
   - `supabase/functions/create-checkout/index.ts`
   - `supabase/functions/shopify-oauth/index.ts`
   - `supabase/functions/shopify-oauth-callback/index.ts`
   - `supabase/functions/auth-email-hook/index.ts`
   - `supabase/functions/send-email/index.ts`

### Summary

| Area | Files | Change |
|------|-------|--------|
| Shared constant | 1 new file | `src/lib/constants.ts` |
| SEO component | 1 | Import constant |
| Page components | ~20 | Use `SITE_URL` for canonicals & JSON-LD |
| `index.html` | 1 | Canonical + OG URLs |
| `sitemap.xml` | 1 | All `<loc>` URLs |
| `robots.txt` | 1 | Sitemap URL |
| Edge functions | 6 | Fallback origin strings |

All 249 references across 30 files will be updated to `vovv.ai`.

