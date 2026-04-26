## Problem

On `/discover` mobile detail modal:
1. Primary CTA "Try this for free" is a default rectangular button — not pill-rounded, height feels short.
2. "Share" button is a tiny inline text link, not a proper button matching the CTA style.
3. "Sign up to access prompts…" caption is too faded/small and visually weak.

## Fix

Edit `src/components/app/PublicDiscoverDetailModal.tsx` only:

1. **Primary CTA — pill, taller, premium dark.**
   Replace the Button className from
   `w-full font-medium shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-shadow duration-300`
   to
   `w-full h-[3.25rem] rounded-full bg-foreground text-background hover:bg-foreground/90 font-semibold shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-shadow duration-300`
   (matches the SceneDetailModal CTA on `/product-visual-library` for consistency).

2. **Share — proper outlined pill button.**
   Pass `variant="action"` to `<SharePopover>` so it renders the existing `Button variant="outline" size="pill"` style instead of the tiny text link. Keep it centered: change wrapper to a single full-width pill by removing `flex-1` constraint via inline override — the existing `action` variant already uses `flex-1`, so wrap with `<div className="flex"><SharePopover variant="action" .../></div>` to let it stretch full width and align with the CTA above.

3. **Sign-up caption — larger, more legible.**
   Replace
   `text-xs text-center text-muted-foreground/60`
   with
   `text-[13px] text-center text-muted-foreground/75 leading-relaxed px-2`.

No other files touched. No logic changes.
