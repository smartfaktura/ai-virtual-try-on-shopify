

## Fix Freestyle card + clean up subtitles + tighten section spacing

### 1. Freestyle Studio card — match other grid cards

`src/components/app/FreestylePromptCard.tsx` is still on the OLD compact scale (p-4, text-sm title, text-xs description, h-8 button). Bring default variant in line with `WorkflowCardCompact` (the standard we just unified):

- Card root: add `rounded-2xl`
- Content padding: `p-4` → `p-5`
- Title `text-sm` → `text-base font-bold tracking-tight leading-tight`
- Description: `text-xs ... line-clamp-2` → `text-sm text-muted-foreground leading-relaxed line-clamp-2`
- Subtitle copy: "Type anything. Get styled visuals." → **"Type anything and get styled brand visuals in seconds."** (2 lines, no em-dash)
- Button: `h-8 px-5` → `h-10 px-5`
- Wrap `gap-1` → `gap-1.5` to match other cards

Mobile/modalCompact variants stay untouched.

### 2. Rewrite all workflow descriptions — max 2 lines, no em-dash (—)

Update via SQL migration (DB column `workflows.description`). Current copy uses em-dashes and runs 2-3 lines. New copy: short, scannable, max ~85 chars so it fits 2 lines in `line-clamp-2`.

| Workflow | New description |
|---|---|
| Product Visuals | Brand-ready product shots across 1000+ studio and editorial scenes. |
| Virtual Try-On Set | Put your clothing on diverse AI models in any pose or setting. |
| Selfie / UGC Set | Authentic creator-style content pairing your product with a real-feeling model. |
| Flat Lay Set | Styled overhead arrangements with curated props for Instagram and editorial. |
| Mirror Selfie Set | Authentic mirror selfies of your product, worn or held in real-feeling rooms. |
| Interior / Exterior Staging | Stage empty rooms or boost curb appeal while keeping original architecture intact. |
| Picture Perspectives | Turn one product photo into close-ups, back, side, and wide-angle shots. |
| Image Upscaling | Sharpen any image to 2K or 4K and recover textures, faces, and fine detail. |
| Catalog Studio | Bulk-generate catalog-ready visuals for any product in one run. |

### 3. Tighten gap below subtitles → content

Two section heading blocks on `/app/workflows` use the dashboard pattern but the grid that follows sits inside the parent `space-y-12 sm:space-y-16` flow → too much gap.

Fix:
- **`src/pages/Workflows.tsx`** "Choose what to create" block (lines 507-510): wrap heading + the workflow grid that follows into a single sibling with `space-y-6` so they stay tight; only outer sections get the larger 12/16 gap. Same pattern dashboard uses (heading is part of section, not separated by section gap).
- Same for "Recent Creations" block (lines 585-597) — change `space-y-4` → `space-y-6` (currently fine, but verify) and ensure no extra wrapper gap.

Implementation: introduce a wrapping `<section className="space-y-6">` around (heading + grid) for "Choose what to create", and around (heading + WorkflowRecentRow) for "Recent Creations". Outer `PageHeader` children spacing stays `space-y-12 sm:space-y-16` between sections.

### 4. Out of scope
- Mobile `mobileCompact` variants (intentionally tight).
- Activity card layout.
- Card image animation/aspect ratios.

### Acceptance
- Freestyle card matches Product Visuals / Virtual Try-On / etc. in size, padding, title, description, and button height.
- Every workflow grid card subtitle fits in exactly 1-2 lines, no em-dash anywhere.
- Heading + content sit tight together; only between separate sections (Activity → Catalog → Recent) is there the larger breathing room.

