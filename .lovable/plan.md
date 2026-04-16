

# Fix Modal Background, SAVE 20% Badge, and Bullet Size

## Problem
1. **NoCreditsModal header** has a separate `border-b border-border/50` divider and different padding creating a visual two-tone effect — the header sits on the `bg-muted/50` but the border creates a visible seam.
2. **BuyCreditsModal header** area (`px-4 pt-5 pb-3`) does NOT have `bg-muted/50` — only the content area below (`pt-5 bg-muted/50`) does. This creates a white header on a gray body.
3. The "SAVE 20%" / "-20%" labels next to "Annual" use `bg-emerald-500/20 text-emerald-700` instead of primary colors with white text.
4. Bullet points are `text-[15px]` — need to go down to `text-sm` (14px).

## Changes

### 1. BuyCreditsModal — Unify background
- Move `bg-muted/50` from the content `div` (line 185) up to the `DialogContent` wrapper (line 130). Remove `bg-muted/50` from the content div.
- This makes header + tabs + content all share the same background tone.

### 2. NoCreditsModal — Unify background  
- Remove the `border-b border-border/50` from the header div (line 405). The whole modal already has `bg-muted/50` on `DialogContent`, so removing the border eliminates the visual seam.

### 3. SAVE 20% badge — primary colors with white text
In all three billing toggles (NoCreditsModal FreePlanSection, NoCreditsModal upgrade section, BuyCreditsModal Plans tab):
- Change the non-active state from `bg-emerald-500/20 text-emerald-700` to `bg-primary text-primary-foreground`
- Keep the active (selected) state as `bg-primary-foreground/25 text-primary-foreground`

### 4. Bullet points 1px smaller
- Both modals: change `text-[15px]` to `text-sm` (14px) for all bullet text spans.

## Files
- `src/components/app/BuyCreditsModal.tsx`
- `src/components/app/NoCreditsModal.tsx`

