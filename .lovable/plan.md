

## Fix Credits Modal to Fit Without Scrolling

The root problem is that the modal's total height (header + tabs + content) exceeds viewport height. The Upgrade Plan tab is especially tall because each plan card has a large credits pill, features list, and generous spacing stacked vertically.

### Strategy: Aggressive compaction of the Upgrade tab

**`src/components/app/BuyCreditsModal.tsx`**:

1. **Add `max-h-[90vh]` and `flex flex-col`** to the DialogContent so the entire modal is viewport-constrained, with the scrollable area only inside tab content
2. **Compact the balance header**: Reduce `mb-5` to `mb-3`, reduce `mt-2.5` to `mt-1.5`, shrink balance text from `text-3xl` to `text-2xl`
3. **Compact tab switcher**: Reduce padding from `pt-4` to `pt-2`, tab button padding from `py-3` to `py-2`
4. **Compact Upgrade Plan tab cards**:
   - Remove the credits pill box (the bordered rounded-xl container) and replace with a single inline line: "2,500 credits/mo" in bold -- saves ~40px per card
   - Reduce features from 4 to 3 (`.slice(0, 3)`)
   - Reduce `space-y-3` to `space-y-2` inside cards
   - Reduce card padding from `p-4` to `p-3`
   - Reduce price text from `text-3xl` to `text-2xl`
   - Reduce CTA button height from `min-h-[44px]` to `min-h-[36px]`
5. **Remove enterprise banner** from inside the scrollable area -- it takes significant space. Replace with a small inline link "Need more? Contact Sales" below the grid
6. **Compact Top Up tab**: Reduce `space-y-6` to `space-y-4`, reduce card `space-y-4` to `space-y-3`
7. **Tab content area**: Change padding from `pb-6 pt-5` to `pb-4 pt-3`

### Result
- The entire modal fits within 90vh without any scrolling on typical screens
- Plan cards are compact but still readable with price, credits count, 3 features, and CTA
- Enterprise option condensed to a single line link

### Files Changed
- **Edit**: `src/components/app/BuyCreditsModal.tsx` -- spacing/sizing reductions throughout
