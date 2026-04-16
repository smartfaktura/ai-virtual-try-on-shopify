

# Fix Growth Card Border, Badge Color & Premium Footer

## Problem
The previous plan for these fixes was never executed. Growth card still has `border-primary/40` (faded), badge still uses `bg-primary/10 text-primary` (subtle), and footer still feels dense.

## Changes

### 1. Growth card border — solid primary

**BuyCreditsModal.tsx line 420:** `border-primary/40` → `border-primary`
**NoCreditsModal.tsx line 120:** `border-primary/40` → `border-primary`

### 2. "Most popular" badge — solid brand, white text

**BuyCreditsModal.tsx line 427:** `bg-primary/10 text-primary` → `bg-primary text-primary-foreground`
**NoCreditsModal.tsx line 126:** same change

### 3. Footer — more premium spacing and typography

Both files, footer section:

- Container: `space-y-2.5 pt-5 border-t border-border/15` (more breathing room, lighter separator)
- "Cancel anytime · No commitment": `text-xs text-muted-foreground/60 tracking-wide uppercase font-normal` (elegant small-caps feel)
- "All paid plans include...": `text-[11px] text-muted-foreground/50` (softer fine print)
- Links row: `text-[11px]`, increase gap to `gap-4`, keep arrow icons

## Files Changed

| File | Change |
|------|--------|
| `BuyCreditsModal.tsx` | Solid border, solid badge, premium footer |
| `NoCreditsModal.tsx` | Same |

