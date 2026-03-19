

# Compact Mobile Prompt Bar

## Changes

### 1. Shorter mobile placeholder (no "Enter to generate")
**File:** `FreestylePromptPanel.tsx` line 247

Change mobile placeholder from `"Describe what you want to create… (Enter to generate)"` to `"Describe what you want to create…"`. Keep desktop version as-is.

### 2. Remove helper text before Generate on mobile
**File:** `FreestylePromptPanel.tsx` lines 322-325

Hide the "Type a prompt or add a reference to start" text on mobile. Only show it on `sm:` and up. This removes the extra row that pushes the Generate button down.

### 3. Reduce textarea height on mobile
**File:** `FreestylePromptPanel.tsx` line 249

Change mobile `min-h-[80px]` to `min-h-[56px]` and rows from 3 to 2 on mobile, keeping desktop at 3 rows / 72px.

### 4. Tighter padding on mobile action bar
**File:** `FreestylePromptPanel.tsx` line 315

Reduce mobile padding from `py-3` to `py-2` on the action bar row, and `py-3` to `py-2` on the chips row (line 287).

### 5. Fit all chips in fewer rows on mobile  
**File:** `FreestyleSettingsChips.tsx` lines 258-290

Reorganize mobile layout into a single wrapping container with `gap-1` instead of two separate groups with `space-y-1.5`. All 9 chips (Upload, Product, Model, Scene, Framing, Brand, Ratio, Camera, Quality) flow naturally in one `flex-wrap` container. With `gap-1` and smaller chips they'll fit in ~3 tight rows naturally.

### 6. Remove bottom divider before action bar on mobile
**File:** `FreestylePromptPanel.tsx` line 312

Hide the divider between chips and the generate button on mobile to save vertical space.

