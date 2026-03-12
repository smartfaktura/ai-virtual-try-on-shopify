

## Redesign "Share to Discover" card in Library Detail Modal

The current card (lines 190-208) has too much text crammed into a small area with tiny font sizes. Replace it with a cleaner, more branded block.

### Changes to `src/components/app/LibraryDetailModal.tsx` (lines 190-208)

Replace the current card with a cleaner design:

- **Remove** the italic secondary paragraph ("Each month we randomly select...")
- **Simplify copy** to one line: "Submit your best work · Win up to 10,000 credits"
- **Increase text sizes**: headline from `text-sm` → `text-base`, body from `text-xs` → `text-sm`
- **Use brand primary color** for the submit button (filled `bg-primary text-primary-foreground` instead of outline)
- **Trophy icon** stays but sized up slightly (`w-5 h-5`)
- **Card padding** increased from `p-4` → `p-5`
- **Rounded corners** stay `rounded-xl`, border uses `border-border/40` for subtlety

Result: a clean 3-element card (icon+title row, one-line description, CTA button) that feels premium and on-brand rather than cluttered.

