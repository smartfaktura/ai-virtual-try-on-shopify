

## Compact Mobile Chip Layout

### Goal
1. **Style chip** → icon-only (remove "Style" text), so it fits on the same line as Model, Camera, etc.
2. **Reorder chips** so Upload, Product, and Format (aspect ratio) land on the first line together
3. Model, Scene, Framing, Quality, Camera, Style (icon) flow on second line naturally

### Changes — single file: `FreestyleSettingsChips.tsx`

**Style collapsible trigger (line ~362-378):**
- Remove `<span>Style</span>` — keep only the `SlidersHorizontal` icon + optional badge count + chevron
- Reduces chip width from ~80px to ~45px

**Chip order in mobile flex container (lines 321-378):**
Reorder to:
```
Row 1 (should fit): Upload | Product | Format (aspect ratio)
Row 2 (natural wrap): Model | Scene | Framing | Quality | Camera | Style(icon)
```

Current order: Upload, Product, Model, Scene, Framing, AspectRatio, Quality, Camera, Style
New order: Upload, Product, AspectRatio, Model, Scene, Framing, Quality, Camera, Style

This puts the three smallest/most-used chips first so they pack into line 1, and the rest wrap to line 2.

