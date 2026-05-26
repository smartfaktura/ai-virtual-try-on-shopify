Two changes:

## 1. Hide promo banners in the library image preview modal

In `src/components/app/LibraryDetailModal.tsx`, remove the two promo blocks (lines 469-520):
- "Share to Explore" / "Submit your best work · Win up to 10,000 credits" / Submit for Review button
- "Tag Us · Win a Free Year" / social tag promo / Copy Caption button

Related state and handlers (`captionCopied`, `submitDiscoverOpen`, `SubmitDiscoverDialog`, the `AtSign`/`Trophy`/`Send`/`Copy` icon imports) stay only if still used elsewhere in the file; otherwise we drop the now-unused ones to keep the file clean.

## 2. Make outline button hover more visible on white surfaces

Currently `Button` `variant="outline"` uses `hover:bg-accent` (`40 7% 94%`), which is nearly identical to `--background` (`40 10% 98%`) — the hover state looks like nothing happens.

In `src/components/ui/button.tsx`, update the outline variant:
- `hover:bg-accent hover:text-accent-foreground` → `hover:bg-foreground/[0.06] hover:border-foreground/30`

This produces a clearly visible darkening on light surfaces and a clearly visible lightening on dark surfaces (since it's tinted with `foreground`), works across the whole app, and preserves the existing minimal look.