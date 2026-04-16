

# Value Drawer — Premium Branded Redesign

## What changes

**`src/components/app/UpgradeValueDrawer.tsx`** — full layout restructure:

1. **Remove fake trust line** — Delete "Join 2,000+ brands creating with VOVV"

2. **Header redesign** — Larger avatar (w-10 h-10), headline in `text-lg font-semibold`, subline as `text-sm` with better contrast (`text-foreground/70` instead of `text-muted-foreground/80`). Remove the border-b separator — let spacing breathe instead

3. **Benefits → feature pills** — Replace the 3 checkmark lines with a horizontal row of subtle pills/chips (using the `unlockItems` from conversionCopy, e.g. "Studio", "On-Model", "Lifestyle", "Campaign", "Detail", "Video"). This is more visual, more branded, and category-specific

4. **"Choose your plan" label** — Remove it. The plan cards speak for themselves

5. **Plan cards — taller, more spacious, full-height usage**:
   - Each card gets more vertical space: `p-4` padding, `space-y-3`
   - Plan name prominent: `text-base font-semibold`
   - Price on its own line below name: `text-2xl font-bold` for the dollar amount + `text-xs text-muted-foreground` for "/mo"
   - Credits + rate pill centered below price
   - Savings badge stays inline with credits pill
   - CTA button `h-10` with `rounded-xl`
   - Growth card: subtle gradient background (`bg-gradient-to-b from-primary/[0.06] to-primary/[0.02]`), `border-primary/50`, and `ring-1 ring-primary/20` for elevation
   - Starter/Pro cards: `border-border/40` with `hover:border-border/60`
   - Key differentiator line per card in `text-xs text-muted-foreground`:
     - Starter: "500 credits · Up to 100 products"
     - Growth: "1,500 credits · Priority queue · Brand Models"
     - Pro: "4,500 credits · Unlimited everything"

6. **Use full drawer height** — Change wrapper from `space-y-3` to `flex flex-col` with the plan cards section using `flex-1` to expand and fill remaining space. Add `justify-between` on the cards container so they distribute evenly

7. **Drawer width** — Bump from `sm:!max-w-[440px]` to `sm:!max-w-[460px]` for slightly more room

8. **Bottom padding** — `pb-8` to give the last card breathing room from the drawer edge

## Result
Premium, spacious feel. Category-aware content chips replace generic text. Plan cards are scannable with clear price hierarchy. No lies, no clutter, full vertical space used.

