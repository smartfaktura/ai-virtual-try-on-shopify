

## Redesign Discover Page: Premium UI + Fixed Modal Layout

### Overview

Two main improvements: (1) elevate the Discover page header, search, and category filters to a spacious Apple-style design, and (2) reorganize the detail modal so the most important actions are prominent and well-structured.

---

### 1. Discover Page -- Premium Header and Filters

**Current issues visible in screenshot:**
- Search bar looks generic with basic Input styling
- Category pills are small, cramped, horizontally scrollable (carousel-like)
- Overall feels like a standard dashboard, not a luxury creative tool

**Changes to `src/pages/Discover.tsx`:**

- Remove `PageHeader` wrapper -- build a custom header directly for more control over spacing
- Large, elegant title with refined tracking (`text-3xl font-semibold tracking-tight`)
- Subtitle in lighter weight, more breathing room below
- Search bar: wider (max-w-lg), taller, with rounded-2xl, subtle border, and larger placeholder text -- feels like a luxury search field
- Category filters: wrap naturally (flex-wrap instead of overflow-x-auto), no horizontal scroll. Larger pill sizing (`px-5 py-2.5`), rounded-full, text-sm. Generous gap between pills (`gap-2`). Active state uses a subtle fill instead of heavy primary color -- e.g. `bg-foreground text-background` for contrast
- More vertical spacing between sections (`space-y-6` or `space-y-8`)
- Remove icons from category pills -- text-only for cleaner look

---

### 2. Detail Modal -- Reorganized Layout

**Current issues from screenshots:**
- Generate Prompt button and result are in the right column, disconnected from actions
- "Use Scene" / "Use Prompt" button is buried below description
- Save and Similar buttons are small and easy to miss
- The two-column layout creates awkward empty space when there's no generated prompt

**New modal layout for `src/components/app/DiscoverDetailModal.tsx`:**

The modal becomes a single clean flow:

```text
+------------------------------------------+
|  [Image - large, rounded]                |
|                                          |
|  [Generate Prompt button - full width]   |
|  [Generated prompt text if available]    |
|  [Copy + Use in Freestyle row]           |
|                                          |
|  [Category badge] [tags if preset]       |
|  [Description / Prompt text block]       |
|                                          |
|  [====== Primary action row ======]      |
|  [ Use Scene / Use Prompt  ->  ]  (big)  |
|  [ Save ]  [ Similar ]   (side by side)  |
|                                          |
|  --- More like this ---                  |
|  [thumb] [thumb] [thumb] [thumb]         |
+------------------------------------------+
```

Key changes:
- Switch from 2-column grid to single column stacked layout -- image on top, content flows below
- Image takes full width with max-height constraint, natural aspect ratio (object-contain or cover with reasonable max)
- Primary CTA ("Use Scene" / "Use Prompt") is a large, full-width button right after the description
- Generate Prompt section sits directly below the image -- most prominent secondary action
- Copy/Use in Freestyle buttons appear conditionally only when a prompt is generated
- Save and Similar are secondary row below the primary CTA
- Related items section stays at bottom
- Remove the `DialogDescription` subtitle ("Scene details" / "Inspiration preset details") -- unnecessary
- Wider modal max-width stays at `max-w-3xl` but content is single-column so it reads better

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Discover.tsx` | Replace PageHeader with custom header, redesign search and filter styling, remove icons from pills, flex-wrap instead of scroll |
| `src/components/app/DiscoverDetailModal.tsx` | Single-column layout, reorder sections, prioritize primary CTA |

No new files needed. No database changes.

### Technical Details

**Discover.tsx changes:**
- Remove `PageHeader` import, build header inline with custom spacing
- Search input: `className="pl-11 h-12 rounded-2xl border-border/50 bg-muted/30 text-sm"` with larger search icon
- Category pills: `flex flex-wrap gap-2` (no overflow-x-auto, no scrollbar), remove icon components, text-only pills with `rounded-full px-5 py-2.5 text-sm font-medium`
- Active pill: `bg-foreground text-background` for high-end contrast
- Inactive pill: `bg-muted/40 text-muted-foreground hover:bg-muted/70`

**DiscoverDetailModal.tsx changes:**
- Replace `grid grid-cols-1 md:grid-cols-2` with single `flex flex-col gap-5`
- Image: `w-full max-h-[50vh] object-contain rounded-xl bg-muted` (respects natural ratio)
- Generate Prompt button directly below image
- Primary CTA ("Use Scene"/"Use Prompt") is full-width default size button (not sm)
- Save + Similar are outline buttons in a row below
- Description/prompt text block between image section and actions

