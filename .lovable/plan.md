

## Increase "Create Visuals" CTA size in sidebar

**File:** `src/components/app/AppShell.tsx` (lines 205-216)

Current CTA padding is `py-3` with `text-sm` — fairly compact. Bump it so it reads as the primary action of the sidebar.

### Change
- Expanded padding: `py-3` → `py-3.5`
- Larger text: `text-sm` → `text-[15px]`
- Larger icon: `w-4 h-4` → `w-[18px] h-[18px]`
- Slightly larger radius for proportion: `rounded-xl` → `rounded-2xl`
- Add a touch more wrapper breathing room: `pt-4 pb-3` → `pt-4 pb-4`

Collapsed state stays compact (`px-2 py-3 text-xs`) — only the expanded state grows.

### Acceptance
- Expanded sidebar: CTA is visibly taller, icon + label more prominent, still full-width
- Collapsed sidebar: unchanged
- No layout shift in nav below it; no overflow on smaller sidebar widths

