

# Align All Discover Content to Same Vertical Line

## Problem
The "Discover" title and subtitle appear visually centered on the page, while the category bar and image grid are left-aligned — creating a misalignment.

## Investigation
The `PageHeader` component itself is left-aligned (no `text-center`). Looking at the code, everything inside `PageHeader` should share the same left edge. The apparent centering of "Discover" may be caused by the short title appearing centered in a wide content area, or by an inherited `text-center` class from a parent wrapper.

## Diagnosis
After reviewing the code: `PageHeader` renders a `<div className="space-y-6">` with left-aligned children. The title, subtitle, category bar, and grid are all children — they should all align. If they don't visually, it's likely the content wrapper in the app shell or the Discover page has some centering applied.

## Plan

### 1. Check `src/pages/Discover.tsx` for any centering wrappers
If the `PageHeader` is wrapped in a centered container, remove the centering to ensure the title, subtitle, categories, and grid all share the same left edge.

### 2. Verify no `text-center` or `items-center` on the outer wrapper
If found, remove it so all content flows from the same left margin.

### 3. Quick fix if needed
Add `text-left` explicitly to the `PageHeader` title/subtitle container to override any inherited centering.

This is a 1-file, 1-line fix — just ensuring consistent left alignment throughout the Discover page.

