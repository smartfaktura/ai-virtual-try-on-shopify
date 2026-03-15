

## Chip Label Tweaks + Row Consolidation

### Changes

**1. Quality chip label — shorten on mobile** (lines 158-204)
- When no model selected: show `Quality` as default label, `Standard` or `✦ High` only after selection
- Current: `Quality: Standard` / `Quality: ✦ High` → New on mobile: just `Quality` when standard (default), `✦ High` when high is selected

**2. Camera style chip — rename "Pro"** (lines 207-243)
- "Pro" is ambiguous. Rename the chip trigger label to `Camera` as default state, showing `Pro` or `Natural` only as the selected value
- Current: `Pro` / `Natural` → New on mobile: `Camera` as neutral label with chevron (like Quality), showing the selection inside the popover

**3. Consolidate Row 1** — put Upload, Product, Model, Scene, and Framing all in one `flex-wrap` row instead of splitting across two rows. This packs more chips per line and reduces vertical whitespace.

### File: `src/components/app/freestyle/FreestyleSettingsChips.tsx`

**Quality chip** (line 179):
```
// Before
quality === 'high' ? 'Quality: ✦ High' : 'Quality: Standard'
// After (mobile)
quality === 'high' ? '✦ High' : 'Quality'
```

**Camera chip** (line 217):
```
// Before  
cameraStyle === 'natural' ? 'Natural' : 'Pro'
// After (mobile)
'Camera' (always show neutral label, selection visible via icon change + highlight)
```
Actually better: show `Camera` as base, then selected value after colon only when non-default. Since `pro` is default → just `Camera`. When `natural` → icon changes + border highlights already signal it. Keep it as just the icon + `Camera` label always — the popover shows the options.

Wait — the user said "not correct to write Pro while selection is pro or natural — what can we write?" Let me think... The chip represents camera/photo style. Options are Pro (studio) and Natural (iPhone). A good neutral label: **"Look"** or **"Camera"**. Camera makes more sense since it's about the camera style. Show: `📷 Camera ▾` always, with highlight when non-default (natural).

**Row consolidation** (lines 319-383):
- Merge assets row and settings row into one single `flex-wrap` container
- Order: Upload, Product, Model, Scene, Framing, Aspect, Quality, Camera, Style

### Summary of changes — single file
| What | Before | After |
|---|---|---|
| Quality label (mobile) | `Quality: Standard` / `Quality: ✦ High` | `Quality` / `✦ High` |
| Camera label | `Pro` / `Natural` | `Camera` (always, highlight when natural) |
| Mobile rows | 2 separate flex rows | 1 unified flex-wrap row + Style collapsible |

