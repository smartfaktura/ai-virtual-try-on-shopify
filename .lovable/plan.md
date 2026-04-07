

# Polish Color Picker — Apple-style Sliders, Brand Typography, Vibrant Gradients

## Changes

### File: `src/components/app/product-images/ColorPickerDialog.tsx`

**1. Apple-style slider thumbs (white bubble with shadow)**

Replace the current slider thumb styling with a larger white circle thumb with a prominent drop shadow, matching Apple/iOS range inputs:
- Thumb: `w-5 h-5 rounded-full bg-white border border-black/10 shadow-[0_1px_4px_rgba(0,0,0,0.3)]`
- Track height stays `h-3 rounded-full`
- Remove `bg-current` from thumb (always white)
- Apply identical styling to both HueSlider and LightnessSlider components

**2. Brand font for hex inputs — use Inter (foreground color), not mono**

- Replace `font-mono` on all hex Input fields with `font-medium tracking-wide text-foreground`
- Use `text-[13px]` for better readability
- Remove the separate "HEX" label above the input — instead use a prefix inside the field or placeholder

**3. Modernize the hex input row (Solid tab)**

Replace the current 3-element row (preview square + label + input + pipette button) with a cleaner layout:
- Rounded color preview circle (w-9 h-9) with subtle ring
- Single Input field with `font-medium tracking-wide text-foreground text-[13px]` (no mono)
- Pipette button with `rounded-full` instead of `rounded-lg`, subtle hover glow

**4. More vibrant gradient presets**

Replace the current muted gradient presets with more striking ones:
```typescript
const GRADIENT_PRESETS = [
  { name: 'Studio white', from: '#FFFFFF', to: '#E8E8E8' },
  { name: 'Brand navy', from: '#FFFFFF', to: '#2B3A4E' },
  { name: 'Sunset peach', from: '#FFF0E6', to: '#FFB088' },
  { name: 'Ocean', from: '#E0F2FE', to: '#7DD3FC' },
  { name: 'Lavender', from: '#F3E8FF', to: '#C084FC' },
  { name: 'Mint', from: '#ECFDF5', to: '#6EE7B7' },
];
```
6 presets in a `grid-cols-3` layout with taller cards (`h-14 rounded-xl`) for better visual impact. Each shows the gradient name below in `text-[10px]`.

**5. Gradient tab — compact slider sections with inline color dot**

For Start/End color sections:
- Show a small color dot (w-5 h-5 rounded-full) inline with the section label
- Sliders use the same Apple-style white bubble thumb
- Hex input uses brand font (not mono), same styling as solid tab
- Remove redundant labels ("Hue", "Lightness") — the gradient tracks are self-explanatory

**6. Gradient preview bar**

Add a `h-12 rounded-xl` preview bar at top of gradient tab showing the current `linear-gradient(135deg, gradFrom, gradTo)` so users see their custom gradient live.

**7. Minor polish**
- Dialog corners: add `rounded-2xl` to DialogContent
- Buttons: `rounded-xl` for Cancel/Apply, slightly taller `h-10`
- "Save to palette" button: `rounded-xl` with subtle border

## Summary
- White bubble slider thumbs (Apple-style) on all hue/lightness sliders
- Brand font (Inter, medium weight) for hex codes instead of monospace
- 6 more vibrant gradient presets in a 3-column grid
- Cleaner field layout with rounded elements throughout
- Live gradient preview bar in gradient tab
- Same visual language across both Solid and Gradient tabs

