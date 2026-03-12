

## Icon-Only Generate Button on Mobile

**File**: `src/components/landing/FreestyleShowcaseSection.tsx` (lines 224-245)

On mobile, the Generate button will show only the icon (Play or spinner) without any text. On desktop (`sm:` and up), text remains visible.

Changes:
- Wrap "Generate" and "Generating…" text in `<span className="hidden sm:inline">` so they only show on desktop
- Remove the mobile-only `'Gen…'` text
- Make button square on mobile with `w-8 h-8 sm:w-auto sm:h-8` and center the icon with `justify-center`

