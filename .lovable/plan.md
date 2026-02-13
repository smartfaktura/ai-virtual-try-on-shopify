

## Framing / Body Crop Selector -- Full Implementation Plan

### What We're Building

A "Framing" selector that tells the AI what part of the body to show (full body, upper body, hand/wrist, neck/shoulders, etc.). This is a **text-only prompt injection** -- no extra image references, no extra cost, no extra loading time. The AI uses the selected model's face/skin as a reference for body characteristics but frames the shot according to the framing choice.

### How It Looks in the UI

**In Freestyle Studio (chip in settings bar):**
- A new chip between "Scene" and "Brand Profile" in the settings row
- Default state: ghost chip showing a `Frame` icon + "Framing"
- Selected state: highlighted chip showing the chosen option (e.g., "Hand / Wrist") with a small X to clear
- Clicking opens a popover (same pattern as Camera Style / Quality dropdowns) showing 7 options, each with:
  - A simple body-zone **silhouette icon** (inline SVG, no images to generate)
  - Title (e.g., "Hand / Wrist")
  - One-line description (e.g., "Watches, bracelets, rings")
  - Checkmark on the active selection

**In Generate Wizard (Try-On flow):**
- A new card on the **Settings step**, positioned above the Aspect Ratio selector
- Same visual options as the Freestyle chip popover but laid out as a horizontal scrollable row of small cards (icon + label), matching the existing Aspect Ratio selector pattern

**No preview images needed** -- each option uses a minimal SVG silhouette icon showing the body zone highlighted. These are ~10-line inline SVGs, not generated images.

### Framing Options

| Option | Label | Description | Auto-detect Keywords |
|--------|-------|-------------|---------------------|
| `full_body` | Full Body | Head to toe, full outfit | (default for clothing) |
| `upper_body` | Upper Body | Waist up, tops & social | (default for tops, social) |
| `close_up` | Close-Up | Shoulders up, detail focus | scarves |
| `hand_wrist` | Hand / Wrist | Watches, bracelets, rings | watch, bracelet, ring |
| `neck_shoulders` | Neck / Shoulders | Necklaces, earrings | necklace, earrings, pendant |
| `lower_body` | Lower Body | Shoes, pants, skirts | shoes, sneakers, boots, heels |
| `back_view` | Back View | Backpacks, rear details | backpack, tote |

### Auto-Detection Logic

When a product is selected, the system auto-suggests the best framing based on product type and tags. Users can always override. If no match, framing defaults to `null` (no override -- AI decides naturally).

### How the Prompt Injection Works

The framing option gets injected into the prompt as a text instruction. Examples:

- **hand_wrist + model selected**: "FRAMING: Show only the hand and wrist area. The hand/wrist must match the exact skin tone, age, and body characteristics of the person in [MODEL IMAGE]. The product should be naturally worn on the wrist. Do NOT include the face."
- **neck_shoulders + model selected**: "FRAMING: Close-up of the neck, shoulders, and upper chest area. Match the exact skin tone and body of the person in [MODEL IMAGE]. Product should be visible on/near the neck area."
- **lower_body + model selected**: "FRAMING: Lower body shot from hips to feet. Match body type and skin tone of [MODEL IMAGE]."
- **full_body** (default behavior, minimal injection): "FRAMING: Full body, head to toe."

When no model is selected (product-only), framing still works but without model identity references.

---

### Files to Create

**1. `src/components/app/FramingSelectorChip.tsx`**
- Popover chip component for Freestyle settings bar
- Contains the 7 framing options with inline SVG silhouette icons
- Follows exact same pattern as the Camera Style dropdown in `FreestyleSettingsChips.tsx` (lines 225-260): Popover with PopoverTrigger button and PopoverContent listing options with icon, title, description, and checkmark
- Props: `framing`, `onFramingChange`, `open`, `onOpenChange`
- Includes a "None (Auto)" option at top to clear selection

**2. `src/components/app/FramingSelector.tsx`**
- Horizontal card-row component for the Generate wizard Settings step
- Same 7 options but rendered as small selectable cards in a scrollable row (similar to the AspectRatioSelector pattern)
- Props: `framing`, `onFramingChange`

**3. `src/lib/framingUtils.ts`**
- `FRAMING_OPTIONS` constant array with all 7 options (value, label, description, icon component, auto-detect keywords)
- `detectDefaultFraming(productType: string, tags: string[]): FramingOption | null` -- keyword matching function
- `buildFramingPrompt(framing: FramingOption, hasModel: boolean): string` -- returns the prompt text to inject

---

### Files to Modify

**4. `src/types/index.ts`**
- Add: `export type FramingOption = 'full_body' | 'upper_body' | 'close_up' | 'hand_wrist' | 'neck_shoulders' | 'lower_body' | 'back_view';`

**5. `src/components/app/freestyle/FreestyleSettingsChips.tsx`**
- Add `framing` and `onFramingChange` props to the interface
- Add `framingPopoverOpen` and `onFramingPopoverChange` props
- Render `<FramingSelectorChip>` between the Scene chip and the Brand Profile chip (after line 142)

**6. `src/components/app/freestyle/FreestylePromptPanel.tsx`**
- Thread `framing` / `onFramingChange` / popover state props through to `FreestyleSettingsChips`

**7. `src/pages/Freestyle.tsx`**
- Add `framing` state: `const [framing, setFraming] = useState<FramingOption | null>(null)`
- Add `framingPopoverOpen` state
- Auto-detect framing when product is selected (in `handleProductSelect`)
- Include `framing` in the queue payload (line ~270): `framing: framing || undefined`
- Pass framing props through to `FreestylePromptPanel`

**8. `src/pages/Generate.tsx`**
- Add `framing` state
- Auto-detect framing when product is selected (in `handleSelectProduct`, line ~331)
- Show `<FramingSelector>` on the Settings step (before Aspect Ratio selector)
- Include `framing` in the try-on payload (line ~541): `framing: framing || undefined`
- Include `framing` in the workflow payload (line ~475)

**9. `supabase/functions/generate-freestyle/index.ts`**
- Add `framing?: string` to `FreestyleRequest` interface (line ~37)
- In `polishUserPrompt()`: after the existing framing layers (~lines 241-244), check if `framing` is provided and override with the specific framing instructions
- New parameter threaded through: `polishUserPrompt(rawPrompt, context, brandProfile, userNegatives, modelContext, cameraStyle, framing)`

**10. `supabase/functions/generate-tryon/index.ts`**
- Add `framing?: string` to `TryOnRequest` interface (line ~10)
- In `buildPrompt()`: inject framing instructions after the photography style section (line ~63). For non-full-body framings, modify the prompt to focus on the specific body zone while maintaining model identity matching

**11. `src/lib/categoryUtils.ts`**
- Add new category keywords for `accessories` and `footwear` detection (to improve auto-detection accuracy)

---

### Implementation Order

1. Create `src/lib/framingUtils.ts` (constants, detection, prompt builder)
2. Add `FramingOption` type to `src/types/index.ts`
3. Create `src/components/app/FramingSelectorChip.tsx` (Freestyle chip)
4. Create `src/components/app/FramingSelector.tsx` (Generate wizard card row)
5. Wire into Freestyle: modify `FreestyleSettingsChips.tsx`, `FreestylePromptPanel.tsx`, `Freestyle.tsx`
6. Wire into Generate: modify `Generate.tsx`
7. Update edge functions: `generate-freestyle/index.ts`, `generate-tryon/index.ts`

### What This Does NOT Require
- No preview images to generate (SVG silhouettes only)
- No database changes
- No new edge functions
- No extra API calls or image references during generation
- No extra credits cost

