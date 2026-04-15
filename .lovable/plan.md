

# Polish Freestyle Prompt Builder Modal

## Summary
Refine the `PromptBuilderQuiz` component to feel like a premium guided setup wizard with better hierarchy, spacing, selection states, and fixed header/footer on desktop.

## File changed
**`src/components/app/freestyle/PromptBuilderQuiz.tsx`**

### Modal container
- Widen from `max-w-xl` to `max-w-2xl` for more breathing room
- Add `rounded-2xl shadow-2xl` for premium elevation
- Set fixed max height with `max-h-[80vh]` and flex column layout

### Header (lines 397-405)
- Increase padding to `px-6 py-4`
- Title: bump to `text-base font-semibold`
- Step indicator: style as a subtle pill badge (`px-2 py-0.5 rounded-full bg-muted text-[10px] font-medium`)
- Icon container: slightly larger (`w-9 h-9 rounded-xl`)

### Progress bar (lines 408-410)
- Thinner: `h-[3px]` instead of `h-1`
- Add `rounded-full` and softer track color
- Better spacing: `pt-3 pb-1`

### Content area (lines 412-415)
- Increase padding to `px-7 py-6`
- On desktop: `flex-1 overflow-y-auto` (scrolls between fixed header/footer)
- Remove `max-h-[60vh]`, let flex layout handle it

### Category step (lines 215-234)
- Question: bump to `text-lg font-semibold`
- Helper text: change to "Choose the category that best matches your product." with `text-sm text-muted-foreground/60 mt-1`
- Grid: increase gap to `gap-3` on desktop, keep `grid-cols-4`
- More space between question and grid: `space-y-5`

### OptionCard (lines 85-109)
- Increase padding: `p-4 sm:p-5`
- Improve spacing: `gap-2` instead of `gap-1.5`
- Selected state: `border-primary bg-primary/5 ring-2 ring-primary/15 shadow-sm` (stronger ring)
- Hover: `hover:border-border hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200`
- Title: `text-sm font-medium` (bump from `text-xs`)
- Description: `text-[11px] text-muted-foreground/60` (lighter)
- Check indicator: slightly larger (`w-5 h-5`, `top-2 right-2`)

### Footer (lines 418-440)
- Increase padding: `px-7 py-4`
- Stronger border: `border-t border-border/40`
- Back button: `text-muted-foreground` ghost style, quieter
- Next button: when disabled use `opacity-40`; when enabled use `bg-foreground text-background` (confident primary CTA)
- Footer stays `shrink-0` (already fixed at bottom via flex)

### All other steps
- Same `space-y-5` increase and typography improvements apply consistently
- SectionPill: slightly more padding (`px-3 py-1`)

## What stays the same
- All state logic, step flow, data, icon maps
- Mobile layout branch
- Review step textarea behavior
- All imports and templates

