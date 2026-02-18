

## Fix Mobile Workflow Preview Aspect Ratio

### Problem
On mobile, the "Explore Workflows" cards use a `4:3` (landscape) aspect ratio which crops the animated previews awkwardly. On desktop they use `4:5` (portrait) which shows the full scene properly.

### Fix
In `src/pages/Dashboard.tsx` (line 52), change the aspect ratio to use the same `4:5` ratio on all screen sizes:

- **Before:** `aspect-[4/3] sm:aspect-[4/5]`
- **After:** `aspect-[4/5]`

This single class change ensures mobile workflow previews match the desktop ratio, showing the full animated preview without awkward cropping.

