

## Goal
Audit every button across `/app/**` and standardize to the pill system (`rounded-full`) while preserving each button's role (variant + size hierarchy).

## Audit approach

I'll grep across `src/components/app/**`, `src/pages/app/**`, and any `/app`-routed pages for:
1. `<Button` usages — check for missing `size="pill"` or hardcoded `rounded-*` / `min-h-*` / `h-8`/`h-9`/`h-11` overrides
2. Raw `<button>` elements styled as CTAs (not icon-only ghosts)
3. `buttonVariants(...)` calls

Then normalize each to:
- **Primary CTA** → `<Button size="pill">` (h-10 rounded-full)
- **Secondary / Cancel / Back** → `<Button variant="outline" size="pill">` or `variant="secondary" size="pill"`
- **Tertiary text actions** (Reset, Save Draft, "View all") → keep `variant="ghost"` but switch to `size="pill"` so the radius matches; height stays 40px
- **Small inline buttons** in dense rows (table rows, chips, tag toggles) → use `size="sm"` but override radius to `rounded-full` via className (`h-8 rounded-full px-3`) — OR introduce a new `size="pill-sm"` token (see below)
- **Icon-only buttons** (close X, kebab menus) → keep `size="icon"` but make round: add `rounded-full` (already h-10 w-10)
- **Destructive actions** → `variant="destructive" size="pill"`

## Proposed addition to `button.tsx`

Add two missing pill sizes so we don't have to className-override everywhere:

```ts
size: {
  ...,
  pill: "h-10 rounded-full px-5",       // existing
  "pill-sm": "h-8 rounded-full px-3 text-xs",  // NEW — for dense rows
  "pill-lg": "h-11 rounded-full px-6",         // NEW — for hero CTAs
  "icon-pill": "h-10 w-10 rounded-full",       // NEW — round icon buttons
}
```

This unlocks one-token changes everywhere instead of repeated `className="rounded-full"` patches.

## Scope (files I'll touch)

Based on directory structure, the main button-heavy areas under `/app`:

1. **Wizards & sticky bars** — `product-images/`, `video/`, `freestyle/`, `catalog/`, `brand-models/`, `try-on/`, `text-to-product/` (most already done; sweep for stragglers)
2. **Library / Discover / Explore** — `library/`, `discover/`, asset cards, filter chips, lightbox actions, status toggles
3. **Activity / Workflows page** — activity cards, retry/download/delete actions
4. **Settings & Billing** — already done; verify edge cases (delete account, danger zone)
5. **Modals** — `Upgrade`, `Buy Credits`, `LowCredits`, `CorrectionConfirm`, `AddPostManual`, share modals, lightbox modals, post-gen conversion drawer
6. **Admin** (`/app/admin/**`) — Models, Scenes, Trend Watch, Workflows admin (lots of `size="sm"` table actions → `size="pill-sm"`)
7. **Onboarding flows** under `/app`
8. **Top bar / header** — credit chip, notification bell, user menu trigger
9. **Sidebar collapse trigger and any inline buttons** — already round-friendly, verify

## Out of scope (intentionally untouched)
- Marketing/landing pages (`src/components/landing/**`, `src/pages/Index.tsx`) — different design language; user said `/app` only
- Tabs, accordion triggers, dropdown menu items — these are not buttons
- Pagination number buttons (square-by-convention) — unless user wants them round too
- shadcn primitives (`tabs.tsx`, `toggle.tsx`, etc.)

## Process

1. Add `pill-sm`, `pill-lg`, `icon-pill` tokens to `button.tsx`
2. Run grep across `src/components/app/**` and `src/pages/` for `/app` routes
3. Convert in batches by directory, preserving each button's semantic role:
   - Replace `size="sm"` on CTA-style buttons → `size="pill-sm"`
   - Replace default size on confirm/cancel → `size="pill"`
   - Replace `size="icon"` on round-friendly contexts → `size="icon-pill"` (only where it visually fits — modal close X stays square if shadcn-managed)
   - Strip redundant `min-h-[44px]`, `rounded-xl`, `rounded-md` overrides on Button elements
4. Spot-check raw `<button>` CTAs and convert to `<Button size="pill">`

## Risks / decisions to flag

- **Destructive deletes in tables** (e.g., admin row delete) — currently `size="sm" variant="ghost"` icon-only. Should those become round? My default: yes, `size="icon-pill" variant="ghost"` so the hover halo is round and matches.
- **Tab-like segmented controls** (e.g., Monthly/Annual, category tabs, status filters Draft/Brand Ready/Publish) — these are toggle groups, not buttons. I'll leave radius as-is (rounded-lg inside a rounded-full container is also a valid pattern). Flag if you want them round too.
- **Shopping/checkout style numeric "+ / –" steppers** — keep as small square icon buttons; round looks worse here.

## Deliverable
One sweeping edit pass producing: updated `button.tsx` tokens + normalized buttons across all `/app` files. I'll list every file changed and a count of buttons updated per file in the final summary.

