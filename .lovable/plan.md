

# Hide Subtitles and Category Badges on PoseSelectorCard

## Problem
The scene cards in Virtual Try-On show category badges ("Lifestyle", "Studio") and description subtitles that clutter the UI unnecessarily.

## Fix
**`src/components/app/PoseSelectorCard.tsx`**

1. Remove the category badge (`poseCategoryLabels` badge in top-left corner)
2. Remove the description line (`pose.description` paragraph) — keep only the pose name

Two deletions, single file.

