

# Fix Scene Thumbnail Shape + Hide Tags

## Changes

### 1. `src/components/app/DiscoverDetailModal.tsx`

**Scene thumbnail (line 165)**: The scene image uses `object-contain` which shows the full image but doesn't fill the square. Change to `object-cover` to match the model thumbnail's visual appearance — both will be filled rounded squares:
- `w-10 h-10 rounded-lg object-contain bg-muted/30` → `w-10 h-10 rounded-lg object-cover ring-1 ring-border/30`

**Remove tags section (lines 208-216)**: Delete the entire tags block that renders `#curlyhair`, `#datenight`, etc.

### 2. `src/components/app/PublicDiscoverDetailModal.tsx`

Mirror both changes — scene thumbnail to `object-cover`, remove tags section.

Two files, ~15 lines removed total.

