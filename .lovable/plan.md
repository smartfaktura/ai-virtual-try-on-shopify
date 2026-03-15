

## Show Selected Values + Add Label to Style Icon

### Changes — `FreestyleSettingsChips.tsx`

**1. Camera chip — show selected value**
Line 217: Change static `Camera` to show the selected value:
- Default (pro): `Camera` (unchanged, since pro is default)
- When natural selected: `Natural` (the icon already changes to Smartphone, plus highlight)

Actually better: always show the value so user knows what's active:
- `Pro` when pro, `Natural` when natural — but prefix with icon. The icon already differentiates. Since "Pro" was the original complaint, use short labels: show `📷 Pro ▾` or `📱 Natural ▾`. The icon handles context, the word confirms the selection.

**2. Quality chip — show "Standard" when selected**
Line 179: Change mobile label from just `Quality` to `Standard` when standard is selected (it's still the value), and `✦ High` when high. This way both states show the selected value.

**3. Style icon — add short word**
Line 364-376: Add a short label like `More` next to the sliders icon to make it less orphaned. This fills the visual gap on the last row.

### Summary

| Chip | Before (mobile) | After (mobile) |
|---|---|---|
| Quality (standard) | `Quality` | `Standard` |
| Quality (high) | `✦ High` | `✦ High` |
| Camera (pro) | `📷 Camera` | `📷 Pro` |
| Camera (natural) | `📱 Camera` | `📱 Natural` |
| Style trigger | `⚙ [badge] ▾` | `⚙ More [badge] ▾` |

