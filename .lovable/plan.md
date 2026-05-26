Simplify the per-plan feature chips in the upgrade modal (`src/components/app/UpgradePlanModal.tsx`, lines 356–378) so each plan row shows just one chip instead of two.

**Change**
- **Starter:** single neutral/grey chip `DEFAULT VOVV MODELS & SCENES` — no Lock icon, no NEW badge. Styled with `bg-muted/60 text-muted-foreground/70`.
- **Growth & Pro:** single primary chip `CUSTOM BRAND MODELS & SCENES` with the `NEW` pill appended. Styled with `bg-primary/10 text-primary`.
- Remove the separate "Custom Brand Models" + "Custom Brand Scenes" chip pair and the `Lock` icon usage in this block.
- Keep the same `text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded-full` chip shape and the `mt-1.5` wrapper for visual consistency with the rest of the modal.

**Scope**
- One file: `src/components/app/UpgradePlanModal.tsx`
- No copy/labels changed elsewhere, no backend.