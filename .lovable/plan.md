

# Fix Library Mobile Layout

## Problems
1. **Smart view tabs** ("All", "Favorites", "Brand Ready", "Ready to Publish") — fixed `px-4 py-2` padding causes wrapping/overflow on small screens
2. **Search placeholder** too long: "Search by product, campaign, prompt, model, or scene..." gets cut off
3. **Toolbar row** (filters, columns, select) feels cramped on mobile

## Changes

### File: `src/pages/Jobs.tsx`

**1. Smart view tabs — make compact on mobile (lines 375-390)**
- Reduce padding: `px-4 py-2` → `px-3 py-1.5 sm:px-4 sm:py-2`
- Reduce font: `text-sm` → `text-xs sm:text-sm`
- Add `flex-wrap` to the container so tabs wrap gracefully
- Allow horizontal scroll as alternative: wrap in `overflow-x-auto` container with `flex-nowrap whitespace-nowrap`

**2. Search placeholder — shorten on mobile (line 417)**
- Change placeholder to just `"Search..."` — concise and sufficient

**3. Search input — reduce vertical padding on mobile (line 420)**
- `py-3` → `py-2.5 sm:py-3` for a more compact feel
- `rounded-2xl` → `rounded-xl sm:rounded-2xl`

### Files
- `src/pages/Jobs.tsx` — 3 targeted class/text changes

