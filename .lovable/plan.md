## Fix Steal the Look onboarding mapping (keep maps, just correct them) + cap to 12

Single file: `src/components/app/DashboardDiscoverSection.tsx`. No deletions of useful code — the two lookup tables stay, their values are corrected to match the real Discover family ids.

### Root cause
`CATEGORIES` is built from `getDiscoverFamilies()` which produces kebab-case ids: `fashion`, `footwear`, `bags-accessories`, `hats-caps-beanies`, `watches`, `eyewear`, `jewelry`, `beauty-fragrance`, `home`, `tech`, `food-drink`, `wellness`.

Today's maps point to stale labels (`beauty`, `fragrances`, `electronics`, `food`, `supplements`, `sports`, `accessories`, …) that no longer exist in `CATEGORIES`, so every lookup fails `CATEGORIES.find(...)` and defaults to `'all'` — onboarding preference is silently ignored.

Also: the sub-type branch only triggers when `subs.length === 1`, but onboarding usually writes multiple sub-types, so it almost never fires.

### Changes (preserve structure, fix values)

1. **Correct `SUBTYPE_TO_DISCOVER`** (keep the map, fix every value to a real Discover id):
   - `beauty-skincare`, `makeup-lipsticks`, `fragrance` → `beauty-fragrance`
   - `jewellery-rings`, `jewellery-necklaces`, `jewellery-earrings`, `jewellery-bracelets` → `jewelry`
   - `watches` → `watches`
   - `tech-devices` → `tech`
   - `food`, `beverages`, `snacks-food` → `food-drink`
   - `home-decor`, `furniture` → `home`
   - `supplements-wellness` → `wellness`
   - `activewear`, `swimwear`, `lingerie`, `streetwear`, `socks`, `garments`, `hoodies`, `dresses`, `jeans`, `trousers`, `jackets` → `fashion`
   - `shoes`, `sneakers`, `boots`, `high-heels` → `footwear`
   - `eyewear` → `eyewear`
   - `bags-accessories`, `backpacks`, `wallets-cardholders`, `phone-cases`, `belts`, `scarves` → `bags-accessories`
   - `caps`, `hats`, `beanies` → `hats-caps-beanies`

2. **Correct `FAM_TO_DISC`** (same idea — values must be real Discover ids):
   - `bags-accessories` → `bags-accessories`
   - `beauty-fragrance` → `beauty-fragrance`
   - `food-drink` → `food-drink`
   - `tech` → `tech`
   - `wellness` → `wellness`
   - `watches` → `watches`
   - `eyewear` → `eyewear`
   - `footwear` → `footwear`
   - `fashion` → `fashion`
   - `home` → `home`
   - `jewelry` → `jewelry`
   - `hats-caps-beanies` → `hats-caps-beanies`

   (Effectively becomes an identity map for current ids — keeps the structure as a safety net for any legacy/alias values.)

3. **Use the first sub-type even when user picked many** — change `if (subs?.length === 1)` to `if (subs && subs.length > 0)`. Onboarding writes multiple sub-types; today's `=== 1` gate skips the sub-type signal entirely, falling through to category-level which is coarser.

4. **Cap visible to 12** — `filtered.slice(0, 16)` → `filtered.slice(0, 12)`. Skeleton (8 placeholders) left as-is for snappy loading feel.

### Dashboard /app health check
Reviewed `Dashboard.tsx` — hero → cards → `<DashboardDiscoverSection />` → `<DashboardFreshScenes />` → Create Video → rest. All sections have skeletons + null-empty guards. No layout/regression issues. No changes proposed here.

### Out of scope
Discover taxonomy, onboarding writers, Fresh Scenes, Dashboard layout, RLS, DB.

### Risk
Minimal — only adjusts two constants and one slice/length check inside an existing component. No data fetches, routes, or shared modules touched.
