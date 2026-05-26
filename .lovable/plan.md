## Tighten upgrade-modal feature chips: "Custom Brand Models" / "Scenes" with NEW + clearer lock state

Three tweaks to the plan cards inside `src/components/app/UpgradePlanModal.tsx` (replacing the row added previously around line 357–369):

1. **Unify the chip set across all three plans.** Same two chips on Starter, Growth, Pro — only the styling changes by plan. No more long "Brand Models & Brand Scenes not included" sentence on Starter.

2. **Rename the chips** to make it clear this is the custom-brand feature (the built-in models stay available on every plan):
   - `Custom Brand Models`
   - `Custom Brand Scenes`

3. **Add NEW marker + lock state:**
   - Growth + Pro: chips in `bg-primary/10 text-primary` with a tiny `NEW` pill (`bg-primary text-primary-foreground text-[8px] px-1 rounded-sm ml-1`) appended inside each chip.
   - Starter: same chips but rendered in a locked style — `bg-muted/60 text-muted-foreground/70` with a small `Lock` icon (`w-2.5 h-2.5`) before the label, no `NEW` pill. Conveys "feature exists, not in this tier" without a separate sentence.

Chip row keeps `flex flex-wrap gap-1 mt-1.5`. Markup stays compact (~12 lines, no new components, no copy elsewhere).

### Files

- `src/components/app/UpgradePlanModal.tsx` — replace the Starter `<p>…not included</p>` + Growth/Pro chip block with a single chip renderer that switches style by `p.planId`.
