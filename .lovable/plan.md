

# Bump App Section Title & Subtitle Sizes

## Current
- Title: `text-xl sm:text-2xl` (20px → 24px)
- Subtitle: `text-sm` (14px)

## Proposed: Use Tailwind's natural scale for a clean premium bump

### Option A — Subtle (+2px feel)
- Title: `text-2xl sm:text-[26px]` — requires custom value, minor improvement
- Subtitle: `text-[15px]` — barely noticeable

### Option B — Premium step-up (recommended)
- Title: `text-2xl sm:text-3xl` (24px → 30px) — noticeably more commanding
- Subtitle: `text-sm sm:text-base` (14px → 16px) — cleaner readability

Option B stays within Tailwind's type scale, avoids custom values, and creates a more noticeable premium feel. The jump from 24px to 30px on desktop gives headings real presence without feeling oversized.

## Change

### File: `src/components/app/PageHeader.tsx` (1 file, 2 lines)

- Line with title `h1`: change `text-xl sm:text-2xl` → `text-2xl sm:text-3xl`
- Line with subtitle `p`: change `text-sm` → `text-sm sm:text-base`

All app sections using `PageHeader` (Discover, Products, Workflows, Brand Profiles, Settings, etc.) get the update automatically.

