

# Two Issues: Missing Provider Badge on Freestyle + Scene Angle Hallucination

## Issue 1: Provider Badge Not Showing on Freestyle Page

**Root cause**: The badge was added to `LibraryImageCard` (used on Library/Jobs pages), but the Freestyle page uses its own `FreestyleGallery` component with a separate `GalleryImage` interface that doesn't include `providerUsed`. The DB is saving it correctly (confirmed: latest generation has `provider_used: seedream-4.5`).

**Fix**: 
- Add `providerUsed?: string | null` to the `GalleryImage` interface in `FreestyleGallery.tsx`
- Pass `providerUsed` from `useFreestyleImages` hook data into the gallery images
- Render the admin badge on each freestyle card (same style as LibraryImageCard)
- The `useFreestyleImages` hook needs to fetch `provider_used` from the query and map it

**Files**:
- `src/hooks/useFreestyleImages.ts` — add `providerUsed` to `FreestyleImage`, fetch `provider_used` from DB
- `src/components/app/freestyle/FreestyleGallery.tsx` — add `providerUsed` to `GalleryImage`, render admin badge
- `src/pages/Freestyle.tsx` — pass `providerUsed` when mapping images to gallery

---

## Issue 2: Scene Angles Not Being Replicated

**Root cause**: Two problems in the prompt builder (`buildEnrichedPrompt`):

1. **Product-only scenes (no model)**: Line 265-266 explicitly overrides with "Creative product photography angle — overhead, 45-degree, or dramatic perspective" — this **ignores** the scene's actual camera angle entirely.

2. **Scene reference instruction lacks angle matching**: Lines 224-225 say "Use [SCENE REFERENCE] for environment, lighting, atmosphere" but never mention matching the **camera angle, viewpoint, or perspective** from the scene image. The model treats the scene as mood/lighting reference only.

**Fix**:
- Update the SCENE reference instruction to explicitly require matching the camera angle/viewpoint
- Remove the "creative angle" override when a scene is selected (keep it only when there's truly no scene)

**Changes in `supabase/functions/generate-freestyle/index.ts`**:

**A. Line 223** — Add angle matching to scene+model instruction:
```
"Place the person naturally INTO the environment shown in [SCENE REFERENCE]. Match the scene's camera angle, viewpoint, lighting direction, color temperature..."
```

**B. Line 225** — Add angle matching to scene-only instruction:
```
"Use [SCENE REFERENCE] for environment, camera angle, viewpoint, lighting, atmosphere."
```

**C. Lines 264-266** — Only apply "creative angle" framing when no scene is selected:
```typescript
} else if (context.hasProduct && !context.hasModel && !context.hasScene && !isSelfie) {
```

This ensures that when a scene is selected, the AI replicates the scene's camera position instead of inventing random angles.

