

# Final Audit: 2 Files with Unoptimized Images

Everything else in the codebase is now correctly optimized. Only **2 files** remain with raw Supabase storage URLs:

---

## 1. `src/components/landing/FeatureGrid.tsx`
- **6 feature card images** (lines 20, 28, 36, 44, 52, 60) use raw `getLandingAssetUrl` with no optimization anywhere — neither at data level nor render level (line 177 renders `current.image` directly)
- **Fix**: Add `getOptimizedUrl` import, wrap at data level with `quality: 60`

## 2. `src/pages/Generate.tsx`
- **4 team avatar URLs** (lines 18-22) defined as raw `getLandingAssetUrl('team/...')` and rendered raw at line 4408 (`src={src}`)
- **Fix**: Wrap the `teamAvatar` helper with `getOptimizedUrl` at data level

---

## Pattern
```tsx
// FeatureGrid — optimize helper
const f = (path: string) => getOptimizedUrl(getLandingAssetUrl(path), { quality: 60 });

// Generate — optimize teamAvatar helper  
const teamAvatar = (file: string) => getOptimizedUrl(getLandingAssetUrl(`team/${file}`), { quality: 60 });
```

| File | Locations | Type |
|---|---|---|
| `FeatureGrid.tsx` | 6 | Feature card images |
| `Generate.tsx` | 4 | Team avatar thumbnails |
| **Total** | **10** | |

After this, the codebase is **100% optimized** — every Supabase storage image passes through `getOptimizedUrl`.

