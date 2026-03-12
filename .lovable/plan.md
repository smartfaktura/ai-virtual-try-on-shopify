

## Fix Freestyle Showcase Mobile Layout

### Problem
On mobile (390px), the demo panel doesn't fit well:
- Prompt area (`h-[72px]`) is too tall for the text size on mobile
- Chips row gets crowded — "Generate" button text is clipped
- Overall padding is too generous for small screens

### Changes — `src/components/landing/FreestyleShowcaseSection.tsx`

1. **Reduce prompt area height on mobile**: Change `h-[72px]` to `h-[56px] md:h-[72px]` — shorter on mobile where text is smaller
2. **Reduce padding on mobile**: Change `p-4 md:p-5` to `p-3 md:p-5` for the inner container  
3. **Smaller chips on mobile**: Reduce chip padding from `px-2.5` to `px-2` and gap from `gap-2` to `gap-1.5 sm:gap-2`, shrink thumbnail to `w-4 h-4` on mobile
4. **Tighter chip label max-width**: Change `max-w-[80px]` to `max-w-[70px]` so chips take less horizontal space
5. **Smaller prompt text on mobile**: Add `text-xs md:text-sm` to the prompt paragraph
6. **Reduce prompt area horizontal padding**: `px-3 md:px-4`

These are all small spacing tweaks that collectively make the panel fit comfortably at 390px without layout shifts.

