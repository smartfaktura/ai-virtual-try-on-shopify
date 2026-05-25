## Goal

Fix inaccurate copy on `/app/brand-scenes`. The current text says scenes are "generated from your references or a prompt", but the wizard actually offers two distinct paths:

1. **Guided builder** — step-by-step wizard (product family → cast → environment → photography → review) that composes a precise scene without any reference.
2. **Reference image** — upload an inspiration image and control how strictly the AI follows it.

Update both the page-header subtitle, the `EmptyState`, and the `UpgradeState` to reflect this precisely.

## Changes (single file: `src/pages/BrandScenes.tsx`)

### 1. Header subtitle (line 88–90)
- **Now:** "Your custom signature scenes — use them on any product"
- **New:** "Signature scenes saved to your brand — reuse them on any product"

### 2. `EmptyState` (lines 224–246)
- **Heading:** keep "Design your first brand scene"
- **New description:** "Build a scene two ways — walk through a guided wizard that tunes cast, environment, lighting, and camera, or drop in a reference image and let the AI match its mood. Either way, it's saved to your brand and reusable on any product."
- **Feature bullets — replace with:**
  - `Wand2` → "Guided wizard: pick cast, environment, lighting, and camera"
  - `Sparkles` → "Or start from a reference image and dial in how strictly to follow it"
  - `Layers` → "Saved to your brand and reusable on every product"
  - `Users` → "Private to your account"
- Import `Wand2` (already imported) — no new icons needed.

### 3. `UpgradeState` (lines 290–312)
- **Heading:** keep "Brand Scenes is on Growth and Pro"
- **New description:** "Design signature scenes locked to your brand — build them with a guided wizard or from a reference image, then reuse on every product."
- Use the same bullet list as `EmptyState` for consistency.

### 4. No logic, routing, gating, or component-structure changes.

## Out of scope
- Wizard internals, gating logic, `UpgradeBanner` copy (already accurate).
- No DB, no edge functions.
