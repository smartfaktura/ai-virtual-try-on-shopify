

# Public Freestyle: Hide Credits, Redirect Auth Users, Product Tooltip, Recreate Flow

## Changes

### 1. `src/components/app/freestyle/FreestylePromptPanel.tsx` — Hide credit count conditionally

Add an optional prop `hideCreditCost?: boolean`. When true:
- Hide the `({creditCost})` span on the Generate button (line 360)
- Hide credit-related tooltip text, show generic "Sign up to generate" instead
- Hide the "Need X more credits" insufficient credits message

### 2. `src/pages/PublicFreestyle.tsx` — Three fixes

**a) Redirect authenticated users to /app/freestyle**
- Add a `useEffect` at the top: if `user` exists, `navigate('/app/freestyle', { replace: true })` and return early

**b) Pass `hideCreditCost` to FreestylePromptPanel**
- Add `hideCreditCost` prop to the panel

**c) "Recreate This" fills the panel instead of redirecting**
- Change `handleUseItem`: instead of navigating, close the modal and populate the prompt bar state (`setPrompt`, `setSelectedScene`, `setSelectedModel`, `setAspectRatio`) from the item data
- Find the matching scene/model from `allScenes`/`mockModels` by name
- Only on "Generate" click does the auth redirect happen (already implemented)

### 3. `src/components/app/freestyle/FreestyleSettingsChips.tsx` — Product chip tooltip

Instead of `opacity-40 pointer-events-none` when `disabledChips.product` is true, wrap the product chip in a `Tooltip` showing "Create an account to upload your product". Remove `pointer-events-none` so the tooltip can show on hover, but keep the popover disabled.

### 4. `src/components/app/PublicDiscoverDetailModal.tsx` — Update CTA for freestyle context

When used from `/freestyle`, the "Recreate This" button should call a new optional `onRecreate` callback prop instead of navigating to auth. The parent (`PublicFreestyle.tsx`) passes this callback to fill the prompt bar.

### Files
- `src/components/app/freestyle/FreestylePromptPanel.tsx` — add `hideCreditCost` prop
- `src/components/app/freestyle/FreestyleSettingsChips.tsx` — product chip tooltip on disabled
- `src/pages/PublicFreestyle.tsx` — auth redirect, recreate fills panel, pass hideCreditCost
- `src/components/app/PublicDiscoverDetailModal.tsx` — add optional `onRecreate` callback

