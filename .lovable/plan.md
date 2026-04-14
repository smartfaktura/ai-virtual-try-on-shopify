

# Add Pre-Made Style / Mood Presets for Short Film

## What

The "Style / Mood" section in the short film references panel currently only supports manual file upload — there's no Library button or pre-made presets. We'll add 10 cinematic style/mood presets users can pick from instantly, covering a wide range of professional visual tones.

## Style Presets (10)

| Preset | Description (injected into prompts) |
|--------|------|
| **Cinematic Noir** | Deep blacks, high contrast, chiaroscuro lighting, film noir shadows, moody desaturated palette |
| **Golden Hour Warmth** | Warm amber tones, long soft shadows, golden backlight, sun-kissed skin, dreamy lens flare |
| **Ethereal Soft Focus** | Soft diffusion filter, pastel tones, dreamy bokeh, luminous highlights, gentle haze |
| **Bold & Saturated** | Vivid punchy colors, high saturation, strong contrast, dynamic energy, editorial pop |
| **Monochrome Elegance** | Black and white, fine grain, rich tonal range, timeless classic photography feel |
| **Neon Cyberpunk** | Vibrant neon blues and magentas, dark environment, futuristic glow, reflective wet surfaces |
| **Vintage Film Stock** | Warm muted tones, analog grain, faded highlights, 70s film aesthetic, nostalgic color shift |
| **Clean Luxury** | Pristine whites, soft even lighting, premium minimalist feel, subtle warm undertones |
| **Dramatic Chiaroscuro** | Rembrandt lighting, deep rich shadows, single key light, painterly contrast, fine art feel |
| **Natural Documentary** | Available light, authentic grain, handheld intimacy, realistic color, raw unpolished beauty |

## Implementation

### `ReferenceUploadPanel.tsx`
- Add a `STYLE_MOOD_PRESETS` array with the 10 presets (id, title, description, keywords)
- Add state for a style picker dialog (`stylePickerOpen`)
- Change the Style / Mood section from `libraryType: null` to `libraryType: 'style'`
- Add `openLibrary` handler for `'style'` type
- Add a picker dialog (same pattern as scene presets) showing the 10 presets as selectable cards with a Palette icon
- `pickStyle` callback stores the preset: `url: ''`, `role: 'style'`, `name: "preset.title: preset.keywords"`
- The keywords string is what gets injected into prompts via `buildShotPrompt`

### `shortFilmPromptBuilder.ts`
- Already handles style references via `context.references` — style refs with no URL but a `name` containing keywords will be appended to the tone/style portion of the prompt (P2 priority)
- Add explicit handling: if any reference has `role === 'style'` and no URL, extract the name text and inject it as a style directive alongside the tone preset

### No other files need changes
The style references are already part of the `ReferenceAsset[]` array that flows through the system.

