

## Add Column Selector to Expanded Scene Dialog

Add a grid density toggle to the expanded (maximized) scene selector dialog, following the same pattern as the Library page's column selector.

### Column options per device

| Device | Options | Default |
|---|---|---|
| Desktop (≥1024px) | 4, 3, 2 | 4 |
| Tablet (768-1023px) | 3, 2 | 3 |
| Mobile (<768px) | 3, 2, 1 | 3 |

### Changes

**`src/components/app/freestyle/SceneSelectorChip.tsx`**

1. Add state for `expandedColumns` (persisted to `localStorage` key `scene-grid-columns`)
2. Add viewport-aware column options using the same `getDeviceType` pattern from Jobs.tsx
3. Render small column-count buttons (e.g., `[2] [3] [4]`) in the expanded dialog header, right-aligned next to "Clear selection"
4. Pass `expandedColumns` to `renderGrid` and use it for the grid class: `grid-cols-{n}` instead of the current hardcoded `grid-cols-3 sm:grid-cols-4`
5. Compact popover grid stays unchanged (always 3 columns)

### Files modified
| File | Change |
|---|---|
| `src/components/app/freestyle/SceneSelectorChip.tsx` | Add column selector UI + state to expanded dialog |

