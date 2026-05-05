## Problem

In the Product Details spec fields (Step 3 Setup), Width/Depth inputs behave strangely when the user switches to imperial ("in") units. The root cause:

1. `serializeSpec()` appends the display unit (e.g. `"in"`) to the stored value: `"Width: 97in"`
2. `parseSpec()` only strips the metric unit (`"cm"`) defined in the field spec — it never strips `"in"`
3. So the parsed value becomes `"97in"` and that literal string appears in the input field
4. When the user types, the `"in"` suffix is already in the value, causing garbled input like `"9in7"`

## Fix

**`src/components/app/product-images/ProductSpecsCard.tsx`** — Update `parseSpec()` to strip both metric and imperial unit suffixes:

```typescript
// In parseSpec, replace the unit-stripping block (lines 56-58):
// Before:
if (f.unit && val.endsWith(f.unit)) {
  val = val.slice(0, -f.unit.length).trim();
}

// After:
const unitsToStrip = [f.unit, f.unit === 'cm' ? 'in' : undefined].filter(Boolean) as string[];
for (const u of unitsToStrip) {
  if (val.endsWith(u)) {
    val = val.slice(0, -u.length).trim();
    break;
  }
}
```

This ensures that when parsing back from the serialized string `"Width: 97in"`, the `"in"` suffix is properly stripped, leaving just `"97"` in the input field. The fix is surgical — only the parse function changes, everything else stays the same.
