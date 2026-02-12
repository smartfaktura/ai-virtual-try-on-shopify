

## Improve Credits Popup Fit

The modal currently uses `max-w-4xl` width and has verbose spacing that forces scrolling. The fix focuses on making it compact enough to fit without scrolling.

### Changes to `src/components/app/BuyCreditsModal.tsx`

**1. Reduce overall size and spacing**
- Reduce `max-w-4xl` to `max-w-3xl` for better screen fit
- Shrink header padding: `px-8 pt-8 pb-6` to `px-6 pt-6 pb-4`
- Reduce balance text from `text-4xl` to `text-3xl`
- Tighten tab area padding
- Reduce card internal padding from `p-7 sm:p-8` to `p-5 sm:p-6`
- Reduce credit text in cards from `text-4xl` to `text-3xl`
- Shrink price text from `text-2xl` to `text-xl`
- Bottom padding from `pb-8` to `pb-6`

**2. Improve the max-height constraint**
- Change `max-h-[60vh]` on tab content to `max-h-[55vh]` as a safety net, but the reduced spacing should eliminate the need to scroll in most cases

**3. Upgrade Plan tab -- tighter plan cards**
- Reduce plan card padding from `p-6` to `p-4`
- Reduce plan card spacing from `space-y-5` to `space-y-3`
- Show only 4 features instead of 5 to save vertical space
- Reduce credits pill padding

**4. Mobile improvements**
- On mobile, the Upgrade tab 4-column grid already collapses to `grid-cols-1` which is fine
- Reduce gap from `gap-5` to `gap-3` on mobile for tighter stacking

### Files Changed
- **Edit**: `src/components/app/BuyCreditsModal.tsx` -- spacing and sizing reductions throughout

