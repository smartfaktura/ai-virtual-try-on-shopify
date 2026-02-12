

## Fix: Activity Feed Avatar Aspect Ratio

### The Problem

The team avatars in the Recent Activity feed appear horizontally squished. The source images are portrait-ratio (from the team section), and the `getOptimizedUrl()` call uses `width: 80` which can distort them when the server resizes without a proper resize mode.

### The Fix

**File: `src/components/app/ActivityFeed.tsx` (line 11)**

Change the `teamAvatar` helper to drop the `width` parameter and only use quality compression:

```text
Before:  getOptimizedUrl(getLandingAssetUrl(`team/${file}`), { width: 80, quality: 50 })
After:   getOptimizedUrl(getLandingAssetUrl(`team/${file}`), { quality: 50 })
```

Since these avatars render at 32x32px (`w-8 h-8`) with `object-cover`, the browser will crop the full-quality image correctly into a circle. At quality 50 these small images will still be tiny files. No width constraint needed for 32px display size.

### One line change, one file

Only line 11 of `ActivityFeed.tsx` needs updating.

