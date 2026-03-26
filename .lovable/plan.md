

# Fix: Pro Quality Being Reset to Standard on Product-Only Generations

## Problem
When the user manually selects **Pro** quality but has **no model and no scene** selected (product-only generation), a `useEffect` on lines 71-78 of `Freestyle.tsx` overrides their selection back to `'standard'`:

```typescript
useEffect(() => {
  if (selectedModel || selectedScene) {
    setQuality('high');
  } else {
    setQuality('standard'); // ← forces standard even if user chose Pro
  }
}, [selectedModel, selectedScene]);
```

This causes the backend to receive `quality: "standard"`, which selects Flash instead of Pro model. The edge function logs confirm: `quality: "standard"`, `model: "google/gemini-3.1-flash-image-preview"`.

## Solution
Change the `useEffect` to only **upgrade** quality (standard → high) when a model/scene is added, but **never downgrade** a manual Pro selection. Remove the `else` branch that resets to standard.

## Changes

### File: `src/pages/Freestyle.tsx` (lines 71-78)

Replace the current useEffect with:

```typescript
// Auto-upgrade to Pro quality when model or scene is selected
useEffect(() => {
  if (selectedModel || selectedScene) {
    setQuality('high');
  }
  // Do NOT reset to standard — respect manual user selection
}, [selectedModel, selectedScene]);
```

This is a 1-line deletion. The quality chip will still allow manual toggling, and selecting a model/scene will still auto-upgrade to Pro, but deselecting them won't forcibly downgrade.

## Scope
- 1 file: `src/pages/Freestyle.tsx` — remove the `else` branch
- No backend changes needed

