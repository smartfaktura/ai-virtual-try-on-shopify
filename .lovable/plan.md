## Goal
Reorder pills so "All categories" sits **last**, change Swimwear back to default, and instead of swapping the grid, the "All categories" pill opens a clean popover/dropdown listing all 35 category names — no images, no copy.

## Changes — `src/components/home/HomeTransformStrip.tsx`

### 1. Reorder + remove `'all'` from grid switching
- Reorder `CATEGORIES` to: `swimwear`, `fragrance`, `eyewear`. Drop the `'all'` entry entirely from this array (and drop `ALL_CATEGORIES_CARDS`).
- Default `active` back to `'swimwear'`.

### 2. Add an "All categories" pill at the end (popover trigger)
- Use existing `Popover` (`@/components/ui/popover`) — already in the design system.
- Render after the 3 category buttons, inside the same pill bar:
  ```
  <PopoverTrigger asChild>
    <button class="px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap inline-flex items-center gap-1.5">
      All categories <ChevronDown size={14} />
    </button>
  </PopoverTrigger>
  ```
- `PopoverContent`: width ~`w-[min(92vw,560px)]`, padding 5, white card. Inside:
  - Tiny eyebrow `35+ CATEGORIES`
  - 3-column responsive grid (`grid-cols-2 sm:grid-cols-3`) of category names rendered as small muted text rows (no images, no clicks — just an informational list).
  - Hardcode the list (35 entries) in a `ALL_CATEGORY_NAMES` const, formatted from the DB list with title-case + nicer labels (e.g. `bags-accessories` → `Bags & Accessories`, `jewellery-rings` → `Rings`, `hats-small` → `Hats`, `tech-devices` → `Tech`, `snacks-food` → `Snacks`, `wallets-cardholders` → `Cardholders`, `makeup-lipsticks` → `Makeup`, `supplements-wellness` → `Wellness`, `home-decor` → `Home Decor`, `high-heels` → `Heels`, `beauty-skincare` → `Skincare`).

### 3. Cleanup
- Remove `ALL_CATEGORIES_CARDS` array and any references.
- Keep small caption `35+ categories · 1000+ scenes · one upload` above the CTA as-is.

## Files
- edit `src/components/home/HomeTransformStrip.tsx`
