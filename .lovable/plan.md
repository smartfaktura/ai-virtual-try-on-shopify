## Scope
Two small, presentation-only changes. No logic, routing, auth, or backend touched.

### 1. Hide the redundant Free banner in Shots step
File: `src/components/app/product-images/ProductImagesStep2Scenes.tsx`

The banner "Free plan: up to 3 shots per generation (0/3 selected). Upgrade for bulk shot selection" already has a sibling `FreeLimitToast` that pops the moment a free user tries to exceed the limit — so the static banner is duplicate noise.

- Remove both `<FreeSceneBanner ... />` renders (lines ~996 and ~1049).
- Keep the `FreeSceneBanner` function defined (dead code OK, zero risk) or delete it — will delete since unused.
- `FreeLimitToast` stays — users still get the in-the-moment notification.

### 2. Refine `BrandScenesInfoModal` aesthetic to match VOVV editorial style
File: `src/components/app/product-images/BrandScenesInfoModal.tsx`

Current modal feels generic (basic icon chip, plain numbered list, standard button). Bring it in line with the editorial luxury restraint already used across the app (Inter 300–600, generous whitespace, hairline rules, refined micro-typography, no terminal periods in headers per project memory).

Changes — all CSS / markup only:
- **Header treatment**: replace flat circular muted chip with a softer 44px chip using a subtle gradient ring (border + inner bg) and the existing `Wand2` icon at 14px, stroke 1.25.
- **Eyebrow**: keep "BRAND SCENES" — tighten tracking to `0.24em`, slightly smaller (`text-[9.5px]`), add a thin 24px divider rule directly under it for an editorial header break.
- **Title**: shift to `text-[24px]` `font-light` `tracking-[-0.01em]` `leading-[1.1]` for a more refined display feel (currently 22px medium).
- **Subtitle**: keep copy. Tighten to `text-[12.5px]` `text-muted-foreground/90`, no terminal period (already compliant).
- **Feature list**: replace numbered `01/02/03` rows with a cleaner three-row layout — small uppercase index on the left in `text-[9px] tracking-[0.2em] text-muted-foreground/60`, body in `text-[13px] text-foreground/90 font-light`. Rows separated by `border-border/40` hairlines, with first row also having a top border for editorial framing. Slightly larger vertical padding (`py-4`).
- **Primary CTA**: refine — pill button height stays 11, but use `font-medium tracking-tight text-[13px]`, arrow icon slides on hover (already does). When `canCreate` is false, label becomes "Upgrade plan" (already), but add subtle right-arrow easing.
- **Secondary "Maybe later"**: shrink to `text-[11.5px] tracking-wide uppercase text-muted-foreground/70`, hover to foreground — more editorial dismiss.
- **Footer hint** ("Brand Scenes are available on Growth and above"): center, `text-[10px] tracking-[0.15em] uppercase text-muted-foreground/60` for an editorial caption look.
- **Container**: increase `max-w-sm` → `max-w-[400px]`, padding `p-7` → `p-8`, keep `rounded-3xl`. Subtle shadow comes from existing Dialog styles.
- No animation libraries added. Pure Tailwind tokens — uses existing semantic colors (`foreground`, `muted-foreground`, `border`, `background`, `primary`). No hardcoded hex.

## Out of scope
- `BrandScenesPromoCard` (the trigger card) — user didn't ask to change it.
- Any backend, RLS, edge-function, or logic changes.
- `FreeLimitToast` behavior or copy.
- `lazyWithRetry`, version check, Suspense fallback — unrelated to this request.

## Verification
- Visual check via preview after edit.
- No new dependencies, no new files, no type changes.
