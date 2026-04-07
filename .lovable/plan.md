

# Fix: Remove duplicate code block causing TS1128 build error

## Problem

Lines 1410-1418 define `toggleSceneExpand` correctly. Then lines 1420-1424 contain a **duplicate fragment** of the same function body (the `if` block + closing brace), left over from a bad edit. This stray `};` at line 1424 creates an unmatched closing brace, pushing brace depth negative and causing `TS1128: Declaration or statement expected` at the end of the file.

## Fix

**File: `src/components/app/product-images/ProductImagesStep3Refine.tsx`**

Delete lines 1420-1424 (the duplicate fragment):

```
    // Only expand if scene has action controls   ← DELETE
    if (sceneHasActionControls(scene)) {          ← DELETE
      setExpandedSceneId(prev => prev === id ? null : id);  ← DELETE
    }                                             ← DELETE
  };                                              ← DELETE
```

This is the only change needed. The correct version of the function at lines 1410-1418 remains intact.

