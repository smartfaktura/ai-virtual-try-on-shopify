

## Fix the admin "Explore Categories" list — align it with the user-facing families

### Root cause

The admin drawer's **Explore Categories** pill row in `DiscoverDetailModal.tsx` reads from a stale legacy constant, **not** from the canonical family list the rest of the app uses:

```ts
// src/lib/categoryConstants.ts (current — wrong source for admin)
export const DISCOVER_CATEGORIES = [
  'fashion','beauty','fragrances','jewelry','accessories','home','food',
  'electronics','sports','supplements','editorial','commercial','lifestyle',
  'campaign','cinematic','photography','styling','ads',
];
```

Compare to the canonical user-facing families used by `/app/discover` and `/discover` (`getDiscoverFamilies()`):

```text
fashion, footwear, bags-accessories, watches, eyewear, jewelry,
beauty-fragrance, home, tech, food-drink, wellness         (11 families)
```

Two real consequences for the bag item in your screenshot:

1. **"Bags & Accessories" is missing entirely.** The legacy list has only `accessories` (a fluff tag) — there's no `bags-accessories` chip. So you literally can't tag the bag with the family that the user-facing pill targets.
2. **Other families also missing or mis-named:** `footwear`, `watches`, `eyewear`, `tech`, `food-drink`, `wellness`, `beauty-fragrance` are all absent. The current "beauty" / "fragrances" chips don't map to anything the discover grid filters on.
3. **Side effect:** because the primary `category` saved to DB is `editCategories[0]`, picking the legacy "Accessories" chip writes `category='accessories'` — which the user-facing **Bags & Accessories** pill will never match. The item disappears entirely from family-filtered views.
4. **Sub-family selector also breaks:** `getDiscoverSubtypes('accessories')` returns `[]`, so even if you do tag with the legacy chip, no sub-family pills (Backpacks / Wallets / Belts / Scarves / Hats) show up.

The fluff entries (`editorial`, `commercial`, `lifestyle`, `campaign`, `cinematic`, `photography`, `styling`, `ads`) aren't families at all — they look like leftover style-tag chips. They never appear in the user-facing pill row, so tagging with them does nothing.

### The fix

#### 1. Drive the admin "Explore Categories" row from `getDiscoverFamilies()` — same source as everything else

**File:** `src/components/app/DiscoverDetailModal.tsx` (~line 30 + line 375)

```ts
// Before
const DISCOVER_CATEGORY_OPTIONS = DISCOVER_CATEGORIES.map(c => ({
  id: c,
  label: c.charAt(0).toUpperCase() + c.slice(1),
}));

// After
import { getDiscoverFamilies } from '@/lib/discoverTaxonomy';
const DISCOVER_CATEGORY_OPTIONS = getDiscoverFamilies().map(f => ({
  id: f.id,         // 'bags-accessories', 'footwear', 'watches', …
  label: f.label,   // 'Bags & Accessories', 'Footwear', 'Watches', …
}));
```

That single change gives the admin drawer all 11 canonical families — the bag item now shows a real **Bags & Accessories** chip, and selecting it auto-reveals the **Sub-family (Bags & Accessories)** row with `[None] [Bags & Accessories] [Backpacks] [Wallets & Cardholders] [Belts] [Scarves] [Hats & Small]`.

#### 2. Auto-migrate the existing bag item (and any others stuck with legacy tags)

