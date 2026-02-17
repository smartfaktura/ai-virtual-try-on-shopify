

## Settings Page Audit and Fixes

### Issues Found and Fixes

**File: `src/pages/Settings.tsx`**

#### 1. Default Image Count options are outdated
- **Problem**: Dropdown shows 1, 4, 8 (line 261-264) but Generate page now uses 1, 2, 3, 4
- **Fix**: Update to match: "1 image", "2 images", "3 images", "4 images"
- **Also**: Change `DEFAULT_SETTINGS.defaultImageCount` from `'4'` to `'1'` (line 56) to match Generate page default

#### 2. Credit prices are wrong in Quality dropdown
- **Problem**: Shows "Standard (4 credits/image)" and "High (10 credits/image)" (lines 508-509)
- **Fix**: Update to "Standard -- Fast generation, good quality (8 credits/img)" and "High (Pro Model) -- Best quality, slower (16 credits/img)"

#### 3. AI Model badge is generic
- **Problem**: Shows "vovv-v1 (Latest stable version)" (lines 499-501)
- **Fix**: Show both models: "Standard: Gemini 2.5 Flash" and "High: Gemini 3 Pro" with appropriate badges

#### 4. Help and Support links point to brandframe.ai
- **Problem**: Documentation, Contact Support, and FAQ links all use `brandframe.ai` domain (lines 541-549)
- **Fix**: Update to `vovv.ai` domain and correct email to `support@vovv.ai`

#### 5. Default quality default value
- **Problem**: `DEFAULT_SETTINGS.defaultQuality` is `'standard'` which is fine, but keeping it consistent

### Summary of Changes

All changes are in `src/pages/Settings.tsx`:

| Line(s) | What | Before | After |
|---------|------|--------|-------|
| 56 | Default image count | `'4'` | `'1'` |
| 261-264 | Image count options | 1, 4, 8 | 1, 2, 3, 4 |
| 498-501 | AI Model display | Single "vovv-v1" badge | Two model badges showing Standard/High models |
| 508-509 | Quality dropdown labels | 4 credits / 10 credits | 8 credits / 16 credits with descriptions |
| 541-549 | Help links | brandframe.ai URLs | vovv.ai URLs |

### What's already good (no changes needed)

- General tab: Brand Defaults section works well
- Notifications section is comprehensive
- Plans and Credits tab is well-structured with billing toggle, plan cards, credit packs
- Account tab: Download/Export defaults, Team and Permissions
- About section correctly shows VOVV.AI branding
- Save functionality with database persistence works correctly

