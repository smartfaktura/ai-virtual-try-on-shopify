

## Fix: "Crafted by your studio team" Avatar Aspect Ratio

### The Problem

The 4 overlapping team avatars in the results footer ("Crafted by your studio team") appear as ovals instead of circles. The Supabase image render endpoint (`/render/image/`) can alter the intrinsic dimensions of portrait-ratio source images, which causes distortion even with `object-cover` applied.

### The Fix

**File: `src/pages/Generate.tsx` (line 10)**

Skip the `getOptimizedUrl` transformation entirely for these tiny 28px avatars. At this size, the file size difference between an optimized and original image is negligible, and using the raw `/object/public/` URL avoids any server-side dimension changes.

```
Before:  const teamAvatar = (file: string) => getOptimizedUrl(getLandingAssetUrl(`team/${file}`), { quality: 50 });
After:   const teamAvatar = (file: string) => getLandingAssetUrl(`team/${file}`);
```

This ensures the browser receives the original image and `object-cover` on the `w-7 h-7 rounded-full` container crops it perfectly into a circle.

### One line change, one file

Only line 10 of `Generate.tsx` needs updating.

