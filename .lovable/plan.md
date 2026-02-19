

## Fix: Mobile Plan Selection UX Polish

### Problems Identified
1. **No edge padding on mobile** -- Plan cards touch the screen edges with minimal breathing room (only `px-4` on the scrollable area, but the cards themselves have no margin from the modal edges since the modal itself has no side margins on mobile)
2. **Modal not full-height on mobile** -- The `max-h-[85dvh]` combined with the default dialog positioning leaves awkward gaps on small screens
3. **Cards too tall on mobile** -- Each plan card has `p-5` padding and shows 4 features, making them unnecessarily long to scroll through
4. **Header too spacious for mobile** -- The balance header uses desktop-sized padding

### Changes (single file: `src/components/app/BuyCreditsModal.tsx`)

| Issue | Before | After |
|-------|--------|-------|
| Modal sizing on mobile | `max-w-4xl p-0 gap-0 overflow-hidden rounded-2xl max-h-[85dvh]` | Add mobile full-screen: `max-w-4xl p-0 gap-0 overflow-hidden rounded-none sm:rounded-2xl max-h-[100dvh] sm:max-h-[85dvh] h-full sm:h-auto` |
| Header padding | `px-6 pt-5 pb-4` | `px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4` |
| Tab padding | `px-6 pt-1` | `px-4 sm:px-6 pt-1` |
| Plan card padding | `p-5` | `p-4 sm:p-5` |
| Plan card features | Shows 4 features always | Show 3 on mobile via `slice(0, 3)` on small screens (keep 4 on `sm:`) -- simplify to always show 3 for compactness |
| Price text size | `text-3xl` | `text-2xl sm:text-3xl` |
| Plan grid gap | `gap-3` | `gap-2.5 sm:gap-3` |
| Billing toggle | `px-6 py-2` | `px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm` |

These changes ensure:
- Full-screen modal on mobile (common pattern for complex selection UIs on phones)
- Proper padding and breathing room throughout
- Compact plan cards that show more plans per scroll
- Touch-friendly sizing maintained (44px CTA buttons stay)