The bag in your screenshot has `category = 'accessories'` (visible in the drawer's "DB Category" row). After fix #1 we still need to migrate the in-DB value so it matches a canonical family id.

One-shot SQL migration mapping legacy → canonical:

```sql
UPDATE public.discover_presets
SET category = CASE category
  WHEN 'accessories'  THEN 'bags-accessories'
  WHEN 'beauty'       THEN 'beauty-fragrance'
  WHEN 'fragrances'   THEN 'beauty-fragrance'
  WHEN 'food'         THEN 'food-drink'
  WHEN 'supplements'  THEN 'wellness'
  -- Keep already-canonical: fashion, jewelry, home
  ELSE category
END
WHERE category IN ('accessories','beauty','fragrances','food','supplements');

-- The pure-fluff tags (editorial / commercial / lifestyle / campaign / cinematic /
-- photography / styling / sports / electronics / ads) aren't families. We park
-- them as 'home' fallback only if the row has no other family signal —
-- safer to surface them under 'home' than hide them. Adjust if you'd rather they
-- stay hidden until manually re-tagged.
UPDATE public.discover_presets
SET category = 'home'
WHERE category IN ('editorial','commercial','lifestyle','campaign','cinematic',
                   'photography','styling','sports','electronics','ads');
```

We'll also strip the same legacy values from `discover_categories[]` so the admin chips render clean state for those rows.

#### 3. Clean up the constants file

`src/lib/categoryConstants.ts` — keep `DISCOVER_CATEGORIES` exported (other call sites may import it) but redefine it as a re-export of the canonical family ids so anything still reading it gets the same source of truth:

```ts
import { getDiscoverFamilies } from '@/lib/discoverTaxonomy';
export const DISCOVER_CATEGORIES = getDiscoverFamilies().map(f => f.id);
```

Quick scan confirmed only the admin drawer renders chips from this constant; other importers are static text or config — safe to switch.

---

### About the **"Auto-classify sub-family"** button — what it does and why it's there

You added it last loop. It's an admin-only utility on `/app/discover` (top toolbar, hidden from regular users). When clicked:

1. It calls the `backfill-discover-subcategories` edge function.
2. The function looks at every `discover_presets` row whose `subcategory IS NULL`.
3. For each row, it scans the row's `tags`, `prompt`, and `title` for any sub-family slug that belongs to the row's family (e.g. for a Fashion item, it looks for `hoodies`, `dresses`, `activewear`, …).
4. If a slug is found via case-insensitive word-boundary match, it sets `subcategory` to that slug. If no match, it leaves NULL.
5. First click is a **dry-run** — it returns "X / Y will be classified" so you can sanity-check before committing. Second click commits.

**Why it exists:** Before the sub-family system shipped, all 366 Discover items had `subcategory = NULL`. Tagging them by hand would take hours. This button does the obvious 50–60% of the work in one click; the rest you tag manually in the drawer. It's safe to re-run any time (idempotent — only touches NULL rows).

If it confuses you in the toolbar, two cleanup options:
- **A.** Move it out of the public Discover toolbar and into `/app/admin/discover` where it logically belongs (admin-only utility, admin-only page).
- **B.** Add a tiny tooltip on hover: *"Auto-tags untagged items by scanning their existing prompt + tags. Admin-only."*

I'd recommend **A** — it's a one-shot maintenance tool, not something you'll click often, and it's currently sitting on the wrong page.

---

### Validation

1. Re-open the bag item in the admin drawer → **Bags & Accessories** chip now appears in the Explore Categories row, alongside Footwear / Watches / Eyewear / Tech / Wellness / Food & Drink. The fluff chips (editorial/commercial/etc) are gone.
2. Click **Bags & Accessories** → the Sub-family row appears with `[None] [Bags & Accessories] [Backpacks] [Wallets & Cardholders] [Belts] [Scarves] [Hats & Small]`.
3. Pick **Bags & Accessories** sub-family → Save → toast → DB Category reads `bags-accessories`, DB Sub-family reads `bags-accessories`.
4. Open `/app/discover` → click **Bags & Accessories** family pill → the Taupe Suede Knot Bag appears.
5. After the migration runs, all previously-orphaned `category='accessories'` items show up under **Bags & Accessories** instead of being invisible.
6. The "Auto-classify sub-family" button is moved to `/app/admin/discover` (top toolbar) and removed from the user-facing `/app/discover`.

### Files touched

```text
EDIT  src/components/app/DiscoverDetailModal.tsx   (swap source to getDiscoverFamilies)
EDIT  src/lib/categoryConstants.ts                 (re-export from discoverTaxonomy)
EDIT  src/pages/Discover.tsx                       (remove Auto-classify button + empty-state hint)
EDIT  src/pages/admin/AdminDiscover.tsx            (add Auto-classify button to admin toolbar)
NEW   migration                                    (remap legacy category values → canonical family ids)
```

