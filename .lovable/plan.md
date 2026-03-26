

# Premium Video Result Workspace

Redesign `VideoResultsPanel.tsx` from a basic player + flat buttons into a two-column result workspace that feels like a premium creative output panel.

---

## Architecture

The current `VideoResultsPanel` receives minimal props (videoUrl, sourceImageUrl, 3 callbacks). The redesign requires passing generation context from `AnimateVideo.tsx` so the result panel can display a full summary.

---

## New Props for VideoResultsPanel

```typescript
interface GenerationContext {
  categoryLabel: string;        // "Beauty & Skincare"
  sceneTypeLabel: string;       // "Studio Product Shot"
  motionGoalTitle: string;      // "Luxury Product Reveal"
  cameraMotion: string;         // "Slow Push-in"
  subjectMotion: string;        // "Minimal"
  duration: string;             // "5s"
  audioMode: string;            // "Silent" | "Ambient"
  creditsUsed: number;          // from pricing engine
  realismLevel: string;         // "Realistic"
  loopStyle: string;            // "None"
}
```

Pass this from `AnimateVideo.tsx` by resolving labels from `PRODUCT_CATEGORIES`, `SCENE_TYPES`, and `getMotionGoalsForCategory` at render time.

---

## Layout (Two-Column on Desktop, Stacked on Mobile)

```text
┌─────────────────────────────────────────────────┐
│  Success Header                                 │
│  "Your video is ready"                          │
│  "Preview, create variations, or download."     │
├──────────────────────┬──────────────────────────┤
│                      │  Generation Details      │
│                      │  ── Category             │
│   Video Player       │  ── Scene Type           │
│   (dark bg,          │  ── Motion Goal          │
│    premium frame)    │  ── Camera / Subject     │
│                      │  ── Duration / Audio     │
│                      │  ── Credits used         │
│                      ├──────────────────────────┤
│                      │  Quick Variations        │
│                      │  [More subtle] [Premium] │
│                      │  [More motion] [Cleaner] │
├──────────────────────┴──────────────────────────┤
│  Actions                                        │
│  [Generate Variation]  [Adjust Motion]          │
│  [Download Video]  Start New Video              │
├─────────────────────────────────────────────────┤
│  ▸ Used Settings (collapsible accordion)        │
│  ▸ Before / After (toggle original vs video)    │
└─────────────────────────────────────────────────┘
```

---

## Detailed Changes

### 1. Rewrite `VideoResultsPanel.tsx`

**Success header** — Small check icon + "Your video is ready" heading + subtitle.

**Video player** — Wrap in a `bg-black/95 rounded-xl` container with subtle shadow for premium feel. Keep native controls but the outer frame feels designed.

**Generation Details card** — Right column on desktop (`lg:grid-cols-[1fr_320px]`). Shows key-value pairs with muted labels and foreground values. Include: Category, Scene Type, Motion Goal, Camera Motion, Subject Motion, Duration, Audio, Credits Used.

**Quick Variation chips** — Row of small outline buttons below details: "More subtle", "More premium", "More motion", "Better loop", "Cleaner camera". Each modifies a parameter and re-triggers generation via a new `onQuickVariation(preset)` callback.

**Action buttons** — Clear hierarchy:
- Primary: "Generate Variation" (default button style, prominent)
- Secondary: "Adjust Motion" (outline) — calls onReuse (scrolls back to form with settings intact)
- Tertiary: "Download Video" (outline)
- Ghost: "Start New Video" (ghost, lower priority)

**Before/After toggle** — Optional section. A toggle button that swaps the video with the source image for visual comparison.

**Used Settings accordion** — Collapsible section showing all settings including preservation rules, realism, loop style. Uses shadcn `Collapsible`.

### 2. Update `AnimateVideo.tsx`

- Build `generationContext` object from current state values, resolving IDs to labels
- Pass to `VideoResultsPanel`
- Add `onQuickVariation` handler that modifies specific params and re-runs pipeline
- Add `onAdjustMotion` handler (same as reuse but keeps form visible)

### 3. Quick Variation Presets

Define in `VideoResultsPanel` or a shared constant:
```typescript
const QUICK_VARIATIONS = [
  { id: 'more_subtle', label: 'More subtle', changes: { motionIntensity: 'low', cameraMotion: 'camera_drift' } },
  { id: 'more_premium', label: 'More premium', changes: { realismLevel: 'ultra_realistic', cameraMotion: 'premium_handheld' } },
  { id: 'more_motion', label: 'More motion', changes: { motionIntensity: 'high' } },
  { id: 'better_loop', label: 'Better loop', changes: { loopStyle: 'seamless_loop' } },
  { id: 'cleaner_camera', label: 'Cleaner camera', changes: { cameraMotion: 'static', motionIntensity: 'low' } },
];
```

---

## Files to Modify
- `src/components/app/video/VideoResultsPanel.tsx` — Full rewrite with two-column layout, details card, quick variations, action hierarchy, before/after, accordion
- `src/pages/video/AnimateVideo.tsx` — Pass generation context, wire quick variation + adjust motion handlers

## No New Files Needed
All changes fit within the existing two files.

