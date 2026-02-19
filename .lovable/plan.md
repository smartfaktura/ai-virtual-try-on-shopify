

## Redesign: "Out of Credits" Banner -- VOVV.AI Branded

### Current State

The banner uses a generic red `Alert` component with a plain "destructive" variant -- red border, red icon, plain text. It looks like a system error rather than a branded upsell moment.

### Proposed Design

Replace the generic alert with a custom branded banner that feels like part of VOVV.AI's premium design language:

- **Dark card style** matching the sidebar aesthetic (deep navy `hsl(222, 47%, 11%)` background with light text)
- **Gradient accent** -- subtle left border or top gradient using the primary blue
- **VOVV.AI "V" mark** or Sparkles icon instead of the red AlertCircle
- **Refined typography** -- semibold title, muted description, clean layout
- **Primary-styled CTA button** -- "Buy Credits" in the brand's primary color, not a generic small button
- **Dismissible for warning states** (low/critical) with a subtle X; non-dismissible when empty

### Layout

```text
+--------------------------------------------------------------+
|  [Sparkles icon]                                          [X] |
|  You're out of credits                                        |
|  Top up to keep creating with VOVV.AI            [Buy Credits]|
+--------------------------------------------------------------+
```

- Background: `bg-primary text-primary-foreground` (dark navy with white text)
- Button: `bg-white text-primary` (inverted for contrast on dark bg)
- Rounded corners (`rounded-xl`), padding, and a clean single-row layout on desktop
- On mobile: stacks vertically with full-width button

### File to Change

| File | Change |
|------|--------|
| `src/components/app/LowCreditsBanner.tsx` | Replace the generic `Alert` with a custom branded card using the primary dark background, Sparkles icon, refined copy, and an inverted "Buy Credits" button. Keep the same logic (dismissed state, isLow/isCritical/isEmpty checks). Update copy to reference "VOVV.AI" naturally. |

### Copy Updates

| State | Title | Description |
|-------|-------|-------------|
| Empty (0 credits) | You're out of credits | Top up to keep creating with VOVV.AI |
| Critical (very low) | Almost out of credits | Only X credits left -- top up to avoid interruptions |
| Low | Running low on credits | You have X credits remaining. Top up to keep creating |

### Technical Details

- Remove dependency on `Alert`, `AlertTitle`, `AlertDescription` from `@/components/ui/alert`
- Use a plain `div` with Tailwind classes: `bg-primary text-primary-foreground rounded-xl p-4 flex items-center justify-between`
- Button styled as `bg-white text-primary hover:bg-white/90 rounded-lg px-4 py-2 text-sm font-semibold`
- Mobile responsive: `flex-col sm:flex-row` with `w-full sm:w-auto` on button
- Keep Sparkles icon from lucide-react for brand consistency with the credit system
