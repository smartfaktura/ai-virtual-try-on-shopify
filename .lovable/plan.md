

# Remove Session Persistence + Fix Edit Image Loading

## Problem 1: Session persistence on refresh is unwanted
The Freestyle page saves all settings (prompt, model, scene, product, brand, aspect ratio, etc.) to `localStorage` and restores them on page load. The user wants this removed.

## Problem 2: "Edit Image" from Library doesn't load in prompt bar
The edit image URL params (`?editImage=...&imageRole=edit`) are read in a `useEffect(() => {...}, [])` — an empty-dependency mount effect. If the Freestyle page is already mounted (user navigates from Library while Freestyle is in the React tree), **the effect never re-runs**, so the image doesn't load. Additionally, even on fresh mount, `searchParams` may have already been consumed.

## File: `src/pages/Freestyle.tsx`

### Change 1: Remove session persistence
- Delete `FreestylePersistedSettings` interface, `FREESTYLE_STORAGE_KEY`, `FREESTYLE_TTL`, `loadPersistedSettings()`, and `_persisted` variable
- Remove the `useEffect` that saves settings to localStorage (lines 161-180)
- Remove `localStorage.removeItem(FREESTYLE_STORAGE_KEY)` from `handleReset`
- Remove all `_persisted?.xxx` fallbacks from `useState` initializers — use plain defaults (`''`, `null`, `'1:1'`, etc.)
- Remove `_pendingCustomModelId`, `_pendingUserModelId`, `_pendingProductId`, `_pendingBrandProfileId` refs and their deferred-resolution effects

### Change 2: Fix edit image loading
- Add `searchParams` to the dependency array of the URL-params effect, OR better: use `useSearchParams` reactively by watching `searchParams.get('editImage')` specifically
- Extract `editImage` and `imageRole` param handling into a **separate `useEffect`** that depends on `[searchParams]` so it fires on every navigation, not just mount
- After consuming the params, clear only those specific params (not all) using `setSearchParams`

### Summary
- Remove ~60 lines of persistence logic
- Fix 1 effect dependency to make edit-image reactive to navigation

