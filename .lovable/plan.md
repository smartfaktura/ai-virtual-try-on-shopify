

## Plan: Remove male scene previews, always use default (female) images

The `previewUrlMale` field on poses causes male-specific scene thumbnails to show when a male model is selected. The user wants to always display the default (female) scene images regardless of gender.

### Changes

**1. `src/components/app/PoseSelectorCard.tsx`** (line 16-18)
- Remove the gender check — always use `pose.previewUrl` for `displayImage`

**2. `src/components/app/TryOnPreview.tsx`** (lines 19, 54)
- Remove the two `previewUrlMale` conditionals — always use `previewUrl`

That's it. The `previewUrlMale` field stays in the type and mock data (no harm), but it simply won't be consumed anywhere in the UI.

