

## Fix Settings Step: Gender-Matched Scene Preview + Label Updates

### Problems (from screenshots)
1. The **Preview** section's scene thumbnail always shows the female version (`pose.previewUrl`), even when a male model is selected
2. The section title says **"Selected Model & Pose"** -- should say **"Selected Model & Scene"**
3. The **StatusPill** labels at the bottom of Preview say "Pose" -- should say "Scene"
4. The scene name is shown as a subtitle under the model name, but should have its **own thumbnail and label** for clarity

### Changes

**File: `src/components/app/TryOnPreview.tsx`**
- Accept a new optional `selectedGender` prop
- Use `pose.previewUrlMale` when gender is `'male'` (same logic as PoseSelectorCard)
- Rename all "Pose" labels to "Scene" (Thumb label, StatusPill label)

**File: `src/pages/Generate.tsx`**
- Pass `selectedModel?.gender` to all three `TryOnPreview` instances
- Change "Selected Model & Pose" heading to **"Selected Model & Scene"**
- In the "Selected Model & Scene" card, add a **second thumbnail** for the scene (using gender-matched image) alongside the model thumbnail, each with its own name label
- Show model name and scene name as separate labeled items (similar to how product + model are shown in the preview row)

### Result
When a male model like Liam is selected and "Editorial Minimal" scene is chosen:
- Preview row shows the **male** version of the Editorial Minimal scene
- Section title reads "Selected Model & Scene"
- Both model and scene have their own thumbnail + name in the summary card
