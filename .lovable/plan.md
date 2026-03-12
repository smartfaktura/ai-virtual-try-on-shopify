

## Fix Library Detail Modal Button Layout & Upscale UX

### Problems Identified
1. **LibraryDetailModal**: Download, Upscale to HD, and Delete are stacked as disconnected full-width buttons with inconsistent styles — the violet upscale button clashes with the design system
2. **Batch upscale flow**: Already works (UpscaleModal with 2K/4K picker + cost display exists), but the floating bar "Upscale" button uses violet which is inconsistent

### Changes

**1. `src/components/app/LibraryDetailModal.tsx` — Redesign action buttons**
- Group Download + Upscale + Delete into a cohesive button group section
- Make Download the primary CTA (keep as-is)
- Change "Upscale to HD" from violet custom button to a secondary `Button variant="outline"` with the same rounded-xl style, removing the violet color
- Keep Delete as a subtle destructive link-style button below
- Remove the `Separator` between upscale and delete — use spacing instead

**2. `src/pages/Jobs.tsx` — Fix floating bar upscale button style**
- Change the violet `bg-violet-600` upscale button to use `variant="secondary"` or match the Download ZIP style for consistency

**3. `src/components/app/UpscaleModal.tsx` — Minor style alignment**
- Change violet accent (`bg-violet-600`, `text-violet-500`) to use the app's primary color (`bg-primary`, `text-primary`) for consistency with the rest of the design system

### Result
- All buttons in the detail modal look connected and cohesive
- No more jarring violet color — uses the app's primary color system
- Batch upscale flow (already functional) gets consistent styling

