

# Refine Step — Presets + Labels + Accessories Merge

## Changes

### 1. Preset section: Add "Presets" label header + remove horizontal scroll
**File: `ProductImagesStep3Refine.tsx` (~lines 1396-1451)**
- Add a section header above the preset cards: small label "Presets" with a Sparkles icon, matching the styling of other section headers (text-xs font-semibold uppercase tracking-wider)
- Change layout from `flex overflow-x-auto` to `flex flex-wrap gap-2` — no horizontal scrollbar, cards wrap naturally
- Keep the `+ Save` button at the end of the wrapped grid

### 2. Capitalize all chip/button labels in outfit sections
**File: `ProductImagesStep3Refine.tsx`**

All garment, color, fit, material, and accessory option labels currently render lowercase (e.g. "t-shirt", "white", "slim", "cotton", "none", "minimal", "statement", "custom"). Add a `capitalize` CSS class or a small helper to title-case the first letter of each label:

- Garment chips (~line 1237): add `capitalize` to button text
- Color chips (~line 1259): add `capitalize` to the `{c}` text
- Fit chips (~line 1274): add `capitalize`
- Material chips (~line 1283): add `capitalize`
- Accessories chips (~line 1474): add `capitalize` to `{opt}` text

This is simplest done by adding `capitalize` to the Tailwind classes on each chip button, which CSS-capitalizes the first letter.

### 3. Show Styling Details expanded by default (remove collapsible)
**File: `ProductImagesStep3Refine.tsx` (~lines 1533-1554)**
- Remove the `Collapsible` wrapper around "Styling Details" (Hand Style, Nails, Jewelry)
- Render the fields directly, always visible, under a simple section heading
- This makes the section consistent with the Appearance group above it

### 4. Merge Accessories into Styling Details section
**File: `ProductImagesStep3Refine.tsx`**

Currently Accessories is a separate card in the `OutfitLockPanel` (~lines 1459-1494) and Styling Details is in `InlinePersonDetails` (~lines 1533-1554). These are conceptually similar (jewelry, accessories, hands, nails).

- Remove the standalone Accessories card from `OutfitLockPanel`
- Move the accessories selector (none/minimal/statement/custom) into the Styling Details grid inside `InlinePersonDetails`, as a 4th `ChipSelector` alongside Hand Style, Nails, and Jewelry
- Rename section header from "Styling Details" to "Accessories & Styling"
- Pass `accessories` value through via the existing `details`/`update` props (accessories is already on OutfitConfig, just need to bridge it)

## Files

| File | Changes |
|---|---|
| `ProductImagesStep3Refine.tsx` | All 4 changes |

