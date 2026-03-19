

# Image Role Intent System for Freestyle Editor

## What We're Building

A 2-step intent selector that appears when a user uploads an image in the Freestyle editor. It removes ambiguity about what the uploaded image represents and (if editing) what should change.

```text
┌─────────────────────────────────────────────┐
│ [image thumb]  What do you want to do?      │
│                                             │
│ [● Edit this image] [○ Product] [○ Model]   │
│ [○ Scene]                                   │
│                                             │
│ What do you want to change?                 │
│ [□ Replace product] [□ Change background]   │
│ [□ Change model]    [□ Improve quality]     │
└─────────────────────────────────────────────┘
```

After selection, both steps collapse into a compact summary line.

## Files to Create / Edit

### 1. New: `src/components/app/freestyle/ImageRoleSelector.tsx`

Single component containing both steps:

**Step 1 — Image Role** (single-select chips):
- "Edit this image" (default) — "Change something in this photo"
- "Use as product" — "This is the product to include"
- "Use as model" — "Use this person's face/body"
- "Use as scene" — "Use this background or location"

**Step 2 — Edit Intent** (multi-select chips, only visible when role = "edit"):
- Replace product → `replace_product`
- Change background → `change_background`
- Change model → `change_model`
- Improve quality → `enhance`

Default if no edit intent selected: `["enhance"]`

**Collapsed state**: After selection, collapse into a summary:
- "Using image as: Edit" [Change] → re-expands Step 1
- "Editing: Replace product, Change background" [Edit] → re-expands Step 2

Smooth transitions using Tailwind animate classes.

### 2. Edit: `src/pages/Freestyle.tsx`

**New state:**
```typescript
const [imageRole, setImageRole] = useState<'edit' | 'product' | 'model' | 'scene'>('edit');
const [editIntent, setEditIntent] = useState<string[]>([]);
```

**Reset on image removal:** When `removeSourceImage` is called, reset `imageRole` to `'edit'` and `editIntent` to `[]`.

**Include in `handleReset`:** Also reset both new fields.

**Chip muting logic:**
- `imageRole === 'product'` → visually mute/disable ProductSelectorChip
- `imageRole === 'model'` → visually mute/disable ModelSelectorChip  
- `imageRole === 'scene'` → visually mute/disable SceneSelectorChip

Pass a new `disabledChips` prop (or individual `disabled` booleans) down through `FreestylePromptPanel` → `FreestyleSettingsChips`.

**Payload update** in `handleGenerate`:
```typescript
const queuePayload = {
  ...existing,
  imageRole: sourceImage ? imageRole : undefined,
  editIntent: sourceImage && imageRole === 'edit' 
    ? (editIntent.length > 0 ? editIntent : ['enhance']) 
    : undefined,
};
```

### 3. Edit: `src/components/app/freestyle/FreestylePromptPanel.tsx`

- Accept new props: `imageRole`, `onImageRoleChange`, `editIntent`, `onEditIntentChange`, `sourceImagePreview`
- Render `<ImageRoleSelector>` between the image preview and the prompt textarea (only when `sourceImagePreview` is present)
- Pass `disabledChips` down to `FreestyleSettingsChips`

### 4. Edit: `src/components/app/freestyle/FreestyleSettingsChips.tsx`

- Accept optional `disabledChips?: { product?: boolean; model?: boolean; scene?: boolean }` prop
- When a chip is disabled: reduce opacity, show lock icon, prevent popover from opening

### 5. Edit: `supabase/functions/generate-freestyle/index.ts`

**FreestyleRequest interface** — add:
```typescript
imageRole?: 'edit' | 'product' | 'model' | 'scene';
editIntent?: string[];
```

**`buildContentArray`** — change sourceImage label based on `imageRole`:
- `imageRole === 'product'` → label as `[PRODUCT IMAGE]` (same as productImage)
- `imageRole === 'model'` → label as `[MODEL REFERENCE]`
- `imageRole === 'scene'` → label as `[SCENE REFERENCE]`
- `imageRole === 'edit'` or undefined → keep current `[REFERENCE IMAGE]`

**`polishUserPrompt`** — light wording adjustment:
- When `imageRole === 'edit'`: replace "Create a NEW photograph" phrasing with "Edit the provided image. Preserve composition unless specified."
- When `editIntent` includes specific values, append targeted instructions:
  - `replace_product` → "Replace the product in the image while preserving everything else"
  - `change_background` → "Keep the subject, change the background/environment"
  - `change_model` → "Replace the person while preserving composition and product placement"
  - `enhance` → "Improve image quality, lighting, and details without changing content"

### 6. Edit: `src/pages/Freestyle.tsx` — Auto-build prompt adjustment

In the "Auto-build prompt from assets if user left it empty" block (~line 396):
- When `imageRole === 'edit'` and no user prompt: auto-generate based on `editIntent` values instead of the current generic product photography prompt
- When `imageRole === 'product'`: treat sourceImage the same as a selected product for prompt building

## What This Does NOT Change

- No changes to queue system, credits, or generation architecture
- No AI planner
- No changes to how Product/Model/Scene selector chips work internally
- No database migrations needed (imageRole/editIntent are payload fields only)

## Risk

Very low — UI-only changes plus light payload/prompt adjustments. All existing generation paths remain intact. The new fields are optional and backward-compatible.

