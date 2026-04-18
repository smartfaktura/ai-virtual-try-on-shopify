

### The mismatch you're seeing

**Dashboard CTAs** (Create now / Open studio / Browse looks) use:
```
rounded-full font-semibold gap-2 mt-4 min-h-[44px]
```
→ Full pill, 44px tall, generous, premium-feeling.

**"Add Products"** uses the new global default:
```
rounded-lg h-9
```
→ Soft corners, 36px tall, compact form-button feel.

So even though my last change made things *softer*, the dashboard hero CTAs are intentionally **bigger and full-pill** — and "Add Products" doesn't match them.

### Fix: use the `pill` size variant on "Add Products"

I already added `size="pill"` to the Button component for exactly this case (`h-9 rounded-full px-4`). To truly match the dashboard CTAs we should bump it to a slightly taller pill so it reads as a primary page CTA, not a chip.

**Plan:**

1. **Update the `pill` size variant** in `src/components/ui/button.tsx` from `h-9 px-4` → `h-10 rounded-full px-5` so it's tall enough to feel like the dashboard CTAs without being as oversized as the in-card 44px buttons (which is intentional — 44px is for *empty state* hero cards, page-header CTAs are typically one notch smaller).

2. **Apply `size="pill"` to "Add Products"** (both desktop + mobile in `src/pages/Products.tsx`):
   ```tsx
   <Button
     size="pill"
     onClick={...}
     className="hidden sm:inline-flex font-semibold shadow-sm hover:shadow-md transition-shadow"
   >
   ```
   Mobile: same, keep `w-full`.

### Result
- "Add Products" becomes a `rounded-full h-10` pill with the same family feel as dashboard CTAs
- Other page buttons (Save, Cancel, etc.) keep the softer `rounded-lg h-9` default — appropriate for forms/modals
- Dashboard hero CTAs unchanged (they keep their custom `min-h-[44px] rounded-full` because they live inside large empty-state cards)

### Files
- `src/components/ui/button.tsx` (1 line — pill variant)
- `src/pages/Products.tsx` (2 buttons — add `size="pill"`)

### Acceptance
- "Add Products" on `/app/products` is a full pill, visually in the same family as "Create now" / "Open studio" / "Browse looks"
- Other standard buttons across the app unchanged (still `rounded-lg h-9`)
- No layout shifts elsewhere

