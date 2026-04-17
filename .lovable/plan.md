

## Goal
Bring `/app/pricing` in line with other `/app/*` pages: standard `PageHeader` title/subtitle, single clear "Compare plans" framing (no double headings), better mobile comparison table, larger/more spacious "How credits work" + FAQ blocks, single-open accordion behavior, and a sticky plan-selector bar that appears once the user scrolls past the comparison table.

## File
- `src/pages/AppPricing.tsx` (only)

## Changes

### 1. Standardize header to match `/app/workflows`, `/app/video`, etc.
- Remove the centered hero (eyebrow "Pricing" + giant "Studio-grade visuals…" + sub).
- Wrap page in `<PageHeader title="Compare plans" subtitle="See every feature side-by-side and pick the plan that matches your output. Cancel anytime." />` — same component used by Workflows / VideoHub.
- Remove the duplicate `<h2>Choose your plan</h2>` + sub above the table. Keep only the billing toggle on the right (above the table).
- Tighten container: `max-w-6xl mx-auto px-4 py-8 space-y-14`.

### 2. Comparison table: better mobile experience
Replace the single horizontally-scrolling 760px table with a **responsive dual layout**:

- **Desktop (`md+`)**: keep current full table (sticky header columns with plan name/price/CTA + grouped feature rows).
- **Mobile (`<md`)**: hide table, show a **stacked plan-card list** instead — each plan is a `rounded-2xl border` card with:
  - Plan name + Recommended/Current badge
  - Price + credits
  - CTA button (full width)
  - Collapsible "See all features" → expands to show that plan's checkmark list grouped by category (Generation / Video / Quality / Brand / Account)
- Plus a compact mobile "billing toggle" pill above the cards.

This removes horizontal scroll on phones and reads naturally.

### 3. Sticky plan-selector bar (after comparison table)
New component at the bottom of the page (inside `AppPricing`), styled like `ProductImagesStickyBar`:
- `sticky bottom-4 z-30` · `rounded-xl border bg-card/95 backdrop-blur-sm shadow-lg`
- Left: small "Selected plan" label + dropdown (`<select>` or popover) listing Free / Starter / Growth / Pro — defaults to **Growth (Recommended)** or current plan if user has one.
- Middle: live price `$X/mo` + `Y credits/mo` based on selection + billing period.
- Right: primary CTA — "Continue with {plan}" → triggers same `handlePlanSelect(plan)` flow. If selected = current plan → disabled "Current plan".
- **Visibility**: only shown after the user scrolls **past the comparison table**. Use `IntersectionObserver` on the comparison section's bottom sentinel — when it leaves viewport upward, show the bar; when it's still in view, hide it. Also hide once footer CTA strip enters view (avoid stacking).

### 4. "How credits work" — bigger, more spacious cards
- Section title spacing: `space-y-10`.
- Cards: `p-7 sm:p-8`, `space-y-4`, larger icon container `w-11 h-11`, title `text-base font-semibold`, body `text-sm leading-relaxed` (was `text-[12px]`).
- Grid gap: `gap-4 sm:gap-5`.

### 5. FAQ — single-open accordion + bigger type
Replace the `Collapsible` map (each independently open) with shadcn `Accordion type="single" collapsible` so opening one closes the previous.
- Trigger: `text-base font-medium` (was `text-sm`), `py-5 px-6`.
- Content: `text-[15px] leading-relaxed text-muted-foreground`, `pb-5 px-6`.
- Container gap: `space-y-3`.
- Section heading slightly larger spacing: `space-y-8`.

### 6. Final CTA strip
Untouched logic, only minor: align with new container width, keep current free vs paid copy/buttons.

## Out of scope
- Plan data, Stripe wiring, `PlanChangeDialog`, `UpgradePlanModal` — unchanged.
- ROI snapshot section — unchanged.
- Public `/pricing` — untouched.

## Result
- Page header matches the rest of `/app/*` (consistent product feel).
- One clear "Compare plans" framing, no duplicated titles.
- Mobile users get readable stacked plan cards with per-plan feature accordions instead of a horizontal-scroll table.
- "How credits work" feels premium and breathable.
- FAQ behaves cleanly (one open at a time) and is comfortable to read.
- A subtle sticky plan-selector follows the user after they pass the comparison so they can subscribe from anywhere on the page.

