

## Add "White Studio" Product Scene as First Option

### What
Add a new product scene using the existing `/images/hero/hero-hp-white.png` image as the first entry in the `clean-studio` category, so it appears at the top of the Product tab in the scene selector.

### Changes

**File: `src/data/mockData.ts`**

1. Add a new image constant (around line 1270):
   ```ts
   const sceneWhiteStudio = '/images/hero/hero-hp-white.png';
   ```

2. Insert a new scene entry as the first item in the product scenes section (before `scene_001` at line 1362):
   ```ts
   { poseId: 'scene_038', name: 'White Studio', category: 'clean-studio',
     description: 'Clean white studio with soft even lighting, hero product presentation',
     promptHint: 'Clean white studio environment with soft even lighting, hero product presentation, premium commercial photography',
     previewUrl: sceneWhiteStudio },
   ```

This uses an existing public image — no upload or storage changes needed. One file, two additions.

