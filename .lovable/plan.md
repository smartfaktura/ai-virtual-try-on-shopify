## Fix /home Built-for-every-category section

### Problem 1 — bad fragrance image
Tile `Earthy Glow Stage` uses `1775135707468-egh405` which returns **HTTP 400** from Supabase render endpoint (broken/missing source). Also `Volcanic Sunset` and `Earthy Driftwood` both currently use the same `1776018021309-gfgfci` → visible duplicate.

Replace those two slots with verified-200 fragrance scenes already confirmed to exist:
- `Earthy Driftwood` → use the 4th supplied URL `1776018038709-gmt0eg` (currently `Frozen Aura` keeps it). To avoid a new duplicate, swap `Frozen Aura` to `1776018032748-kg4bn6` and free `Natural Light Backdrop` to use `near-face-hold-fragrance-1776013185169` … this gets messy.

Simpler fix — keep the 4 new user-supplied IDs unique and fill the other 8 slots with the previously-working fragrance scenes from the original list:
```
Original              → originalFragrance asset          (unchanged)
Volcanic Sunset       → 1776018021309-gfgfci             (new)
Dynamic Water Splash  → 1776018039712-1hifzr             (new)
Motion Blur Float     → motion-blur-float-...-1776013400244
Frozen Aura           → 1776018038709-gmt0eg             (new)
Natural Light Backdrop→ 1776018032748-kg4bn6
Earthy Driftwood      → near-face-hold-...-1776013185169
Near Face Hold        → 1776018015756-3xfquh
Dark Elegance         → 1775132826887-gjbnyl
— hidden on mobile —
Aquatic Reflection    → 1776018027926-ua03bd             (new)
Red Gradient Embrace  → motion-blur-float-...-1776013400244 (acceptable reuse, hidden on mobile)
Earthy Glow Stage     → 1776018032748-kg4bn6 (acceptable reuse, hidden on mobile)
```
All 12 IDs are confirmed HTTP 200; only mobile-hidden tiles have any reuse, and no two visible tiles repeat above-fold on desktop.

Better: just **drop the broken slot and dedupe**, ending with 9 unique fragrance images (mobile-only-3 reuse hidden tiles is fine — acceptable trade-off).

### Problem 2 — slow / "crashing" loading on pill switch
Currently when you click Swimwear → Fragrance → Eyewear, the active category swaps and 12 fresh `<img>` tags mount with `loading="lazy"`. Below-fold tiles never start loading until they're back in viewport, so switching pills feels broken — half the grid stays white.

Fixes:
1. **Preload every category at section mount**: add a hidden `<link rel="preload" as="image">` (or hidden `<img loading="eager">`) wrapper that warms the browser cache for all 36 tile URLs (12 × 3 categories) right when `HomeTransformStrip` first mounts, in low priority. Browser cache then makes pill switching instant.
2. **Eager-load all 9 above-fold tiles for the active category** (currently only first 6) — change the `eager={i < 6}` threshold to `eager={i < 9}`.
3. **Stable React keys**: change card key from `${current.id}-${card.label}-${i}` to just `${current.id}-${i}` so position-based slot doesn't churn when only the data array changes — but we want remount across categories so the URL refreshes; keep current key behaviour.
4. **Add `<link rel="preconnect">`** to the Supabase storage origin in this section (or in `index.html`) so the first connection isn't a cold TLS handshake.

Together these make pill switching feel instant after the first paint.

### Files
- `src/components/home/HomeTransformStrip.tsx` — fragrance list dedupe + replace broken `egh405` ID, change eager threshold to 9, add preload effect for all category image URLs.